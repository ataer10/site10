"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import {
  Save,
  Loader2,
  CircleCheckBig,
  TriangleAlert,
  Send,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import {
  saveEmailSettingsAction,
  sendTestEmailAction,
} from "@/lib/actions/email-settings";
import type { EmailSettingsSafe } from "@/lib/data/email-settings";

type Values = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
};

export function EmailSettingsForm({
  initial,
  demo,
  testTo,
}: {
  initial: EmailSettingsSafe;
  demo: boolean;
  testTo: string;
}) {
  const [pending, startTransition] = React.useTransition();
  const [msg, setMsg] = React.useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const [testRecipient, setTestRecipient] = React.useState(testTo || "");
  const [testing, startTest] = React.useTransition();
  const [testMsg, setTestMsg] = React.useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const { register, handleSubmit } = useForm<Values>({
    defaultValues: {
      host: initial.host,
      port: initial.port,
      secure: initial.secure,
      user: initial.user,
      pass: "",
      from: initial.from,
    },
  });

  function onSave(values: Values) {
    setMsg(null);
    startTransition(async () => {
      const res = await saveEmailSettingsAction(values);
      setMsg(
        res.ok
          ? {
              kind: "ok",
              text: res.demo
                ? "Kaydedildi (demo — Supabase yokken kalıcı değil)."
                : "SMTP ayarları kaydedildi.",
            }
          : { kind: "err", text: res.error ?? "Kaydedilemedi." },
      );
    });
  }

  function onTest() {
    setTestMsg(null);
    startTest(async () => {
      const res = await sendTestEmailAction(testRecipient);
      setTestMsg(
        res.ok
          ? { kind: "ok", text: `Test e-postası gönderildi → ${testRecipient}` }
          : { kind: "err", text: res.error ?? "Gönderilemedi." },
      );
    });
  }

  return (
    <div className="max-w-3xl space-y-5">
      {/* Yardım kutusu */}
      <div className="flex gap-3 rounded-md border border-steel-200 bg-steel-50 p-4 text-sm text-steel-800">
        <Info className="mt-0.5 size-5 shrink-0 text-steel-600" strokeWidth={1.75} />
        <div className="space-y-1">
          <p className="font-semibold">SMTP nasıl doldurulur?</p>
          <ul className="list-disc space-y-0.5 pl-4 text-steel-700">
            <li>
              <strong>Google Workspace / Gmail:</strong> smtp.gmail.com · Port 587
              · SSL kapalı · uygulama şifresi
            </li>
            <li>
              <strong>Office 365:</strong> smtp.office365.com · Port 587 · SSL
              kapalı
            </li>
            <li>
              Port <strong>465</strong> kullanıyorsanız “SSL/TLS”yi işaretleyin;
              <strong> 587</strong> (STARTTLS) için boş bırakın.
            </li>
          </ul>
        </div>
      </div>

      {/* Ayar formu */}
      <form onSubmit={handleSubmit(onSave)} className="space-y-5">
        <Card title="SMTP Sunucusu">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>SMTP sunucusu (host) *</Label>
              <Input {...register("host")} placeholder="smtp.firma.com" />
            </div>
            <div>
              <Label>Port</Label>
              <Input
                type="number"
                {...register("port", { valueAsNumber: true })}
                placeholder="587"
              />
            </div>
            <div className="flex items-end pb-2.5">
              <label className="inline-flex items-center gap-2 text-sm text-ink-700">
                <input
                  type="checkbox"
                  {...register("secure")}
                  className="size-4 accent-steel-600"
                />
                SSL/TLS kullan (port 465)
              </label>
            </div>
            <div>
              <Label>Kullanıcı adı</Label>
              <Input
                {...register("user")}
                placeholder="teklif@birtek.com.tr"
                autoComplete="off"
              />
            </div>
            <div>
              <Label>Şifre</Label>
              <Input
                type="password"
                {...register("pass")}
                autoComplete="new-password"
                placeholder={
                  initial.hasPassword
                    ? "•••••••• (değiştirmek için yazın)"
                    : "SMTP şifresi"
                }
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Gönderen adres (from)</Label>
              <Input
                {...register("from")}
                placeholder='Birtek Endüstriyel <teklif@birtek.com.tr>'
              />
            </div>
          </div>
        </Card>

        {msg ? <Alert {...msg} /> : null}

        {demo ? (
          <p className="text-xs text-ink-400">
            Not: Kalıcı kayıt için Supabase service-role anahtarı gereklidir.
          </p>
        ) : null}

        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? <Loader2 className="animate-spin" /> : <Save strokeWidth={1.75} />}
          Kaydet
        </Button>
      </form>

      {/* Bağlantı testi */}
      <Card title="Bağlantı testi">
        <p className="mb-3 text-sm text-ink-500">
          Kayıtlı SMTP ayarlarıyla bir test e-postası gönderir. Önce yukarıdan{" "}
          <strong>Kaydet</strong>’e bastığınızdan emin olun.
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Label>Test alıcısı</Label>
            <Input
              type="email"
              value={testRecipient}
              onChange={(e) => setTestRecipient(e.target.value)}
              placeholder="ornek@firma.com"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={onTest}
            disabled={testing}
          >
            {testing ? (
              <Loader2 className="animate-spin" />
            ) : (
              <Send strokeWidth={1.75} />
            )}
            Test gönder
          </Button>
        </div>
        {testMsg ? (
          <div className="mt-3">
            <Alert {...testMsg} />
          </div>
        ) : null}
      </Card>
    </div>
  );
}

function Alert({ kind, text }: { kind: "ok" | "err"; text: string }) {
  return (
    <div
      className={`flex items-start gap-2 rounded-sm border px-3 py-2.5 text-sm ${
        kind === "ok"
          ? "border-steel-200 bg-steel-50 text-steel-700"
          : "border-danger/30 bg-danger/5 text-danger"
      }`}
    >
      {kind === "ok" ? (
        <CircleCheckBig className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} />
      ) : (
        <TriangleAlert className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} />
      )}
      {text}
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-ink-200 bg-white p-5">
      <h2 className="mb-4 font-display text-sm font-bold uppercase tracking-wide text-ink-700">
        {title}
      </h2>
      {children}
    </div>
  );
}
