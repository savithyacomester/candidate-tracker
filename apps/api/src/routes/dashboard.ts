import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

const prisma = new PrismaClient();

const DashboardStatsResponseSchema = z.object({
  success: z.boolean(),
  metrics: z.object({
    totalCandidates: z.number(),
    totalApplications: z.number(),
    applicationsByStatus: z.record(z.string(), z.number()),
    hiredThisMonth: z.number(),
    rejectionRate: z.number(),
    latestApplications: z.array(z.any()),
  }),
  chartData: z.array(
    z.object({
      status: z.string(),
      count: z.number(),
    })
  ),
});

// Define a structural schema for the 500 error response to satisfy Fastify's strict literal check
const ErrorResponseSchema = z.object({
  error: z.string(),
  message: z.string(),
});

export async function dashboardRoutes(fastify: FastifyInstance, options: FastifyPluginOptions) {
  const router = fastify.withTypeProvider<ZodTypeProvider>();

  router.get(
    '/dashboard/stats',
    {
      schema: {
        response: {
          200: DashboardStatsResponseSchema,
          500: ErrorResponseSchema, // Registered here
        },
      },
    },
    async (request, reply) => {
      try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const totalCandidates = await prisma.candidate.count({
          where: { deleted_at: null },
        });

        const totalApplications = await prisma.application.count();

        const statusGroups = await prisma.application.groupBy({
          by: ['status'],
          _count: { id: true },
        });

        const applicationsByStatus: Record<string, number> = {
          applied: 0,
          screening: 0,
          interview: 0,
          offer: 0,
          hired: 0,
          rejected: 0,
        };

        statusGroups.forEach((group) => {
          applicationsByStatus[group.status] = group._count.id;
        });

        const hiredThisMonth = await prisma.application.count({
          where: {
            status: 'hired',
            updated_at: { gte: startOfMonth },
          },
        });

        const totalRejected = applicationsByStatus['rejected'] || 0;
        const rejectionRate = totalApplications > 0 
          ? Math.round((totalRejected / totalApplications) * 100) 
          : 0;

        const latestApplications = await prisma.application.findMany({
          take: 5,
          orderBy: { created_at: 'desc' },
          include: {
            candidate: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        });

        const chartData = Object.entries(applicationsByStatus).map(([status, count]) => ({
          status: status.charAt(0).toUpperCase() + status.slice(1),
          count,
        }));

        const responsePayload = {
          success: true,
          metrics: {
            totalCandidates,
            totalApplications,
            applicationsByStatus,
            hiredThisMonth,
            rejectionRate,
            latestApplications,
          },
          chartData,
        };

        return reply.status(200).send(responsePayload);

      } catch (error: any) {
        fastify.log.error(error);
        
        // This structural block will now validate perfectly against ErrorResponseSchema
        return reply.status(500).send({
          error: 'Internal Server Error',
          message: 'Failed to aggregate dashboard analytic metrics from database blocks.',
        });
      }
    }
  );
}