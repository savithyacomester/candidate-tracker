import fastify from 'fastify';
import cors from '@fastify/cors';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import { candidateRoutes } from './routes/candidates';
import dotenv from 'dotenv';

dotenv.config();

const server = fastify({ logger: true });

// Setup Zod Validation compilers
server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);

// Register CORS middleware explicitly for your frontend port
server.register(cors, {
  origin: ['http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true,
});

// Register API Routes
server.register(candidateRoutes, { prefix: '/api' });

const PORT = Number(process.env.PORT) || 3002;

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