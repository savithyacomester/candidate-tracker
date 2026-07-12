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

2. Execution Commands
From the root directory of the monorepo, run the following steps to initialize the environment:
Install dependencies: npm install

Start database: docker compose up -d

Run migrations & seed: npm run db:migrate && npm run db:seed

Start API (port 3001): npm run dev --workspace=apps/api

Start Web (port 5173):
npm run dev --workspace=apps/web

Run tests:
npm test

🛠️ Key Implementation Details
Cross-Entity Search: The Applications list implements a server-side SQL JOIN. This allows users to search across Application fields (job title, company) and parent Candidate fields (name, email) in a single query.

Data Integrity: Every database operation is performed through Prisma, with migrations managing schema changes. Soft deletes are implemented on the Candidate entity using a deleted_at column, which is strictly filtered in all query operations.

Error Handling: All API errors are routed through a centralized setErrorHandler in Fastify to ensure consistent client-side responses.

📝 Future Improvements & Notes
What I would finish next: [e.g., Adding cursor-based pagination or a Kanban board view.]

Known limitations: [e.g., Mention any features not fully implemented or areas where manual testing was prioritized.].
