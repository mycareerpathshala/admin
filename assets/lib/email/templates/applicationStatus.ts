import { brandHeader } from '../branding';

const STATUS_META: Record<string, { label: string; color: string; bg: string; icon: string; headline: string }> = {
    under_review:   { label: 'Under Review',   color: '#4338ca', bg: '#eef2ff', icon: '🔍', headline: 'Your application is being reviewed' },
    offer_received: { label: 'Offer Received',  color: '#7c3aed', bg: '#f5f3ff', icon: '🎉', headline: "You've received an offer!" },
    accepted:       { label: 'Accepted',        color: '#15803d', bg: '#f0fdf4', icon: '✅', headline: 'Your application has been accepted!' },
    rejected:       { label: 'Not Accepted',    color: '#b91c1c', bg: '#fef2f2', icon: '📋', headline: 'Application status update' },
    withdrawn:      { label: 'Withdrawn',       color: '#64748b', bg: '#f8fafc', icon: '↩️', headline: 'Application withdrawn' },
};

export function applicationStatusEmailHtml({
    firstName,
    universityName,
    courseName,
    status,
    adminNote,
}: {
    firstName: string;
    universityName: string;
    courseName: string | null;
    status: string;
    adminNote?: string | null;
}): string {
    const meta = STATUS_META[status] ?? { label: status, color: '#1d4ed8', bg: '#eff6ff', icon: '📄', headline: 'Application status updated' };
    const year = new Date().getFullYear();

    const adminNoteBlock = adminNote ? `
          <!-- Admin message -->
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;">
            <tr>
              <td style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:16px 20px;">
                <p style="margin:0 0 4px;font-size:10px;font-weight:700;color:#d97706;letter-spacing:1.5px;text-transform:uppercase;">Message from our team</p>
                <p style="margin:0;font-size:14px;color:#92400e;line-height:1.6;">${adminNote}</p>
              </td>
            </tr>
          </table>` : '';

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Application Update</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;box-shadow:0 1px 4px rgba(0,0,0,0.06);overflow:hidden;">

          ${brandHeader({ label: 'Application Status Update' })}

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px 28px;">
              <p style="margin:0 0 6px;font-size:15px;color:#475569;">Hi <strong>${firstName}</strong>,</p>
              <p style="margin:0 0 24px;font-size:14px;color:#64748b;line-height:1.6;">
                There's an update on your application to <strong>${universityName}</strong>${courseName ? ` for <strong>${courseName}</strong>` : ''}.
              </p>

              <!-- Status badge -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:${meta.bg};border-radius:12px;padding:20px 24px;text-align:center;">
                    <p style="margin:0 0 8px;font-size:28px;">${meta.icon}</p>
                    <p style="margin:0 0 4px;font-size:18px;font-weight:800;color:${meta.color};">${meta.headline}</p>
                    <span style="display:inline-block;margin-top:8px;background:${meta.color};color:#fff;font-size:11px;font-weight:700;letter-spacing:1px;text-transform:uppercase;padding:4px 14px;border-radius:999px;">${meta.label}</span>
                  </td>
                </tr>
              </table>
              ${adminNoteBlock}

              <p style="margin:24px 0 0;font-size:13px;color:#94a3b8;line-height:1.6;">
                Log in to your dashboard to view full details and track your application progress.
              </p>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:0 40px 32px;text-align:center;">
              <a href="https://mycareerpathshala.com/dashboard/applications"
                 style="display:inline-block;background:#2563eb;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:13px 32px;border-radius:12px;">
                View My Applications
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="border-top:1px solid #f1f5f9;padding:20px 40px;background:#fafafa;">
              <p style="margin:0;font-size:11px;color:#94a3b8;text-align:center;">
                &copy; ${year} My Career Pathshala &nbsp;&middot;&nbsp; This is an automated message, please do not reply.
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
