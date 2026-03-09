import { Platform } from 'react-native';

export const colors = {
  primary: '#4F6EF7',
  success: '#22C55E',
  danger: '#EF4444',
  warning: '#F59E0B',
  background: '#F8F9FA',
  surface: '#FFFFFF',
  text: '#111827',
  muted: '#9CA3AF',
  border: '#E5E7EB',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 32,
};

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
};

export const typography = {
  h1: { fontSize: 26, fontWeight: '700' as const },
  h2: { fontSize: 20, fontWeight: '700' as const },
  h3: { fontSize: 17, fontWeight: '600' as const },
  body: { fontSize: 15, fontWeight: '400' as const },
  label: {
    fontSize: 12,
    fontWeight: '600' as const,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.5,
  },
  mono: {
    fontSize: 15,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
};
