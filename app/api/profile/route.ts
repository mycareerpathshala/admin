import { getSession, signSession, SESSION_COOKIE_OPTIONS } from '@/assets/lib/auth/session';
import { db } from '@/assets/lib/database/db';
import { admins } from '@/assets/lib/database/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const [admin] = await db
        .select({
            id:        admins.id,
            firstName: admins.firstName,
            lastName:  admins.lastName,
            email:     admins.email,
            avatar:    admins.avatar,
            phone:     admins.phone,
            adminRole: admins.adminRole,
            isVerified: admins.isVerified,
            createdAt: admins.createdAt,
        })
        .from(admins)
        .where(eq(admins.id, session.userId))
        .limit(1);

    if (!admin) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ data: admin });
}

export async function PATCH(request: NextRequest) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json() as {
        firstName?: string;
        lastName?:  string;
        phone?:     string | null;
        avatar?:    string;
    };

    const update: Record<string, unknown> = {};
    if (body.firstName !== undefined) update.firstName = body.firstName.trim();
    if (body.lastName  !== undefined) update.lastName  = body.lastName.trim();
    if ('phone'  in body) update.phone  = body.phone  || null;
    if ('avatar' in body) update.avatar = body.avatar;

    if (Object.keys(update).length === 0) {
        return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const [updated] = await db
        .update(admins)
        .set(update)
        .where(eq(admins.id, session.userId))
        .returning();

    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const newToken = await signSession({
        userId:    updated.id,
        firstName: updated.firstName,
        lastName:  updated.lastName,
        email:     updated.email,
        adminRole: updated.adminRole,
        avatar:    updated.avatar,
    });

    const response = NextResponse.json({
        success: true,
        data: {
            firstName: updated.firstName,
            lastName:  updated.lastName,
            avatar:    updated.avatar,
        },
    });
    response.cookies.set(SESSION_COOKIE_OPTIONS.name, newToken, SESSION_COOKIE_OPTIONS);
    return response;
}
