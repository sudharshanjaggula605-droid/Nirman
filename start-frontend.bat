@echo off
echo ============================================================
echo   NIRMAN Pro v3.0 — Frontend Startup
echo ============================================================
echo.

cd /d "%~dp0frontend"

:: Install npm dependencies if needed
if not exist "node_modules" (
    echo [INFO] Installing npm packages - first time setup...
    npm install
)

:: Start Vite dev server
echo [SUCCESS] Starting React frontend at http://localhost:5173
echo.
npm run dev
