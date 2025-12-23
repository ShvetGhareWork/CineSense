const axios = require('axios');
const NodeCache = require('node-cache');

class TMDbService {
  constructor() {
    this.apiKey = process.env.TMDB_API_KEY;
    this.baseURL = 'https://api.themoviedb.org/3';
    this.imageBaseURL = 'https://image.tmdb.org/t/p';
    this.cache = new NodeCache({ stdTTL: 300 }); // 5 min cache
  }

  async searchMulti(query, page = 1) {
    const cacheKey = `search:${query}:${page}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const response = await axios.get(`${this.baseURL}/search/multi`, {
      params: {
        api_key: this.apiKey,
        query,
        page,
        include_adult: false
      }
    });

    this.cache.set(cacheKey, response.data);
    return response.data;
  }

  async getTrending(mediaType = 'all', timeWindow = 'week', page = 1) {
    const cacheKey = `trending:${mediaType}:${timeWindow}:${page}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const response = await axios.get(
      `${this.baseURL}/trending/${mediaType}/${timeWindow}`,
      {
        params: { api_key: this.apiKey, page }
      }
    );

    this.cache.set(cacheKey, response.data);
    return response.data;
  }

  async getDetails(mediaType, tmdbId) {
    const cacheKey = `details:${mediaType}:${tmdbId}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const endpoint = mediaType === 'movie' ? 'movie' : 'tv';
    const response = await axios.get(`${this.baseURL}/${endpoint}/${tmdbId}`, {
      params: {
        api_key: this.apiKey,
        append_to_response: 'credits,videos,images,external_ids'
      }
    });

    this.cache.set(cacheKey, response.data);
    return response.data;
  }

  async getRecommendations(mediaType, tmdbId, page = 1) {
    const endpoint = mediaType === 'movie' ? 'movie' : 'tv';
    const response = await axios.get(
      `${this.baseURL}/${endpoint}/${tmdbId}/recommendations`,
      {
        params: { api_key: this.apiKey, page }
      }
    );

    return response.data;
  }

  async getSimilar(mediaType, tmdbId, page = 1) {
    const endpoint = mediaType === 'movie' ? 'movie' : 'tv';
    const response = await axios.get(
      `${this.baseURL}/${endpoint}/${tmdbId}/similar`,
      {
        params: { api_key: this.apiKey, page }
      }
    );

    return response.data;
  }

  async getWatchProviders(mediaType, tmdbId) {
    const endpoint = mediaType === 'movie' ? 'movie' : 'tv';
    const response = await axios.get(
      `${this.baseURL}/${endpoint}/${tmdbId}/watch/providers`,
      {
        params: { api_key: this.apiKey }
      }
    );

    return response.data.results;
  }

  async getGenres(mediaType) {
    const cacheKey = `genres:${mediaType}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const endpoint = mediaType === 'movie' ? 'genre/movie/list' : 'genre/tv/list';
    const response = await axios.get(`${this.baseURL}/${endpoint}`, {
      params: { api_key: this.apiKey }
    });

    this.cache.set(cacheKey, response.data.genres);
    return response.data.genres;
  }

  async getCredits(mediaType, tmdbId) {
    const cacheKey = `credits:${mediaType}:${tmdbId}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const endpoint = mediaType === 'movie' ? 'movie' : 'tv';
    const response = await axios.get(`${this.baseURL}/${endpoint}/${tmdbId}/credits`, {
      params: { api_key: this.apiKey }
    });

    this.cache.set(cacheKey, response.data);
    return response.data;
  }

  async getSeasonDetails(tvId, seasonNumber) {
    const cacheKey = `season:${tvId}:${seasonNumber}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const response = await axios.get(
      `${this.baseURL}/tv/${tvId}/season/${seasonNumber}`,
      {
        params: { api_key: this.apiKey }
      }
    );

    this.cache.set(cacheKey, response.data);
    return response.data;
  }

  async discover(mediaType, filters = {}) {
    const endpoint = mediaType === 'movie' ? 'discover/movie' : 'discover/tv';
    const response = await axios.get(`${this.baseURL}/${endpoint}`, {
      params: {
        api_key: this.apiKey,
        ...filters
      }
    });

    return response.data;
  }

  getImageURL(path, size = 'w500') {
    if (!path) return null;
    return `${this.imageBaseURL}/${size}${path}`;
  }

  // ========================================
  // PERSON ENDPOINTS
  // ========================================

  async getPerson(personId) {
    const cacheKey = `person:${personId}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const response = await axios.get(`${this.baseURL}/person/${personId}`, {
      params: { api_key: this.apiKey }
    });

    this.cache.set(cacheKey, response.data);
    return response.data;
  }

  async getPersonCredits(personId) {
    const cacheKey = `person_credits:${personId}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const response = await axios.get(
      `${this.baseURL}/person/${personId}/combined_credits`,
      {
        params: { api_key: this.apiKey }
      }
    );

    this.cache.set(cacheKey, response.data);
    return response.data;
  }

  // ========================================
  // VIDEO ENDPOINTS
  // ========================================

  async getVideos(mediaType, tmdbId) {
    const cacheKey = `videos:${mediaType}:${tmdbId}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const endpoint = mediaType === 'movie' ? 'movie' : 'tv';
    const response = await axios.get(`${this.baseURL}/${endpoint}/${tmdbId}/videos`, {
      params: { api_key: this.apiKey }
    });

    // Prioritize official YouTube trailers
    const videos = response.data.results || [];
    const sortedVideos = videos.sort((a, b) => {
      // Official trailers first
      if (a.official && !b.official) return -1;
      if (!a.official && b.official) return 1;
      
      // YouTube first
      if (a.site === 'YouTube' && b.site !== 'YouTube') return -1;
      if (a.site !== 'YouTube' && b.site === 'YouTube') return 1;
      
      // Trailers before other types
      if (a.type === 'Trailer' && b.type !== 'Trailer') return -1;
      if (a.type !== 'Trailer' && b.type === 'Trailer') return 1;
      
      return 0;
    });

    const result = { ...response.data, results: sortedVideos };
    this.cache.set(cacheKey, result);
    return result;
  }

  // ========================================
  // REVIEW ENDPOINTS
  // ========================================

  async getReviews(mediaType, tmdbId, page = 1) {
    const cacheKey = `reviews:${mediaType}:${tmdbId}:${page}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const endpoint = mediaType === 'movie' ? 'movie' : 'tv';
    const response = await axios.get(`${this.baseURL}/${endpoint}/${tmdbId}/reviews`, {
      params: {
        api_key: this.apiKey,
        page
      }
    });

    this.cache.set(cacheKey, response.data);
    return response.data;
  }

  // ========================================
  // ENHANCED EXISTING METHODS WITH CACHING
  // ========================================

  // Enhanced getRecommendations with caching (already existed but without cache)
  async getRecommendationsEnhanced(mediaType, tmdbId, page = 1) {
    const cacheKey = `recommendations:${mediaType}:${tmdbId}:${page}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const endpoint = mediaType === 'movie' ? 'movie' : 'tv';
    const response = await axios.get(
      `${this.baseURL}/${endpoint}/${tmdbId}/recommendations`,
      {
        params: { api_key: this.apiKey, page }
      }
    );

    this.cache.set(cacheKey, response.data);
    return response.data;
  }

  // Enhanced getSimilar with caching (already existed but without cache)
  async getSimilarEnhanced(mediaType, tmdbId, page = 1) {
    const cacheKey = `similar:${mediaType}:${tmdbId}:${page}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const endpoint = mediaType === 'movie' ? 'movie' : 'tv';
    const response = await axios.get(
      `${this.baseURL}/${endpoint}/${tmdbId}/similar`,
      {
        params: { api_key: this.apiKey, page }
      }
    );

    this.cache.set(cacheKey, response.data);
    return response.data;
  }

  // Enhanced getWatchProviders with caching (already existed but without cache)
  async getWatchProvidersEnhanced(mediaType, tmdbId, region = 'IN') {
    const cacheKey = `providers:${mediaType}:${tmdbId}:${region}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;

    const endpoint = mediaType === 'movie' ? 'movie' : 'tv';
    const response = await axios.get(
      `${this.baseURL}/${endpoint}/${tmdbId}/watch/providers`,
      {
        params: { api_key: this.apiKey }
      }
    );

    // Filter by region
    const regionData = response.data.results?.[region] || null;
    this.cache.set(cacheKey, regionData);
    return regionData;
  }

  // ========================================
  // UTILITY METHODS
  // ========================================

  // Deduplicate results based on tmdbId
  deduplicateResults(recommendations, similar, watchlistIds = []) {
    const seen = new Set(watchlistIds);
    const combined = [];

    // Add recommendations first
    for (const item of recommendations) {
      const id = item.id || item.tmdbId;
      if (!seen.has(id)) {
        seen.add(id);
        combined.push({ ...item, source: 'recommendation' });
      }
    }

    // Add similar items
    for (const item of similar) {
      const id = item.id || item.tmdbId;
      if (!seen.has(id)) {
        seen.add(id);
        combined.push({ ...item, source: 'similar' });
      }
    }

    return combined;
  }
}

module.exports = new TMDbService();
