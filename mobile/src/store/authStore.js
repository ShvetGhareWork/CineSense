import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../api/client';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      loading: false,
      error: null,

      // Register
      register: async (email, password, displayName) => {
        set({ loading: true, error: null });
        try {
          const response = await api.post('/auth/register', {
            email,
            password,
            displayName
          });
          
          const { user, token } = response.data.data;
          
          // Save token
          await AsyncStorage.setItem('authToken', token);
          
          set({ user, token, loading: false });
          return { success: true };
        } catch (error) {
          const message = error.response?.data?.message || 'Registration failed';
          set({ error: message, loading: false });
          return { success: false, error: message };
        }
      },

      // Login
      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const response = await api.post('/auth/login', {
            email,
            password
          });
          
          const { user, token } = response.data.data;
          
          // Save token
          await AsyncStorage.setItem('authToken', token);
          
          set({ user, token, loading: false });
          return { success: true };
        } catch (error) {
          const message = error.response?.data?.message || 'Login failed';
          set({ error: message, loading: false });
          return { success: false, error: message };
        }
      },

      // Logout
      logout: async () => {
        await AsyncStorage.removeItem('authToken');
        set({ user: null, token: null });
      },

      // Get current user
      getMe: async () => {
        try {
          const response = await api.get('/auth/me');
          set({ user: response.data.data });
        } catch (error) {
          console.error('Get me error:', error);
        }
      },

      // Update profile
      updateProfile: async (data) => {
        try {
          const response = await api.put('/auth/profile', data);
          set({ user: response.data.data });
          return { success: true };
        } catch (error) {
          return { success: false, error: error.response?.data?.message };
        }
      },

      // Clear error
      clearError: () => set({ error: null })
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useAuthStore;
