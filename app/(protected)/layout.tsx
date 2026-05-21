'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/assets/components/AdminSidebar';
import AdminHeader from '@/assets/components/AdminHeader';

interface AdminProfile {
    firstName: string;
    lastName:  string;
    email:     string;
    adminRole: string;
    avatar:    string;
}

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const router   = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [admin, setAdmin]             = useState<AdminProfile | null>(null);
    const [checking, setChecking]       = useState(true);

    useEffect(() => {
        fetch('/api/auth/me')
            .then((r) => r.json())
            .then((session) => {
                if (!session || !session.adminRole) {
                    router.replace('/login');
                } else {
                    setAdmin({ firstName: session.firstName, lastName: session.lastName, email: session.email, adminRole: session.adminRole, avatar: session.avatar });
                }
            })
            .catch(() => router.replace('/login'))
            .finally(() => setChecking(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        function onAvatarUpdated(e: Event) {
            const { avatar } = (e as CustomEvent<{ avatar: string }>).detail;
            setAdmin((prev) => prev ? { ...prev, avatar } : prev);
        }
        window.addEventListener('admin:avatar-updated', onAvatarUpdated);
        return () => window.removeEventListener('admin:avatar-updated', onAvatarUpdated);
    }, []);

    if (checking) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    <p className="text-sm text-slate-500">Verifying access…</p>
                </div>
            </div>
        );
    }

    if (!admin) return null;

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50">
            <AdminSidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} adminRole={admin.adminRole} />
            <div className="flex flex-1 flex-col overflow-hidden">
                <AdminHeader
                    onMenuClick={() => setSidebarOpen(true)}
                    adminName={`${admin.firstName} ${admin.lastName}`}
                    adminEmail={admin.email}
                    adminRole={admin.adminRole}
                    adminAvatar={admin.avatar}
                />
                <main className="flex-1 overflow-y-auto p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
