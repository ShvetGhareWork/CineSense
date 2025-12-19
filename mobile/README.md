# Watch List Mobile App

React Native mobile application for tracking movies & TV shows.

## Features

- ✅ User authentication (Login/Register)
- ✅ Premium UI with gradient backgrounds
- ✅ Dark theme optimized
- ✅ Bottom tab navigation
- ✅ Zustand state management
- ✅ JWT token handling
- 🚧 Watchlist management
- 🚧 Search & discover
- 🚧 Stats & analytics
- 🚧 Social features

## Setup

### 1. Install Dependencies

```bash
cd mobile
npm install
```

### 2. Update API URL

Edit `src/api/client.js` and update the API_URL:

```javascript
const API_URL = __DEV__ 
  ? 'http://YOUR_COMPUTER_IP:5000/api'  // Use your computer's IP address
  : 'https://your-production-api.com/api';
```

**Finding your IP address:**
- Windows: `ipconfig` (look for IPv4 Address)
- Mac/Linux: `ifconfig` or `ip addr`

Example: `http://192.168.1.100:5000/api`

### 3. Start the App

```bash
npm start
```

This will open Expo Dev Tools in your browser.

### 4. Run on Device/Emulator

**iOS Simulator (Mac only):**
```bash
npm run ios
```

**Android Emulator:**
```bash
npm run android
```

**Physical Device:**
1. Install Expo Go app from App Store/Play Store
2. Scan the QR code from Expo Dev Tools
3. Make sure your phone and computer are on the same WiFi network

## Project Structure

```
mobile/
├── src/
│   ├── api/              # API client
│   ├── components/       # Reusable components
│   │   └── media/       # MediaCard component
│   ├── constants/        # Theme, colors, typography
│   ├── screens/          # App screens
│   │   ├── auth/        # Login, Register
│   │   ├── home/        # Home screen
│   │   ├── watchlist/   # Watchlist screen
│   │   ├── discover/    # Discover screen
│   │   └── profile/     # Profile screen
│   └── store/            # Zustand state management
│       ├── authStore.js
│       └── watchlistStore.js
├── App.js                # Main app component
├── app.json              # Expo configuration
└── package.json
```

## Design System

### Colors
- **Primary**: Midnight Black (#0E0E11), Charcoal (#1C1C22)
- **Accent**: Electric Purple (#6C63FF), Neon Blue (#3ABEFF)
- **Status**: Amber (#FFB703), Blue (#219EBC), Green (#2EC4B6)

### Typography
- **Headings**: Inter Bold
- **Body**: Inter Regular

## State Management (Zustand)

### Auth Store
```javascript
import useAuthStore from './store/authStore';

const { user, login, register, logout } = useAuthStore();
```

### Watchlist Store
```javascript
import useWatchlistStore from './store/watchlistStore';

const { items, fetchWatchlist, addToWatchlist } = useWatchlistStore();
```

## Testing

1. Make sure backend is running on `http://localhost:5000`
2. Update API URL in `src/api/client.js`
3. Start the app with `npm start`
4. Test login/register flow
5. Test navigation between tabs

## Troubleshooting

### Cannot connect to backend
- Check if backend is running
- Verify API URL in `src/api/client.js`
- Use your computer's IP address, not `localhost`
- Ensure phone and computer are on same WiFi

### Expo Go app not connecting
- Make sure both devices are on same network
- Try restarting Expo Dev Tools
- Clear Expo cache: `expo start -c`

### Module not found errors
```bash
rm -rf node_modules
npm install
```

## Next Steps

1. ✅ Set up backend API
2. ✅ Install dependencies
3. ✅ Update API URL
4. ✅ Test login/register
5. 🚧 Implement Watchlist screen
6. 🚧 Implement Search & Discover
7. 🚧 Add Stats & Analytics
8. 🚧 Implement Social features
