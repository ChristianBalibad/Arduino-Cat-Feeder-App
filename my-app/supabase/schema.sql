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

  -- Motion events (PIR sensor)
  create table if not exists public.motion_events (
    id uuid primary key default gen_random_uuid(),
    created_at timestamptz default now() not null
  );

  alter table public.feeding_events enable row level security;
  alter table public.weight_readings enable row level security;
  alter table public.food_level_readings enable row level security;
  alter table public.motion_events enable row level security;

  create policy "Allow read for all" on public.feeding_events for select using (true);
  create policy "Allow insert for all" on public.feeding_events for insert with check (true);

  create policy "Allow read for all" on public.weight_readings for select using (true);
  create policy "Allow insert for all" on public.weight_readings for insert with check (true);

  create policy "Allow read for all" on public.food_level_readings for select using (true);
  create policy "Allow insert for all" on public.food_level_readings for insert with check (true);

  create policy "Allow read for all" on public.motion_events for select using (true);
  create policy "Allow insert for all" on public.motion_events for insert with check (true);
