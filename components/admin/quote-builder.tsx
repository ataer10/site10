"use client";

import * as React from "react";
import {
  Save,
  FileDown,
  Send,
  Loader2,
  CircleCheckBig,
  TriangleAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { calcQuote } from "@/lib/quote-calc";
import { formatPrice } from "@/lib/utils";
import {
  saveDiscountsAction,
  sendQuoteToCustomerAction,
  setStatusAction,
} from "@/lib/actions/admin";
import type { QuoteStatus } from "@/lib/data/admin";

export type BuilderItem = {
  id: string;
  productName: string;
  sku: string | null;
  qty: number;
  unit: string;
  listPrice: number;
  vatRate: number;
  discountRate: number | null;
};

export function QuoteBuilder({
  quoteId,
  status,
  initialGlobal,
  initialValidUntil,
  items,
  demo,
}: {
  quoteId: string;
  status: QuoteStatus;
  initialGlobal: number;
  initialValidUntil: string | null;
  items: BuilderItem[];
  demo: boolean;
}) {
  const [global, setGlobal] = React.useState(String(initialGlobal ?? 0));
  const [validUntil, setValidUntil] = React.useState(
    initialValidUntil ? initialValidUntil.slice(0, 10) : "",
  );
  const [rates, setRates] = React.useState<Record<string, string>>(() =>
    Object.fromEntries(
      items.map((it) => [it.id, it.discountRate != null ? String(it.discountRate) : ""]),
    ),
  );
  const [pending, startTransition] = React.useTransition();
  const [msg, setMsg] = React.useState<
    { kind: "ok" | "err"; text: string } | null
  >(null);

  const globalNum = clamp(parseNum(global) ?? 0);
  const parsedRate = (id: string): number | null => {
    const v = rates[id];
    if (v === undefined || v.trim() === "") return null;
    const n = parseNum(v);
    return n === null ? null : clamp(n);
  };

  const totals = calcQuote(
    items.map((it) => ({
      listPrice: it.listPrice,
      qty: it.qty,
      vatRate: it.vatRate,
      discountRate: parsedRate(it.id),
    })),
    globalNum,
  );

  function payload() {
    return {
      globalDiscountRate: globalNum,
      validUntil: validUntil || null,
      items: items.map((it) => ({ id: it.id, discountRate: parsedRate(it.id) })),
    };
  }

  function handleSave() {
    setMsg(null);
    startTransition(async () => {
      const res = await saveDiscountsAction(quoteId, payload());
      setMsg(
        res.ok
          ? { kind: "ok", text: demo ? "Hesaplandı (demo — kalıcı değil)." : "Teklif kaydedildi." }
          : { kind: "err", text: res.error ?? "Kaydedilemedi." },
      );
    });
  }

  function handleSend() {
    if (!window.confirm("Teklif PDF olarak müşteriye e-posta ile gönderilsin mi?"))
      return;
    setMsg(null);
    startTransition(async () => {
      // Önce mevcut iskontoları kaydet, sonra gönder
      await saveDiscountsAction(quoteId, payload());
      const res = await sendQuoteToCustomerAction(quoteId);
      if (res.ok) {
        setMsg({
          kind: "ok",
          text: res.emailed
            ? "Teklif müşteriye gönderildi (durum: Teklif verildi)."
            : res.demo
              ? "Demo: PDF üretildi, mail anahtarı yok (gönderilmedi)."
              : "PDF üretildi ancak e-posta gönderilemedi (RESEND_API_KEY?).",
        });
      } else {
        setMsg({ kind: "err", text: res.error });
      }
    });
  }

  function handleStatus(s: QuoteStatus) {
    startTransition(async () => {
      await setStatusAction(quoteId, s);
      setMsg({ kind: "ok", text: "Durum güncellendi." });
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      {/* Kalemler + iskontolar */}
      <div className="lg:col-span-8">
        <div className="overflow-hidden rounded-md border border-ink-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-ink-200 bg-ink-50">
              <tr>
                <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">
                  Ürün
                </th>
                <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-ink-500">
                  Adet
                </th>
                <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-ink-500">
                  Liste
                </th>
                <th className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-ink-500">
                  İsk. %
                </th>
                <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-ink-500">
                  Net
                </th>
                <th className="px-3 py-2.5 text-right text-xs font-semibold uppercase tracking-wide text-ink-500">
                  Tutar
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {items.map((it, idx) => {
                const ln = totals.lines[idx];
                const overridden = rates[it.id]?.trim() !== "";
                return (
                  <tr key={it.id}>
                    <td className="px-3 py-3">
                      <span className="font-medium text-ink-900">{it.productName}</span>
                      {it.sku ? (
                        <span className="block font-mono text-[11px] text-ink-400">
                          {it.sku}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-3 py-3 text-right text-ink-700 tnum whitespace-nowrap">
                      {it.qty} {it.unit}
                    </td>
                    <td className="px-3 py-3 text-right text-ink-700 tnum whitespace-nowrap">
                      {formatPrice(it.listPrice)}
                    </td>
                    <td className="px-3 py-3">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step="0.5"
                        value={rates[it.id] ?? ""}
                        onChange={(e) =>
                          setRates((r) => ({ ...r, [it.id]: e.target.value }))
                        }
                        placeholder={`${globalNum}`}
                        className="mx-auto block w-16 rounded-sm border border-ink-300 px-2 py-1 text-center text-sm tnum focus-visible:border-steel-500 focus-visible:outline-2 focus-visible:outline-ring"
                        aria-label={`${it.productName} iskonto yüzdesi`}
                      />
                      {!overridden ? (
                        <span className="mt-0.5 block text-center text-[10px] text-ink-400">
                          genel
                        </span>
                      ) : null}
                    </td>
                    <td className="px-3 py-3 text-right text-ink-700 tnum whitespace-nowrap">
                      {formatPrice(ln.netUnit)}
                    </td>
                    <td className="px-3 py-3 text-right font-semibold text-ink-900 tnum whitespace-nowrap">
                      {formatPrice(ln.lineNet)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-xs text-ink-400">
          Kalem iskontosu boşsa <strong>genel iskonto</strong> uygulanır. Net birim ={" "}
          liste × (1 − iskonto/100). KDV her kalemin oranından hesaplanır.
        </p>
      </div>

      {/* Ayarlar + toplamlar + aksiyonlar */}
      <div className="lg:col-span-4">
        <div className="sticky top-6 space-y-4">
          <div className="rounded-md border border-ink-200 bg-white p-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Genel İskonto %</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step="0.5"
                  value={global}
                  onChange={(e) => setGlobal(e.target.value)}
                  className="tnum"
                />
              </div>
              <div>
                <Label>Geçerlilik</Label>
                <Input
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                />
              </div>
            </div>

            <dl className="mt-5 space-y-2 border-t border-ink-100 pt-4 text-sm">
              <Row label="Ara toplam (liste)" value={formatPrice(totals.subtotal)} />
              <Row label="İskonto" value={`- ${formatPrice(totals.discountTotal)}`} />
              <Row label="Net ara toplam" value={formatPrice(totals.netSubtotal)} />
              <Row label="KDV" value={formatPrice(totals.vatTotal)} />
              <div className="flex items-center justify-between border-t border-ink-200 pt-2">
                <dt className="font-display font-bold text-ink-900">Genel toplam</dt>
                <dd className="font-display text-lg font-extrabold text-ink-900 tnum">
                  {formatPrice(totals.grandTotal)}
                </dd>
              </div>
            </dl>
          </div>

          {msg ? (
            <div
              className={`flex items-start gap-2 rounded-sm border px-3 py-2.5 text-sm ${
                msg.kind === "ok"
                  ? "border-steel-200 bg-steel-50 text-steel-700"
                  : "border-danger/30 bg-danger/5 text-danger"
              }`}
            >
              {msg.kind === "ok" ? (
                <CircleCheckBig className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} />
              ) : (
                <TriangleAlert className="mt-0.5 size-4 shrink-0" strokeWidth={1.75} />
              )}
              {msg.text}
            </div>
          ) : null}

          <div className="space-y-2">
            <Button onClick={handleSave} variant="primary" className="w-full" disabled={pending}>
              {pending ? <Loader2 className="animate-spin" /> : <Save strokeWidth={1.75} />}
              Kaydet
            </Button>
            <Button asChild variant="outline" className="w-full">
              <a href={`/admin/teklifler/${quoteId}/pdf`} target="_blank" rel="noopener noreferrer">
                <FileDown strokeWidth={1.75} />
                Teklif PDF (kaydedilmiş)
              </a>
            </Button>
            <Button onClick={handleSend} variant="accent" className="w-full" disabled={pending}>
              {pending ? <Loader2 className="animate-spin" /> : <Send strokeWidth={1.75} />}
              Müşteriye Gönder
            </Button>
          </div>

          <div className="rounded-md border border-ink-200 bg-white p-3">
            <p className="mb-2 px-1 text-xs font-medium uppercase tracking-wide text-ink-400">
              Durum
            </p>
            <div className="flex gap-1.5">
              {(["new", "quoted", "closed"] as QuoteStatus[]).map((sKey) => (
                <button
                  key={sKey}
                  onClick={() => handleStatus(sKey)}
                  disabled={pending}
                  className={`flex-1 rounded-sm border px-2 py-1.5 text-xs font-medium transition-colors ${
                    status === sKey
                      ? "border-ink-900 bg-ink-900 text-white"
                      : "border-ink-200 text-ink-600 hover:bg-ink-50"
                  }`}
                >
                  {sKey === "new" ? "Yeni" : sKey === "quoted" ? "Teklif verildi" : "Kapandı"}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-ink-500">{label}</dt>
      <dd className="text-ink-900 tnum">{value}</dd>
    </div>
  );
}

function parseNum(v: string): number | null {
  const n = Number(v.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}
function clamp(n: number): number {
  return Math.min(100, Math.max(0, n));
}
