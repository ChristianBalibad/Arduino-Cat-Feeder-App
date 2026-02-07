import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { supabase } from './lib/supabase';
import { theme } from './lib/theme';
import Overview from './screens/Overview';
import FeedingHistory from './screens/FeedingHistory';
import Weight from './screens/Weight';
import FoodLevel from './screens/FoodLevel';
import Motion from './screens/Motion';
import SplashScreen from './screens/SplashScreen';

const Tab = createBottomTabNavigator();

const SPLASH_MIN_MS = 1800;

type ConnectionStatus = 'splash' | 'connecting' | 'connected' | 'error';

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.surfaceElevated },
        headerTitleStyle: { color: theme.text, fontWeight: '600', fontSize: 18 },
        headerShadowVisible: false,
        headerTintColor: theme.text,
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textMuted,
        tabBarStyle: {
          backgroundColor: theme.surfaceElevated,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '500' },
      }}
    >
      <Tab.Screen name="Overview" component={Overview} options={{ tabBarLabel: 'Overview' }} />
      <Tab.Screen name="Feeding" component={FeedingHistory} options={{ tabBarLabel: 'Feeding' }} />
      <Tab.Screen name="Weight" component={Weight} options={{ tabBarLabel: 'Weight' }} />
      <Tab.Screen name="Food" component={FoodLevel} options={{ tabBarLabel: 'Food' }} />
      <Tab.Screen name="Motion" component={Motion} options={{ tabBarLabel: 'Motion' }} />
    </Tab.Navigator>
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
        <Text style={[styles.title, { color: theme.text }]}>Cat Feeder</Text>
        <View style={[styles.errorCard, { backgroundColor: theme.surface }]}>
          <Text style={[styles.error, { color: theme.error }]}>{error}</Text>
        </View>
        <StatusBar style="dark" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <TabNavigator />
      <StatusBar style="dark" />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
  },
  errorCard: {
    padding: 20,
    borderRadius: 16,
    marginTop: 16,
    maxWidth: '100%',
  },
  error: {
    fontSize: 14,
    textAlign: 'center',
  },
});
