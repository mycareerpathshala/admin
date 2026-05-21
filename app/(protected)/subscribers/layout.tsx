import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Subscribers | MCP Admin' };

export default function SubscribersLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
