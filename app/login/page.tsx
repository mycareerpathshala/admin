'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    HiArrowRightOnRectangle,
    HiEnvelope,
    HiEye,
    HiEyeSlash,
    HiLockClosed,
    HiShieldCheck,
    HiChartBarSquare,
    HiUserGroup,
    HiCog6Tooth,
    HiCommandLine,
    HiServerStack,
    HiClipboardDocumentList,
    HiBellAlert,
} from 'react-icons/hi2';

export default function AdminLoginPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError('');
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error ?? 'Login failed'); return; }
            router.push('/dashboard');
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-slate-50">
            {/* background blobs */}
            <div className="absolute -top-40 -left-40 size-125 rounded-full bg-violet-200/55 blur-3xl" />
            <div className="absolute -bottom-32 -left-20 size-96 rounded-full bg-indigo-200/50 blur-3xl" />
            <div className="absolute top-1/3 right-0 size-80 rounded-full bg-purple-100/40 blur-3xl" />

            <div className="relative z-10 flex min-h-screen w-full">
                {/* LEFT: content */}
                <div className="hidden w-[56%] flex-col justify-center px-16 py-12 lg:flex">
                    {/* logo */}
                    <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-indigo-600">
                            <HiShieldCheck className="size-5 text-white" />
                        </div>
                        <div>
                            <p className="text-base font-bold text-slate-900">MyCareerPathshala</p>
                            <p className="text-xs font-medium text-indigo-500">Admin Panel</p>
                        </div>
                    </div>

                    {/* heading */}
                    <h1 className="mt-10 max-w-lg text-[2.75rem] leading-[1.15] font-black tracking-tight text-slate-900">
                        Full control of your platform.
                    </h1>

                    {/* subtitle */}
                    <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-500">
                        Manage students, applications, counselling sessions, and platform analytics — all from one secure dashboard.
                    </p>

                    {/* icon cluster */}
                    <div className="relative my-10 h-56 w-full">
                        {/* left cluster */}
                        <div
                            style={{ animationDelay: '0s' }}
                            className="icon-float absolute top-3 left-[4%] flex size-20.5 -rotate-7 items-center justify-center rounded-[22px] bg-indigo-600 shadow-xl shadow-indigo-200/70"
                        >
                            <HiShieldCheck className="size-10 text-white" />
                        </div>
                        <div
                            style={{ animationDelay: '-1s' }}
                            className="icon-float absolute top-18 left-[18%] flex size-16.5 rotate-5 items-center justify-center rounded-[18px] bg-slate-800 shadow-lg shadow-slate-300/60"
                        >
                            <HiCommandLine className="size-8 text-white" />
                        </div>
                        <div
                            style={{ animationDelay: '-2.4s' }}
                            className="icon-float absolute top-36 left-[6%] flex size-18.5 -rotate-3 items-center justify-center rounded-[20px] bg-violet-600 shadow-xl shadow-violet-200/60"
                        >
                            <HiCog6Tooth className="size-9 text-white" />
                        </div>

                        {/* right cluster */}
                        <div
                            style={{ animationDelay: '-3.1s' }}
                            className="icon-float absolute top-1 left-[42%] flex size-24 rotate-4 items-center justify-center rounded-[26px] bg-purple-600 shadow-xl shadow-purple-200/70"
                        >
                            <HiChartBarSquare className="size-12 text-white" />
                        </div>
                        <div
                            style={{ animationDelay: '-1.8s' }}
                            className="icon-float absolute top-17 left-[57%] flex size-15.5 -rotate-6 items-center justify-center rounded-[17px] bg-amber-500 shadow-lg shadow-amber-200/60"
                        >
                            <HiBellAlert className="size-8 text-white" />
                        </div>
                        <div
                            style={{ animationDelay: '-3.8s' }}
                            className="icon-float absolute top-20 left-[38%] flex size-14.5 rotate-7 items-center justify-center rounded-2xl bg-slate-500 shadow-md shadow-slate-300/50"
                        >
                            <HiUserGroup className="size-7 text-white" />
                        </div>
                        <div
                            style={{ animationDelay: '-2.7s' }}
                            className="icon-float absolute top-2 left-[66%] flex size-15 -rotate-9 items-center justify-center rounded-[17px] bg-cyan-600 shadow-lg shadow-cyan-200/60"
                        >
                            <HiServerStack className="size-7 text-white" />
                        </div>
                        <div
                            style={{ animationDelay: '-4.2s' }}
                            className="icon-float absolute top-36 left-[55%] flex size-17 rotate-5 items-center justify-center rounded-[19px] bg-emerald-600 shadow-lg shadow-emerald-200/60"
                        >
                            <HiClipboardDocumentList className="size-8 text-white" />
                        </div>
                    </div>

                    {/* feature highlights */}
                    <div className="flex gap-10">
                        <div className="flex items-start gap-3">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-indigo-100">
                                <HiChartBarSquare className="size-5 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-800">Platform Analytics</p>
                                <p className="text-xs leading-relaxed text-slate-500">Real-time stats & insights</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-violet-100">
                                <HiUserGroup className="size-5 text-violet-600" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-slate-800">Student Management</p>
                                <p className="text-xs leading-relaxed text-slate-500">Full control over records</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: floating card */}
                <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
                    {/* mobile logo */}
                    <div className="mb-8 flex items-center gap-2 lg:hidden">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-indigo-600">
                            <HiShieldCheck className="size-4 text-white" />
                        </div>
                        <p className="font-semibold text-slate-800">MCP Admin</p>
                    </div>

                    {/* card */}
                    <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl ring-1 shadow-slate-200/80 ring-slate-100/80">
                        {/* card top bar */}
                        <div className="mb-6 flex items-center justify-between">
                            <div className="flex items-center gap-2 rounded-full bg-indigo-50 px-3.5 py-1.5 ring-1 ring-indigo-100">
                                <HiShieldCheck className="size-3.5 text-indigo-500" />
                                <span className="text-xs font-semibold text-indigo-600">Admin Login</span>
                            </div>
                            <div className="size-2.5 rounded-full bg-indigo-500" />
                        </div>

                        {/* heading */}
                        <h2 className="text-2xl font-extrabold text-slate-900">Welcome back</h2>
                        <p className="mt-1 text-sm text-slate-400">Sign in to your admin account to continue.</p>

                        {/* form */}
                        <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
                            {/* email */}
                            <div>
                                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-700">
                                    Email address
                                </label>
                                <div className="relative">
                                    <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center">
                                        <HiEnvelope className="size-4 text-slate-400" />
                                    </span>
                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        required
                                        placeholder="admin@example.com"
                                        autoComplete="email"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-4 pl-10 text-sm text-slate-800 transition outline-none placeholder:text-slate-300 focus:border-indigo-400 focus:bg-white focus:ring-3 focus:ring-indigo-100"
                                    />
                                </div>
                            </div>

                            {/* password */}
                            <div>
                                <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-slate-700">
                                    Password
                                </label>
                                <div className="relative">
                                    <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center">
                                        <HiLockClosed className="size-4 text-slate-400" />
                                    </span>
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        required
                                        placeholder="Enter your password"
                                        autoComplete="current-password"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-10 pl-10 text-sm text-slate-800 transition outline-none placeholder:text-slate-300 focus:border-indigo-400 focus:bg-white focus:ring-3 focus:ring-indigo-100"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className="absolute inset-y-0 right-3 flex items-center text-slate-400 transition-colors hover:text-slate-600"
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? (
                                            <HiEyeSlash className="size-4" />
                                        ) : (
                                            <HiEye className="size-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {/* error */}
                            {error && (
                                <p className="rounded-lg bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-600 ring-1 ring-red-100">
                                    {error}
                                </p>
                            )}

                            {/* submit */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-200 transition-all duration-150 select-none hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-300 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {loading ? (
                                    <>
                                        <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        Signing in…
                                    </>
                                ) : (
                                    <>
                                        <HiArrowRightOnRectangle className="size-4.5" />
                                        Sign in to Admin
                                    </>
                                )}
                            </button>
                        </form>

                        {/* divider */}
                        <div className="my-5 flex items-center gap-3">
                            <div className="h-px flex-1 bg-slate-100" />
                            <span className="text-xs text-slate-300">secured</span>
                            <div className="h-px flex-1 bg-slate-100" />
                        </div>

                        <p className="text-center text-xs text-slate-400">
                            Admin access only. Unauthorised use is prohibited.
                        </p>
                    </div>

                    <p className="mt-6 text-center text-xs text-slate-400">
                        &copy; {new Date().getFullYear()} MyCareerPathshala — All rights reserved
                    </p>
                </div>
            </div>
        </div>
    );
}
