# Watch List App - Backend API

Node.js + Express + MongoDB backend for the Watch List application.

## Features

- ✅ User authentication (JWT)
- ✅ Watchlist management (CRUD operations)
- ✅ TMDb API integration
- ✅ Gamification system (XP, achievements, streaks)
- ✅ Activity tracking
- 🚧 Custom lists
- 🚧 Stats & analytics
- 🚧 Social features
- 🚧 AI recommendations

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Variables

Create a `.env` file in the `backend` directory:

```env
NODE_ENV=development
PORT=5000

# MongoDB
MONGODB_URI=mongodb://localhost:27017/watchlist-app

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRE=7d

# API Keys
TMDB_API_KEY=your-tmdb-api-key
OMDB_API_KEY=your-omdb-api-key
GEMINI_API_KEY=your-gemini-api-key

# CORS
ALLOWED_ORIGINS=http://localhost:19000,http://localhost:19006
```

### 3. Get API Keys

#### TMDb API Key (Required)
1. Go to https://www.themoviedb.org/
2. Create an account
3. Go to Settings → API
4. Request an API key (free)
5. Copy the API Key (v3 auth)

#### OMDb API Key (Optional)
1. Go to http://www.omdbapi.com/apikey.aspx
2. Request a free API key
3. Verify your email
4. Copy the API key

#### Gemini API Key (Optional - for AI features)
1. Go to https://makersuite.google.com/app/apikey
2. Create an API key
3. Copy the key

### 4. Start MongoDB

**Option A: Local MongoDB**
```bash
# Install MongoDB Community Edition
# Then start the service
mongod
```

**Option B: MongoDB Atlas (Cloud)**
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

### 5. Run the Server

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server will run on http://localhost:5000

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)
- `PUT /api/auth/profile` - Update profile (protected)
- `PUT /api/auth/preferences` - Update preferences (protected)

### Watchlist
- `GET /api/watchlist` - Get watchlist (protected)
- `POST /api/watchlist` - Add to watchlist (protected)
- `GET /api/watchlist/:id` - Get watchlist item (protected)
- `PUT /api/watchlist/:id/status` - Update status (protected)
- `PUT /api/watchlist/:id/rating` - Update rating (protected)
- `PUT /api/watchlist/:id/notes` - Update notes (protected)
- `PUT /api/watchlist/:id/progress` - Update progress (protected)
- `DELETE /api/watchlist/:id` - Remove from watchlist (protected)

### Media
- `GET /api/media/search?query=inception` - Search movies/TV shows
- `GET /api/media/trending` - Get trending content
- `GET /api/media/:type/:id` - Get media details
- `GET /api/media/:type/:id/recommendations` - Get recommendations

### Health Check
- `GET /health` - Server health status

## Testing

Test the API with curl or Postman:

```bash
# Health check
curl http://localhost:5000/health

# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","displayName":"Test User"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Search (with token)
curl http://localhost:5000/api/media/search?query=inception \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Project Structure

```
backend/
├── src/
│   ├── controllers/      # Request handlers
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── middleware/      # Custom middleware
│   ├── services/        # Business logic
│   └── server.js        # Entry point
├── package.json
└── .env
```

## Next Steps

1. ✅ Set up MongoDB
2. ✅ Get TMDb API key
3. ✅ Configure `.env` file
4. ✅ Run `npm install`
5. ✅ Start the server with `npm run dev`
6. 🚧 Implement remaining features (lists, stats, social)
7. 🚧 Build the React Native mobile app
