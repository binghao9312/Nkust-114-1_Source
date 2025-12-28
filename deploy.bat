@echo off
echo ==========================================
echo      STARTING AUTOMATED DEPLOYMENT
echo ==========================================

echo [1/3] Navigating to client folder...
cd web-app/client

echo [2/3] Building the application (npm run build)...
call npm install
call npm run build

if %errorlevel% neq 0 (
    echo.
    echo !!!!!!! BUILD FAILED !!!!!!!
    echo Please check the errors above.
    pause
    exit /b %errorlevel%
)

echo [3/3] Deploying to Firebase...
cd ../..
call firebase deploy

echo.
echo ==========================================
echo        DEPLOYMENT COMPLETE!
echo ==========================================
pause
