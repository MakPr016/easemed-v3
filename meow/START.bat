@echo off
REM EASEMED RFQ Parser - Windows Startup Script
REM Starts both backend (Flask) and frontend (React)

echo.
echo ============================================
echo  EASEMED RFQ Parser Startup
echo ============================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://www.python.org/
    pause
    exit /b 1
)

REM Check if Node is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [1/4] Installing backend dependencies...
cd backend
pip install -r requirements.txt >nul 2>&1
if errorlevel 1 (
    echo ERROR: Failed to install backend dependencies
    pause
    exit /b 1
)
cd ..

echo [2/4] Starting Flask backend on port 5001...
start cmd /k "cd backend && python app.py"
echo       Waiting for backend to start...
timeout /t 3 /nobreak

echo [3/4] Installing frontend dependencies...
cd frontend
call npm install >nul 2>&1
if errorlevel 1 (
    echo WARNING: npm install had issues, but continuing...
)

echo [4/4] Starting React frontend on port 3000...
call npm run dev

pause
