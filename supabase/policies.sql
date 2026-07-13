alter table public.todos enable row level security;
alter table public.gift_wishes enable row level security;
alter table public.guest_families enable row level security;

create policy "todos_select_own" on public.todos for select to authenticated using (auth.uid() = user_id);
create policy "todos_insert_own" on public.todos for insert to authenticated with check (auth.uid() = user_id);
create policy "todos_update_own" on public.todos for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "todos_delete_own" on public.todos for delete to authenticated using (auth.uid() = user_id);

create policy "gift_wishes_select_own" on public.gift_wishes for select to authenticated using (auth.uid() = user_id);
create policy "gift_wishes_insert_own" on public.gift_wishes for insert to authenticated with check (auth.uid() = user_id);
create policy "gift_wishes_update_own" on public.gift_wishes for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "gift_wishes_delete_own" on public.gift_wishes for delete to authenticated using (auth.uid() = user_id);

create policy "guest_families_select_own" on public.guest_families for select to authenticated using (auth.uid() = user_id);
create policy "guest_families_insert_own" on public.guest_families for insert to authenticated with check (auth.uid() = user_id);
create policy "guest_families_update_own" on public.guest_families for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "guest_families_delete_own" on public.guest_families for delete to authenticated using (auth.uid() = user_id);

alter table public.seating_tables enable row level security;
alter table public.wedding_day_schedule enable row level security;

create policy "seating_tables_select_own" on public.seating_tables for select to authenticated using (auth.uid() = user_id);
create policy "seating_tables_insert_own" on public.seating_tables for insert to authenticated with check (auth.uid() = user_id);
create policy "seating_tables_update_own" on public.seating_tables for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "seating_tables_delete_own" on public.seating_tables for delete to authenticated using (auth.uid() = user_id);

create policy "wedding_day_schedule_select_own" on public.wedding_day_schedule for select to authenticated using (auth.uid() = user_id);
create policy "wedding_day_schedule_insert_own" on public.wedding_day_schedule for insert to authenticated with check (auth.uid() = user_id);
create policy "wedding_day_schedule_update_own" on public.wedding_day_schedule for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "wedding_day_schedule_delete_own" on public.wedding_day_schedule for delete to authenticated using (auth.uid() = user_id);
