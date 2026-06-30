import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { Resend } from "resend";
import { getEmailSettings } from "@/lib/data/email-settings";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
export const COMPANY_EMAIL = process.env.COMPANY_EMAIL;
const ENV_FROM = process.env.EMAIL_FROM;

export type SendResult = { sent: boolean; id?: string; error?: string };

export type SendEmailOpts = {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
  attachments?: { filename: string; content: Buffer }[];
};

type Provider =
  | { kind: "smtp"; transporter: Transporter; from: string }
  | { kind: "resend"; resend: Resend; from: string }
  | null;

/**
 * Geçerli bir "from" üretir. `from` zaten e-posta içeriyorsa (@) olduğu gibi
 * kullanılır; yalnız ad girilmişse kullanıcı e-postasıyla birleştirilir
 * (ör. "Cagdas İsi" + user → "Cagdas İsi <user@…>").
 */
function resolveFrom(from: string | undefined, user: string | undefined): string {
  const f = (from ?? "").trim();
  const u = (user ?? "").trim();
  if (f.includes("@")) return f; // "email" veya "Ad <email>"
  if (f && u) return `${f} <${u}>`; // sadece ad → ad + kullanıcı e-postası
  return u || f || "no-reply@localhost";
}

/**
 * SMTP şifresini normalize eder. Gmail/Yahoo uygulama şifreleri
 * "xxxx xxxx xxxx xxxx" biçiminde gösterilir ama SMTP'de boşluksuz kullanılır;
 * bu sağlayıcılarda şifredeki tüm boşlukları temizleriz.
 */
function smtpPass(host: string, pass: string): string {
  return /gmail|googlemail|yahoo/i.test(host) ? pass.replace(/\s+/g, "") : pass;
}

/**
 * Gönderim sağlayıcısını çözer — öncelik:
 * 1) Admin panelinde tanımlı SMTP (email_settings)
 * 2) env SMTP (SMTP_HOST…)
 * 3) Resend (RESEND_API_KEY) — opsiyonel
 * Hiçbiri yoksa null → e-posta sessizce atlanır (akış bozulmaz).
 */
async function resolveProvider(): Promise<Provider> {
  // 1) Admin panelinden SMTP
  const db = await getEmailSettings();
  if (db?.host) {
    return {
      kind: "smtp",
      transporter: nodemailer.createTransport({
        host: db.host,
        port: db.port || 587,
        secure: db.secure,
        auth: db.user
          ? { user: db.user, pass: smtpPass(db.host, db.pass) }
          : undefined,
      }),
      from: resolveFrom(db.from, db.user),
    };
  }

  // 2) env SMTP
  if (process.env.SMTP_HOST) {
    return {
      kind: "smtp",
      transporter: nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT ?? 587),
        secure: process.env.SMTP_SECURE === "true",
        auth: process.env.SMTP_USER
          ? {
              user: process.env.SMTP_USER,
              pass: smtpPass(process.env.SMTP_HOST, process.env.SMTP_PASS ?? ""),
            }
          : undefined,
      }),
      from: resolveFrom(ENV_FROM, process.env.SMTP_USER),
    };
  }

  // 3) Resend (opsiyonel geriye dönük)
  if (RESEND_API_KEY) {
    return {
      kind: "resend",
      resend: new Resend(RESEND_API_KEY),
      from: ENV_FROM ?? "Birtek <onboarding@resend.dev>",
    };
  }

  return null;
}

/** Herhangi bir gönderim sağlayıcısı yapılandırılmış mı? */
export async function isEmailConfigured(): Promise<boolean> {
  return (await resolveProvider()) !== null;
}

/**
 * E-posta gönderir. Sağlayıcı yoksa sessizce atlar (graceful) — akış bozulmaz.
 */
export async function sendEmail(opts: SendEmailOpts): Promise<SendResult> {
  let provider: Provider;
  try {
    provider = await resolveProvider();
  } catch (err) {
    return {
      sent: false,
      error: err instanceof Error ? err.message : "provider_error",
    };
  }

  if (!provider) {
    console.info(
      `[email] sağlayıcı yapılandırılmadı — atlandı: "${opts.subject}" -> ${opts.to}`,
    );
    return { sent: false, error: "not_configured" };
  }

  try {
    if (provider.kind === "smtp") {
      const info = await provider.transporter.sendMail({
        from: provider.from,
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
        replyTo: opts.replyTo,
        attachments: opts.attachments,
      });
      return { sent: true, id: info.messageId };
    }

    const { data, error } = await provider.resend.emails.send({
      from: provider.from,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      replyTo: opts.replyTo,
      attachments: opts.attachments?.map((a) => ({
        filename: a.filename,
        content: a.content,
      })),
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
