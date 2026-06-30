-- =====================================================================
--  Birtek — Anasayfa SSS (Sıkça Sorulan Sorular) — admin'den düzenlenebilir
--  Gizli değil; site_settings'te jsonb kolon: [{ q, a }, ...]
-- =====================================================================

alter table public.site_settings
  add column if not exists faq jsonb;
