import { redirect } from 'next/navigation';
import { db } from '@/assets/lib/database/db';
import { admins } from '@/assets/lib/database/schema';
import { sql } from 'drizzle-orm';
import SetupForm from './_components/SetupForm';

export default async function SetupPage() {
    const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(admins);
    if (count > 0) redirect('/login');
    return <SetupForm />;
}
