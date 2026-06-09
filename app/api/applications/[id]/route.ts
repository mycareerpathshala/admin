import { getSession } from '@/assets/lib/auth/session';
import { db } from '@/assets/lib/database/db';
import { applications, users } from '@/assets/lib/database/schema';
import { sendEmail, EMAIL_FROM_ADMISSION } from '@/assets/lib/email';
import { applicationStatusEmailHtml } from '@/assets/lib/email/templates/applicationStatus';
import { applicationNotification, createNotification } from '@/assets/lib/notifications';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

type ApplicationStatus = 'draft' | 'submitted' | 'under_review' | 'offer_received' | 'accepted' | 'rejected' | 'withdrawn';

const EMAIL_STATUSES = new Set(['under_review', 'offer_received', 'accepted', 'rejected']);

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const body = await request.json() as { status?: ApplicationStatus; adminNote?: string | null };

    const [updated] = await db
        .update(applications)
        .set({
            ...(body.status    !== undefined && { status:    body.status }),
            ...(body.adminNote !== undefined && { adminNote: body.adminNote || null }),
        })
        .where(eq(applications.id, id))
        .returning();

    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (body.status) {
        // In-app notification
        const notif = applicationNotification(body.status);
        if (notif) {
            createNotification(updated.userId, notif.type, notif.title, notif.message).catch(() => {});
        }

        // Email — only for meaningful status transitions
        if (EMAIL_STATUSES.has(body.status)) {
            (async () => {
                const [user] = await db
                    .select({ email: users.email, firstName: users.firstName })
                    .from(users)
                    .where(eq(users.id, updated.userId));

                if (!user?.email) return;

                const html = applicationStatusEmailHtml({
                    firstName:      user.firstName,
                    universityName: 'your chosen university',
                    courseName:     null,
                    status:         body.status!,
                    adminNote:      updated.adminNote,
                });

                const SUBJECT: Record<string, string> = {
                    under_review:   'Your application is under review',
                    offer_received: 'You received an offer! 🎉',
                    accepted:       'Congratulations — Application Accepted! ✅',
                    rejected:       'Application status update',
                };

                await sendEmail({
                    to:      user.email,
                    from:    EMAIL_FROM_ADMISSION,
                    subject: SUBJECT[body.status!] ?? 'Application status updated',
                    html,
                }).catch(() => {});
            })().catch(() => {});
        }
    }

    return NextResponse.json({ data: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    await db.delete(applications).where(eq(applications.id, id));
    return NextResponse.json({ success: true });
}
