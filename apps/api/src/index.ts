import fastify from 'fastify';
import cors from '@fastify/cors';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import { candidateRoutes } from './routes/candidates';
import { applicationRoutes } from './routes/applications';
import { dashboardRoutes } from './routes/dashboard';
import dotenv from 'dotenv';

dotenv.config();

export const build = () => {
  const server = fastify({ logger: true });

  server.setValidatorCompiler(validatorCompiler);
  server.setSerializerCompiler(serializerCompiler);

  server.setErrorHandler((error, request, reply) => {
    server.log.error(error);
    if (error.validation) {
      return reply.status(400).send({ error: 'Bad Request', message: 'Validation failed', details: error.validation });
    }
    if ('code' in error && error.code === 'P2002') {
      return reply.status(409).send({ error: 'Conflict', message: 'Candidate already exists.' });
    }
    return reply.status(500).send({ error: 'Internal Server Error', message: error.message });
  });

  server.register(cors, { origin: ['http://localhost:5173'], credentials: true });

  server.register(candidateRoutes, { prefix: '/api/candidates' });
  server.register(applicationRoutes, { prefix: '/api/applications' });
  server.register(dashboardRoutes, { prefix: '/api/dashboard' });

  return server;
};

// Start server only if run directly (not for testing)
if (require.main === module) {
  const PORT = Number(process.env.PORT) || 3001;
  build().listen({ port: PORT, host: '0.0.0.0' });
}