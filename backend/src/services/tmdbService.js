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
}

module.exports = new TMDbService();
