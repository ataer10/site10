# Birtek Endüstriyel — B2B Tesisat Malzemeleri

Endüstriyel tesisat malzemeleri için kurumsal **B2B web sitesi**: açık fiyatlı ürün
kataloğu, sepet → teklif talebi ve admin panelinden iskontolu PDF teklif üretimi.

İçerik dili **Türkçe**, para birimi **TRY**, KDV **%20**.

## Teknoloji

- **Next.js 16** (App Router) + **TypeScript** (strict)
- **Tailwind CSS v4** — tasarım token'ları `app/globals.css` `@theme` içinde merkezî
- **Supabase** — Postgres + Storage + Auth (planlı)
- **Zustand** — sepet state'i (localStorage persist)
- **Lucide** — ince stroke ikonlar
- Deploy hedefi: **Vercel**

## Hızlı başlangıç

```bash
pnpm install
cp .env.example .env.local   # değerleri doldurun (opsiyonel — bkz. aşağı)
pnpm dev                     # http://localhost:3000
```

> **Supabase olmadan da çalışır.** `.env.local` boşsa site, `lib/data/seed.ts`
> içindeki seed verisiyle (8 marka, 6 kategori, 28 ürün) çalışır. Supabase
> bağlanınca veri katmanı otomatik canlı veriye geçer.

## Supabase kurulumu (opsiyonel)

1. Supabase projesi oluşturun, `.env.local` içine `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` girin.
2. Şema + RLS: `supabase/migrations/0001_init.sql` çalıştırın.
3. Seed: `pnpm db:seed-sql` ile güncel `supabase/seed.sql` üretip çalıştırın.

## Komutlar

| Komut | Açıklama |
|---|---|
| `pnpm dev` | Geliştirme sunucusu |
| `pnpm build` | Üretim derlemesi |
| `pnpm start` | Üretim sunucusu |
| `pnpm lint` | ESLint |
| `pnpm db:seed-sql` | `lib/data/seed.ts` → `supabase/seed.sql` üretir |

## Dizin yapısı

```
app/                  Rotalar (App Router)
components/ui/         Tasarım sistemi bileşenleri (shadcn deseni, özelleştirilmiş)
components/site/       Header, footer, WhatsApp float, sayfa başlığı
components/catalog/    Ürün kartı, filtreler, toolbar, sayfalama
lib/data/             seed.ts (kanonik veri) + catalog.ts (veri katmanı)
lib/supabase/         Client / server / admin + DB tipleri
lib/store/            Zustand sepet
supabase/             SQL migration + seed
```

## Faz durumu

- [x] **Faz 1** — Temel + tasarım sistemi, anasayfa, hakkımızda
- [x] **Faz 2** — Supabase şema/RLS/seed, katalog, marka, ürün detay, fiyat listesi, sepet
- [ ] **Faz 3** — Teklif talebi (Server Action) + Resend e-postaları, iletişim formu
- [ ] **Faz 4** — Admin auth, iskontolu teklif oluşturucu, `@react-pdf/renderer` PDF, CSV import
