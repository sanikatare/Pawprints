#!/bin/bash
echo "======================================"
echo "  PAW PRINTS - Starting Application"
echo "======================================"
echo ""
echo "[1/2] Installing & starting Backend..."
cd backend && npm install && npm run dev &
sleep 3
echo "[2/2] Installing & starting Frontend..."
cd ../frontend && npm install && npm start &
echo ""
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:3000"
wait
