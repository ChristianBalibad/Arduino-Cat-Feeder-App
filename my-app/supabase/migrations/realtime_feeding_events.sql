-- Add feeding_events to realtime so app gets live updates when ESP posts new events
alter publication supabase_realtime add table feeding_events;
