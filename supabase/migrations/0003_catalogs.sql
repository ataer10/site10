-- =====================================================================
--  Birtek — Katalog kütüphanesi (bayisi olunan markaların resmi PDF'leri)
-- =====================================================================

create table if not exists public.catalogs (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  brand_id uuid references public.brands(id) on delete set null,
  pdf_url text,
  cover_url text,
  year text,
  description text,
  sort_order int default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

create index if not exists idx_catalogs_brand on public.catalogs(brand_id);
create index if not exists idx_catalogs_active on public.catalogs(is_active);

alter table public.catalogs enable row level security;

drop policy if exists "public read active catalogs" on public.catalogs;
create policy "public read active catalogs" on public.catalogs
  for select to anon, authenticated using (is_active = true);
-- yazma yalnızca service_role (admin)

-- Storage bucket (katalog PDF + kapak görselleri)
insert into storage.buckets (id, name, public)
values ('catalogs', 'catalogs', true)
on conflict (id) do nothing;

drop policy if exists "public read catalog files" on storage.objects;
create policy "public read catalog files" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'catalogs');
