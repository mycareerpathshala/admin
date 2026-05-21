import { getSession } from '@/assets/lib/auth/session';
import { db } from '@/assets/lib/database/db';
import { admins } from '@/assets/lib/database/schema';
import { hash } from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

type AdminRole = 'super' | 'admin' | 'editor' | 'counsellor';

function canActOn(sessionRole: string, targetRole: AdminRole): boolean {
    if (sessionRole === 'super')  return true;
    if (sessionRole === 'admin')  return targetRole === 'editor' || targetRole === 'counsellor';
    return false;
}

function allowedTargetRoles(sessionRole: string): AdminRole[] {
    if (sessionRole === 'super')  return ['admin', 'editor', 'counsellor'];
    if (sessionRole === 'admin')  return ['editor', 'counsellor'];
    return [];
}

// ── PATCH /api/admins/[id] ──────────────────────────────────────────────────

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    const [target] = await db
        .select({ id: admins.id, adminRole: admins.adminRole })
        .from(admins)
        .where(eq(admins.id, id))
        .limit(1);

    if (!target) return NextResponse.json({ error: 'Admin not found.' }, { status: 404 });
    if (!canActOn(session.adminRole, target.adminRole)) {
        return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    const body = await request.json() as {
        firstName?:   string;
        lastName?:    string;
        phone?:       string | null;
        adminRole?:   string;
        newPassword?: string;
    };

    const update: Record<string, unknown> = {};
    if (body.firstName !== undefined) update.firstName = body.firstName.trim();
    if (body.lastName  !== undefined) update.lastName  = body.lastName.trim();
    if ('phone' in body)              update.phone     = body.phone || null;
    if (body.adminRole) {
        const allowed = allowedTargetRoles(session.adminRole);
        if (!allowed.includes(body.adminRole as AdminRole)) {
            return NextResponse.json({ error: 'You cannot assign that role.' }, { status: 403 });
        }
        update.adminRole = body.adminRole;
    }
    if (body.newPassword) {
        if (body.newPassword.length < 8) {
            return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });
        }
        update.passwordHash = await hash(body.newPassword, 12);
    }

    if (Object.keys(update).length === 0) {
        return NextResponse.json({ error: 'No fields to update.' }, { status: 400 });
    }

    try {
        const [updated] = await db
            .update(admins)
            .set(update)
            .where(eq(admins.id, id))
            .returning({
                id:        admins.id,
                firstName: admins.firstName,
                lastName:  admins.lastName,
                email:     admins.email,
                phone:     admins.phone,
                adminRole: admins.adminRole,
                createdAt: admins.createdAt,
            });

        return NextResponse.json({ data: updated });
    } catch (err: unknown) {
        const msg = (err instanceof Error ? err.message : '') + String(err);
        if (msg.includes('one_super_admin')) {
            return NextResponse.json({ error: 'A super admin already exists.' }, { status: 409 });
        }
        throw err;
    }
}

// ── DELETE /api/admins/[id] ─────────────────────────────────────────────────

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    if (id === session.userId) {
        return NextResponse.json({ error: 'You cannot delete your own account.' }, { status: 400 });
    }

    const [target] = await db
        .select({ id: admins.id, adminRole: admins.adminRole })
        .from(admins)
        .where(eq(admins.id, id))
        .limit(1);

    if (!target) return NextResponse.json({ error: 'Admin not found.' }, { status: 404 });
    if (!canActOn(session.adminRole, target.adminRole)) {
        return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
    }

    await db.delete(admins).where(eq(admins.id, id));
    return NextResponse.json({ success: true });
}
