# Royal Academy LMS

An enterprise learning management system built for scalable course delivery, interactive assessments, grading workflows, and role-based access control (Student, Instructor, Admin).

---

## Workspace Architecture

This project is organized as a unified monorepo managed with **pnpm workspaces** and orchestrated by **Turborepo**:

```
royal-academy-lms/
├── apps/
│   ├── api/              # NestJS backend (Native Node.js ESM, BullMQ, Redis sessions)
│   └── web/              # React 19 + Vite frontend dashboard
├── packages/
│   ├── database/         # Prisma schema, migrations, and typed PrismaClient
│   ├── types/            # Pure TypeScript shared DTOs & domain contracts
│   ├── eslint-config/    # Shared ESLint flat configurations
│   └── typescript-config/# Shared tsconfig bases
├── docker-compose.yml    # Local PostgreSQL, Redis, and Mailpit infrastructure
└── turbo.json            # Task pipeline orchestration & topological caching
```

## Tech Stack

- **Runtime & Frameworks:** Node.js (ESM), NestJS, React 19, Vite

- **Database & Cache:** PostgreSQL, Prisma ORM, Redis (ioredis)

- **Job Processing & Email:** BullMQ, Nodemailer, Mailpit (Local SMTP)

- **Security & Auth:** Stateful Redis Sessions (`sid` cookies), Argon2id hashing, Single-Use Verification Tokens, RBAC, Sliding-Window Rate Limiting

- **Orchestration:** Turborepo, pnpm


## Getting Started

### Prerequisites

- **Node.js** >= 20.x

- **pnpm** >= 9.x

- **Docker** & Docker Compose


### Installation & Setup

1. **Clone the repository:**

  ```bash
  git clone git@github.com:ahmadaljazairy/royal-academy-lms.git
  cd royal-academy-lms
  ```

2. **Install workspace dependencies:**

  ```bash
  pnpm install
  ```

3. **Start local infrastructure (PostgreSQL, Redis, Mailpit):**

  ```bash
  docker compose up -d
  ```

4. **Configure environment variables:**

Copy `.env.example` templates to `.env` across the workspace:

  ```bash
  cp packages/database/.env.example packages/database/.env
  cp apps/api/.env.example apps/api/.env
  cp apps/web/.env.example apps/web/.env
  ```

5. **Build shared packages, generate client, and run migrations:**

  ```bash
  # Build shared packages (types, database)
  pnpm build
  
  # Generate Prisma client and apply schema to PostgreSQL
  pnpm --filter @template/database run db:migrate
  ```

6. **Start development servers:**

  ```
  pnpm dev
  ```


## Local Service Ports

Once `pnpm dev` is running:

| **Service** | **URL** | **Description** |
| --- | --- | --- |
| **Web Client** | `http://localhost:5173` | React 19 Vite Dashboard |
| **API Server** | `http://localhost:3000` | NestJS REST API |
| **Swagger Docs** | `http://localhost:3000/api/docs` | OpenAPI Contract Explorer |
| **Mailpit UI** | `http://localhost:8025` | Local Email Inbox (Verification Links) |

## Workspace Scripts

| **Command** | **Action** |
| --- | --- |
| `pnpm dev` | Runs all applications and package watchers concurrently |
| `pnpm build` | Topologically builds all workspace packages with cache |
| `pnpm type-check` | Runs `tsc --noEmit` across every package |
| `pnpm lint` | Runs ESLint across all projects |
| `pnpm format` | Formats all code with Prettier |
| `pnpm test` | Runs test suites across the monorepo |

## Documentation

- [Development & Architecture Guide](https://github.com/ahmadaljazairy/royal-academy-lms/blob/main/docs/DEVELOPMENT.md)

- [Git & Branching Workflow Guide](https://github.com/ahmadaljazairy/royal-academy-lms/blob/main/docs/GIT_WORKFLOW_GUIDE.md)

- [Software Requirements Specification](https://github.com/ahmadaljazairy/royal-academy-lms/blob/main/docs/Royal%20Academy%20-%20SRS%20Document.md)