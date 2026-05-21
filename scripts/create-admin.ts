import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { hash } from 'bcryptjs';
import { admins } from '../assets/lib/database/schema';

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
    console.error('DATABASE_URL is not set');
    process.exit(1);
}

const FIRST_NAME = process.argv[2];
const LAST_NAME  = process.argv[3];
const EMAIL      = process.argv[4];
const PASSWORD   = process.argv[5];
const ROLE       = (process.argv[6] ?? 'editor') as 'super' | 'admin' | 'editor' | 'counsellor';

if (!FIRST_NAME || !LAST_NAME || !EMAIL || !PASSWORD) {
    console.error('Usage: npx tsx scripts/create-admin.ts <firstName> <lastName> <email> <password> [role]');
    console.error('       role defaults to "editor" if omitted');
    process.exit(1);
}

const client = postgres(DATABASE_URL);
const db     = drizzle(client);

async function main() {
    const passwordHash = await hash(PASSWORD, 12);

    const [admin] = await db
        .insert(admins)
        .values({ firstName: FIRST_NAME, lastName: LAST_NAME, email: EMAIL, passwordHash, adminRole: ROLE })
        .returning({ id: admins.id, email: admins.email, adminRole: admins.adminRole });

    console.log(`Admin created: ${admin.email} (${admin.adminRole}) — id: ${admin.id}`);

    await client.end();
}

main().catch((err) => {
    const cause = err?.cause?.message ?? '';
    if (cause.includes('unique') && cause.includes('email')) {
        console.error(`Error: an admin with email "${EMAIL}" already exists.`);
    } else if (cause.includes('unique') && cause.includes('one_super_admin')) {
        console.error('Error: a super admin already exists. Only one super admin is allowed.');
    } else {
        console.error(err.message, cause ? `\nCause: ${cause}` : '');
    }
    process.exit(1);
});
