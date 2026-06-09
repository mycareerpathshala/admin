/**
 * Centralised mail sending for My Career Pathshala (admin).
 *
 * Two sender identities, chosen by purpose:
 *   • auth      → noreply@mycareerpathshala.com    — security / account mail
 *                 (login OTP, email verification & change, password change)
 *   • admission → admission@mycareerpathshala.com  — everything else
 *                 (application & counselling status updates, notifications)
 *
 * Override either address with the EMAIL_FROM_AUTH / EMAIL_FROM_ADMISSION env
 * vars. The default sender is the auth identity, so any mail is treated as
 * security mail unless it explicitly opts into the admission sender.
 */
import { MCP_LOGO_ATTACHMENT, MCP_LOGO_CID } from './branding';

export const EMAIL_FROM_AUTH =
    process.env.EMAIL_FROM_AUTH ?? 'My Career Pathshala <noreply@mycareerpathshala.com>';

export const EMAIL_FROM_ADMISSION =
    process.env.EMAIL_FROM_ADMISSION ?? 'My Career Pathshala Admissions <admission@mycareerpathshala.com>';

export async function sendEmail({
    to,
    subject,
    html,
    from = EMAIL_FROM_AUTH,
}: {
    to: string;
    subject: string;
    html: string;
    /**
     * Sender identity. Defaults to the auth sender (noreply). Pass
     * EMAIL_FROM_ADMISSION for non-auth mail (admissions, applications, etc.).
     */
    from?: string;
}) {
    const { Resend } = await import('resend');
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error('RESEND_API_KEY is not set');
    const resend = new Resend(apiKey);
    // In dev, EMAIL_DEV_OVERRIDE redirects every outgoing email to one inbox so
    // all flows are testable locally without a mailbox per recipient.
    const recipient = process.env.EMAIL_DEV_OVERRIDE ?? to;
    // Ship the brand logo as an inline attachment only when the HTML references it
    // (templates use <img src="cid:mcp-logo">). Avoids a stray attachment otherwise.
    const attachments = html.includes(`cid:${MCP_LOGO_CID}`) ? [MCP_LOGO_ATTACHMENT] : undefined;
    const { error } = await resend.emails.send({ from, to: recipient, subject, html, attachments });
    if (error) throw new Error(`Failed to send email: ${error.message}`);
}
