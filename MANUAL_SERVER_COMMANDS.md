# Manual Server Commands

## Overview
Your Rentverse application consists of three services:
1. **rentverse-frontend** - Next.js frontend (runs on port 3001)
2. **rentverse-backend** - Express.js API server (runs on port 5000)
3. **rentverse-ai-service** - Python AI service (runs on port 8000)

## Prerequisites
Make sure you have Node.js installed (version 18 or higher):
```bash
node --version
npm --version
```

## Terminal Commands

### 1. Start the Backend Server (Required First)
```bash
cd rentverse-backend
npm install  # Only needed first time or if dependencies change
npm run dev
```
- **Port**: 5000
- **Status**: Should show "Server running on port 5000"
- **Process**: Runs with auto-restart on file changes

### 2. Start the Frontend Server (After Backend)
Open a **new terminal window** and run:
```bash
cd rentverse-frontend
npm install  # Only needed first time or if dependencies change
npm run dev
```
- **Port**: 3001
- **Status**: Should show "Local: http://localhost:3001"
- **Process**: Runs with hot reload

### 3. Start the AI Service (Optional, for price predictions)
Open a **third terminal window** and run:
```bash
cd rentverse-ai-service
pip install -r requirements.txt  # Only needed first time
python rentverse/main.py
```
- **Port**: 8000
- **Status**: Should show "Running on http://127.0.0.1:8000"

## Complete Setup Workflow

### First Time Setup:
```bash
# Terminal 1 - Backend
cd rentverse-backend
npm install
npm run dev

# Terminal 2 - Frontend  
cd rentverse-frontend
npm install
npm run dev

# Terminal 3 - AI Service (optional)
cd rentverse-ai-service
pip install -r requirements.txt
python rentverse/main.py
```

### Daily Usage:
```bash
# Terminal 1
cd rentverse-backend && npm run dev

# Terminal 2
cd rentverse-frontend && npm run dev
```

## Access Points
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:5000
- **AI Service**: http://localhost:8000

## Troubleshooting

### Port Already in Use
If you get "port 5000 is already in use":
```bash
# Find and kill the process
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F
```

### Dependencies Issues
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

### Environment Variables
Make sure your `.env` files are properly configured:
- `rentverse-backend/.env` - Database and API keys
- `rentverse-frontend/.env.local` - Frontend environment variables

## Stopping Servers
- Press `Ctrl + C` in each terminal
- All servers will stop gracefully

## Development Tips
- Backend runs with `nodemon` for auto-restart
- Frontend has hot reload for instant changes
- Check terminal logs for any errors
- Backend must be running before frontend can make API calls