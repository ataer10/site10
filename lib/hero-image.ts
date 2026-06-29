/**
 * Hero görseli kuralları — hem admin formu (client) hem upload action (server)
 * tarafından kullanılır. Yanlış format/boyut/ölçü ile yapının bozulmasını engeller.
 * `server-only` İÇERMEZ (client güvenli).
 */

export const HERO_IMAGE_SPEC = {
  /** Kabul edilen MIME türleri. */
  formats: ["image/jpeg", "image/png", "image/webp"] as const,
  /** İnsan-okunur format etiketi. */
  formatLabel: "JPG, PNG veya WebP",
  /** Azami dosya boyutu (bayt). */
  maxBytes: 2 * 1024 * 1024,
  maxLabel: "2 MB",
  /** Önerilen ölçü. */
  recommended: { width: 2400, height: 1350 },
  recommendedLabel: "2400 × 1350 px",
  /** Asgari ölçü. */
  minWidth: 1600,
  minHeight: 900,
  /** En-boy oranı toleransı (yatay 16:9 ≈ 1.78). */
  aspectMin: 1.5, // 3:2
  aspectMax: 2.0, // ~18:9
  aspectLabel: "16:9 yatay (≈1.78)",
} as const;

/** Kabul edilen uzantılar (input accept için). */
export const HERO_ACCEPT = ".jpg,.jpeg,.png,.webp";

export function formatBytes(n: number): string {
  if (n >= 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  if (n >= 1024) return `${Math.round(n / 1024)} KB`;
  return `${n} B`;
}

/**
 * Tek noktadan doğrulama. width/height verilmezse yalnız format+boyut denetlenir
 * (sunucu, boyutu ayrıca header'dan okuyup tekrar çağırır).
 * Dönen değer: hata mesajı (string) ya da null (geçerli).
 */
export function validateHeroImage(meta: {
  type: string;
  size: number;
  width?: number;
  height?: number;
}): string | null {
  const S = HERO_IMAGE_SPEC;
  if (!S.formats.includes(meta.type as (typeof S.formats)[number])) {
    return `Geçersiz dosya türü. Yalnızca ${S.formatLabel} yükleyebilirsiniz.`;
  }
  if (meta.size > S.maxBytes) {
    return `Dosya çok büyük (${formatBytes(meta.size)}). En fazla ${S.maxLabel} olmalı.`;
  }
  if (meta.size === 0) {
    return "Dosya boş görünüyor.";
  }
  if (meta.width != null && meta.height != null) {
    if (meta.width < S.minWidth || meta.height < S.minHeight) {
      return `Çözünürlük çok düşük (${meta.width}×${meta.height}). En az ${S.minWidth}×${S.minHeight} px olmalı.`;
    }
    const ar = meta.width / meta.height;
    if (ar < S.aspectMin) {
      return `Görsel fazla dikey/kare (oran ${ar.toFixed(2)}:1). Yatay ${S.aspectLabel} olmalı.`;
    }
    if (ar > S.aspectMax) {
      return `Görsel fazla geniş/panoramik (oran ${ar.toFixed(2)}:1). ${S.aspectLabel} olmalı.`;
    }
  }
  return null;
}
