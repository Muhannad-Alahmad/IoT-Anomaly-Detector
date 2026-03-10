<div align="center">
<h1>IoT Anomaly Detection System</h1>



[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-green.svg)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-47A248.svg)](https://www.mongodb.com/docs/)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.8-F7931E.svg)](https://scikit-learn.org/stable/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**A real-time anomaly detection system for industrial IoT sensor data using Machine Learning**

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Running the System](#-running-the-system)
- [Verification](#-verification)
- [API Reference](#-api-reference)
- [Machine Learning Model](#-machine-learning-model)
- [Project Structure](#-project-structure)
- [Troubleshooting](#-troubleshooting)
- [Presentation](#-presentation)
- [License](#-license)

---

## 🎯 Overview

This project implements a **stream processing anomaly detection system** for a wind turbine component factory. The system monitors sensor data (Temperature, Humidity, and Sound levels) in real-time to detect production anomalies and alert the factory operators.

### Key Components
- **Isolation Forest ML Model** - Unsupervised anomaly detection
- **FastAPI Backend** - RESTful API for data ingestion and predictions
- **React Dashboard** - Real-time monitoring interface
- **MongoDB** - Data persistence

---

## 📋 Prerequisites

### Required Software

| Software        | Version | Download Link                                  |
|-----------------|---------|------------------------------------------------|
| **Python**      | 3.11+   | https://www.python.org/downloads/              |
| **Node.js LTS** | 18+     | https://nodejs.org/                            |
| **Yarn**        | 1.22+   | https://nodejs.org/                            |
| **MongoDB**     | 6.0+    | https://www.mongodb.com/try/download/community |

### Verify Installations

Open **Command Prompt** or **PowerShell** and run:

```cmd
python --version
node --version
```

### Install Yarn

```cmd
npm install -g yarn
yarn --version
```

---

## 📦 Installation & Setup

### Step 1: Extract the Project

Extract the downloaded ZIP file and open a terminal in the project folder.

### Step 2: Backend Setup

Open a terminal and navigate to the backend folder:

```cmd
cd backend

REM Create virtual environment
python -m venv venv

REM Activate virtual environment
venv\Scripts\activate

REM Install Python dependencies
pip install -r requirements.txt

REM Create environment file from template
copy env.example .env
```

### Step 3: Frontend Setup

Open a **new terminal** and navigate to the frontend folder:

```cmd
cd frontend

REM Install Node.js dependencies (this may take 1-2 minutes)
yarn install

REM Create environment file from template
copy env.example .env
```

> **_Note:_** Use `yarn install`, not `npm install`, to avoid peer dependency conflicts.

### Step 4: Verify Environment Files

**backend\ .env** should contain:
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=iot_anomaly_detection
CORS_ORIGINS=*
```

**frontend\ .env** should contain:
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

---

## 🚀 Running the System

### Start Order: MongoDB → Backend → Frontend

You will need **3 separate terminals**.

---

### Terminal 1: Start MongoDB

If MongoDB is installed as a Windows service (default), it should already be running.

**Check if running:**
- Open **Services** app (search "Services" in Start menu)
- Look for **"MongoDB Server"** - Status should be "Running"

**If not running, start manually:**
```cmd
"C:\Program Files\MongoDB\Server\<your-version>\bin\mongod.exe" --dbpath "C:\data\db"
```
> **_Note:_** Replace <your-version> with your installed MongoDB folder (for example 8.2). You can find it in:
C:\Program Files\MongoDB\Server\


**Alternative: MongoDB Compass**
- Open MongoDB Compass
- Connect to `mongodb://localhost:27017`

---

### Terminal 2: Start Backend

```cmd
cd backend
venv\Scripts\activate
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

**Expected output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8001
INFO:     Anomaly detection model trained and saved
INFO:     IoT Anomaly Detection System started
INFO:     Application startup complete.
```

✅ Keep this terminal open!

---

### Terminal 3: Start Frontend

```cmd
cd frontend
yarn start
```

**Expected output:**
```
Compiled successfully!

You can now view frontend in the browser.

  Local:            http://localhost:3000
```

✅ Keep this terminal open!

---

## ✅ Verification

### 1. Open the Dashboard

Open your browser and go to:
```
http://localhost:3000
```

You should see the **IoT Anomaly Detection Control Room** dashboard.
> **_Note:_** On first run the dashboard may be empty. Click **Generate Data** to populate sample sensor readings.

### 2. Test API Endpoints

Open **PowerShell** and run:

**Health Check:**
```powershell
Invoke-RestMethod -Uri "http://localhost:8001/api/health"
```

**Generate Sample Data (50 readings):**
```powershell
Invoke-RestMethod -Method POST -Uri "http://localhost:8001/api/sensor/simulate?count=50"
```

**Check System Status:**
```powershell
Invoke-RestMethod -Uri "http://localhost:8001/api/system/status"
```

**Alternative:** Open these URLs directly in your browser:
- http://localhost:8001/api/health
- http://localhost:8001/docs (Swagger UI)

### 3. Test via Dashboard

1. Click **"Generate Data"** button → Shows "Generated 10 sensor readings"
2. Click **"Start Stream"** → Continuous data every 2 seconds
3. Navigate to **History** tab → Charts and data table appear
4. Navigate to **API Docs** tab → Endpoint documentation

---

## 📚 API Reference

### Base URL
```
http://localhost:8001/api
```

### Endpoints

| Method | Endpoint                               | Description                          |
|--------|----------------------------------------|--------------------------------------|
| `GET`  | `/health`                              | Health check                         |
| `POST` | `/sensor/data`                         | Submit sensor reading                |
| `GET`  | `/sensor/readings?limit=100`           | Get historical readings              |
| `POST` | `/predict`                             | Submit data & get anomaly prediction |
| `GET`  | `/predictions`                         | Get prediction history               |
| `GET`  | `/alerts`                              | Get active alerts                    |
| `PUT`  | `/api/alerts/{alert_id}/acknowledge`   | Acknowledge alert                    |
| `GET`  | `/system/status`                       | System statistics                    |
| `POST` | `/sensor/simulate?count=10`            | Generate test data                   |
| `POST` | `/model/retrain`                       | Retrain ML model                     |

### Interactive Documentation

Open http://localhost:8001/docs for Swagger UI with interactive testing.

---

## 🧠 Machine Learning Model

### Algorithm: Isolation Forest

- **Type:** Unsupervised anomaly detection
- **Training:** Auto-trains on startup with synthetic data
- **Features:** Temperature, Humidity, Sound Level
- **Output:** Anomaly score (0-1) and binary classification

### Configuration
```python
IsolationForest(
    n_estimators=100,
    contamination=0.1,  # 10% expected anomaly rate
    random_state=42
)
```

### Severity Classification

| Severity     | Condition                                      |
|--------------|------------------------------------------------|
| **Critical** | Temp > 90°C OR Sound > 110dB OR Humidity < 15% |
| **High**     | Anomaly Score > 0.8                            |
| **Medium**   | Anomaly Score > 0.6                            |
| **Low**      | Anomaly Score ≤ 0.6                            |

### Data Generation

All data is **locally generated/simulated** - no external APIs or datasets required:
- Normal: Gaussian (temp μ=45, σ=8; hum μ=55, σ=10; sound μ=70, σ=10)
- Anomaly: Uniform (temp 80–100°C; hum 10–25%; sound 100–120 dB)

---

## 📁 Project Structure

```
IoT-Anomaly-Detector\
├── backend\
│   ├── server.py              # FastAPI app + ML model
│   ├── anomaly_model.joblib   # Trained model (auto-generated)
│   ├── requirements.txt       # Python dependencies
│   ├── env.example            # Environment template
│   └── .env                   # Your environment config
│
├── frontend\
│   ├── public\
│   │   ├── index.html         # React HTML template
│   │   └── presentation.pdf   # Project presentation (16:9)
│   ├── src\
│   │   ├── components\        # React components
│   │   ├── pages\             # Dashboard, History, ApiDocs, Architecture
│   │   ├── App.js             # Root component
│   │   └── index.css          # Global styles
│   ├──  package.json          # Node dependencies
│   ├──  env.example           # Environment template
│   └── .env                   # Your environment config
│
├── tests\
│   ├── test_api.py            # API tests
│   └── README.md              # Testing instructions
│
├── .gitignore                 # Git ignore rules
├── LICENSE                    # MIT License
└── README.md                  # This file
```

---

## 🔧 Troubleshooting

### ❌ "Module not found" when starting backend

**Fix:** Virtual environment not activated or dependencies missing
```cmd
cd backend
venv\Scripts\activate
pip install -r requirements.txt
```

### ❌ MongoDB connection error

**Fix:** MongoDB service not running
1. Open **Services** app
2. Find **"MongoDB Server"**
3. Right-click → **Start**

Or run manually:
```cmd
net start MongoDB
```

### ❌ Port 8001 already in use

**Fix:** Kill the process using the port
```cmd
netstat -ano | findstr :8001
taskkill /PID <PID_NUMBER> /F
```

### ❌ Port 3000 already in use

**Fix:** When `yarn start` asks "Would you like to run on another port?", type `Y`

### ❌ Peer dependency errors with npm

**Fix:** Use Yarn instead of npm
```cmd
yarn install
```

### ❌ Python not recognized

**Fix:** Python not in PATH
1. Re-run Python installer
2. Check ✅ **"Add Python to PATH"**
3. Restart terminal

### ❌ Dashboard shows no data

**Fix:** Generate sample data
```powershell
Invoke-RestMethod -Method POST -Uri "http://localhost:8001/api/sensor/simulate?count=50"
```
Or click **"Generate Data"** button in dashboard.

---

## 📊 Presentation

A 16-slide project presentation is included:
- **Location:** `frontend\public\presentation.pdf`
- **Access:** http://localhost:3000/presentation.pdf
- **Format:** 16:9 (1920x1080)

---

## 🛑 Stopping the System

1. **Frontend:** Press `Ctrl+C` in Terminal 3
2. **Backend:** Press `Ctrl+C` in Terminal 2
3. **MongoDB:** `net stop MongoDB` (if started manually)

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built for Industrial IoT Anomaly Detection**

*University Project - Stream Processing & Machine Learning*

</div>
