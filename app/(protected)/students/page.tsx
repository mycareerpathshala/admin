'use client';

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
    HiOutlineMagnifyingGlass,
    HiOutlineXMark,
    HiOutlineUsers,
    HiOutlineEnvelope,
    HiOutlinePhone,
    HiOutlineGlobeAlt,
    HiOutlineCalendarDays,
    HiOutlineShieldCheck,
    HiOutlineUser,
    HiOutlineChevronLeft,
    HiOutlineChevronRight,
    HiOutlineClock,
    HiOutlineIdentification,
} from 'react-icons/hi2';

interface Student {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar: string;
    phone: string | null;
    country: string | null;
    gender: string | null;
    isVerified: boolean;
    createdAt: string;
}

const PAGE_SIZE = 12;

function ProfileModal({ student, onClose }: { student: Student; onClose: () => void }) {
    const fullName = `${student.firstName} ${student.lastName}`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Card */}
            <div className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 rounded-full bg-white/10 p-1.5 text-white backdrop-blur-sm transition hover:bg-white/20"
                >
                    <HiOutlineXMark className="h-4 w-4" />
                </button>

                {/* Banner */}
                <div className="relative bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 px-6 pt-10 pb-20 text-center">
                    <div
                        className="absolute inset-0"
                        style={{ backgroundImage: 'radial-gradient(circle at 15% 50%, #005fe230 0%, transparent 55%), radial-gradient(circle at 85% 20%, #6366f130 0%, transparent 55%)' }}
                    />
                    {/* Decorative dots */}
                    <div className="absolute bottom-0 left-0 right-0 h-8 opacity-10"
                        style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '16px 16px' }}
                    />
                    <div className="relative z-10 flex flex-col items-center gap-3">
                        <div className="relative h-24 w-24 overflow-hidden rounded-full ring-4 ring-white/25 shadow-xl">
                            <Image
                                src={`/img/auth/avatars/${student.avatar}`}
                                alt={fullName}
                                fill
                                className="object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).src = '/img/auth/avatars/avatar_01.png'; }}
                            />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">{fullName}</h3>
                            <p className="mt-0.5 text-sm text-slate-300">{student.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="rounded-full bg-primary/25 px-3 py-1 text-xs font-semibold text-primary-light">
                                Student
                            </span>
                            {student.isVerified
                                ? <span className="flex items-center gap-1 rounded-full bg-emerald-500/25 px-3 py-1 text-xs font-semibold text-emerald-300">
                                    <HiOutlineShieldCheck className="h-3 w-3" /> Verified
                                  </span>
                                : <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-400">
                                    Unverified
                                  </span>
                            }
                        </div>
                    </div>
                </div>

                {/* Info grid — floats up over the banner; z-20 ensures it paints above the banner's z-10 stacking context */}
                <div className="relative z-20 -mt-10 mx-5 rounded-2xl bg-white p-5 shadow-lg ring-1 ring-slate-100">
                    <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Basic Information</p>
                    <div className="grid grid-cols-2 gap-2">
                        <InfoRow icon={HiOutlineEnvelope}       label="Email"   value={student.email}        span />
                        <InfoRow icon={HiOutlinePhone}          label="Phone"   value={student.phone} />
                        <InfoRow icon={HiOutlineGlobeAlt}       label="Country" value={student.country} />
                        <InfoRow icon={HiOutlineUser}           label="Gender"  value={student.gender ? student.gender.charAt(0).toUpperCase() + student.gender.slice(1).replace(/-/g, ' ') : null} />
                        <InfoRow icon={HiOutlineClock}          label="Joined"  value={new Date(student.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} />
                        <InfoRow icon={HiOutlineIdentification} label="ID"      value={student.id.slice(0, 8) + '…'} />
                    </div>
                </div>

                <div className="flex gap-2.5 px-5 py-4">
                    <button
                        onClick={onClose}
                        className="flex-1 rounded-xl bg-slate-100 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
                    >
                        Close
                    </button>
                    <Link
                        href={`/students/${student.id}`}
                        className="flex-1 rounded-xl bg-primary py-2.5 text-center text-sm font-semibold text-white transition hover:bg-primary-dark"
                    >
                        View More
                    </Link>
                </div>
            </div>
        </div>
    );
}

function InfoRow({ icon: Icon, label, value, span }: { icon: React.ElementType; label: string; value: string | null; span?: boolean }) {
    return (
        <div className={`flex items-center gap-2.5 rounded-xl bg-slate-50 px-3 py-2.5 ${span ? 'col-span-2' : ''}`}>
            <Icon className="h-4 w-4 shrink-0 text-slate-400" />
            <div className="min-w-0 flex-1">
                <p className="text-[10px] font-medium uppercase tracking-wide text-slate-400">{label}</p>
                <p className="truncate text-sm font-medium text-slate-700">
                    {value ?? <span className="font-normal text-slate-400">Not provided</span>}
                </p>
            </div>
        </div>
    );
}

function StudentCard({ student, onClick }: { student: Student; onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="group flex w-full flex-col items-center gap-3 rounded-2xl bg-white p-5 text-left shadow-sm ring-1 ring-slate-100 transition hover:shadow-md hover:ring-primary/20"
        >
            <div className="relative h-14 w-14 overflow-hidden rounded-full bg-slate-100 ring-2 ring-slate-200 transition group-hover:ring-primary/30">
                <Image
                    src={`/img/auth/avatars/${student.avatar}`}
                    alt={`${student.firstName} ${student.lastName}`}
                    fill
                    className="object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/img/auth/avatars/avatar_01.png'; }}
                />
            </div>

            <div className="w-full text-center">
                <p className="truncate font-semibold text-slate-800">
                    {student.firstName} {student.lastName}
                </p>
                <p className="mt-0.5 truncate text-xs text-slate-400">{student.email}</p>
            </div>

            <div className="flex w-full flex-wrap justify-center gap-1.5">
                {student.country && (
                    <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-medium text-slate-500">
                        <HiOutlineGlobeAlt className="h-3 w-3" />
                        {student.country}
                    </span>
                )}
                {student.isVerified && (
                    <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-medium text-emerald-600">
                        <HiOutlineShieldCheck className="h-3 w-3" />
                        Verified
                    </span>
                )}
            </div>

            <div className="flex w-full items-center justify-between border-t border-slate-100 pt-2.5 text-[10px] text-slate-400">
                <span className="flex items-center gap-1">
                    <HiOutlineCalendarDays className="h-3 w-3" />
                    {new Date(student.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
                <span className="font-medium text-primary opacity-0 transition group-hover:opacity-100">
                    View profile →
                </span>
            </div>
        </button>
    );
}

export default function AdminStudentsPage() {
    const [students, setStudents]       = useState<Student[]>([]);
    const [loading, setLoading]         = useState(true);
    const [search, setSearch]           = useState('');
    const [page, setPage]               = useState(1);
    const [selected, setSelected]       = useState<Student | null>(null);

    useEffect(() => {
        fetch('/api/users')
            .then((r) => r.json())
            .then((d) => setStudents(d.data ?? []))
            .finally(() => setLoading(false));
    }, []);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        if (!q) return students;
        return students.filter((s) =>
            `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
            s.email.toLowerCase().includes(q) ||
            s.country?.toLowerCase().includes(q),
        );
    }, [students, search]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    function handleSearch(v: string) {
        setSearch(v);
        setPage(1);
    }

    return (
        <div className="mx-auto max-w-6xl space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-slate-800">Students</h2>
                    <p className="text-sm text-slate-400">
                        {loading ? 'Loading…' : `${filtered.length} student${filtered.length !== 1 ? 's' : ''} registered`}
                    </p>
                </div>

                {/* Search */}
                <div className="relative w-full sm:w-72">
                    <HiOutlineMagnifyingGlass className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Search by name, email, country…"
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-8 pl-10 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                    {search && (
                        <button onClick={() => handleSearch('')} className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                            <HiOutlineXMark className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="animate-pulse rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
                            <div className="mx-auto h-14 w-14 rounded-full bg-slate-100" />
                            <div className="mt-3 space-y-2">
                                <div className="mx-auto h-4 w-24 rounded bg-slate-100" />
                                <div className="mx-auto h-3 w-32 rounded bg-slate-100" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : paginated.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-2xl bg-white py-20 shadow-sm ring-1 ring-slate-100">
                    <HiOutlineUsers className="h-12 w-12 text-slate-300" />
                    <p className="font-medium text-slate-500">No students found</p>
                    {search && <p className="text-sm text-slate-400">Try a different search term.</p>}
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                    {paginated.map((student) => (
                        <StudentCard key={student.id} student={student} onClick={() => setSelected(student)} />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {!loading && filtered.length > PAGE_SIZE && (
                <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-100">
                    <p className="text-xs text-slate-400">
                        Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
                    </p>
                    <div className="flex items-center gap-1">
                        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 disabled:opacity-40">
                            <HiOutlineChevronLeft className="h-4 w-4" />
                        </button>
                        <span className="min-w-10 text-center text-xs font-medium text-slate-600">{page} / {totalPages}</span>
                        <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 disabled:opacity-40">
                            <HiOutlineChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Profile modal */}
            {selected && (
                <ProfileModal student={selected} onClose={() => setSelected(null)} />
            )}
        </div>
    );
}
