@echo off
echo ========================================
echo Watch List App - System Check
echo ========================================
echo.

echo [1/5] Checking if backend is running...
curl -s http://localhost:5000/health >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ Backend is running on port 5000
    curl -s http://localhost:5000/health
) else (
    echo ❌ Backend is NOT running
    echo    Start it with: cd backend ^&^& npm run dev
)
echo.

echo [2/5] Checking MongoDB connection...
echo    Check backend terminal for MongoDB connection status
echo.

echo [3/5] Your computer's IP addresses:
ipconfig | findstr /i "IPv4"
echo.

echo [4/4] Testing TMDb API...
curl -s "http://localhost:5000/api/media/search?query=inception" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ TMDb API is working
) else (
    echo ⚠️  TMDb API test failed (backend might not be running)
)
echo.

echo ========================================
echo Next Steps:
echo ========================================
echo 1. Make sure backend is running (npm run dev)
echo 2. Update mobile/src/api/client.js with your IP address
echo 3. Start mobile app (npm start)
echo 4. Use Expo Go app to scan QR code
echo ========================================
pause
