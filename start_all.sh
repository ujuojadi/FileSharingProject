#!/bin/bash

echo "Starting File Sharing Application..."
echo ""

# Start Go P2P Backend
echo "[1/3] Starting Go P2P Backend..."
gnome-terminal -- bash -c "go run main.go; exec bash" &
sleep 2

# Start Python FastAPI Backend
echo "[2/3] Starting Python FastAPI Backend..."
gnome-terminal -- bash -c "uvicorn app.main:app --reload --port 8000; exec bash" &
sleep 2

# Start React Frontend
echo "[3/3] Starting React Frontend..."
cd file-share-frontend
gnome-terminal -- bash -c "npm start; exec bash" &
cd ..

echo ""
echo "All services are starting..."
echo ""
echo "Go P2P Backend: http://localhost:8081"
echo "FastAPI Backend: http://localhost:8000"
echo "React Frontend: http://localhost:3000"
echo ""
echo "Services are running in separate terminal windows."

