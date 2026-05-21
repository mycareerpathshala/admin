import { getSession } from '@/assets/lib/auth/session';
import { db } from '@/assets/lib/database/db';
import { subscribers } from '@/assets/lib/database/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await request.json() as { name?: string; phone?: string | null };

    const [updated] = await db
        .update(subscribers)
        .set({
            ...(body.name  !== undefined && { name:  body.name.trim() }),
            ...(body.phone !== undefined && { phone: body.phone?.trim() || null }),
        })
        .where(eq(subscribers.id, id))
        .returning();

    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({ data: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    await db.delete(subscribers).where(eq(subscribers.id, id));
    return NextResponse.json({ success: true });
}
