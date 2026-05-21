import { db } from '@/assets/lib/database/db';
import { admins } from '@/assets/lib/database/schema';
import { signSession, SESSION_COOKIE_OPTIONS } from '@/assets/lib/auth/session';
import { hash } from 'bcryptjs';
import { sql } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(admins);
        if (count > 0) {
            return NextResponse.json({ error: 'Setup already completed' }, { status: 403 });
        }

        const { firstName, lastName, email, password } = await request.json();

        if (!firstName || !lastName || !email || !password) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
        }
        if (password.length < 8) {
            return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
        }

        const passwordHash = await hash(password, 12);
        const [admin] = await db
            .insert(admins)
            .values({ firstName, lastName, email, passwordHash, adminRole: 'super', isVerified: true })
            .returning();

        const token = await signSession({
            userId:    admin.id,
            firstName: admin.firstName,
            lastName:  admin.lastName,
            email:     admin.email,
            adminRole: admin.adminRole,
            avatar:    admin.avatar,
        });

        const response = NextResponse.json({ success: true });
        response.cookies.set(SESSION_COOKIE_OPTIONS.name, token, SESSION_COOKIE_OPTIONS);
        return response;
    } catch (err) {
        console.error('[admin/setup]', err);
        return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
    }
}
