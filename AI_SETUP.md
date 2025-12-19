# AI Recommendations Setup (Optional)

The AI Recommendations feature uses Google Gemini API. It's **optional** - the app works perfectly without it!

## Without Gemini API Key

- AI Recommendations screen will show: "Add items to watchlist to get recommendations"
- All other features work normally
- No errors or crashes

## To Enable AI Recommendations

1. **Get Gemini API Key** (Free):
   - Go to: https://aistudio.google.com/app/apikey
   - Click "Create API Key"
   - Select "Create API key in new project" or use existing project
   - Copy the key

2. **Add to Backend .env**:
   ```env
   GEMINI_API_KEY=your-gemini-api-key-here
   ```

3. **Restart Backend** (if not using nodemon):
   ```bash
   # Stop the backend (Ctrl+C)
   npm run dev
   ```
   
   Note: If using `npm run dev` with nodemon, it will auto-reload!

4. **Test AI Features**:
   - Open AI Picks tab in the app
   - Add some items to your watchlist first
   - Tap "For You" to get personalized recommendations
   - Or select a mood for mood-based suggestions

## AI Features

When enabled, you get:
- ✨ Personalized recommendations based on watch history
- 😊 Mood-based discovery (7 moods)
- 🎯 Guided journeys (themed watch lists)
- 🤖 Powered by Google Gemini 1.5 Pro

## Optimizations

The AI system is optimized for **free tier**:
- ✅ Short, structured prompts (saves tokens)
- ✅ Strict JSON output (easy parsing)
- ✅ Robust error handling (no crashes)
- ✅ Graceful fallbacks (empty arrays on error)
- ✅ Uses gemini-1.5-pro (stable, free tier compatible)

## Note

The app is fully functional without AI features. They're a premium add-on that enhances the experience but isn't required for core functionality.

**Free Tier Limits:**
- 15 requests per minute
- 1,500 requests per day
- 1 million tokens per day

More than enough for personal use!
