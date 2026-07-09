"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApplicationsQuerySchema = exports.UpdateApplicationSchema = exports.CreateApplicationSchema = exports.ApplicationSchema = exports.ApplicationStatusEnum = exports.UpdateCandidateSchema = exports.CreateCandidateSchema = exports.CandidateSchema = void 0;
const zod_1 = require("zod");
// ==========================================
// 1. CANDIDATE SCHEMA
// ==========================================
exports.CandidateSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    name: zod_1.z.string().min(1, 'Name is required'),
    email: zod_1.z.string().email('Invalid email address'),
    phone: zod_1.z.string().optional().nullable(),
    location: zod_1.z.string().optional().nullable(),
    linkedin_url: zod_1.z.string().url('Invalid URL').or(zod_1.z.literal('')).optional().nullable(),
    notes: zod_1.z.string().optional().nullable(),
    created_at: zod_1.z.date().or(zod_1.z.string()),
    updated_at: zod_1.z.date().or(zod_1.z.string()),
    deleted_at: zod_1.z.date().or(zod_1.z.string()).optional().nullable(), // For soft deletes
});
exports.CreateCandidateSchema = exports.CandidateSchema.omit({
    id: true,
    created_at: true,
    updated_at: true,
    deleted_at: true,
});
exports.UpdateCandidateSchema = exports.CreateCandidateSchema.partial();
// ==========================================
// 2. APPLICATION SCHEMA
// ==========================================
exports.ApplicationStatusEnum = zod_1.z.enum([
    'applied',
    'screening',
    'interview',
    'offer',
    'hired',
    'rejected'
]);
exports.ApplicationSchema = zod_1.z.object({
    id: zod_1.z.string().uuid(),
    candidate_id: zod_1.z.string().uuid('Invalid candidate reference'),
    job_title: zod_1.z.string().min(1, 'Job title is required'),
    company: zod_1.z.string().min(1, 'Company name is required'),
    status: exports.ApplicationStatusEnum,
    applied_at: zod_1.z.date().or(zod_1.z.string()),
    salary_expectation: zod_1.z.number().int().positive().optional().nullable(),
    source: zod_1.z.string().optional().nullable(),
    notes: zod_1.z.string().optional().nullable(),
    created_at: zod_1.z.date().or(zod_1.z.string()),
    updated_at: zod_1.z.date().or(zod_1.z.string()),
});
exports.CreateApplicationSchema = exports.ApplicationSchema.omit({
    id: true,
    created_at: true,
    updated_at: true,
});
exports.UpdateApplicationSchema = exports.CreateApplicationSchema.partial();
// ==========================================
// 3. CROSS-ENTITY SEARCH & QUERY SCHEMAS
// ==========================================
exports.ApplicationsQuerySchema = zod_1.z.object({
    search: zod_1.z.string().optional(),
    status: exports.ApplicationStatusEnum.optional(),
    fromDate: zod_1.z.string().optional(),
    toDate: zod_1.z.string().optional(),
    page: zod_1.z.string().optional().default('1'),
    limit: zod_1.z.string().optional().default('10'),
});
