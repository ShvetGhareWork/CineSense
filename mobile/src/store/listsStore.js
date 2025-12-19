import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/client';

const useListsStore = create(
  persist(
    (set, get) => ({
      lists: [],
      loading: false,
      error: null,

      // Fetch user's lists
      fetchLists: async () => {
        set({ loading: true, error: null });
        try {
          const response = await api.get('/lists');
          set({ lists: response.data.data, loading: false });
        } catch (error) {
          set({ error: error.message, loading: false });
        }
      },

      // Create list
      createList: async (name, description, icon, color, isPublic) => {
        try {
          const response = await api.post('/lists', {
            name,
            description,
            icon,
            color,
            isPublic
          });
          set(state => ({
            lists: [...state.lists, response.data.data]
          }));
          return { success: true, data: response.data.data };
        } catch (error) {
          const message = error.response?.data?.message || 'Failed to create list';
          set({ error: message });
          return { success: false, error: message };
        }
      },

      // Update list
      updateList: async (listId, updates) => {
        try {
          const response = await api.put(`/lists/${listId}`, updates);
          set(state => ({
            lists: state.lists.map(list =>
              list._id === listId ? response.data.data : list
            )
          }));
          return { success: true };
        } catch (error) {
          set({ error: error.message });
          return { success: false };
        }
      },

      // Delete list
      deleteList: async (listId) => {
        try {
          await api.delete(`/lists/${listId}`);
          set(state => ({
            lists: state.lists.filter(list => list._id !== listId)
          }));
          return { success: true };
        } catch (error) {
          set({ error: error.message });
          return { success: false };
        }
      },

      // Add item to list
      addItemToList: async (listId, itemId) => {
        try {
          const response = await api.post(`/lists/${listId}/items`, { itemId });
          set(state => ({
            lists: state.lists.map(list =>
              list._id === listId ? response.data.data : list
            )
          }));
          return { success: true };
        } catch (error) {
          set({ error: error.message });
          return { success: false };
        }
      },

      // Remove item from list
      removeItemFromList: async (listId, itemId) => {
        try {
          const response = await api.delete(`/lists/${listId}/items/${itemId}`);
          set(state => ({
            lists: state.lists.map(list =>
              list._id === listId ? response.data.data : list
            )
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
      name: 'lists-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ lists: state.lists })
    }
  )
);

export default useListsStore;
