import { db } from './database/db';
import { notifications } from './database/schema';

type NotifType = 'counselling_scheduled' | 'counselling_completed' | 'counselling_cancelled' | 'application_status_updated';

export async function createNotification(userId: string, type: NotifType, title: string, message: string) {
    await db.insert(notifications).values({ userId, type, title, message });
}

export function counsellingNotification(
    status: 'scheduled' | 'completed' | 'cancelled',
    scheduledTime?: Date | null,
): { type: NotifType; title: string; message: string } | null {
    if (status === 'scheduled') {
        const when = scheduledTime
            ? new Date(scheduledTime).toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' })
            : 'a confirmed time';
        return {
            type: 'counselling_scheduled',
            title: 'Session Scheduled',
            message: `Your counselling session has been scheduled for ${when}.`,
        };
    }
    if (status === 'completed') return {
        type: 'counselling_completed',
        title: 'Session Completed',
        message: 'Your counselling session has been marked as completed. Thank you!',
    };
    if (status === 'cancelled') return {
        type: 'counselling_cancelled',
        title: 'Request Cancelled',
        message: 'Your counselling request has been cancelled. You can submit a new one anytime.',
    };
    return null;
}

const APP_STATUS_MESSAGES: Partial<Record<string, { title: string; message: string }>> = {
    under_review:   { title: 'Application Under Review', message: 'Your application is now being reviewed by our team.' },
    offer_received: { title: 'Offer Received!',           message: 'Great news! You have received an offer for your application.' },
    accepted:       { title: 'Application Accepted!',     message: 'Congratulations! Your application has been accepted.' },
    rejected:       { title: 'Application Update',        message: 'Your application status has been updated. Please log in for details.' },
};

export function applicationNotification(status: string): { type: NotifType; title: string; message: string } | null {
    const msg = APP_STATUS_MESSAGES[status];
    if (!msg) return null;
    return { type: 'application_status_updated', ...msg };
}
