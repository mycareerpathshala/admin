'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
    HiOutlineArrowLeft,
    HiOutlineEnvelope,
    HiOutlinePhone,
    HiOutlineGlobeAlt,
    HiOutlineUser,
    HiOutlineCake,
    HiOutlineShieldCheck,
    HiOutlineIdentification,
    HiOutlineClock,
    HiOutlineAtSymbol,
    HiOutlineAcademicCap,
    HiOutlineBuildingLibrary,
    HiOutlineCalendarDays,
    HiOutlineChatBubbleLeftRight,
    HiOutlineClipboardDocumentList,
    HiOutlineExclamationCircle,
    HiOutlineBookmarkSquare,
    HiOutlineAdjustmentsHorizontal,
} from 'react-icons/hi2';
import { SiGooglemeet, SiZoom } from 'react-icons/si';

function MeetingBadge({ url }: { url: string }) {
    const isGoogleMeet = url.includes('meet.google.com');
    const isZoom       = url.includes('zoom.us') || url.includes('zoom.com');
    if (isGoogleMeet) return (
        <a href={url} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700 ring-1 ring-green-200 transition hover:bg-green-100">
            <SiGooglemeet className="h-3.5 w-3.5" /> Join on Google Meet
        </a>
    );
    if (isZoom) return (
        <a href={url} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-200 transition hover:bg-blue-100">
            <SiZoom className="h-3.5 w-3.5" /> Join on Zoom
        </a>
    );
    return (
        <a href={url} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-100">
            Join Meeting →
        </a>
    );
}

interface Application {
    id: string;
    universityId: string | null;
    courseId: string | null;
    status: string;
    notes: string | null;
    createdAt: string;
    universityName: string;
    universityCountry: string | null;
    courseName: string;
    courseLevel: string | null;
}

interface CounsellingRequest {
    id: string;
    name: string;
    email: string;
    phone: string;
    studyLevel: string;
    message: string;
    status: string;
    scheduledTime: string | null;
    meetingLink: string | null;
    preferredDays: string[];
    preferredTimeRanges: string[];
    createdAt: string;
}

interface Preference {
    id: string;
    name: string;
    countryFilter: string | null;
    countryName: string | null;
    streamFilter: string | null;
    streamName: string | null;
    levelFilter: string | null;
    deliveryMethodFilter: string | null;
    studyLanguageFilter: string | null;
    courseOfferingFilter: string | null;
    createdAt: string;
}

interface StudentDetail {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    avatar: string;
    phone: string | null;
    dateOfBirth: string | null;
    gender: string | null;
    country: string | null;
    secondaryEmail: string | null;
    isVerified: boolean;
    createdAt: string;
    updatedAt: string;
    applications: Application[];
    counsellingRequests: CounsellingRequest[];
    preferences: Preference[];
}

const APP_STATUS: Record<string, { label: string; className: string }> = {
    draft:          { label: 'Draft',          className: 'bg-slate-100 text-slate-500 ring-1 ring-slate-200' },
    submitted:      { label: 'Submitted',      className: 'bg-blue-50 text-blue-600 ring-1 ring-blue-200' },
    under_review:   { label: 'Under Review',   className: 'bg-amber-50 text-amber-600 ring-1 ring-amber-200' },
    offer_received: { label: 'Offer Received', className: 'bg-violet-50 text-violet-600 ring-1 ring-violet-200' },
    accepted:       { label: 'Accepted',       className: 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200' },
    rejected:       { label: 'Rejected',       className: 'bg-red-50 text-red-500 ring-1 ring-red-200' },
    withdrawn:      { label: 'Withdrawn',      className: 'bg-slate-100 text-slate-500 ring-1 ring-slate-200' },
};

const REQ_STATUS: Record<string, { label: string; className: string }> = {
    pending:   { label: 'Pending',   className: 'bg-amber-50 text-amber-600 ring-1 ring-amber-200' },
    scheduled: { label: 'Scheduled', className: 'bg-violet-50 text-violet-600 ring-1 ring-violet-200' },
    completed: { label: 'Completed', className: 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200' },
    cancelled: { label: 'Cancelled', className: 'bg-red-50 text-red-500 ring-1 ring-red-200' },
};

function StatusBadge({ status, map }: { status: string; map: Record<string, { label: string; className: string }> }) {
    const cfg = map[status] ?? { label: status, className: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200' };
    return (
        <span className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${cfg.className}`}>
            {cfg.label}
        </span>
    );
}

function InfoRow({ icon: Icon, label, value, wide }: { icon: React.ElementType; label: string; value: string | null | undefined; wide?: boolean }) {
    return (
        <div className={`flex items-start gap-3 rounded-xl bg-slate-50 px-4 py-3 ${wide ? 'col-span-2' : ''}`}>
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
            <div className="min-w-0 flex-1">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{label}</p>
                <p className="mt-0.5 break-all text-sm font-medium text-slate-700">
                    {value ?? <span className="font-normal text-slate-400">Not provided</span>}
                </p>
            </div>
        </div>
    );
}

function SectionCard({ icon: Icon, title, count, children }: { icon: React.ElementType; title: string; count: number; children: React.ReactNode }) {
    return (
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <div className="mb-4 flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-4 w-4 text-primary" />
                </div>
                <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">{count}</span>
            </div>
            {children}
        </div>
    );
}

function EmptyState({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
    return (
        <div className="flex flex-col items-center gap-2 rounded-xl bg-slate-50 py-10">
            <Icon className="h-8 w-8 text-slate-300" />
            <p className="text-sm text-slate-400">{label}</p>
        </div>
    );
}

export default function StudentDetailPage() {
    const { id } = useParams<{ id: string }>();
    const router  = useRouter();
    const [student, setStudent] = useState<StudentDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(false);

    useEffect(() => {
        fetch(`/api/users/${id}`)
            .then((r) => { if (!r.ok) throw new Error(); return r.json(); })
            .then((d) => setStudent(d.data))
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return (
            <div className="mx-auto max-w-5xl animate-pulse space-y-4">
                <div className="h-8 w-40 rounded-lg bg-slate-200" />
                <div className="h-64 rounded-3xl bg-slate-200" />
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-16 rounded-xl bg-slate-200" />)}
                </div>
                <div className="h-40 rounded-2xl bg-slate-200" />
                <div className="h-40 rounded-2xl bg-slate-200" />
            </div>
        );
    }

    if (error || !student) {
        return (
            <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 rounded-2xl bg-white py-20 shadow-sm ring-1 ring-slate-100">
                <HiOutlineExclamationCircle className="h-12 w-12 text-red-300" />
                <p className="font-medium text-slate-500">Student not found</p>
                <Link href="/students" className="text-sm font-semibold text-primary hover:underline">Back to Students</Link>
            </div>
        );
    }

    const fullName = `${student.firstName} ${student.lastName}`;

    return (
        <div className="mx-auto max-w-5xl space-y-6">
            {/* Back */}
            <button
                onClick={() => router.back()}
                className="flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-800"
            >
                <HiOutlineArrowLeft className="h-4 w-4" />
                Back
            </button>

            {/* Hero card */}
            <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-slate-100">
                <div
                    className="relative px-6 pt-10 pb-20 text-center"
                    style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #0f172a 100%)' }}
                >
                    <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 15% 50%, #005fe230 0%, transparent 55%), radial-gradient(circle at 85% 20%, #6366f130 0%, transparent 55%)' }} />
                    <div className="absolute bottom-0 left-0 right-0 h-8 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
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
                            <h1 className="text-2xl font-bold text-white">{fullName}</h1>
                            <p className="mt-0.5 text-sm text-slate-300">{student.email}</p>
                        </div>
                        <div className="flex flex-wrap justify-center gap-2">
                            <span className="rounded-full bg-primary/25 px-3 py-1 text-xs font-semibold text-primary-light">Student</span>
                            {student.isVerified
                                ? <span className="flex items-center gap-1 rounded-full bg-emerald-500/25 px-3 py-1 text-xs font-semibold text-emerald-300">
                                    <HiOutlineShieldCheck className="h-3 w-3" /> Verified
                                  </span>
                                : <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-400">Unverified</span>
                            }
                        </div>
                    </div>
                </div>

                <div className="relative z-20 -mt-10 mx-5 mb-5 rounded-2xl bg-white p-5 shadow-lg ring-1 ring-slate-100">
                    <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Personal Information</p>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                        <InfoRow icon={HiOutlineEnvelope}       label="Email"           value={student.email} wide />
                        <InfoRow icon={HiOutlinePhone}          label="Phone"           value={student.phone} />
                        <InfoRow icon={HiOutlineGlobeAlt}       label="Country"         value={student.country} />
                        <InfoRow icon={HiOutlineUser}           label="Gender"          value={student.gender ? student.gender.charAt(0).toUpperCase() + student.gender.slice(1).replace(/-/g, ' ') : null} />
                        <InfoRow icon={HiOutlineCake}           label="Date of Birth"   value={student.dateOfBirth ? new Date(student.dateOfBirth).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : null} />
                        <InfoRow icon={HiOutlineAtSymbol}       label="Secondary Email" value={student.secondaryEmail} wide />
                        <InfoRow icon={HiOutlineClock}          label="Member Since"    value={new Date(student.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })} />
                        <InfoRow icon={HiOutlineIdentification} label="User ID"         value={student.id} />
                    </div>
                </div>
            </div>

            {/* Applications */}
            <SectionCard icon={HiOutlineClipboardDocumentList} title="Applications" count={student.applications.length}>
                {student.applications.length === 0 ? (
                    <EmptyState icon={HiOutlineClipboardDocumentList} label="No applications yet" />
                ) : (
                    <div className="space-y-2">
                        {student.applications.map((app) => (
                            <div key={app.id} className="flex flex-col gap-2 rounded-xl bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-start gap-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                                        <HiOutlineBuildingLibrary className="h-4 w-4 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-800">{app.universityName}</p>
                                        <p className="mt-0.5 text-xs text-slate-500">
                                            {app.courseName}
                                            {app.courseLevel && <span className="ml-1 text-slate-400">· {app.courseLevel}</span>}
                                            {app.universityCountry && <span className="ml-1 text-slate-400">· {app.universityCountry}</span>}
                                        </p>
                                        {app.notes && (
                                            <p className="mt-1 text-[11px] italic text-slate-400">{app.notes}</p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                                    <StatusBadge status={app.status} map={APP_STATUS} />
                                    <span className="flex items-center gap-1 text-[11px] text-slate-400">
                                        <HiOutlineCalendarDays className="h-3 w-3" />
                                        {new Date(app.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </SectionCard>

            {/* Counselling Requests */}
            <SectionCard icon={HiOutlineChatBubbleLeftRight} title="Counselling Requests" count={student.counsellingRequests.length}>
                {student.counsellingRequests.length === 0 ? (
                    <EmptyState icon={HiOutlineChatBubbleLeftRight} label="No counselling requests yet" />
                ) : (
                    <div className="space-y-2">
                        {student.counsellingRequests.map((req) => (
                            <div key={req.id} className="rounded-xl bg-slate-50 p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-3">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50">
                                            <HiOutlineAcademicCap className="h-4 w-4 text-violet-500" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-slate-800">{req.studyLevel}</p>
                                            <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-slate-400">
                                                <span>{req.name}</span>
                                                <span>{req.email}</span>
                                                <span>{req.phone}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <StatusBadge status={req.status} map={REQ_STATUS} />
                                </div>

                                <p className="mt-3 rounded-lg bg-white px-3 py-2 text-sm text-slate-600 ring-1 ring-slate-100">
                                    {req.message}
                                </p>

                                <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-slate-500">
                                    {req.preferredDays.length > 0 && (
                                        <span className="flex items-center gap-1">
                                            <HiOutlineCalendarDays className="h-3.5 w-3.5 text-slate-400" />
                                            {req.preferredDays.join(', ')}
                                        </span>
                                    )}
                                    {req.preferredTimeRanges.length > 0 && (
                                        <span className="flex items-center gap-1">
                                            <HiOutlineClock className="h-3.5 w-3.5 text-slate-400" />
                                            {req.preferredTimeRanges.join(', ')}
                                        </span>
                                    )}
                                    {req.scheduledTime && (
                                        <span className="flex items-center gap-1">
                                            <HiOutlineCalendarDays className="h-3.5 w-3.5 text-violet-400" />
                                            Scheduled: {new Date(req.scheduledTime).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    )}
                                    {req.meetingLink && <MeetingBadge url={req.meetingLink} />}
                                    <span className="ml-auto flex items-center gap-1 text-slate-400">
                                        <HiOutlineCalendarDays className="h-3.5 w-3.5" />
                                        {new Date(req.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </SectionCard>

            {/* Saved Preferences */}
            <SectionCard icon={HiOutlineBookmarkSquare} title="Saved Preferences" count={student.preferences.length}>
                {student.preferences.length === 0 ? (
                    <EmptyState icon={HiOutlineBookmarkSquare} label="No saved preferences yet" />
                ) : (
                    <div className="space-y-2">
                        {student.preferences.map((pref) => (
                            <div key={pref.id} className="rounded-xl bg-slate-50 p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                                            <HiOutlineAdjustmentsHorizontal className="h-4 w-4 text-emerald-500" />
                                        </div>
                                        <p className="font-semibold text-slate-800">{pref.name}</p>
                                    </div>
                                    <span className="flex items-center gap-1 text-[11px] text-slate-400">
                                        <HiOutlineCalendarDays className="h-3 w-3" />
                                        {new Date(pref.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </span>
                                </div>

                                <div className="mt-3 flex flex-wrap gap-2">
                                    {pref.countryName && (
                                        <span className="flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200">
                                            <HiOutlineGlobeAlt className="h-3 w-3 text-slate-400" />
                                            {pref.countryName}
                                        </span>
                                    )}
                                    {pref.streamName && (
                                        <span className="flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200">
                                            <HiOutlineAcademicCap className="h-3 w-3 text-slate-400" />
                                            {pref.streamName}
                                        </span>
                                    )}
                                    {pref.levelFilter && (
                                        <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200">
                                            Level: {pref.levelFilter}
                                        </span>
                                    )}
                                    {pref.deliveryMethodFilter && (
                                        <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200">
                                            {pref.deliveryMethodFilter}
                                        </span>
                                    )}
                                    {pref.studyLanguageFilter && (
                                        <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200">
                                            {pref.studyLanguageFilter}
                                        </span>
                                    )}
                                    {pref.courseOfferingFilter && (
                                        <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-medium text-slate-600 ring-1 ring-slate-200">
                                            {pref.courseOfferingFilter}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </SectionCard>
        </div>
    );
}
