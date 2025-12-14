@echo off
REM RentVerse - Simple Batch Startup Script
REM This script starts all services with basic error handling

echo 🚀 RentVerse Service Startup Script
echo ======================================
echo.

echo 🔧 Step 1: Checking ports...
echo ------------------------
netstat -ano | findstr :3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️  Port 3000 is in use. Attempting to free it...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3000') do taskkill /PID %%a /F >nul 2>&1
    timeout /t 2 >nul
) else (
    echo ✅ Port 3000 is free
)

netstat -ano | findstr :3001 >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️  Port 3001 is in use. Attempting to free it...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3001') do taskkill /PID %%a /F >nul 2>&1
    timeout /t 2 >nul
) else (
    echo ✅ Port 3001 is free
)

netstat -ano | findstr :8000 >nul 2>&1
if %errorlevel% equ 0 (
    echo ⚠️  Port 8000 is in use. Attempting to free it...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000') do taskkill /PID %%a /F >nul 2>&1
    timeout /t 2 >nul
) else (
    echo ✅ Port 8000 is free
)

echo.
echo 🏗️  Step 2: Starting Services
echo ----------------------------
echo 🚀 Starting Backend API...
start "Backend API" cmd /c "cd rentverse-backend && npm start"

echo 🚀 Starting Frontend App...
start "Frontend App" cmd /c "cd rentverse-frontend && npm run dev"

echo 🚀 Starting AI Service...
start "AI Service" cmd /c "cd rentverse-ai-service && python -m rentverse.cli start"

echo.
echo ⏳ Step 3: Waiting for services to start...
echo ---------------------------------------
timeout /t 10 /nobreak >nul

echo.
echo 🔍 Step 4: Service Status
echo -----------------------
echo 🌐 Service URLs:
echo    Backend API:    http://localhost:3000
echo    API Docs:       http://localhost:3000/docs
echo    Frontend App:   http://localhost:3001
echo    AI Service:     http://localhost:8000
echo.
echo 📋 Next Steps:
echo    1. Open http://localhost:3001 in your browser
echo    2. Test authentication: Login with admin@rentverse.com
echo    3. Run full tests: Follow TESTING_SCRIPT.md
echo    4. Create demo video: Follow SUBMISSION_CHECKLIST.md
echo.
echo 🛑 To stop all services:
echo    taskkill /IM node.exe /F
echo    taskkill /IM python.exe /F
echo.
echo 🎉 RentVerse Services Started!
echo ===============================
echo.
echo Press any key to exit...
pause >nul