-- =====================================================================
--  Birtek — Site ayarları (firma bilgileri) — admin'den düzenlenebilir
-- =====================================================================

create table if not exists public.site_settings (
  id text primary key default 'default',
  company_name text,
  short_name text,
  tagline text,
  description text,
  email text,
  phone text,
  whatsapp text,
  address_line1 text,
  address_line2 text,
  city text,
  country text,
  working_hours text,
  updated_at timestamptz default now(),
  constraint site_settings_single_row check (id = 'default')
);

alter table public.site_settings enable row level security;

drop policy if exists "public read settings" on public.site_settings;
create policy "public read settings" on public.site_settings
  for select to anon, authenticated using (true);
-- yazma yalnızca service_role (admin) ile (politika yok => bypass)

-- Varsayılan satır (defaultSettings ile aynı)
insert into public.site_settings (
  id, company_name, short_name, tagline, description,
  email, phone, whatsapp,
  address_line1, address_line2, city, country, working_hours
) values (
  'default',
  'Birtek Endüstriyel',
  'Birtek',
  'Endüstriyel Tesisat Malzemeleri',
  'Endüstriyel tesisat malzemeleri tedarikçisi. Vana, fittings, pompa, boru ve bağlantı elemanlarında açık fiyatlı katalog ve hızlı teklif.',
  'info@birtek.com.tr',
  '+90 212 000 00 00',
  '905000000000',
  'Organize Sanayi Bölgesi',
  '1. Cadde No: 1',
  'İstanbul',
  'Türkiye',
  'Hafta içi 08:30 – 18:00'
) on conflict (id) do nothing;
