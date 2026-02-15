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
    web: {
      boxShadow: '0 2px 8px rgba(61, 52, 41, 0.06)',
      elevation: 3,
    },
    default: {
      shadowColor: '#3d3429',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 3,
    },
  }) as Theme['shadow'],
};
