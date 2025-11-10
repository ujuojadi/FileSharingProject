@echo off
echo Starting File Sharing Application...
echo.

echo [1/3] Starting Go P2P Backend...
start "Go P2P Backend" cmd /k "go run main.go"
timeout /t 3 /nobreak > nul

echo [2/3] Starting Python FastAPI Backend...
start "FastAPI Backend" cmd /k "uvicorn app.main:app --reload --port 8000"
timeout /t 3 /nobreak > nul

echo [3/3] Starting React Frontend...
cd file-share-frontend
start "React Frontend" cmd /k "npm start"
cd ..

echo.
echo All services are starting...
echo.
echo Go P2P Backend: http://localhost:8081
echo FastAPI Backend: http://localhost:8000
echo React Frontend: http://localhost:3000
echo.
echo Press any key to exit...
pause > nul

