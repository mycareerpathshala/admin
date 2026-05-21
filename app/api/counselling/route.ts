import { getSession } from '@/assets/lib/auth/session';
import { db } from '@/assets/lib/database/db';
import { counsellings, users } from '@/assets/lib/database/schema';
import { desc, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET() {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const requests = await db
        .select({
            id:                  counsellings.id,
            userId:              counsellings.userId,
            name:                counsellings.name,
            email:               counsellings.email,
            phone:               counsellings.phone,
            studyLevel:          counsellings.studyLevel,
            message:             counsellings.message,
            preferredDays:       counsellings.preferredDays,
            preferredTimeRanges: counsellings.preferredTimeRanges,
            nationality:         counsellings.nationality,
            streams:             counsellings.streams,
            countries:           counsellings.countries,
            courses:             counsellings.courses,
            counsellorId:        counsellings.counsellorId,
            scheduledTime:       counsellings.scheduledTime,
            meetingLink:         counsellings.meetingLink,
            adminNote:           counsellings.adminNote,
            status:              counsellings.status,
            createdAt:           counsellings.createdAt,
            updatedAt:           counsellings.updatedAt,
            userAvatar:          users.avatar,
        })
        .from(counsellings)
        .leftJoin(users, eq(counsellings.userId, users.id))
        .orderBy(desc(counsellings.createdAt));

    return NextResponse.json({ data: requests });
}
