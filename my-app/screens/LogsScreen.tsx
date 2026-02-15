import { useCallback, useEffect, useState } from 'react';
import { FlatList, Platform, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { supabase } from '../lib/supabase';
import { useTheme } from '../lib/ThemeContext';
import { useRealtimeFoodLevel, useRealtimeMotion, useRealtimeWeight } from '../lib/useRealtime';
import type { SensorDailyLog } from '../types/database';

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString([], { dateStyle: 'medium' });
}

type LogTab = 'food' | 'weight' | 'motion';

const cardShadow = Platform.select({
  web: { boxShadow: '0 4px 12px rgba(0,0,0,0.08)' },
  default: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 6 },
});

const tabIcons: Record<LogTab, keyof typeof Ionicons.glyphMap> = {
  food: 'layers',
  weight: 'scale',
  motion: 'walk',
};

export default function LogsScreen() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<LogTab>('food');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dailyLogs, setDailyLogs] = useState<SensorDailyLog[]>([]);

  const foodLevel = useRealtimeFoodLevel();
  const weight = useRealtimeWeight();
  const motion = useRealtimeMotion();

  const loadDailyLogs = useCallback(async () => {
    const sensorMap: Record<LogTab, string> = { food: 'food_level', weight: 'weight', motion: 'motion' };
    const { data } = await supabase
      .from('sensor_daily_log')
      .select('*')
      .eq('sensor', sensorMap[activeTab])
      .order('log_date', { ascending: false })
      .limit(50);
    setDailyLogs(data ?? []);
  }, [activeTab]);

  useEffect(() => {
    setLoading(true);
    loadDailyLogs().finally(() => setLoading(false));
  }, [loadDailyLogs, activeTab]);

  const refresh = async () => {
    setRefreshing(true);
    await loadDailyLogs();
    setRefreshing(false);
  };

  const tabs: { key: LogTab; label: string }[] = [
    { key: 'food', label: 'Food' },
    { key: 'weight', label: 'Weight' },
    { key: 'motion', label: 'Motion' },
  ];

  const renderValue = (item: SensorDailyLog) => {
    if (activeTab === 'food' && item.distance_cm != null) return `${item.distance_cm} cm`;
    if (activeTab === 'weight' && item.weight_grams != null) return `${Number(item.weight_grams)} g`;
    if (activeTab === 'motion') return `${item.motion_count ?? 0} detected`;
    return '—';
  };

  if (loading && dailyLogs.length === 0) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <View style={[styles.loaderIcon, { backgroundColor: `${theme.primary}20` }]}>
          <Ionicons name="list" size={32} color={theme.primary} />
        </View>
        <Text style={[styles.muted, { color: theme.textMuted }]}>Loading</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.hero}>
        <Text style={[styles.heroTitle, { color: theme.text }]}>Sensor Logs</Text>
        <Text style={[styles.heroSub, { color: theme.textMuted }]}>Daily history</Text>
      </View>

      <View style={[styles.liveCard, { backgroundColor: theme.surface }, cardShadow]}>
        <Text style={[styles.liveLabel, { color: theme.textMuted }]}>Live now</Text>
        <View style={styles.liveGrid}>
          <View style={styles.liveItem}>
            <View style={[styles.liveIconWrap, { backgroundColor: `${theme.primary}15` }]}>
              <Ionicons name="layers" size={18} color={theme.primary} />
            </View>
            <Text style={[styles.liveValue, { color: theme.text }]}>{foodLevel ? `${foodLevel.distance_cm} cm` : '—'}</Text>
          </View>
          <View style={styles.liveItem}>
            <View style={[styles.liveIconWrap, { backgroundColor: `${theme.primary}15` }]}>
              <Ionicons name="scale" size={18} color={theme.primary} />
            </View>
            <Text style={[styles.liveValue, { color: theme.text }]}>{weight ? `${Number(weight.weight_grams)} g` : '—'}</Text>
          </View>
          <View style={styles.liveItem}>
            <View style={[styles.liveIconWrap, { backgroundColor: `${theme.primary}15` }]}>
              <Ionicons name="walk" size={18} color={theme.primary} />
            </View>
            <Text style={[styles.liveValue, { color: theme.text }]}>{motion ? 'Yes' : '—'}</Text>
          </View>
        </View>
      </View>

      <View style={[styles.tabBar, { backgroundColor: theme.border }]}>
        {tabs.map((t) => (
          <Pressable
            key={t.key}
            style={[
              styles.tab,
              activeTab === t.key && {
                backgroundColor: theme.surface,
                borderRadius: 10,
                ...Platform.select({
                  web: { boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
                  default: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
                }),
              },
            ]}
            onPress={() => setActiveTab(t.key)}
          >
            <Ionicons
              name={tabIcons[t.key]}
              size={18}
              color={activeTab === t.key ? theme.primary : theme.textMuted}
            />
            <Text
              style={[
                styles.tabLabel,
                activeTab === t.key ? { color: theme.primary, fontWeight: '700' } : { color: theme.textMuted },
              ]}
            >
              {t.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Text style={[styles.sectionTitle, { color: theme.text }]}>History</Text>

      <FlatList
        key={activeTab}
        data={dailyLogs}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} colors={[theme.primary]} tintColor={theme.primary} />
        }
        contentContainerStyle={dailyLogs.length === 0 ? styles.empty : styles.list}
        ListEmptyComponent={
          <View style={[styles.emptyCard, { backgroundColor: theme.surface }, cardShadow]}>
            <Ionicons name="analytics-outline" size={40} color={theme.border} />
            <Text style={[styles.emptyTitle, { color: theme.text }]}>No daily logs yet</Text>
            <Text style={[styles.emptySub, { color: theme.textMuted }]}>ESP inserts once per day</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={[styles.logCard, { backgroundColor: theme.surface }, cardShadow]}>
            <View style={[styles.logIconWrap, { backgroundColor: `${theme.primary}15` }]}>
              <Ionicons name={tabIcons[activeTab]} size={20} color={theme.primary} />
            </View>
            <View style={styles.logContent}>
              <Text style={[styles.logValue, { color: theme.text }]}>{renderValue(item)}</Text>
              <Text style={[styles.logDate, { color: theme.textMuted }]}>{formatDate(item.log_date)}</Text>
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
  hero: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 16 },
  heroTitle: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  heroSub: { fontSize: 13, marginTop: 2 },
  liveCard: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 18,
    padding: 18,
  },
  liveLabel: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 12 },
  liveGrid: { flexDirection: 'row', justifyContent: 'space-around' },
  liveItem: { alignItems: 'center' },
  liveIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  liveValue: { fontSize: 15, fontWeight: '700' },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 20,
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
  },
  tabLabel: { fontSize: 14 },
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
  logCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
  },
  logIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  logContent: { flex: 1 },
  logValue: { fontSize: 16, fontWeight: '700' },
  logDate: { fontSize: 13, marginTop: 2 },
});
