@echo off
echo ======================================
echo   PAW PRINTS - Starting Application
echo ======================================
echo.
echo [1/2] Starting Backend Server...
start "Paw Prints Backend" cmd /k "cd backend && npm install && npm run dev"
timeout /t 3 /nobreak > nul
echo [2/2] Starting Frontend...
start "Paw Prints Frontend" cmd /k "cd frontend && npm install && npm start"
echo.
echo Both servers starting...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
pause
