import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import type { SensorState } from '../types/database';

export function useRealtimeFoodLevel() {
  const [latest, setLatest] = useState<{ distance_cm: number; created_at: string } | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('sensor_states')
        .select('distance_cm, updated_at')
        .eq('sensor', 'food_level')
        .single();
      if (data?.distance_cm != null) {
        setLatest({ distance_cm: data.distance_cm, created_at: data.updated_at });
      }
    };
    load();

    const channel = supabase
      .channel('sensor_states_food')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'sensor_states', filter: 'sensor=eq.food_level' }, (payload) => {
        const row = payload.new as SensorState;
        if (row.distance_cm != null) {
          setLatest({ distance_cm: row.distance_cm, created_at: row.updated_at });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return latest;
}

export function useRealtimeWeight() {
  const [latest, setLatest] = useState<{ weight_grams: number; created_at: string } | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('sensor_states')
        .select('weight_grams, updated_at')
        .eq('sensor', 'weight')
        .single();
      if (data?.weight_grams != null) {
        setLatest({ weight_grams: data.weight_grams, created_at: data.updated_at });
      }
    };
    load();

    const channel = supabase
      .channel('sensor_states_weight')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'sensor_states', filter: 'sensor=eq.weight' }, (payload) => {
        const row = payload.new as SensorState;
        if (row.weight_grams != null) {
          setLatest({ weight_grams: row.weight_grams, created_at: row.updated_at });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return latest;
}

export function useRealtimeMotion() {
  const [latest, setLatest] = useState<{ created_at: string } | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('sensor_states')
        .select('last_motion_at, updated_at')
        .eq('sensor', 'motion')
        .single();
      if (data?.last_motion_at) {
        setLatest({ created_at: data.last_motion_at });
      } else if (data?.updated_at) {
        setLatest({ created_at: data.updated_at });
      }
    };
    load();

    const channel = supabase
      .channel('sensor_states_motion')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'sensor_states', filter: 'sensor=eq.motion' }, (payload) => {
        const row = payload.new as SensorState;
        if (row.last_motion_at) {
          setLatest({ created_at: row.last_motion_at });
        } else if (row.updated_at) {
          setLatest({ created_at: row.updated_at });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return latest;
}
