@echo off
setlocal enabledelayedexpansion

echo ==========================================
echo Setting up and Running Tetris Centroid Game
echo ==========================================

:: Check for Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed! Please install Node.js to run this game.
    pause
    exit /b 1
)

echo.
echo [1/4] Installing Backend Dependencies...
cd backend
if not exist package.json (
    echo Error: backend/package.json not found!
    pause
    exit /b 1
)
call npm install
if %errorlevel% neq 0 (
    echo Error installing backend dependencies!
    pause
    exit /b %errorlevel%
)

echo.
echo [2/4] Starting Backend Server...
:: Start backend in a new window with title "Tetris Backend"
start "Tetris Backend" cmd /k "echo Starting Backend Server... && npm start"

echo.
echo [3/4] Installing Frontend Dependencies...
cd ..\frontend
if not exist package.json (
    echo Error: frontend/package.json not found!
    pause
    exit /b 1
)
call npm install
if %errorlevel% neq 0 (
    echo Error installing frontend dependencies!
    pause
    exit /b %errorlevel%
)

echo.
echo [4/4] Starting Frontend Server...
echo The game should open in your browser shortly.
echo Check the "Tetris Backend" window for server logs.
echo Check the "Tetris Frontend" window for client logs.
:: Start frontend in a new window with title "Tetris Frontend"
start "Tetris Frontend" cmd /k "echo Starting Frontend Server... && npm run dev"

echo.
echo ==========================================
echo Game is running!
echo Backend: http://localhost:3000
echo Frontend: http://localhost:5173
echo.
echo Press any key to close this launcher (servers will keep running)...
echo ==========================================
pause
