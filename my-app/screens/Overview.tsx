import { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { supabase } from '../lib/supabase';
import { theme } from '../lib/theme';
import type { FeedingEvent, WeightReading, FoodLevelReading, MotionEvent } from '../types/database';

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  return sameDay ? d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : d.toLocaleDateString();
}

export default function Overview() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastFeeding, setLastFeeding] = useState<Pick<FeedingEvent, 'created_at' | 'portions'> | null>(null);
  const [lastWeight, setLastWeight] = useState<Pick<WeightReading, 'created_at' | 'weight_grams'> | null>(null);
  const [lastFoodLevel, setLastFoodLevel] = useState<Pick<FoodLevelReading, 'created_at' | 'distance_cm'> | null>(null);
  const [lastMotion, setLastMotion] = useState<Pick<MotionEvent, 'created_at'> | null>(null);
  const [feedingToday, setFeedingToday] = useState(0);

  const load = async () => {
    const today = new Date().toISOString().slice(0, 10);
    const [feedRes, weightRes, foodRes, motionRes, feedTodayRes] = await Promise.all([
      supabase.from('feeding_events').select('created_at, portions').order('created_at', { ascending: false }).limit(1),
      supabase.from('weight_readings').select('created_at, weight_grams').order('created_at', { ascending: false }).limit(1),
      supabase.from('food_level_readings').select('created_at, distance_cm').order('created_at', { ascending: false }).limit(1),
      supabase.from('motion_events').select('created_at').order('created_at', { ascending: false }).limit(1),
      supabase.from('feeding_events').select('portions').gte('created_at', today),
    ]);
    if (!feedRes.error && feedRes.data?.[0]) setLastFeeding(feedRes.data[0]);
    if (!weightRes.error && weightRes.data?.[0]) setLastWeight(weightRes.data[0]);
    if (!foodRes.error && foodRes.data?.[0]) setLastFoodLevel(foodRes.data[0]);
    if (!motionRes.error && motionRes.data?.[0]) setLastMotion(motionRes.data[0]);
    if (!feedTodayRes.error && feedTodayRes.data) setFeedingToday(feedTodayRes.data.reduce((s, r) => s + (r.portions || 0), 0));
  };

  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      await load();
      if (mounted) setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <Text style={[styles.muted, { color: theme.textMuted }]}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} colors={[theme.primary]} tintColor={theme.primary} />}
    >
      <Text style={[styles.title, { color: theme.text }]}>Today at a glance</Text>
      <View style={[styles.highlightCard, { backgroundColor: theme.primary }]}>
        <Text style={styles.highlightLabel}>Portions today</Text>
        <Text style={styles.highlightValue}>{feedingToday}</Text>
      </View>
      <View style={[styles.card, { backgroundColor: theme.surfaceElevated }, theme.shadow]}>
        <Text style={[styles.cardLabel, { color: theme.textMuted }]}>Last feeding</Text>
        <Text style={[styles.cardValue, { color: theme.text }]}>{lastFeeding ? `${lastFeeding.portions} portion(s) at ${formatDate(lastFeeding.created_at)}` : '—'}</Text>
      </View>
      <View style={[styles.card, { backgroundColor: theme.surfaceElevated }, theme.shadow]}>
        <Text style={[styles.cardLabel, { color: theme.textMuted }]}>Last weight</Text>
        <Text style={[styles.cardValue, { color: theme.text }]}>{lastWeight ? `${lastWeight.weight_grams} g at ${formatDate(lastWeight.created_at)}` : '—'}</Text>
      </View>
      <View style={[styles.card, { backgroundColor: theme.surfaceElevated }, theme.shadow]}>
        <Text style={[styles.cardLabel, { color: theme.textMuted }]}>Food level</Text>
        <Text style={[styles.cardValue, { color: theme.text }]}>{lastFoodLevel ? `${lastFoodLevel.distance_cm} cm at ${formatDate(lastFoodLevel.created_at)}` : '—'}</Text>
      </View>
      <View style={[styles.card, { backgroundColor: theme.surfaceElevated }, theme.shadow]}>
        <Text style={[styles.cardLabel, { color: theme.textMuted }]}>Last motion</Text>
        <Text style={[styles.cardValue, { color: theme.text }]}>{lastMotion ? formatDate(lastMotion.created_at) : '—'}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 32 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 16 },
  muted: { fontSize: 15 },
  highlightCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  highlightLabel: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginBottom: 4 },
  highlightValue: { fontSize: 28, fontWeight: '700', color: '#fff' },
  card: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
  },
  cardLabel: { fontSize: 12, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  cardValue: { fontSize: 16, fontWeight: '500' },
});
