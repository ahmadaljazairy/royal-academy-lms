import { defineConfig } from "@prisma/config";

try {
    process.loadEnvFile("./.env");
} catch (error) {
    console.warn("⚠️ Could not load local .env file", error);
}

export default defineConfig({
    schema: "./prisma/schema",
    migrations: {
        seed: "node --env-file=./.env --import tsx ./prisma/schema/seed.ts",
    },
    datasource: {
        url: process.env["DATABASE_URL"],
    },
});