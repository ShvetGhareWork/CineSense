import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/client';

const useWatchlistStore = create(
  persist(
    (set, get) => ({
      items: [],
      loading: false,
      error: null,

      // Fetch watchlist
      fetchWatchlist: async (status = null) => {
        set({ loading: true, error: null });
        try {
          const params = status ? { status } : {};
          const response = await api.get('/watchlist', { params });
          set({ items: response.data.data, loading: false });
        } catch (error) {
          set({ error: error.message, loading: false });
        }
      },

      // Add to watchlist
      addToWatchlist: async (tmdbId, type, status = 'to_watch') => {
        try {
          const response = await api.post('/watchlist', {
            tmdbId,
            type,
            status
          });
          set(state => ({
            items: [...state.items, response.data.data]
          }));
          return { success: true, data: response.data.data };
        } catch (error) {
          const message = error.response?.data?.message || 'Failed to add to watchlist';
          set({ error: message });
          return { success: false, error: message };
        }
      },

      // Update status
      updateStatus: async (itemId, status) => {
        try {
          const response = await api.put(`/watchlist/${itemId}/status`, {
            status
          });
          set(state => ({
            items: state.items.map(item =>
              item._id === itemId ? response.data.data : item
            )
          }));
          return { success: true };
        } catch (error) {
          set({ error: error.message });
          return { success: false };
        }
      },

      // Update rating
      updateRating: async (itemId, rating) => {
        try {
          const response = await api.put(`/watchlist/${itemId}/rating`, { rating });
          set(state => ({
            items: state.items.map(item =>
              item._id === itemId ? response.data.data : item
            )
          }));
          return { success: true };
        } catch (error) {
          set({ error: error.message });
          return { success: false };
        }
      },

      // Update notes
      updateNotes: async (itemId, notes) => {
        try {
          const response = await api.put(`/watchlist/${itemId}/notes`, { notes });
          set(state => ({
            items: state.items.map(item =>
              item._id === itemId ? response.data.data : item
            )
          }));
          return { success: true };
        } catch (error) {
          set({ error: error.message });
          return { success: false };
        }
      },

      // Update progress (TV shows)
      updateProgress: async (itemId, currentSeason, currentEpisode) => {
        try {
          const response = await api.put(`/watchlist/${itemId}/progress`, {
            currentSeason,
            currentEpisode
          });
          set(state => ({
            items: state.items.map(item =>
              item._id === itemId ? response.data.data : item
            )
          }));
          return { success: true, suggestion: response.data.suggestion };
        } catch (error) {
          set({ error: error.message });
          return { success: false };
        }
      },

      // Remove from watchlist
      removeFromWatchlist: async (itemId) => {
        try {
          await api.delete(`/watchlist/${itemId}`);
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
