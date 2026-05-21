import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
    to,
    subject,
    html,
    from,
}: {
    to: string;
    subject: string;
    html: string;
    from?: string;   // override the default sender (e.g. admission@mycareerpathshala.com)
}) {
    const sender = from ?? process.env.EMAIL_FROM ?? 'noreply@mycareerpathshala.com';
    // In dev, EMAIL_DEV_OVERRIDE redirects all email to one inbox for easy testing.
    const recipient = process.env.EMAIL_DEV_OVERRIDE ?? to;
    const { error } = await resend.emails.send({ from: sender, to: recipient, subject, html });
    if (error) throw new Error(`Failed to send email: ${error.message}`);
}
