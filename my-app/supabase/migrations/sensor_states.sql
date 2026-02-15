-- One row per sensor. ESP UPDATES these every 30 sec. No unbounded growth.

create table if not exists public.sensor_states (
  sensor text primary key,
  distance_cm numeric,
  weight_grams numeric,
  last_motion_at timestamptz,
  updated_at timestamptz default now() not null
);

insert into public.sensor_states (sensor, updated_at) values
  ('food_level', now()),
  ('weight', now()),
  ('motion', now())
on conflict (sensor) do nothing;

alter table public.sensor_states enable row level security;

create policy "Allow read for all" on public.sensor_states for select using (true);
create policy "Allow update for all" on public.sensor_states for update using (true);

create or replace function update_sensor_states_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger sensor_states_updated_at
  before update on public.sensor_states
  for each row execute function update_sensor_states_updated_at();

-- Optional daily history. ESP inserts once per day per sensor.
create table if not exists public.sensor_daily_log (
  id uuid primary key default gen_random_uuid(),
  sensor text not null,
  log_date date not null,
  distance_cm numeric,
  weight_grams numeric,
  motion_count int default 0,
  created_at timestamptz default now() not null,
  unique(sensor, log_date)
);

alter table public.sensor_daily_log enable row level security;

create policy "Allow read for all" on public.sensor_daily_log for select using (true);
create policy "Allow insert for all" on public.sensor_daily_log for insert with check (true);
