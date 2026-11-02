# Project Submission & Review Dashboard

A full-stack TypeScript application for student project submissions and mentor reviews.

## Stack

- **Frontend:** Next.js 15 App Router, React, TypeScript, Tailwind CSS v4, Lucide icons, shadcn-style accessible UI primitives.
- **Backend:** Express.js 5, TypeScript, Zod, Helmet, CORS, express-rate-limit.
- **Database:** PostgreSQL, Prisma ORM.
- **Authentication:** JWT bearer tokens, bcrypt password hashing, role-based access control (`STUDENT`, `MENTOR`).

## Features

- Student signup and login.
- Student submission form with repository URL, optional live URL, description, and client/server validation.
- Repository uniqueness enforced by normalized URL plus a database unique constraint to avoid race-condition duplicates.
- Per-user submission history and review feedback.
- Mentor dashboard with server-side status filtering and pagination.
- Server-side aggregate statistics for total, pending, approved, and rejected projects.
- Mentor approval/rejection actions; review notes are optional and review status cannot be changed after the first review.
- Rate limits on authentication attempts and project submission requests.
- Seeded mentor account, Prisma schema, Docker Compose PostgreSQL, and environment examples.

## Requirements

- Node.js 20.11+ (Node 20 LTS recommended)
- npm 10+
- Docker Desktop, or a local PostgreSQL 16+ instance

## Run locally

### 1. Install dependencies

From this repository root:

```bash
npm install
```

### 2. Start PostgreSQL

```bash
docker compose up -d postgres
```

If you already have PostgreSQL, create a database and update the connection string in `apps/api/.env`.

### 3. Configure environment variables

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

On Windows PowerShell, use `Copy-Item apps/api/.env.example apps/api/.env` and `Copy-Item apps/web/.env.example apps/web/.env.local`.

Edit `apps/api/.env` and set a unique `JWT_SECRET` of at least 32 characters and a strong `ADMIN_PASSWORD`. The default values in `.env.example` are for local development only and must not be used in production.

### 4. Create the database schema and seed the mentor

```bash
npm run db:generate
npm run db:migrate -- --name init
npm run db:seed
```

The seed command creates or updates a mentor account using `ADMIN_NAME`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` from `apps/api/.env`. Mentor users can also be created by changing a seeded user's role directly in the database; public signup always creates a `STUDENT`.

### 5. Run both applications

```bash
npm run dev
```

- Web app: http://localhost:3000
- API health check: http://localhost:4000/api/health

Use the seeded mentor email/password to sign in to the review dashboard. Create a student account from the signup page to submit projects.

## Environment variables

### `apps/api/.env`

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Signing secret (32+ characters) |
| `JWT_EXPIRES_IN` | Token lifetime, e.g. `1d` |
| `PORT` | API port (default `4000`) |
| `WEB_ORIGIN` | Allowed frontend origin for CORS |
| `ADMIN_NAME` | Seeded mentor display name |
| `ADMIN_EMAIL` | Seeded mentor email |
| `ADMIN_PASSWORD` | Seeded mentor password (10+ characters) |

### `apps/web/.env.local`

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_API_URL` | API base URL (default `http://localhost:4000/api`) |

## API overview

All routes are prefixed with `/api`. Protected routes require `Authorization: Bearer <token>`.

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/health` | Public | Health check (`/api/health`) |
| `POST` | `/auth/signup` | Public | Create student account and return JWT |
| `POST` | `/auth/login` | Public | Log in and return JWT |
| `GET` | `/auth/me` | Authenticated | Return token identity |
| `POST` | `/projects` | Student | Submit a project |
| `GET` | `/projects/mine` | Student | List own submissions |
| `GET` | `/projects` | Mentor | Paginated list; `page`, `limit`, and `status=ALL|PENDING|APPROVED|REJECTED` query params |
| `GET` | `/projects/stats` | Mentor | Aggregate project counts |
| `PATCH` | `/projects/:id/review` | Mentor | Review with `{ "status": "APPROVED" | "REJECTED", "reviewNote": "optional" }` |

## Validation and security decisions

- Signup validates name, email, and password. Passwords are hashed using bcrypt with 12 salt rounds.
- Repository URLs are restricted to GitHub, GitLab, and Bitbucket; duplicate detection is case-insensitive and trailing-slash normalized.
- A database unique constraint is the final duplicate guard; the API also returns `409 Conflict` for duplicates.
- Submission fields are validated on the server with Zod; frontend constraints provide quick feedback but are not trusted for security.
- Authentication endpoints allow 30 requests per IP per 15 minutes. Project submission endpoints allow 10 requests per IP per hour. In production with multiple API instances, replace the in-memory rate-limit store with a shared store such as Redis.
- Mentor routes are protected by both authentication and role middleware.
- Pagination limit is capped at 50. Status filtering and aggregate statistics run in PostgreSQL through Prisma.
- JWT is stored in localStorage in this demo to keep setup simple. For a production deployment, prefer secure, HttpOnly, SameSite cookies, add CSRF protections as appropriate, and consider refresh-token/session revocation.
- For production, also add automated tests, structured logging, email verification, and a review audit log if the workflow requires traceability.

## Project layout

```text
project-review-dashboard/
├── apps/
│   ├── api/
│   │   ├── prisma/schema.prisma
│   │   ├── prisma/seed.ts
│   │   └── src/
│   │       ├── lib/prisma.ts
│   │       ├── middleware/auth.ts
│   │       ├── routes/auth.ts
│   │       ├── routes/projects.ts
│   │       └── server.ts
│   └── web/
│       ├── app/ (landing, login, signup, student portal, mentor dashboard)
│       ├── components/ui.tsx
│       └── lib/api.ts
├── docker-compose.yml
└── package.json
```

```
project-review-dashboard
├─ apps
│  ├─ api
│  │  ├─ package.json
│  │  ├─ prisma
│  │  │  ├─ migrations
│  │  │  │  ├─ 20261020182510_project_review_dashboard
│  │  │  │  │  └─ migration.sql
│  │  │  │  └─ migration_lock.toml
│  │  │  ├─ schema.prisma
│  │  │  └─ seed.ts
│  │  ├─ src
│  │  │  ├─ lib
│  │  │  │  └─ prisma.ts
│  │  │  ├─ middleware
│  │  │  │  └─ auth.ts
│  │  │  ├─ routes
│  │  │  │  ├─ auth.ts
│  │  │  │  └─ projects.ts
│  │  │  └─ server.ts
│  │  └─ tsconfig.json
│  └─ web
│     ├─ app
│     │  ├─ dashboard
│     │  │  └─ page.tsx
│     │  ├─ globals.css
│     │  ├─ layout.tsx
│     │  ├─ login
│     │  │  └─ page.tsx
│     │  ├─ page.tsx
│     │  ├─ signup
│     │  │  └─ page.tsx
│     │  └─ submit
│     │     └─ page.tsx
│     ├─ components
│     │  ├─ ui
│     │  └─ ui.tsx
│     ├─ components.json
│     ├─ lib
│     │  ├─ api.ts
│     │  └─ utils.ts
│     ├─ next-env.d.ts
│     ├─ next.config.ts
│     ├─ package.json
│     ├─ postcss.config.mjs
│     └─ tsconfig.json
├─ docker-compose.yml
├─ package-lock.json
├─ package.json
└─ README.md

```