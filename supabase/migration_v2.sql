-- ============================================================
-- Migration v2 — Room settings & status
-- 在 Supabase Dashboard > SQL Editor 运行
-- ============================================================

alter table rooms
  add column if not exists status               text    default 'active',
  add column if not exists show_typing_preview  boolean default true,
  add column if not exists allow_use_others_chars boolean default false,
  add column if not exists free_for_all_mode    boolean default false;
