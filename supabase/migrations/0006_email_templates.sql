-- =====================================================================
--  Birtek — Müşteri e-posta şablonları (admin'den düzenlenebilir)
--  Gizli değil; site_settings'te jsonb kolon.
--  Yapı: { quoteReceived: {subject,title,intro,outro},
--          quoteReady:    {subject,title,intro,outro} }
-- =====================================================================

alter table public.site_settings
  add column if not exists email_templates jsonb;
