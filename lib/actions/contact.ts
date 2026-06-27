"use server";

import { contactSchema, type ContactInput } from "@/lib/validation";
import { sendEmail, COMPANY_EMAIL } from "@/lib/email/client";
import { contactToCompany } from "@/lib/email/templates";
import { getSettings } from "@/lib/data/settings";

export type ContactResult =
  | { ok: true; emailed: boolean }
  | { ok: false; error: string };

export async function sendContactMessage(
  input: ContactInput,
): Promise<ContactResult> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Form bilgileri geçersiz." };
  }
  const c = parsed.data;

  let emailed = false;
  if (COMPANY_EMAIL) {
    const settings = await getSettings();
    const r = await sendEmail({
      to: COMPANY_EMAIL,
      replyTo: c.email,
      ...contactToCompany(c, settings),
    });
    emailed = r.sent;
  } else {
    // Anahtar yoksa akışı bozma — log düş.
    console.info(`[contact] COMPANY_EMAIL yok — mesaj loglandı: ${c.email}`);
  }

  return { ok: true, emailed };
}
