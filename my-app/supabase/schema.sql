-- Run this in Supabase: SQL Editor -> New query -> paste -> Run

  -- Feeding events (servo dispense)
  create table if not exists public.feeding_events (
    id uuid primary key default gen_random_uuid(),
    created_at timestamptz default now() not null,
    portions integer not null default 1
  );

  -- Weight readings (weight sensor, e.g. bowl or scale)
  create table if not exists public.weight_readings (
    id uuid primary key default gen_random_uuid(),
    created_at timestamptz default now() not null,
    weight_grams numeric(10, 2) not null
  );

  -- Food level from ultrasonic (distance in cm; lower = less food)
  create table if not exists public.food_level_readings (
    id uuid primary key default gen_random_uuid(),
    created_at timestamptz default now() not null,
    distance_cm numeric(6, 2) not null
  );

  -- Feed commands (app -> ESP: poll this, run feeder, then delete row)
  create table if not exists public.feed_commands (
    id uuid primary key default gen_random_uuid(),
    created_at timestamptz default now() not null,
    portions integer not null default 1
  );

  -- Motion events (PIR sensor) - deprecated, use sensor_states
  create table if not exists public.motion_events (
    id uuid primary key default gen_random_uuid(),
    created_at timestamptz default now() not null
  );

  -- Sensor states: one row per sensor, ESP UPDATES (no unbounded growth)
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

  -- Daily history: ESP inserts once per day per sensor
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

  alter table public.feeding_events enable row level security;
  alter table public.weight_readings enable row level security;
  alter table public.food_level_readings enable row level security;
  alter table public.feed_commands enable row level security;
  alter table public.motion_events enable row level security;

  create policy "Allow read for all" on public.feed_commands for select using (true);
  create policy "Allow insert for all" on public.feed_commands for insert with check (true);
  create policy "Allow delete for all" on public.feed_commands for delete using (true);

  create policy "Allow read for all" on public.feeding_events for select using (true);
  create policy "Allow insert for all" on public.feeding_events for insert with check (true);

  create policy "Allow read for all" on public.weight_readings for select using (true);
  create policy "Allow insert for all" on public.weight_readings for insert with check (true);

  create policy "Allow read for all" on public.food_level_readings for select using (true);
  create policy "Allow insert for all" on public.food_level_readings for insert with check (true);

  create policy "Allow read for all" on public.motion_events for select using (true);
  create policy "Allow insert for all" on public.motion_events for insert with check (true);

  alter table public.sensor_states enable row level security;
  alter table public.sensor_daily_log enable row level security;

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

  create policy "Allow read for all" on public.sensor_daily_log for select using (true);
  create policy "Allow insert for all" on public.sensor_daily_log for insert with check (true);
