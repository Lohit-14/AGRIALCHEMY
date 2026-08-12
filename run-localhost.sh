#!/bin/bash
# AgriAlchemy Production Localhost Runner
echo "=== AgriAlchemy Localhost Production Stack ==="
echo "Backend will run on http://localhost:5000"
echo "Frontend will run on http://localhost:5173"
echo ""
echo "Starting backend..."
cd backend
npm install --silent
npm run seed
npm run dev &
BACKEND_PID=$!
cd ..

sleep 2

echo "Starting frontend..."
cd frontend
npm install --silent
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "Both services starting..."
echo "Backend PID: $BACKEND_PID | Frontend PID: $FRONTEND_PID"
echo "Visit: http://localhost:5173"
echo "API Health: http://localhost:5000/api/health"
echo ""
echo "Seeded OTPs are logged in backend console and returned as demo_otp."
echo "Seeded accounts: Farmer 9876543210, Company 9876543220, Collector 9876543230, Admin 9999999999"
echo ""
echo "Press Ctrl+C to stop both"
wait
