import { getSession } from '@/assets/lib/auth/session';
import { db } from '@/assets/lib/database/db';
import { applications, counsellings, users } from '@/assets/lib/database/schema';
import { count, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET() {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const [[totalUsers], [totalApplications], [totalCounselling], [pendingCounselling], [scheduledCounselling]] =
        await Promise.all([
            db.select({ count: count() }).from(users),
            db.select({ count: count() }).from(applications),
            db.select({ count: count() }).from(counsellings),
            db.select({ count: count() }).from(counsellings).where(eq(counsellings.status, 'pending')),
            db.select({ count: count() }).from(counsellings).where(eq(counsellings.status, 'scheduled')),
        ]);

    return NextResponse.json({
        data: {
            totalUsers:           totalUsers.count,
            totalApplications:    totalApplications.count,
            totalCounselling:     totalCounselling.count,
            pendingCounselling:   pendingCounselling.count,
            scheduledCounselling: scheduledCounselling.count,
        },
    });
}
