#!/bin/bash

# Rentverse Manual Server Startup Script
# Run this script to start all services manually

echo "🚀 Starting Rentverse Application Services..."

# Check if we're in the right directory
if [ ! -d "rentverse-backend" ] || [ ! -d "rentverse-frontend" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo ""
echo "📋 Service Overview:"
echo "  - Backend API: http://localhost:5000"
echo "  - Frontend: http://localhost:3001" 
echo "  - AI Service: http://localhost:8000"
echo ""

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        return 0  # Port is in use
    else
        return 1  # Port is free
    fi
}

# Check ports
echo "🔍 Checking port availability..."
if check_port 5000; then
    echo "⚠️  Port 5000 (Backend) is already in use"
fi
if check_port 3001; then
    echo "⚠️  Port 3001 (Frontend) is already in use"  
fi
if check_port 8000; then
    echo "⚠️  Port 8000 (AI Service) is already in use"
fi

echo ""
echo "💡 Instructions:"
echo "1. This script will show you the commands to run"
echo "2. Open separate terminal windows for each service"
echo "3. Run the commands shown below"
echo ""

echo "=== BACKEND SERVER (Terminal 1) ==="
echo "cd rentverse-backend"
echo "npm install"
echo "npm run dev"
echo ""

echo "=== FRONTEND SERVER (Terminal 2) ==="
echo "cd rentverse-frontend" 
echo "npm install"
echo "npm run dev"
echo ""

echo "=== AI SERVICE (Terminal 3) - Optional ==="
echo "cd rentverse-ai-service"
echo "pip install -r requirements.txt"
echo "python rentverse/main.py"
echo ""

echo "✅ Once all services are running, access:"
echo "   Frontend: http://localhost:3001"
echo "   Backend API: http://localhost:5000"
echo ""
echo "Press Enter to exit..."
read