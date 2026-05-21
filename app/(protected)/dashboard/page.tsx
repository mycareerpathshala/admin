'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    HiOutlineUsers,
    HiOutlineClipboardDocumentList,
    HiOutlineChatBubbleLeftRight,
    HiOutlineClock,
    HiOutlineCalendarDays,
    HiOutlineArrowRight,
} from 'react-icons/hi2';

interface Stats {
    totalUsers: number;
    totalApplications: number;
    totalCounselling: number;
    pendingCounselling: number;
    scheduledCounselling: number;
}

const STAT_CARDS = (s: Stats) => [
    {
        label:    'Total Students',
        value:    s.totalUsers,
        icon:     HiOutlineUsers,
        color:    'blue',
        href:     null,
    },
    {
        label:    'Applications',
        value:    s.totalApplications,
        icon:     HiOutlineClipboardDocumentList,
        color:    'violet',
        href:     '/applications',
    },
    {
        label:    'Counselling Requests',
        value:    s.totalCounselling,
        icon:     HiOutlineChatBubbleLeftRight,
        color:    'emerald',
        href:     '/counselling',
    },
    {
        label:    'Pending Sessions',
        value:    s.pendingCounselling,
        icon:     HiOutlineClock,
        color:    'amber',
        href:     '/counselling',
    },
    {
        label:    'Scheduled Sessions',
        value:    s.scheduledCounselling,
        icon:     HiOutlineCalendarDays,
        color:    'sky',
        href:     '/counselling',
    },
];

const COLOR_MAP: Record<string, { bg: string; icon: string; pill: string }> = {
    blue:    { bg: 'bg-blue-50',    icon: 'text-blue-500',    pill: 'bg-blue-100 text-blue-600' },
    violet:  { bg: 'bg-violet-50',  icon: 'text-violet-500',  pill: 'bg-violet-100 text-violet-600' },
    emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-500', pill: 'bg-emerald-100 text-emerald-600' },
    amber:   { bg: 'bg-amber-50',   icon: 'text-amber-500',   pill: 'bg-amber-100 text-amber-600' },
    sky:     { bg: 'bg-sky-50',     icon: 'text-sky-500',     pill: 'bg-sky-100 text-sky-600' },
};

function StatCardSkeleton() {
    return (
        <div className="animate-pulse rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <div className="flex items-start justify-between">
                <div className="h-10 w-10 rounded-xl bg-slate-100" />
                <div className="h-5 w-16 rounded-full bg-slate-100" />
            </div>
            <div className="mt-4 h-8 w-20 rounded bg-slate-100" />
            <div className="mt-2 h-4 w-28 rounded bg-slate-100" />
        </div>
    );
}

export default function AdminDashboardPage() {
    const [stats, setStats]     = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/stats')
            .then((r) => r.json())
            .then((d) => setStats(d.data ?? null))
            .finally(() => setLoading(false));
    }, []);

    const cards = stats ? STAT_CARDS(stats) : [];

    return (
        <div className="mx-auto max-w-6xl space-y-8">
            {/* Welcome banner */}
            <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-slate-900 to-slate-800 p-8 text-white">
                <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-primary/20 blur-2xl" />
                <div className="absolute -bottom-10 right-32 h-32 w-32 rounded-full bg-indigo-500/20 blur-2xl" />
                <div className="relative z-10">
                    <p className="text-xs font-medium uppercase tracking-widest text-slate-400">Overview</p>
                    <h2 className="mt-1 text-2xl font-bold">Platform Dashboard</h2>
                    <p className="mt-2 max-w-md text-sm text-slate-400">
                        Monitor student applications, counselling requests, and overall platform activity from one place.
                    </p>
                    <div className="mt-5 flex gap-3">
                        <Link
                            href="/applications"
                            className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold transition hover:bg-primary-dark"
                        >
                            View Applications <HiOutlineArrowRight className="h-3.5 w-3.5" />
                        </Link>
                        <Link
                            href="/counselling"
                            className="flex items-center gap-1.5 rounded-lg bg-white/10 px-4 py-2 text-xs font-semibold transition hover:bg-white/20"
                        >
                            View Counselling <HiOutlineArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Stats grid */}
            <div>
                <h3 className="mb-4 text-sm font-semibold text-slate-500 uppercase tracking-wide">Platform Stats</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {loading
                        ? Array.from({ length: 5 }).map((_, i) => <StatCardSkeleton key={i} />)
                        : cards.map(({ label, value, icon: Icon, color, href }) => {
                            const c = COLOR_MAP[color];
                            const inner = (
                                <div className={`rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100 transition ${href ? 'hover:shadow-md hover:ring-slate-200' : ''}`}>
                                    <div className="flex items-start justify-between">
                                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${c.bg}`}>
                                            <Icon className={`h-5 w-5 ${c.icon}`} />
                                        </div>
                                        {href && (
                                            <span className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${c.pill}`}>
                                                View <HiOutlineArrowRight className="h-2.5 w-2.5" />
                                            </span>
                                        )}
                                    </div>
                                    <p className="mt-4 text-3xl font-bold text-slate-800">{value.toLocaleString()}</p>
                                    <p className="mt-1 text-sm text-slate-500">{label}</p>
                                </div>
                            );
                            return href
                                ? <Link key={label} href={href}>{inner}</Link>
                                : <div key={label}>{inner}</div>;
                        })
                    }
                </div>
            </div>

            {/* Quick links */}
            <div>
                <h3 className="mb-4 text-sm font-semibold text-slate-500 uppercase tracking-wide">Quick Actions</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Link
                        href="/counselling"
                        className="group flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 transition hover:shadow-md hover:ring-primary/30"
                    >
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
                                <HiOutlineChatBubbleLeftRight className="h-6 w-6 text-emerald-500" />
                            </div>
                            <div>
                                <p className="font-semibold text-slate-800">Pending Counselling</p>
                                <p className="text-sm text-slate-400">
                                    {loading ? '…' : `${stats?.pendingCounselling ?? 0} requests awaiting assignment`}
                                </p>
                            </div>
                        </div>
                        <HiOutlineArrowRight className="h-5 w-5 text-slate-300 transition group-hover:text-primary" />
                    </Link>
                    <Link
                        href="/applications"
                        className="group flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 transition hover:shadow-md hover:ring-primary/30"
                    >
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50">
                                <HiOutlineClipboardDocumentList className="h-6 w-6 text-violet-500" />
                            </div>
                            <div>
                                <p className="font-semibold text-slate-800">All Applications</p>
                                <p className="text-sm text-slate-400">
                                    {loading ? '…' : `${stats?.totalApplications ?? 0} total submissions`}
                                </p>
                            </div>
                        </div>
                        <HiOutlineArrowRight className="h-5 w-5 text-slate-300 transition group-hover:text-primary" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
