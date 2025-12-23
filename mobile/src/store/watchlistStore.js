import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useWatchlistStore = create(
  persist(
    (set, get) => ({
      items: [],
      favorites: [], // NEW: Separate favorites list
      loading: false,
      error: null,
      hasHydrated: false, // Track if data has been loaded from AsyncStorage

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
          console.log(`📝 Adding to watchlist: ${mediaData.title || tmdbId} (${type})`);
          const newItem = {
            _id: `${type}-${tmdbId}-${Date.now()}`, // Local ID
            tmdbId: tmdbId.toString(),
            mediaId: {
              tmdbId: tmdbId.toString(),
              type,
              title: mediaData.title || 'Unknown',
              posterPath: mediaData.posterPath || null,
            },
            status: mediaData.status || 'to_watch', // FIXED: Changed from 'plan_to_watch' to 'to_watch'
            rating: null,
            notes: '',
            progress: 0,
            addedAt: new Date().toISOString(),
          };

          set(state => ({
            items: [...state.items, newItem]
          }));
          
          console.log(`✅ Added to watchlist. Total items: ${get().items.length}`);
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
          console.log(`🗑️ Removing from watchlist: ${itemId}`);
          set(state => ({
            items: state.items.filter(item => item._id !== itemId)
          }));
          console.log(`✅ Removed from watchlist. Total items: ${get().items.length}`);
          return { success: true };
        } catch (error) {
          set({ error: error.message });
          return { success: false };
        }
      },

      // NEW: Toggle favorite
      toggleFavorite: async (tmdbId, type, mediaData = {}) => {
        try {
          const { favorites } = get();
          const existingIndex = favorites.findIndex(fav => fav.tmdbId === tmdbId.toString());

          if (existingIndex >= 0) {
            // Remove from favorites
            set(state => ({
              favorites: state.favorites.filter(fav => fav.tmdbId !== tmdbId.toString())
            }));
            return { success: true, isFavorite: false };
          } else {
            // Add to favorites
            const newFavorite = {
              _id: `fav-${type}-${tmdbId}-${Date.now()}`,
              tmdbId: tmdbId.toString(),
              mediaId: {
                tmdbId: tmdbId.toString(),
                type,
                title: mediaData.title || 'Unknown',
                posterPath: mediaData.posterPath || null,
                voteAverage: mediaData.voteAverage || null,
              },
              addedAt: new Date().toISOString(),
            };

            set(state => ({
              favorites: [...state.favorites, newFavorite]
            }));
            return { success: true, isFavorite: true };
          }
        } catch (error) {
          set({ error: error.message });
          return { success: false };
        }
      },

      // NEW: Check if item is favorited
      isFavorite: (tmdbId) => {
        const { favorites } = get();
        return favorites.some(fav => fav.tmdbId === tmdbId.toString());
      },

      // NEW: Remove from favorites
      removeFavorite: async (favoriteId) => {
        try {
          set(state => ({
            favorites: state.favorites.filter(fav => fav._id !== favoriteId)
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
      partialize: (state) => ({ items: state.items, favorites: state.favorites }), // Persist favorites too
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('❌ Watchlist rehydration failed:', error);
        } else {
          const itemCount = state?.items?.length || 0;
          const favCount = state?.favorites?.length || 0;
          console.log(`✅ Watchlist rehydrated: ${itemCount} items, ${favCount} favorites`);
          if (state) {
            state.hasHydrated = true;
          }
        }
      }
    }
  )
);

export default useWatchlistStore;
