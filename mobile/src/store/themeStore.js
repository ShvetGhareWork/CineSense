import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Define 3 popular themes
export const THEMES = {
  MIDNIGHT: {
    id: 'midnight',
    name: 'Midnight Purple',
    description: 'Dark AMOLED with purple accents',
    colors: {
      midnight: '#000000',
      charcoal: '#0E0E11',
      cardDark: '#1A1A1F',
      surface: '#252529',
      
      primary: '#6C63FF',
      primaryLight: '#8B7FFF',
      primaryDark: '#5A52E5',
      
      accent: '#3ABEFF',
      accentLight: '#5CCFFF',
      
      gold: '#FFD700',
      amber: '#F39C12',
      green: '#27AE60',
      blue: '#3498DB',
      red: '#E74C3C',
      cyan: '#3ABEFF',
      purple: '#6C63FF',
      
      textPrimary: '#FFFFFF',
      textSecondary: '#AAAAAA',
      textTertiary: '#666666',
      
      border: 'rgba(255,255,255,0.1)',
      borderLight: 'rgba(255,255,255,0.05)',
    },
    gradients: {
      primary: ['#6C63FF', '#3ABEFF'],
      gold: ['#FFD700', '#FFA500', '#FF8C00'],
      purple: ['#6C63FF', '#3ABEFF'],
      amber: ['#F39C12', '#E67E22'],
      green: ['#27AE60', '#229954'],
      blue: ['#3498DB', '#2980B9'],
    },
  },
  
  OCEAN: {
    id: 'ocean',
    name: 'Ocean Blue',
    description: 'Deep blue with cyan highlights',
    colors: {
      midnight: '#0A1929',
      charcoal: '#132F4C',
      cardDark: '#1E3A5F',
      surface: '#2A4A6F',
      
      primary: '#0EA5E9',
      primaryLight: '#38BDF8',
      primaryDark: '#0284C7',
      
      accent: '#06B6D4',
      accentLight: '#22D3EE',
      
      gold: '#FFD700',
      amber: '#F59E0B',
      green: '#10B981',
      blue: '#0EA5E9',
      red: '#EF4444',
      cyan: '#06B6D4',
      purple: '#8B5CF6',
      
      textPrimary: '#F1F5F9',
      textSecondary: '#94A3B8',
      textTertiary: '#64748B',
      
      border: 'rgba(241,245,249,0.1)',
      borderLight: 'rgba(241,245,249,0.05)',
    },
    gradients: {
      primary: ['#0EA5E9', '#06B6D4'],
      gold: ['#FFD700', '#F59E0B'],
      purple: ['#8B5CF6', '#06B6D4'],
      amber: ['#F59E0B', '#D97706'],
      green: ['#10B981', '#059669'],
      blue: ['#0EA5E9', '#0284C7'],
    },
  },
  
  SUNSET: {
    id: 'sunset',
    name: 'Sunset Orange',
    description: 'Warm dark with orange accents',
    colors: {
      midnight: '#1A0F0A',
      charcoal: '#2D1810',
      cardDark: '#3D2418',
      surface: '#4D3020',
      
      primary: '#F97316',
      primaryLight: '#FB923C',
      primaryDark: '#EA580C',
      
      accent: '#FBBF24',
      accentLight: '#FCD34D',
      
      gold: '#FFD700',
      amber: '#F59E0B',
      green: '#22C55E',
      blue: '#3B82F6',
      red: '#DC2626',
      cyan: '#14B8A6',
      purple: '#A855F7',
      
      textPrimary: '#FEF3C7',
      textSecondary: '#D4A574',
      textTertiary: '#A78B6A',
      
      border: 'rgba(254,243,199,0.1)',
      borderLight: 'rgba(254,243,199,0.05)',
    },
    gradients: {
      primary: ['#F97316', '#FBBF24'],
      gold: ['#FFD700', '#F59E0B'],
      purple: ['#A855F7', '#F97316'],
      amber: ['#F59E0B', '#D97706'],
      green: ['#22C55E', '#16A34A'],
      blue: ['#3B82F6', '#2563EB'],
    },
  },
};

const useThemeStore = create((set, get) => ({
  currentTheme: THEMES.MIDNIGHT,
  
  // Load theme from storage
  loadTheme: async () => {
    try {
      const savedThemeId = await AsyncStorage.getItem('selectedTheme');
      if (savedThemeId && THEMES[savedThemeId.toUpperCase()]) {
        set({ currentTheme: THEMES[savedThemeId.toUpperCase()] });
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
    }
  },
  
  // Set theme
  setTheme: async (themeId) => {
    const theme = THEMES[themeId.toUpperCase()];
    if (theme) {
      set({ currentTheme: theme });
      try {
        await AsyncStorage.setItem('selectedTheme', themeId);
      } catch (error) {
        console.error('Failed to save theme:', error);
      }
    }
  },
  
  // Get current colors
  getColors: () => get().currentTheme.colors,
  
  // Get current gradients
  getGradients: () => get().currentTheme.gradients,
}));

export default useThemeStore;
