import { FastifyInstance } from 'fastify';
import { PrismaClient, Prisma } from '@prisma/client';
import { z } from 'zod';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { ApplicationStatusEnum, UpdateApplicationSchema } from '@tracker/shared'; 

const prisma = new PrismaClient();

export async function applicationRoutes(fastify: FastifyInstance) {
  const router = fastify.withTypeProvider<ZodTypeProvider>();

  // GET ALL APPLICATIONS
  router.get('/', {
    schema: {
      querystring: z.object({
        search: z.string().optional(),
        status: ApplicationStatusEnum.optional(),
        page: z.string().transform(Number).default('1'),
        limit: z.string().transform(Number).default('10'),
      }),
    },
  }, async (request) => {
    const { search, status, page, limit } = request.query;
    const skip = (page - 1) * limit;

    const whereClause: Prisma.ApplicationWhereInput = { candidate: { deleted_at: null } };
    if (status) whereClause.status = status;
    if (search) {
      whereClause.OR = [
        { job_title: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { candidate: { OR: [{ name: { contains: search, mode: 'insensitive' } }, { email: { contains: search, mode: 'insensitive' } }] } }
      ];
    }

    const [total, data] = await prisma.$transaction([
      prisma.application.count({ where: whereClause }),
      prisma.application.findMany({ where: whereClause, skip, take: limit, include: { candidate: true }, orderBy: { created_at: 'desc' } })
    ]);

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  });

  // GET SINGLE
  router.get('/:id', { schema: { params: z.object({ id: z.string().uuid() }) } }, async (request) => {
    const app = await prisma.application.findUnique({ where: { id: request.params.id }, include: { candidate: true } });
    if (!app) throw new Error('NOT_FOUND: Application not found');
    return app;
  });

  // POST
  router.post('/', { schema: { body: z.object({ candidate_id: z.string().uuid(), job_title: z.string(), company: z.string(), status: ApplicationStatusEnum, applied_at: z.string().transform(s => new Date(s)) }) } }, async (request) => {
    return await prisma.application.create({ data: request.body });
  });

  // PATCH
  router.patch('/:id', { schema: { params: z.object({ id: z.string().uuid() }), body: UpdateApplicationSchema } }, async (request) => {
    return await prisma.application.update({ where: { id: request.params.id }, data: request.body });
  });

  // DELETE
  router.delete('/:id', { schema: { params: z.object({ id: z.string().uuid() }) } }, async (request, reply) => {
    await prisma.application.delete({ where: { id: request.params.id } });
    return reply.status(204).send();
  });
}