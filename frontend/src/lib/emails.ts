/* ─────────────────────────────────────────────────────────────
   Resumelyzer — Shared email templates
   Uses inline styles (best deliverability) + buttons instead
   of bare <a> tags to avoid spam-filter link scoring.
   ───────────────────────────────────────────────────────────── */

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://resumelyzer.com";

/* ── Shared shell ──────────────────────────────────────────── */
function shell(content: string, previewText = ""): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>Resumelyzer</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
  <style>
    body,table,td,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}
    body{margin:0;padding:0;background-color:#f3f4f6;font-family:'Segoe UI',Helvetica,Arial,sans-serif}
    img{border:0;height:auto;line-height:100%;outline:none;text-decoration:none}
    table{border-collapse:collapse!important}
    .btn:hover{opacity:.88!important}
  </style>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;">
  ${previewText ? `<div style="display:none;font-size:1px;color:#f3f4f6;line-height:1px;max-height:0;overflow:hidden;">${previewText}</div>` : ""}

  <!-- wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- HEADER -->
          <tr>
            <td style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);border-radius:16px 16px 0 0;padding:40px 40px 32px;text-align:center;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:16px;">
                    <div style="display:inline-block;background:rgba(255,255,255,.15);border-radius:12px;padding:10px 14px;">
                      <span style="font-size:22px;font-weight:900;color:#fff;letter-spacing:-0.5px;">R&nbsp;</span>
                      <span style="font-size:18px;font-weight:800;color:#fff;letter-spacing:-0.3px;">Resumelyzer</span>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="background:#fff;padding:0 40px 40px;">
              ${content}
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#f9fafb;border-radius:0 0 16px 16px;border-top:1px solid #e5e7eb;padding:28px 40px;text-align:center;">
              <p style="margin:0 0 4px;font-size:12px;color:#9ca3af;">
                © ${new Date().getFullYear()} Resumelyzer · AI-Powered Resume Tools
              </p>
              <p style="margin:0;font-size:11px;color:#d1d5db;">
                You're receiving this because you have an account or subscribed for updates.
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

/* ── Button helper ─────────────────────────────────────────── */
function btn(label: string, href: string, color = "#4f46e5"): string {
  return `
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
  <tr>
    <td style="border-radius:10px;background:${color};">
      <a href="${href}" class="btn"
        style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:700;color:#fff;text-decoration:none;border-radius:10px;letter-spacing:0.2px;background:${color};">
        ${label}
      </a>
    </td>
  </tr>
</table>`;
}

/* ── Feature pill ──────────────────────────────────────────── */
function feature(icon: string, title: string, desc: string): string {
  return `
<td width="33%" style="padding:8px;vertical-align:top;">
  <div style="background:#f5f3ff;border-radius:12px;padding:18px 14px;text-align:center;">
    <div style="font-size:26px;margin-bottom:8px;">${icon}</div>
    <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#1e1b4b;">${title}</p>
    <p style="margin:0;font-size:11px;color:#6b7280;line-height:1.5;">${desc}</p>
  </div>
</td>`;
}

/* ═══════════════════════════════════════════════════════════════
   1. WELCOME EMAIL
   ═══════════════════════════════════════════════════════════════ */
export function welcomeEmail(name?: string | null): { subject: string; html: string; text: string } {
  const firstName = name?.split(" ")[0] ?? "there";

  const html = shell(`
    <!-- greeting -->
    <h1 style="margin:40px 0 8px;font-size:26px;font-weight:900;color:#111827;text-align:center;letter-spacing:-0.5px;">
      Welcome aboard, ${firstName}! 🎉
    </h1>
    <p style="margin:0 0 32px;font-size:15px;color:#6b7280;text-align:center;line-height:1.6;">
      Your AI-powered career toolkit is ready. Let's build something great.
    </p>

    <!-- divider -->
    <hr style="border:none;border-top:1px solid #f0e9ff;margin:0 0 32px;" />

    <!-- features -->
    <p style="margin:0 0 16px;font-size:13px;font-weight:700;color:#6d28d9;text-transform:uppercase;letter-spacing:1px;text-align:center;">
      What you can do
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
      <tr>
        ${feature("🤖", "AI Resume Analyzer", "Get ATS scores and actionable feedback in seconds")}
        ${feature("✉️", "Cover Letter Gen", "Job-tailored letters written by AI for you")}
        ${feature("📄", "LaTeX Templates", "Professional templates with Overleaf integration")}
      </tr>
    </table>

    <!-- CTA -->
    <div style="text-align:center;margin-bottom:32px;">
      ${btn("🚀  Analyze My Resume", `${BASE_URL}/analyzer`)}
    </div>

    <hr style="border:none;border-top:1px solid #f3f4f6;margin:0 0 24px;" />

    <!-- more links as buttons -->
    <p style="margin:0 0 16px;font-size:13px;font-weight:700;color:#9ca3af;text-align:center;text-transform:uppercase;letter-spacing:1px;">
      Explore more
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding:4px;">
          <table role="presentation" cellpadding="0" cellspacing="6">
            <tr>
              <td>
                <a href="${BASE_URL}/resume-templates" style="display:inline-block;padding:9px 18px;border:1.5px solid #e0e7ff;border-radius:8px;font-size:13px;font-weight:600;color:#4f46e5;text-decoration:none;background:#fff;">
                  📐  Resume Templates
                </a>
              </td>
              <td>
                <a href="${BASE_URL}/cover-letter" style="display:inline-block;padding:9px 18px;border:1.5px solid #e0e7ff;border-radius:8px;font-size:13px;font-weight:600;color:#4f46e5;text-decoration:none;background:#fff;">
                  ✉️  Cover Letters
                </a>
              </td>
              <td>
                <a href="${BASE_URL}/dashboard" style="display:inline-block;padding:9px 18px;border:1.5px solid #e0e7ff;border-radius:8px;font-size:13px;font-weight:600;color:#4f46e5;text-decoration:none;background:#fff;">
                  📊  Dashboard
                </a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <p style="margin:32px 0 0;font-size:14px;color:#9ca3af;text-align:center;line-height:1.6;">
      If you have any questions, just reply to this email — we're happy to help!<br/>
      <span style="color:#d1d5db;">— The Resumelyzer Team</span>
    </p>
  `, `Welcome to Resumelyzer, ${firstName}! Your AI career toolkit is ready.`);

  const text = `
Welcome to Resumelyzer, ${firstName}!

Your account is ready. Here's what you can do:

• Analyze your resume with AI — ${BASE_URL}/analyzer
• Generate a cover letter — ${BASE_URL}/cover-letter
• Browse LaTeX templates — ${BASE_URL}/resume-templates
• View your dashboard — ${BASE_URL}/dashboard

Questions? Just reply to this email.

— The Resumelyzer Team
`.trim();

  return { subject: `Welcome to Resumelyzer, ${firstName}! 🎉`, html, text };
}

/* ═══════════════════════════════════════════════════════════════
   2. NEWSLETTER EMAIL
   ═══════════════════════════════════════════════════════════════ */
export function newsletterEmail(params: {
  subject: string;
  bodyHtml: string;
  recipientEmail?: string;
}): { html: string; text: string } {
  const { subject, bodyHtml, recipientEmail } = params;
  const unsubUrl = recipientEmail
    ? `${BASE_URL}/api/newsletter/unsubscribe?email=${encodeURIComponent(recipientEmail)}`
    : `${BASE_URL}/api/newsletter/unsubscribe`;

  const html = shell(`
    <!-- issue label -->
    <div style="margin:36px 0 0;padding:6px 14px;display:inline-block;background:#f5f3ff;border-radius:20px;border:1px solid #ede9fe;">
      <span style="font-size:11px;font-weight:700;color:#7c3aed;text-transform:uppercase;letter-spacing:1px;">✨ Resumelyzer Newsletter</span>
    </div>

    <h1 style="margin:16px 0 4px;font-size:24px;font-weight:900;color:#111827;letter-spacing:-0.4px;">${subject}</h1>
    <p style="margin:0 0 28px;font-size:12px;color:#9ca3af;">${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>

    <hr style="border:none;border-top:1px solid #f3f4f6;margin:0 0 28px;" />

    <!-- injected content -->
    <div style="font-size:15px;color:#374151;line-height:1.7;">
      ${bodyHtml}
    </div>

    <hr style="border:none;border-top:1px solid #f3f4f6;margin:32px 0 28px;" />

    <!-- CTA -->
    <div style="text-align:center;margin-bottom:8px;">
      ${btn("🚀  Open Resumelyzer", BASE_URL)}
    </div>

    <!-- unsubscribe as button — not a bare link -->
    <p style="margin:24px 0 0;text-align:center;font-size:12px;color:#d1d5db;">
      Don't want these emails?&nbsp;
      <a href="${unsubUrl}" style="color:#9ca3af;font-weight:600;text-decoration:underline;">Unsubscribe</a>
    </p>
  `, `${subject} — the latest from Resumelyzer`);

  // plain-text strip (simple)
  const text = bodyHtml
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\s{2,}/g, "\n")
    .trim()
    + `\n\n---\nOpen Resumelyzer: ${BASE_URL}\nUnsubscribe: ${unsubUrl}`;

  return { html, text };
}

/* ─────────────────────────────────────────────────────────────
   Helper: send via Resend
   ───────────────────────────────────────────────────────────── */
export async function sendEmail(params: {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { ok: false, error: "RESEND_API_KEY not set" };

  const from = process.env.NEWSLETTER_FROM ?? "Resumelyzer <onboarding@resend.dev>";

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: params.to, subject: params.subject, html: params.html, text: params.text }),
  });

  if (!res.ok) {
    const body = await res.text();
    return { ok: false, error: body };
  }
  return { ok: true };
}

/* Helper: batch-send newsletter */
export async function sendNewsletterBatch(params: {
  recipients: { email: string; name?: string | null }[];
  subject: string;
  bodyHtml: string;
}): Promise<{ sent: number; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { sent: 0, error: "RESEND_API_KEY not set" };
  const from = process.env.NEWSLETTER_FROM ?? "Resumelyzer <onboarding@resend.dev>";

  const { recipients, subject, bodyHtml } = params;
  let sent = 0;

  for (let i = 0; i < recipients.length; i += 50) {
    const batch = recipients.slice(i, i + 50);
    const emails = batch.map((r) => {
      const { html, text } = newsletterEmail({ subject, bodyHtml, recipientEmail: r.email });
      return { from, to: r.email, subject, html, text };
    });

    const res = await fetch("https://api.resend.com/emails/batch", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emails),
    });

    if (res.ok) sent += batch.length;
  }

  return { sent };
}
