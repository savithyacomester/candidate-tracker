import { z } from 'zod';

// ==========================================
// 1. CANDIDATE SCHEMA
// ==========================================
export const CandidateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  linkedin_url: z.string().url('Invalid URL').or(z.literal('')).optional().nullable(),
  notes: z.string().optional().nullable(),
  created_at: z.date().or(z.string()),
  updated_at: z.date().or(z.string()),
  deleted_at: z.date().or(z.string()).optional().nullable(), // For soft deletes
});

export const CreateCandidateSchema = CandidateSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
});

export const UpdateCandidateSchema = CreateCandidateSchema.partial();

// ==========================================
// 2. APPLICATION SCHEMA
// ==========================================
export const ApplicationStatusEnum = z.enum([
  'applied',
  'screening',
  'interview',
  'offer',
  'hired',
  'rejected'
]);

export const ApplicationSchema = z.object({
  id: z.string().uuid(),
  candidate_id: z.string().uuid('Invalid candidate reference'),
  job_title: z.string().min(1, 'Job title is required'),
  company: z.string().min(1, 'Company name is required'),
  status: ApplicationStatusEnum,
  applied_at: z.date().or(z.string()),
  salary_expectation: z.number().int().positive().optional().nullable(),
  source: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  created_at: z.date().or(z.string()),
  updated_at: z.date().or(z.string()),
});

export const CreateApplicationSchema = ApplicationSchema.omit({
  id: true,
  created_at: true,
  updated_at: true,
});

export const UpdateApplicationSchema = CreateApplicationSchema.partial();

// ==========================================
// 3. CROSS-ENTITY SEARCH & QUERY SCHEMAS
// ==========================================
export const ApplicationsQuerySchema = z.object({
  search: z.string().optional(),
  status: ApplicationStatusEnum.optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  page: z.string().optional().default('1'),
  limit: z.string().optional().default('10'),
});

// ==========================================
// 4. TYPE INFERENCES FOR FRONTEND/BACKEND Use
// ==========================================
export type Candidate = z.infer<typeof CandidateSchema>;
export type CreateCandidateInput = z.infer<typeof CreateCandidateSchema>;
export type Application = z.infer<typeof ApplicationSchema>;
export type CreateApplicationInput = z.infer<typeof CreateApplicationSchema>;
export type ApplicationsQueryInput = z.infer<typeof ApplicationsQuerySchema>;