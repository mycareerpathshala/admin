import { fetchCms } from '@/assets/utilities/fetchCms';
import { NextResponse } from 'next/server';

type CountRes = { meta: { pagination: { total: number } } };

export async function GET() {
    const [unis, courses, countries, blogs, mbbs] = await Promise.all([
        fetchCms<CountRes>('/api/universities',     { fields: ['id'], pagination: { page: 1, pageSize: 1 } }),
        fetchCms<CountRes>('/api/courses',           { fields: ['id'], pagination: { page: 1, pageSize: 1 } }),
        fetchCms<CountRes>('/api/countries',         { fields: ['id'], pagination: { page: 1, pageSize: 1 } }),
        fetchCms<CountRes>('/api/blogs',             { fields: ['id'], pagination: { page: 1, pageSize: 1 } }),
        fetchCms<CountRes>('/api/medical-colleges',  { fields: ['id'], pagination: { page: 1, pageSize: 1 } }),
    ]);

    return NextResponse.json({
        universities: unis.meta.pagination.total,
        courses:      courses.meta.pagination.total,
        countries:    countries.meta.pagination.total,
        blogs:        blogs.meta.pagination.total,
        mbbs:         mbbs.meta.pagination.total,
    });
}
