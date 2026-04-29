-- ============================================================
-- Roleplay Writing Room — Supabase Schema
-- 在 Supabase Dashboard > SQL Editor 里完整粘贴运行
-- ============================================================

-- UUID 扩展
create extension if not exists "uuid-ossp";

-- ─── 表 ──────────────────────────────────────────────────────

create table if not exists rooms (
  id                    uuid primary key default uuid_generate_v4(),
  title                 text not null default 'Untitled Room',
  room_code             text unique not null,
  host_player_id        text not null,
  current_turn_member_id uuid,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

create table if not exists room_members (
  id          uuid primary key default uuid_generate_v4(),
  room_id     uuid not null references rooms(id) on delete cascade,
  player_id   text not null,
  nickname    text not null,
  turn_order  integer not null default 1,
  is_host     boolean not null default false,
  joined_at   timestamptz default now(),
  unique(room_id, player_id)
);

create table if not exists characters (
  id                uuid primary key default uuid_generate_v4(),
  room_id           uuid not null references rooms(id) on delete cascade,
  owner_player_id   text not null,
  owner_member_id   uuid not null references room_members(id) on delete cascade,
  character_name    text not null,
  avatar_url        text,
  short_description text,
  created_at        timestamptz default now()
);

create table if not exists posts (
  id               uuid primary key default uuid_generate_v4(),
  room_id          uuid not null references rooms(id) on delete cascade,
  author_member_id uuid not null references room_members(id) on delete cascade,
  author_nickname  text not null,
  character_id     uuid references characters(id) on delete set null,
  character_name   text,
  post_type        text not null check (post_type in ('narration', 'dialogue', 'action', 'system')),
  content          text not null,
  order_index      integer not null default 0,
  created_at       timestamptz default now()
);

-- ─── 索引 ────────────────────────────────────────────────────

create index if not exists idx_room_members_room_id    on room_members(room_id);
create index if not exists idx_room_members_player_id  on room_members(player_id);
create index if not exists idx_characters_room_id      on characters(room_id);
create index if not exists idx_posts_room_id           on posts(room_id);
create index if not exists idx_posts_order             on posts(room_id, order_index);

-- ─── Row Level Security（RLS）────────────────────────────────
-- MVP：允许匿名 key 进行所有操作（不需要登录）

alter table rooms        enable row level security;
alter table room_members enable row level security;
alter table characters   enable row level security;
alter table posts        enable row level security;

-- 如果已存在同名 policy 会报错，先 drop 再建
drop policy if exists "allow_all" on rooms;
drop policy if exists "allow_all" on room_members;
drop policy if exists "allow_all" on characters;
drop policy if exists "allow_all" on posts;

create policy "allow_all" on rooms        for all using (true) with check (true);
create policy "allow_all" on room_members for all using (true) with check (true);
create policy "allow_all" on characters   for all using (true) with check (true);
create policy "allow_all" on posts        for all using (true) with check (true);

-- ─── Realtime ────────────────────────────────────────────────
-- 让这 4 张表的变更实时推送到客户端

alter publication supabase_realtime add table rooms;
alter publication supabase_realtime add table room_members;
alter publication supabase_realtime add table characters;
alter publication supabase_realtime add table posts;
