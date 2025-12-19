import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️ UPDATED: Using your computer's IP address
// Your IP addresses found: 192.168.195.173, 192.168.0.102
// Using: 192.168.0.102 (most common for home networks)
const API_URL = __DEV__ 
  ? 'http://192.168.0.102:5000/api'  // ✅ Updated with your IP
  : 'https://your-production-api.com/api';  // Production

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor: Add JWT token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, logout user
      await AsyncStorage.removeItem('authToken');
      // You can navigate to login screen here
    }
    return Promise.reject(error);
  }
);

export default api;
