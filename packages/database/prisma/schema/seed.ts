import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as argon2 from 'argon2';

// 1. Strict Environment Variable Validation
const adminPassword = process.env.ADMIN_SEED_PASSWORD;
const databaseUrl = process.env.DATABASE_URL;

if (!adminPassword) {
    throw new Error('❌ FATAL: ADMIN_SEED_PASSWORD is not set in the .env file.');
}
if (!databaseUrl) {
    throw new Error('❌ FATAL: DATABASE_URL is not set in the .env file.');
}

// 2. Initialize the Driver Adapter for Prisma 7
const adapter = new PrismaPg({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log(' - Starting database seed...');

    // Hash the secure password from the .env file
    const securePasswordHash = await argon2.hash(adminPassword);

    // Seed Initial Categories
    const programmingCategory = await prisma.category.upsert({
        where: { slug: 'programming' },
        update: {},
        create: {
            name: 'Programming',
            slug: 'programming',
            description: 'Software development and computer science courses',
        },
    });
    console.log(` - Created Category: ${programmingCategory.name}`);

    // Seed the Default Administrator
    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@royalacademy.com' },
        update: {
            passwordHash: securePasswordHash,
        },
        create: {
            email: 'admin@royalacademy.com',
            passwordHash: securePasswordHash,
            displayName: 'System Administrator',
            role: 'ADMIN',
            isEmailVerified: true,
        },
    });

    console.log(` - Created Admin User: ${adminUser.email}`);
    console.log(' - Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        // Gracefully close the database connection
        await prisma.$disconnect();
    });