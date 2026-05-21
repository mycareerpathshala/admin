'use client';

import { useEffect, useRef, useState } from 'react';
import {
    HiOutlineUser,
    HiOutlineEnvelope,
    HiOutlinePhone,
    HiOutlinePencilSquare,
    HiOutlineCheckCircle,
    HiOutlineXMark,
    HiOutlineShieldCheck,
    HiOutlineClock,
    HiOutlineCamera,
    HiOutlineArrowUpTray,
    HiOutlineLockClosed,
    HiOutlineEye,
    HiOutlineEyeSlash,
} from 'react-icons/hi2';
import { resolveAvatar } from '@/assets/utilities/resolveAvatar';
import DialCodeSelector, {
    DEFAULT_DIAL_COUNTRY,
    parsePhone,
    type DialCountry,
} from '@/assets/components/DialCodeSelector';

interface AdminProfile {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar: string;
    phone: string | null;
    adminRole: 'super' | 'admin' | 'editor' | 'counsellor';
    isVerified: boolean;
    createdAt: string;
}

const ROLE_LABELS: Record<AdminProfile['adminRole'], string> = {
    super:      'Super Admin',
    admin:      'Admin',
    editor:     'Editor',
    counsellor: 'Counsellor',
};

function Field({ label, value, icon: Icon }: { label: string; value: string | null; icon: React.ElementType }) {
    return (
        <div className="flex items-start gap-3 rounded-xl bg-slate-50 px-4 py-3.5">
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <div>
                <p className="text-xs text-slate-400">{label}</p>
                <p className="mt-0.5 text-sm font-medium text-slate-700">{value || <span className="text-slate-400">Not set</span>}</p>
            </div>
        </div>
    );
}

export default function AdminProfilePage() {
    const [profile, setProfile] = useState<AdminProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [saving, setSaving]   = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError]     = useState('');

    const [firstName, setFirstName]     = useState('');
    const [lastName, setLastName]       = useState('');
    const [dialCountry, setDialCountry] = useState<DialCountry>(DEFAULT_DIAL_COUNTRY);
    const [phoneNumber, setPhoneNumber] = useState('');

    // Password change state
    const [pwOpen, setPwOpen]               = useState(false);
    const [currentPw, setCurrentPw]         = useState('');
    const [newPw, setNewPw]                 = useState('');
    const [confirmPw, setConfirmPw]         = useState('');
    const [showCurrent, setShowCurrent]     = useState(false);
    const [showNew, setShowNew]             = useState(false);
    const [pwSaving, setPwSaving]           = useState(false);
    const [pwError, setPwError]             = useState('');
    const [pwSuccess, setPwSuccess]         = useState(false);

    // Avatar upload state
    const fileInputRef               = useRef<HTMLInputElement>(null);
    const [preview, setPreview]      = useState<string | null>(null);
    const [uploading, setUploading]  = useState(false);
    const [uploadError, setUploadError] = useState('');

    useEffect(() => {
        fetch('/api/profile')
            .then((r) => r.json())
            .then((d) => {
                const p = d.data as AdminProfile;
                setProfile(p);
                setFirstName(p.firstName);
                setLastName(p.lastName);
                const parsed = parsePhone(p.phone ?? '');
                setDialCountry(parsed.country);
                setPhoneNumber(parsed.number);
            })
            .finally(() => setLoading(false));
    }, []);

    // Clean up blob URL when preview changes or component unmounts
    useEffect(() => {
        return () => { if (preview) URL.revokeObjectURL(preview); };
    }, [preview]);

    function startEdit() {
        setError('');
        setSuccess(false);
        setEditing(true);
    }

    function cancelEdit() {
        if (!profile) return;
        setFirstName(profile.firstName);
        setLastName(profile.lastName);
        const parsed = parsePhone(profile.phone ?? '');
        setDialCountry(parsed.country);
        setPhoneNumber(parsed.number);
        setEditing(false);
        setError('');
    }

    async function handleSave() {
        if (!firstName.trim() || !lastName.trim()) {
            setError('First name and last name are required.');
            return;
        }
        setSaving(true);
        setError('');
        try {
            const res = await fetch('/api/profile', {
                method:  'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({
                    firstName: firstName.trim(),
                    lastName:  lastName.trim(),
                    phone:     phoneNumber.trim() ? `${dialCountry.dial} ${phoneNumber.trim()}` : null,
                }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error ?? 'Failed to save.'); return; }
            setProfile((prev) => prev ? { ...prev, ...data.data } : prev);
            setEditing(false);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setSaving(false);
        }
    }

    function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadError('');
        if (preview) URL.revokeObjectURL(preview);
        setPreview(URL.createObjectURL(file));
    }

    function cancelUpload() {
        if (preview) URL.revokeObjectURL(preview);
        setPreview(null);
        setUploadError('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    }

    async function handlePasswordChange() {
        if (!newPw || !currentPw) { setPwError('All fields are required.'); return; }
        if (newPw.length < 8)     { setPwError('New password must be at least 8 characters.'); return; }
        if (newPw !== confirmPw)  { setPwError('Passwords do not match.'); return; }
        setPwSaving(true);
        setPwError('');
        try {
            const res  = await fetch('/api/profile/password', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
            });
            const data = await res.json();
            if (!res.ok) { setPwError(data.error ?? 'Failed to update password.'); return; }
            setCurrentPw(''); setNewPw(''); setConfirmPw('');
            setPwOpen(false);
            setPwSuccess(true);
            setTimeout(() => setPwSuccess(false), 3000);
        } catch {
            setPwError('Something went wrong. Please try again.');
        } finally {
            setPwSaving(false);
        }
    }

    async function handleAvatarUpload() {
        const file = fileInputRef.current?.files?.[0];
        if (!file) return;
        setUploading(true);
        setUploadError('');
        const formData = new FormData();
        formData.append('avatar', file);
        try {
            const res  = await fetch('/api/profile/avatar', { method: 'POST', body: formData });
            const data = await res.json();
            if (!res.ok) { setUploadError(data.error ?? 'Upload failed.'); return; }
            setProfile((prev) => prev ? { ...prev, avatar: data.avatar } : prev);
            window.dispatchEvent(new CustomEvent('admin:avatar-updated', { detail: { avatar: data.avatar } }));
            cancelUpload();
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch {
            setUploadError('Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    }

    if (loading) {
        return (
            <div className="mx-auto max-w-3xl space-y-6">
                <div className="animate-pulse rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
                    <div className="flex items-center gap-5">
                        <div className="h-20 w-20 rounded-full bg-slate-100" />
                        <div className="space-y-2">
                            <div className="h-5 w-40 rounded bg-slate-100" />
                            <div className="h-4 w-56 rounded bg-slate-100" />
                        </div>
                    </div>
                </div>
                <div className="animate-pulse rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
                    <div className="grid grid-cols-2 gap-4">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-14 rounded-xl bg-slate-100" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!profile) return null;

    const avatarSrc = preview ?? resolveAvatar(profile.avatar);

    return (
        <div className="mx-auto max-w-3xl space-y-6">
            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleFileSelect}
            />

            {/* Avatar card */}
            <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-slate-900 to-slate-800 p-6 text-white">
                <div className="absolute -top-8 -right-8 h-32 w-32 rounded-full bg-primary/20 blur-2xl" />
                <div className="relative z-10 flex items-center gap-5">
                    {/* Avatar with upload overlay */}
                    <div className="relative h-20 w-20 shrink-0">
                        <div className="group relative h-20 w-20 overflow-hidden rounded-full ring-4 ring-white/20">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={avatarSrc}
                                alt={`${profile.firstName} ${profile.lastName}`}
                                className="h-full w-full object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).src = '/img/profile/images/admin_default.png'; }}
                            />
                            {!preview && (
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100"
                                    title="Change photo"
                                >
                                    <HiOutlineCamera className="h-6 w-6 text-white" />
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h2 className="text-xl font-bold">{profile.firstName} {profile.lastName}</h2>
                            {profile.isVerified && (
                                <HiOutlineShieldCheck className="h-5 w-5 text-primary-light" />
                            )}
                        </div>
                        <p className="text-sm text-slate-400">{profile.email}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                            <span className="rounded-full bg-primary/20 px-3 py-0.5 text-xs font-semibold text-primary-light">
                                {ROLE_LABELS[profile.adminRole]}
                            </span>
                            {profile.isVerified && (
                                <span className="rounded-full bg-emerald-500/20 px-3 py-0.5 text-xs font-semibold text-emerald-300">
                                    Verified
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="text-right text-xs text-slate-400">
                        <p className="flex items-center justify-end gap-1">
                            <HiOutlineClock className="h-3 w-3" />
                            Member since
                        </p>
                        <p className="mt-0.5 font-medium text-slate-300">
                            {new Date(profile.createdAt).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                        </p>
                    </div>
                </div>

                {/* Avatar upload confirmation bar */}
                {preview && (
                    <div className="relative z-10 mt-4 flex items-center justify-between rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm">
                        {uploadError ? (
                            <p className="text-sm text-red-300">{uploadError}</p>
                        ) : (
                            <p className="text-sm text-slate-300">Photo selected — save to apply.</p>
                        )}
                        <div className="flex items-center gap-2">
                            <button
                                onClick={cancelUpload}
                                disabled={uploading}
                                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:bg-white/10 disabled:opacity-50"
                            >
                                <HiOutlineXMark className="h-3.5 w-3.5" />
                                Cancel
                            </button>
                            <button
                                onClick={handleAvatarUpload}
                                disabled={uploading}
                                className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60"
                            >
                                {uploading ? (
                                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                ) : (
                                    <HiOutlineArrowUpTray className="h-3.5 w-3.5" />
                                )}
                                {uploading ? 'Saving…' : 'Save Photo'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Profile details card */}
            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                    <h3 className="font-semibold text-slate-800">Profile Information</h3>
                    {!editing && (
                        <button
                            onClick={startEdit}
                            className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-2 text-sm font-semibold text-primary transition hover:bg-primary/20"
                        >
                            <HiOutlinePencilSquare className="h-4 w-4" />
                            Edit
                        </button>
                    )}
                </div>

                <div className="p-6">
                    {success && (
                        <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 ring-1 ring-emerald-100">
                            <HiOutlineCheckCircle className="h-4 w-4 shrink-0" />
                            Profile updated successfully.
                        </div>
                    )}
                    {error && (
                        <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 ring-1 ring-red-100">
                            {error}
                        </div>
                    )}

                    {editing ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                {/* First name */}
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">First Name</label>
                                    <div className="relative">
                                        <HiOutlineUser className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-4 pl-10 text-sm text-slate-800 outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                                        />
                                    </div>
                                </div>
                                {/* Last name */}
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Last Name</label>
                                    <div className="relative">
                                        <HiOutlineUser className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                        <input
                                            type="text"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-4 pl-10 text-sm text-slate-800 outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                                        />
                                    </div>
                                </div>
                                {/* Phone */}
                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Phone</label>
                                    <div className="flex gap-2">
                                        <DialCodeSelector value={dialCountry} onChange={setDialCountry} />
                                        <input
                                            type="tel"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            placeholder="Enter number"
                                            className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={cancelEdit}
                                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                                >
                                    <HiOutlineXMark className="h-4 w-4" />
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60"
                                >
                                    {saving ? (
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    ) : (
                                        <HiOutlineCheckCircle className="h-4 w-4" />
                                    )}
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <Field label="First Name"   value={profile.firstName}                        icon={HiOutlineUser} />
                            <Field label="Last Name"    value={profile.lastName}                         icon={HiOutlineUser} />
                            <Field label="Email"        value={profile.email}                            icon={HiOutlineEnvelope} />
                            <Field label="Phone"        value={profile.phone}                            icon={HiOutlinePhone} />
                            <Field label="Role"         value={ROLE_LABELS[profile.adminRole]}           icon={HiOutlineShieldCheck} />
                            <Field label="Member Since" value={new Date(profile.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })} icon={HiOutlineClock} />
                        </div>
                    )}
                </div>
            </div>

            {/* Change password card */}
            <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
                <button
                    onClick={() => { setPwOpen((o) => !o); setPwError(''); }}
                    className="flex w-full items-center justify-between px-6 py-4"
                >
                    <div className="flex items-center gap-2">
                        <HiOutlineLockClosed className="h-4 w-4 text-slate-400" />
                        <h3 className="font-semibold text-slate-800">Change Password</h3>
                    </div>
                    <span className="text-xs font-medium text-primary">{pwOpen ? 'Cancel' : 'Update'}</span>
                </button>

                {pwOpen && (
                    <div className="border-t border-slate-100 px-6 pb-6 pt-4">
                        {pwSuccess && (
                            <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 ring-1 ring-emerald-100">
                                <HiOutlineCheckCircle className="h-4 w-4 shrink-0" />
                                Password updated successfully.
                            </div>
                        )}
                        {pwError && (
                            <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 ring-1 ring-red-100">
                                {pwError}
                            </div>
                        )}
                        <div className="space-y-4">
                            {/* Current password */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">Current Password</label>
                                <div className="relative">
                                    <HiOutlineLockClosed className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type={showCurrent ? 'text' : 'password'}
                                        value={currentPw}
                                        onChange={(e) => setCurrentPw(e.target.value)}
                                        placeholder="Enter current password"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-10 pl-10 text-sm text-slate-800 outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                                    />
                                    <button type="button" onClick={() => setShowCurrent((v) => !v)} className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                        {showCurrent ? <HiOutlineEyeSlash className="h-4 w-4" /> : <HiOutlineEye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                            {/* New password */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">New Password</label>
                                <div className="relative">
                                    <HiOutlineLockClosed className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type={showNew ? 'text' : 'password'}
                                        value={newPw}
                                        onChange={(e) => setNewPw(e.target.value)}
                                        placeholder="At least 8 characters"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-10 pl-10 text-sm text-slate-800 outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                                    />
                                    <button type="button" onClick={() => setShowNew((v) => !v)} className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                        {showNew ? <HiOutlineEyeSlash className="h-4 w-4" /> : <HiOutlineEye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                            {/* Confirm */}
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-slate-700">Confirm New Password</label>
                                <div className="relative">
                                    <HiOutlineLockClosed className="absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type="password"
                                        value={confirmPw}
                                        onChange={(e) => setConfirmPw(e.target.value)}
                                        placeholder="Re-enter new password"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-4 pl-10 text-sm text-slate-800 outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                                    />
                                </div>
                            </div>
                            <div className="pt-1">
                                <button
                                    onClick={handlePasswordChange}
                                    disabled={pwSaving}
                                    className="flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:opacity-60"
                                >
                                    {pwSaving ? (
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    ) : (
                                        <HiOutlineLockClosed className="h-4 w-4" />
                                    )}
                                    Update Password
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Change photo hint */}
            {!preview && (
                <p className="text-center text-xs text-slate-400">
                    Hover over your photo and click the camera icon to change it.{' '}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="font-medium text-primary underline-offset-2 hover:underline"
                    >
                        Or click here
                    </button>
                </p>
            )}
        </div>
    );
}
