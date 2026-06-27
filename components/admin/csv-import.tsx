"use client";

import * as React from "react";
import { Upload, Loader2, CircleCheckBig, TriangleAlert, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { importProductsAction } from "@/lib/actions/admin";

type Parsed = { headers: string[]; rows: Record<string, string>[] };

function parseCsv(text: string): Parsed {
  const norm = text.replace(/\r\n?/g, "\n").trim();
  if (!norm) return { headers: [], rows: [] };
  const firstLine = norm.split("\n")[0];
  const delim = firstLine.split(";").length > firstLine.split(",").length ? ";" : ",";

  const records: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;
  for (let i = 0; i < norm.length; i++) {
    const ch = norm[i];
    if (inQuotes) {
      if (ch === '"') {
        if (norm[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += ch;
    } else if (ch === '"') inQuotes = true;
    else if (ch === delim) {
      row.push(field);
      field = "";
    } else if (ch === "\n") {
      row.push(field);
      records.push(row);
      row = [];
      field = "";
    } else field += ch;
  }
  row.push(field);
  records.push(row);

  const headers = records[0].map((h) => h.trim().toLowerCase());
  const rows = records
    .slice(1)
    .filter((r) => r.some((c) => c.trim() !== ""))
    .map((r) => {
      const o: Record<string, string> = {};
      headers.forEach((h, idx) => (o[h] = (r[idx] ?? "").trim()));
      return o;
    });
  return { headers, rows };
}

export function CsvImport({ demo }: { demo: boolean }) {
  const [parsed, setParsed] = React.useState<Parsed | null>(null);
  const [fileName, setFileName] = React.useState<string>("");
  const [pending, startTransition] = React.useTransition();
  const [result, setResult] = React.useState<
    { ok: boolean; inserted: number; errors: string[]; demo?: boolean } | null
  >(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setResult(null);
    setFileName(file.name);
    const text = await file.text();
    setParsed(parseCsv(text));
  }

  function onImport() {
    if (!parsed) return;
    setResult(null);
    startTransition(async () => {
      const res = await importProductsAction(parsed.rows);
      setResult(res);
    });
  }

  return (
    <div className="space-y-5">
      <div className="rounded-md border border-ink-200 bg-white p-5">
        <h2 className="font-display text-sm font-bold uppercase tracking-wide text-ink-700">
          CSV dosyası
        </h2>
        <p className="mt-1 text-sm text-ink-500">
          Sütunlar (Türkçe/İngilizce başlık): <code className="font-mono text-xs">name/ad</code>,{" "}
          <code className="font-mono text-xs">sku</code>,{" "}
          <code className="font-mono text-xs">brand/marka</code>,{" "}
          <code className="font-mono text-xs">category/kategori</code>,{" "}
          <code className="font-mono text-xs">subcategory/alt kategori</code>,{" "}
          <code className="font-mono text-xs">list_price/fiyat</code>,{" "}
          <code className="font-mono text-xs">unit/birim</code>,{" "}
          <code className="font-mono text-xs">vat_rate/kdv</code>,{" "}
          <code className="font-mono text-xs">description/açıklama</code>. Ayraç{" "}
          <code className="font-mono text-xs">;</code> veya{" "}
          <code className="font-mono text-xs">,</code> otomatik algılanır.
        </p>

        <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-sm border border-dashed border-ink-300 bg-ink-50 px-4 py-6 text-sm text-ink-600 hover:bg-ink-100">
          <Upload className="size-4" strokeWidth={1.75} />
          {fileName || "CSV dosyası seç"}
          <input type="file" accept=".csv,text/csv" className="hidden" onChange={onFile} />
        </label>
      </div>

      {parsed && parsed.rows.length > 0 ? (
        <div className="rounded-md border border-ink-200 bg-white">
          <div className="flex items-center justify-between border-b border-ink-100 px-5 py-3">
            <p className="text-sm">
              <FileSpreadsheet className="mr-1.5 inline size-4 text-steel-600" strokeWidth={1.75} />
              <strong>{parsed.rows.length}</strong> satır okundu
            </p>
            <Button onClick={onImport} variant="primary" size="sm" disabled={pending}>
              {pending ? <Loader2 className="animate-spin" /> : <Upload strokeWidth={1.75} />}
              İçe aktar
            </Button>
          </div>
          <div className="max-h-72 overflow-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-ink-50">
                <tr>
                  {parsed.headers.slice(0, 6).map((h) => (
                    <th key={h} className="px-3 py-2 text-left font-semibold uppercase text-ink-500">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-100">
                {parsed.rows.slice(0, 8).map((r, i) => (
                  <tr key={i}>
                    {parsed.headers.slice(0, 6).map((h) => (
                      <td key={h} className="px-3 py-1.5 text-ink-700">
                        {r[h]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {parsed.rows.length > 8 ? (
            <p className="border-t border-ink-100 px-5 py-2 text-xs text-ink-400">
              …ve {parsed.rows.length - 8} satır daha
            </p>
          ) : null}
        </div>
      ) : null}

      {result ? (
        <div
          className={`rounded-md border px-5 py-4 text-sm ${
            result.ok ? "border-steel-200 bg-steel-50" : "border-danger/30 bg-danger/5"
          }`}
        >
          <p className={`flex items-center gap-2 font-medium ${result.ok ? "text-steel-700" : "text-danger"}`}>
            {result.ok ? (
              <CircleCheckBig className="size-4" strokeWidth={1.75} />
            ) : (
              <TriangleAlert className="size-4" strokeWidth={1.75} />
            )}
            {result.ok
              ? `${result.inserted} ürün ${result.demo ? "işlendi (demo — kalıcı değil)" : "içe aktarıldı"}.`
              : "İçe aktarma başarısız."}
          </p>
          {result.errors.length > 0 ? (
            <ul className="mt-2 list-disc space-y-0.5 pl-5 text-xs text-ink-500">
              {result.errors.slice(0, 8).map((e, i) => (
                <li key={i}>{e}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
