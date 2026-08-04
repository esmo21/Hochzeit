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

create table if not exists public.seating_tables (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (length(btrim(name)) > 0),
  size integer not null default 8 check (size > 0),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.wedding_day_schedule (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  starts_at time not null,
  title text not null check (length(btrim(title)) > 0),
  location text,
  responsible_person text,
  note text,
  status text not null default 'planned' check (status in ('planned','confirmed','open','done')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.guest_families add column if not exists rsvp_status text not null default 'pending' check (rsvp_status in ('pending','accepted','declined','partial'));
alter table public.guest_families add column if not exists accepted_count integer not null default 0 check (accepted_count >= 0);
alter table public.guest_families add column if not exists declined_count integer not null default 0 check (declined_count >= 0);
alter table public.guest_families add column if not exists invitation_sent boolean not null default false;
alter table public.guest_families add column if not exists overnight_needed boolean not null default false;
alter table public.guest_families add column if not exists transport_needed boolean not null default false;
alter table public.guest_families add column if not exists table_id uuid references public.seating_tables(id) on delete set null;

drop trigger if exists set_seating_tables_updated_at on public.seating_tables;
create trigger set_seating_tables_updated_at before update on public.seating_tables for each row execute function public.set_updated_at();
drop trigger if exists set_wedding_day_schedule_updated_at on public.wedding_day_schedule;
create trigger set_wedding_day_schedule_updated_at before update on public.wedding_day_schedule for each row execute function public.set_updated_at();

create index if not exists seating_tables_user_id_idx on public.seating_tables(user_id);
create index if not exists wedding_day_schedule_user_id_idx on public.wedding_day_schedule(user_id);
create index if not exists wedding_day_schedule_starts_at_idx on public.wedding_day_schedule(starts_at);
create index if not exists guest_families_table_id_idx on public.guest_families(table_id);

create table if not exists public.registry_office_rooms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  office_name text not null check (length(btrim(office_name)) > 0),
  room_name text not null check (length(btrim(room_name)) > 0),
  website_url text check (website_url is null or website_url ~* '^https?://'),
  capacity text not null check (length(btrim(capacity)) > 0),
  price text not null check (length(btrim(price)) > 0),
  rating integer not null default 5 check (rating between 1 and 10),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_registry_office_rooms_updated_at on public.registry_office_rooms;
create trigger set_registry_office_rooms_updated_at before update on public.registry_office_rooms for each row execute function public.set_updated_at();

create index if not exists registry_office_rooms_user_id_idx on public.registry_office_rooms(user_id);
create index if not exists registry_office_rooms_office_name_idx on public.registry_office_rooms(office_name);

create table if not exists public.wedding_locations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (length(btrim(name)) > 0),
  general_information text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.location_costs (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.wedding_locations(id) on delete cascade,
  name text not null check (length(btrim(name)) > 0),
  cost_from numeric(12,2) not null check (cost_from >= 0),
  cost_to numeric(12,2) not null check (cost_to >= cost_from),
  created_at timestamptz not null default now()
);

drop trigger if exists set_wedding_locations_updated_at on public.wedding_locations;
create trigger set_wedding_locations_updated_at before update on public.wedding_locations for each row execute function public.set_updated_at();
create index if not exists wedding_locations_user_id_idx on public.wedding_locations(user_id);
create index if not exists location_costs_location_id_idx on public.location_costs(location_id);

create table if not exists public.budget_costs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (length(btrim(name)) > 0),
  estimated_min numeric(12,2) not null check (estimated_min >= 0),
  estimated_max numeric(12,2) not null check (estimated_max >= estimated_min),
  actual_cost numeric(12,2) check (actual_cost is null or actual_cost >= 0),
  is_paid boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_budget_costs_updated_at on public.budget_costs;
create trigger set_budget_costs_updated_at before update on public.budget_costs for each row execute function public.set_updated_at();
create index if not exists budget_costs_user_id_idx on public.budget_costs(user_id);
create index if not exists budget_costs_name_idx on public.budget_costs(name);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (length(btrim(title)) > 0),
  content text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_notes_updated_at on public.notes;
create trigger set_notes_updated_at before update on public.notes for each row execute function public.set_updated_at();
create index if not exists notes_user_id_idx on public.notes(user_id);
create index if not exists notes_updated_at_idx on public.notes(updated_at);
