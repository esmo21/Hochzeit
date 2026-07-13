alter table public.todos enable row level security;
alter table public.gift_wishes enable row level security;
alter table public.guest_families enable row level security;
alter table public.seating_tables enable row level security;
alter table public.wedding_day_schedule enable row level security;

-- Private deployment mode: every authenticated account belongs to the same
-- wedding planning workspace. This lets both partners see and manage the same
-- guests, todos, gifts, seating tables, and day schedule while still blocking
-- anonymous access.
drop policy if exists "todos_select_own" on public.todos;
drop policy if exists "todos_insert_own" on public.todos;
drop policy if exists "todos_update_own" on public.todos;
drop policy if exists "todos_delete_own" on public.todos;
drop policy if exists "todos_select_authenticated" on public.todos;
create policy "todos_select_authenticated" on public.todos for select to authenticated using (true);
drop policy if exists "todos_insert_authenticated" on public.todos;
create policy "todos_insert_authenticated" on public.todos for insert to authenticated with check (true);
drop policy if exists "todos_update_authenticated" on public.todos;
create policy "todos_update_authenticated" on public.todos for update to authenticated using (true) with check (true);
drop policy if exists "todos_delete_authenticated" on public.todos;
create policy "todos_delete_authenticated" on public.todos for delete to authenticated using (true);

drop policy if exists "gift_wishes_select_own" on public.gift_wishes;
drop policy if exists "gift_wishes_insert_own" on public.gift_wishes;
drop policy if exists "gift_wishes_update_own" on public.gift_wishes;
drop policy if exists "gift_wishes_delete_own" on public.gift_wishes;
drop policy if exists "gift_wishes_select_authenticated" on public.gift_wishes;
create policy "gift_wishes_select_authenticated" on public.gift_wishes for select to authenticated using (true);
drop policy if exists "gift_wishes_insert_authenticated" on public.gift_wishes;
create policy "gift_wishes_insert_authenticated" on public.gift_wishes for insert to authenticated with check (true);
drop policy if exists "gift_wishes_update_authenticated" on public.gift_wishes;
create policy "gift_wishes_update_authenticated" on public.gift_wishes for update to authenticated using (true) with check (true);
drop policy if exists "gift_wishes_delete_authenticated" on public.gift_wishes;
create policy "gift_wishes_delete_authenticated" on public.gift_wishes for delete to authenticated using (true);

drop policy if exists "guest_families_select_own" on public.guest_families;
drop policy if exists "guest_families_insert_own" on public.guest_families;
drop policy if exists "guest_families_update_own" on public.guest_families;
drop policy if exists "guest_families_delete_own" on public.guest_families;
drop policy if exists "guest_families_select_authenticated" on public.guest_families;
create policy "guest_families_select_authenticated" on public.guest_families for select to authenticated using (true);
drop policy if exists "guest_families_insert_authenticated" on public.guest_families;
create policy "guest_families_insert_authenticated" on public.guest_families for insert to authenticated with check (true);
drop policy if exists "guest_families_update_authenticated" on public.guest_families;
create policy "guest_families_update_authenticated" on public.guest_families for update to authenticated using (true) with check (true);
drop policy if exists "guest_families_delete_authenticated" on public.guest_families;
create policy "guest_families_delete_authenticated" on public.guest_families for delete to authenticated using (true);

drop policy if exists "seating_tables_select_own" on public.seating_tables;
drop policy if exists "seating_tables_insert_own" on public.seating_tables;
drop policy if exists "seating_tables_update_own" on public.seating_tables;
drop policy if exists "seating_tables_delete_own" on public.seating_tables;
drop policy if exists "seating_tables_select_authenticated" on public.seating_tables;
create policy "seating_tables_select_authenticated" on public.seating_tables for select to authenticated using (true);
drop policy if exists "seating_tables_insert_authenticated" on public.seating_tables;
create policy "seating_tables_insert_authenticated" on public.seating_tables for insert to authenticated with check (true);
drop policy if exists "seating_tables_update_authenticated" on public.seating_tables;
create policy "seating_tables_update_authenticated" on public.seating_tables for update to authenticated using (true) with check (true);
drop policy if exists "seating_tables_delete_authenticated" on public.seating_tables;
create policy "seating_tables_delete_authenticated" on public.seating_tables for delete to authenticated using (true);

drop policy if exists "wedding_day_schedule_select_own" on public.wedding_day_schedule;
drop policy if exists "wedding_day_schedule_insert_own" on public.wedding_day_schedule;
drop policy if exists "wedding_day_schedule_update_own" on public.wedding_day_schedule;
drop policy if exists "wedding_day_schedule_delete_own" on public.wedding_day_schedule;
drop policy if exists "wedding_day_schedule_select_authenticated" on public.wedding_day_schedule;
create policy "wedding_day_schedule_select_authenticated" on public.wedding_day_schedule for select to authenticated using (true);
drop policy if exists "wedding_day_schedule_insert_authenticated" on public.wedding_day_schedule;
create policy "wedding_day_schedule_insert_authenticated" on public.wedding_day_schedule for insert to authenticated with check (true);
drop policy if exists "wedding_day_schedule_update_authenticated" on public.wedding_day_schedule;
create policy "wedding_day_schedule_update_authenticated" on public.wedding_day_schedule for update to authenticated using (true) with check (true);
drop policy if exists "wedding_day_schedule_delete_authenticated" on public.wedding_day_schedule;
create policy "wedding_day_schedule_delete_authenticated" on public.wedding_day_schedule for delete to authenticated using (true);
