import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { theme } from '../lib/theme';

export default function SplashScreen() {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, scale]);

  return (
    <Animated.View style={[styles.container, { backgroundColor: theme.background, opacity }]}>
      <Animated.View style={[styles.content, { transform: [{ scale }] }]}>
        <View style={[styles.logo, { backgroundColor: theme.primary }]}>
          <Ionicons name="paw" size={40} color="#fff" />
        </View>
        <Text style={[styles.title, { color: theme.text }]}>Timewchu</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>Live monitoring</Text>
      </Animated.View>
      <View style={styles.loader}>
        <View style={[styles.loaderDot, { backgroundColor: theme.primary }]} />
        <View style={[styles.loaderDot, { backgroundColor: theme.primaryLight }]} />
        <View style={[styles.loaderDot, { backgroundColor: theme.primary }]} />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 20,
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 6,
    letterSpacing: 0.5,
  },
  loader: {
    position: 'absolute',
    bottom: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 4,
    opacity: 0.7,
  },
});
