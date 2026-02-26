import { Platform } from 'react-native';

export interface Theme {
  background: string;
  surface: string;
  surfaceElevated: string;
  primary: string;
  primaryLight: string;
  text: string;
  textMuted: string;
  border: string;
  accent: string;
  success: string;
  error: string;
  radius: number;
  radiusSm: number;
  shadow: {
    boxShadow?: string;
    elevation?: number;
    shadowColor?: string;
    shadowOffset?: { width: number; height: number };
    shadowOpacity?: number;
    shadowRadius?: number;
  };
}

export const theme: Theme = {
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
    web: {
      boxShadow: '0 2px 8px rgba(44, 35, 25, 0.08)',
      elevation: 3,
    },
    default: {
      shadowColor: '#2c2319',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
  }) as Theme['shadow'],
};
