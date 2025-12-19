import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useWatchlistStore = create(
  persist(
    (set, get) => ({
      items: [],
      loading: false,
      error: null,

      // Fetch watchlist (now just loads from local storage)
      fetchWatchlist: async (status = null) => {
        set({ loading: true, error: null });
        try {
          // Data is already loaded from AsyncStorage by Zustand persist
          // Just filter by status if needed
          const { items } = get();
          const filteredItems = status 
            ? items.filter(item => item.status === status)
            : items;
          
          set({ loading: false });
          return filteredItems;
        } catch (error) {
          set({ error: error.message, loading: false });
        }
      },

      // Add to watchlist (local only)
      addToWatchlist: async (tmdbId, type, mediaData = {}) => {
        try {
          const newItem = {
            _id: `${type}-${tmdbId}-${Date.now()}`, // Local ID
            tmdbId: tmdbId.toString(),
            mediaId: {
              tmdbId: tmdbId.toString(),
              type,
              title: mediaData.title || 'Unknown',
              posterPath: mediaData.posterPath || null,
            },
            status: mediaData.status || 'plan_to_watch',
            rating: null,
            notes: '',
            progress: 0,
            addedAt: new Date().toISOString(),
          };

          set(state => ({
            items: [...state.items, newItem]
          }));
          
          return { success: true, data: newItem };
        } catch (error) {
          const message = 'Failed to add to watchlist';
          set({ error: message });
          return { success: false, error: message };
        }
      },

      // Update status (local only)
      updateStatus: async (itemId, status) => {
        try {
          set(state => ({
            items: state.items.map(item =>
              item._id === itemId ? { ...item, status } : item
            )
          }));
          return { success: true };
        } catch (error) {
          set({ error: error.message });
          return { success: false };
        }
      },

      // Update rating (local only)
      updateRating: async (itemId, rating) => {
        try {
          set(state => ({
            items: state.items.map(item =>
              item._id === itemId ? { ...item, rating } : item
            )
          }));
          return { success: true };
        } catch (error) {
          set({ error: error.message });
          return { success: false };
        }
      },

      // Update notes (local only)
      updateNotes: async (itemId, notes) => {
        try {
          set(state => ({
            items: state.items.map(item =>
              item._id === itemId ? { ...item, notes } : item
            )
          }));
          return { success: true };
        } catch (error) {
          set({ error: error.message });
          return { success: false };
        }
      },

      // Update progress for TV shows (local only)
      updateProgress: async (itemId, currentSeason, currentEpisode) => {
        try {
          set(state => ({
            items: state.items.map(item =>
              item._id === itemId 
                ? { 
                    ...item, 
                    progress: { currentSeason, currentEpisode },
                    status: 'watching' // Auto-update status to watching
                  } 
                : item
            )
          }));
          return { success: true };
        } catch (error) {
          set({ error: error.message });
          return { success: false };
        }
      },

      // Remove from watchlist (local only)
      removeFromWatchlist: async (itemId) => {
        try {
          set(state => ({
            items: state.items.filter(item => item._id !== itemId)
          }));
          return { success: true };
        } catch (error) {
          set({ error: error.message });
          return { success: false };
        }
      },

      // Clear error
      clearError: () => set({ error: null })
    }),
    {
      name: 'watchlist-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ items: state.items })
    }
  )
);

export default useWatchlistStore;
