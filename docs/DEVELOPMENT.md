# Enterprise Monorepo — Developer & System Guide

## 1. Monorepo Overview & Architecture

This repository is a TypeScript monorepo managed with **pnpm workspaces** and orchestrated by **Turborepo**.

### Architecture Map
```text
enterprise-monorepo/
├── apps/
│   ├── api/          # NestJS 11 backend (Native Node.js ESM, --env-file)
│   └── web/          # React 19 + Vite 6 frontend dashboard
├── packages/
│   ├── types/              # Pure TypeScript shared domain types & DTO interfaces
│   ├── database/           # Prisma 7 schema, migrations, and typed PrismaClient
│   ├── eslint-config/      # Shared Flat ESLint 9 configs (base, node, react)
│   └── typescript-config/  # Shared tsconfig bases (base, node, react, bundler)
├── turbo.json        # Task pipeline orchestration & topological caching
├── pnpm-workspace.yaml
└── package.json      # Root orchestration scripts and engines constraints
```

---

## 2. Core Invariants & Engineering Rules

* **Package Manager:** `pnpm` exclusively (enforce `workspace:*` for internal dependencies).
* **Module Format:** Native ECMAScript Modules (`"type": "module"` throughout). All internal JS/TS imports must be ESM compliant.
* **Environment Variables:** Handled via native Node flags (`node --env-file=.env`). No runtime `dotenv` npm packages.
* **Build Order & Dependencies:**
    * `@template/types` and `@template/database` are foundational libraries.
    * `@template/database` requires `prisma generate` before downstream applications can compile.
    * `turbo.json` controls the execution pipeline via topological `dependsOn: ["^build"]`.

---

## 3. Daily Command Cheat Sheet

All commands should be executed from the **monorepo root**:

| Command | Action |
| :--- | :--- |
| `pnpm dev` | Starts all apps and package watchers in parallel via Turbo |
| `pnpm dev --filter="./apps/*"` | Runs only `api` and `web` dev servers |
| `pnpm build` | Topologically builds all packages and applications with caching |
| `pnpm type-check` | Runs `tsc --noEmit` across all workspace projects |
| `pnpm lint` | Runs ESLint 9 across all workspace projects |
| `pnpm format` | Formats all source files with Prettier |
| `pnpm audit` | Scans dependency tree for security vulnerabilities |

---

## 4. Standard How-To Recipes

### Recipe A: Adding a New Shared Domain Type
1. Edit `packages/types/src/index.ts`.
2. Re-export the interface/type.
3. Import directly in `apps/api` or `apps/web`:
   ```typescript
   import type { UserProfile } from "@template/types";
   ```

### Recipe B: Updating the Database Schema
1. Modify `packages/database/prisma/schema.prisma`.
2. Regenerate the Prisma Client:
   ```bash
   pnpm --filter @template/database run db:generate
   ```
3. Create/apply migration:
   ```bash
   pnpm --filter @template/database exec prisma migrate dev --name <migration_name>
   ```

### Recipe C: Adding an External Package
* **To a specific app:** `pnpm --filter @template/api add <package-name>`
* **To a shared package:** `pnpm --filter @template/database add <package-name>`
* **To root (dev tools only):** `pnpm add -Dw <package-name>`

### Recipe D: Adding a New Workspace Package (`packages/new-pkg`)
1. Create folder `packages/new-pkg` with `package.json` naming `"@template/new-pkg"`.
2. Add `"@template/typescript-config": "workspace:*"` and `"@template/eslint-config": "workspace:*"`.
3. Add `"exports"` map in `package.json` exposing `"./dist/index.js"`.
4. Run `pnpm install` from root.