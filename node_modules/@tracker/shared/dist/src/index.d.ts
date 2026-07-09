import { z } from 'zod';
export declare const CandidateSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    email: z.ZodString;
    phone: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    location: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    linkedin_url: z.ZodNullable<z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodLiteral<"">]>>>;
    notes: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    created_at: z.ZodUnion<[z.ZodDate, z.ZodString]>;
    updated_at: z.ZodUnion<[z.ZodDate, z.ZodString]>;
    deleted_at: z.ZodNullable<z.ZodOptional<z.ZodUnion<[z.ZodDate, z.ZodString]>>>;
}, "strip", z.ZodTypeAny, {
    id: string;
    name: string;
    email: string;
    phone?: string | null | undefined;
    location?: string | null | undefined;
    linkedin_url?: string | null | undefined;
    notes?: string | null | undefined;
    created_at: string | Date;
    updated_at: string | Date;
    deleted_at?: string | Date | null | undefined;
}, {
    id: string;
    name: string;
    email: string;
    phone?: string | null | undefined;
    location?: string | null | undefined;
    linkedin_url?: string | null | undefined;
    notes?: string | null | undefined;
    created_at: string | Date;
    updated_at: string | Date;
    deleted_at?: string | Date | null | undefined;
}>;
export declare const CreateCandidateSchema: z.ZodObject<Omit<{
    id: z.ZodString;
    name: z.ZodString;
    email: z.ZodString;
    phone: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    location: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    linkedin_url: z.ZodNullable<z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodLiteral<"">]>>>;
    notes: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    created_at: z.ZodUnion<[z.ZodDate, z.ZodString]>;
    updated_at: z.ZodUnion<[z.ZodDate, z.ZodString]>;
    deleted_at: z.ZodNullable<z.ZodOptional<z.ZodUnion<[z.ZodDate, z.ZodString]>>>;
}, "created_at" | "deleted_at" | "id" | "updated_at">, "strip", z.ZodTypeAny, {
    name: string;
    email: string;
    phone?: string | null | undefined;
    location?: string | null | undefined;
    linkedin_url?: string | null | undefined;
    notes?: string | null | undefined;
}, {
    name: string;
    email: string;
    phone?: string | null | undefined;
    location?: string | null | undefined;
    linkedin_url?: string | null | undefined;
    notes?: string | null | undefined;
}>;
export declare const UpdateCandidateSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    location: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    linkedin_url: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodLiteral<"">]>>>>;
    notes: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    email?: string | undefined;
    phone?: string | null | undefined;
    location?: string | null | undefined;
    linkedin_url?: string | null | undefined;
    notes?: string | null | undefined;
}, {
    name?: string | undefined;
    email?: string | undefined;
    phone?: string | null | undefined;
    location?: string | null | undefined;
    linkedin_url?: string | null | undefined;
    notes?: string | null | undefined;
}>;
export declare const ApplicationStatusEnum: z.ZodEnum<["applied", "screening", "interview", "offer", "hired", "rejected"]>;
export declare const ApplicationSchema: z.ZodObject<{
    id: z.ZodString;
    candidate_id: z.ZodString;
    job_title: z.ZodString;
    company: z.ZodString;
    status: z.ZodEnum<["applied", "screening", "interview", "offer", "hired", "rejected"]>;
    applied_at: z.ZodUnion<[z.ZodDate, z.ZodString]>;
    salary_expectation: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    source: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    notes: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    created_at: z.ZodUnion<[z.ZodDate, z.ZodString]>;
    updated_at: z.ZodUnion<[z.ZodDate, z.ZodString]>;
}, "strip", z.ZodTypeAny, {
    id: string;
    candidate_id: string;
    job_title: string;
    company: string;
    status: "applied" | "hired" | "interview" | "offer" | "rejected" | "screening";
    applied_at: string | Date;
    salary_expectation?: number | null | undefined;
    source?: string | null | undefined;
    notes?: string | null | undefined;
    created_at: string | Date;
    updated_at: string | Date;
}, {
    id: string;
    candidate_id: string;
    job_title: string;
    company: string;
    status: "applied" | "hired" | "interview" | "offer" | "rejected" | "screening";
    applied_at: string | Date;
    salary_expectation?: number | null | undefined;
    source?: string | null | undefined;
    notes?: string | null | undefined;
    created_at: string | Date;
    updated_at: string | Date;
}>;
export declare const CreateApplicationSchema: z.ZodObject<Omit<{
    id: z.ZodString;
    candidate_id: z.ZodString;
    job_title: z.ZodString;
    company: z.ZodString;
    status: z.ZodEnum<["applied", "screening", "interview", "offer", "hired", "rejected"]>;
    applied_at: z.ZodUnion<[z.ZodDate, z.ZodString]>;
    salary_expectation: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    source: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    notes: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    created_at: z.ZodUnion<[z.ZodDate, z.ZodString]>;
    updated_at: z.ZodUnion<[z.ZodDate, z.ZodString]>;
}, "created_at" | "id" | "updated_at">, "strip", z.ZodTypeAny, {
    candidate_id: string;
    job_title: string;
    company: string;
    status: "applied" | "hired" | "interview" | "offer" | "rejected" | "screening";
    applied_at: string | Date;
    salary_expectation?: number | null | undefined;
    source?: string | null | undefined;
    notes?: string | null | undefined;
}, {
    candidate_id: string;
    job_title: string;
    company: string;
    status: "applied" | "hired" | "interview" | "offer" | "rejected" | "screening";
    applied_at: string | Date;
    salary_expectation?: number | null | undefined;
    source?: string | null | undefined;
    notes?: string | null | undefined;
}>;
export declare const UpdateApplicationSchema: z.ZodObject<{
    candidate_id: z.ZodOptional<z.ZodString>;
    job_title: z.ZodOptional<z.ZodString>;
    company: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["applied", "screening", "interview", "offer", "hired", "rejected"]>>;
    applied_at: z.ZodOptional<z.ZodUnion<[z.ZodDate, z.ZodString]>>;
    salary_expectation: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodNumber>>>;
    source: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    notes: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
}, "strip", z.ZodTypeAny, {
    candidate_id?: string | undefined;
    job_title?: string | undefined;
    company?: string | undefined;
    status?: "applied" | "hired" | "interview" | "offer" | "rejected" | "screening" | undefined;
    applied_at?: string | Date | undefined;
    salary_expectation?: number | null | undefined;
    source?: string | null | undefined;
    notes?: string | null | undefined;
}, {
    candidate_id?: string | undefined;
    job_title?: string | undefined;
    company?: string | undefined;
    status?: "applied" | "hired" | "interview" | "offer" | "rejected" | "screening" | undefined;
    applied_at?: string | Date | undefined;
    salary_expectation?: number | null | undefined;
    source?: string | null | undefined;
    notes?: string | null | undefined;
}>;
export declare const ApplicationsQuerySchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<["applied", "screening", "interview", "offer", "hired", "rejected"]>>;
    fromDate: z.ZodOptional<z.ZodString>;
    toDate: z.ZodOptional<z.ZodString>;
    page: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    limit: z.ZodDefault<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    search?: string | undefined;
    status?: "applied" | "hired" | "interview" | "offer" | "rejected" | "screening" | undefined;
    fromDate?: string | undefined;
    toDate?: string | undefined;
    page: string;
    limit: string;
}, {
    search?: string | undefined;
    status?: "applied" | "hired" | "interview" | "offer" | "rejected" | "screening" | undefined;
    fromDate?: string | undefined;
    toDate?: string | undefined;
    page?: string | undefined;
    limit?: string | undefined;
}>;
export type Candidate = z.infer<typeof CandidateSchema>;
export type CreateCandidateInput = z.infer<typeof CreateCandidateSchema>;
export type Application = z.infer<typeof ApplicationSchema>;
export type CreateApplicationInput = z.infer<typeof CreateApplicationSchema>;
export type ApplicationsQueryInput = z.infer<typeof ApplicationsQuerySchema>;
