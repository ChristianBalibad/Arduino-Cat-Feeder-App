import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '../lib/ThemeContext';

const cardShadow = Platform.select({
  web: { boxShadow: '0 4px 12px rgba(0,0,0,0.08)' },
  default: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 6 },
});

export default function SettingsScreen() {
  const { theme, mode, setMode } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.hero}>
        <View style={[styles.heroIcon, { backgroundColor: `${theme.primary}20` }]}>
          <Ionicons name="settings" size={28} color={theme.primary} />
        </View>
        <Text style={[styles.heroTitle, { color: theme.text }]}>Settings</Text>
        <Text style={[styles.heroSub, { color: theme.textMuted }]}>App configuration</Text>
      </View>

      <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>Appearance</Text>
      <View style={[styles.card, { backgroundColor: theme.surface }, cardShadow]}>
        <View style={styles.row}>
          <Ionicons name="moon-outline" size={22} color={theme.textMuted} />
          <Text style={[styles.rowLabel, { color: theme.text }]}>Theme</Text>
        </View>
        <View style={styles.themeRow}>
          <Pressable
            style={[
              styles.themeOption,
              { backgroundColor: theme.border },
              mode === 'light' && { backgroundColor: theme.primary },
            ]}
            onPress={() => setMode('light')}
          >
            <Ionicons name="sunny" size={20} color={mode === 'light' ? '#fff' : theme.textMuted} />
            <Text style={[styles.themeLabel, { color: mode === 'light' ? '#fff' : theme.text }]}>Light</Text>
          </Pressable>
          <Pressable
            style={[
              styles.themeOption,
              { backgroundColor: theme.border },
              mode === 'dark' && { backgroundColor: theme.primary },
            ]}
            onPress={() => setMode('dark')}
          >
            <Ionicons name="moon" size={20} color={mode === 'dark' ? '#fff' : theme.textMuted} />
            <Text style={[styles.themeLabel, { color: mode === 'dark' ? '#fff' : theme.text }]}>Dark</Text>
          </Pressable>
        </View>
      </View>

      <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>App</Text>
      <View style={[styles.card, { backgroundColor: theme.surface }, cardShadow]}>
        <View style={[styles.row, styles.rowBorder, { borderBottomColor: theme.border }]}>
          <Ionicons name="information-circle-outline" size={22} color={theme.textMuted} />
          <Text style={[styles.rowLabel, { color: theme.text }]}>Version</Text>
          <Text style={[styles.rowValue, { color: theme.textMuted }]}>1.0.0</Text>
        </View>
        <View style={styles.row}>
          <Ionicons name="server-outline" size={22} color={theme.textMuted} />
          <Text style={[styles.rowLabel, { color: theme.text }]}>Connection</Text>
          <View style={[styles.badge, { backgroundColor: theme.success }]}>
            <Text style={styles.badgeText}>Connected</Text>
          </View>
        </View>
      </View>

      <Text style={[styles.sectionLabel, { color: theme.textMuted }]}>Data</Text>
      <View style={[styles.card, { backgroundColor: theme.surface }, cardShadow]}>
        <View style={[styles.row, styles.rowBorder, { borderBottomColor: theme.border }]}>
          <Ionicons name="resize-outline" size={22} color={theme.textMuted} />
          <Text style={[styles.rowLabel, { color: theme.text }]}>Weight unit</Text>
          <Text style={[styles.rowValue, { color: theme.textMuted }]}>grams</Text>
        </View>
        <View style={styles.row}>
          <Ionicons name="analytics-outline" size={22} color={theme.textMuted} />
          <Text style={[styles.rowLabel, { color: theme.text }]}>Food level</Text>
          <Text style={[styles.rowValue, { color: theme.textMuted }]}>cm (ultrasonic)</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: {
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
    marginBottom: 14,
  },
  heroTitle: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  heroSub: { fontSize: 13, marginTop: 2 },
  sectionLabel: { fontSize: 12, fontWeight: '600', marginHorizontal: 20, marginBottom: 8 },
  card: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 18,
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  rowBorder: { borderBottomWidth: 1 },
  rowLabel: { flex: 1, fontSize: 16, fontWeight: '500' },
  rowValue: { fontSize: 14 },
  themeRow: { flexDirection: 'row', gap: 12, marginTop: 12 },
  themeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  themeLabel: { fontSize: 15, fontWeight: '600' },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: { fontSize: 12, fontWeight: '600', color: '#fff' },
});
