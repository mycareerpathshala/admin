import { getSession } from '@/assets/lib/auth/session';
import { db } from '@/assets/lib/database/db';
import { admins } from '@/assets/lib/database/schema';
import { hash } from 'bcryptjs';
import { desc } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

type AdminRole = 'super' | 'admin' | 'editor' | 'counsellor';

function canManage(sessionRole: string): boolean {
    return sessionRole === 'super' || sessionRole === 'admin';
}

// Roles that the current session role can create/manage
function allowedTargetRoles(sessionRole: string): AdminRole[] {
    if (sessionRole === 'super')  return ['admin', 'editor', 'counsellor'];
    if (sessionRole === 'admin')  return ['editor', 'counsellor'];
    return [];
}

// ── GET /api/admins ─────────────────────────────────────────────────────────

export async function GET() {
    const session = await getSession();
    if (!session)                 return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!canManage(session.adminRole)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const rows = await db
        .select({
            id:        admins.id,
            firstName: admins.firstName,
            lastName:  admins.lastName,
            email:     admins.email,
            avatar:    admins.avatar,
            phone:     admins.phone,
            adminRole: admins.adminRole,
            isVerified:admins.isVerified,
            createdAt: admins.createdAt,
        })
        .from(admins)
        .orderBy(desc(admins.createdAt));

    return NextResponse.json({ data: rows });
}

// ── POST /api/admins ────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
    const session = await getSession();
    if (!session)                 return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!canManage(session.adminRole)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { firstName, lastName, email, password, adminRole } = await request.json() as {
        firstName?: string;
        lastName?:  string;
        email?:     string;
        password?:  string;
        adminRole?: string;
    };

    if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !password || !adminRole) {
        return NextResponse.json({ error: 'All fields are required.' }, { status: 400 });
    }
    if (password.length < 8) {
        return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
    }

    const allowed = allowedTargetRoles(session.adminRole);
    if (!allowed.includes(adminRole as AdminRole)) {
        return NextResponse.json({ error: 'You cannot create an admin with that role.' }, { status: 403 });
    }

    const passwordHash = await hash(password, 12);

    try {
        const [created] = await db
            .insert(admins)
            .values({
                firstName:    firstName.trim(),
                lastName:     lastName.trim(),
                email:        email.trim().toLowerCase(),
                passwordHash,
                adminRole:    adminRole as AdminRole,
            })
            .returning({
                id:        admins.id,
                firstName: admins.firstName,
                lastName:  admins.lastName,
                email:     admins.email,
                adminRole: admins.adminRole,
                createdAt: admins.createdAt,
            });

        return NextResponse.json({ data: created }, { status: 201 });
    } catch (err: unknown) {
        const msg = (err instanceof Error ? err.message : '') + String(err);
        if (msg.includes('unique') && msg.includes('email')) {
            return NextResponse.json({ error: 'An account with that email already exists.' }, { status: 409 });
        }
        if (msg.includes('one_super_admin')) {
            return NextResponse.json({ error: 'A super admin already exists.' }, { status: 409 });
        }
        throw err;
    }
}
