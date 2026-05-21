import { getSession } from '@/assets/lib/auth/session';
import { db } from '@/assets/lib/database/db';
import { counsellings, users } from '@/assets/lib/database/schema';
import { sendEmail } from '@/assets/lib/email';
import {
    counsellingCancelledEmailHtml,
    counsellingCompletedEmailHtml,
    counsellingScheduledEmailHtml,
} from '@/assets/lib/email/templates/counselling';
import { counsellingNotification, createNotification } from '@/assets/lib/notifications';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await request.json() as {
        status?: 'pending' | 'scheduled' | 'completed' | 'cancelled';
        scheduledTime?: string | null;
        meetingLink?: string | null;
        counsellorId?: string | null;
        adminNote?: string | null;
    };

    const [updated] = await db
        .update(counsellings)
        .set({
            ...(body.status        !== undefined && { status:        body.status }),
            ...(body.scheduledTime !== undefined && { scheduledTime: body.scheduledTime ? new Date(body.scheduledTime) : null }),
            ...(body.meetingLink   !== undefined && { meetingLink:   body.meetingLink }),
            ...(body.counsellorId  !== undefined && { counsellorId:  body.counsellorId }),
            ...(body.adminNote     !== undefined && { adminNote:     body.adminNote || null }),
        })
        .where(eq(counsellings.id, id))
        .returning();

    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (body.status && ['scheduled', 'completed', 'cancelled'].includes(body.status)) {
        // In-app notification
        const notif = counsellingNotification(
            body.status as 'scheduled' | 'completed' | 'cancelled',
            updated.scheduledTime,
        );
        if (notif) {
            createNotification(updated.userId, notif.type, notif.title, notif.message).catch(() => {});
        }

        // Email
        (async () => {
            const [user] = await db
                .select({ email: users.email, firstName: users.firstName })
                .from(users)
                .where(eq(users.id, updated.userId));

            if (!user?.email) return;

            let subject = '';
            let html = '';

            if (body.status === 'scheduled') {
                const when = updated.scheduledTime
                    ? new Date(updated.scheduledTime).toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' })
                    : 'a confirmed time';
                subject = '📅 Your counselling session is scheduled';
                html = counsellingScheduledEmailHtml({
                    firstName:     user.firstName,
                    scheduledTime: when,
                    meetingLink:   updated.meetingLink,
                    adminNote:     updated.adminNote,
                });
            } else if (body.status === 'cancelled') {
                subject = 'Your counselling request has been cancelled';
                html = counsellingCancelledEmailHtml({ firstName: user.firstName });
            } else if (body.status === 'completed') {
                subject = '✅ Your counselling session is complete';
                html = counsellingCompletedEmailHtml({ firstName: user.firstName });
            }

            if (html) {
                await sendEmail({ to: user.email, subject, html, from: process.env.EMAIL_FROM_ADMISSION }).catch(() => {});
            }
        })().catch(() => {});
    }

    return NextResponse.json({ data: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    await db.delete(counsellings).where(eq(counsellings.id, id));
    return NextResponse.json({ success: true });
}
