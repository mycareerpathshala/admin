import { getSession } from '@/assets/lib/auth/session';
import { NextResponse } from 'next/server';

export async function GET() {
    const session = await getSession();
    if (!session) return NextResponse.json(null);
    return NextResponse.json(session);
}
