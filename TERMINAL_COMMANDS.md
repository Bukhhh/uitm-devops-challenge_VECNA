# COPY-PASTE TERMINAL COMMANDS

## Terminal Window 1 - Backend Server (Start This First)

```cmd
cd rentverse-backend
npm install
npm run dev
```

Expected output should show:
- "Server running on port 5000"
- "Database connected" or similar success message

---

## Terminal Window 2 - Frontend Server (Start This After Backend)

```cmd
cd rentverse-frontend
npm install  
npm run dev
```

Expected output should show:
- "Local: http://localhost:3001"
- "Ready in" and some build time

---

## Terminal Window 3 - AI Service (Optional - for price predictions)

```cmd
cd rentverse-ai-service
pip install -r requirements.txt
python rentverse/main.py
```

Expected output should show:
- "Running on http://127.0.0.1:8000"

---

## Quick Command Cheat Sheet

If you want to do it in one go, copy these commands one by one:

### 1. Backend (Terminal 1)
```cmd
cd rentverse-backend && npm install && npm run dev
```

### 2. Frontend (Terminal 2) 
```cmd
cd rentverse-frontend && npm install && npm run dev
```

### 3. AI Service (Terminal 3)
```cmd
cd rentverse-ai-service && pip install -r requirements.txt && python rentverse/main.py
```

---

## Access Your Application
Once all services are running:
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:5000  
- **AI Service**: http://localhost:8000

## Troubleshooting
- If ports are in use, close other applications or restart your computer
- Make sure you're in the correct directory: `C:\Users\mohdb\uitm-devops-challenge_THREE_DEVELOPER`
- If npm install fails, try: `npm cache clean --force` then `npm install`