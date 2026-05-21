'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
    HiOutlineUserGroup,
    HiOutlinePencilSquare,
    HiOutlineTrash,
    HiOutlineXMark,
    HiOutlineCheckCircle,
    HiOutlineExclamationTriangle,
    HiOutlinePlus,
    HiOutlineShieldCheck,
    HiOutlineLockClosed,
    HiOutlineEye,
    HiOutlineEyeSlash,
    HiOutlineCalendarDays,
    HiOutlineEnvelope,
    HiOutlineClipboardDocument,
    HiOutlineClipboardDocumentCheck,
    HiOutlinePaperAirplane,
    HiOutlineArrowPath,
} from 'react-icons/hi2';
import { resolveAvatar } from '@/assets/utilities/resolveAvatar';

// ── Types ──────────────────────────────────────────────────────────────────────

type AdminRole = 'super' | 'admin' | 'editor' | 'counsellor';

interface AdminRow {
    id:         string;
    firstName:  string;
    lastName:   string;
    email:      string;
    avatar:     string;
    phone:      string | null;
    adminRole:  AdminRole;
    isVerified: boolean;
    createdAt:  string;
}

// ── Config ─────────────────────────────────────────────────────────────────────

const ROLE_CONFIG: Record<AdminRole, { label: string; color: string; bg: string }> = {
    super:      { label: 'Super Admin', color: 'text-primary',    bg: 'bg-primary/10' },
    admin:      { label: 'Admin',       color: 'text-blue-700',   bg: 'bg-blue-100' },
    editor:     { label: 'Editor',      color: 'text-violet-700', bg: 'bg-violet-100' },
    counsellor: { label: 'Counsellor',  color: 'text-emerald-700',bg: 'bg-emerald-100' },
};

function roleLabel(role: AdminRole) {
    return ROLE_CONFIG[role]?.label ?? role;
}

function generatePassword(): string {
    const upper   = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lower   = 'abcdefghijklmnopqrstuvwxyz';
    const digits  = '0123456789';
    const special = '!@#$%^&*';
    const all     = upper + lower + digits + special;
    let pw =
        upper  [Math.floor(Math.random() * upper.length)]   +
        lower  [Math.floor(Math.random() * lower.length)]   +
        digits [Math.floor(Math.random() * digits.length)]  +
        special[Math.floor(Math.random() * special.length)];
    for (let i = pw.length; i < 12; i++) pw += all[Math.floor(Math.random() * all.length)];
    return pw.split('').sort(() => Math.random() - 0.5).join('');
}

function RoleBadge({ role }: { role: AdminRole }) {
    const c = ROLE_CONFIG[role];
    return (
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${c.bg} ${c.color}`}>
            <HiOutlineShieldCheck className="h-3 w-3" />
            {c.label}
        </span>
    );
}

function SkeletonRow() {
    return (
        <tr className="animate-pulse border-b border-slate-50">
            {Array.from({ length: 5 }).map((_, i) => (
                <td key={i} className="px-4 py-4">
                    <div className="h-4 rounded bg-slate-100" style={{ width: `${50 + (i * 20) % 40}%` }} />
                </td>
            ))}
        </tr>
    );
}

// ── Create / Edit Modal ────────────────────────────────────────────────────────

interface ModalProps {
    mode:           'create' | 'edit';
    target?:        AdminRow;
    sessionRole:    string;
    onSave:         (data: Record<string, unknown>) => Promise<void>;
    onClose:        () => void;
}

function AdminModal({ mode, target, sessionRole, onSave, onClose }: ModalProps) {
    const [firstName,   setFirstName]   = useState(target?.firstName ?? '');
    const [lastName,    setLastName]    = useState(target?.lastName  ?? '');
    const [email,       setEmail]       = useState(target?.email     ?? '');
    const [phone,       setPhone]       = useState(target?.phone     ?? '');
    const [role,        setRole]        = useState<AdminRole>(
        mode === 'edit' ? target!.adminRole : (sessionRole === 'super' ? 'admin' : 'editor'),
    );
    const [password,    setPassword]    = useState('');
    const [showPw,      setShowPw]      = useState(false);
    const [saving,      setSaving]      = useState(false);
    const [error,       setError]       = useState('');

    const allowedRoles: AdminRole[] = sessionRole === 'super'
        ? ['admin', 'editor', 'counsellor']
        : ['editor', 'counsellor'];

    async function handleSave() {
        setError('');
        const data: Record<string, unknown> = { firstName, lastName, role, phone: phone || null };
        if (mode === 'create') {
            if (!email.trim()) { setError('Email is required.'); return; }
            if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }
            data.email    = email.trim().toLowerCase();
            data.password = password;
            data.adminRole = role;
        } else {
            data.adminRole = role;
            if (password) {
                if (password.length < 8) { setError('New password must be at least 8 characters.'); return; }
                data.newPassword = password;
            }
        }
        if (!firstName.trim() || !lastName.trim()) { setError('Name fields are required.'); return; }

        setSaving(true);
        try {
            await onSave(data);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'Something went wrong.');
        } finally {
            setSaving(false);
        }
    }

    const inputCls = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                    <h3 className="font-semibold text-slate-800">
                        {mode === 'create' ? 'Create Admin Account' : 'Edit Admin'}
                    </h3>
                    <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
                        <HiOutlineXMark className="h-5 w-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="space-y-4 px-6 py-5">
                    {error && (
                        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 ring-1 ring-red-100">{error}</div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="mb-1 block text-xs font-medium text-slate-600">First Name</label>
                            <input className={inputCls} value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Jane" />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-medium text-slate-600">Last Name</label>
                            <input className={inputCls} value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" />
                        </div>
                    </div>

                    {mode === 'create' && (
                        <div>
                            <label className="mb-1 block text-xs font-medium text-slate-600">Email</label>
                            <input type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jane@example.com" />
                        </div>
                    )}

                    <div>
                        <label className="mb-1 block text-xs font-medium text-slate-600">Phone (optional)</label>
                        <input type="tel" className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+880 1234 567890" />
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-medium text-slate-600">Role</label>
                        <div className="flex flex-wrap gap-2">
                            {allowedRoles.map((r) => (
                                <button
                                    key={r}
                                    type="button"
                                    onClick={() => setRole(r)}
                                    className={[
                                        'flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition',
                                        role === r
                                            ? `${ROLE_CONFIG[r].bg} ${ROLE_CONFIG[r].color} ring-1 ring-current/20`
                                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200',
                                    ].join(' ')}
                                >
                                    <HiOutlineShieldCheck className="h-3.5 w-3.5" />
                                    {roleLabel(r)}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="mb-1 block text-xs font-medium text-slate-600">
                            {mode === 'create' ? 'Password' : 'New Password (leave blank to keep current)'}
                        </label>
                        <div className="flex items-center gap-2">
                            {mode === 'create' && (
                                <button
                                    type="button"
                                    onClick={() => { setPassword(generatePassword()); setShowPw(true); }}
                                    className="flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-800"
                                >
                                    <HiOutlineArrowPath className="h-3.5 w-3.5" />
                                    Generate
                                </button>
                            )}
                            <div className="relative flex-1">
                                <HiOutlineLockClosed className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                <input
                                    type={showPw ? 'text' : 'password'}
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-10 pl-9 text-sm text-slate-800 outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder={mode === 'create' ? 'Min 8 characters' : 'Leave blank to keep current'}
                                />
                                <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                    {showPw ? <HiOutlineEyeSlash className="h-4 w-4" /> : <HiOutlineEye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
                    <button onClick={onClose} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60"
                    >
                        {saving ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : (
                            mode === 'create' ? 'Create Account' : 'Save Changes'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Delete Confirm ─────────────────────────────────────────────────────────────

function ConfirmDeleteModal({ target, onConfirm, onCancel, deleting }: {
    target:    AdminRow;
    onConfirm: () => void;
    onCancel:  () => void;
    deleting:  boolean;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                    <HiOutlineExclamationTriangle className="h-6 w-6 text-red-500" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-slate-800">Delete Admin Account</h3>
                <p className="mt-2 text-sm text-slate-500">
                    Are you sure you want to delete <strong>{target.firstName} {target.lastName}</strong>&apos;s account
                    ({target.email})? This cannot be undone.
                </p>
                <div className="mt-6 flex gap-3">
                    <button onClick={onCancel} className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50">
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={deleting}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 py-2.5 text-sm font-medium text-white transition hover:bg-red-600 disabled:opacity-60"
                    >
                        {deleting ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Credentials Modal ──────────────────────────────────────────────────────────

function CredentialsModal({ email, password, onClose }: { email: string; password: string; onClose: () => void }) {
    const [copiedEmail, setCopiedEmail]   = useState(false);
    const [copiedPass,  setCopiedPass]    = useState(false);
    const [copiedShare, setCopiedShare]   = useState(false);

    function copy(text: string, setter: (v: boolean) => void) {
        navigator.clipboard.writeText(text).then(() => {
            setter(true);
            setTimeout(() => setter(false), 2000);
        });
    }

    function share() {
        const msg =
            `Your MyCareerPathshala admin account credentials:\n\n` +
            `Email: ${email}\n` +
            `Password: ${password}\n\n` +
            `Please change your password after your first login.`;
        copy(msg, setCopiedShare);
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50">
                            <HiOutlineCheckCircle className="h-5 w-5 text-emerald-500" />
                        </div>
                        <h3 className="font-semibold text-slate-800">Account Created</h3>
                    </div>
                    <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100">
                        <HiOutlineXMark className="h-5 w-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="space-y-4 px-6 py-5">
                    <p className="text-sm text-slate-500">
                        Save or share these credentials. The password won&apos;t be shown again.
                    </p>

                    {/* Email */}
                    <div>
                        <label className="mb-1 block text-xs font-medium text-slate-600">Email</label>
                        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                            <span className="flex-1 font-mono text-sm text-slate-800">{email}</span>
                            <button
                                type="button"
                                onClick={() => copy(email, setCopiedEmail)}
                                className="shrink-0 rounded-lg p-1 text-slate-400 transition hover:bg-slate-200 hover:text-slate-600"
                                title="Copy email"
                            >
                                {copiedEmail
                                    ? <HiOutlineClipboardDocumentCheck className="h-4 w-4 text-emerald-500" />
                                    : <HiOutlineClipboardDocument className="h-4 w-4" />
                                }
                            </button>
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="mb-1 block text-xs font-medium text-slate-600">Password</label>
                        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
                            <span className="flex-1 font-mono text-sm text-slate-800">{password}</span>
                            <button
                                type="button"
                                onClick={() => copy(password, setCopiedPass)}
                                className="shrink-0 rounded-lg p-1 text-slate-400 transition hover:bg-slate-200 hover:text-slate-600"
                                title="Copy password"
                            >
                                {copiedPass
                                    ? <HiOutlineClipboardDocumentCheck className="h-4 w-4 text-emerald-500" />
                                    : <HiOutlineClipboardDocument className="h-4 w-4" />
                                }
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
                    <button
                        type="button"
                        onClick={share}
                        className={[
                            'flex flex-1 items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-semibold transition',
                            copiedShare
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
                                : 'border-slate-200 text-slate-600 hover:bg-slate-50',
                        ].join(' ')}
                    >
                        {copiedShare
                            ? <><HiOutlineClipboardDocumentCheck className="h-4 w-4" /> Copied!</>
                            : <><HiOutlinePaperAirplane className="h-4 w-4" /> Share</>
                        }
                    </button>
                    <button
                        onClick={onClose}
                        className="flex flex-1 items-center justify-center rounded-xl bg-primary py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function AdminsPage() {
    const router = useRouter();
    const [sessionRole, setSessionRole] = useState<string | null>(null);
    const [sessionId,   setSessionId]   = useState<string | null>(null);
    const [rows,        setRows]        = useState<AdminRow[]>([]);
    const [loading,     setLoading]     = useState(true);
    const [toast,       setToast]       = useState('');

    const [createOpen,    setCreateOpen]    = useState(false);
    const [editTarget,    setEditTarget]    = useState<AdminRow | null>(null);
    const [deleteTarget,  setDeleteTarget]  = useState<AdminRow | null>(null);
    const [deleting,      setDeleting]      = useState(false);
    const [createdCreds,  setCreatedCreds]  = useState<{ email: string; password: string } | null>(null);
    const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    function showToast(msg: string) {
        setToast(msg);
        if (toastTimer.current) clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToast(''), 3000);
    }

    // Guard: only super and admin can visit this page
    useEffect(() => {
        fetch('/api/auth/me')
            .then((r) => r.json())
            .then((s) => {
                if (!s || (s.adminRole !== 'super' && s.adminRole !== 'admin')) {
                    router.replace('/dashboard');
                } else {
                    setSessionRole(s.adminRole);
                    setSessionId(s.userId);
                }
            });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!sessionRole) return;
        fetch('/api/admins')
            .then((r) => r.json())
            .then((d) => setRows(d.data ?? []))
            .finally(() => setLoading(false));
    }, [sessionRole]);

    function canActOnRow(row: AdminRow): boolean {
        if (!sessionRole) return false;
        if (sessionRole === 'super') return true;
        return row.adminRole === 'editor' || row.adminRole === 'counsellor';
    }

    async function handleCreate(data: Record<string, unknown>) {
        const res  = await fetch('/api/admins', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? 'Failed to create admin.');
        setRows((prev) => [json.data, ...prev]);
        setCreateOpen(false);
        setCreatedCreds({ email: data.email as string, password: data.password as string });
        showToast('Admin account created.');
    }

    async function handleEdit(data: Record<string, unknown>) {
        if (!editTarget) return;
        const res  = await fetch(`/api/admins/${editTarget.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? 'Failed to update admin.');
        setRows((prev) => prev.map((r) => r.id === editTarget.id ? { ...r, ...json.data } : r));
        setEditTarget(null);
        showToast('Admin updated.');
    }

    async function confirmDelete() {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            const res = await fetch(`/api/admins/${deleteTarget.id}`, { method: 'DELETE' });
            if (!res.ok) { const j = await res.json(); showToast(j.error ?? 'Delete failed.'); return; }
            setRows((prev) => prev.filter((r) => r.id !== deleteTarget.id));
            setDeleteTarget(null);
            showToast('Admin account deleted.');
        } finally {
            setDeleting(false);
        }
    }

    if (!sessionRole) return null;

    return (
        <div className="mx-auto max-w-5xl space-y-6">
            {/* Toast */}
            {toast && (
                <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-slate-800 px-4 py-3 text-sm font-medium text-white shadow-lg">
                    <HiOutlineCheckCircle className="h-4 w-4 text-emerald-400" />
                    {toast}
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-slate-800">Admin Accounts</h2>
                    <p className="text-sm text-slate-400">
                        {loading ? 'Loading…' : `${rows.length} account${rows.length !== 1 ? 's' : ''}`}
                    </p>
                </div>
                <button
                    onClick={() => setCreateOpen(true)}
                    className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark"
                >
                    <HiOutlinePlus className="h-4 w-4" />
                    New Admin
                </button>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-slate-100 bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Admin</th>
                                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Role</th>
                                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Contact</th>
                                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Joined</th>
                                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading
                                ? Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
                                : rows.length === 0
                                    ? (
                                        <tr>
                                            <td colSpan={5} className="py-16 text-center">
                                                <div className="flex flex-col items-center gap-2 text-slate-400">
                                                    <HiOutlineUserGroup className="h-10 w-10" />
                                                    <p className="text-sm font-medium">No admin accounts found</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                    : rows.map((row) => (
                                        <tr key={row.id} className={`border-b border-slate-50 transition hover:bg-slate-50/60 ${row.id === sessionId ? 'bg-primary/5' : ''}`}>
                                            {/* Name + email */}
                                            <td className="px-4 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img
                                                        src={resolveAvatar(row.avatar)}
                                                        alt={`${row.firstName} ${row.lastName}`}
                                                        className="h-8 w-8 shrink-0 rounded-full object-cover"
                                                        onError={(e) => { (e.target as HTMLImageElement).src = '/img/profile/images/admin_default.png'; }}
                                                    />
                                                    <div>
                                                        <p className="font-medium text-slate-700">
                                                            {row.firstName} {row.lastName}
                                                            {row.id === sessionId && (
                                                                <span className="ml-2 text-[10px] font-semibold text-primary">(you)</span>
                                                            )}
                                                        </p>
                                                        <p className="text-xs text-slate-400">{row.email}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Role */}
                                            <td className="px-4 py-3.5"><RoleBadge role={row.adminRole} /></td>

                                            {/* Contact */}
                                            <td className="px-4 py-3.5 text-xs text-slate-500">
                                                <div className="space-y-0.5">
                                                    <p className="flex items-center gap-1"><HiOutlineEnvelope className="h-3.5 w-3.5 shrink-0" />{row.email}</p>
                                                    {row.phone && <p>{row.phone}</p>}
                                                </div>
                                            </td>

                                            {/* Joined */}
                                            <td className="px-4 py-3.5">
                                                <span className="flex items-center gap-1 text-xs text-slate-500">
                                                    <HiOutlineCalendarDays className="h-3.5 w-3.5 shrink-0" />
                                                    {new Date(row.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-4 py-3.5">
                                                {canActOnRow(row) ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <button
                                                            onClick={() => setEditTarget(row)}
                                                            className="rounded-lg p-2 text-slate-400 transition hover:bg-primary/10 hover:text-primary"
                                                            title="Edit"
                                                        >
                                                            <HiOutlinePencilSquare className="h-4 w-4" />
                                                        </button>
                                                        {row.id !== sessionId && (
                                                            <button
                                                                onClick={() => setDeleteTarget(row)}
                                                                className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                                                                title="Delete"
                                                            >
                                                                <HiOutlineTrash className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-slate-300">—</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                            }
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create modal */}
            {createOpen && (
                <AdminModal mode="create" sessionRole={sessionRole} onSave={handleCreate} onClose={() => setCreateOpen(false)} />
            )}

            {/* Edit modal */}
            {editTarget && (
                <AdminModal mode="edit" target={editTarget} sessionRole={sessionRole} onSave={handleEdit} onClose={() => setEditTarget(null)} />
            )}

            {/* Delete confirm */}
            {deleteTarget && (
                <ConfirmDeleteModal
                    target={deleteTarget}
                    onConfirm={confirmDelete}
                    onCancel={() => setDeleteTarget(null)}
                    deleting={deleting}
                />
            )}

            {/* Credentials popup */}
            {createdCreds && (
                <CredentialsModal
                    email={createdCreds.email}
                    password={createdCreds.password}
                    onClose={() => setCreatedCreds(null)}
                />
            )}
        </div>
    );
}
