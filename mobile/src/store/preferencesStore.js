import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Preferences Store
 * Manages user preferences for language and region
 * Persists to AsyncStorage for permanent storage
 */
const usePreferencesStore = create(
  persist(
    (set, get) => ({
      // Language preference (TMDB language code)
      language: 'en-US',
      
      // Region preference (ISO 3166-1 country code)
      region: 'IN', // India by default
      
      // Set language
      setLanguage: (language) => {
        set({ language });
      },
      
      // Set region
      setRegion: (region) => {
        set({ region });
      },
      
      // Reset to defaults
      resetPreferences: () => {
        set({
          language: 'en-US',
          region: 'IN'
        });
      },
      
      // Get current preferences
      getPreferences: () => {
        const { language, region } = get();
        return { language, region };
      }
    }),
    {
      name: 'preferences-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        language: state.language,
        region: state.region
      })
    }
  )
);

export default usePreferencesStore;
