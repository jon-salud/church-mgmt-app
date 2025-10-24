#!/bin/bash

echo "🚀 Starting Church Management App Demo..."
echo "📱 Frontend: http://localhost:3000"
echo "🔧 API: http://localhost:3001"
echo "📚 API Docs: http://localhost:3001/docs"
echo ""

# Start API server in background
echo "Starting API server..."
cd api && DATA_MODE=mock pnpm dev &
API_PID=$!

# Wait a moment for API to start
sleep 3

# Start web server in background
echo "Starting web server..."
cd ../web && pnpm dev &
WEB_PID=$!

echo ""
echo "Both servers are starting up. Please wait..."
echo "Press Ctrl+C to stop both servers"

# Wait for both processes
wait $API_PID $WEB_PID