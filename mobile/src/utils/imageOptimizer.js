import { Dimensions } from 'react-native';

/**
 * TMDB Image Optimization Utility
 * Provides optimal image sizes based on screen dimensions
 * Reduces bandwidth and improves performance
 */

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Get optimal poster size
 * Available sizes: w92, w154, w185, w342, w500, w780, original
 */
export const getOptimalPosterSize = () => {
  if (SCREEN_WIDTH < 400) return 'w185';
  if (SCREEN_WIDTH < 800) return 'w342';
  return 'w500';
};

/**
 * Get optimal backdrop size
 * Available sizes: w300, w780, w1280, original
 */
export const getOptimalBackdropSize = () => {
  if (SCREEN_WIDTH < 800) return 'w780';
  return 'w1280';
};

/**
 * Get optimal profile size (for person images)
 * Available sizes: w45, w185, h632, original
 */
export const getOptimalProfileSize = () => {
  return 'w185';
};

/**
 * Get optimal logo size (for watch providers)
 * Available sizes: w45, w92, w154, w185, w300, w500, original
 */
export const getOptimalLogoSize = () => {
  return 'w92';
};

/**
 * Build full image URL with optimal size
 */
export const buildImageUrl = (path, type = 'poster') => {
  if (!path) return null;
  
  const baseUrl = 'https://image.tmdb.org/t/p';
  let size;
  
  switch (type) {
    case 'poster':
      size = getOptimalPosterSize();
      break;
    case 'backdrop':
      size = getOptimalBackdropSize();
      break;
    case 'profile':
      size = getOptimalProfileSize();
      break;
    case 'logo':
      size = getOptimalLogoSize();
      break;
    default:
      size = 'w500';
  }
  
  return `${baseUrl}/${size}${path}`;
};

export default {
  getOptimalPosterSize,
  getOptimalBackdropSize,
  getOptimalProfileSize,
  getOptimalLogoSize,
  buildImageUrl
};
