import { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { supabase } from '../lib/supabase';
import { theme } from '../lib/theme';
import type { FoodLevelReading } from '../types/database';

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
}

export default function FoodLevel() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [list, setList] = useState<FoodLevelReading[]>([]);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('food_level_readings').select('id, created_at, distance_cm').order('created_at', { ascending: false }).limit(50);
    setList(error ? [] : (data || []));
  }, []);

  const refresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  if (loading && list.length === 0) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <Text style={[styles.muted, { color: theme.textMuted }]}>Loading...</Text>
      </View>
    );
  }

  const latest = list[0];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Food level</Text>
      {latest && (
        <View style={[styles.card, { backgroundColor: theme.primaryLight }, theme.shadow]}>
          <Text style={styles.cardLabel}>Latest reading</Text>
          <Text style={[styles.cardValue, { color: theme.text }]}>{latest.distance_cm} cm</Text>
          <Text style={[styles.cardDate, { color: theme.textMuted }]}>{formatDateTime(latest.created_at)}</Text>
        </View>
      )}
      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} colors={[theme.primary]} tintColor={theme.primary} />}
        contentContainerStyle={list.length === 0 ? styles.empty : styles.list}
        ListEmptyComponent={<Text style={[styles.muted, { color: theme.textMuted }]}>No food level readings yet.</Text>}
        renderItem={({ item }) => (
          <View style={[styles.row, { borderBottomColor: theme.border }]}>
            <Text style={[styles.cm, { color: theme.text }]}>{item.distance_cm} cm</Text>
            <Text style={[styles.date, { color: theme.textMuted }]}>{formatDateTime(item.created_at)}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 16, paddingHorizontal: 16 },
  card: {
    borderRadius: 16,
    padding: 18,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  cardLabel: { fontSize: 12, color: 'rgba(61,52,41,0.7)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  cardValue: { fontSize: 22, fontWeight: '600' },
  cardDate: { fontSize: 13, marginTop: 6 },
  muted: { padding: 16 },
  list: { padding: 16, paddingTop: 0 },
  empty: { flex: 1, padding: 16, justifyContent: 'center' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
  },
  cm: { fontSize: 16, fontWeight: '500' },
  date: { fontSize: 14 },
});
