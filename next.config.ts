import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    serverExternalPackages: ['sharp'],
    images: {
        remotePatterns: [
            {
                protocol: 'http',
                hostname: '194.164.150.193',
                port: '',
                pathname: '/uploads/**',
            },
            {
                protocol: 'http',
                hostname: '*.sslip.io',
                port: '',
                pathname: '/uploads/**',
            },
        ],
    },
};

export default nextConfig;
