import { getEmailSettingsSafe } from "@/lib/data/email-settings";
import { getSettings } from "@/lib/data/settings";
import { adminConfigured } from "@/lib/data/admin";
import { EmailSettingsForm } from "@/components/admin/email-settings-form";

export default async function EpostaPage() {
  const [email, settings] = await Promise.all([
    getEmailSettingsSafe(),
    getSettings(),
  ]);
  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-extrabold tracking-tight text-ink-900">
        E-posta (SMTP)
      </h1>
      <p className="mb-6 max-w-2xl text-sm text-ink-500">
        Teklif talebi bildirimleri ve müşteriye giden e-postalar bu SMTP sunucusu
        üzerinden gönderilir. Bilgileri kaydedip aşağıdan bir test e-postası
        gönderebilirsiniz.
      </p>
      <EmailSettingsForm
        initial={email}
        demo={!adminConfigured()}
        testTo={settings.email}
      />
    </div>
  );
}
