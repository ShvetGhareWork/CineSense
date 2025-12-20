import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import logger from '../utils/logger';
import apiCache, { CACHE_TTL } from '../utils/apiCache';

// ✅ Environment-based API URL configuration
// __DEV__ is automatically set by React Native (true in debug, false in release)
// 
// 📱 IMPORTANT: Update the IP address based on your setup:
// - Android Emulator (Android Studio): use '10.0.2.2:5000'
// - Physical Device / Expo Go: use your computer's local IP (run 'ipconfig' to find it)
//   Example: '192.168.1.100:5000' (replace with YOUR computer's IP)
// - iOS Simulator: use 'localhost:5000'
// 
// 🔥 TEMPORARY: Using production API due to local network/firewall issues
// To use local backend: Fix Windows Firewall and change back to local IP
const API_URL = 'https://cinesense-xln2.onrender.com/api';  // Using production API temporarily
// const API_URL = __DEV__ 
//   ? 'http://192.168.0.102:5000/api'  // Development: local backend (UPDATE THIS IP!)
//   : 'https://cinesense-xln2.onrender.com/api';  // Production: deployed backend

logger.info(`API Client initialized with URL: ${API_URL} (${__DEV__ ? 'DEVELOPMENT' : 'PRODUCTION'} mode)`);

// Create axios instance with proper configuration
const api = axios.create({
  baseURL: API_URL,
  timeout: 15000, // 15 second timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'User-Agent': 'CineSense-Mobile/1.0',
  }
});

// Request interceptor: Add JWT token and logging
api.interceptors.request.use(
  async (config) => {
    try {
      // Add authorization token if available
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Log request (sanitized)
      logger.apiRequest(config.method?.toUpperCase(), config.url, config.data);

      return config;
    } catch (error) {
      logger.error('Request interceptor error:', error);
      return Promise.reject(error);
    }
  },
  (error) => {
    logger.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor: Handle errors and caching
api.interceptors.response.use(
  (response) => {
    // Log successful response
    logger.apiResponse(
      response.config.method?.toUpperCase(),
      response.config.url,
      response.status,
      response.data
    );

    return response;
  },
  async (error) => {
    const { config, response } = error;

    // Log API error
    logger.apiError(
      config?.method?.toUpperCase(),
      config?.url,
      error
    );

    // Handle specific error codes
    if (response) {
      switch (response.status) {
        case 401:
          // Unauthorized - token expired or invalid
          logger.warn('401 Unauthorized - Clearing auth token');
          await AsyncStorage.removeItem('authToken');
          // You can navigate to login screen here if needed
          // navigationRef.current?.navigate('Login');
          break;

        case 403:
          // Forbidden - user doesn't have permission
          logger.warn('403 Forbidden - Access denied');
          error.userMessage = 'You do not have permission to access this resource';
          break;

        case 429:
          // Too many requests - rate limited
          logger.warn('429 Too Many Requests - Rate limited');
          error.userMessage = 'Too many requests. Please try again later.';
          break;

        case 500:
        case 502:
        case 503:
        case 504:
          // Server errors
          logger.error(`${response.status} Server Error`);
          error.userMessage = 'Server is currently unavailable. Please try again later.';
          break;

        default:
          error.userMessage = response.data?.message || 'An error occurred. Please try again.';
      }
    } else if (error.code === 'ECONNABORTED') {
      // Request timeout
      logger.error('Request timeout');
      error.userMessage = 'Request timed out. Please check your internet connection.';
    } else if (error.message === 'Network Error') {
      // Network error - no internet connection
      logger.error('Network error - no internet connection');
      error.userMessage = 'No internet connection. Please check your network.';
      error.isNetworkError = true;
    } else {
      // Unknown error
      logger.error('Unknown error:', error);
      error.userMessage = 'An unexpected error occurred. Please try again.';
    }

    return Promise.reject(error);
  }
);

/**
 * Enhanced GET request with caching support
 */
api.getCached = async (url, options = {}) => {
  const { 
    useCache = true, 
    cacheTTL = CACHE_TTL.MEDIUM,
    ...axiosOptions 
  } = options;

  // Generate cache key
  const cacheKey = `${url}${JSON.stringify(axiosOptions.params || {})}`;

  // Try to get from cache first
  if (useCache) {
    const cached = apiCache.get(cacheKey);
    if (cached) {
      logger.debug(`Returning cached data for: ${url}`);
      return { data: cached, fromCache: true };
    }
  }

  try {
    // Make API request
    const response = await api.get(url, axiosOptions);

    // Cache the response
    if (useCache && response.data) {
      apiCache.set(cacheKey, response.data, cacheTTL);
    }

    return { ...response, fromCache: false };
  } catch (error) {
    // If network error and we have old cache, return it
    if (error.isNetworkError) {
      const staleCache = apiCache.get(cacheKey);
      if (staleCache) {
        logger.info(`Returning stale cache for: ${url} (offline mode)`);
        return { data: staleCache, fromCache: true, isStale: true };
      }
    }
    throw error;
  }
};

/**
 * Retry failed requests with exponential backoff
 */
api.retryRequest = async (requestFn, maxRetries = 3, baseDelay = 1000) => {
  let lastError;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;

      // Don't retry on client errors (4xx) except 429
      if (error.response?.status >= 400 && error.response?.status < 500 && error.response?.status !== 429) {
        throw error;
      }

      // Don't retry if no more attempts left
      if (attempt === maxRetries - 1) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = baseDelay * Math.pow(2, attempt);
      logger.warn(`Request failed, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

/**
 * Check if API is reachable
 */
api.healthCheck = async () => {
  try {
    const response = await axios.get(`${API_URL}/health`, { timeout: 5000 });
    logger.info('API health check: OK');
    return true;
  } catch (error) {
    logger.error('API health check: FAILED', error);
    return false;
  }
};

export default api;
