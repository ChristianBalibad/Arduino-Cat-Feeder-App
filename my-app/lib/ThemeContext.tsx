import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import type { Theme } from './theme';

const STORAGE_KEY = '@cat_feeder_theme';

type ThemeMode = 'light' | 'dark';

const lightTheme: Theme = {
  background: '#faf8f5',
  surface: '#fffbf7',
  surfaceElevated: '#ffffff',
  primary: '#c45c26',
  primaryLight: '#e07d3a',
  text: '#2d2319',
  textMuted: '#7d6b5a',
  border: '#eadfd5',
  accent: '#c45c26',
  success: '#34c759',
  error: '#dc2626',
  radius: 20,
  radiusSm: 12,
  shadow: Platform.select({
    web: { boxShadow: '0 2px 8px rgba(44, 35, 25, 0.08)', elevation: 3 },
    default: { shadowColor: '#2c2319', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  }) as Theme['shadow'],
};

const darkTheme: Theme = {
  background: '#1a1612',
  surface: '#2d251f',
  surfaceElevated: '#3d3229',
  primary: '#e07d3a',
  primaryLight: '#f0a060',
  text: '#f5f0e8',
  textMuted: '#a89888',
  border: '#3d3229',
  accent: '#f0a060',
  success: '#30d158',
  error: '#ef4444',
  radius: 20,
  radiusSm: 12,
  shadow: Platform.select({
    web: { boxShadow: '0 2px 8px rgba(0, 0, 0, 0.4)', elevation: 3 },
    default: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 3 },
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
