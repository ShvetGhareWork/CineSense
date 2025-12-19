const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;

    if (!this.apiKey) {
      console.warn('⚠️ GEMINI_API_KEY not set. AI features disabled.');
      this.genAI = null;
      this.model = null;
      return;
    }

    try {
      this.genAI = new GoogleGenerativeAI(this.apiKey);

      // ✅ ONLY WORKING FREE-TIER MODEL (2025)
      this.model = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
      });

      console.log('✅ Gemini initialized with gemini-1.5-flash (free tier)');
    } catch (error) {
      console.error('❌ Gemini initialization failed:', error.message);
      this.genAI = null;
      this.model = null;
    }
  }

  // -----------------------------
  // 🎬 Personalized Recommendations
  // -----------------------------
  async generateRecommendations(userProfile, watchHistory, count = 10) {
    if (!this.model) return [];

    try {
      const watchedTitles = watchHistory
        .filter(item => item.status === 'finished' && item.mediaId?.title)
        .map(item => item.mediaId.title)
        .slice(0, 15)
        .join(', ');

      const favoriteGenres = this.extractTopGenres(watchHistory).join(', ');

      const prompt = `
You are a movie and TV recommendation engine.

Task:
Recommend exactly ${count} titles.

User Preferences:
- Favorite genres: ${favoriteGenres || 'Action, Drama, Comedy'}
- Recently watched titles: ${watchedTitles || 'None'}

Rules:
1. Popular or critically acclaimed only.
2. Avoid already watched titles.
3. Max 15 words per reason.
4. STRICT JSON ONLY.

Output format:
[
  {
    "title": "string",
    "type": "movie | tv",
    "genre": "string",
    "reason": "string"
  }
]
`;

      const result = await this.model.generateContent(prompt);
      const text = result.response.text();

      return this.safeJsonParse(text);
    } catch (error) {
      console.error('Gemini generateRecommendations error:', error.message);
      return [];
    }
  }

  // -----------------------------
  // 🙂 Mood-Based Recommendations
  // -----------------------------
  async getMoodBasedRecommendations(mood, count = 10) {
    if (!this.model) return [];

    const moodMap = {
      happy: 'uplifting, feel-good, comedy',
      sad: 'emotional, touching, heartwarming',
      excited: 'action-packed, thrilling',
      relaxed: 'calm, peaceful',
      romantic: 'romantic, love story',
      scared: 'horror, suspense',
      inspired: 'inspirational, motivational',
    };

    try {
      const prompt = `
You are a movie and TV recommendation engine.

Task:
Recommend exactly ${count} ${moodMap[mood] || 'entertaining'} titles.

Rules:
1. Popular or critically acclaimed only.
2. Max 15 words per description.
3. STRICT JSON ONLY.

Output format:
[
  {
    "title": "string",
    "type": "movie | tv",
    "description": "string",
    "moodMatch": "string"
  }
]
`;

      const result = await this.model.generateContent(prompt);
      const text = result.response.text();

      return this.safeJsonParse(text);
    } catch (error) {
      console.error('Gemini mood error:', error.message);
      return [];
    }
  }

  // -----------------------------
  // 🧭 Guided Watch Journey
  // -----------------------------
  async getGuidedJourney(theme, count = 10) {
    if (!this.model) return [];

    try {
      const prompt = `
Create a watch journey of ${count} movies or TV shows around "${theme}".

Return STRICT JSON ONLY:
[
  {
    "title": "string",
    "type": "movie | tv",
    "order": number,
    "reason": "string"
  }
]
`;

      const result = await this.model.generateContent(prompt);
      const text = result.response.text();

      return this.safeJsonParse(text);
    } catch (error) {
      console.error('Gemini journey error:', error.message);
      return [];
    }
  }

  // -----------------------------
  // 🛡️ Helpers
  // -----------------------------
  safeJsonParse(text) {
    try {
      const match = text.match(/\[[\s\S]*\]/);
      return match ? JSON.parse(match[0]) : [];
    } catch {
      return [];
    }
  }

  extractTopGenres(watchHistory) {
    const map = {};

    watchHistory.forEach(item => {
      item.mediaId?.genres?.forEach(g => {
        map[g.name] = (map[g.name] || 0) + 1;
      });
    });

    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name]) => name);
  }

  isAvailable() {
    return !!this.model;
  }
}

module.exports = new GeminiService();
