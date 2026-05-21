'use client';

import { useEffect, useState, useMemo, useRef } from 'react';
import {
    HiOutlineMagnifyingGlass,
    HiOutlineXMark,
    HiOutlineTrash,
    HiOutlinePencilSquare,
    HiOutlineCheck,
    HiOutlineEnvelope,
    HiOutlinePhone,
    HiOutlineUser,
    HiOutlineCalendarDays,
    HiOutlineChevronLeft,
    HiOutlineChevronRight,
    HiOutlineExclamationTriangle,
    HiOutlineInboxArrowDown,
} from 'react-icons/hi2';

interface Subscriber {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    createdAt: string;
}

const PAGE_SIZE = 15;

// ── Delete confirm modal ───────────────────────────────────────────────────────

function DeleteModal({
    subscriber,
    onConfirm,
    onCancel,
    busy,
}: {
    subscriber: Subscriber;
    onConfirm: () => void;
    onCancel: () => void;
    busy: boolean;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
            <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
                <div className="flex items-start gap-4">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
                        <HiOutlineExclamationTriangle className="h-5 w-5 text-red-600" />
                    </span>
                    <div>
                        <h3 className="font-semibold text-slate-800">Delete subscriber?</h3>
                        <p className="mt-1 text-sm text-slate-500">
                            <span className="font-medium text-slate-700">{subscriber.name}</span> ({subscriber.email}) will be removed permanently.
                        </p>
                    </div>
                </div>
                <div className="mt-5 flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 rounded-xl bg-slate-100 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={busy}
                        className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
                    >
                        {busy ? 'Deleting…' : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Inline-editable row ────────────────────────────────────────────────────────

function SubscriberRow({
    sub,
    onSave,
    onDelete,
}: {
    sub: Subscriber;
    onSave: (id: string, patch: { name: string; phone: string | null }) => Promise<void>;
    onDelete: (sub: Subscriber) => void;
}) {
    const [editing, setEditing] = useState(false);
    const [name, setName]       = useState(sub.name);
    const [phone, setPhone]     = useState(sub.phone ?? '');
    const [saving, setSaving]   = useState(false);
    const nameRef = useRef<HTMLInputElement>(null);

    function startEdit() {
        setName(sub.name);
        setPhone(sub.phone ?? '');
        setEditing(true);
        setTimeout(() => nameRef.current?.focus(), 0);
    }

    function cancelEdit() {
        setEditing(false);
    }

    async function save() {
        if (!name.trim()) return;
        setSaving(true);
        await onSave(sub.id, { name: name.trim(), phone: phone.trim() || null });
        setSaving(false);
        setEditing(false);
    }

    function onKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter') save();
        if (e.key === 'Escape') cancelEdit();
    }

    const date = new Date(sub.createdAt).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric',
    });

    return (
        <tr className="group border-b border-slate-100 transition-colors hover:bg-slate-50">
            {/* Name */}
            <td className="px-4 py-3">
                {editing ? (
                    <input
                        ref={nameRef}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={onKeyDown}
                        className="w-full rounded-lg border border-primary/40 px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    />
                ) : (
                    <span className="font-medium text-slate-800">{sub.name}</span>
                )}
            </td>

            {/* Email */}
            <td className="px-4 py-3">
                <span className="text-sm text-slate-600">{sub.email}</span>
            </td>

            {/* Phone */}
            <td className="px-4 py-3">
                {editing ? (
                    <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        onKeyDown={onKeyDown}
                        placeholder="—"
                        className="w-full rounded-lg border border-primary/40 px-2.5 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary/20"
                    />
                ) : (
                    <span className="text-sm text-slate-500">{sub.phone ?? <span className="text-slate-300">—</span>}</span>
                )}
            </td>

            {/* Joined */}
            <td className="px-4 py-3">
                <span className="flex items-center gap-1 text-xs text-slate-400">
                    <HiOutlineCalendarDays className="h-3.5 w-3.5" />
                    {date}
                </span>
            </td>

            {/* Actions */}
            <td className="px-4 py-3">
                <div className="flex items-center gap-1.5">
                    {editing ? (
                        <>
                            <button
                                onClick={save}
                                disabled={saving || !name.trim()}
                                className="flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1.5 text-xs font-semibold text-white transition hover:bg-primary-dark disabled:opacity-50"
                            >
                                <HiOutlineCheck className="h-3.5 w-3.5" />
                                {saving ? 'Saving…' : 'Save'}
                            </button>
                            <button
                                onClick={cancelEdit}
                                className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-100"
                            >
                                Cancel
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                onClick={startEdit}
                                className="rounded-lg p-1.5 text-slate-400 opacity-0 transition hover:bg-slate-100 hover:text-primary group-hover:opacity-100"
                                title="Edit"
                            >
                                <HiOutlinePencilSquare className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => onDelete(sub)}
                                className="rounded-lg p-1.5 text-slate-400 opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100"
                                title="Delete"
                            >
                                <HiOutlineTrash className="h-4 w-4" />
                            </button>
                        </>
                    )}
                </div>
            </td>
        </tr>
    );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function SubscribersPage() {
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [loading, setLoading]         = useState(true);
    const [search, setSearch]           = useState('');
    const [page, setPage]               = useState(1);
    const [toDelete, setToDelete]       = useState<Subscriber | null>(null);
    const [deleting, setDeleting]       = useState(false);

    useEffect(() => {
        fetch('/api/subscribers')
            .then((r) => r.json())
            .then((d) => setSubscribers(d.data ?? []))
            .finally(() => setLoading(false));
    }, []);

    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        if (!q) return subscribers;
        return subscribers.filter((s) =>
            s.name.toLowerCase().includes(q) ||
            s.email.toLowerCase().includes(q) ||
            s.phone?.toLowerCase().includes(q),
        );
    }, [subscribers, search]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    function handleSearch(v: string) {
        setSearch(v);
        setPage(1);
    }

    async function handleSave(id: string, patch: { name: string; phone: string | null }) {
        const res = await fetch(`/api/subscribers/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(patch),
        });
        if (res.ok) {
            const { data } = await res.json();
            setSubscribers((prev) => prev.map((s) => (s.id === id ? data : s)));
        }
    }

    async function handleDelete() {
        if (!toDelete) return;
        setDeleting(true);
        const res = await fetch(`/api/subscribers/${toDelete.id}`, { method: 'DELETE' });
        if (res.ok) {
            setSubscribers((prev) => prev.filter((s) => s.id !== toDelete.id));
        }
        setDeleting(false);
        setToDelete(null);
    }

    return (
        <div className="mx-auto max-w-6xl space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-slate-800">Subscribers</h2>
                    <p className="text-sm text-slate-400">
                        {loading ? 'Loading…' : `${filtered.length} subscriber${filtered.length !== 1 ? 's' : ''}`}
                    </p>
                </div>

                {/* Search */}
                <div className="relative w-full sm:w-72">
                    <HiOutlineMagnifyingGlass className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => handleSearch(e.target.value)}
                        placeholder="Search by name, email, phone…"
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pr-8 pl-10 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                    {search && (
                        <button
                            onClick={() => handleSearch('')}
                            className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                            <HiOutlineXMark className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
                {loading ? (
                    <div className="space-y-px p-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div key={i} className="animate-pulse rounded-lg bg-slate-50 px-4 py-3">
                                <div className="flex items-center gap-6">
                                    <div className="h-4 w-32 rounded bg-slate-200" />
                                    <div className="h-4 w-48 rounded bg-slate-200" />
                                    <div className="h-4 w-24 rounded bg-slate-200" />
                                    <div className="ml-auto h-4 w-20 rounded bg-slate-200" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center gap-3 py-20">
                        <HiOutlineInboxArrowDown className="h-12 w-12 text-slate-300" />
                        <p className="font-medium text-slate-500">No subscribers found</p>
                        {search && <p className="text-sm text-slate-400">Try a different search term.</p>}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50">
                                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        <span className="flex items-center gap-1.5"><HiOutlineUser className="h-3.5 w-3.5" /> Name</span>
                                    </th>
                                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        <span className="flex items-center gap-1.5"><HiOutlineEnvelope className="h-3.5 w-3.5" /> Email</span>
                                    </th>
                                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        <span className="flex items-center gap-1.5"><HiOutlinePhone className="h-3.5 w-3.5" /> Phone</span>
                                    </th>
                                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        <span className="flex items-center gap-1.5"><HiOutlineCalendarDays className="h-3.5 w-3.5" /> Joined</span>
                                    </th>
                                    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.map((sub) => (
                                    <SubscriberRow
                                        key={sub.id}
                                        sub={sub}
                                        onSave={handleSave}
                                        onDelete={setToDelete}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {!loading && filtered.length > PAGE_SIZE && (
                <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-100">
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

            {/* Delete confirm modal */}
            {toDelete && (
                <DeleteModal
                    subscriber={toDelete}
                    onConfirm={handleDelete}
                    onCancel={() => setToDelete(null)}
                    busy={deleting}
                />
            )}
        </div>
    );
}
