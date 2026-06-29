-- =====================================================================
--  Birtek — Hero / vitrin slaytları (admin'den düzenlenebilir)
--  site_settings'e jsonb kolon + hero görselleri için 'site-assets' bucket
-- =====================================================================

-- Hero slaytları: [{ tag, title, accent, titleTail, subtitle, image,
--                    imageAlt, cta:{label,href}, secondary:{label,href} }]
alter table public.site_settings
  add column if not exists hero_slides jsonb;

-- ----------------------------------------------------------------------
--  Site görselleri bucket'ı (hero görselleri vb.)
-- ----------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('site-assets', 'site-assets', true)
on conflict (id) do nothing;

drop policy if exists "public read site assets" on storage.objects;
create policy "public read site assets" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'site-assets');
-- yazma yalnızca service_role (admin) ile — RLS bypass.
