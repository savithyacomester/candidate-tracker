# Candidate Tracker & Recruitment Pipeline Monorepo

A full-stack, enterprise-grade candidate tracking application built to monitor recruitment health metrics, manage candidate records, and visualize submission pipelines.

---

## 🏗️ Architecture Summary

This project is structured as a turborepo workspace split into isolated frontend, backend, and shared package boundaries:

*   **`apps/web`**: A Next.js (App Router) single-page dashboard utilizing **Tailwind CSS** for responsive pipeline visual charts and **TanStack React Query** for server-state caching management.
*   **`apps/api`**: A high-performance **Fastify** REST server implementing strict **Zod** schema compilation and **Prisma ORM** for transactional database connections.
*   **`packages/shared`**: Shared type definitions and centralized validation schemas cross-compiled across both environments.

---

## 🚀 Local Quickstart Setup

### 1. Environment Configurations
Ensure your local database layer connections are configured. Duplicate the stub environment file inside `apps/api/.env`:

```env
PORT=3002
DATABASE_URL="postgresql://<user>:<password>@localhost:5432/candidate_tracker?schema=public"