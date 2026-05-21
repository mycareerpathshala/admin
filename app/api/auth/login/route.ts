import { db } from '@/assets/lib/database/db';
import { admins } from '@/assets/lib/database/schema';
import { signSession, SESSION_COOKIE_OPTIONS } from '@/assets/lib/auth/session';
import { compare } from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
        }

        const [admin] = await db.select().from(admins).where(eq(admins.email, email)).limit(1);

        if (!admin) {
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
        }

        const valid = await compare(password, admin.passwordHash);
        if (!valid) {
            return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
        }

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
        console.error('[admin/login]', err);
        return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
    }
}
