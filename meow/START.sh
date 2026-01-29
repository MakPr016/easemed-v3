#!/bin/bash
# EASEMED RFQ Parser - macOS/Linux Startup Script
# Starts both backend (Flask) and frontend (React)

echo ""
echo "============================================"
echo " EASEMED RFQ Parser Startup"
echo "============================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python3 is not installed"
    echo "Please install Python 3.8+ from https://www.python.org/"
    exit 1
fi

# Check if Node is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "[1/4] Installing backend dependencies..."
cd backend
pip3 install -r requirements.txt > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install backend dependencies"
    exit 1
fi
cd ..

echo "[2/4] Starting Flask backend on port 5001..."
cd backend
python3 app.py &
BACKEND_PID=$!
cd ..
echo "       Backend PID: $BACKEND_PID"
sleep 3

echo "[3/4] Installing frontend dependencies..."
cd frontend
npm install > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "WARNING: npm install had issues, but continuing..."
fi

echo "[4/4] Starting React frontend on port 3000..."
echo ""
echo "✅ System Starting..."
echo "   Backend:  http://localhost:5001"
echo "   Frontend: http://localhost:3000"
echo ""
npm run dev

# Cleanup on exit
trap "kill $BACKEND_PID" EXIT
