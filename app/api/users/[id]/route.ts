import { getSession } from '@/assets/lib/auth/session';
import { db } from '@/assets/lib/database/db';
import { applications, counsellings, preferences, users } from '@/assets/lib/database/schema';
import { fetchCms } from '@/assets/utilities/fetchCms';
import { desc, eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    const [student] = await db
        .select({
            id:             users.id,
            firstName:      users.firstName,
            lastName:       users.lastName,
            email:          users.email,
            avatar:         users.avatar,
            phone:          users.phone,
            dateOfBirth:    users.dateOfBirth,
            gender:         users.gender,
            country:        users.country,
            secondaryEmail: users.secondaryEmail,
            isVerified:     users.isVerified,
            createdAt:      users.createdAt,
            updatedAt:      users.updatedAt,
        })
        .from(users)
        .where(eq(users.id, id))
        .limit(1);

    if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 });

    const [apps, counsellingRows, preferenceRows] = await Promise.all([
        db.select({
            id:           applications.id,
            universityId: applications.universityId,
            courseId:     applications.courseId,
            status:       applications.status,
            notes:        applications.notes,
            createdAt:    applications.createdAt,
        }).from(applications).where(eq(applications.userId, id)).orderBy(desc(applications.createdAt)),

        db.select({
            id:                  counsellings.id,
            name:                counsellings.name,
            email:               counsellings.email,
            phone:               counsellings.phone,
            studyLevel:          counsellings.studyLevel,
            message:             counsellings.message,
            status:              counsellings.status,
            scheduledTime:       counsellings.scheduledTime,
            meetingLink:         counsellings.meetingLink,
            preferredDays:       counsellings.preferredDays,
            preferredTimeRanges: counsellings.preferredTimeRanges,
            createdAt:           counsellings.createdAt,
        }).from(counsellings).where(eq(counsellings.userId, id)).orderBy(desc(counsellings.createdAt)),

        db.select({
            id:                   preferences.id,
            name:                 preferences.name,
            countryFilter:        preferences.countryFilter,
            countryName:          preferences.countryName,
            streamFilter:         preferences.streamFilter,
            streamName:           preferences.streamName,
            levelFilter:          preferences.levelFilter,
            deliveryMethodFilter: preferences.deliveryMethodFilter,
            studyLanguageFilter:  preferences.studyLanguageFilter,
            courseOfferingFilter: preferences.courseOfferingFilter,
            createdAt:            preferences.createdAt,
        }).from(preferences).where(eq(preferences.userId, id)).orderBy(desc(preferences.createdAt)),
    ]);

    // Enrich applications with CMS data (university name, country, course name/level)
    let enrichedApps: (typeof apps[0] & {
        universityName: string;
        universityCountry: string | null;
        courseName: string;
        courseLevel: string | null;
    })[] = [];

    if (apps.length > 0) {
        const uniIds    = [...new Set(apps.map((a) => a.universityId).filter(Boolean))];
        const courseIds = [...new Set(apps.map((a) => a.courseId).filter((v): v is string => !!v))];

        type UniEntry    = { documentId: string; name: string; location?: { country?: { name?: string } } };
        type CourseEntry = { documentId: string; courseName: string; courseLevel?: string };

        const [uniData, courseData] = await Promise.all([
            uniIds.length
                ? fetchCms<{ data: UniEntry[] }>('/api/universities', {
                    fields: ['documentId', 'name'],
                    filters: { documentId: { $in: uniIds } },
                    populate: { location: { populate: { country: { fields: ['name'] } } } },
                    pagination: { pageSize: uniIds.length },
                }).then((d) => d.data ?? [])
                : Promise.resolve([] as UniEntry[]),

            courseIds.length
                ? fetchCms<{ data: CourseEntry[] }>('/api/courses', {
                    fields: ['documentId', 'courseName', 'courseLevel'],
                    filters: { documentId: { $in: courseIds } },
                    pagination: { pageSize: courseIds.length },
                }).then((d) => d.data ?? [])
                : Promise.resolve([] as CourseEntry[]),
        ]);

        const uniMap    = Object.fromEntries(uniData.map((u) => [u.documentId, u]));
        const courseMap = Object.fromEntries(courseData.map((c) => [c.documentId, c]));

        enrichedApps = apps.map((a) => {
            const uni    = a.universityId ? uniMap[a.universityId] : null;
            const course = a.courseId     ? courseMap[a.courseId]  : null;
            return {
                ...a,
                universityName:    uni?.name                    ?? 'Unknown University',
                universityCountry: uni?.location?.country?.name ?? null,
                courseName:        course?.courseName            ?? (a.courseId ? 'Unknown Course' : 'MBBS'),
                courseLevel:       course?.courseLevel            ?? null,
            };
        });
    }

    return NextResponse.json({
        data: {
            ...student,
            applications:        enrichedApps,
            counsellingRequests: counsellingRows,
            preferences:         preferenceRows,
        },
    });
}
