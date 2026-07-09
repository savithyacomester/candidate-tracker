import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { PrismaClient, ApplicationStatus } from '@prisma/client';

const prisma = new PrismaClient();

export async function candidateRoutes(fastify: FastifyInstance) {
  const server = fastify.withTypeProvider<ZodTypeProvider>();

  // ==========================================
  // 1. GET ALL CANDIDATES (With Pagination, Search & Soft-Delete Filter)
  // ==========================================
  server.get(
    '/api/candidates',
    {
      schema: {
        querystring: z.object({
          search: z.string().optional(),
          page: z.string().transform(Number).default('1'),
          limit: z.string().transform(Number).default('10'),
        }),
      },
    },
    async (request, reply) => {
      const { search, page, limit } = request.query;
      const skip = (page - 1) * limit;

      // Enforce Section 6.3: Must filter out soft-deleted records globally
      const whereClause: any = {
        deleted_at: null,
      };

      // Handle query field searches (Section 4.1)
      if (search) {
        whereClause.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { location: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
        ];
      }

      const [candidates, totalCount] = await Promise.all([
        prisma.candidate.findMany({
          where: whereClause,
          include: {
            applications: true,
          },
          skip,
          take: limit,
          orderBy: { created_at: 'desc' },
        }),
        prisma.candidate.count({ where: whereClause }),
      ]);

      return reply.send({
        data: candidates,
        meta: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
        },
      });
    }
  );

  // ==========================================
  // 2. GET ALL APPLICATIONS (Cross-Entity Search Server JOIN - Section 4.3)
  // ==========================================
  server.get(
    '/api/applications',
    {
      schema: {
        querystring: z.object({
          search: z.string().optional(),
          status: z.nativeEnum(ApplicationStatus).optional(),
          page: z.string().transform(Number).default('1'),
          limit: z.string().transform(Number).default('10'),
        }),
      },
    },
    async (request, reply) => {
      const { search, status, page, limit } = request.query;
      const skip = (page - 1) * limit;

      const whereClause: any = {};

      if (status) {
        whereClause.status = status;
      }

      // Single search box filtering across Application AND Parent Candidate fields (Section 4.3)
      if (search) {
        whereClause.OR = [
          // Application properties
          { job_title: { contains: search, mode: 'insensitive' } },
          { company: { contains: search, mode: 'insensitive' } },
          { source: { contains: search, mode: 'insensitive' } },
          { notes: { contains: search, mode: 'insensitive' } },
          // Parent Candidate properties via relational SQL JOIN
          {
            candidate: {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { location: { contains: search, mode: 'insensitive' } },
              ],
            },
          },
        ];
      }

      const [applications, totalCount] = await Promise.all([
        prisma.application.findMany({
          where: whereClause,
          include: {
            candidate: true, // Attaches parent details for frontend navigation
          },
          skip,
          take: limit,
          orderBy: { created_at: 'desc' },
        }),
        prisma.application.count({ where: whereClause }),
      ]);

      return reply.send({
        data: applications,
        meta: {
          total: totalCount,
          page,
          limit,
          totalPages: Math.ceil(totalCount / limit),
        },
      });
    }
  );

  // ==========================================
  // 3. POST NEW CANDIDATE (With 409 Conflict check)
  // ==========================================
  server.post(
    '/api/candidates',
    {
      schema: {
        body: z.object({
          name: z.string().min(2),
          email: z.string().email(),
          location: z.string().optional(),
          phone: z.string().optional(),
          linkedin_url: z.string().url().optional().or(z.literal('')),
          notes: z.string().optional(),
        }),
      },
    },
    async (request, reply) => {
      const data = request.body;
      try {
        const newCandidate = await prisma.candidate.create({
          data,
        });
        return reply.code(201).send(newCandidate);
      } catch (error: any) {
        // Enforce Section 7.1 testing: Require 409 status on email duplicate constraint
        if (error.code === 'P2002') {
          return reply.code(409).send({ error: 'Email address already exists.' });
        }
        return reply.code(500).send({ error: 'Internal server error.' });
      }
    }
  );

  // ==========================================
  // 4. PATCH APPLICATION STATUS
  // ==========================================
  server.patch(
    '/api/applications/:id/status',
    {
      schema: {
        params: z.object({
          id: z.string().uuid(),
        }),
        body: z.object({
          status: z.nativeEnum(ApplicationStatus),
        }),
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const { status } = request.body;

      try {
        const updatedApplication = await prisma.application.update({
          where: { id },
          data: { status },
        });
        return updatedApplication;
      } catch (error) {
        return reply.code(404).send({ error: 'Application record not found.' });
      }
    }
  );

// ==========================================
  // 5. GET DASHBOARD METRICS (Database Aggregation - Section 3)
  // ==========================================
  server.get('/api/dashboard', async (request, reply) => {
    // Determine the boundary timestamp for the current month calculation
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalCandidates,
      totalApplications,
      statusCounts,
      hiredThisMonth,
      totalRejectedCount,
    ] = await Promise.all([
      // 1. Total active candidates (excluding soft-deleted ones)
      prisma.candidate.count({
        where: { deleted_at: null },
      }),

      // 2. Total applications matching remaining active candidates
      prisma.application.count({
        where: { candidate: { deleted_at: null } },
      }),

      // 3. Applications grouped systematically by status
      prisma.application.groupBy({
        by: ['status'],
        where: { candidate: { deleted_at: null } },
        _count: { id: true },
      }),

      // 4. Hired this month count
      prisma.application.count({
        where: {
          status: ApplicationStatus.hired,
          applied_at: { gte: startOfMonth },
          candidate: { deleted_at: null },
        },
      }),

      // 5. Rejected count specifically for the rejection rate calculation
      prisma.application.count({
        where: {
          status: ApplicationStatus.rejected,
          candidate: { deleted_at: null },
        },
      }),
    ]);

    // Format the status metrics array dynamically for your chart payload
    const applicationsByStatus = statusCounts.map((item) => ({
      status: item.status,
      count: item._count.id,
    }));

    // Safeguard division by zero to evaluate an accurate percentage
    const rejectionRate =
      totalApplications > 0
        ? Math.round((totalRejectedCount / totalApplications) * 100)
        : 0;

    // 6. Fetch recent applications stream for dashboard feed display
    const latestApplications = await prisma.application.findMany({
      where: { candidate: { deleted_at: null } },
      include: { candidate: true },
      orderBy: { created_at: 'desc' },
      take: 5,
    });

    return reply.send({
      totalCandidates,
      totalApplications,
      applicationsByStatus,
      hiredThisMonth,
      rejectionRate,
      latestApplications,
    });
  });
}