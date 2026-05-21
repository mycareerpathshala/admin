import { getSession, signSession, SESSION_COOKIE_OPTIONS } from '@/assets/lib/auth/session';
import { db } from '@/assets/lib/database/db';
import { admins } from '@/assets/lib/database/schema';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import sharp from 'sharp';

const UPLOAD_DIR    = join(process.cwd(), 'public', 'img', 'profile', 'images');
const ADMIN_DEFAULT = '/img/profile/images/admin_default.png';
const MAX_SIZE      = 5 * 1024 * 1024;
const ALLOWED       = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

export async function POST(request: NextRequest) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    let formData: FormData;
    try {
        formData = await request.formData();
    } catch {
        return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
    }

    const file = formData.get('avatar');
    if (!(file instanceof File)) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    if (!ALLOWED.has(file.type))  return NextResponse.json({ error: 'Only JPEG, PNG, WebP, or GIF allowed' }, { status: 400 });
    if (file.size > MAX_SIZE)     return NextResponse.json({ error: 'File must be under 5 MB' }, { status: 400 });

    // Fetch current avatar so we can delete it after the new one is saved
    const [current] = await db
        .select({ avatar: admins.avatar })
        .from(admins)
        .where(eq(admins.id, session.userId))
        .limit(1);

    if (!current) return NextResponse.json({ error: 'Admin not found' }, { status: 404 });

    // Process and save the new image
    const buffer    = Buffer.from(await file.arrayBuffer());
    const filename  = `${session.userId}.webp`;
    const processed = await sharp(buffer)
        .resize(400, 400, { fit: 'cover', position: 'centre' })
        .webp({ quality: 85 })
        .toBuffer();

    await mkdir(UPLOAD_DIR, { recursive: true });
    await writeFile(join(UPLOAD_DIR, filename), processed);

    const avatarPath = `/img/profile/images/${filename}`;

    // Delete the old file — but never delete admin_default.png
    const oldPath = current.avatar;
    if (oldPath && oldPath !== ADMIN_DEFAULT && oldPath !== avatarPath) {
        try {
            await unlink(join(process.cwd(), 'public', oldPath));
        } catch {
            // File may already be gone — not fatal
        }
    }

    const [updated] = await db
        .update(admins)
        .set({ avatar: avatarPath })
        .where(eq(admins.id, session.userId))
        .returning();

    if (!updated) return NextResponse.json({ error: 'Update failed' }, { status: 500 });

    const newToken = await signSession({
        userId:    updated.id,
        firstName: updated.firstName,
        lastName:  updated.lastName,
        email:     updated.email,
        adminRole: updated.adminRole,
        avatar:    updated.avatar,
    });

    const response = NextResponse.json({ success: true, avatar: avatarPath });
    response.cookies.set(SESSION_COOKIE_OPTIONS.name, newToken, SESSION_COOKIE_OPTIONS);
    return response;
}
