@echo off
echo ========================================
echo Fixing Expo SDK Version Mismatch
echo ========================================
echo.

echo Step 1: Stopping any running processes...
echo Press Ctrl+C in the mobile terminal if it's still running
timeout /t 3 >nul
echo.

echo Step 2: Cleaning node_modules...
cd C:\App\mobile
if exist node_modules (
    echo Removing old node_modules...
    rmdir /s /q node_modules
)
echo.

echo Step 3: Installing updated dependencies...
echo This may take a few minutes...
call npm install
echo.

echo Step 4: Starting Expo with cache cleared...
echo.
echo ========================================
echo Now run: npm start -- --clear
echo ========================================
echo.
echo Then scan the QR code with Expo Go app
echo.
pause
