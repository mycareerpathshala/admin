import { fetchCms } from '@/assets/utilities/fetchCms';
import { NextRequest, NextResponse } from 'next/server';

const TYPE_CONFIG = {
    universities: {
        path:         '/api/universities',
        fields:       ['documentId', 'name', 'acronym', 'type', 'est'],
        sortField:    'name',
        searchField:  'name',
    },
    courses: {
        path:         '/api/courses',
        fields:       ['documentId', 'courseName', 'courseLevel', 'degreeName', 'deliveryMethod'],
        sortField:    'courseName',
        searchField:  'courseName',
    },
    countries: {
        path:         '/api/countries',
        fields:       ['documentId', 'name', 'countryCode', 'capital', 'nativeLanguage'],
        sortField:    'name',
        searchField:  'name',
    },
    blogs: {
        path:         '/api/blogs',
        fields:       ['documentId', 'blogTitle', 'category', 'authorName', 'timeRequiredToRead'],
        sortField:    'blogTitle',
        searchField:  'blogTitle',
    },
    mbbs: {
        path:         '/api/medical-colleges',
        fields:       ['documentId', 'name', 'acronym', 'totalTuitionFee'],
        sortField:    'name',
        searchField:  'name',
    },
} as const;

type ContentType = keyof typeof TYPE_CONFIG;

export async function GET(request: NextRequest) {
    const { searchParams } = request.nextUrl;
    const type     = (searchParams.get('type') ?? 'universities') as ContentType;
    const page     = Math.max(1, parseInt(searchParams.get('page')     ?? '1',  10));
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') ?? '20', 10)));
    const search   = searchParams.get('search') ?? '';

    if (!TYPE_CONFIG[type]) {
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    const cfg = TYPE_CONFIG[type];
    const query: Record<string, unknown> = {
        fields:     cfg.fields,
        sort:       [`${cfg.sortField}:asc`],
        pagination: { page, pageSize },
    };

    if (search.trim()) {
        query.filters = { [cfg.searchField]: { $containsi: search.trim() } };
    }

    const data = await fetchCms(cfg.path, query);
    return NextResponse.json(data);
}
