-- =====================================================================
--  Birtek — E-posta (SMTP) ayarları — admin panelinden yönetilir
--  GÜVENLİK: SMTP şifresi gizli. site_settings herkese-açık-okunur olduğu
--  için BURADA AYRI tablo; RLS açık + POLİTİKA YOK → yalnız service_role.
-- =====================================================================

create table if not exists public.email_settings (
  id text primary key default 'default',
  smtp_host text,
  smtp_port int default 587,
  smtp_secure boolean default false,   -- true → 465 (SSL), false → 587 (STARTTLS)
  smtp_user text,
  smtp_pass text,                       -- gizli; yalnız service_role okuyabilir
  smtp_from text,                       -- gönderen, ör. "Birtek <teklif@birtek.com.tr>"
  updated_at timestamptz default now(),
  constraint email_settings_single_row check (id = 'default')
);

alter table public.email_settings enable row level security;
-- anon/authenticated için POLİTİKA YOK → sadece service_role (sunucu) erişir.

insert into public.email_settings (id) values ('default')
on conflict (id) do nothing;
