# WINDOWS TERMINAL COMMANDS FOR RENTVERSE

## 🔧 Windows-Specific Commands

### Open Command Prompt or PowerShell
- Press `Win + R`, type `cmd` or `PowerShell`, press Enter
- Or press `Win + X` and select "Terminal" or "Command Prompt"

### Navigate to Your Project
```cmd
cd C:\Users\mohdb\uitm-devops-challenge_THREE_DEVELOPER
```

---

## 🚀 START YOUR SERVERS

### Terminal 1 - Backend Server (Start This FIRST)

Open **first terminal window**:

```cmd
cd rentverse-backend
dir  (to check files are there)
npm install
npm run dev
```

**Expected output:**
- "Server running on port 5000"
- "Database connected" (if database is working)

---

### Terminal 2 - Frontend Server

Open **second terminal window**:

```cmd
cd rentverse-frontend
dir  (to check files are there)  
npm install
npm run dev
```

**Expected output:**
- "Local: http://localhost:3001"
- "Ready in" and build time

---

### Terminal 3 - AI Service (Optional)

Open **third terminal window**:

```cmd
cd rentverse-ai-service
dir  (to check files are there)
pip install -r requirements.txt
python rentverse/main.py
```

**Expected output:**
- "Running on http://127.0.0.1:8000"

---

## 🎯 QUICK START COMMANDS

### Copy-Paste These Into Your Windows Terminal:

#### 1. Backend (Terminal 1)
```cmd
cd rentverse-backend && npm install && npm run dev
```

#### 2. Frontend (Terminal 2)
```cmd
cd rentverse-frontend && npm install && npm run dev
```

#### 3. AI Service (Terminal 3)
```cmd
cd rentverse-ai-service && pip install -r requirements.txt && python rentverse/main.py
```

---

## 🌐 Access Your Application

Once all services are running:
- **Frontend**: http://localhost:3001
- **Backend API**: http://localhost:5000
- **AI Service**: http://localhost:8000

---

## ❗ Common Windows Issues & Solutions

### Issue: "npm is not recognized"
**Solution**: Install Node.js from https://nodejs.org

### Issue: "pip is not recognized"  
**Solution**: Install Python from https://python.org and check "Add to PATH"

### Issue: "Port already in use"
**Solution**: 
```cmd
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F
```

### Issue: "Access denied"
**Solution**: Run terminal as Administrator

---

## 🎯 Verify Everything Works

1. Check all terminals show "running" messages
2. Open browser to http://localhost:3001
3. You should see the Rentverse homepage
4. If you get errors, check the terminal output for details

---

## 🛑 Stopping the Servers

In each terminal, press `Ctrl + C` to stop the servers gracefully.

---

## 💡 Pro Tips

- Keep all 3 terminals open while developing
- Frontend will auto-reload when you make changes
- Backend will auto-restart when you save files
- Check terminal logs if something isn't working