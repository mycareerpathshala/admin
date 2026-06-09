declare namespace NodeJS {
    interface ProcessEnv {
        NEXT_PUBLIC_STRAPI_URL: string;
        STRAPI_API_TOKEN: string;
        NODE_ENV: 'development' | 'production' | 'test';
        DATABASE_URL: string;
        JWT_SECRET: string;
        // Email (Resend)
        RESEND_API_KEY: string;
        EMAIL_FROM_AUTH?: string;
        EMAIL_FROM_ADMISSION?: string;
        EMAIL_DEV_OVERRIDE?: string;
    }
}
