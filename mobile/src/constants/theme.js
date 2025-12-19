// Design System - Color Tokens
export const colors = {
  // Backgrounds (AMOLED-friendly)
  midnight: '#000000',        // Pure black
  charcoal: '#0E0E11',       // Card backgrounds
  cardDark: '#1A1A1F',       // Elevated cards
  surface: '#252529',        // Input fields
  
  // Accents
  gold: '#FFD700',           // Ratings
  goldDark: '#FFA500',
  goldDeep: '#FF8C00',
  
  purple: '#6C63FF',         // Primary actions
  purpleLight: '#8B7FFF',
  purpleDark: '#5A52E5',
  
  cyan: '#3ABEFF',           // Highlights
  cyanLight: '#5CCFFF',
  cyanDark: '#2A9EDF',
  
  amber: '#F39C12',          // Watchlist
  amberDark: '#E67E22',
  
  green: '#27AE60',          // Completed/Success
  // Backgrounds
  midnight: '#000000',
  charcoal: '#0E0E11',
  cardDark: '#1A1A1F',
  surface: '#252529',
  
  // Primary Colors
  primary: '#6C63FF',
  primaryLight: '#8B7FFF',
  primaryDark: '#5A52E5',
  
  // Accent Colors
  accent: '#3ABEFF',
  accentLight: '#5CCFFF',
  
  // Status Colors
  gold: '#FFD700',
  amber: '#F39C12',
  green: '#27AE60',
  blue: '#3498DB',
  red: '#E74C3C',
  redDark: '#C0392B',
  cyan: '#3ABEFF',
  purple: '#6C63FF',
  
  // Text Colors
  textPrimary: '#FFFFFF',
  textSecondary: '#AAAAAA',
  textTertiary: '#666666',
  
  // Borders
  border: 'rgba(255,255,255,0.1)',
  borderLight: 'rgba(255,255,255,0.05)',
  
  // Utility
  error: '#E74C3C',
  success: '#27AE60',
  warning: '#F39C12',
  info: '#3498DB',

  // Missing Brand Aliases & Status Colors
  electricPurple: '#6C63FF',
  softGrey: '#AAAAAA',
  toWatch: '#FFB703',
  inProgress: '#219EBC',
  finished: '#2EC4B6',
};

export const gradients = {
  primary: ['#6C63FF', '#3ABEFF'],
  gold: ['#FFD700', '#FFA500', '#FF8C00'],
  purple: ['#6C63FF', '#3ABEFF'],
  purpleReverse: ['#3ABEFF', '#6C63FF'],
  amber: ['#F39C12', '#E67E22'],
  green: ['#27AE60', '#229954'],
  blue: ['#3498DB', '#2980B9'],
  dark: ['rgba(0,0,0,0.8)', 'rgba(0,0,0,0.4)'],
  darkOverlay: ['rgba(0,0,0,0.9)', 'rgba(0,0,0,0.6)'],
};

export const typography = {
  // Font Families
  fonts: {
    primary: {
      regular: 'PlusJakartaSans_400Regular',
      medium: 'PlusJakartaSans_500Medium',
      semibold: 'PlusJakartaSans_600SemiBold',
      bold: 'PlusJakartaSans_700Bold',
      extraBold: 'PlusJakartaSans_800ExtraBold',
    },
    secondary: {
      regular: 'Inter_400Regular',
      medium: 'Inter_500Medium',
      semibold: 'Inter_600SemiBold',
      bold: 'Inter_700Bold',
    },
  },

  // Font Sizes
  sizes: {
    hero: 34,
    h1: 24,
    h2: 20,
    h3: 18,
    h4: 16,
    bodyLarge: 16,
    body: 14,
    metadata: 12,
    caption: 11,
    tiny: 10,
  },
  
  // Line Heights
  lineHeights: {
    hero: 40,
    h1: 30,
    h2: 26,
    h3: 24,
    h4: 22,
    body: 20,
    caption: 16,
    tiny: 14,
  },

  // Letter Spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
    extraWide: 1,
  },

  // Presets / Variants (Using System Fonts)
  hero: {
    fontSize: 34,
    fontWeight: '700',
    lineHeight: 40,
    letterSpacing: -0.5,
    color: '#F8F9FA',
  },
  h1: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 30,
    letterSpacing: 0.5,
    color: '#F8F9FA',
  },
  h2: {
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 26,
    letterSpacing: 0,
    color: '#F8F9FA',
  },
  h3: {
    fontSize: 18,
    fontWeight: '600',
    lineHeight: 24,
    letterSpacing: 0,
    color: '#F8F9FA',
  },
  h4: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
    letterSpacing: 0,
    color: '#F8F9FA',
  },
  h5: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
    letterSpacing: 0,
    color: '#F8F9FA',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
    letterSpacing: 0,
    color: '#F8F9FA',
  },
  body: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
    letterSpacing: 0,
    color: '#CED4DA',
  },
  small: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
    letterSpacing: 0,
    color: '#ADB5BD',
  },
  metadata: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
    letterSpacing: 0.2,
    color: '#ADB5BD',
  },
  caption: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 14,
    letterSpacing: 0.5,
    color: '#6C757D',
  },
  tiny: {
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 12,
    letterSpacing: 0.5,
    color: '#6C757D',
  },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  massive: 48,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  full: 9999,
};

export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 8,
  },
  glow: {
    shadowColor: '#6C63FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 5,
  },
};

export const motion = {
  // Durations (ms)
  instant: 100,
  fast: 200,
  normal: 300,
  slow: 500,
  verySlow: 1000,
  
  // Easing
  easeIn: 'ease-in',
  easeOut: 'ease-out',
  easeInOut: 'ease-in-out',
  
  // Spring configs
  spring: {
    damping: 15,
    stiffness: 150,
  },
  springBouncy: {
    damping: 10,
    stiffness: 100,
  },
};

export const layout = {
  screenPadding: spacing.xl,
  cardGap: spacing.md,
  sectionGap: spacing.xxxl,
  
  // Poster dimensions
  posterWidth: {
    small: 100,
    medium: 150,
    large: 200,
  },
  posterAspectRatio: 2 / 3, // Standard movie poster ratio
};

// Helper function to get dynamic theme colors
export const getThemeColors = (themeStore) => {
  if (themeStore?.currentTheme?.colors) {
    return themeStore.currentTheme.colors;
  }
  return colors;
};

export const getThemeGradients = (themeStore) => {
  if (themeStore?.currentTheme?.gradients) {
    return themeStore.currentTheme.gradients;
  }
  return gradients;
};

export default {
  colors,
  gradients,
  typography,
  spacing,
  borderRadius,
  shadows,
  motion,
  layout,
  getThemeColors,
  getThemeGradients,
};
