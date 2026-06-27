import "server-only";
import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
export const COMPANY_EMAIL = process.env.COMPANY_EMAIL;
const EMAIL_FROM = process.env.EMAIL_FROM ?? "Birtek <onboarding@resend.dev>";

export function isEmailConfigured(): boolean {
  return Boolean(RESEND_API_KEY);
}

let _resend: Resend | null = null;
function getResend(): Resend | null {
  if (!RESEND_API_KEY) return null;
  if (!_resend) _resend = new Resend(RESEND_API_KEY);
  return _resend;
}

export type SendResult = { sent: boolean; id?: string; error?: string };

/**
 * E-posta gönderir. RESEND_API_KEY yoksa sessizce atlar (graceful) —
 * akış bozulmaz, yalnızca log düşer.
 */
export async function sendEmail(opts: {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}): Promise<SendResult> {
  const resend = getResend();
  if (!resend) {
    console.info(
      `[email] RESEND_API_KEY yok — atlandı: "${opts.subject}" -> ${opts.to}`,
    );
    return { sent: false, error: "not_configured" };
  }
  try {
    const { data, error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      replyTo: opts.replyTo,
    });
    if (error) return { sent: false, error: error.message };
    return { sent: true, id: data?.id };
  } catch (err) {
    return {
      sent: false,
      error: err instanceof Error ? err.message : "unknown",
    };
  }
}
