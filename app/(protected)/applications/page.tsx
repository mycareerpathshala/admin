'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import Image from 'next/image';
import {
    HiOutlineMagnifyingGlass,
    HiOutlineTrash,
    HiOutlineAcademicCap,
    HiOutlineGlobeAlt,
    HiOutlineCalendarDays,
    HiOutlineDocumentText,
    HiOutlineXMark,
    HiOutlineExclamationTriangle,
    HiOutlineChevronLeft,
    HiOutlineChevronRight,
    HiOutlinePencilSquare,
    HiChevronDown,
    HiOutlineCheck,
} from 'react-icons/hi2';

type ApplicationStatus =
    | 'draft'
    | 'submitted'
    | 'under_review'
    | 'offer_received'
    | 'accepted'
    | 'rejected'
    | 'withdrawn';

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; color: string; bg: string; dot: string }> = {
    draft:          { label: 'Draft',          color: 'text-slate-600',  bg: 'bg-slate-100',    dot: 'bg-slate-400' },
    submitted:      { label: 'Submitted',      color: 'text-blue-700',   bg: 'bg-blue-100',     dot: 'bg-blue-500' },
    under_review:   { label: 'Under Review',   color: 'text-indigo-700', bg: 'bg-indigo-100',   dot: 'bg-indigo-500' },
    offer_received: { label: 'Offer Received', color: 'text-purple-700', bg: 'bg-purple-100',   dot: 'bg-purple-500' },
    accepted:       { label: 'Accepted',       color: 'text-green-700',  bg: 'bg-green-100',    dot: 'bg-green-500' },
    rejected:       { label: 'Rejected',       color: 'text-red-700',    bg: 'bg-red-100',      dot: 'bg-red-500' },
    withdrawn:      { label: 'Withdrawn',      color: 'text-slate-500',  bg: 'bg-slate-100',    dot: 'bg-slate-400' },
};

const STATUS_TABS: { key: ApplicationStatus | 'all'; label: string }[] = [
    { key: 'all',           label: 'All' },
    { key: 'submitted',     label: 'Submitted' },
    { key: 'under_review',  label: 'Under Review' },
    { key: 'offer_received',label: 'Offer Received' },
    { key: 'accepted',      label: 'Accepted' },
    { key: 'rejected',      label: 'Rejected' },
    { key: 'draft',         label: 'Draft' },
    { key: 'withdrawn',     label: 'Withdrawn' },
];

interface AdminApplication {
    id: string;
    type: 'general' | 'mbbs';
    userId: string;
    userFirstName: string | null;
    userLastName: string | null;
    userEmail: string | null;
    userAvatar: string | null;
    universityId: string;
    courseId: string | null;
    status: ApplicationStatus;
    notes: string | null;
    adminNote: string | null;
    createdAt: string;
    updatedAt: string;
    universityName: string;
    universityAcronym: string | null;
    country: string | null;
    courseName: string | null;
    courseLevel: string | null;
    degreeName: string | null;
}

const PAGE_SIZE = 10;

function StatusBadge({ status }: { status: ApplicationStatus }) {
    const c = STATUS_CONFIG[status];
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${c.bg} ${c.color}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
            {c.label}
        </span>
    );
}

function SkeletonRow() {
    return (
        <tr className="animate-pulse border-b border-slate-100">
            {Array.from({ length: 6 }).map((_, i) => (
                <td key={i} className="px-4 py-4">
                    <div className="h-4 rounded bg-slate-100" />
                </td>
            ))}
        </tr>
    );
}

function StatusSelect({ value, onChange }: { value: ApplicationStatus; onChange: (v: ApplicationStatus) => void }) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handler(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const selected = STATUS_CONFIG[value];

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${selected.bg} ${selected.color}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${selected.dot}`} />
                    {selected.label}
                </span>
                <HiChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
                <div className="absolute z-10 mt-1.5 w-full overflow-hidden rounded-xl border border-slate-100 bg-white py-1 shadow-lg">
                    {(Object.entries(STATUS_CONFIG) as [ApplicationStatus, (typeof STATUS_CONFIG)[ApplicationStatus]][]).map(([val, cfg]) => (
                        <button
                            key={val}
                            type="button"
                            onClick={() => { onChange(val); setOpen(false); }}
                            className={`flex w-full items-center gap-2 px-3 py-2 transition hover:bg-slate-50 ${value === val ? 'bg-slate-50' : ''}`}
                        >
                            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${cfg.bg} ${cfg.color}`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                                {cfg.label}
                            </span>
                            {value === val && <HiOutlineCheck className="ml-auto h-4 w-4 text-primary" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

interface UpdateModalProps {
    app: AdminApplication;
    onSave: (id: string, data: { status: ApplicationStatus; adminNote?: string | null }) => Promise<void>;
    onClose: () => void;
}

function UpdateModal({ app, onSave, onClose }: UpdateModalProps) {
    const [status,    setStatus]    = useState<ApplicationStatus>(app.status);
    const [adminNote, setAdminNote] = useState(app.adminNote ?? '');
    const [saving,    setSaving]    = useState(false);

    const name = `${app.userFirstName ?? ''} ${app.userLastName ?? ''}`.trim() || 'Unknown';

    async function handleSave() {
        setSaving(true);
        try {
            await onSave(app.id, { status, adminNote: adminNote.trim() || null });
            onClose();
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                    <div>
                        <h3 className="font-semibold text-slate-800">Update Application</h3>
                        <p className="text-xs text-slate-400">{name} — {app.universityName}</p>
                    </div>
                    <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
                        <HiOutlineXMark className="h-5 w-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="space-y-4 px-6 py-5">
                    {/* Course info */}
                    <div className="rounded-xl bg-slate-50 p-3 text-sm">
                        <p className="text-xs text-slate-400">Program</p>
                        {app.type === 'mbbs' ? (
                            <span className="mt-1 inline-flex items-center rounded-full bg-teal-50 px-2.5 py-0.5 text-[11px] font-semibold text-teal-700">
                                MBBS Program
                            </span>
                        ) : (
                            <>
                                <p className="font-medium text-slate-700">{app.courseName ?? '—'}</p>
                                {app.courseLevel && (
                                    <span className="mt-1 inline-block rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-medium text-violet-600">
                                        {app.courseLevel}
                                    </span>
                                )}
                            </>
                        )}
                    </div>

                    {/* Status */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Status</label>
                        <StatusSelect value={status} onChange={setStatus} />
                    </div>

                    <div className="space-y-3">
                        {/* Student note — read-only */}
                        {app.notes && (
                            <div>
                                <p className="mb-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Student Note</p>
                                <div className="rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-2.5 text-sm italic text-slate-500 leading-relaxed">
                                    &ldquo;{app.notes}&rdquo;
                                </div>
                            </div>
                        )}

                        {/* Admin message — editable, visible to student on their card */}
                        <div>
                            <p className="mb-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wide">Admin Message</p>
                            <textarea
                                value={adminNote}
                                onChange={(e) => setAdminNote(e.target.value)}
                                rows={3}
                                placeholder="Write a message for the student…"
                                className="scrollbar-thin w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
                    <button
                        onClick={onClose}
                        className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60"
                    >
                        {saving ? (
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
}

interface ConfirmDeleteModalProps {
    studentName: string;
    uniName: string;
    onConfirm: () => void;
    onCancel: () => void;
    deleting: boolean;
}

function ConfirmDeleteModal({ studentName, uniName, onConfirm, onCancel, deleting }: ConfirmDeleteModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                    <HiOutlineExclamationTriangle className="h-6 w-6 text-red-500" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-slate-800">Delete Application</h3>
                <p className="mt-2 text-sm text-slate-500">
                    Are you sure you want to delete <strong>{studentName}&apos;s</strong> application to{' '}
                    <strong>{uniName}</strong>? This action cannot be undone.
                </p>
                <div className="mt-6 flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={deleting}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 py-2.5 text-sm font-medium text-white transition hover:bg-red-600 disabled:opacity-60"
                    >
                        {deleting ? (
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function AdminApplicationsPage() {
    const [apps, setApps]                   = useState<AdminApplication[]>([]);
    const [loading, setLoading]             = useState(true);
    const [search, setSearch]               = useState('');
    const [activeTab, setActiveTab]         = useState<ApplicationStatus | 'all'>('all');
    const [typeFilter, setTypeFilter]       = useState<'all' | 'general' | 'mbbs'>('all');
    const [page, setPage]                   = useState(1);
    const [editTarget, setEditTarget]       = useState<AdminApplication | null>(null);
    const [deleteTarget, setDeleteTarget]   = useState<AdminApplication | null>(null);
    const [deleting, setDeleting]           = useState(false);

    useEffect(() => {
        fetch('/api/applications')
            .then((r) => r.json())
            .then((d) => setApps(d.data ?? []))
            .finally(() => setLoading(false));
    }, []);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return apps.filter((a) => {
            const matchTab    = activeTab === 'all' || a.status === activeTab;
            const matchType   = typeFilter === 'all' || a.type === typeFilter;
            const matchSearch = !q ||
                `${a.userFirstName} ${a.userLastName}`.toLowerCase().includes(q) ||
                a.userEmail?.toLowerCase().includes(q) ||
                a.universityName.toLowerCase().includes(q) ||
                (a.courseName?.toLowerCase().includes(q) ?? false) ||
                a.country?.toLowerCase().includes(q) ||
                a.type.includes(q);
            return matchTab && matchType && matchSearch;
        });
    }, [apps, search, activeTab, typeFilter]);

    const tabCounts = useMemo(() => {
        const counts: Record<string, number> = { all: apps.length };
        apps.forEach((a) => { counts[a.status] = (counts[a.status] ?? 0) + 1; });
        return counts;
    }, [apps]);

    const typeCounts = useMemo(() => ({
        all:     apps.length,
        general: apps.filter((a) => a.type === 'general').length,
        mbbs:    apps.filter((a) => a.type === 'mbbs').length,
    }), [apps]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    function handleTabChange(tab: ApplicationStatus | 'all') {
        setActiveTab(tab);
        setPage(1);
    }

    function handleTypeChange(t: 'all' | 'general' | 'mbbs') {
        setTypeFilter(t);
        setPage(1);
    }

    function handleSearchChange(v: string) {
        setSearch(v);
        setPage(1);
    }

    async function handleUpdate(id: string, data: { status: ApplicationStatus; adminNote?: string | null }) {
        const res = await fetch(`/api/applications/${id}`, {
            method:  'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(data),
        });
        const json = await res.json();
        if (json.data) {
            setApps((prev) => prev.map((a) => a.id === id ? { ...a, status: json.data.status, adminNote: json.data.adminNote } : a));
        }
    }

    async function confirmDelete() {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await fetch(`/api/applications/${deleteTarget.id}`, { method: 'DELETE' });
            setApps((prev) => prev.filter((a) => a.id !== deleteTarget.id));
            setDeleteTarget(null);
        } finally {
            setDeleting(false);
        }
    }

    function fullName(a: AdminApplication) {
        return `${a.userFirstName ?? ''} ${a.userLastName ?? ''}`.trim() || 'Unknown';
    }

    return (
        <div className="mx-auto max-w-6xl space-y-6">
            {/* Header row */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-slate-800">Student Applications</h2>
                    <p className="text-sm text-slate-400">
                        {loading ? 'Loading…' : `${filtered.length} application${filtered.length !== 1 ? 's' : ''} found`}
                    </p>
                </div>
                {/* Search */}
                <div className="relative w-full sm:w-72">
                    <HiOutlineMagnifyingGlass className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        placeholder="Search student, university…"
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-8 pl-10 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                    {search && (
                        <button
                            onClick={() => handleSearchChange('')}
                            className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                            <HiOutlineXMark className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Type filter */}
            <div className="flex items-center gap-2">
                {([
                    { key: 'all',     label: 'All Types' },
                    { key: 'general', label: 'General' },
                    { key: 'mbbs',    label: 'MBBS' },
                ] as { key: 'all' | 'general' | 'mbbs'; label: string }[]).map(({ key, label }) => (
                    <button
                        key={key}
                        onClick={() => handleTypeChange(key)}
                        className={[
                            'flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition',
                            typeFilter === key
                                ? 'bg-teal-600 text-white shadow-sm'
                                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 hover:text-slate-800',
                        ].join(' ')}
                    >
                        {label}
                        <span className={[
                            'rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                            typeFilter === key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600',
                        ].join(' ')}>
                            {typeCounts[key]}
                        </span>
                    </button>
                ))}
            </div>

            {/* Status tabs */}
            <div className="flex flex-wrap gap-2">
                {STATUS_TABS.map(({ key, label }) => (
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
                        {label}
                        <span className={[
                            'rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                            activeTab === key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600',
                        ].join(' ')}>
                            {tabCounts[key] ?? 0}
                        </span>
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-slate-100 bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Student</th>
                                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">University</th>
                                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Course</th>
                                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Status</th>
                                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Applied</th>
                                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading
                                ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                                : paginated.length === 0
                                    ? (
                                        <tr>
                                            <td colSpan={6} className="py-16 text-center">
                                                <div className="flex flex-col items-center gap-2 text-slate-400">
                                                    <HiOutlineDocumentText className="h-10 w-10" />
                                                    <p className="text-sm font-medium">No applications found</p>
                                                    {search && <p className="text-xs">Try adjusting your search.</p>}
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                    : paginated.map((app) => (
                                        <tr key={app.id} className="border-b border-slate-50 transition hover:bg-slate-50/60">
                                            {/* Student */}
                                            <td className="px-4 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-slate-100">
                                                        <Image
                                                            src={`/img/auth/avatars/${app.userAvatar ?? 'avatar_01.png'}`}
                                                            alt={fullName(app)}
                                                            fill
                                                            className="object-cover"
                                                            onError={(e) => { (e.target as HTMLImageElement).src = '/img/auth/avatars/avatar_01.png'; }}
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-700">{fullName(app)}</p>
                                                        <p className="text-xs text-slate-400">{app.userEmail}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* University */}
                                            <td className="px-4 py-3.5">
                                                <div className="flex items-start gap-2">
                                                    <HiOutlineAcademicCap className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                                                    <div>
                                                        <p className="font-medium text-slate-700">{app.universityName}</p>
                                                        {app.country && (
                                                            <span className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                                                                <HiOutlineGlobeAlt className="h-3 w-3" />
                                                                {app.country}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Course */}
                                            <td className="px-4 py-3.5">
                                                {app.type === 'mbbs' ? (
                                                    <span className="inline-flex items-center rounded-full bg-teal-50 px-2.5 py-0.5 text-[11px] font-semibold text-teal-700">
                                                        MBBS Program
                                                    </span>
                                                ) : (
                                                    <>
                                                        <p className="font-medium text-slate-700">{app.courseName ?? '—'}</p>
                                                        {app.courseLevel && (
                                                            <span className="mt-0.5 inline-block rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-medium text-violet-600">
                                                                {app.courseLevel}
                                                            </span>
                                                        )}
                                                    </>
                                                )}
                                            </td>

                                            {/* Status */}
                                            <td className="px-4 py-3.5">
                                                <StatusBadge status={app.status} />
                                            </td>

                                            {/* Date */}
                                            <td className="px-4 py-3.5 text-slate-500">
                                                <div className="flex items-center gap-1.5 text-xs">
                                                    <HiOutlineCalendarDays className="h-3.5 w-3.5 shrink-0" />
                                                    {new Date(app.createdAt).toLocaleDateString('en-GB', {
                                                        day: '2-digit', month: 'short', year: 'numeric',
                                                    })}
                                                </div>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-4 py-3.5">
                                                <div className="flex items-center gap-1.5">
                                                    <button
                                                        onClick={() => setEditTarget(app)}
                                                        className="rounded-lg p-2 text-slate-400 transition hover:bg-primary/10 hover:text-primary"
                                                        title="Update status"
                                                    >
                                                        <HiOutlinePencilSquare className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteTarget(app)}
                                                        className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                                                        title="Delete application"
                                                    >
                                                        <HiOutlineTrash className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                            }
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {!loading && filtered.length > PAGE_SIZE && (
                    <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
                        <p className="text-xs text-slate-400">
                            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
                        </p>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 disabled:opacity-40"
                            >
                                <HiOutlineChevronLeft className="h-4 w-4" />
                            </button>
                            <span className="min-w-10 text-center text-xs font-medium text-slate-600">
                                {page} / {totalPages}
                            </span>
                            <button
                                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 disabled:opacity-40"
                            >
                                <HiOutlineChevronRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Update modal */}
            {editTarget && (
                <UpdateModal
                    app={editTarget}
                    onSave={handleUpdate}
                    onClose={() => setEditTarget(null)}
                />
            )}

            {/* Delete confirmation modal */}
            {deleteTarget && (
                <ConfirmDeleteModal
                    studentName={fullName(deleteTarget)}
                    uniName={deleteTarget.universityName}
                    onConfirm={confirmDelete}
                    onCancel={() => setDeleteTarget(null)}
                    deleting={deleting}
                />
            )}
        </div>
    );
}
