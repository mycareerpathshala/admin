import { getSession } from '@/assets/lib/auth/session';
import { db } from '@/assets/lib/database/db';
import { users } from '@/assets/lib/database/schema';
import { desc } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET() {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const allUsers = await db
        .select({
            id:         users.id,
            firstName:  users.firstName,
            lastName:   users.lastName,
            email:      users.email,
            avatar:     users.avatar,
            phone:      users.phone,
            country:    users.country,
            gender:     users.gender,
            isVerified: users.isVerified,
            createdAt:  users.createdAt,
        })
        .from(users)
        .orderBy(desc(users.createdAt));

    return NextResponse.json({ data: allUsers });
}
