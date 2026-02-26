import { useCallback, useEffect, useState } from 'react';
import { FlatList, Platform, RefreshControl, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { supabase } from '../lib/supabase';
import { useTheme } from '../lib/ThemeContext';
import type { FeedingEvent } from '../types/database';

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
}

const cardShadow = Platform.select({
  web: { boxShadow: '0 4px 12px rgba(0,0,0,0.08)' },
  default: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 6 },
});

export default function FeedingHistory() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [list, setList] = useState<FeedingEvent[]>([]);
  const [totalPortions, setTotalPortions] = useState(0);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from('feeding_events')
      .select('id, created_at, portions')
      .order('created_at', { ascending: false })
      .limit(100);
    const events = error ? [] : (data || []);
    setList(events);
    setTotalPortions(events.reduce((s, r) => s + (r.portions || 0), 0));
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  useEffect(() => {
    load().finally(() => setLoading(false));

    const channel = supabase
      .channel('feeding_events_list')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'feeding_events' }, load)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [load]);

  if (loading && list.length === 0) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <View style={[styles.loaderIcon, { backgroundColor: `${theme.primary}20` }]}>
          <Ionicons name="restaurant" size={32} color={theme.primary} />
        </View>
        <Text style={[styles.muted, { color: theme.textMuted }]}>Loading</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.hero}>
        <View style={[styles.heroIcon, { backgroundColor: `${theme.primary}15` }]}>
          <Ionicons name="fast-food" size={28} color={theme.primary} />
        </View>
        <View style={styles.heroText}>
          <Text style={[styles.heroTitle, { color: theme.text }]}>Feeding History</Text>
          <Text style={[styles.heroSub, { color: theme.textMuted }]}>Dispensed events</Text>
        </View>
        <View style={[styles.heroStat, { backgroundColor: theme.primary }]}>
          <Text style={styles.heroStatValue}>{totalPortions}</Text>
          <Text style={styles.heroStatLabel}>Total</Text>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent</Text>

      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} tintColor={theme.primary} />
        }
        contentContainerStyle={list.length === 0 ? styles.empty : styles.list}
        ListEmptyComponent={
          <View style={[styles.emptyCard, { backgroundColor: theme.surface }, cardShadow]}>
            <Ionicons name="calendar-outline" size={40} color={theme.border} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No feedings yet</Text>
            <Text style={[styles.emptySub, { color: theme.textMuted }]}>Events will appear when the feeder runs</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.eventCard, { backgroundColor: theme.surface }, cardShadow]}>
            <View style={[styles.eventIcon, { backgroundColor: `${theme.primary}15` }]}>
              <Ionicons name="nutrition" size={20} color={theme.primary} />
            </View>
            <View style={styles.eventContent}>
              <Text style={[styles.eventPortions, { color: theme.text }]}>
                {item.portions} portion{item.portions !== 1 ? 's' : ''}
              </Text>
              <Text style={[styles.eventDate, { color: theme.textMuted }]}>{formatDateTime(item.created_at)}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loaderIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  muted: { fontSize: 14 },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  heroText: { flex: 1 },
  heroTitle: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  heroSub: { fontSize: 13, marginTop: 2 },
  heroStat: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    minWidth: 64,
  },
  heroStatValue: { fontSize: 24, fontWeight: '800', color: '#fff' },
  heroStatLabel: { fontSize: 11, color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  sectionTitle: { fontSize: 15, fontWeight: '600', marginHorizontal: 20, marginBottom: 14 },
  list: { paddingHorizontal: 20, paddingBottom: 48 },
  empty: { flex: 1, paddingHorizontal: 20, justifyContent: 'center' },
  emptyCard: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 20,
  },
  emptyTitle: { fontSize: 17, fontWeight: '600', marginTop: 16 },
  emptySub: { fontSize: 14, marginTop: 6 },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
  },
  eventIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  eventContent: { flex: 1 },
  eventPortions: { fontSize: 16, fontWeight: '700' },
  eventDate: { fontSize: 13, marginTop: 2 },
});
