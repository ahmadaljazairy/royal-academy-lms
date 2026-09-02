# Royal Academy LMS

An enterprise learning management system built for scalable course delivery, interactive assessments, grading workflows, and role-based access control (Student, Instructor, Admin).

---

## Workspace Architecture

This project is organized as a unified monorepo managed with **pnpm workspaces** and orchestrated by **Turborepo**:

```text
royal-academy-lms/
├── apps/
│   ├── api/          # NestJS backend (Native Node.js ESM, --env-file)
│   └── web/          # React + Vite frontend dashboard
├── packages/
│   ├── database/     # Prisma schema, migrations, and typed PrismaClient
│   ├── types/        # Pure TypeScript shared DTOs & domain types
│   ├── eslint-config/# Shared ESLint flat configurations
│   └── typescript-config/ # Shared tsconfig bases
├── docker-compose.yml# Local PostgreSQL database infrastructure
└── turbo.json        # Task pipeline orchestration & topological caching
```

## Tech Stack

- **Runtime & Frameworks:** Node.js (ESM), NestJS, React 19, Vite

- **Database & ORM:** PostgreSQL, Prisma ORM

- **Security & Auth:** Argon2id password hashing, Cryptographic tokens, RBAC

- **Orchestration:** Turborepo, pnpm

## Getting Started

### Prerequisites

- **Node.js** >= 20.x

- **pnpm** >= 9.x

- **Docker** & Docker Compose

### Installation & Setup

1. **Clone the repository:**
   
   ```bash
   git clone git@github.com:<your-username>/royal-academy.git
   cd royal-academy-lms
   ```

2. **Install workspace dependencies:**
   
   ```bash
   pnpm install
   ```

3. **Start local database:**
   
   ```bash
   docker compose up -d
   ```

4. **Configure environment variables:** Copy `.env.example` templates to `.env` in the respective packages:
   
   ```bash
   cp packages/database/.env.example packages/database/.env
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env
   ```

5. **Generate database client & run migrations:**
   
   ```bash
   pnpm --filter @template/database run db:generate
   ```

6. **Start development servers:**
   
   ```bash
   pnpm dev
   ```

## Workspace Scripts

| **Command**       | **Action**                                             |
| ----------------- | ------------------------------------------------------ |
| `pnpm dev`        | Runs all applications and watchers concurrently        |
| `pnpm build`      | Topologically builds all workspace packages with cache |
| `pnpm type-check` | Runs `tsc --noEmit` across every package               |
| `pnpm lint`       | Runs ESLint across all projects                        |
| `pnpm format`     | Formats all code with Prettier                         |

## Documentation

- [Development & Architecture Guide](https://github.com/ahmadaljazairy/royal-academy-lms/blob/main/docs/DEVELOPMENT.md)

- [Git & Branching Workflow Guide](https://github.com/ahmadaljazairy/royal-academy-lms/blob/main/docs/GIT_WORKFLOW_GUIDE.md)

- [Software Requirements Specification](https://github.com/ahmadaljazairy/royal-academy-lms/blob/main/docs/Royal%20Academy%20-%20SRS%20Document.md)


