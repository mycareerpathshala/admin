import { getSession } from '@/assets/lib/auth/session';
import { db } from '@/assets/lib/database/db';
import { admins } from '@/assets/lib/database/schema';
import { compare, hash } from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { currentPassword, newPassword } = await request.json() as {
        currentPassword?: string;
        newPassword?:     string;
    };

    if (!currentPassword || !newPassword) {
        return NextResponse.json({ error: 'Both current and new password are required.' }, { status: 400 });
    }
    if (newPassword.length < 8) {
        return NextResponse.json({ error: 'New password must be at least 8 characters.' }, { status: 400 });
    }

    const [admin] = await db
        .select({ passwordHash: admins.passwordHash })
        .from(admins)
        .where(eq(admins.id, session.userId))
        .limit(1);

    if (!admin) return NextResponse.json({ error: 'Account not found.' }, { status: 404 });

    const valid = await compare(currentPassword, admin.passwordHash);
    if (!valid) return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 });

    const newHash = await hash(newPassword, 12);
    await db.update(admins).set({ passwordHash: newHash }).where(eq(admins.id, session.userId));

    return NextResponse.json({ success: true });
}
