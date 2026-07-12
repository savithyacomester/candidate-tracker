import fastify from 'fastify';
import cors from '@fastify/cors';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import { candidateRoutes } from './routes/candidates';
import { applicationRoutes } from './routes/applications'; 
// CHANGED: Un-commented and integrated the dashboard routes file cleanly
import { dashboardRoutes } from './routes/dashboard'; 
import dotenv from 'dotenv';

dotenv.config();

const server = fastify({ logger: true });

// Setup Zod Validation compilers
server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);

// Enforce Section 6.2: Global Centralized Fastify Error Handler
server.setErrorHandler((error, request, reply) => {
  server.log.error(error);

  // Handle Zod validation errors gracefully
  if (error.validation) {
    return reply.status(400).send({
      error: 'Bad Request',
      message: 'Validation failed',
      statusCode: 400,
      details: error.validation,
    });
  }

  // Handle database duplicate errors (e.g., unique email constraint from Section 7.1)
  if ('code' in error && error.code === 'P2002') {
    return reply.status(409).send({
      error: 'Conflict',
      message: 'A candidate with this email already exists.',
      statusCode: 409,
    });
  }

  // Generic fallback error response
  return reply.status(500).send({
    error: 'Internal Server Error',
    message: error.message || 'An unexpected error occurred on the server.',
    statusCode: 500,
  });
});

// Register CORS middleware explicitly for your frontend port (5173)
server.register(cors, {
  origin: ['http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true,
});

// Register API Routes with unique base scopes to avoid collision
server.register(candidateRoutes, { prefix: '/api/candidates' });
server.register(applicationRoutes, { prefix: '/api/applications' }); 
server.register(dashboardRoutes, { prefix: '/api/dashboard' });

// Default fallback to 3001 to align with the specification brief
const PORT = Number(process.env.PORT) || 3001;

const start = async () => {
  try {
    await server.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`🚀 Fastify Server listening smoothly on port ${PORT}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();