'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    HiOutlineChartBarSquare,
    HiOutlineClipboardDocumentList,
    HiOutlineChatBubbleLeftRight,
    HiOutlineUserCircle,
    HiOutlineUsers,
    HiOutlineXMark,
    HiOutlineSquares2X2,
    HiOutlineUserGroup,
    HiOutlineInboxArrowDown,
    HiOutlinePhone,
} from 'react-icons/hi2';

const BASE_NAV = [
    { href: '/dashboard',    label: 'Dashboard',    icon: HiOutlineChartBarSquare },
    { href: '/students',     label: 'Students',     icon: HiOutlineUsers },
    { href: '/applications', label: 'Applications', icon: HiOutlineClipboardDocumentList },
    { href: '/counselling',  label: 'Counselling',  icon: HiOutlineChatBubbleLeftRight },
    { href: '/contents',     label: 'Contents',     icon: HiOutlineSquares2X2 },
    { href: '/subscribers',   label: 'Subscribers',   icon: HiOutlineInboxArrowDown },
    { href: '/contact-info',  label: 'Contact Info',  icon: HiOutlinePhone },
];

const RESTRICTED_NAV = [
    { href: '/admins', label: 'Admins', icon: HiOutlineUserGroup },
];

const PROFILE_NAV = [
    { href: '/profile', label: 'Profile', icon: HiOutlineUserCircle },
];

interface AdminSidebarProps {
    mobileOpen?: boolean;
    onClose?:    () => void;
    adminRole?:  string;
}

export default function AdminSidebar({ mobileOpen = false, onClose, adminRole }: AdminSidebarProps) {
    const pathname  = usePathname();
    const canManageAdmins = adminRole === 'super' || adminRole === 'admin';
    const navItems = [...BASE_NAV, ...(canManageAdmins ? RESTRICTED_NAV : []), ...PROFILE_NAV];

    return (
        <>
            {mobileOpen && (
                <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" onClick={onClose} />
            )}

            <aside className={[
                'fixed top-0 left-0 z-50 flex h-full w-64 flex-col bg-slate-900 transition-transform duration-300 ease-in-out',
                'lg:static lg:translate-x-0',
                mobileOpen ? 'translate-x-0' : '-translate-x-full',
            ].join(' ')}>
                {/* Logo */}
                <div className="flex items-center justify-between border-b border-slate-700/60 px-6 py-5">
                    <Link href="/dashboard" className="flex items-center gap-2.5">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/img/mcp_pen_icon.svg" alt="MCP" className="h-8 w-auto shrink-0" />
                        <div>
                            <p className="text-sm font-semibold leading-none text-white">MCP Admin</p>
                            <p className="mt-0.5 text-[10px] text-slate-400">Control Panel</p>
                        </div>
                    </Link>
                    {onClose && (
                        <button onClick={onClose} className="rounded p-1 text-slate-400 hover:text-white lg:hidden">
                            <HiOutlineXMark className="h-5 w-5" />
                        </button>
                    )}
                </div>

                {/* Nav */}
                <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
                    <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500">Menu</p>
                    {navItems.map(({ href, label, icon: Icon }) => {
                        const active = pathname === href || pathname.startsWith(href + '/');
                        return (
                            <Link
                                key={href}
                                href={href}
                                onClick={onClose}
                                className={[
                                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                                    active
                                        ? 'bg-primary/25 text-white'
                                        : 'text-slate-400 hover:bg-white/10 hover:text-white',
                                ].join(' ')}
                            >
                                <Icon className="h-5 w-5 shrink-0" />
                                {label}
                                {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />}
                            </Link>
                        );
                    })}
                </nav>
            </aside>
        </>
    );
}
