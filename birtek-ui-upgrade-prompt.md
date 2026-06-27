# BİRTEK ENDÜSTRİYEL — UI/UX/Fonksiyon Yükseltme Promptu (VS Code / Claude Code / Cursor)

> Aşağıdaki bloğun TAMAMINI kopyalayıp VS Code'daki AI ajanına yapıştır.
> Proje kökü açıkken çalıştır. Görseller `public/img/` altında hazır.

---

## ROL & BAĞLAM

Sen kıdemli bir **front-end + UI/UX mühendisi ve ürün tasarımcısısın**. Elinde **çalışan** bir Next.js 16 (App Router, Turbopack) + TypeScript + **Tailwind CSS v4** projesi var: "Birtek Endüstriyel" — endüstriyel tesisat/vana/bağlantı elemanları satan bir **B2B kurumsal site** (açık fiyatlı katalog → sepet → teklif talebi → admin'de iskontolu teklif + PDF). Dil **Türkçe**, para **TRY (₺)**, KDV %20.

İşlevsellik çalışıyor; görevin yapıyı **UI + UX + fonksiyonel** olarak baştan sona **kusursuz** hale getirmek. Her sayfa, her bileşen, her etkileşim gözden geçirilecek; eksik/zayıf/yarım kalan ne varsa tamamlanacak.

**Önce kodu oku (iş yapmadan önce zorunlu):**
- `app/globals.css` (tasarım token'ları `@theme`: `ink-*`, `steel-*`, `orange-*`, `font-display`/`font-sans`/`font-mono`, radius, gölge).
- `app/(public)/layout.tsx`, `app/(public)/page.tsx`, tüm `app/(public)/*` sayfaları, `app/admin/**`.
- `components/site/*`, `components/catalog/*`, `components/ui/*`, `components/admin/*`.
- `lib/site.ts`, `lib/content.ts`, `lib/quote-calc.ts`, `lib/data/*`, `next.config.ts`, `proxy.ts`.
- Bu Next.js **16**: `middleware.ts` yerine `proxy.ts`; `params`/`searchParams`/`cookies()` **async** (await). Bu konvansiyonlara uy.

---

## EN ÖNEMLİ HEDEF — "USTANIN ESERİ" GÖRÜNÜMÜ, "YAPAY ZEKA ÜRÜNÜ" DEĞİL

Sonuç, **tipik AI-üretimi şablon site** havasından TAMAMEN uzak olmalı. Açan kişi "bunu yıllardır bu işi yapan bir ajans/usta tasarlamış" hissetmeli: kurumsal, modern, ölçülü, kendinden emin. Hedef referanslar: **Würth, Festo, Grundfos, Viega, Geberit**.

**Kaçınılacak "AI klişeleri" (bunları YAPMA):**
- Mor/indigo/pembe gradientler, neon parlamalar, "glow" efektleri, cam-morfizm abartısı.
- Her yere serpiştirilmiş emoji ve gereksiz ikon kalabalığı.
- "Empower / Unlock / Seamless / Elevate" tarzı içi boş pazarlama dili; jenerik placeholder metinler ("Lorem", "Your tagline here").
- Aşırı yuvarlatılmış köşeler (pill/blob), pofuduk büyük gölgeler, ortalanmış-tek-kolon-her-şey hero.
- Birbiriyle alakasız stok ikon setleri, dengesiz boşluklar, hizasız grid.
- Her bölümde aynı kalıp kart tekrarı (monoton ritim).

**Yapılacak "usta işi" işaretleri:**
- Katı **12 kolon grid**, kasıtlı asimetri, optik hizalama, tutarlı 4/8px spacing skalası.
- **İnce detaylar:** 1px hairline border'lar, ölçülü flat gölge, hassas tracking, `tabular-nums` fiyatlar, `font-mono` SKU/parça no — endüstriyel "mühendislik" detayı.
- Gerçek, ikna edici **Türkçe içerik** (firma ağzından, sektörel, somut). Boş/jenerik cümle bırakma; metinleri firmaya yakışır şekilde yaz.
- Ölçülü hareket (150–200ms), tutarlı görsel dil, az ama doğru aksan rengi.
- Her durum tasarlanmış: hover, focus, aktif, boş (empty), yükleniyor (skeleton), hata, başarı.

---

## DEĞİŞTİRİLEMEZ KURALLAR

1. **İş mantığını bozma.** Sepet (Zustand), teklif akışı, `lib/quote-calc.ts` iskonto motoru, server actions, Supabase veri katmanı, e-posta, PDF, admin mantığı korunur. Fonksiyonel iyileştirme = UX'i güçlendirmek (doğrulama, geri bildirim, akış), mantığı değiştirmek değil.
2. **Server/Client sınırı:** `server-only` modüllerden client'a yalnızca `import type`. Veri server bileşeninden prop ile geçer.
3. **Renk tek kaynak:** Yalnızca `globals.css` `@theme` token'ları (`bg-steel-500`, `text-ink-900`, `border-border` vb.). Yeni ton gerekiyorsa önce `@theme`'e token ekle; gelişigüzel hex yok.
4. **Görseller `next/image` ile** (ham `<img>` yok). Hero'ya `priority`, alt katlara lazy; doğru `sizes`; Türkçe `alt`.
5. **Erişilebilirlik (WCAG AA):** overlay ile kontrast garanti, `focus-visible` ring, anlamlı `alt`, tam klavye erişimi, doğru `aria` etiketleri.
6. **Responsive:** Masaüstü öncelikli (`max-w-[1280px]` Container) + mobil/tablet kusursuz.
7. İş bitince `pnpm build` ile derle; TS/lint/Next 16 hatalarını sıfırla.

---

## LOGO (zorunlu)

- `public/img/logo.png` = Birtek Endüstriyel resmi logosu (dişli + mavi swoosh, siyah yazı, alt başlık "Kontrol Sistemleri ve Bağlantı Elemanları").
- **Header'da `components/site/logo.tsx`'i bu logoyla güncelle.** `next/image` ile, **oranı koruyarak**, header yüksekliğine uygun ölçüde (yaklaşık 36–44px görünür yükseklik; bozma/ezme yok). Metin logoyu kaldır.
- **Footer'da** da aynı logo; koyu zeminde okunması için gerekiyorsa beyaz/açık kutu içinde, uygun padding ile.
- Logo `clamp`/responsive ile mobilde orantılı küçülsün; tıklanınca anasayfaya gitsin (mevcut davranışı koru).

---

## GÖRSEL ENVANTERİ & YERLEŞİM HARİTASI

Tümü `public/img/` → web yolu `/img/...`.

| Dosya | İçerik | Kullanım |
|---|---|---|
| `logo.png` | Birtek logosu | **Header + Footer** (yukarıdaki kurala göre) |
| `pexels-88107820-10116844.jpg` | Dikey — altın saat, turuncu vana/hidrant kolonları | **Hero sağ kolon** (dikey kahraman görseli) |
| `pexels-sonny-vermeer-505472791-17728787.jpg` | Geniş — dramatik tesis içi, sarı borular | **CTA bandı** + **istatistik bandı** arka planı (koyu overlay) |
| `pexels-marianna-zuzanna-498248397-16442684.jpg` | Teknisyen kırmızı borularda çalışıyor | **"Neden Birtek" / Hakkımızda** (insan + güven) |
| `pexels-quangludo-12527113.jpg` | Dikey — temiz mavi sürgülü vana | **Kategori kartı** (Vanalar) |
| `pexels-sharaf-design-1962240186-28900882.jpg` | Dikey — kırmızı çarklı mavi vana | **Kategori kartı** (Sürgülü Vanalar) / marka vitrini |
| `pexels-sonny-29248902.jpg` | Geniş — galvaniz boru hattı | **Kategori kartı** (Borular & Bağlantı) / bölüm ayıracı |
| `pexels-pixabay-357440.jpg` | Geniş — vintage el çarklı vanalar, sıcak ton | **Hakkımızda** / "tecrübe-miras" / `PageHeader` arka planı |

> Görseller renk sıcaklığı bakımından karışık (turuncu/mavi/sarı). **Tutarlılık için hepsine ortak işleme uygula** (aşağıda). Görsel yoksa asla bozuk gösterme — markalı nötr placeholder.

---

## SAYFA/BÖLÜM BAZINDA YAPILACAKLAR (UI + UX + Fonksiyon)

### Header (`components/site/header.tsx`, `logo.tsx`)
- Logo (yukarıdaki kural). **Sticky**: kaydırınca `backdrop-blur` + yarı saydam zemin + alt hairline + hafif gölge; tepedeyken temiz. Aktif nav linkinde 2px `orange-500` indicator. Sepet rozeti canlı sayaç. "Teklif İste" accent CTA. Mobil: düzgün animasyonlu hamburger/drawer, odak tuzağı (focus trap) ve ESC ile kapanma.

### Anasayfa Hero (`app/(public)/page.tsx`)
- Bölünmüş hero: sol büyük `font-display` başlık + somut değer önermesi + 2 CTA (Kataloğu İncele=primary, Teklif İste=accent) + güven mikro-noktaları. Sağ: `pexels-88107820-...` ince çerçeveli kartta, üstüne "teknik teklif önizleme kartı" hafif çakışarak derinlik. Arka planda çok hafif blueprint/grid dokusu. Mobilde görsel üstte, metin altta, okunaklı.

### İstatistik bandı
- Koyu band, arka plan `pexels-sonny-vermeer-...` çok koyulaştırılmış; `.tnum` büyük rakamlar (yıl, marka, ürün, mutlu müşteri vb.) + etiket. Sayaçlar ekrana gelince hafif say-animasyonu (ölçülü).

### Kategori grid
- Görselli kartlar (Vanalar→quangludo, Sürgülü Vanalar→sharaf, Borular→sonny-29248902). Görsel + alttan `ink` gradient + kategori adı + ok. Hover'da görsel `scale`, gradient koyulaşır, başlık `orange`. `rounded-md`, hairline. Karta tıklayınca ilgili filtreli `/urunler`e gitsin (fonksiyonel bağ).

### "Neden Birtek" / özellikler
- İki kolon: sol `pexels-marianna-...` çerçeveli; sağ 3–4 özellik (lucide ince ikon, stroke 1.5): geniş stok, hızlı teklif (24 saat içinde), teknik destek, orijinal/garantili ürün. Gerçek, ikna edici Türkçe metin.

### CTA bandı
- Tam genişlik `pexels-sonny-vermeer-...` + `steel-700/ink-900` gradient overlay; beyaz başlık + accent "Teklif İste" CTA. Yüksek kontrast.

### Katalog `/urunler`
- Sol filtre (marka/kategori→alt kategori), arama (debounce), sıralama, sayfalama — hepsi URL ile senkron, geri/ileri çalışır. Filtre uygulanınca **boş durum** ("sonuç yok, filtreyi temizle") ve **yükleniyor skeleton**'ı tasarla. Mobilde filtre alttan açılan panel (sheet). Aktif filtre çipleri + "temizle".

### Ürün kartı & detay
- Kart: sabit oranlı görsel alanı (`ink-50` zemin), yoksa markalı placeholder; marka rozeti, `font-mono` SKU, ad, fiyat (KDV hariç + dahil `.tnum`), adet + "Sepete Ekle". Hover ince yükselme. **Sepete eklemede görsel geri bildirim** (toast/buton durumu). Detay: büyük görsel/galeri, teknik özellik tablosu (hairline satır), benzer ürünler.

### Sepet `/sepet`
- Net kalem listesi (görsel, ad, SKU, adet stepper, sil), canlı özet (ara toplam/KDV/genel toplam `.tnum`). Boş sepet için yönlendirici, davetkar empty state. Hidrasyon güvenli. "Teklif İste" belirgin CTA.

### Teklif İste `/teklif-iste`
- RHF+Zod form: alanlarda **anlık doğrulama**, net hata mesajları (TR), submit sırasında disabled+spinner, başarı ekranı (teklif no + sepet temizlenir). Sepet boşsa anlamlı boş durum.

### İletişim `/iletisim`
- Bilgi kartları (adres/telefon/e-posta/saat — `getSettings`'ten), WhatsApp kutusu, harita, form (anlık doğrulama + başarı/hata). Telefon/e-posta tıklanabilir (`tel:`/`mailto:`).

### PageHeader bandları
- İç sayfalarda koyu band + ilgili görsel (Hakkımızda→pixabay, Ürünler→sonny-vermeer) çok koyu overlay; breadcrumb + büyük `font-display` başlık.

### Footer
- Koyu `ink-950`: logo, iletişim, hızlı linkler, çalışma saatleri, WhatsApp. Üst hairline, düzenli grid, telif satırı.

### Admin (görsel + UX rötuş; mantığa dokunma)
- Tipografi/spacing/hairline tutarlılığı, tablo okunabilirliği, buton hiyerarşisi, boş/yükleniyor durumları. İskontolu teklif oluşturucu ve PDF mantığı aynen kalır.

---

## GÖRSEL İŞLEME & TUTARLILIK
- Tüm dekoratif/arka plan görsellerine **ortak overlay**: `ink-900`/`steel-900` yönlü gradient + hafif doygunluk düşümü (`saturate-[.9]`), karışık sıcaklıklar aynı aileye otursun.
- Metin taşıyan görselde alttan/yandan koyu gradient (okunabilirlik).
- `rounded-md` (2–4px), 1px `border-ink-200` hairline, **flat/minimal gölge** (`shadow-flat`/`shadow-raised`). Pofuduk gölge yok.
- Aksan rengi `orange-500` ölçülü: yalnızca CTA/aktif/küçük vurgu.

## TİPOGRAFİ & RİTİM
- Başlık `font-display` (sıkı tracking), gövde `font-sans`, SKU/etiket `font-mono`, fiyat/tablo `.tnum`.
- Tutarlı dikey ritim, bol whitespace, 12 kolon hizası. Mikro etkileşim 150–200ms `--ease-industrial`. İstersen ölçülü scroll-reveal (IntersectionObserver).

## PERFORMANS
- `public/img` görselleri büyük (1.5–4.7MB). `next/image` ile servis et, doğru `sizes`, alt katlar lazy, yalnızca hero `priority`. Gerekirse optimize boyutlar üret (`public/img/optimized/`, orijinali bozma). Layout shift olmasın (oranlı kapsayıcı / width-height).

## ERİŞİLEBİLİRLİK
- Anlamlı Türkçe `alt` (dekoratif → `alt=""`), AA kontrast, görünür `focus-visible`, klavye + `aria`.

---

## TESLİM & DOĞRULAMA
1. Değişiklikleri **bölüm bölüm** uygula; her bölümden sonra ne yaptığını kısaca yaz.
2. `pnpm build` çalıştır; TS/lint/Next 16 hatalarını sıfırla.
3. Tüm public sayfaları + admin'i UI/UX/fonksiyon açısından gözden geçir; mobil + masaüstü; hover/focus/empty/loading/error/success durumlarını doğrula.
4. Değiştirilen dosyaların ve eklenen `@theme` token'larının kısa özetini ver.

**Hedef sonuç:** Görsellerle canlanmış, kurumsal, modern, tutarlı, hızlı ve erişilebilir; "tipik yapay zeka çıktısı" değil, **deneyimli bir ustanın eseri** gibi duran ve çalışan bir endüstriyel B2B sitesi. İşlevsellik birebir korunur ve UX olarak güçlenir; görünüm sınıf atlar.
