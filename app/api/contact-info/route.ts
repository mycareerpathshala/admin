import { getSession } from '@/assets/lib/auth/session';
import { db } from '@/assets/lib/database/db';
import { contactInfo } from '@/assets/lib/database/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET() {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const rows = await db.select().from(contactInfo).where(eq(contactInfo.id, 1)).limit(1);
    return NextResponse.json({ data: rows[0] ?? null });
}

export async function PATCH(request: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();

    const allowed = [
        'email', 'phone', 'whatsappNumber', 'whatsappDisplay',
        'facebookUrl', 'facebookHandle', 'instagramUrl', 'instagramHandle',
        'youtubeUrl', 'youtubeHandle', 'linkedinUrl', 'linkedinHandle',
        'officeHoursDays', 'officeHoursTime', 'emailResponseTime',
        'whatsappResponseTime', 'languages',
    ] as const;

    const patch: Partial<Record<typeof allowed[number], string | null>> = {};
    for (const key of allowed) {
        if (key in body) patch[key] = body[key] ?? null;
    }

    await db
        .insert(contactInfo)
        .values({ id: 1, ...patch })
        .onConflictDoUpdate({ target: contactInfo.id, set: patch });

    const rows = await db.select().from(contactInfo).where(eq(contactInfo.id, 1)).limit(1);
    return NextResponse.json({ data: rows[0] });
}
