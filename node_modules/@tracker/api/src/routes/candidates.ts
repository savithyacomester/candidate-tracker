import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function candidateRoutes(fastify: FastifyInstance) {
  const server = fastify.withTypeProvider<ZodTypeProvider>();

  // 1. GET ALL CANDIDATES (with their applications)
  server.get('/api/candidates', async (request, reply) => {
    const candidates = await prisma.candidate.findMany({
      include: {
        applications: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
    return candidates;
  });

  // 2. POST NEW CANDIDATE
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
        if (error.code === 'P2002') {
          return reply.code(400).send({ error: 'Email address already exists.' });
        }
        return reply.code(500).send({ error: 'Internal server error.' });
      }
    }
  );

  // 3. PATCH APPLICATION STATUS
  server.patch(
    '/api/applications/:id/status',
    {
      schema: {
        params: z.object({
          id: z.string(),
        }),
        body: z.object({
          status: z.enum(['applied', 'screening', 'interview', 'offer', 'hired', 'rejected']),
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
}