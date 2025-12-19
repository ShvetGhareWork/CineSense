const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  tmdbId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  type: {
    type: String,
    enum: ['movie', 'tv'],
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    index: 'text'
  },
  originalTitle: {
    type: String,
    required: true
  },
  posterPath: String,
  backdropPath: String,
  overview: String,
  releaseDate: Date,
  genres: [{
    id: Number,
    name: String
  }],
  languages: [String],
  runtime: Number,
  numberOfSeasons: Number,
  numberOfEpisodes: Number,
  voteAverage: Number,
  voteCount: Number,
  popularity: Number,
  imdbId: String,
  
  // Enriched data from bulk datasets
  enrichedData: {
    imdbRating: Number,
    metascore: Number,
    awards: String,
    director: String,
    cast: [String],
    plot: String
  },
  
  // Cached data from TMDb
  tmdbData: mongoose.Schema.Types.Mixed,
  
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound indexes
mediaSchema.index({ type: 1, tmdbId: 1 });
mediaSchema.index({ 'genres.id': 1 });
mediaSchema.index({ languages: 1 });
mediaSchema.index({ voteAverage: -1 });
mediaSchema.index({ popularity: -1 });

// Text search index
mediaSchema.index({ title: 'text', originalTitle: 'text', overview: 'text' });

module.exports = mongoose.model('Media', mediaSchema);
