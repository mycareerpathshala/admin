import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Contents' };

export default function ContentsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
