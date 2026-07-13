create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.todos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (length(btrim(title)) > 0),
  note text,
  due_date date,
  priority text not null default 'medium' check (priority in ('very_low','low','medium','high','very_high')),
  is_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gift_wishes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (length(btrim(title)) > 0),
  description text,
  url text check (url is null or url ~* '^https?://'),
  price numeric(10,2) check (price is null or price >= 0),
  priority text check (priority is null or priority in ('low','medium','high')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.guest_families (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  family_name text not null check (length(btrim(family_name)) > 0),
  main_guest_name text not null check (length(btrim(main_guest_name)) > 0),
  additional_adults integer not null default 0 check (additional_adults >= 0),
  children_count integer not null default 0 check (children_count >= 0),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_todos_updated_at on public.todos;
create trigger set_todos_updated_at before update on public.todos for each row execute function public.set_updated_at();
drop trigger if exists set_gift_wishes_updated_at on public.gift_wishes;
create trigger set_gift_wishes_updated_at before update on public.gift_wishes for each row execute function public.set_updated_at();
drop trigger if exists set_guest_families_updated_at on public.guest_families;
create trigger set_guest_families_updated_at before update on public.guest_families for each row execute function public.set_updated_at();

create index if not exists todos_user_id_idx on public.todos(user_id);
create index if not exists todos_due_date_idx on public.todos(due_date);
alter table public.todos add column if not exists priority text not null default 'medium' check (priority in ('very_low','low','medium','high','very_high'));

create index if not exists todos_is_completed_idx on public.todos(is_completed);
create index if not exists todos_priority_idx on public.todos(priority);
create index if not exists gift_wishes_user_id_idx on public.gift_wishes(user_id);
create index if not exists guest_families_user_id_idx on public.guest_families(user_id);
create index if not exists guest_families_family_name_idx on public.guest_families(family_name);
