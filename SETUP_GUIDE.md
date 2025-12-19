# Quick Setup Guide - MongoDB Atlas Already Configured! ✅

## ✅ What's Already Done

1. **MongoDB Atlas** - Already configured in `.env`
2. **TMDb API Key** - Already configured
3. **Dependencies** - Installed for both backend and mobile

## 🚀 Starting the Application

### Step 1: Start Backend Server

The backend should already be running. If not:

```bash
cd C:\App\backend
npm run dev
```

You should see:
```
✅ Connected to MongoDB
🚀 Server running on port 5000
```

**If you see MongoDB connection error:**
- Your MongoDB Atlas cluster might be paused (free tier auto-pauses after inactivity)
- Go to https://cloud.mongodb.com/
- Resume your cluster
- Wait 1-2 minutes and restart backend

### Step 2: Update Mobile App API URL

**IMPORTANT**: You need to use your computer's IP address, not `localhost`

1. Find your IP address:
```bash
ipconfig
```
Look for "IPv4 Address" (usually starts with 192.168.x.x)

2. Edit `C:\App\mobile\src\api\client.js`:

Change line 4-5 from:
```javascript
const API_URL = __DEV__ 
  ? 'http://localhost:5000/api'
```

To (replace with YOUR IP):
```javascript
const API_URL = __DEV__ 
  ? 'http://192.168.1.XXX:5000/api'  // Use YOUR IP address
```

### Step 3: Start Mobile App

```bash
cd C:\App\mobile
npm start
```

This will open Expo Dev Tools in your browser.

### Step 4: Run on Device

**Option A: Android Emulator**
- Press `a` in the terminal
- Or click "Run on Android device/emulator" in Expo Dev Tools

**Option B: Physical Device**
1. Install "Expo Go" app from Play Store/App Store
2. Scan the QR code shown in terminal/browser
3. Make sure your phone and computer are on the same WiFi

## 🐛 Common Expo Errors & Fixes

### Error: "Unable to resolve module"
```bash
cd C:\App\mobile
rm -rf node_modules
npm install
npm start -- --clear
```

### Error: "Network request failed"
- Check if backend is running on port 5000
- Verify API URL in `src/api/client.js` uses your IP address
- Check firewall isn't blocking port 5000

### Error: "Invariant Violation" or "Element type is invalid"
- Make sure all screens are properly exported
- Check for typos in import statements

### Error: Expo Go app shows blank screen
- Check terminal for error messages
- Shake device and select "Debug Remote JS"
- Check Chrome DevTools console

## 🧪 Testing the App

1. **Open the app** - Should show Login screen
2. **Register** - Tap "Sign Up", create account
3. **Login** - Enter credentials
4. **Navigate** - Try all bottom tabs (Home, Watchlist, Discover, Profile)
5. **Logout** - Go to Profile tab, tap Logout

## 📱 Testing Backend API

Test if backend is working:

```bash
# Health check
curl http://localhost:5000/health

# Register (should return user and token)
curl -X POST http://localhost:5000/api/auth/register -H "Content-Type: application/json" -d "{\"email\":\"test@test.com\",\"password\":\"password123\",\"displayName\":\"Test User\"}"

# Search movies (should return results)
curl "http://localhost:5000/api/media/search?query=inception"
```

## 🔥 Quick Troubleshooting Checklist

- [ ] Backend running on port 5000?
- [ ] MongoDB Atlas cluster active (not paused)?
- [ ] Mobile app API URL uses computer's IP address?
- [ ] Phone and computer on same WiFi?
- [ ] Firewall allows port 5000?
- [ ] Expo Go app installed on phone?

## 📞 What Error Are You Seeing?

Please share:
1. Screenshot of Expo error (if any)
2. Terminal output from `npm start`
3. Any error messages in the app

I'll help debug it!
