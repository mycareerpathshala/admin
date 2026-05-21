import type { Metadata } from 'next';
import { poppins } from '@/assets/utilities/localFontConfig';
import '@/assets/styles/globals.css';

export const metadata: Metadata = {
    title: { template: '%s | MCP Admin', default: 'MCP Admin' },
    description: 'MyCareerPathshala Admin Panel',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body className={`${poppins.variable} font-[family-name:var(--font-poppins)] antialiased`}>
                {children}
            </body>
        </html>
    );
}
