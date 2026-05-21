import { getSession } from '@/assets/lib/auth/session';
import { db } from '@/assets/lib/database/db';
import { counsellors } from '@/assets/lib/database/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET() {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const list = await db
        .select({
            id:          counsellors.id,
            name:        counsellors.name,
            designation: counsellors.designation,
            photo:       counsellors.photo,
        })
        .from(counsellors)
        .where(eq(counsellors.isActive, true));

    return NextResponse.json({ data: list });
}
