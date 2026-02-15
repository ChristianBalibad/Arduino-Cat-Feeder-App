create table if not exists public.feed_commands (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now() not null,
  portions integer not null default 1
);

alter table public.feed_commands enable row level security;

create policy "Allow read for all" on public.feed_commands for select using (true);
create policy "Allow insert for all" on public.feed_commands for insert with check (true);
create policy "Allow delete for all" on public.feed_commands for delete using (true);
