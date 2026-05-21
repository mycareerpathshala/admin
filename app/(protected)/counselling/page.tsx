'use client';

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import {
    HiOutlineMagnifyingGlass,
    HiOutlineXMark,
    HiOutlineChatBubbleLeftRight,
    HiOutlineCalendarDays,
    HiOutlinePhone,
    HiOutlineEnvelope,
    HiOutlineAcademicCap,
    HiOutlineChevronLeft,
    HiOutlineChevronRight,
    HiOutlineCheckCircle,
    HiOutlineXCircle,
    HiOutlinePencilSquare,
    HiOutlineClock,
} from 'react-icons/hi2';
import { SiGooglemeet, SiZoom } from 'react-icons/si';
import DateTimePicker from '@/assets/components/DateTimePicker';

type RequestStatus = 'pending' | 'scheduled' | 'completed' | 'cancelled';

interface AdminCounsellingRequest {
    id: string;
    userId: string;
    name: string;
    email: string;
    phone: string;
    studyLevel: string;
    message: string;
    preferredDays: string[];
    preferredTimeRanges: string[];
    nationality: string | null;
    streams: string[] | null;
    countries: string[] | null;
    courses: string[] | null;
    counsellorId: string | null;
    scheduledTime: string | null;
    meetingLink: string | null;
    adminNote: string | null;
    status: RequestStatus;
    createdAt: string;
    userAvatar: string | null;
}

interface CounsellorOption {
    id: string;
    name: string;
    designation: string;
}

const STATUS_CONFIG: Record<RequestStatus, { label: string; bg: string; text: string; dot: string }> = {
    pending:   { label: 'Pending',   bg: 'bg-amber-50',   text: 'text-amber-600',   dot: 'bg-amber-400' },
    scheduled: { label: 'Scheduled', bg: 'bg-blue-50',    text: 'text-blue-600',    dot: 'bg-blue-500' },
    completed: { label: 'Completed', bg: 'bg-emerald-50', text: 'text-emerald-600', dot: 'bg-emerald-500' },
    cancelled: { label: 'Cancelled', bg: 'bg-slate-100',  text: 'text-slate-500',   dot: 'bg-slate-400' },
};

const STATUS_TABS: { key: RequestStatus | 'all'; label: string }[] = [
    { key: 'all',       label: 'All' },
    { key: 'pending',   label: 'Pending' },
    { key: 'scheduled', label: 'Scheduled' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
];

const PAGE_SIZE = 8;


type MeetingPlatform = 'google-meet' | 'zoom';

function detectPlatform(url: string): MeetingPlatform | null {
    if (!url) return null;
    if (url.includes('meet.google.com')) return 'google-meet';
    if (url.includes('zoom.us') || url.includes('zoom.com')) return 'zoom';
    return null;
}

function MeetingBadge({ url }: { url: string }) {
    const platform = detectPlatform(url);
    if (platform === 'google-meet') return (
        <a href={url} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 ring-1 ring-green-200 transition hover:bg-green-100">
            <SiGooglemeet className="h-3.5 w-3.5" />
            Join on Google Meet
        </a>
    );
    if (platform === 'zoom') return (
        <a href={url} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-200 transition hover:bg-blue-100">
            <SiZoom className="h-3.5 w-3.5" />
            Join on Zoom
        </a>
    );
    return (
        <a href={url} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-100">
            Join Meeting →
        </a>
    );
}

interface UpdateModalProps {
    request: AdminCounsellingRequest;
    counsellors: CounsellorOption[];
    onSave: (id: string, data: { status: RequestStatus; scheduledTime?: string; meetingLink?: string; counsellorId?: string | null; adminNote?: string | null }) => Promise<void>;
    onClose: () => void;
}

type ModalAction = 'schedule' | 'cancel' | 'reschedule' | 'complete';

function UpdateModal({ request, counsellors, onSave, onClose }: UpdateModalProps) {
    const [action, setAction]               = useState<ModalAction | null>(null);
    const [scheduledTime, setScheduledTime] = useState(
        request.scheduledTime ? new Date(request.scheduledTime).toISOString().slice(0, 16) : '',
    );
    const [meetingLink, setMeetingLink]     = useState(request.meetingLink ?? '');
    const [counsellorId, setCounsellorId]   = useState<string>(request.counsellorId ?? '');
    const [adminNote, setAdminNote]         = useState(request.adminNote ?? '');
    const [saving, setSaving]               = useState(false);

    const isPending   = request.status === 'pending';
    const isScheduled = request.status === 'scheduled';
    const isTerminal  = request.status === 'completed' || request.status === 'cancelled';
    const needsForm   = action === 'schedule' || action === 'reschedule';
    // Admin note shown for cancel/complete — not when scheduling (accepting) the request
    const showAdminNote = action === 'cancel' || action === 'complete';

    async function handleSave() {
        if (!action) return;
        setSaving(true);
        try {
            const newStatus: RequestStatus =
                action === 'schedule' || action === 'reschedule' ? 'scheduled'
                : action === 'cancel'   ? 'cancelled'
                : 'completed';
            await onSave(request.id, {
                status:        newStatus,
                scheduledTime: needsForm ? (scheduledTime || undefined) : undefined,
                meetingLink:   needsForm ? (meetingLink   || undefined) : undefined,
                counsellorId:  counsellorId || null,
                adminNote:     showAdminNote ? (adminNote.trim() || null) : undefined,
            });
            onClose();
        } finally {
            setSaving(false);
        }
    }

    const saveLabel: Record<ModalAction, string> = {
        schedule:   'Schedule Meeting',
        reschedule: 'Reschedule Meeting',
        cancel:     'Cancel Request',
        complete:   'Mark as Completed',
    };

    const canSave = action && (!needsForm || scheduledTime);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <div className="flex w-full max-w-lg flex-col rounded-2xl bg-white shadow-xl" style={{ maxHeight: 'calc(100vh - 2rem)' }}>

                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                    <div>
                        <h3 className="font-semibold text-slate-800">{request.name}</h3>
                        <p className="text-xs text-slate-400">{request.studyLevel} · {request.email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <StatusBadge status={request.status} />
                        <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
                            <HiOutlineXMark className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Body — scrolls when content overflows */}
                <div className="scrollbar-thin flex-1 space-y-4 overflow-y-auto px-6 py-5">

                    {/* Student info */}
                    <div className="rounded-xl bg-slate-50 p-4 text-sm">
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <p className="text-xs text-slate-400">Phone</p>
                                <p className="font-medium text-slate-700">{request.phone}</p>
                            </div>
                            {request.nationality && (
                                <div>
                                    <p className="text-xs text-slate-400">Nationality</p>
                                    <p className="font-medium text-slate-700">{request.nationality}</p>
                                </div>
                            )}
                            <div>
                                <p className="text-xs text-slate-400">Preferred Days</p>
                                <p className="text-slate-600">{request.preferredDays.join(', ')}</p>
                            </div>
                            <div>
                                <p className="text-xs text-slate-400">Preferred Times</p>
                                <p className="text-slate-600">{request.preferredTimeRanges.join(', ')}</p>
                            </div>
                            {request.streams?.length ? (
                                <div className="col-span-2">
                                    <p className="text-xs text-slate-400">Streams of Interest</p>
                                    <div className="mt-1 flex flex-wrap gap-1">
                                        {request.streams.map((s) => (
                                            <span key={s} className="rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-medium text-indigo-700">{s}</span>
                                        ))}
                                    </div>
                                </div>
                            ) : null}
                            {request.countries?.length ? (
                                <div className="col-span-2">
                                    <p className="text-xs text-slate-400">Countries of Interest</p>
                                    <div className="mt-1 flex flex-wrap gap-1">
                                        {request.countries.map((c) => (
                                            <span key={c} className="rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">{c}</span>
                                        ))}
                                    </div>
                                </div>
                            ) : null}
                            {request.courses?.length ? (
                                <div className="col-span-2">
                                    <p className="text-xs text-slate-400">Courses of Interest</p>
                                    <div className="mt-1 flex flex-wrap gap-1">
                                        {request.courses.map((c) => (
                                            <span key={c} className="rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700">{c}</span>
                                        ))}
                                    </div>
                                </div>
                            ) : null}
                            <div className="col-span-2">
                                <p className="text-xs text-slate-400">Student Note</p>
                                <p className="italic text-slate-500 leading-relaxed">&ldquo;{request.message}&rdquo;</p>
                            </div>
                            {request.adminNote && (
                                <div className="col-span-2">
                                    <p className="text-xs text-slate-400">Admin Note</p>
                                    <p className="text-slate-600 leading-relaxed">{request.adminNote}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Counsellor assignment */}
                    {!isTerminal && counsellors.length > 0 && (
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                Assign Counsellor
                            </label>
                            <select
                                value={counsellorId}
                                onChange={(e) => setCounsellorId(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="">— Unassigned —</option>
                                {counsellors.map((c) => (
                                    <option key={c.id} value={c.id}>
                                        {c.name} · {c.designation}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Current session info (scheduled) */}
                    {isScheduled && (
                        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
                            <div className="flex items-center gap-2 text-xs font-medium text-blue-700">
                                <HiOutlineCalendarDays className="h-4 w-4 shrink-0" />
                                {request.scheduledTime
                                    ? new Date(request.scheduledTime).toLocaleString('en-GB', {
                                        day: '2-digit', month: 'short', year: 'numeric',
                                        hour: '2-digit', minute: '2-digit',
                                      })
                                    : 'No date set'}
                            </div>
                            {request.meetingLink && <MeetingBadge url={request.meetingLink} />}
                        </div>
                    )}

                    {/* Terminal state message */}
                    {isTerminal && (
                        <div className={[
                            'rounded-xl p-4 text-center text-sm font-medium',
                            request.status === 'completed'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-slate-100 text-slate-500',
                        ].join(' ')}>
                            {request.status === 'completed'
                                ? 'This counselling session has been completed.'
                                : 'This request has been cancelled.'}
                        </div>
                    )}

                    {/* Action chooser */}
                    {isPending && (
                        <div>
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Choose an action</p>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => setAction('schedule')}
                                    className={[
                                        'flex flex-1 items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold transition',
                                        action === 'schedule'
                                            ? 'border-primary bg-primary/8 text-primary ring-1 ring-primary/20'
                                            : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50',
                                    ].join(' ')}>
                                    <HiOutlineCalendarDays className="h-4 w-4" />
                                    Schedule
                                </button>
                                <button type="button" onClick={() => setAction('cancel')}
                                    className={[
                                        'flex flex-1 items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold transition',
                                        action === 'cancel'
                                            ? 'border-red-300 bg-red-50 text-red-600 ring-1 ring-red-200'
                                            : 'border-slate-200 text-slate-500 hover:border-red-100 hover:bg-red-50 hover:text-red-500',
                                    ].join(' ')}>
                                    <HiOutlineXCircle className="h-4 w-4" />
                                    Cancel Request
                                </button>
                            </div>
                        </div>
                    )}

                    {isScheduled && (
                        <div>
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Choose an action</p>
                            <div className="flex gap-2">
                                <button type="button" onClick={() => setAction('reschedule')}
                                    className={[
                                        'flex flex-1 items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold transition',
                                        action === 'reschedule'
                                            ? 'border-primary bg-primary/8 text-primary ring-1 ring-primary/20'
                                            : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50',
                                    ].join(' ')}>
                                    <HiOutlineCalendarDays className="h-4 w-4" />
                                    Reschedule
                                </button>
                                <button type="button" onClick={() => setAction('complete')}
                                    className={[
                                        'flex flex-1 items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold transition',
                                        action === 'complete'
                                            ? 'border-emerald-300 bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                                            : 'border-slate-200 text-slate-500 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600',
                                    ].join(' ')}>
                                    <HiOutlineCheckCircle className="h-4 w-4" />
                                    Mark as Completed
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Date + meeting form (schedule / reschedule) */}
                    {needsForm && (
                        <>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">Scheduled Date & Time</label>
                                <DateTimePicker value={scheduledTime} onChange={setScheduledTime} />
                            </div>
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">Meeting Link</label>
                                <div className="relative">
                                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
                                        {detectPlatform(meetingLink) === 'google-meet'
                                            ? <SiGooglemeet className="h-4 w-4 text-green-600" />
                                            : detectPlatform(meetingLink) === 'zoom'
                                                ? <SiZoom className="h-4 w-4 text-blue-600" />
                                                : <HiOutlineEnvelope className="h-4 w-4 text-slate-400" />}
                                    </span>
                                    <input
                                        type="url"
                                        value={meetingLink}
                                        onChange={(e) => setMeetingLink(e.target.value)}
                                        placeholder="https://meet.google.com/… or https://zoom.us/j/…"
                                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-4 pl-9 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {/* Admin note (cancel / complete only) */}
                    {showAdminNote && (
                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                Admin Note
                                <span className="ml-1.5 text-xs font-normal text-slate-400">
                                    {action === 'cancel' ? '— reason for cancellation' : '— session outcome / follow-up'}
                                </span>
                            </label>
                            <textarea
                                value={adminNote}
                                onChange={(e) => setAdminNote(e.target.value)}
                                rows={3}
                                placeholder={
                                    action === 'cancel'
                                        ? 'e.g. Student is not reachable, rescheduled manually…'
                                        : 'e.g. Discussed MBBS options in Russia. Follow-up in 2 weeks…'
                                }
                                className="scrollbar-thin w-full resize-none rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
                    <button onClick={onClose}
                        className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
                        Close
                    </button>
                    {!isTerminal && action && (
                        <button
                            onClick={handleSave}
                            disabled={saving || !canSave}
                            className={[
                                'flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white transition disabled:opacity-50',
                                action === 'cancel'   ? 'bg-red-500 hover:bg-red-600'
                                : action === 'complete' ? 'bg-emerald-600 hover:bg-emerald-700'
                                : 'bg-primary hover:bg-primary-dark',
                            ].join(' ')}
                        >
                            {saving
                                ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                : saveLabel[action]}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function StatusBadge({ status }: { status: RequestStatus }) {
    const c = STATUS_CONFIG[status];
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${c.bg} ${c.text}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
            {c.label}
        </span>
    );
}

export default function AdminCounsellingPage() {
    const [requests, setRequests]       = useState<AdminCounsellingRequest[]>([]);
    const [counsellors, setCounsellors] = useState<CounsellorOption[]>([]);
    const [loading, setLoading]         = useState(true);
    const [search, setSearch]           = useState('');
    const [activeTab, setActiveTab]     = useState<RequestStatus | 'all'>('all');
    const [page, setPage]               = useState(1);
    const [editTarget, setEditTarget]   = useState<AdminCounsellingRequest | null>(null);

    useEffect(() => {
        Promise.all([
            fetch('/api/counselling').then((r) => r.json()),
            fetch('/api/counsellors').then((r) => r.json()),
        ]).then(([counsellingData, counsellorsData]) => {
            setRequests(counsellingData.data ?? []);
            setCounsellors(counsellorsData.data ?? []);
        }).finally(() => setLoading(false));
    }, []);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        return requests.filter((r) => {
            const matchTab    = activeTab === 'all' || r.status === activeTab;
            const matchSearch = !q ||
                r.name.toLowerCase().includes(q) ||
                r.email.toLowerCase().includes(q) ||
                r.phone.includes(q) ||
                r.studyLevel.toLowerCase().includes(q);
            return matchTab && matchSearch;
        });
    }, [requests, search, activeTab]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    function handleTabChange(tab: RequestStatus | 'all') {
        setActiveTab(tab);
        setPage(1);
    }

    function handleSearchChange(v: string) {
        setSearch(v);
        setPage(1);
    }

    async function handleUpdate(id: string, data: { status: RequestStatus; scheduledTime?: string; meetingLink?: string; counsellorId?: string | null; adminNote?: string | null }) {
        const res = await fetch(`/api/counselling/${id}`, {
            method:  'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(data),
        });
        const json = await res.json();
        if (json.data) {
            setRequests((prev) => prev.map((r) => r.id === id ? { ...r, ...json.data } : r));
        }
    }

    const tabCounts = useMemo(() => {
        const counts: Record<string, number> = { all: requests.length };
        requests.forEach((r) => { counts[r.status] = (counts[r.status] ?? 0) + 1; });
        return counts;
    }, [requests]);

    return (
        <div className="mx-auto max-w-6xl space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-slate-800">Counselling Requests</h2>
                    <p className="text-sm text-slate-400">
                        {loading ? 'Loading…' : `${filtered.length} request${filtered.length !== 1 ? 's' : ''} found`}
                    </p>
                </div>
                {/* Search */}
                <div className="relative w-full sm:w-72">
                    <HiOutlineMagnifyingGlass className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        placeholder="Search by name, email…"
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-8 pl-10 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                    {search && (
                        <button onClick={() => handleSearchChange('')} className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                            <HiOutlineXMark className="h-4 w-4" />
                        </button>
                    )}
                </div>
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

            {/* Cards grid */}
            {loading ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="animate-pulse rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
                            <div className="flex gap-3">
                                <div className="h-10 w-10 rounded-full bg-slate-100" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-32 rounded bg-slate-100" />
                                    <div className="h-3 w-48 rounded bg-slate-100" />
                                </div>
                            </div>
                            <div className="mt-4 space-y-2">
                                <div className="h-3 w-full rounded bg-slate-100" />
                                <div className="h-3 w-3/4 rounded bg-slate-100" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : paginated.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-2xl bg-white py-16 shadow-sm ring-1 ring-slate-100">
                    <HiOutlineChatBubbleLeftRight className="h-12 w-12 text-slate-300" />
                    <p className="font-medium text-slate-500">No requests found</p>
                    {search && <p className="text-sm text-slate-400">Try adjusting your search or filters.</p>}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {paginated.map((req) => (
                        <div key={req.id} className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 transition hover:shadow-md overflow-hidden">

                            {/* Status accent bar */}
                            <div className={`h-0.75 w-full ${
                                req.status === 'scheduled' ? 'bg-blue-500' :
                                req.status === 'completed' ? 'bg-emerald-500' :
                                req.status === 'cancelled' ? 'bg-slate-300' : 'bg-amber-400'
                            }`} />

                            {/* Compact header */}
                            <div className="flex items-center gap-2.5 border-b border-slate-100 px-4 py-3">
                                <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-full bg-slate-100">
                                    <Image
                                        src={`/img/auth/avatars/${req.userAvatar ?? 'avatar_01.png'}`}
                                        alt={req.name}
                                        fill
                                        className="object-cover"
                                        onError={(e) => { (e.target as HTMLImageElement).src = '/img/auth/avatars/avatar_01.png'; }}
                                    />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-[13px] font-bold text-slate-800">{req.name}</p>
                                    <p className="truncate text-[10px] text-slate-400">
                                        {req.studyLevel} · {req.email} · {req.phone}
                                    </p>
                                </div>
                                <div className="flex shrink-0 flex-col items-end gap-1">
                                    <StatusBadge status={req.status} />
                                    <span className="text-[10px] text-slate-400">
                                        {new Date(req.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </span>
                                </div>
                            </div>

                            {/* Dense data table */}
                            <div className="px-4 py-3">
                                <table className="w-full text-[11px]" style={{ borderCollapse: 'collapse' }}>
                                    <tbody>
                                        {req.nationality && (
                                            <tr>
                                                <td className="w-20 py-1 align-top font-semibold text-slate-400">Nationality</td>
                                                <td className="py-1 text-slate-600">{req.nationality}</td>
                                            </tr>
                                        )}
                                        {req.counsellorId && (() => {
                                            const c = counsellors.find((c) => c.id === req.counsellorId);
                                            return c ? (
                                                <tr>
                                                    <td className="w-20 py-1 align-top font-semibold text-slate-400">Counsellor</td>
                                                    <td className="py-1">
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-semibold text-purple-700">
                                                            👤 {c.name}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ) : null;
                                        })()}
                                        <tr>
                                            <td className="w-20 py-1 align-top font-semibold text-slate-400">Days</td>
                                            <td className="py-1">
                                                <div className="flex flex-wrap gap-1">
                                                    {req.preferredDays.map((d) => (
                                                        <span key={d} className="rounded-md bg-blue-50 px-2 py-0.5 text-[10px] font-medium text-blue-600">{d}</span>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="w-20 py-1 align-top font-semibold text-slate-400">Times</td>
                                            <td className="py-1">
                                                <div className="flex flex-wrap gap-1">
                                                    {req.preferredTimeRanges.map((t) => (
                                                        <span key={t} className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">{t}</span>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                        {req.streams?.length ? (
                                            <tr>
                                                <td className="w-20 py-1 align-top font-semibold text-slate-400">Streams</td>
                                                <td className="py-1">
                                                    <div className="flex flex-wrap gap-1">
                                                        {req.streams.map((s) => (
                                                            <span key={s} className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-medium text-indigo-700">{s}</span>
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : null}
                                        {req.countries?.length ? (
                                            <tr>
                                                <td className="w-20 py-1 align-top font-semibold text-slate-400">Countries</td>
                                                <td className="py-1">
                                                    <div className="flex flex-wrap gap-1">
                                                        {req.countries.map((c) => (
                                                            <span key={c} className="rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">{c}</span>
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : null}
                                        {req.courses?.length ? (
                                            <tr>
                                                <td className="w-20 py-1 align-top font-semibold text-slate-400">Courses</td>
                                                <td className="py-1">
                                                    <div className="flex flex-wrap gap-1">
                                                        {req.courses.map((c) => (
                                                            <span key={c} className="rounded-md bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700">{c}</span>
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : null}
                                        {req.scheduledTime && (
                                            <tr>
                                                <td className="w-20 py-1 align-top font-semibold text-slate-400">Scheduled</td>
                                                <td className="py-1">
                                                    <span className="inline-flex items-center gap-1.5 text-blue-600 font-medium">
                                                        <HiOutlineCalendarDays className="h-3 w-3 shrink-0" />
                                                        {new Date(req.scheduledTime).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} at {new Date(req.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </td>
                                            </tr>
                                        )}
                                        {req.meetingLink && (
                                            <tr>
                                                <td className="w-20 py-1 align-top font-semibold text-slate-400">Meeting</td>
                                                <td className="py-1"><MeetingBadge url={req.meetingLink} /></td>
                                            </tr>
                                        )}
                                        <tr>
                                            <td className="w-20 py-1 align-top font-semibold text-slate-400">Student</td>
                                            <td className="py-1 italic text-slate-400 leading-relaxed">&ldquo;{req.message}&rdquo;</td>
                                        </tr>
                                        {req.adminNote && (
                                            <tr>
                                                <td className="w-20 py-1 align-top font-semibold text-slate-400">Admin</td>
                                                <td className="py-1 text-slate-600 leading-relaxed">{req.adminNote}</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-1.5 border-t border-slate-100 px-4 py-2.5">
                                {req.status === 'pending' && (
                                    <button onClick={() => handleUpdate(req.id, { status: 'cancelled' })}
                                        className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-slate-400 transition hover:bg-red-50 hover:text-red-500">
                                        <HiOutlineXCircle className="h-3.5 w-3.5" /> Cancel
                                    </button>
                                )}
                                {req.status === 'scheduled' && (
                                    <button onClick={() => handleUpdate(req.id, { status: 'completed' })}
                                        className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-600">
                                        <HiOutlineCheckCircle className="h-3.5 w-3.5" /> Mark Done
                                    </button>
                                )}
                                <button onClick={() => setEditTarget(req)}
                                    className="flex items-center gap-1 rounded-lg bg-primary/10 px-2.5 py-1.5 text-[11px] font-semibold text-primary transition hover:bg-primary/20">
                                    <HiOutlinePencilSquare className="h-3.5 w-3.5" /> Update
                                </button>
                            </div>
                        </div>
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

            {/* Edit modal */}
            {editTarget && (
                <UpdateModal
                    request={editTarget}
                    counsellors={counsellors}
                    onSave={handleUpdate}
                    onClose={() => setEditTarget(null)}
                />
            )}
        </div>
    );
}
