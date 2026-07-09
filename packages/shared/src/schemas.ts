import { z } from 'zod';

export const ApplicationQuerySchema = z.object({
  search: z.string().optional(),
  status: z.enum(['applied', 'screening', 'interview', 'offer', 'hired', 'rejected']).optional(),
  page: z.string().transform(Number).default('1'),
  limit: z.string().transform(Number).default('10'),
});

export type ApplicationQuery = z.infer<typeof ApplicationQuerySchema>;