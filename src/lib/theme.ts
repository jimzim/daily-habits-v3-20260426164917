// Calm palette + restrained type scale per PRD §Design language.
export const colors = {
  background: '#FAFAF7',
  surface: '#FFFFFF',
  border: '#E5E2DA',
  borderStrong: '#C7C2B6',
  textPrimary: '#1B1D21',
  textSecondary: '#6B6F76',
  textDim: '#9AA0A6',
  accent: '#0E7C7B',
  accentSoft: '#0E7C7B22',
  danger: '#B91C1C',
  white: '#FFFFFF',
  scrim: 'rgba(15, 17, 21, 0.45)',
} as const;

export const type = {
  title: { fontSize: 28, fontWeight: '600' as const, lineHeight: 34 },
  body: { fontSize: 17, fontWeight: '400' as const, lineHeight: 24 },
  secondary: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  caption: { fontSize: 11, fontWeight: '500' as const, lineHeight: 14 },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
} as const;

export const radii = {
  sm: 4,
  md: 8,
  lg: 12,
  pill: 999,
} as const;

export const shadow = {
  fab: {
    shadowColor: '#000000',
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 8,
  },
  card: {
    shadowColor: '#000000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 1,
  },
} as const;

export const sizes = {
  fab: 60,
  dayCell: 18,
  touch: 44,
} as const;
