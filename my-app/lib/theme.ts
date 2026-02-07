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
  background: '#f8f4ef',
  surface: '#fffcf7',
  surfaceElevated: '#ffffff',
  primary: '#b8864a',
  primaryLight: '#d4a574',
  text: '#3d3429',
  textMuted: '#7d7268',
  border: '#e8e0d5',
  accent: '#8f7355',
  success: '#6b8f71',
  error: '#b85450',
  radius: 16,
  radiusSm: 10,
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
