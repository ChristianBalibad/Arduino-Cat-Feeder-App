import { useCallback, useEffect, useState } from 'react';
import { supabase } from './supabase';
import type { SensorState } from '../types/database';

const SENSOR_POLL_MS = 8000;

function parseFoodLevel(data: unknown): { distance_cm: number; created_at: string } | null {
  const d = data as { distance_cm?: number; updated_at?: string };
  if (d?.distance_cm != null) return { distance_cm: d.distance_cm, created_at: d.updated_at! };
  return null;
}

function parseWeight(data: unknown): { weight_grams: number; created_at: string } | null {
  const d = data as { weight_grams?: number; updated_at?: string };
  if (d?.weight_grams != null) return { weight_grams: d.weight_grams, created_at: d.updated_at! };
  return null;
}

function parseMotion(data: unknown): { created_at: string } | null {
  const d = data as { last_motion_at?: string };
  if (d?.last_motion_at) return { created_at: d.last_motion_at };
  return null;
}

function useSensorState<T>(sensor: string, select: string, parse: (data: unknown) => T | null) {
  const [latest, setLatest] = useState<T | null>(null);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('sensor_states')
      .select(select)
      .eq('sensor', sensor)
      .single();
    const parsed = parse(data);
    if (parsed) setLatest(parsed);
  }, [sensor, select]);

  useEffect(() => {
    load();

    const channel = supabase
      .channel(`sensor_states_${sensor}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'sensor_states', filter: `sensor=eq.${sensor}` }, (payload) => {
        const parsed = parse(payload.new as SensorState);
        if (parsed) setLatest(parsed);
      })
      .subscribe();

    const interval = setInterval(load, SENSOR_POLL_MS);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [load, sensor]);

  return latest;
}

export function useRealtimeFoodLevel() {
  return useSensorState('food_level', 'distance_cm, updated_at', parseFoodLevel);
}

export function useRealtimeWeight() {
  return useSensorState('weight', 'weight_grams, updated_at', parseWeight);
}

export function useRealtimeMotion() {
  return useSensorState('motion', 'last_motion_at', parseMotion);
}

const FEEDING_POLL_MS = 5000;

export function useRealtimeFeedingToday() {
  const [count, setCount] = useState(0);

  const load = useCallback(async () => {
    const today = new Date().toISOString().slice(0, 10);
    const { data } = await supabase
      .from('feeding_events')
      .select('portions')
      .gte('created_at', today);
    const total = (data || []).reduce((s, r) => s + (r.portions || 0), 0);
    setCount(total);
  }, []);

  useEffect(() => {
    load();

    const channel = supabase
      .channel('feeding_events_insert')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'feeding_events' }, load)
      .subscribe();

    const interval = setInterval(load, FEEDING_POLL_MS);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, [load]);

  return { count, refresh: load };
}
