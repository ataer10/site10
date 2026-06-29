"use server";

import { revalidatePath } from "next/cache";
import {
  updateEmailSettings,
  type EmailSettingsInput,
} from "@/lib/data/email-settings";
import { sendEmail } from "@/lib/email/client";

export async function saveEmailSettingsAction(input: EmailSettingsInput) {
  const res = await updateEmailSettings(input);
  if (res.ok) revalidatePath("/admin/eposta");
  return res;
}

/**
 * Kayıtlı SMTP ayarlarıyla test e-postası gönderir.
 * (Önce ayarları kaydedin; test kaydedilmiş ayarları kullanır.)
 */
export async function sendTestEmailAction(
  to: string,
): Promise<{ ok: boolean; error?: string }> {
  const addr = to.trim();
  if (!addr || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(addr)) {
    return { ok: false, error: "Geçerli bir alıcı e-posta adresi girin." };
  }
  const r = await sendEmail({
    to: addr,
    subject: "Birtek — SMTP test e-postası",
    html: `<div style="font-family:Arial,sans-serif;font-size:14px;color:#16181d;line-height:1.6">
      <p>Bu bir <strong>test e-postasıdır</strong>.</p>
      <p>Bu mesajı aldıysanız SMTP ayarlarınız doğru çalışıyor. ✅</p>
      <p style="color:#6c7480;font-size:12px">Birtek Endüstriyel — otomatik test</p>
    </div>`,
  });
  return r.sent
    ? { ok: true }
    : {
        ok: false,
        error:
          r.error === "not_configured"
            ? "SMTP ayarları kayıtlı değil. Önce kaydedin."
            : (r.error ?? "Gönderilemedi."),
      };
}
