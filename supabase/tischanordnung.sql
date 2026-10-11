-- In Supabase SQL Editor einmalig ausführen.
create table if not exists public.room_layouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default 'Hauptplan',
  items jsonb not null default '[]'::jsonb check (jsonb_typeof(items) = 'array'),
  updated_at timestamptz not null default now(),
  unique (user_id, name)
);
alter table public.room_layouts enable row level security;
drop policy if exists "room_layouts_select" on public.room_layouts;
create policy "room_layouts_select" on public.room_layouts for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "room_layouts_insert" on public.room_layouts;
create policy "room_layouts_insert" on public.room_layouts for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "room_layouts_update" on public.room_layouts;
create policy "room_layouts_update" on public.room_layouts for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "room_layouts_delete" on public.room_layouts;
create policy "room_layouts_delete" on public.room_layouts for delete to authenticated using ((select auth.uid()) = user_id);
drop trigger if exists set_room_layouts_updated_at on public.room_layouts;
create trigger set_room_layouts_updated_at before update on public.room_layouts for each row execute function public.set_updated_at();
