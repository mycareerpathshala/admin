import { getSession } from '@/assets/lib/auth/session';
import { db } from '@/assets/lib/database/db';
import { applications, users } from '@/assets/lib/database/schema';
import { fetchCms } from '@/assets/utilities/fetchCms';
import { desc, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET() {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const apps = await db
        .select({
            id:            applications.id,
            type:          applications.type,
            universityId:  applications.universityId,
            courseId:      applications.courseId,
            status:        applications.status,
            notes:         applications.notes,
            adminNote:     applications.adminNote,
            createdAt:     applications.createdAt,
            updatedAt:     applications.updatedAt,
            userId:        applications.userId,
            userFirstName: users.firstName,
            userLastName:  users.lastName,
            userEmail:     users.email,
            userAvatar:    users.avatar,
        })
        .from(applications)
        .leftJoin(users, eq(applications.userId, users.id))
        .orderBy(desc(applications.createdAt));

    if (apps.length === 0) return NextResponse.json({ data: [] });

    const generalApps = apps.filter((a) => a.type === 'general');
    const mbbsApps    = apps.filter((a) => a.type === 'mbbs');

    const uniIds     = [...new Set(generalApps.map((a) => a.universityId))];
    const courseIds  = [...new Set(generalApps.map((a) => a.courseId).filter((id): id is string => id !== null))];
    const collegeIds = [...new Set(mbbsApps.map((a) => a.universityId))];

    type UniEntry    = { documentId: string; name: string; acronym?: string; location?: { country?: { name?: string } } };
    type CourseEntry = { documentId: string; courseName: string; courseLevel?: string; degreeName?: string };

    const fetches: Promise<UniEntry[] | CourseEntry[]>[] = [];
    if (uniIds.length > 0) {
        fetches.push(
            fetchCms<{ data: UniEntry[] }>('/api/universities', {
                fields:     ['documentId', 'name', 'acronym'],
                filters:    { documentId: { $in: uniIds } },
                populate:   { location: { populate: { country: { fields: ['name'] } } } },
                pagination: { pageSize: uniIds.length },
            }).then((d) => d.data ?? []),
        );
        fetches.push(
            fetchCms<{ data: CourseEntry[] }>('/api/courses', {
                fields:     ['documentId', 'courseName', 'courseLevel', 'degreeName'],
                filters:    { documentId: { $in: courseIds } },
                pagination: { pageSize: Math.max(courseIds.length, 1) },
            }).then((d) => d.data ?? []),
        );
    }
    if (collegeIds.length > 0) {
        fetches.push(
            fetchCms<{ data: UniEntry[] }>('/api/medical-colleges', {
                fields:     ['documentId', 'name', 'acronym'],
                filters:    { documentId: { $in: collegeIds } },
                populate:   { location: { populate: { country: { fields: ['name'] } } } },
                pagination: { pageSize: collegeIds.length },
            }).then((d) => d.data ?? []),
        );
    }

    const results = await Promise.all(fetches);

    let uniMap:     Record<string, UniEntry>    = {};
    let courseMap:  Record<string, CourseEntry> = {};
    let collegeMap: Record<string, UniEntry>    = {};

    let idx = 0;
    if (uniIds.length > 0) {
        uniMap    = Object.fromEntries((results[idx++] as UniEntry[]).map((u) => [u.documentId, u]));
        courseMap = Object.fromEntries((results[idx++] as CourseEntry[]).map((c) => [c.documentId, c]));
    }
    if (collegeIds.length > 0) {
        collegeMap = Object.fromEntries((results[idx] as UniEntry[]).map((u) => [u.documentId, u]));
    }

    const enriched = apps.map((app) => {
        if (app.type === 'mbbs') {
            const college = collegeMap[app.universityId];
            return {
                ...app,
                universityName:    college?.name                    ?? 'Unknown College',
                universityAcronym: college?.acronym                 ?? null,
                country:           college?.location?.country?.name ?? null,
                courseName:        null,
                courseLevel:       'MBBS',
                degreeName:        null,
            };
        }
        const uni    = uniMap[app.universityId];
        const course = courseMap[app.courseId ?? ''];
        return {
            ...app,
            universityName:    uni?.name                    ?? 'Unknown University',
            universityAcronym: uni?.acronym                 ?? null,
            country:           uni?.location?.country?.name ?? null,
            courseName:        course?.courseName            ?? 'Unknown Course',
            courseLevel:       course?.courseLevel           ?? null,
            degreeName:        course?.degreeName            ?? null,
        };
    });

    return NextResponse.json({ data: enriched });
}
