import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { supabase } from '../lib/supabase';
import { useTheme } from '../lib/ThemeContext';
import { useRealtimeFeedingToday, useRealtimeFoodLevel, useRealtimeMotion, useRealtimeWeight } from '../lib/useRealtime';

const FOOD_EMPTY_CM = 25;
const FOOD_FULL_CM = 4;

function formatTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function formatAgo(iso: string | null | undefined): string {
  if (!iso) return '';
  const sec = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (sec < 60) return 'now';
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  return `${Math.floor(sec / 3600)}h ago`;
}

function foodLevelPercent(distanceCm: number): number {
  const p = ((FOOD_EMPTY_CM - distanceCm) / (FOOD_EMPTY_CM - FOOD_FULL_CM)) * 100;
  return Math.max(0, Math.min(100, Math.round(p)));
}

const cardShadow = Platform.select({
  web: { boxShadow: '0 4px 12px rgba(0,0,0,0.08)' },
  default: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 6 },
});

export default function Overview() {
  const { theme } = useTheme();
  const foodLevel = useRealtimeFoodLevel();
  const weight = useRealtimeWeight();
  const motion = useRealtimeMotion();
  const { count: feedingToday, refresh } = useRealtimeFeedingToday();
  const [refreshing, setRefreshing] = useState(false);
  const [feeding, setFeeding] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const triggerFeed = async () => {
    setFeeding(true);
    const { error } = await supabase.from('feed_commands').insert({ portions: 1 });
    setFeeding(false);
    if (error) {
      Alert.alert('Failed', error.message);
    }
  };

  const foodPct = foodLevel ? foodLevelPercent(foodLevel.distance_cm) : 0;
  const hasData = foodLevel || weight || motion;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} tintColor={theme.primary} />
      }
    >
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <View>
            <Text style={[styles.heroTitle, { color: theme.text }]}>Live Feed</Text>
            <Text style={[styles.heroSub, { color: theme.textMuted }]}>Sensor status</Text>
          </View>
          <View style={[styles.liveBadge, { backgroundColor: hasData ? theme.success : theme.border }]}>
            <View style={[styles.liveDot, { backgroundColor: hasData ? '#fff' : theme.textMuted }]} />
            <Text style={[styles.liveText, { color: hasData ? '#fff' : theme.textMuted }]}>
              {hasData ? 'Live' : 'Waiting'}
            </Text>
          </View>
        </View>
        <View style={[styles.statsRow, { backgroundColor: theme.surface }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: theme.primary }]}>{feedingToday}</Text>
            <Text style={[styles.statLabel, { color: theme.textMuted }]}>Today</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
          <Pressable
            style={({ pressed }) => [styles.feedCta, { backgroundColor: theme.primary, opacity: pressed ? 0.85 : 1 }]}
            onPress={triggerFeed}
            disabled={feeding}
          >
            {feeding ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Ionicons name="fast-food" size={20} color="#fff" />
                <Text style={styles.feedCtaLabel}>Feed now</Text>
              </>
            )}
          </Pressable>
        </View>
      </View>

      <Text style={[styles.sectionTitle, { color: theme.text }]}>Sensors</Text>

      <View style={styles.cardGrid}>
        <View style={[styles.sensorCard, { backgroundColor: theme.surface }, cardShadow]}>
          <View style={[styles.cardIconWrap, { backgroundColor: `${theme.primary}15` }]}>
            <Ionicons name="layers" size={24} color={theme.primary} />
          </View>
          <Text style={[styles.cardLabel, { color: theme.textMuted }]}>Food level</Text>
          <View style={styles.cardValueRow}>
            <View style={[styles.barTrack, { backgroundColor: theme.border }]}>
              <View
                style={[
                  styles.barFill,
                  {
                    width: `${foodPct}%`,
                    backgroundColor: foodPct < 20 ? theme.error : foodPct < 50 ? theme.primaryLight : theme.success,
                  },
                ]}
              />
            </View>
            <Text style={[styles.cardNumber, { color: theme.text }]}>
              {foodLevel ? `${foodLevel.distance_cm}` : '—'} cm
            </Text>
          </View>
          <Text style={[styles.cardMeta, { color: theme.textMuted }]}>
            {foodLevel ? formatAgo(foodLevel.created_at) : 'No data'}
          </Text>
        </View>

        <View style={[styles.sensorCard, { backgroundColor: theme.surface }, cardShadow]}>
          <View style={[styles.cardIconWrap, { backgroundColor: `${theme.primary}15` }]}>
            <Ionicons name="scale" size={24} color={theme.primary} />
          </View>
          <Text style={[styles.cardLabel, { color: theme.textMuted }]}>Bowl weight</Text>
          <Text style={[styles.cardBigNum, { color: theme.text }]}>
            {weight ? Number(weight.weight_grams) : '—'}
          </Text>
          <Text style={[styles.cardUnit, { color: theme.textMuted }]}>grams</Text>
          <Text style={[styles.cardMeta, { color: theme.textMuted }]}>
            {weight ? formatAgo(weight.created_at) : 'No data'}
          </Text>
        </View>
      </View>

      <View style={[styles.presenceCard, { backgroundColor: theme.surface }, cardShadow]}>
        <View style={styles.presenceHeader}>
          <View style={[styles.cardIconWrap, { backgroundColor: `${theme.primary}15` }]}>
            <Ionicons name="walk" size={24} color={theme.primary} />
          </View>
          <View style={styles.presenceInfo}>
            <Text style={[styles.cardLabel, { color: theme.textMuted }]}>Presence (PIR)</Text>
            <View style={styles.presenceStatus}>
              <View
                style={[
                  styles.presenceDot,
                  { backgroundColor: motion ? theme.success : theme.border },
                ]}
              />
              <Text style={[styles.presenceText, { color: theme.text }]}>
                {motion ? 'Detected' : 'Clear'}
              </Text>
            </View>
          </View>
          <Text style={[styles.presenceTime, { color: theme.textMuted }]}>
            {motion ? formatTime(motion.created_at) : '—'}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 48 },
  hero: { marginBottom: 28 },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  heroTitle: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  heroSub: { fontSize: 14, marginTop: 2 },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3 },
  liveText: { fontSize: 12, fontWeight: '600' },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    ...Platform.select({
      web: { boxShadow: '0 4px 12px rgba(0,0,0,0.08)' },
      default: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 6 },
    }),
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 28, fontWeight: '800' },
  statLabel: { fontSize: 12, marginTop: 2 },
  statDivider: { width: 1, height: 36, marginHorizontal: 16 },
  feedCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
  },
  feedCtaLabel: { fontSize: 15, fontWeight: '700', color: '#fff' },
  sectionTitle: { fontSize: 15, fontWeight: '600', marginBottom: 14 },
  cardGrid: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  sensorCard: {
    flex: 1,
    borderRadius: 18,
    padding: 18,
    minHeight: 140,
  },
  cardIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cardLabel: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 },
  cardValueRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  barTrack: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  cardNumber: { fontSize: 16, fontWeight: '700' },
  cardBigNum: { fontSize: 28, fontWeight: '800' },
  cardUnit: { fontSize: 12, marginTop: 2 },
  cardMeta: { fontSize: 11, marginTop: 8 },
  presenceCard: {
    borderRadius: 18,
    padding: 18,
  },
  presenceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  presenceInfo: { flex: 1, marginLeft: 14 },
  presenceStatus: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  presenceDot: { width: 10, height: 10, borderRadius: 5 },
  presenceText: { fontSize: 18, fontWeight: '700' },
  presenceTime: { fontSize: 13 },
});
