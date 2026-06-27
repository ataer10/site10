import { getSettings, settingsToInput } from "@/lib/data/settings";
import { adminConfigured } from "@/lib/data/admin";
import { SettingsForm } from "@/components/admin/settings-form";

export default async function AyarlarPage() {
  const settings = await getSettings();
  return (
    <div>
      <h1 className="mb-1 font-display text-2xl font-extrabold tracking-tight text-ink-900">
        Firma Bilgileri
      </h1>
      <p className="mb-6 text-sm text-ink-500">
        Telefon, adres, WhatsApp ve diğer bilgiler — site genelinde (header,
        footer, iletişim, teklif PDF, e-postalar) kullanılır.
      </p>
      <SettingsForm initial={settingsToInput(settings)} demo={!adminConfigured()} />
    </div>
  );
}
