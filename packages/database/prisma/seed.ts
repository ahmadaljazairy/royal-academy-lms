/**
 * @file Database Seeding Orchestrator
 * @description Populates baseline system records required for platform startup.
 *
 * Operations are strictly idempotent:
 * - Safe to execute multiple times against both local and staged environments.
 * - Uses `upsert` strategies to prevent duplicate record collisions.
 * - Enforces cryptographically secure Argon2id password hashing for root accounts.
 *
 * Required Environment Variables:
 * - `DATABASE_URL`: Fully qualified PostgreSQL connection string.
 * - `ADMIN_SEED_PASSWORD`: Initial plaintext password for the root administrator.
 */

import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as argon2 from 'argon2';

// ============================================================================
// 1. Environment Variable Validation & Pre-flight Checks
// ============================================================================

const adminPassword = process.env.ADMIN_SEED_PASSWORD;
const databaseUrl = process.env.DATABASE_URL;

if (!adminPassword || adminPassword.trim().length === 0) {
    throw new Error(
        '❌ FATAL: ADMIN_SEED_PASSWORD environment variable is missing or empty. Please check your .env configuration.',
    );
}

if (!databaseUrl || databaseUrl.trim().length === 0) {
    throw new Error(
        '❌ FATAL: DATABASE_URL environment variable is missing or empty. Please check your .env configuration.',
    );
}

// ============================================================================
// 2. Client Initialization (Driver Adapter Pattern)
// ============================================================================

const adapter = new PrismaPg({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });

// ============================================================================
// 3. Domain Seed Routines
// ============================================================================

/**
 * Populates foundational taxonomy categories for course grouping.
 *
 * @param client - Active PrismaClient instance.
 */
async function seedCategories(client: PrismaClient): Promise<void> {
    const programmingCategory = await client.category.upsert({
        where: { slug: 'programming' },
        update: {},
        create: {
            name: 'Programming',
            slug: 'programming',
            description: 'Software development and computer science courses',
        },
    });

    process.stdout.write(` - [Category] Verified: "${programmingCategory.name}" (${programmingCategory.id})\n`);
}

/**
 * Provisions the default root platform administrator and associated profile.
 *
 * @param client - Active PrismaClient instance.
 * @param passwordHash - Pre-computed Argon2id digest of the seed password.
 */
async function seedAdminUser(client: PrismaClient, passwordHash: string): Promise<void> {
    const adminEmail = 'admin@royalacademy.com';

    const adminUser = await client.user.upsert({
        where: { email: adminEmail },
        update: {
            passwordHash,
            termsAcceptedAt: new Date(),
        },
        create: {
            email: adminEmail,
            passwordHash,
            displayName: 'System Administrator',
            role: Role.ADMIN,
            isEmailVerified: true,
            termsAcceptedAt: new Date(),
            profile: {
                create: {
                    headline: 'System Administrator',
                    bio: 'Platform administration and course oversight.',
                },
            },
        },
        include: {
            profile: true,
        },
    });

    process.stdout.write(` - [User] Admin Verified: "${adminUser.email}" (${adminUser.id})\n`);
}

// ============================================================================
// 4. Main Execution Pipeline
// ============================================================================

/**
 * Main seeding pipeline entry point.
 */
async function main(): Promise<void> {
    const startTime = Date.now();
    process.stdout.write('🌱 Starting database seeding pipeline...\n');

    // Compute password hash once ahead of user operations
    const securePasswordHash = await argon2.hash(adminPassword!);

    await seedCategories(prisma);
    await seedAdminUser(prisma, securePasswordHash);

    const durationMs = Date.now() - startTime;
    process.stdout.write(`🏁 Seeding completed successfully in ${durationMs}ms.\n`);
}

main()
    .catch((error: unknown) => {
        process.stderr.write(`❌ Seeding failed with an unhandled exception:\n`);
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        // Terminate connection pool cleanly to allow process to exit immediately
        await prisma.$disconnect();
    });