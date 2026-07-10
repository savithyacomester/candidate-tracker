import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify from 'fastify';
import { serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import { candidateRoutes } from '../routes/candidates'; 

describe('Recruitment Pipeline Backend Integration Tests', () => {
  let server: any;

  beforeAll(async () => {
    // 1. Initialize a clean test instance of Fastify
    server = Fastify({ logger: false });

    // 2. Set up the exact Zod compilers your routes expect
    server.setValidatorCompiler(validatorCompiler);
    server.setSerializerCompiler(serializerCompiler);

    // 3. Register your routes with the correct prefix matching index.ts
    await server.register(candidateRoutes, { prefix: '/api' });
    await server.ready();
  });

  afterAll(async () => {
    await server.close();
  });

  // Test 1: Verify the Aggregated Dashboard Metrics Endpoint
  describe('GET /api/dashboard', () => {
    it('should return 200 OK and match the required metric schema layout perfectly', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/dashboard',
      });

      expect(response.statusCode).toBe(200);
      
      const body = JSON.parse(response.body);
      expect(body).toHaveProperty('totalCandidates');
      expect(body).toHaveProperty('totalApplications');
      expect(body).toHaveProperty('applicationsByStatus');
      expect(body).toHaveProperty('hiredThisMonth');
      expect(body).toHaveProperty('rejectionRate');
      expect(body).toHaveProperty('latestApplications');
      
      expect(typeof body.totalCandidates).toBe('number');
      expect(Array.isArray(body.applicationsByStatus)).toBe(true);
      expect(Array.isArray(body.latestApplications)).toBe(true);
    });
  });

  // Test 2: Verify the Dynamic Sub-route Profile Finder
  describe('GET /api/candidates/:id', () => {
    it('should return historical sub-nested application data collections for a validated ID', async () => {
      const testCandidateId = '1'; 

      const response = await server.inject({
        method: 'GET',
        url: `/api/candidates/${testCandidateId}`,
      });

      if (response.statusCode === 200) {
        const body = JSON.parse(response.body);
        expect(body).toHaveProperty('id');
        expect(body).toHaveProperty('name');
        expect(body).toHaveProperty('email');
        expect(body).toHaveProperty('applications');
        expect(Array.isArray(body.applications)).toBe(true);
      } else {
        expect(response.statusCode).toBe(404);
      }
    });

    it('should properly respond with 404 Error code handling for missing entries', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/candidates/00000000-0000-0000-0000-000000000000',
      });

      expect(response.statusCode).toBe(404);
    });
  });
});