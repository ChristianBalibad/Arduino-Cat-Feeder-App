import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import type { Theme } from './theme';

const STORAGE_KEY = '@cat_feeder_theme';

type ThemeMode = 'light' | 'dark';

const lightTheme: Theme = {
  background: '#f5f5f7',
  surface: '#ffffff',
  surfaceElevated: '#ffffff',
  primary: '#2c5f4f',
  primaryLight: '#3d7a68',
  text: '#1d1d1f',
  textMuted: '#86868b',
  border: '#e5e5ea',
  accent: '#2c5f4f',
  success: '#34c759',
  error: '#ff3b30',
  radius: 20,
  radiusSm: 12,
  shadow: Platform.select({
    web: { boxShadow: '0 2px 8px rgba(61, 52, 41, 0.06)', elevation: 3 },
    default: { shadowColor: '#3d3429', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  }) as Theme['shadow'],
};

const darkTheme: Theme = {
  background: '#1c1c1e',
  surface: '#2c2c2e',
  surfaceElevated: '#3a3a3c',
  primary: '#3d7a68',
  primaryLight: '#4d9a82',
  text: '#f5f5f7',
  textMuted: '#98989f',
  border: '#3a3a3c',
  accent: '#4d9a82',
  success: '#30d158',
  error: '#ff453a',
  radius: 20,
  radiusSm: 12,
  shadow: Platform.select({
    web: { boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)', elevation: 3 },
    default: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 3 },
  }) as Theme['shadow'],
};

type ThemeContextValue = {
  theme: Theme;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('light');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved === 'light' || saved === 'dark') setModeState(saved);
    });
  }, []);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    AsyncStorage.setItem(STORAGE_KEY, m);
  }, []);

  const theme = mode === 'dark' ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, mode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
