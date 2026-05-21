import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Counselling' };

export default function CounsellingLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
