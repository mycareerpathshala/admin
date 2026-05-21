const DEFAULT = '/img/profile/images/admin_default.png';

export function resolveAvatar(avatar: string | null | undefined): string {
    if (!avatar) return DEFAULT;
    if (avatar.startsWith('/')) return avatar;
    return DEFAULT;
}
