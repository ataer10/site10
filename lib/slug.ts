const TR_MAP: Record<string, string> = {
  ç: "c", ğ: "g", ı: "i", ö: "o", ş: "s", ü: "u",
  Ç: "c", Ğ: "g", İ: "i", Ö: "o", Ş: "s", Ü: "u",
};

/** Türkçe karakterleri ASCII'ye indirip URL-güvenli slug üretir. */
export function slugify(input: string): string {
  return input
    .trim()
    .replace(/[çğıöşüÇĞİÖŞÜ]/g, (m) => TR_MAP[m] ?? m)
    .toLocaleLowerCase("en")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}
