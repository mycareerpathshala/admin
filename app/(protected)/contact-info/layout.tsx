import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Contact Info | MCP Admin' };

export default function ContactInfoLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
