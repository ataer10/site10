import { defaultSettings } from "@/lib/site";

/** Tek doğru kaynak — site kök URL'i (sondaki / kırpılır). */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? defaultSettings.url
).replace(/\/+$/, "");

/** Göreli yolu mutlak URL'e çevirir. */
export function absoluteUrl(path = "/"): string {
  if (!path || path === "/") return SITE_URL || "/";
  return `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}
