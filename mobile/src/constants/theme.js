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
  // Font Sizes
  hero: 32,
  h1: 28,
  h2: 24,
  h3: 20,
  h4: 18,
  h5: 16,
  body: 14,
  caption: 12,
  small: 11,
  tiny: 9,
  
  // Font Weights
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  black: '900',
  
  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
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
