import { redirect } from 'next/navigation';
import { db } from '@/assets/lib/database/db';
import { admins } from '@/assets/lib/database/schema';
import { sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export default async function RootPage() {
    const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(admins);
    if (count === 0) redirect('/setup');
    redirect('/login');
}
