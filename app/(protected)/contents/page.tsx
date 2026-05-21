'use client';

import { useEffect, useState, useRef } from 'react';
import {
    HiOutlineAcademicCap,
    HiOutlineBookOpen,
    HiOutlineGlobeAlt,
    HiOutlineNewspaper,
    HiOutlineMagnifyingGlass,
    HiOutlineXMark,
    HiOutlineArrowTopRightOnSquare,
    HiOutlineChevronLeft,
    HiOutlineChevronRight,
    HiChevronDown,
    HiOutlineBeaker,
} from 'react-icons/hi2';

// ── Types ──────────────────────────────────────────────────────────────────────

type ContentType = 'universities' | 'courses' | 'countries' | 'blogs' | 'mbbs';

interface Stats {
    universities: number;
    courses:      number;
    countries:    number;
    blogs:        number;
    mbbs:         number;
}

interface Pagination {
    page:      number;
    pageSize:  number;
    pageCount: number;
    total:     number;
}

interface UniItem {
    documentId:  string;
    name:        string;
    acronym:     string | null;
    type:        string | null;
    est:         string | null;
}

interface CourseItem {
    documentId:     string;
    courseName:     string;
    courseLevel:    string | null;
    degreeName:     string;
    deliveryMethod: string | null;
}

interface CountryItem {
    documentId:     string;
    name:           string;
    countryCode:    string;
    capital:        string;
    nativeLanguage: string;
}

interface BlogItem {
    documentId:         string;
    blogTitle:          string;
    category:           string | null;
    authorName:         string | null;
    timeRequiredToRead: number | null;
}

interface MbbsItem {
    documentId:       string;
    name:             string;
    acronym:          string | null;
    totalTuitionFee:  number | null;
}

type AnyItem = UniItem | CourseItem | CountryItem | BlogItem | MbbsItem;

// ── Config ─────────────────────────────────────────────────────────────────────

const CMS_BASE = process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337';

const CMS_UID: Record<ContentType, string> = {
    universities: 'api::university.university',
    courses:      'api::course.course',
    countries:    'api::country.country',
    blogs:        'api::blog.blog',
    mbbs:         'api::medical-college.medical-college',
};

const TABS: { key: ContentType; label: string; icon: React.ElementType; color: string; bg: string; statKey: keyof Stats }[] = [
    { key: 'universities', label: 'Universities', icon: HiOutlineAcademicCap, color: 'text-blue-600',   bg: 'bg-blue-50',   statKey: 'universities' },
    { key: 'mbbs',         label: 'MBBS',         icon: HiOutlineBeaker,      color: 'text-rose-600',   bg: 'bg-rose-50',   statKey: 'mbbs' },
    { key: 'courses',      label: 'Courses',      icon: HiOutlineBookOpen,    color: 'text-violet-600', bg: 'bg-violet-50', statKey: 'courses' },
    { key: 'countries',    label: 'Countries',    icon: HiOutlineGlobeAlt,    color: 'text-emerald-600',bg: 'bg-emerald-50',statKey: 'countries' },
    { key: 'blogs',        label: 'Blogs',        icon: HiOutlineNewspaper,   color: 'text-orange-600', bg: 'bg-orange-50', statKey: 'blogs' },
];

const PAGE_SIZE_OPTIONS = [10, 20, 50];

// ── Sub-components ─────────────────────────────────────────────────────────────

function StatCard({ label, value, icon: Icon, color, bg, loading }: {
    label: string; value: number; icon: React.ElementType;
    color: string; bg: string; loading: boolean;
}) {
    return (
        <div className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${bg}`}>
                <Icon className={`h-6 w-6 ${color}`} />
            </div>
            <div>
                {loading
                    ? <div className="h-6 w-12 animate-pulse rounded bg-slate-100" />
                    : <p className="text-2xl font-bold text-slate-800">{value.toLocaleString()}</p>
                }
                <p className="text-xs text-slate-400">{label}</p>
            </div>
        </div>
    );
}

function PageSizeSelect({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handler(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none transition hover:border-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
                <span>{value} / page</span>
                <HiChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
                <div className="absolute right-0 z-10 mt-1.5 w-32 overflow-hidden rounded-xl border border-slate-100 bg-white py-1 shadow-lg">
                    {PAGE_SIZE_OPTIONS.map((n) => (
                        <button
                            key={n}
                            type="button"
                            onClick={() => { onChange(n); setOpen(false); }}
                            className={`flex w-full items-center justify-between px-3 py-2 text-sm transition hover:bg-slate-50 ${value === n ? 'font-semibold text-primary' : 'text-slate-600'}`}
                        >
                            {n} per page
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

function SkeletonRow({ cols }: { cols: number }) {
    return (
        <tr className="animate-pulse border-b border-slate-50">
            {Array.from({ length: cols }).map((_, i) => (
                <td key={i} className="px-4 py-4">
                    <div className="h-4 rounded bg-slate-100" style={{ width: `${60 + (i * 17) % 30}%` }} />
                </td>
            ))}
        </tr>
    );
}

function EditButton({ documentId, type }: { documentId: string; type: ContentType }) {
    const url = `${CMS_BASE}/admin/content-manager/collection-types/${CMS_UID[type]}/${documentId}`;
    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
        >
            <HiOutlineArrowTopRightOnSquare className="h-3.5 w-3.5" />
            Edit in CMS
        </a>
    );
}

// ── Table renderers per type ───────────────────────────────────────────────────

function UniversitiesTable({ items, type }: { items: UniItem[]; type: ContentType }) {
    return (
        <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50">
                <tr>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Name</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Acronym</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Type</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Est.</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Actions</th>
                </tr>
            </thead>
            <tbody>
                {items.map((u) => (
                    <tr key={u.documentId} className="border-b border-slate-50 transition hover:bg-slate-50/60">
                        <td className="px-4 py-3 font-medium text-slate-800">{u.name}</td>
                        <td className="px-4 py-3 text-slate-500">{u.acronym ?? '—'}</td>
                        <td className="px-4 py-3">
                            {u.type ? (
                                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-medium text-blue-600">{u.type}</span>
                            ) : '—'}
                        </td>
                        <td className="px-4 py-3 text-slate-500">{u.est ? new Date(u.est).getFullYear() : '—'}</td>
                        <td className="px-4 py-3"><EditButton documentId={u.documentId} type={type} /></td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

function CoursesTable({ items, type }: { items: CourseItem[]; type: ContentType }) {
    return (
        <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50">
                <tr>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Course Name</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Level</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Degree</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Delivery</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Actions</th>
                </tr>
            </thead>
            <tbody>
                {items.map((c) => (
                    <tr key={c.documentId} className="border-b border-slate-50 transition hover:bg-slate-50/60">
                        <td className="px-4 py-3 font-medium text-slate-800">{c.courseName}</td>
                        <td className="px-4 py-3">
                            {c.courseLevel ? (
                                <span className="rounded-full bg-violet-50 px-2.5 py-0.5 text-[11px] font-medium text-violet-600">{c.courseLevel}</span>
                            ) : '—'}
                        </td>
                        <td className="px-4 py-3 text-slate-500">{c.degreeName}</td>
                        <td className="px-4 py-3">
                            {c.deliveryMethod ? (
                                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">{c.deliveryMethod}</span>
                            ) : '—'}
                        </td>
                        <td className="px-4 py-3"><EditButton documentId={c.documentId} type={type} /></td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

function CountriesTable({ items, type }: { items: CountryItem[]; type: ContentType }) {
    return (
        <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50">
                <tr>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Country</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Code</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Capital</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Language</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Actions</th>
                </tr>
            </thead>
            <tbody>
                {items.map((c) => (
                    <tr key={c.documentId} className="border-b border-slate-50 transition hover:bg-slate-50/60">
                        <td className="px-4 py-3 font-medium text-slate-800">{c.name}</td>
                        <td className="px-4 py-3">
                            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600">{c.countryCode}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-500">{c.capital}</td>
                        <td className="px-4 py-3 text-slate-500">{c.nativeLanguage}</td>
                        <td className="px-4 py-3"><EditButton documentId={c.documentId} type={type} /></td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

function MbbsTable({ items, type }: { items: MbbsItem[]; type: ContentType }) {
    return (
        <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50">
                <tr>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Name</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Acronym</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Total Tuition Fee</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Actions</th>
                </tr>
            </thead>
            <tbody>
                {items.map((m) => (
                    <tr key={m.documentId} className="border-b border-slate-50 transition hover:bg-slate-50/60">
                        <td className="px-4 py-3 font-medium text-slate-800">{m.name}</td>
                        <td className="px-4 py-3 text-slate-500">{m.acronym ?? '—'}</td>
                        <td className="px-4 py-3">
                            {m.totalTuitionFee != null ? (
                                <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-medium text-rose-600">
                                    ${m.totalTuitionFee.toLocaleString()}
                                </span>
                            ) : '—'}
                        </td>
                        <td className="px-4 py-3"><EditButton documentId={m.documentId} type={type} /></td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

function BlogsTable({ items, type }: { items: BlogItem[]; type: ContentType }) {
    return (
        <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50">
                <tr>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Title</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Category</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Author</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Read Time</th>
                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Actions</th>
                </tr>
            </thead>
            <tbody>
                {items.map((b) => (
                    <tr key={b.documentId} className="border-b border-slate-50 transition hover:bg-slate-50/60">
                        <td className="max-w-xs px-4 py-3 font-medium text-slate-800">
                            <p className="truncate">{b.blogTitle}</p>
                        </td>
                        <td className="px-4 py-3">
                            {b.category ? (
                                <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-[11px] font-medium text-orange-600">{b.category}</span>
                            ) : '—'}
                        </td>
                        <td className="px-4 py-3 text-slate-500">{b.authorName ?? '—'}</td>
                        <td className="px-4 py-3 text-slate-500">
                            {b.timeRequiredToRead != null ? `${b.timeRequiredToRead} min` : '—'}
                        </td>
                        <td className="px-4 py-3"><EditButton documentId={b.documentId} type={type} /></td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function ContentsPage() {
    const [stats, setStats]               = useState<Stats | null>(null);
    const [statsLoading, setStatsLoading] = useState(true);

    const [activeTab, setActiveTab] = useState<ContentType>('universities');
    const [items, setItems]         = useState<AnyItem[]>([]);
    const [pagination, setPagination] = useState<Pagination>({ page: 1, pageSize: 20, pageCount: 1, total: 0 });
    const [loading, setLoading]     = useState(true);

    const [search, setSearch]         = useState('');
    const [liveSearch, setLiveSearch] = useState('');
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ── Fetch stats once ────────────────────────────────────────────────────────
    useEffect(() => {
        fetch('/api/contents/stats')
            .then((r) => r.json())
            .then(setStats)
            .finally(() => setStatsLoading(false));
    }, []);

    // ── Fetch content on tab / page / pageSize / search change ─────────────────
    // All setState calls are inside the async .then() — no synchronous setState
    // in the effect body, which avoids cascading renders.
    useEffect(() => {
        let active = true;
        const params = new URLSearchParams({
            type: activeTab,
            page: String(pagination.page),
            pageSize: String(pagination.pageSize),
        });
        if (search) params.set('search', search);

        fetch(`/api/contents?${params}`)
            .then((r) => r.json())
            .then((d) => {
                if (!active) return;
                setItems(d.data ?? []);
                setPagination(d.meta?.pagination ?? {
                    page: pagination.page,
                    pageSize: pagination.pageSize,
                    pageCount: 1,
                    total: 0,
                });
                setLoading(false);
            })
            .catch(() => { if (active) setLoading(false); });

        return () => { active = false; };
    }, [activeTab, pagination.page, pagination.pageSize, search]);

    // ── Debounce live search input → search state ───────────────────────────────
    // setLoading(true) is called in event handlers so it appears immediately
    // without needing a synchronous setState inside the effect.
    function handleSearchInput(value: string) {
        setLiveSearch(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setLoading(true);
            setSearch(value);
            setPagination((p) => ({ ...p, page: 1 }));
        }, 400);
    }

    function clearSearch() {
        setLoading(true);
        setLiveSearch('');
        setSearch('');
        setPagination((p) => ({ ...p, page: 1 }));
    }

    function handleTabChange(tab: ContentType) {
        setLoading(true);
        setActiveTab(tab);
        setSearch('');
        setLiveSearch('');
        setPagination({ page: 1, pageSize: pagination.pageSize, pageCount: 1, total: 0 });
    }

    function handlePageSizeChange(ps: number) {
        setLoading(true);
        setPagination((p) => ({ ...p, pageSize: ps, page: 1 }));
    }

    function handlePrevPage() {
        setLoading(true);
        setPagination((p) => ({ ...p, page: Math.max(1, p.page - 1) }));
    }

    function handleNextPage() {
        setLoading(true);
        setPagination((p) => ({ ...p, page: Math.min(p.pageCount, p.page + 1) }));
    }

    const colCount = 5;

    return (
        <div className="mx-auto max-w-6xl space-y-6">
            {/* Page header */}
            <div>
                <h2 className="text-lg font-semibold text-slate-800">CMS Contents</h2>
                <p className="text-sm text-slate-400">Browse and manage all content entries in the CMS</p>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
                {TABS.map(({ key, label, icon, color, bg }) => (
                    <StatCard
                        key={key}
                        label={label}
                        value={stats?.[key] ?? 0}
                        icon={icon}
                        color={color}
                        bg={bg}
                        loading={statsLoading}
                    />
                ))}
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2">
                {TABS.map(({ key, label, icon: Icon, color, bg }) => (
                    <button
                        key={key}
                        onClick={() => handleTabChange(key)}
                        className={[
                            'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition',
                            activeTab === key
                                ? 'bg-primary text-white shadow-sm'
                                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 hover:text-slate-800',
                        ].join(' ')}
                    >
                        <Icon className={`h-4 w-4 ${activeTab === key ? 'text-white' : color}`} />
                        {label}
                        {stats && (
                            <span className={[
                                'rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                                activeTab === key ? `${bg} text-slate-700` : 'bg-slate-100 text-slate-500',
                            ].join(' ')}>
                                {stats[key].toLocaleString()}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Table card */}
            <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
                {/* Toolbar */}
                <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative w-full sm:w-72">
                        <HiOutlineMagnifyingGlass className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={liveSearch}
                            onChange={(e) => handleSearchInput(e.target.value)}
                            placeholder={`Search ${activeTab}…`}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pr-8 pl-10 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                        />
                        {liveSearch && (
                            <button
                                onClick={clearSearch}
                                className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                <HiOutlineXMark className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <p className="text-xs text-slate-400">
                            {loading ? 'Loading…' : `${pagination.total.toLocaleString()} item${pagination.total !== 1 ? 's' : ''}`}
                        </p>
                        <PageSizeSelect value={pagination.pageSize} onChange={handlePageSizeChange} />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    {loading ? (
                        <table className="w-full text-left text-sm">
                            <tbody>
                                {Array.from({ length: pagination.pageSize > 10 ? 8 : pagination.pageSize }).map((_, i) => (
                                    <SkeletonRow key={i} cols={colCount} />
                                ))}
                            </tbody>
                        </table>
                    ) : items.length === 0 ? (
                        <div className="flex flex-col items-center gap-3 py-16 text-slate-400">
                            <HiOutlineMagnifyingGlass className="h-10 w-10" />
                            <p className="text-sm font-medium">No results found</p>
                            {liveSearch && <p className="text-xs">Try a different search term.</p>}
                        </div>
                    ) : activeTab === 'universities' ? (
                        <UniversitiesTable items={items as UniItem[]} type={activeTab} />
                    ) : activeTab === 'courses' ? (
                        <CoursesTable items={items as CourseItem[]} type={activeTab} />
                    ) : activeTab === 'countries' ? (
                        <CountriesTable items={items as CountryItem[]} type={activeTab} />
                    ) : activeTab === 'mbbs' ? (
                        <MbbsTable items={items as MbbsItem[]} type={activeTab} />
                    ) : (
                        <BlogsTable items={items as BlogItem[]} type={activeTab} />
                    )}
                </div>

                {/* Pagination */}
                {!loading && pagination.pageCount > 1 && (
                    <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
                        <p className="text-xs text-slate-400">
                            Showing{' '}
                            {((pagination.page - 1) * pagination.pageSize + 1).toLocaleString()}–
                            {Math.min(pagination.page * pagination.pageSize, pagination.total).toLocaleString()}
                            {' '}of {pagination.total.toLocaleString()}
                        </p>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={handlePrevPage}
                                disabled={pagination.page === 1}
                                className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 disabled:opacity-40"
                            >
                                <HiOutlineChevronLeft className="h-4 w-4" />
                            </button>
                            <span className="min-w-14 text-center text-xs font-medium text-slate-600">
                                {pagination.page} / {pagination.pageCount}
                            </span>
                            <button
                                onClick={handleNextPage}
                                disabled={pagination.page === pagination.pageCount}
                                className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 disabled:opacity-40"
                            >
                                <HiOutlineChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
