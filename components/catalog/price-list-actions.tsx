"use client";

import { FileSpreadsheet, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export type PriceRow = {
  sku: string;
  name: string;
  brand: string;
  category: string;
  unit: string;
  listPrice: number;
  grossPrice: number;
  vatRate: number;
};

/** Fiyat listesi dışa aktarım — CSV (Excel) indir + yazdır (PDF). */
export function PriceListActions({ rows }: { rows: PriceRow[] }) {
  function downloadCsv() {
    const header = [
      "SKU",
      "Ürün",
      "Marka",
      "Kategori",
      "Birim",
      "Liste Fiyatı (TRY)",
      "KDV Dahil (TRY)",
      "KDV %",
    ];
    const tr = (n: number) =>
      n.toLocaleString("tr-TR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    const esc = (v: string) => `"${v.replace(/"/g, '""')}"`;

    const lines = [
      header.map(esc).join(";"),
      ...rows.map((r) =>
        [
          r.sku,
          r.name,
          r.brand,
          r.category,
          r.unit,
          tr(r.listPrice),
          tr(r.grossPrice),
          `%${r.vatRate}`,
        ]
          .map((v) => esc(String(v)))
          .join(";"),
      ),
    ];
    // BOM — Excel'in Türkçe karakterleri doğru okuması için
    const blob = new Blob(["﻿" + lines.join("\r\n")], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "birtek-fiyat-listesi.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="flex flex-wrap gap-2 print:hidden">
      <Button variant="outline" size="sm" onClick={downloadCsv}>
        <FileSpreadsheet strokeWidth={1.75} />
        Excel (CSV)
      </Button>
      <Button variant="outline" size="sm" onClick={() => window.print()}>
        <Printer strokeWidth={1.75} />
        Yazdır / PDF
      </Button>
    </div>
  );
}
