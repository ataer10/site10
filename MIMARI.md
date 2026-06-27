# Birtek Endüstriyel — Proje Mimarisi & Geliştirici Dokümanı

> Bu dosya, projeyi sıfırdan tanımayan bir yapay zekânın (veya geliştiricinin)
> kodun tamamını, mimari kararları, UI/UX'i ve işlevleri **eksiksiz** anlaması
> için yazılmıştır. Kod tabanıyla birlikte okunmalıdır.

---

## 1. Proje Nedir?

**Endüstriyel tesisat malzemeleri** satan bir firma için **kurumsal B2B web
sitesi**. Akış:

1. Müşteri **açık fiyatlı katalogdan** ürünleri inceler (marka → kategori → alt
   kategori → ürün), filtreler, arar.
2. Ürünleri **sepete** ekler (üyelik gerekmez).
3. **Teklif talebi** gönderir (ad, firma, e-posta, telefon, not).
4. Talep firmaya **e-posta** olarak düşer + Supabase'e kaydolur; müşteriye onay
   maili gider.
5. Firma **admin panelinden** teklifi açar, **kalem bazlı / genel iskonto**
   girer, **PDF** üretir ve **müşteriye e-posta ile gönderir** (durum `quoted`).
6. Firma ayrıca ürün / marka / katalog / firma-bilgisi **yönetimini** admin'den
   yapar.

İçerik dili **Türkçe**. Para birimi **TRY (₺)**, KDV **%20**. Fiyat/sayı biçimi
`tr-TR` locale + `tabular-nums`.

---

## 2. Teknoloji Yığını (gerçek sürümler)

| Katman | Seçim | Not |
|---|---|---|
| Framework | **Next.js 16.2.9** (App Router, **Turbopack**) | Prompt "Next 15" diyordu; create-next-app güncel olarak 16 verdi. **DİKKAT: Next 16 bazı konvansiyonları değiştirdi** (aşağıda) |
| Dil | **TypeScript** (strict) | |
| Stil | **Tailwind CSS v4** | Config dosyası YOK; tasarım token'ları `app/globals.css` içinde `@theme` ile |
| UI primitifleri | **shadcn deseni** (elle yazılmış) + `@radix-ui/react-slot` | `components/ui/` |
| DB / Auth / Storage | **Supabase** (Postgres + GoTrue + Storage) | Bölge **eu-north-1** |
| Form | **react-hook-form** + **zod** (v4) + `@hookform/resolvers` | |
| Sepet | **Zustand** (+ `persist`, localStorage) | |
| E-posta | **Resend** (`resend` paketi) | |
| PDF | **@react-pdf/renderer** (v4) | Gömülü DejaVu Sans fontu (Türkçe) |
| İkonlar | **lucide-react** | İnce stroke (1.5), emoji YOK |
| Paket yöneticisi | **pnpm** | |
| Deploy hedefi | **Vercel** | henüz deploy edilmedi |

### Next.js 16'ya özgü KRİTİK farklar (eğitim verisinden farklı olabilir)
- **`middleware.ts` → `proxy.ts`**: Middleware konvansiyonu deprecate oldu.
  Kök dizinde **`proxy.ts`**, içinde `export function proxy(request)` +
  `export const config = { matcher }`.
- **`params` ve `searchParams` artık `Promise`**: sayfa/route bileşenlerinde
  `await params` / `await searchParams` gerekir. Tip: `Promise<{...}>`.
- **`cookies()` async**: `await cookies()`.
- **`cacheComponents` kapalı** (varsayılan): sayfalar normal dinamik/statik.
- AGENTS.md notu: *"This is NOT the Next.js you know"* — yeni kod yazmadan önce
  `node_modules/next/dist/docs/` altındaki ilgili rehbere bak.

---

## 3. En Önemli Mimari Desen: "Graceful Fallback" (Demo ↔ Canlı)

**Proje, hiçbir ortam değişkeni olmadan da tam çalışır.** Her dış servis için
"yapılandırıldı mı?" kontrolü vardır; yapılandırılmamışsa **seed/demo** veriye
düşer. Bu sayede geliştirme, anahtarlar olmadan da yapılabilir ve anahtar
eklenince otomatik **canlıya** geçer.

| Servis | Yapılandırılmışsa | Değilse (fallback) | Kontrol |
|---|---|---|---|
| Supabase okuma | Canlı DB (anon key) | `lib/data/seed.ts` seed verisi | `isSupabaseConfigured()` (URL + ANON) |
| Supabase yazma/admin | Service-role ile DB | Demo (no-op başarı) | `isSupabaseAdminConfigured()` (URL + SERVICE_ROLE) |
| Auth (admin giriş) | Gerçek Supabase Auth | Demo bypass (giriş yok) | `isSupabaseConfigured()` |
| E-posta | Resend ile gönder | Sessizce atla (log) | `isEmailConfigured()` (RESEND_API_KEY) |

Bu desen `lib/supabase/env.ts` içindeki üç fonksiyonla yönetilir:
`isSupabaseConfigured`, `isSupabaseAdminConfigured`, ve e-posta için
`isEmailConfigured` (`lib/email/client.ts`).

**Şu anki durum:** Tüm Supabase anahtarları `.env.local`'de TANIMLI → site
**canlı** (DB'den okuyor, admin yazıyor). Sadece `RESEND_API_KEY` boş → e-posta
gönderimi henüz "atlanıyor" (akış bozulmuyor).

---

## 4. Dizin Yapısı

```
proxy.ts                      Next 16 proxy (eski middleware) — /admin guard + allowlist
next.config.ts                images.remotePatterns (Supabase Storage) + serverExternalPackages (@react-pdf)
app/
  layout.tsx                  Kök layout — fontlar (Archivo/Inter/JetBrains), generateMetadata (dinamik)
  globals.css                 TÜM tasarım token'ları (@theme): renkler, font, radius, gölge
  (public)/                   ── ROUTE GROUP: kamuya açık site ──
    layout.tsx                Header + main + Footer + WhatsApp float (getSettings() ile dinamik)
    page.tsx                  Anasayfa (hero + teklif önizleme kartı, stats, kategoriler, marka şeridi, CTA)
    hakkimizda/page.tsx
    urunler/page.tsx          Katalog: filtre + arama + sıralama + sayfalama (DİNAMİK, searchParams)
    urunler/[slug]/page.tsx   Ürün detay (SSG, generateStaticParams)
    markalar/page.tsx         Marka grid
    markalar/[slug]/page.tsx  Marka detay + ürünleri + katalog PDF (SSG)
    kataloglar/page.tsx       Katalog kütüphanesi (CatalogLibrary client bileşeni)
    fiyat-listesi/page.tsx    Tablo + CSV/print export
    sepet/page.tsx            Sepet (client, Zustand) — adet/sil/özet
    teklif-iste/page.tsx      Teklif formu (client, RHF+Zod) + createQuote
    iletisim/page.tsx         İletişim formu + bilgi + WhatsApp + harita
  admin/                      ── /admin/* ──
    login/page.tsx            Giriş (route-group DIŞINDA — admin chrome'u almaz)
    (panel)/                  ── ROUTE GROUP: admin paneli (sidebar'lı layout) ──
      layout.tsx              AdminSidebar + içerik + demo banner; getAdminSession()
      page.tsx                Dashboard (özet kartları + son teklifler)
      teklifler/page.tsx      Teklif kuyruğu (durum filtreli)
      teklifler/[id]/page.tsx Teklif detay + QuoteBuilder (iskontolu oluşturucu)
      teklifler/[id]/pdf/route.ts  PDF indirme (route handler, nodejs runtime)
      urunler/...             Ürün CRUD: liste / yeni / [id] / ice-aktar (CSV)
      markalar/...            Marka CRUD: liste / yeni / [id]
      kataloglar/...          Katalog CRUD: liste / yeni / [id]
      ayarlar/page.tsx        Firma bilgileri (site_settings) formu
components/
  ui/                         Tasarım sistemi: button, card, input, table, badge, container
  site/                       header, footer, whatsapp-float, logo, page-header, contact-form, coming-soon, icon
  catalog/                    product-card, product-image, catalog-filters, catalog-toolbar, pagination,
                              brand-card, price-list-actions, catalog-library
  admin/                      admin-sidebar, login-form, quote-status, quote-builder, product-form,
                              brand-form, catalog-form, settings-form, csv-import
lib/
  site.ts                     defaultSettings + SiteSettings tipi, mainNav, VAT_RATE, whatsappLink, toPhoneHref
  utils.ts                    cn() (clsx+tailwind-merge), formatPrice (tr-TR), formatNumber
  slug.ts                     slugify (Türkçe karakter → ASCII)
  validation.ts               TÜM Zod şemaları (teklif, iletişim, ürün)
  quote-calc.ts               İSKONTO HESAP MOTORU (client+server ortak) — calcQuote()
  catalog-params.ts           URL filtre parametreleri (Türkçe: marka/kategori/...) + parse + buildQuery
  admin-access.ts             isAdminEmail() — admin e-posta beyaz listesi (ADMIN_EMAILS)
  auth.ts                     getAdminSession() (server)
  data/
    seed.ts                   KANONİK seed verisi (8 marka, 6 kat, 20 alt kat, 28 ürün)
    catalog.ts                Public katalog veri katmanı (Supabase VEYA seed) — loadCatalog, getProducts...
    catalogs.ts               Katalog kütüphanesi okuma (public) + demo fallback
    settings.ts               getSettings / updateSettings (firma bilgileri)
    admin.ts                  Admin: quotes CRUD + demo teklifler + saveQuoteDiscounts
    admin-products.ts         Admin ürün CRUD + CSV import + getTaxonomy
    admin-brands.ts           Admin marka CRUD
    admin-catalogs.ts         Admin katalog CRUD
  supabase/
    env.ts                    Anahtar okuma + isSupabaseConfigured / isSupabaseAdminConfigured
    types.ts                  Database tipi (elle, şema ile birebir)
    public.ts                 createPublicClient() — COOKIE'SİZ anon client (public okumalar, SSG uyumlu)
    server.ts                 createClient() — COOKIE'Lİ server client (yalnızca AUTH/oturum)
    client.ts                 createClient() — tarayıcı (browser) client
    admin.ts                  createAdminClient() — service-role (RLS bypass, yalnızca sunucu)
    middleware.ts             updateSession() — proxy.ts'in çağırdığı guard mantığı
  actions/                    "use server" Server Actions
    quote.ts                  createQuote (teklif talebi)
    contact.ts                sendContactMessage
    auth.ts                   signIn / signOut
    admin.ts                  saveDiscounts, sendQuoteToCustomer, ürün/marka/katalog CRUD, upload, ayarlar
  email/
    client.ts                 Resend wrapper (graceful) + sendEmail (attachments destekli)
    templates.ts              Kurumsal HTML şablonlar (yeni teklif, talep onayı, hazır teklif PDF, iletişim)
  pdf/
    quote-pdf.tsx             Teklif PDF belgesi (@react-pdf) + renderQuotePdf()
    fonts/                    DejaVuSans(.ttf/-Bold) — PDF'de Türkçe için gömülü
  store/
    cart.ts                   Zustand sepet (persist) + selectCount/Subtotal/VatTotal + useCartHydrated
supabase/
  migrations/0001_init.sql    Şema + RLS + Storage bucket'ları + quote_number trigger
  migrations/0002_settings.sql site_settings tablosu
  migrations/0003_catalogs.sql catalogs tablosu + 'catalogs' bucket
  seed.sql                    seed.ts'ten ÜRETİLİR (pnpm db:seed-sql) — elle düzenleme
scripts/gen-seed-sql.ts       seed.ts → seed.sql üreteci
```

---

## 5. Tasarım Dili (UI/UX) — En Kritik Bölüm

**Hedef:** Ciddi, mühendislik hissi veren, güvenilir Alman endüstriyel B2B
estetiği (Würth, Festo, Grundfos, Viega, Geberit). "AI ürettiği belli"
görünümden kaçınılır.

### Renk paleti (`app/globals.css` `@theme`)
- **`ink-*`** (50→950): Nötr endüstriyel/charcoal gri skala. Taban `ink-900 #16181D`.
- **`steel-*`** (50→900): Çelik mavisi, birincil vurgu. Taban `steel-500 #1B4965`.
- **`orange-*`** (50→800): Endüstriyel turuncu, **CTA aksanı** (ölçülü kullanılır).
  Taban `orange-500 #E2580C`.
- Semantik: `background`, `foreground`, `card`, `muted`, `border` (=ink-200),
  `primary` (=steel), `accent` (=orange), `danger/success/warning`.
- Kullanım: vurgu rengi yalnızca CTA / aktif durum / vurgularda.

### Tipografi
- **Başlıklar (display):** Archivo (sıkı tracking, büyük, kendinden emin) →
  `font-display`. `h1–h4` otomatik display + `letter-spacing:-0.02em`.
- **Gövde:** Inter → `font-sans` (varsayılan).
- **Mono:** JetBrains Mono → `font-mono` — **SKU / parça no / etiketler** (endüstriyel detay).
- **Fiyat & tablolar:** `tabular-nums` (`.tnum` yardımcı sınıfı).

### Bileşen dili
- Az radius (`rounded-sm` 2px → `rounded-md` 4px). Pill YOK.
- 1px **hairline** border (`border-ink-200`). Gölge minimal/flat
  (`shadow-flat`, `shadow-raised`).
- Butonlar yüksek kontrastlı, net. Varyantlar: `primary` (steel), `accent`
  (orange CTA), `solid` (ink), `outline` (hairline), `ghost`, `link`.
- Tablolar temiz, satır ayrımı ince çizgi.
- İkon: lucide, stroke 1.5, tek renk.
- Hareket: ölçülü hover/focus 150–200ms (`--ease-industrial`), erişilebilir
  `focus-visible` ring'leri.
- Layout: katı 12 kolon grid (`max-w-[1280px]` Container), bol whitespace,
  geniş masaüstü öncelikli, sonra responsive.
- Görsel yoksa: **nötr gri çerçeveli placeholder** (asla bozuk görünmez).

### UX desenleri
- Header: üstte koyu yardımcı şerit (telefon/saat), altta logo + nav + sepet
  rozeti + "Teklif İste" CTA. Mobilde hamburger menü.
- Sağ altta sabit **WhatsApp float** butonu (tüm public sayfalarda).
- Sayfa içi başlıklar: koyu `PageHeader` bandı (breadcrumb + başlık).
- Boş durumlar, yükleniyor iskeletleri (skeleton), başarı ekranları her akışta
  tasarlanmıştır.
- Admin: koyu sol sidebar, içerik açık gri zemin, yapılandırma yoksa sarı "demo"
  bandı.

---

## 6. Veri Modeli (Supabase / Postgres)

Migration'lar `supabase/migrations/` altında, **uygulanmış sırayla**:

### `brands` — markalar
`id uuid pk, name, slug unique, logo_url, catalog_pdf_url, sort_order`

### `categories` — kategoriler
`id, name, slug unique, sort_order`

### `subcategories` — alt kategoriler
`id, name, slug, category_id → categories, sort_order, unique(category_id, slug)`

### `products` — ürünler
`id, name, slug unique, sku, brand_id, category_id, subcategory_id,
list_price numeric(12,2), currency='TRY', unit='adet', vat_rate=20,
image_url, description, is_active=true, created_at`

### `quotes` — teklif talepleri/teklifler
`id, quote_number unique (TKL-YYYY-NNNN, TRIGGER ile), customer_name, company,
email, phone, note, status ('new'|'quoted'|'closed'),
global_discount_rate, subtotal, discount_total, vat_total, grand_total,
valid_until, created_at`
- **`set_quote_number` trigger'ı** insert'te `quote_number` üretir (sequence).

### `quote_items` — teklif kalemleri
`id, quote_id → quotes (cascade), product_id, product_name (snapshot),
sku (snapshot), qty, list_price (DONDURULMUŞ liste fiyatı), discount_rate,
vat_rate (snapshot), note`
- **Önemli:** Teklif anındaki liste fiyatı `list_price`'a **dondurulur**;
  ürün fiyatı sonradan değişse teklif bozulmaz.

### `site_settings` — firma bilgileri (tek satır, id='default')
`company_name, short_name, tagline, description, email, phone, whatsapp,
address_line1/2, city, country, working_hours`

### `catalogs` — katalog kütüphanesi
`id, title, brand_id, pdf_url, cover_url, year, description, sort_order,
is_active, created_at` — bir markanın BİRDEN ÇOK kataloğu olabilir.

### RLS (Row Level Security)
- `brands/categories/subcategories/products/catalogs/site_settings`:
  **anon + authenticated SELECT** (public okuma; products/catalogs sadece
  `is_active=true`).
- `quotes/quote_items`: **HİÇBİR anon/authenticated politikası YOK** →
  yalnızca `service_role` (sunucu) erişir.
- Yazma her yerde service-role ile (RLS bypass).

### Storage bucket'ları (public)
- `product-images` (ürün görselleri)
- `brand-assets` (marka logo + katalog PDF)
- `catalogs` (katalog PDF + kapak)

### İskonto mantığı (`lib/quote-calc.ts`)
- Kalem bazlı iskonto **öncelikli**; kalem iskontosu `null` ise `global_discount_rate` uygulanır.
- Net birim = `list_price * (1 - effectiveRate/100)`.
- KDV her kalemin `vat_rate`'inden.
- `calcQuote(items, globalRate)` → `{ lines, subtotal, netSubtotal, discountTotal, vatTotal, grandTotal }`.
- Bu motor **3 yerde aynı** kullanılır: admin canlı önizleme (client), kaydetme (server), PDF.

---

## 7. Sayfalar — UI/UX & İşlevler (detay)

### Public

**`/` Anasayfa** — Bölünmüş hero (klişe ortalı değil): solda başlık + değer
önermesi + 2 CTA (Kataloğu İncele / Teklif İste) + güven mikro-noktaları;
sağda **teknik "teklif önizleme" kartı** (mono SKU + tnum fiyat + ara toplam) —
ürün+teklif akışını anlatır. Altında: koyu istatistik bandı, kategori grid'i,
"Neden Birtek" özellikleri, gri-ton marka şeridi, steel CTA bandı. İçerik
`lib/content.ts`'ten (statik).

**`/urunler` Katalog** — DİNAMİK (searchParams). Sol **filtre** (marka /
kategori → alt kategori; client, URL'i günceller), **arama** (debounce, başlık+SKU+marka),
**sıralama** (isim/fiyat), **sayfalama** (12/sayfa). Ürün kartı: görsel/placeholder,
marka rozeti, SKU (mono), ad, fiyat (KDV hariç + KDV dahil), "Sepete Ekle" + detay.
URL param'ları Türkçe: `?marka=&kategori=&altkategori=&arama=&sirala=&sayfa=`
(`lib/catalog-params.ts`).

**`/urunler/[slug]` Ürün detay** — SSG. Görsel, marka, ad, SKU, fiyat
(KDV hariç/dahil), **adet seçici + Sepete Ekle**, güven rozetleri, teknik
özellikler tablosu, açıklama, **benzer ürünler** (aynı alt kategori).

**`/markalar` + `/markalar/[slug]`** — Marka grid'i; marka detayında o markanın
ürünleri + **katalog PDF indir** (varsa).

**`/kataloglar` Katalog kütüphanesi** — `components/catalog/catalog-library.tsx`
(client). **Liste / Izgara görünüm geçişi** (varsayılan liste = kompakt),
**marka filtre çipleri** (sayılarla), **arama**, sonuç sayacı. Kapağı olmayan
kataloglar için **tasarlanmış minimalist kapak** (marka+yıl+grid deseni, boş
kutu değil). PDF varsa "indir", yoksa "yakında".

**`/fiyat-listesi`** — Temiz tablo (SKU/ürün/marka/kategori/birim/liste/KDV dahil)
+ **Excel(CSV) indir** (BOM'lu, `;` ayraç) + **Yazdır/PDF** (`window.print`,
`print:hidden` ile site chrome'u gizlenir).

**`/sepet`** — Client (Zustand). Kalem listesi (görsel, ad, SKU, adet stepper,
sil), özet (ara toplam KDV hariç, KDV, genel toplam), "Teklif İste" CTA.
Hidrasyon güvenli (`useCartHydrated`).

**`/teklif-iste`** — Client. RHF+Zod form (ad*, firma, e-posta*, telefon, not) +
canlı sepet özeti. Submit → `createQuote` Server Action → başarı ekranı (teklif
no + sepet temizlenir). Sepet boşsa yönlendirici boş durum.

**`/iletisim`** — Bilgi kartları (adres/telefon/e-posta/saat — `getSettings`'ten
dinamik), WhatsApp kutusu, Google harita iframe, iletişim formu (`ContactForm`
client → `sendContactMessage`).

### Admin (`/admin/*`, proxy ile korumalı)

**`/admin/login`** — E-posta/şifre formu (Supabase yapılandırılmamışsa "demo gir"
butonu). `?denied=1` ile "yetkisiz hesap" uyarısı + çıkış.

**`/admin` Dashboard** — Özet kartları (toplam/yeni/teklif verildi/kapandı) +
hızlı erişim + son teklifler tablosu.

**`/admin/teklifler`** — Durum sekmeli kuyruk (Tümü/Yeni/Teklif verildi/Kapandı).

**`/admin/teklifler/[id]`** — **İSKONTOLU TEKLİF OLUŞTURUCU** (`QuoteBuilder`,
client): kalem tablosu + kalem bazlı iskonto % girişi + genel iskonto % + geçerlilik
tarihi → **canlı** net/ara toplam/iskonto/KDV/genel toplam hesabı (`calcQuote`).
Aksiyonlar: **Kaydet** (`saveDiscountsAction`), **Teklif PDF** (route handler),
**Müşteriye Gönder** (`sendQuoteToCustomerAction`: PDF üret → Resend ile ekli mail
→ durum `quoted`), durum değiştir.

**`/admin/teklifler/[id]/pdf`** — Route handler (nodejs runtime). `renderQuotePdf`
ile A4 kurumsal teklif PDF'i döner (firma başlığı/adres/iletişim `getSettings`'ten,
kalem tablosu, toplamlar, geçerlilik, notlar/şartlar). DejaVu Sans gömülü.

**`/admin/urunler`** — Liste + **yeni/[id]** (ProductForm: RHF+Zod, marka/kategori/
alt kategori select, **görsel upload** Storage'a, aktif/pasif) + **ice-aktar**
(CSV import: client parser, başlık eşleme TR/EN, slug ile upsert).

**`/admin/markalar`** — Marka CRUD + logo/katalog PDF upload (brand-assets).

**`/admin/kataloglar`** — Katalog CRUD + PDF/kapak upload (catalogs bucket).

**`/admin/ayarlar`** — Firma bilgileri formu (`site_settings`). Kaydedince
`revalidatePath('/', 'layout')` → header/footer/iletişim/PDF/mail/metadata her
yerde anında güncellenir.

---

## 8. Kimlik Doğrulama & Güvenlik

- **Supabase Auth** (e-posta/şifre). Admin kullanıcı(lar) Supabase'de tutulur.
- **`proxy.ts`** (`config.matcher = ['/admin/:path*']`) → `updateSession()`:
  oturumu tazeler; `/admin`'e erişimde **kullanıcı admin mi** kontrol eder.
- **Admin beyaz listesi** (`lib/admin-access.ts`): yalnızca `ADMIN_EMAILS`
  içindeki e-postalar admin sayılır (kimliği doğrulanmış olsa bile). Varsayılan
  `info@muratboyraz.com`. Yetkisiz kullanıcı `/admin/login?denied=1`'e yönlenir.
- Supabase yapılandırılmamışsa proxy **guard etmez** (demo modu).
- **Önemli güvenlik notu:** Server Action'lar (ürün/teklif yazma) service-role
  kullanır ve şu an kendi içlerinde auth kontrolü YAPMAZ; koruma proxy
  katmanındadır. Daha sıkı güvenlik için action'lara `getAdminSession` +
  `isAdminEmail` kontrolü eklenebilir (TODO).
- Supabase panelinde **açık kayıt (sign-up) kapatılmalı** ki rastgele kişiler
  hesap açıp (beyaz liste olmasa) panele ulaşmasın.

---

## 9. Ortam Değişkenleri (`.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=https://wrtfluwceiislwdvcrek.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...     # yeni Supabase anahtar formatı
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...              # GİZLİ, yalnızca sunucu
RESEND_API_KEY=                                      # boş → mail atlanır
COMPANY_EMAIL=info@muratboyraz.com                   # tekliflerin/iletişimin düşeceği adres
ADMIN_EMAILS=info@muratboyraz.com                    # admin beyaz listesi (virgülle)
NEXT_PUBLIC_WHATSAPP_NUMBER=905000000000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```
`.env.local` `.gitignore`'da. Şablon: `.env.example`.

---

## 10. Supabase Canlı Kurulum (mevcut)

- Proje ref: **`wrtfluwceiislwdvcrek`**, bölge **eu-north-1** (Stockholm).
- **Bağlantı (psql/migration için):** Direkt `db.<ref>.supabase.co` IPv6-only ve
  çözülmüyor → **pooler** kullan:
  `aws-1-eu-north-1.pooler.supabase.com:5432`, kullanıcı
  `postgres.wrtfluwceiislwdvcrek` (şifre Supabase panelinde).
- Migration'lar `psql -f ...` ile uygulandı (0001, 0002, 0003). Seed
  `supabase/seed.sql` (28 ürün) uygulandı.
- Storage bucket'ları (product-images, brand-assets, catalogs) migration ile
  oluşturuldu, public-read.
- **Admin kullanıcı** SQL ile oluşturuldu (`auth.users` + `auth.identities`,
  bcrypt şifre via `extensions.crypt`). **Tuzak:** GoTrue, NULL token kolonlarını
  string'e çeviremez → elle oluşturulan kullanıcıda `confirmation_token`,
  `recovery_token`, `email_change`, vb. **`''` (boş string)** yapılmalı, yoksa
  giriş "Database error querying schema" (500) verir.

---

## 11. Çalıştırma / Build / Komutlar

```bash
pnpm install
pnpm dev            # http://localhost:3000
pnpm build          # üretim derlemesi (Turbopack)
pnpm start          # üretim sunucusu
pnpm lint
pnpm db:seed-sql    # lib/data/seed.ts → supabase/seed.sql üretir
```

---

## 12. Önemli Konvansiyonlar & Tuzaklar (yeni geliştiren AI için)

1. **Server/Client sınırı:** `lib/data/*`, `lib/supabase/server|admin|public`,
   `lib/pdf`, `lib/email`, `lib/auth` → `import "server-only"`. Client
   bileşenleri bunlardan yalnızca **tip** (`import type`) alabilir. Veri,
   server bileşeninden client'a **prop** olarak geçer.
2. **Public okuma = cookie'siz client** (`lib/supabase/public.ts`). Cookie'li
   `server.ts` yalnızca AUTH için. (Aksi halde `generateStaticParams` + SSG
   `cookies()`'e takılır.)
3. **Supabase typed client + ilişkili select** (`*, brand:brands(name)`):
   `Relationships: []` tanımlı olduğundan dönen tip `never` olur →
   `as unknown as <Tip>` ile cast edilir (örnekler veri katmanlarında).
4. **Türkçe slug:** `lib/slug.ts` (`slugify`) — ç/ğ/ı/ö/ş/ü → ASCII.
5. **Zod v4 + RHF:** `z.coerce.number()` resolver tip uyuşmazlığı yaratır;
   `z.number()` + `register(..., { valueAsNumber: true })` kullan.
6. **BSD sed** (`\b` desteklemez) — script yazarken dikkat (geliştirme notu).
7. **Yeni rota eklerken:** public ise `app/(public)/` altına; admin ise
   `app/admin/(panel)/` altına. Login gibi chrome'suz sayfalar grup DIŞINDA.
8. **Tasarım token'ları** yalnızca `globals.css`'te; bileşenler `bg-steel-500`,
   `text-ink-900`, `border-border` gibi token sınıflarını kullanır.

---

## 13. Mevcut Durum & Yapılacaklar

**Tamamlandı (canlı):** 4 fazın tamamı + firma ayarları + marka yönetimi +
katalog kütüphanesi. Supabase canlı (DB okuma/yazma, admin Auth girişi
çalışıyor). GitHub: `ataer10/site10`.

**Bekleyen / opsiyonel:**
- `RESEND_API_KEY` ekle → teklif/iletişim/teklif-PDF mailleri gerçekten gitsin.
- Supabase'de **açık kaydı kapat**.
- Server Action'lara auth kontrolü ekle (defense-in-depth).
- Gerçek içerik: firma bilgileri (`/admin/ayarlar`), gerçek markalar/ürünler/
  kataloglar (admin'den), ürün görselleri, marka logoları.
- **Vercel'e deploy** (env'leri ekleyerek). `NEXT_PUBLIC_SITE_URL`'i prod'a çevir.

**Çözülmüş hata — hidrasyon:** Eskiden anasayfada "text didn't match" hidrasyon
uyarısı vardı. Kök neden: `Intl.NumberFormat` (tr-TR para), Node'da ₺ ile rakam
arasına boşluk koymazken tarayıcı ICU'su **dar boşluk (U+202F/U+00A0)** koyuyordu
→ görünüş aynı, kod noktası farklı. Çözüm: `lib/utils.ts` `formatPrice` çıktısından
bu özel boşluklar `INTL_SPACES` regex'iyle kaldırılır. **Yeni Intl-tabanlı metin
eklerken bu tuzağa dikkat.**

---

## 14. Faz Geçmişi (commit'ler)

- **Faz 1:** Tasarım sistemi + anasayfa + hakkımızda.
- **Faz 2:** Supabase şema/RLS/seed + katalog (filtre/arama/sıralama) + marka/
  ürün/fiyat-listesi + sepet (Zustand).
- **Faz 3:** Teklif talebi (Server Action + fiyat dondurma) + Resend e-postaları
  + iletişim.
- **Faz 4:** Admin auth + teklif kuyruğu + iskontolu oluşturucu + PDF + müşteriye
  gönder + ürün CRUD + CSV import.
- **Ek:** Firma ayarları (admin'den) + marka yönetimi + katalog kütüphanesi +
  canlıya alma (Supabase anahtarları, admin kullanıcı, beyaz liste).
