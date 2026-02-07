import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { theme } from '../lib/theme';

export default function SplashScreen() {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [opacity]);

  return (
    <Animated.View style={[styles.container, { backgroundColor: theme.background, opacity }]}>
      <View style={styles.content}>
        <View style={[styles.logo, { backgroundColor: theme.primary }]} />
        <Text style={[styles.title, { color: theme.text }]}>Cat Feeder</Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>Analytics</Text>
      </View>
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
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    marginTop: 6,
    letterSpacing: 1,
  },
  loader: {
    position: 'absolute',
    bottom: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loaderDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    opacity: 0.8,
  },
});
