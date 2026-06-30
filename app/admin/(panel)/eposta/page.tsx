import { getEmailSettingsSafe } from "@/lib/data/email-settings";
import { getEmailTemplates } from "@/lib/data/email-templates";
import { getSettings } from "@/lib/data/settings";
import { adminConfigured } from "@/lib/data/admin";
import { EmailSettingsForm } from "@/components/admin/email-settings-form";
import { EmailTemplatesForm } from "@/components/admin/email-templates-form";

export default async function EpostaPage() {
  const [email, templates, settings] = await Promise.all([
    getEmailSettingsSafe(),
    getEmailTemplates(),
    getSettings(),
  ]);
  const demo = !adminConfigured();

  return (
    <div className="space-y-10">
      <section>
        <h1 className="mb-1 font-display text-2xl font-extrabold tracking-tight text-ink-900">
          E-posta (SMTP)
        </h1>
        <p className="mb-6 max-w-2xl text-sm text-ink-500">
          Teklif talebi bildirimleri ve müşteriye giden e-postalar bu SMTP
          sunucusu üzerinden gönderilir. Bilgileri kaydedip aşağıdan bir test
          e-postası gönderebilirsiniz.
        </p>
        <EmailSettingsForm initial={email} demo={demo} testTo={settings.email} />
      </section>

      <section>
        <h2 className="mb-1 font-display text-xl font-extrabold tracking-tight text-ink-900">
          Müşteri e-posta şablonları
        </h2>
        <p className="mb-6 max-w-2xl text-sm text-ink-500">
          Müşteriye giden e-postaların metinlerini buradan düzenleyin. Kalem
          tablosu, toplamlar ve üst/alt şablon otomatik üretilir; siz konu,
          başlık ve metinleri yönetirsiniz.
        </p>
        <EmailTemplatesForm initial={templates} demo={demo} />
      </section>
    </div>
  );
}
