# Solo Developer Git & Branching Guide — Royal Academy

This guide defines the Git branching strategy, commit standards, and daily development workflows for the **Royal Academy** enterprise monorepo. It is specifically tailored for a **solo developer** prioritizing simplicity, speed, and safety over complex, heavy CI/CD pipelines.

---

## Table of Contents

1. [Core Philosophy for Solo Monorepo Development](#1-core-philosophy-for-solo-monorepo-development)
2. [Branching Strategy: The Lightweight Feature Branch Model](#2-branching-strategy-the-lightweight-feature-branch-model)
3. [Branch Naming Conventions](#3-branch-naming-conventions)
4. [Commit Message Standards (Conventional Commits)](#4-commit-message-standards-conventional-commits)
5. [Step-by-Step Daily Developer Workflow](#5-step-by-step-daily-developer-workflow)
6. [Monorepo & Database Safety Invariants](#6-monorepo--database-safety-invariants)
7. [Emergency & Recovery Playbook](#7-emergency--recovery-playbook)
8. [Sprint & Milestone Tagging](#8-sprint--milestone-tagging)
9. [Quick Reference Command Cheat Sheet](#9-quick-reference-command-cheat-sheet)

---

## 1. Core Philosophy for Solo Monorepo Development

When working solo on a monorepo containing multiple interconnected packages (`api`, `web`, `database`, `types`), heavy enterprise git flows (such as Git Flow with `develop`, `release`, and `hotfix` branches) introduce unnecessary bureaucracy, merge conflicts, and friction.

### Guiding Principles:

* **`main` is Always Working:** The `main` branch must always compile (`pnpm build`) and pass TypeScript type checks (`pnpm type-check`).
* **Short-Lived Branches:** Branches should live for a few hours to at most 1–2 days. Avoid long-running divergence.
* **Local Verification Over Heavy CI:** Instead of configuring complex CI runners, enforce quality locally using Turbo scripts before merging to `main`.
* **Atomic, Descriptive Commits:** Keep commits scoped to single packages or architectural layers (e.g., database schema vs. API controllers).

---

## 2. Branching Strategy: The Lightweight Feature Branch Model

We adopt a **Single-Trunk with Short-Lived Feature Branches** strategy.

```text
[main] ────────────────●─────────────────────────────●─────────────●─── (Always stable)
                        \                           /             /
[feat/db-auth]           ●─────────●───────────────/             /
                                    \                           /
[feat/api-crypto]                    ●─────────────────────────/
```

### Branch Roles

1. **`main`**:
   
   * The single permanent branch.
   
   * Represents the latest working, verified iteration of the platform.
   
   * Never commit broken, uncompilable code directly to `main`.

2. **Feature / Task Branches (`feat/*`, `fix/*`, `chore/*`)**:
   
   * Created off `main` for a specific sprint task, bug fix, or schema change.
   
   * Work is committed here iteratively.
   
   * Verified locally before merging back into `main`.
   
   * Deleted immediately after a successful merge.

---

## 3. Branch Naming Conventions

Branch names must follow a predictable, structured pattern:

<type>/<monorepo-scope>-<short-description>

### Allowed Types:

* `feat/`: A new feature, schema addition, or endpoint.
* `fix/`: A bug fix or correction.
* `chore/`: Tooling, dependency updates, root scripts, environment files.
* `refactor/`: Code restructuring without functional changes.
* `docs/`: Documentation, SRS updates, or markdown guides.

### Recognized Monorepo Scopes:

* `db`: Affects `packages/database` (Prisma schema, migrations, seeds).
* `types`: Affects `packages/types` (shared DTOs, interfaces, enums).
* `api`: Affects `apps/api` (NestJS controllers, services, modules).
* `web`: Affects `apps/web` (React UI components, pages, hooks).
* `repo`: Monorepo root configuration (`turbo.json`, `pnpm-workspace.yaml`, `.env.example`).

### Examples of Good Branch Names:

* `feat/db-auth-schemas`
* `feat/api-crypto-utilities`
* `chore/repo-env-setup`
* `fix/types-role-export`
* `feat/web-login-screen`

---

## 4. Commit Message Standards (Conventional Commits)

Commit messages must be clear and auditable across package boundaries. We follow the **Conventional Commits** specification tailored to our workspace packages.

### Commit Format:

```text
<type>(<scope>): <short imperative summary>

[optional detailed body explaining why and what changed]
```

### Types:

* `feat`: A new feature or capability.
* `fix`: A bug fix.
* `chore`: Maintenance, dependencies, environment configs.
* `refactor`: Code reorganization without behavioral change.
* `test`: Adding or updating test suites.
* `docs`: Documentation changes.

### Monorepo Scopes:

Use the package or app name: `(database)`, `(types)`, `(api)`, `(web)`, or `(repo)`.

### Commit Examples:

#### Good Commits:

* `feat(database): define User, Role, and Category Prisma models`
* `feat(api): implement argon2id password hashing utility`
* `chore(repo): add root .env.example template and pnpm scripts`
* `fix(types): correct EmailVerification token expiry field type`
* `feat(database): add seed script for STUDENT, INSTRUCTOR, ADMIN roles`

#### Bad Commits:

* `updates` *(too vague)*
* `fixed stuff in database and api` *(violates single-responsibility)*
* `WIP` *(never leave unfinished, unverified commits on main)*

---

## 5. Step-by-Step Daily Developer Workflow

Follow this sequence for every sprint task to ensure clean history and zero build breaks.

### Step 1: Ensure `main` is Clean and Updated

```bash
git checkout main
git pull origin main
```

### Step 2: Create a Dedicated Feature Branch

```bash
# Example: starting Sprint 1 database schema work
git checkout -b feat/db-auth-schemas
```

### Step 3: Implement Changes & Test Locally

Work on your code. Stage and commit in small, logical chunks:

```bash
# Check modified files
git status

# Stage specific files
git add packages/database/prisma/schema/base.prisma

# Commit with conventional message
git commit -m "feat(database): define User and Role models with relations"
```

### Step 4: Run Monorepo Local Validation

Before merging, verify that the entire monorepo builds and type-checks:

```bash
# From the monorepo root:
pnpm type-check
pnpm build
```

If anything fails, fix it on your feature branch and commit the fix.

### Step 5: Merge into `main`

Since you work solo, you can merge directly from your local terminal using **Squash Merge** (recommended for a clean linear history) or a standard fast-forward merge:

#### Option A: Squash Merge (Recommended — Keeps `main` history clean)

```bash
git checkout main
git merge --squash feat/db-auth-schemas
git commit -m "feat(database): implement auth schemas and seed roles (Sprint 1)"
```

#### Option B: Standard Merge

```bash
git checkout main
git merge feat/db-auth-schemas
```

### Step 6: Clean Up the Local Branch

```bash
git branch -d feat/db-auth-schemas
```

### Step 7: Push to Remote (Optional / Recommended for Backup)

```bash
git push origin main
```

---

## 6. Monorepo & Database Safety Invariants

### 1. The Prisma Migration Invariant

* **Never edit applied migration SQL files manually.**
* Always generate migrations using:
  
  ```bash
  pnpm --filter @template/database exec prisma migrate dev --name <descriptive_name>
  ```
* If a migration fails or is wrong on your feature branch, reset the local test database rather than hacking the migration folder.

### 2. The Dependency Lockfile Invariant

* Never install packages with `npm` or `yarn`. Always use `pnpm`:
  
  ```bash
  pnpm --filter @template/api add argon2
  ```
* Always commit `pnpm-lock.yaml` whenever dependencies are added or updated.

### 3. The Secrets Invariant

* **NEVER commit `.env` files.**
* Verify your `.gitignore` includes:
  
  ```text
  .env
  .env.*
  !.env.example
  node_modules/
  dist/
  .turbo/
  ```
* Always keep `.env.example` updated with dummy variable values when adding new environment configurations.

---

## 7. Emergency & Recovery Playbook

### Scenario A: You committed something by mistake on `main` instead of a branch

```bash
# 1. Create a new branch with your changes
git branch feat/my-feature

# 2. Reset main back to the previous commit (undoing the commit locally on main)
git reset --hard HEAD~1

# 3. Switch to your feature branch and continue working safely
git checkout feat/my-feature
```

### Scenario B: You made experimental changes you want to discard completely

```bash
# Discard all unstaged changes in the current branch
git restore .

# Remove newly created untracked files
git clean -fd
```

### Scenario C: You need to pause work and switch branches without committing

```bash
# Save working changes temporarily
git stash save "wip: halfway through password reset token"

# Switch branches, do what is needed, then return:
git checkout <branch-name>

# Restore your changes:
git stash pop
```

### Scenario D: You accidentally pushed a bad commit to `main`

```bash
# Revert the commit cleanly with a new compensating commit:
git revert HEAD
git push origin main
```

---

## 8. Sprint & Milestone Tagging

Tag significant milestones (such as the completion of a sprint or version MVP baseline) so you can always refer back to a known stable release.

### Tagging Commands:

```bash
# Create an annotated tag at the current commit
git tag -a v1.0.0-sprint1 -m "Sprint 1: Auth schemas, security utilities, and system roles seed"

# Push tags to remote repository
git push origin --tags

# View all tags
git tag -n
```

---

## 9. Quick Reference Command Cheat Sheet

| Task                      | Command                                                                |
|:------------------------- |:---------------------------------------------------------------------- |
| **Start task**            | `git checkout main && git pull && git checkout -b feat/<scope>-<name>` |
| **Stage changes**         | `git add <files>`                                                      |
| **Commit**                | `git commit -m "<type>(<scope>): <summary>"`                           |
| **Verify monorepo**       | `pnpm type-check && pnpm build`                                        |
| **Switch to main**        | `git checkout main`                                                    |
| **Squash merge**          | `git merge --squash <branch-name> && git commit`                       |
| **Delete feature branch** | `git branch -d <branch-name>`                                          |
| **Temporary stash**       | `git stash` / `git stash pop`                                          |
| **Discard local edits**   | `git restore .`                                                        |
| **Tag release**           | `git tag -a vX.Y.Z -m "description"`                                   |
