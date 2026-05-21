import { getSession } from '@/assets/lib/auth/session';
import { db } from '@/assets/lib/database/db';
import { subscribers } from '@/assets/lib/database/schema';
import { desc } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET() {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await db
        .select()
        .from(subscribers)
        .orderBy(desc(subscribers.createdAt));

    return NextResponse.json({ data });
}
