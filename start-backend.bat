@echo off
echo ============================================================
echo   NIRMAN Pro v3.0 — Backend Startup
echo ============================================================
echo.

cd /d "%~dp0backend"

:: Check and activate virtual environment
if exist "%~dp0venv\Scripts\activate.bat" (
    call "%~dp0venv\Scripts\activate.bat"
) else if exist "venv\Scripts\activate.bat" (
    call venv\Scripts\activate.bat
) else (
    echo [INFO] Creating Python virtual environment...
    python -m venv "%~dp0venv"
    call "%~dp0venv\Scripts\activate.bat"
)

:: Install dependencies
echo [INFO] Installing dependencies...
pip install -r requirements.txt -q

:: Seed database
echo [INFO] Seeding database...
python seed_admin.py

:: Start Flask
echo.
echo [SUCCESS] Starting Flask API at http://localhost:5000
echo.
python app.py
