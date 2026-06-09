import { brandHeader } from '../branding';

const year = () => new Date().getFullYear();

export function counsellingScheduledEmailHtml({
    firstName,
    scheduledTime,
    meetingLink,
    adminNote,
}: {
    firstName: string;
    scheduledTime: string;   // pre-formatted display string
    meetingLink?: string | null;
    adminNote?: string | null;
}): string {
    const noteBlock = adminNote ? `
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;">
            <tr>
              <td style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:14px 18px;">
                <p style="margin:0 0 4px;font-size:10px;font-weight:700;color:#d97706;letter-spacing:1.5px;text-transform:uppercase;">Note from your counsellor</p>
                <p style="margin:0;font-size:13px;color:#92400e;line-height:1.6;">${adminNote}</p>
              </td>
            </tr>
          </table>` : '';

    const meetingBlock = meetingLink ? `
              <p style="margin:20px 0 8px;font-size:13px;font-weight:700;color:#374151;">Join your session:</p>
              <a href="${meetingLink}"
                 style="display:inline-block;background:#2563eb;color:#fff;font-size:13px;font-weight:700;text-decoration:none;padding:11px 28px;border-radius:10px;">
                Join Meeting
              </a>
              <p style="margin:8px 0 0;font-size:11px;color:#94a3b8;word-break:break-all;">${meetingLink}</p>` : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Session Scheduled</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;box-shadow:0 1px 4px rgba(0,0,0,0.06);overflow:hidden;">

          ${brandHeader({ label: 'Counselling Session Confirmed', gradient: 'linear-gradient(135deg,#0369a1 0%,#0284c7 100%)', labelColor: '#bae6fd' })}

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px 28px;">
              <p style="margin:0 0 6px;font-size:15px;color:#475569;">Hi <strong>${firstName}</strong>,</p>
              <p style="margin:0 0 24px;font-size:14px;color:#64748b;line-height:1.6;">
                Great news! Your counselling session has been confirmed.
              </p>

              <!-- Date card -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#eff6ff;border-radius:12px;padding:20px 24px;text-align:center;">
                    <p style="margin:0 0 6px;font-size:28px;">📅</p>
                    <p style="margin:0;font-size:16px;font-weight:700;color:#1d4ed8;">${scheduledTime}</p>
                  </td>
                </tr>
              </table>
              ${noteBlock}
              ${meetingBlock}

              <p style="margin:24px 0 0;font-size:13px;color:#94a3b8;line-height:1.6;">
                Please make sure to join on time. You can view your session details in your dashboard anytime.
              </p>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:0 40px 32px;text-align:center;">
              <a href="https://mycareerpathshala.com/dashboard/counselling"
                 style="display:inline-block;background:#0284c7;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:13px 32px;border-radius:12px;">
                View My Sessions
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="border-top:1px solid #f1f5f9;padding:20px 40px;background:#fafafa;">
              <p style="margin:0;font-size:11px;color:#94a3b8;text-align:center;">
                &copy; ${year()} My Career Pathshala &nbsp;&middot;&nbsp; This is an automated message, please do not reply.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function counsellingCancelledEmailHtml({ firstName }: { firstName: string }): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Session Cancelled</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;box-shadow:0 1px 4px rgba(0,0,0,0.06);overflow:hidden;">

          ${brandHeader({ label: 'Counselling Update', gradient: 'linear-gradient(135deg,#475569 0%,#64748b 100%)', labelColor: '#cbd5e1' })}

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px 32px;">
              <p style="margin:0 0 6px;font-size:15px;color:#475569;">Hi <strong>${firstName}</strong>,</p>
              <p style="margin:0 0 24px;font-size:14px;color:#64748b;line-height:1.6;">
                Your counselling request has been cancelled. You're welcome to submit a new request anytime from your dashboard.
              </p>
              <div style="text-align:center;padding:20px 0;">
                <p style="margin:0;font-size:36px;">↩️</p>
              </div>
              <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.6;">
                If you have any questions, please contact our support team.
              </p>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:0 40px 32px;text-align:center;">
              <a href="https://mycareerpathshala.com/dashboard/counselling"
                 style="display:inline-block;background:#2563eb;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:13px 32px;border-radius:12px;">
                Book New Session
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="border-top:1px solid #f1f5f9;padding:20px 40px;background:#fafafa;">
              <p style="margin:0;font-size:11px;color:#94a3b8;text-align:center;">
                &copy; ${year()} My Career Pathshala &nbsp;&middot;&nbsp; This is an automated message, please do not reply.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function counsellingCompletedEmailHtml({ firstName }: { firstName: string }): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Session Completed</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;box-shadow:0 1px 4px rgba(0,0,0,0.06);overflow:hidden;">

          ${brandHeader({ label: 'Session Summary', gradient: 'linear-gradient(135deg,#059669 0%,#10b981 100%)', labelColor: '#a7f3d0' })}

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px 32px;">
              <p style="margin:0 0 6px;font-size:15px;color:#475569;">Hi <strong>${firstName}</strong>,</p>
              <p style="margin:0 0 24px;font-size:14px;color:#64748b;line-height:1.6;">
                Your counselling session has been completed. We hope it was helpful!
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#f0fdf4;border-radius:12px;padding:20px 24px;text-align:center;">
                    <p style="margin:0 0 8px;font-size:28px;">✅</p>
                    <p style="margin:0;font-size:16px;font-weight:700;color:#15803d;">Session Completed</p>
                    <p style="margin:8px 0 0;font-size:13px;color:#4ade80;">Thank you for choosing My Career Pathshala</p>
                  </td>
                </tr>
              </table>
              <p style="margin:24px 0 0;font-size:13px;color:#64748b;line-height:1.6;">
                Ready to take the next step? Browse universities, explore courses, or book another session whenever you need guidance.
              </p>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:0 40px 32px;text-align:center;">
              <a href="https://mycareerpathshala.com/dashboard"
                 style="display:inline-block;background:#059669;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:13px 32px;border-radius:12px;">
                Go to Dashboard
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="border-top:1px solid #f1f5f9;padding:20px 40px;background:#fafafa;">
              <p style="margin:0;font-size:11px;color:#94a3b8;text-align:center;">
                &copy; ${year()} My Career Pathshala &nbsp;&middot;&nbsp; This is an automated message, please do not reply.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
