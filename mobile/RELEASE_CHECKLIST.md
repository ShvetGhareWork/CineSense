# 🚀 CineSense Mobile - Release Checklist

## Pre-Build Checklist

### Environment Configuration
- [ ] `.env.production` file exists with correct production API URL
- [ ] Production API URL uses HTTPS (not HTTP)
- [ ] Backend is deployed and accessible at production URL
- [ ] Test backend health endpoint: `https://cinesense-xln2.onrender.com/api/health`

### Code Quality
- [ ] All console.log statements removed or using logger utility
- [ ] No hardcoded API keys or secrets in code
- [ ] Error handling implemented for all API calls
- [ ] Offline mode gracefully handled

### Dependencies
- [ ] All npm packages up to date: `npm outdated`
- [ ] No critical security vulnerabilities: `npm audit`
- [ ] react-native-config installed and configured
- [ ] react-native-mmkv installed for caching

## Build Configuration

### Android Settings
- [ ] `AndroidManifest.xml` uses `networkSecurityConfig` (not `usesCleartextTraffic`)
- [ ] `network_security_config.xml` exists in `res/xml/`
- [ ] ProGuard rules updated in `proguard-rules.pro`
- [ ] `build.gradle` has react-native-config integration
- [ ] Signing config set up (for production, use proper keystore)

### Build Process
- [ ] Run clean build: `cd android && gradlew clean`
- [ ] Build release APK: `gradlew assembleRelease`
- [ ] Or use build script: `build-release.bat`
- [ ] Check build output for warnings or errors
- [ ] Verify APK size is reasonable (< 50MB)

## Testing Checklist

### Installation
- [ ] Uninstall any previous versions from test device
- [ ] Install release APK on physical Android device
- [ ] App launches without crashes
- [ ] No permission errors

### Core Functionality
- [ ] Home screen loads trending content
- [ ] Poster images display correctly
- [ ] Search functionality works
- [ ] Media detail pages load
- [ ] Watchlist add/remove works
- [ ] Navigation between screens smooth

### Network & API
- [ ] API calls succeed in release mode
- [ ] Data displays correctly (not empty)
- [ ] Error messages shown for failed requests
- [ ] Retry functionality works
- [ ] Caching works (test with airplane mode)

### Offline Mode
- [ ] Enable airplane mode
- [ ] Previously loaded content still visible
- [ ] Appropriate offline messages shown
- [ ] App doesn't crash when offline
- [ ] Data reloads when back online

### Performance
- [ ] App startup time < 3 seconds
- [ ] Smooth scrolling on lists
- [ ] Images load efficiently
- [ ] No memory leaks (test extended usage)
- [ ] Battery drain is acceptable

### Security
- [ ] Connect device via USB: `adb logcat | findstr "CineSense"`
- [ ] Verify no API keys in logs
- [ ] Verify no auth tokens in logs
- [ ] HTTPS enforced for production API
- [ ] No sensitive data exposed

## Post-Build Actions

### Documentation
- [ ] Update version number in `package.json`
- [ ] Update version code in `build.gradle`
- [ ] Document any breaking changes
- [ ] Update README if needed

### Distribution
- [ ] APK signed with production keystore (for Play Store)
- [ ] Generate AAB for Play Store: `gradlew bundleRelease`
- [ ] Test on multiple Android versions (if possible)
- [ ] Test on different screen sizes

### Monitoring (Recommended)
- [ ] Set up crash reporting (Firebase Crashlytics/Sentry)
- [ ] Set up analytics (Firebase Analytics/Mixpanel)
- [ ] Monitor API error rates
- [ ] Track app performance metrics

## Common Issues & Solutions

### Issue: API data not loading
**Solution:**
- Check `.env.production` has correct API_URL
- Verify backend is accessible: `curl https://cinesense-xln2.onrender.com/api/health`
- Check `adb logcat` for network errors
- Verify network security config allows HTTPS

### Issue: App crashes on startup
**Solution:**
- Check ProGuard rules didn't strip required classes
- Review crash logs: `adb logcat *:E`
- Try disabling ProGuard temporarily: set `minifyEnabled false`
- Check all native modules are linked

### Issue: Images not displaying
**Solution:**
- Verify TMDB image URLs use HTTPS
- Check network permissions in AndroidManifest
- Test image URLs in browser
- Check ProGuard rules for image loading libraries

### Issue: "Network Error" in release
**Solution:**
- Verify `network_security_config.xml` is referenced
- Check production URL uses HTTPS
- Verify no typos in API_URL
- Test backend accessibility from device

## Final Verification

Before submitting to Play Store:
- [ ] All checklist items above completed
- [ ] Tested on at least 2 different devices
- [ ] No crashes during 15-minute usage session
- [ ] All core features working
- [ ] Performance is acceptable
- [ ] Security review passed

---

## Build Commands Reference

```bash
# Clean build
cd android
gradlew clean

# Build release APK
gradlew assembleRelease

# Build release AAB (for Play Store)
gradlew bundleRelease

# Install release APK on connected device
gradlew installRelease

# View build logs
gradlew assembleRelease --info

# Check APK size
gradlew assembleRelease --scan
```

## Environment Variables

**Development (`.env`):**
```
API_URL=http://192.168.0.102:5000/api
NODE_ENV=development
DEBUG_MODE=true
```

**Production (`.env.production`):**
```
API_URL=https://cinesense-xln2.onrender.com/api
NODE_ENV=production
DEBUG_MODE=false
```

---

**Last Updated:** December 19, 2025  
**App Version:** 1.0.0  
**Minimum Android Version:** API 23 (Android 6.0)
