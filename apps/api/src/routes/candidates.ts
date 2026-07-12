import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { PrismaClient, ApplicationStatus, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export async function candidateRoutes(fastify: FastifyInstance) {
  const server = fastify.withTypeProvider<ZodTypeProvider>();

  // ==========================================
  // 1. GET ALL CANDIDATES
  // ==========================================
  server.get(
    '/candidates',
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

      const whereClause: Prisma.CandidateWhereInput = {
        deleted_at: null,
      };

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
          include: { applications: true },
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
  // 2. GET SINGLE CANDIDATE DETAIL
  // ==========================================
  server.get(
    '/candidates/:id',
    {
      schema: {
        params: z.object({ id: z.string().uuid() }),
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const candidate = await prisma.candidate.findFirst({
        where: { id, deleted_at: null },
        include: { applications: true },
      });

      if (!candidate) {
        return reply.code(404).send({ error: 'Candidate not found.' });
      }
      return reply.send(candidate);
    }
  );

  // ==========================================
  // 3. POST NEW CANDIDATE
  // ==========================================
  server.post(
    '/candidates',
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
      const { email } = request.body;

      // Assert validation check ensuring candidate uniqueness
      const existingCandidate = await prisma.candidate.findFirst({
        where: { email, deleted_at: null },
      });

      if (existingCandidate) {
        return reply.code(409).send({
          error: 'Conflict',
          message: 'A candidate with this email address already exists in the active tracking pipeline.',
        });
      }

      const newCandidate = await prisma.candidate.create({
        data: request.body,
      });
      return reply.code(201).send(newCandidate);
    }
  );

  // ==========================================
  // 4. PATCH/UPDATE CANDIDATE
  // ==========================================
  server.patch(
    '/candidates/:id',
    {
      schema: {
        params: z.object({ id: z.string().uuid() }),
        body: z.object({
          name: z.string().min(2).optional(),
          email: z.string().email().optional(),
          location: z.string().optional(),
          phone: z.string().optional(),
          linkedin_url: z.string().url().optional().or(z.literal('')),
          notes: z.string().optional(),
        }),
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const { email } = request.body;

      // 1. Verify existence
      const targetCandidate = await prisma.candidate.findFirst({
        where: { id, deleted_at: null },
      });

      if (!targetCandidate) {
        return reply.code(404).send({ error: 'Candidate context record not found.' });
      }

      // 2. Prevent unique conflict states across active records
      if (email && email !== targetCandidate.email) {
        const emailConflict = await prisma.candidate.findFirst({
          where: { email, deleted_at: null },
        });
        if (emailConflict) {
          return reply.code(409).send({ error: 'Email address is already linked to another active application profile.' });
        }
      }

      const updated = await prisma.candidate.update({
        where: { id },
        data: request.body,
      });
      return reply.send(updated);
    }
  );

  // ==========================================
  // 5. DELETE CANDIDATE - SOFT DELETE
  // ==========================================
  server.delete(
    '/candidates/:id',
    {
      schema: {
        params: z.object({ id: z.string().uuid() }),
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      
      const candidateExists = await prisma.candidate.findFirst({
        where: { id, deleted_at: null }
      });

      if (!candidateExists) {
        return reply.code(404).send({ error: 'Candidate record missing or already dropped.' });
      }

      await prisma.candidate.update({
        where: { id },
        data: { deleted_at: new Date() },
      });
      return reply.code(204).send();
    }
  );

  // ==========================================
  // 6. GET ALL APPLICATIONS (Cross-Entity Search)
  // ==========================================
  server.get(
    '/applications',
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

      const whereClause: Prisma.ApplicationWhereInput = {
        candidate: { deleted_at: null },
      };

      if (status) {
        whereClause.status = status;
      }

      if (search) {
        whereClause.OR = [
          { job_title: { contains: search, mode: 'insensitive' } },
          { company: { contains: search, mode: 'insensitive' } },
          { source: { contains: search, mode: 'insensitive' } },
          { notes: { contains: search, mode: 'insensitive' } },
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
          include: { candidate: true },
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
  // 7. POST NEW APPLICATION
  // ==========================================
  server.post(
    '/applications',
    {
      schema: {
        body: z.object({
          candidate_id: z.string().uuid(),
          job_title: z.string().min(2),
          company: z.string().min(1),
          status: z.nativeEnum(ApplicationStatus),
          applied_at: z.string().transform((str) => new Date(str)),
          salary_expectation: z.number().int().optional(),
          source: z.string().optional(),
          notes: z.string().optional(),
        }),
      },
    },
    async (request, reply) => {
      // Type provider handles this cleanly. No structural fallback overrides necessary.
      const { candidate_id } = request.body;

      const candidateExists = await prisma.candidate.findFirst({
        where: { id: candidate_id, deleted_at: null },
      });
      if (!candidateExists) {
        return reply.code(404).send({ error: 'Candidate parent context unknown or deleted.' });
      }

      const newApp = await prisma.application.create({
        data: request.body,
      });
      return reply.code(201).send(newApp);
    }
  );

  // ==========================================
  // 8. PATCH/UPDATE APPLICATION
  // ==========================================
  server.patch(
    '/applications/:id',
    {
      schema: {
        params: z.object({ id: z.string().uuid() }),
        body: z.object({
          candidate_id: z.string().uuid().optional(),
          job_title: z.string().min(2).optional(),
          company: z.string().min(1).optional(),
          status: z.nativeEnum(ApplicationStatus).optional(),
          applied_at: z.string().transform((str) => new Date(str)).optional(),
          salary_expectation: z.number().int().optional(),
          source: z.string().optional(),
          notes: z.string().optional(),
        }),
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const { candidate_id } = request.body;

      const applicationExists = await prisma.application.findUnique({
        where: { id }
      });
      if (!applicationExists) {
        return reply.code(404).send({ error: 'Application entry missing.' });
      }

      if (candidate_id) {
        const candidateExists = await prisma.candidate.findFirst({
          where: { id: candidate_id, deleted_at: null },
        });
        if (!candidateExists) {
          return reply.code(400).send({ error: 'Target relocation candidate profile does not exist.' });
        }
      }

      const updatedApplication = await prisma.application.update({
        where: { id },
        data: request.body,
      });
      return reply.send(updatedApplication);
    }
  );

  // ==========================================
  // 9. DELETE APPLICATION
  // ==========================================
  server.delete(
    '/applications/:id',
    {
      schema: {
        params: z.object({ id: z.string().uuid() }),
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      
      const appExists = await prisma.application.findUnique({ where: { id } });
      if (!appExists) {
        return reply.code(404).send({ error: 'Application entry missing.' });
      }

      await prisma.application.delete({ where: { id } });
      return reply.code(204).send();
    }
  );

  // ==========================================
  // 10. GET DASHBOARD METRICS
  // ==========================================
  server.get('/dashboard', async (request, reply) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [
      totalCandidates,
      totalApplications,
      statusCounts,
      hiredThisMonth,
      totalRejectedCount,
    ] = await Promise.all([
      prisma.candidate.count({ where: { deleted_at: null } }),
      prisma.application.count({ where: { candidate: { deleted_at: null } } }),
      prisma.application.groupBy({
        by: ['status'],
        where: { candidate: { deleted_at: null } },
        _count: { id: true },
      }),
      prisma.application.count({
        where: {
          status: ApplicationStatus.hired,
          applied_at: { gte: startOfMonth },
          candidate: { deleted_at: null },
        },
      }),
      prisma.application.count({
        where: {
          status: ApplicationStatus.rejected,
          candidate: { deleted_at: null },
        },
      }),
    ]);

    const applicationsByStatus = statusCounts.map((item) => ({
      status: item.status,
      count: item._count.id,
    }));

    const rejectionRate = totalApplications > 0 ? Math.round((totalRejectedCount / totalApplications) * 100) : 0;

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