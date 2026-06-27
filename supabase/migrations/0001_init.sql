-- =====================================================================
--  Birtek Endüstriyel — Şema + RLS (Faz 2)
--  Postgres / Supabase. `supabase db push` veya SQL editöründe çalıştırın.
-- =====================================================================

-- ----------------------------------------------------------------------
--  Tablolar
-- ----------------------------------------------------------------------

-- markalar
create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  logo_url text,
  catalog_pdf_url text,
  sort_order int default 0
);

-- kategoriler
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  sort_order int default 0
);

-- alt kategoriler
create table if not exists public.subcategories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  category_id uuid references public.categories(id) on delete cascade,
  sort_order int default 0,
  unique (category_id, slug)
);

-- ürünler
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  sku text,
  brand_id uuid references public.brands(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  subcategory_id uuid references public.subcategories(id) on delete set null,
  list_price numeric(12,2) not null,        -- liste (açık) fiyat
  currency text default 'TRY',
  unit text default 'adet',                 -- adet, mt, kg...
  vat_rate numeric(4,2) default 20.0,       -- KDV %
  image_url text,
  description text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- teklif talepleri
create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  quote_number text unique,                 -- TKL-2026-0001
  customer_name text not null,
  company text,
  email text not null,
  phone text,
  note text,
  status text default 'new',                -- new | quoted | closed
  global_discount_rate numeric(5,2) default 0,  -- genel iskonto %
  subtotal numeric(12,2),                   -- iskontosuz ara toplam
  discount_total numeric(12,2),
  vat_total numeric(12,2),
  grand_total numeric(12,2),
  valid_until date,
  created_at timestamptz default now()
);

-- teklif kalemleri
create table if not exists public.quote_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid references public.quotes(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text,                        -- snapshot
  sku text,                                 -- snapshot
  qty numeric(12,2) not null default 1,
  list_price numeric(12,2) not null,        -- teklif anındaki liste fiyatı (dondurulmuş)
  discount_rate numeric(5,2) default 0,     -- kalem bazlı iskonto %
  vat_rate numeric(4,2) default 20.0,       -- snapshot KDV %
  note text
);

-- ----------------------------------------------------------------------
--  İndeksler
-- ----------------------------------------------------------------------
create index if not exists idx_products_brand on public.products(brand_id);
create index if not exists idx_products_category on public.products(category_id);
create index if not exists idx_products_subcategory on public.products(subcategory_id);
create index if not exists idx_products_active on public.products(is_active);
create index if not exists idx_subcategories_category on public.subcategories(category_id);
create index if not exists idx_quote_items_quote on public.quote_items(quote_id);
create index if not exists idx_quotes_status on public.quotes(status);

-- ----------------------------------------------------------------------
--  Teklif numarası üreteci — TKL-YYYY-NNNN
-- ----------------------------------------------------------------------
create sequence if not exists public.quote_number_seq;

create or replace function public.set_quote_number()
returns trigger
language plpgsql
as $$
begin
  if new.quote_number is null then
    new.quote_number :=
      'TKL-' || to_char(now(), 'YYYY') || '-' ||
      lpad(nextval('public.quote_number_seq')::text, 4, '0');
  end if;
  return new;
end;
$$;

drop trigger if exists trg_set_quote_number on public.quotes;
create trigger trg_set_quote_number
  before insert on public.quotes
  for each row execute function public.set_quote_number();

-- ----------------------------------------------------------------------
--  RLS — public okuma (katalog), quotes/quote_items yalnızca sunucu
-- ----------------------------------------------------------------------
alter table public.brands enable row level security;
alter table public.categories enable row level security;
alter table public.subcategories enable row level security;
alter table public.products enable row level security;
alter table public.quotes enable row level security;
alter table public.quote_items enable row level security;

-- Katalog tabloları: herkese (anon + authenticated) salt okunur.
drop policy if exists "public read brands" on public.brands;
create policy "public read brands" on public.brands
  for select to anon, authenticated using (true);

drop policy if exists "public read categories" on public.categories;
create policy "public read categories" on public.categories
  for select to anon, authenticated using (true);

drop policy if exists "public read subcategories" on public.subcategories;
create policy "public read subcategories" on public.subcategories
  for select to anon, authenticated using (true);

drop policy if exists "public read active products" on public.products;
create policy "public read active products" on public.products
  for select to anon, authenticated using (is_active = true);

-- quotes / quote_items: hiçbir anon/authenticated politikası YOK.
-- RLS açık + politika yok => yalnızca service_role (sunucu) erişebilir.

-- ----------------------------------------------------------------------
--  Storage bucket'ları (ürün görselleri + marka logo/katalog PDF)
-- ----------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values
  ('product-images', 'product-images', true),
  ('brand-assets', 'brand-assets', true)
on conflict (id) do nothing;

drop policy if exists "public read product images" on storage.objects;
create policy "public read product images" on storage.objects
  for select to anon, authenticated
  using (bucket_id in ('product-images', 'brand-assets'));
