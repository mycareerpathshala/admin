import { defineConfig } from 'drizzle-kit';

export default defineConfig({
    schema: './assets/lib/database/schema.ts',
    out: './drizzle',
    dialect: 'postgresql',
    dbCredentials: {
        url: process.env.DATABASE_URL!,
        ssl: false,
    },
});
