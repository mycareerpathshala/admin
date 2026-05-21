import qs from 'qs';

const CMS_BASE  = process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337';
const CMS_TOKEN = process.env.STRAPI_API_TOKEN       ?? '';

export async function fetchCms<T = unknown>(path: string, query: Record<string, unknown>): Promise<T> {
    const queryString = qs.stringify(query, { encodeValuesOnly: true });
    const res = await fetch(`${CMS_BASE}${path}?${queryString}`, {
        headers: {
            Authorization:  `Bearer ${CMS_TOKEN}`,
            'Content-Type': 'application/json',
        },
        cache: 'no-store',
    });
    if (!res.ok) throw new Error(`CMS fetch failed: ${res.status} ${path}`);
    return res.json() as Promise<T>;
}
