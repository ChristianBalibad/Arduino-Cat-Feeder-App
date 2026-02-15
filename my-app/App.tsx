import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Ionicons from '@expo/vector-icons/Ionicons';
import { supabase } from './lib/supabase';
import { theme } from './lib/theme';
import { ThemeProvider, useTheme } from './lib/ThemeContext';
import Overview from './screens/Overview';
import FeedingHistory from './screens/FeedingHistory';
import LogsScreen from './screens/LogsScreen';
import SettingsScreen from './screens/SettingsScreen';
import SplashScreen from './screens/SplashScreen';

const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

const SPLASH_MIN_MS = 1800;

type ConnectionStatus = 'splash' | 'connecting' | 'connected' | 'error';

function TabNavigator() {
  const { theme: t } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: t.primary,
        tabBarInactiveTintColor: t.textMuted,
        tabBarStyle: {
          backgroundColor: t.surfaceElevated,
          borderTopColor: t.border,
          borderTopWidth: 1,
          paddingTop: 8,
          height: 60,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '500' },
      }}
    >
      <Tab.Screen
        name="Overview"
        component={Overview}
        options={{
          tabBarLabel: 'Live',
          tabBarIcon: ({ color, size }) => <Ionicons name="radio" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Feeding"
        component={FeedingHistory}
        options={{
          tabBarLabel: 'Feeding',
          tabBarIcon: ({ color, size }) => <Ionicons name="restaurant" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Logs"
        component={LogsScreen}
        options={{
          tabBarLabel: 'Logs',
          tabBarIcon: ({ color, size }) => <Ionicons name="list" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => <Ionicons name="settings" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

const drawerItems = [
  { key: 'Live', route: 'Main', screen: 'Overview', icon: 'radio', label: 'Live Feed' },
  { key: 'Feeding', route: 'Main', screen: 'Feeding', icon: 'restaurant', label: 'Feeding' },
  { key: 'Logs', route: 'Main', screen: 'Logs', icon: 'list', label: 'Logs' },
  { key: 'Settings', route: 'Main', screen: 'Settings', icon: 'settings', label: 'Settings' },
] as const;

function CustomDrawerContent(props: any) {
  const { theme: t } = useTheme();
  const { state, navigation } = props;
  const currentRoute = state.routes[state.index]?.name;
  const mainState = currentRoute === 'Main' ? state.routes[state.index]?.state : null;
  const currentTab = mainState?.routes?.[mainState.index ?? 0]?.name;

  return (
    <DrawerContentScrollView
      {...props}
      style={{ backgroundColor: t.surface }}
      contentContainerStyle={drawerStyles.content}
    >
      <View style={[drawerStyles.header, { borderBottomColor: t.border }]}>
        <View style={[drawerStyles.logo, { backgroundColor: t.primary }]} />
        <Text style={[drawerStyles.title, { color: t.text }]}>Cat Feeder</Text>
        <Text style={[drawerStyles.subtitle, { color: t.textMuted }]}>Live monitoring</Text>
      </View>
      {drawerItems.map((item) => {
        const isActive = currentRoute === 'Main' && currentTab === item.screen;
        return (
          <Pressable
            key={item.key}
            style={[
              drawerStyles.item,
              isActive && { backgroundColor: `${t.primary}15`, borderLeftWidth: 3, borderLeftColor: t.primary },
            ]}
            onPress={() => {
              navigation.closeDrawer();
              navigation.navigate('Main', { screen: item.screen });
            }}
          >
            <Ionicons
              name={item.icon as any}
              size={22}
              color={isActive ? t.primary : t.textMuted}
            />
            <Text
              style={[
                drawerStyles.itemLabel,
                { color: isActive ? t.primary : t.text },
                isActive && { fontWeight: '600' },
              ]}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
      <View style={drawerStyles.footer}>
        <Text style={[drawerStyles.footerText, { color: t.textMuted }]}>v1.0.0</Text>
      </View>
    </DrawerContentScrollView>
  );
}

function DrawerNavigator() {
  const { theme: t } = useTheme();
  return (
    <Drawer.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: t.surfaceElevated },
        headerTitleStyle: { color: t.text, fontWeight: '600', fontSize: 18 },
        headerShadowVisible: false,
        headerTintColor: t.text,
        drawerStyle: { backgroundColor: t.surface, width: 280 },
        drawerActiveTintColor: t.primary,
        drawerInactiveTintColor: t.textMuted,
        drawerLabelStyle: { fontSize: 16, fontWeight: '500' },
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen
        name="Main"
        component={TabNavigator}
        options={({ route }) => {
          const routeName = getFocusedRouteNameFromRoute(route) ?? 'Overview';
          const titles: Record<string, string> = {
            Overview: 'Live Feed',
            Feeding: 'Feeding History',
            Logs: 'Sensor Logs',
            Settings: 'Settings',
          };
          return {
            headerShown: true,
            headerTitle: titles[routeName] ?? 'Live Feed',
            drawerItemStyle: { display: 'none' },
          };
        }}
      />
    </Drawer.Navigator>
  );
}

export default function App() {
  const [status, setStatus] = useState<ConnectionStatus>('splash');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const start = Date.now();

    const check = async () => {
      const { error: err } = await supabase.auth.getSession();
      if (!mounted) return;
      const elapsed = Date.now() - start;
      const wait = Math.max(0, SPLASH_MIN_MS - elapsed);

      if (err) {
        setTimeout(() => {
          if (mounted) {
            setError(err.message);
            setStatus('error');
          }
        }, wait);
        return;
      }
      setTimeout(() => {
        if (mounted) setStatus('connected');
      }, wait);
    };

    check();
    return () => { mounted = false; };
  }, []);

  if (status === 'splash') {
    return (
      <>
        <SplashScreen />
        <StatusBar style="dark" />
      </>
    );
  }

  if (status === 'error') {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.errorIcon, { backgroundColor: `${theme.error}15` }]}>
          <Ionicons name="alert-circle" size={40} color={theme.error} />
        </View>
        <Text style={[styles.title, { color: theme.text }]}>Connection error</Text>
        <View style={[styles.errorCard, { backgroundColor: theme.surface }]}>
          <Text style={[styles.error, { color: theme.error }]}>{error}</Text>
        </View>
        <StatusBar style="dark" />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

function AppContent() {
  const { theme: t, mode } = useTheme();
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <DrawerNavigator />
      </NavigationContainer>
      <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
  },
  errorCard: {
    padding: 24,
    borderRadius: 20,
    marginTop: 16,
    maxWidth: '100%',
  },
  error: {
    fontSize: 14,
    textAlign: 'center',
  },
});

const drawerStyles = StyleSheet.create({
  content: { flex: 1, paddingTop: 20 },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 14,
    marginBottom: 12,
  },
  title: { fontSize: 20, fontWeight: '800' },
  subtitle: { fontSize: 13, marginTop: 4 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  itemLabel: { fontSize: 16 },
  footer: { marginTop: 'auto', padding: 24, paddingBottom: 32 },
  footerText: { fontSize: 12 },
});
