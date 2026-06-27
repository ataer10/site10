/**
 * Ürün görseli olmayan (image_url = null) ürünler için KATEGORİ bazlı
 * temsili görsel havuzu. Çeşitlilik için kategoride birden çok görsel;
 * ürün slug'ına göre deterministik seçilir. server-only YOK (client-safe).
 */
const CATEGORY_POOL: Record<string, string[]> = {
  "vana-armatur": [
    "/img/pexels-quangludo-12527113.jpg",
    "/img/p/vana.jpg",
  ],
  "boru-fittings": [
    "/img/pexels-sonny-29248902.jpg",
    "/img/p/boru.jpg",
  ],
  "pompa-hidrofor": ["/img/cat-pompa.jpg"],
  "isitma-tesisat": [
    "/img/cat-isitma.jpg",
    "/img/p/isitma.jpg",
  ],
  "baglanti-elemanlari": [
    "/img/pexels-sharaf-design-1962240186-28900882.jpg",
    "/img/p/baglanti.jpg",
  ],
  "olcu-kontrol": [
    "/img/cat-olcu.jpg",
    "/img/p/olcu.jpg",
  ],
};

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/**
 * Kategoriye uygun temsili görsel döner (ürün slug'ına göre deterministik).
 * Eşleşme yoksa null.
 */
export function productFallbackImage(
  categorySlug: string | null | undefined,
  key: string,
): string | null {
  if (!categorySlug) return null;
  const pool = CATEGORY_POOL[categorySlug];
  if (!pool || pool.length === 0) return null;
  return pool[hash(key) % pool.length];
}
