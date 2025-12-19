@echo off
REM ===================================================
REM CineSense Mobile - Release Build Script
REM ===================================================
REM This script builds a production-ready release APK
REM ===================================================

echo.
echo ========================================
echo   CineSense Mobile - Release Build
echo ========================================
echo.

REM Step 1: Check if .env.production exists
echo [1/6] Checking environment configuration...
if not exist ".env.production" (
    echo ERROR: .env.production file not found!
    echo Please create .env.production with your production API URL
    echo Example: API_URL=https://cinesense-xln2.onrender.com/api
    pause
    exit /b 1
)
echo ✓ Environment configuration found
echo.

REM Step 2: Copy production env to .env for build
echo [2/6] Setting up production environment...
copy /Y .env.production .env >nul
echo ✓ Production environment activated
echo.

REM Step 3: Clean previous builds
echo [3/6] Cleaning previous builds...
cd android
call gradlew clean
if errorlevel 1 (
    echo ERROR: Clean failed!
    cd ..
    pause
    exit /b 1
)
cd ..
echo ✓ Clean completed
echo.

REM Step 4: Install/update dependencies
echo [4/6] Checking dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: npm install failed!
    pause
    exit /b 1
)
echo ✓ Dependencies ready
echo.

REM Step 5: Build release APK
echo [5/6] Building release APK...
echo This may take several minutes...
cd android
call gradlew assembleRelease
if errorlevel 1 (
    echo ERROR: Build failed!
    echo Check the error messages above
    cd ..
    pause
    exit /b 1
)
cd ..
echo ✓ Build completed successfully!
echo.

REM Step 6: Locate APK
echo [6/6] Locating APK...
set APK_PATH=android\app\build\outputs\apk\release\app-release.apk
if exist "%APK_PATH%" (
    echo.
    echo ========================================
    echo   BUILD SUCCESSFUL!
    echo ========================================
    echo.
    echo APK Location:
    echo %CD%\%APK_PATH%
    echo.
    echo APK Size:
    for %%A in ("%APK_PATH%") do echo %%~zA bytes
    echo.
    echo Next steps:
    echo 1. Transfer APK to your Android device
    echo 2. Install the APK
    echo 3. Test all features
    echo.
) else (
    echo ERROR: APK not found at expected location!
    echo Expected: %APK_PATH%
)

REM Restore development environment
echo Restoring development environment...
if exist ".env.development" (
    copy /Y .env.development .env >nul
) else (
    echo # Development Environment > .env
    echo API_URL=http://192.168.0.102:5000/api >> .env
    echo NODE_ENV=development >> .env
    echo DEBUG_MODE=true >> .env
)

echo.
pause
