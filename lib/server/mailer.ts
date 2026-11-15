import "server-only";

export type MailResult = { sent: true } | { sent: false; devLink?: string };

function html(link: string) {
  return `<!doctype html><html><body style="margin:0;background:#FBF7F0;font-family:Nunito,Arial,sans-serif;color:#1C1A3B">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;background:#ffffff;border:2px solid #EDE6D9;border-radius:24px">
<tr><td style="padding:32px 28px">
<div style="font-size:22px;font-weight:900">Readly</div>
<h1 style="font-size:26px;line-height:1.2;margin:20px 0 8px">Your sign-in link</h1>
<p style="font-size:16px;line-height:1.6;margin:0 0 24px;color:#4A4766">Tap the button to open Readly with your child's progress and plan. The link works once and expires in 20 minutes.</p>
<a href="${link}" style="display:inline-block;background:#4B3FE0;color:#ffffff;text-decoration:none;font-weight:800;font-size:17px;padding:16px 28px;border-radius:16px">Sign in to Readly</a>
<p style="font-size:13px;line-height:1.6;margin:24px 0 0;color:#8A8599">If you didn't ask for this, you can ignore this email.</p>
</td></tr></table></td></tr></table></body></html>`;
}

export async function sendLoginEmail(to: string, link: string): Promise<MailResult> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    if (process.env.NODE_ENV === "production") throw new Error("Email is not configured");
    console.info(`[mailer] sign-in link for ${to}: ${link}`);
    return { sent: false, devLink: link };
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || "Readly <readly@13lab.tech>",
      to: [to],
      subject: "Your Readly sign-in link",
      html: html(link),
      text: `Sign in to Readly: ${link}\n\nThe link works once and expires in 20 minutes. If you didn't ask for this, ignore this email.`,
    }),
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`Resend responded ${res.status}: ${(await res.text()).slice(0, 200)}`);
  return { sent: true };
}
