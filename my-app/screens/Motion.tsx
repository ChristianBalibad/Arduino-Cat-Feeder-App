import { useCallback, useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { supabase } from '../lib/supabase';
import { theme } from '../lib/theme';
import type { MotionEvent } from '../types/database';

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' });
}

export default function Motion() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [list, setList] = useState<MotionEvent[]>([]);

  const load = useCallback(async () => {
    const { data, error } = await supabase.from('motion_events').select('id, created_at').order('created_at', { ascending: false }).limit(100);
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

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Motion</Text>
      <FlatList
        data={list}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} colors={[theme.primary]} tintColor={theme.primary} />}
        contentContainerStyle={list.length === 0 ? styles.empty : styles.list}
        ListEmptyComponent={<Text style={[styles.muted, { color: theme.textMuted }]}>No motion events yet. PIR detections will appear here.</Text>}
        renderItem={({ item }) => (
          <View style={[styles.row, { borderBottomColor: theme.border }]}>
            <Text style={[styles.label, { color: theme.text }]}>Detected</Text>
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
  label: { fontSize: 16, fontWeight: '500' },
  date: { fontSize: 14 },
});
