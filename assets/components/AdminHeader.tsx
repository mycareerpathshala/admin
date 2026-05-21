'use client';

import { useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    HiOutlineBars3,
    HiOutlineChartBarSquare,
    HiOutlineClipboardDocumentList,
    HiOutlineChatBubbleLeftRight,
    HiOutlineUserCircle,
    HiOutlineUsers,
    HiOutlineArrowRightOnRectangle,
    HiOutlineShieldCheck,
} from 'react-icons/hi2';
import { resolveAvatar } from '@/assets/utilities/resolveAvatar';

// ── Page meta ─────────────────────────────────────────────────────────────────

const PAGE_META: Record<string, { title: string; icon: React.ElementType; description: string }> = {
    '/dashboard':    { title: 'Dashboard',            icon: HiOutlineChartBarSquare,        description: 'Overview of your platform activity' },
    '/students':     { title: 'Students',             icon: HiOutlineUsers,                 description: 'Browse and view registered student profiles' },
    '/applications': { title: 'Applications',         icon: HiOutlineClipboardDocumentList, description: 'Manage student university applications' },
    '/counselling':  { title: 'Counselling Requests', icon: HiOutlineChatBubbleLeftRight,   description: 'Review and schedule counselling sessions' },
    '/profile':      { title: 'Admin Profile',        icon: HiOutlineUserCircle,            description: 'Manage your admin account details' },
};

function resolvePageMeta(pathname: string) {
    if (PAGE_META[pathname]) return PAGE_META[pathname];
    const prefix = Object.keys(PAGE_META).find((k) => pathname.startsWith(k + '/'));
    return prefix ? PAGE_META[prefix] : PAGE_META['/dashboard'];
}

const ROLE_LABELS: Record<string, string> = {
    super:      'Super Admin',
    admin:      'Admin',
    editor:     'Editor',
    counsellor: 'Counsellor',
};

// ── AdminHeader ───────────────────────────────────────────────────────────────

interface AdminHeaderProps {
    onMenuClick: () => void;
    adminName:   string;
    adminEmail:  string;
    adminRole:   string;
    adminAvatar: string;
}

export default function AdminHeader({ onMenuClick, adminName, adminEmail, adminRole, adminAvatar }: AdminHeaderProps) {
    const pathname = usePathname();
    const router   = useRouter();
    const [open, setOpen] = useState(false);

    const meta = resolvePageMeta(pathname);
    const Icon = meta.icon;

    async function handleLogout() {
        setOpen(false);
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
    }

    return (
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur-md">
            {/* Left: hamburger + page title */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
                >
                    <HiOutlineBars3 className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                        <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-base font-semibold text-slate-800">{meta.title}</h1>
                        <p className="text-xs text-slate-400">{meta.description}</p>
                    </div>
                </div>
            </div>

            {/* Right: notification bell + avatar */}
            <div className="flex items-center gap-3">

                <div className="relative">
                    <button
                        onClick={() => setOpen((v) => !v)}
                        className="flex cursor-pointer items-center gap-2.5 rounded-full bg-primary py-1.5 pr-3.5 pl-2 shadow-md transition-all duration-150 select-none hover:bg-primary-dark active:scale-95"
                    >
                        <span className="h-6 w-6 shrink-0 overflow-hidden rounded-full ring-1 ring-white/40">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={resolveAvatar(adminAvatar)}
                                alt={adminName}
                                className="h-full w-full object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).src = '/img/profile/images/admin_default.png'; }}
                            />
                        </span>
                        <span className="hidden text-sm font-semibold text-white sm:block">
                            {adminName}
                        </span>
                    </button>

                    {open && (
                        <>
                            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                            <div className="absolute top-full right-0 z-50 mt-2.5 w-72 overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/10">
                                <div className="relative overflow-hidden bg-linear-to-br from-slate-900 to-slate-700 px-5 py-4">
                                    <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-white/10" />
                                    <div className="absolute -bottom-8 -left-4 h-20 w-20 rounded-full bg-white/8" />
                                    <div className="relative flex items-center gap-3">
                                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full ring-2 ring-white/40">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={resolveAvatar(adminAvatar)}
                                                alt={adminName}
                                                className="h-full w-full object-cover"
                                                onError={(e) => { (e.target as HTMLImageElement).src = '/img/profile/images/admin_default.png'; }}
                                            />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-bold text-white">{adminName}</p>
                                            <p className="truncate text-xs text-slate-300">{adminEmail}</p>
                                        </div>
                                    </div>
                                    <div className="relative mt-3">
                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/30 px-2.5 py-0.5 text-[10px] font-semibold text-primary-light">
                                            <HiOutlineShieldCheck className="h-3 w-3" />
                                            {ROLE_LABELS[adminRole] ?? adminRole}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-2">
                                    <Link
                                        href="/dashboard"
                                        onClick={() => setOpen(false)}
                                        className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
                                    >
                                        <HiOutlineChartBarSquare className="h-4.5 w-4.5 shrink-0 text-slate-400" />
                                        Dashboard
                                    </Link>
                                    <Link
                                        href="/profile"
                                        onClick={() => setOpen(false)}
                                        className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 hover:text-slate-900"
                                    >
                                        <HiOutlineUserCircle className="h-4.5 w-4.5 shrink-0 text-slate-400" />
                                        Profile
                                    </Link>

                                    <div className="my-1.5 h-px bg-slate-100" />

                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
                                    >
                                        <HiOutlineArrowRightOnRectangle className="h-4.5 w-4.5 shrink-0" />
                                        Log out
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
