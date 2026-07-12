import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { build } from '../index'; // Import your build function

describe('Recruitment Pipeline Backend Integration Tests', () => {
  let server: any;

  beforeAll(async () => {
    server = build(); // Use the shared configuration
    await server.ready();
  });

  afterAll(async () => {
    await server.close();
  });

  describe('GET /api/dashboard', () => {
    it('should return 200 OK and match the required metric schema', async () => {
      const response = await server.inject({ method: 'GET', url: '/api/dashboard' });
      expect(response.statusCode).toBe(200);
      
      const body = JSON.parse(response.body);
      
      // Assertions updated to access nested properties within 'metrics'
      expect(body).toHaveProperty('metrics');
      expect(body.metrics).toHaveProperty('totalCandidates');
      expect(body.metrics).toHaveProperty('totalApplications');
      expect(body.metrics).toHaveProperty('applicationsByStatus');
      expect(body.metrics).toHaveProperty('hiredThisMonth');
      expect(body.metrics).toHaveProperty('rejectionRate');
      expect(body.metrics).toHaveProperty('latestApplications');
      
      // Additional structural verification
      expect(typeof body.metrics.totalCandidates).toBe('number');
      expect(Array.isArray(body.metrics.latestApplications)).toBe(true);
    });
  });

  describe('GET /api/candidates/:id', () => {
    it('should return 404 for a non-existent UUID', async () => {
      const response = await server.inject({
        method: 'GET',
        url: '/api/candidates/00000000-0000-0000-0000-000000000000',
      });
      expect(response.statusCode).toBe(404);
    });
  });
});