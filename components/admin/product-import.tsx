"use client";

import * as React from "react";
import * as XLSX from "xlsx";
import {
  Upload,
  Loader2,
  CircleCheckBig,
  TriangleAlert,
  FileSpreadsheet,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { importProductsAction } from "@/lib/actions/admin";

type Parsed = { headers: string[]; rows: Record<string, string>[] };
type RefCategory = { name: string; subs: string[] };

/** Şablon başlıkları (importProducts TR/EN başlıkları tanır). */
const TEMPLATE_HEADERS = [
  "ad",
  "sku",
  "marka",
  "kategori",
  "alt kategori",
  "fiyat",
  "birim",
  "kdv",
  "açıklama",
];

const TEMPLATE_EXAMPLES: (string | number)[][] = [
  ["Küresel Vana DN50", "VN-KV-50", "Grundfos", "Vana & Armatür", "Küresel Vana", 1240, "adet", 20, "PN16 paslanmaz küresel vana"],
  ["Paslanmaz Dirsek 90° DN42", "FT-PS-90-42", "Viega", "Boru & Fittings", "Dirsek", 86.5, "adet", 20, ""],
];

/* ----------------------------- CSV ayrıştırma ----------------------------- */
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

/* ---------------------------- Excel ayrıştırma ---------------------------- */
async function parseXlsx(file: File): Promise<Parsed> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  if (!ws) return { headers: [], rows: [] };
  const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, { defval: "" });
  if (json.length === 0) return { headers: [], rows: [] };
  const headers = Object.keys(json[0]).map((h) => h.trim().toLowerCase());
  const rows = json
    .map((obj) => {
      const o: Record<string, string> = {};
      for (const [k, v] of Object.entries(obj)) {
        o[k.trim().toLowerCase()] = v == null ? "" : String(v).trim();
      }
      return o;
    })
    .filter((r) => Object.values(r).some((v) => v !== ""));
  return { headers, rows };
}

export function ProductImport({
  demo,
  brands,
  categories,
  onImported,
}: {
  demo: boolean;
  brands: string[];
  categories: RefCategory[];
  onImported?: () => void;
}) {
  const [parsed, setParsed] = React.useState<Parsed | null>(null);
  const [fileName, setFileName] = React.useState<string>("");
  const [pending, startTransition] = React.useTransition();
  const [result, setResult] = React.useState<
    { ok: boolean; inserted: number; errors: string[]; demo?: boolean } | null
  >(null);

  function downloadTemplate() {
    const wb = XLSX.utils.book_new();

    // 1) Ürünler sayfası (başlık + örnek satırlar)
    const ws = XLSX.utils.aoa_to_sheet([TEMPLATE_HEADERS, ...TEMPLATE_EXAMPLES]);
    ws["!cols"] = [
      { wch: 30 }, { wch: 16 }, { wch: 16 }, { wch: 18 },
      { wch: 18 }, { wch: 12 }, { wch: 10 }, { wch: 8 }, { wch: 40 },
    ];
    XLSX.utils.book_append_sheet(wb, ws, "Ürünler");

    // 2) Referans sayfası (geçerli marka / kategori / alt kategori adları)
    const allSubs = categories.flatMap((c) => c.subs);
    const catNames = categories.map((c) => c.name);
    const maxLen = Math.max(brands.length, catNames.length, allSubs.length, 1);
    const refRows: string[][] = [["Markalar", "Kategoriler", "Alt kategoriler"]];
    for (let i = 0; i < maxLen; i++) {
      refRows.push([brands[i] ?? "", catNames[i] ?? "", allSubs[i] ?? ""]);
    }
    const refWs = XLSX.utils.aoa_to_sheet(refRows);
    refWs["!cols"] = [{ wch: 22 }, { wch: 22 }, { wch: 22 }];
    XLSX.utils.book_append_sheet(wb, refWs, "Referans");

    const out = XLSX.write(wb, { type: "array", bookType: "xlsx" });
    const blob = new Blob([out], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "birtek-urun-sablonu.xlsx";
    a.click();
    URL.revokeObjectURL(url);
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setResult(null);
    setFileName(file.name);
    const ext = file.name.toLowerCase().split(".").pop();
    if (ext === "csv") {
      const text = await file.text();
      setParsed(parseCsv(text));
    } else {
      setParsed(await parseXlsx(file));
    }
    e.target.value = "";
  }

  function onImport() {
    if (!parsed) return;
    setResult(null);
    startTransition(async () => {
      const res = await importProductsAction(parsed.rows);
      setResult(res);
      if (res.ok && !res.demo) onImported?.();
    });
  }

  return (
    <div className="space-y-5">
      {/* 1) Şablon indir */}
      <div className="rounded-md border border-ink-200 bg-white p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-sm font-bold uppercase tracking-wide text-ink-700">
              1. Excel şablonunu indir
            </h2>
            <p className="mt-1 text-sm text-ink-500">
              Hazır başlıklı şablonu indirip ürünlerinizi doldurun. İkinci sayfada
              (“Referans”) geçerli marka / kategori / alt kategori adları listelidir.
            </p>
          </div>
          <Button onClick={downloadTemplate} variant="primary" size="sm" className="shrink-0">
            <Download strokeWidth={1.75} />
            Şablonu indir (.xlsx)
          </Button>
        </div>
      </div>

      {/* 2) Dosya yükle */}
      <div className="rounded-md border border-ink-200 bg-white p-5">
        <h2 className="font-display text-sm font-bold uppercase tracking-wide text-ink-700">
          2. Doldurulmuş dosyayı yükle
        </h2>
        <p className="mt-1 text-sm text-ink-500">
          Excel (<code className="font-mono text-xs">.xlsx</code>) veya CSV. Mevcut
          ürünler <code className="font-mono text-xs">ad</code>’dan üretilen{" "}
          <code className="font-mono text-xs">slug</code> üzerinden güncellenir
          (aynı ad → güncelle, yeni ad → ekle).
        </p>
        <label className="mt-4 flex cursor-pointer items-center justify-center gap-2 rounded-sm border border-dashed border-ink-300 bg-ink-50 px-4 py-6 text-sm text-ink-600 hover:bg-ink-100">
          <Upload className="size-4" strokeWidth={1.75} />
          {fileName || "Excel / CSV dosyası seç"}
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={onFile}
          />
        </label>
      </div>

      {/* Önizleme */}
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
      ) : parsed && parsed.rows.length === 0 ? (
        <p className="rounded-md border border-ink-200 bg-ink-50 px-4 py-3 text-sm text-ink-600">
          Dosyada veri satırı bulunamadı. Başlık satırı + en az bir ürün olmalı.
        </p>
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

      {demo ? (
        <p className="text-xs text-ink-400">
          Not: Kalıcı kayıt için Supabase service-role anahtarı gereklidir.
        </p>
      ) : null}
    </div>
  );
}
