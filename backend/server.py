from fastapi import FastAPI, APIRouter, HTTPException, BackgroundTasks
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import numpy as np
from sklearn.ensemble import IsolationForest
import joblib
import random
import asyncio

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="IoT Anomaly Detection System", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ==================== MODELS ====================

class SensorReading(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    temperature: float = Field(..., description="Temperature in Celsius (15-100)")
    humidity: float = Field(..., description="Humidity percentage (20-90)")
    sound_level: float = Field(..., description="Sound level in decibels (40-120)")
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    sensor_id: str = Field(default="SENSOR_001")

class SensorReadingCreate(BaseModel):
    temperature: float
    humidity: float
    sound_level: float
    sensor_id: Optional[str] = "SENSOR_001"

class AnomalyPrediction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    reading_id: str
    anomaly_score: float
    is_anomaly: bool
    confidence: float
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    features: dict

class SystemStatus(BaseModel):
    status: str
    model_loaded: bool
    total_readings: int
    total_predictions: int
    anomalies_detected: int
    uptime: str

class Alert(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    prediction_id: str
    severity: str  # low, medium, high, critical
    message: str
    acknowledged: bool = False
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

# ==================== ML MODEL ====================

MODEL_PATH = ROOT_DIR / "anomaly_model.joblib"
model = None
start_time = datetime.now(timezone.utc)

def train_initial_model():
    """Train initial Isolation Forest model with synthetic data"""
    global model
    
    # Generate synthetic normal data
    np.random.seed(42)
    n_samples = 1000
    
    # Normal operating ranges
    normal_temp = np.random.normal(45, 8, n_samples)  # 45°C ± 8
    normal_humidity = np.random.normal(55, 10, n_samples)  # 55% ± 10
    normal_sound = np.random.normal(70, 10, n_samples)  # 70dB ± 10
    
    # Add some anomalous data (10%)
    n_anomalies = 100
    anomaly_temp = np.random.uniform(80, 100, n_anomalies)  # High temp
    anomaly_humidity = np.random.uniform(10, 25, n_anomalies)  # Low humidity
    anomaly_sound = np.random.uniform(100, 120, n_anomalies)  # High sound
    
    # Combine data
    X_normal = np.column_stack([normal_temp, normal_humidity, normal_sound])
    X_anomaly = np.column_stack([anomaly_temp, anomaly_humidity, anomaly_sound])
    X = np.vstack([X_normal, X_anomaly])
    
    # Train Isolation Forest
    model = IsolationForest(
        n_estimators=100,
        contamination=0.1,
        random_state=42,
        max_samples='auto'
    )
    model.fit(X)
    
    # Save model
    joblib.dump(model, MODEL_PATH)
    logger.info("Anomaly detection model trained and saved")
    return model

def load_or_train_model():
    """Load existing model or train new one"""
    global model
    if MODEL_PATH.exists():
        model = joblib.load(MODEL_PATH)
        logger.info("Loaded existing anomaly detection model")
    else:
        model = train_initial_model()
    return model

def predict_anomaly(temperature: float, humidity: float, sound_level: float) -> dict:
    """Predict anomaly score for sensor reading"""
    global model
    if model is None:
        load_or_train_model()
    
    features = np.array([[temperature, humidity, sound_level]])
    
    # Get anomaly score (-1 for anomaly, 1 for normal)
    prediction = model.predict(features)[0]
    # Get decision function score (more negative = more anomalous)
    score = model.decision_function(features)[0]
    
    # Convert to 0-1 scale where 1 is anomalous
    anomaly_score = max(0, min(1, 0.5 - score))
    is_anomaly = prediction == -1
    confidence = abs(score) / 0.5  # Normalize confidence
    confidence = min(1, max(0, confidence))
    
    return {
        "anomaly_score": round(anomaly_score, 4),
        "is_anomaly": is_anomaly,
        "confidence": round(confidence, 4)
    }

def determine_severity(anomaly_score: float, features: dict) -> str:
    """Determine alert severity based on anomaly score and features"""
    temp = features.get('temperature', 0)
    humidity = features.get('humidity', 50)
    sound = features.get('sound_level', 70)
    
    # Critical conditions
    if temp > 90 or sound > 110 or humidity < 15:
        return "critical"
    elif anomaly_score > 0.8:
        return "high"
    elif anomaly_score > 0.6:
        return "medium"
    else:
        return "low"

# ==================== ROUTES ====================

@api_router.get("/")
async def root():
    return {"message": "IoT Anomaly Detection System API", "version": "1.0.0"}

@api_router.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}

# Sensor Data Endpoints
@api_router.post("/sensor/data", response_model=SensorReading)
async def create_sensor_reading(input: SensorReadingCreate):
    """Receive sensor data and store it"""
    reading = SensorReading(
        temperature=input.temperature,
        humidity=input.humidity,
        sound_level=input.sound_level,
        sensor_id=input.sensor_id or "SENSOR_001"
    )
    
    doc = reading.model_dump()
    await db.sensor_readings.insert_one(doc)
    
    return reading

@api_router.get("/sensor/readings", response_model=List[SensorReading])
async def get_sensor_readings(limit: int = 100, sensor_id: Optional[str] = None):
    """Get historical sensor readings"""
    query = {}
    if sensor_id:
        query["sensor_id"] = sensor_id
    
    readings = await db.sensor_readings.find(
        query, {"_id": 0}
    ).sort("timestamp", -1).limit(limit).to_list(limit)
    
    return readings

@api_router.get("/sensor/latest", response_model=Optional[SensorReading])
async def get_latest_reading(sensor_id: str = "SENSOR_001"):
    """Get the latest sensor reading"""
    reading = await db.sensor_readings.find_one(
        {"sensor_id": sensor_id}, {"_id": 0}, sort=[("timestamp", -1)]
    )
    return reading

# Prediction Endpoints
@api_router.post("/predict", response_model=AnomalyPrediction)
async def predict_from_reading(input: SensorReadingCreate, background_tasks: BackgroundTasks):
    """Predict anomaly from sensor data and optionally store reading"""
    # Store the reading
    reading = SensorReading(
        temperature=input.temperature,
        humidity=input.humidity,
        sound_level=input.sound_level,
        sensor_id=input.sensor_id or "SENSOR_001"
    )
    await db.sensor_readings.insert_one(reading.model_dump())
    
    # Get prediction
    result = predict_anomaly(input.temperature, input.humidity, input.sound_level)
    
    features = {
        "temperature": input.temperature,
        "humidity": input.humidity,
        "sound_level": input.sound_level
    }
    
    prediction = AnomalyPrediction(
        reading_id=reading.id,
        anomaly_score=result["anomaly_score"],
        is_anomaly=result["is_anomaly"],
        confidence=result["confidence"],
        features=features
    )
    
    await db.predictions.insert_one(prediction.model_dump())
    
    # Create alert if anomaly detected
    if result["is_anomaly"]:
        severity = determine_severity(result["anomaly_score"], features)
        alert = Alert(
            prediction_id=prediction.id,
            severity=severity,
            message=f"Anomaly detected: Temp={input.temperature}°C, Humidity={input.humidity}%, Sound={input.sound_level}dB"
        )
        await db.alerts.insert_one(alert.model_dump())
    
    return prediction

@api_router.get("/predictions", response_model=List[AnomalyPrediction])
async def get_predictions(limit: int = 100, anomalies_only: bool = False):
    """Get historical predictions"""
    query = {}
    if anomalies_only:
        query["is_anomaly"] = True
    
    predictions = await db.predictions.find(
        query, {"_id": 0}
    ).sort("timestamp", -1).limit(limit).to_list(limit)
    
    return predictions

@api_router.get("/predictions/latest", response_model=Optional[AnomalyPrediction])
async def get_latest_prediction():
    """Get the most recent prediction"""
    prediction = await db.predictions.find_one(
        {}, {"_id": 0}, sort=[("timestamp", -1)]
    )
    return prediction

# Alert Endpoints
@api_router.get("/alerts", response_model=List[Alert])
async def get_alerts(limit: int = 50, unacknowledged_only: bool = False):
    """Get system alerts"""
    query = {}
    if unacknowledged_only:
        query["acknowledged"] = False
    
    alerts = await db.alerts.find(
        query, {"_id": 0}
    ).sort("timestamp", -1).limit(limit).to_list(limit)
    
    return alerts

@api_router.put("/alerts/{alert_id}/acknowledge")
async def acknowledge_alert(alert_id: str):
    """Acknowledge an alert"""
    result = await db.alerts.update_one(
        {"id": alert_id},
        {"$set": {"acknowledged": True}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Alert not found")
    return {"message": "Alert acknowledged"}

# System Status
@api_router.get("/system/status", response_model=SystemStatus)
async def get_system_status():
    """Get system status and statistics"""
    total_readings = await db.sensor_readings.count_documents({})
    total_predictions = await db.predictions.count_documents({})
    anomalies_detected = await db.predictions.count_documents({"is_anomaly": True})
    
    uptime = datetime.now(timezone.utc) - start_time
    uptime_str = f"{uptime.days}d {uptime.seconds // 3600}h {(uptime.seconds % 3600) // 60}m"
    
    return SystemStatus(
        status="operational",
        model_loaded=model is not None,
        total_readings=total_readings,
        total_predictions=total_predictions,
        anomalies_detected=anomalies_detected,
        uptime=uptime_str
    )

# Simulation Endpoint
@api_router.post("/sensor/simulate")
async def simulate_sensor_data(count: int = 1, include_anomalies: bool = True):
    """Generate simulated sensor data for testing"""
    readings = []
    predictions = []
    
    for i in range(count):
        # Determine if this should be an anomaly (20% chance if include_anomalies)
        is_anomaly_data = include_anomalies and random.random() < 0.2
        
        if is_anomaly_data:
            # Generate anomalous data
            temp = random.uniform(80, 100)
            humidity = random.uniform(10, 25)
            sound = random.uniform(100, 120)
        else:
            # Generate normal data
            temp = random.gauss(45, 8)
            humidity = random.gauss(55, 10)
            sound = random.gauss(70, 10)
        
        # Clamp values
        temp = max(15, min(100, temp))
        humidity = max(20, min(90, humidity))
        sound = max(40, min(120, sound))
        
        reading = SensorReading(
            temperature=round(temp, 2),
            humidity=round(humidity, 2),
            sound_level=round(sound, 2),
            sensor_id="SENSOR_001"
        )
        await db.sensor_readings.insert_one(reading.model_dump())
        readings.append(reading)
        
        # Get prediction
        result = predict_anomaly(temp, humidity, sound)
        features = {
            "temperature": round(temp, 2),
            "humidity": round(humidity, 2),
            "sound_level": round(sound, 2)
        }
        
        prediction = AnomalyPrediction(
            reading_id=reading.id,
            anomaly_score=result["anomaly_score"],
            is_anomaly=result["is_anomaly"],
            confidence=result["confidence"],
            features=features
        )
        await db.predictions.insert_one(prediction.model_dump())
        predictions.append(prediction)
        
        # Create alert if anomaly
        if result["is_anomaly"]:
            severity = determine_severity(result["anomaly_score"], features)
            alert = Alert(
                prediction_id=prediction.id,
                severity=severity,
                message=f"Anomaly detected: Temp={round(temp, 1)}°C, Humidity={round(humidity, 1)}%, Sound={round(sound, 1)}dB"
            )
            await db.alerts.insert_one(alert.model_dump())
    
    return {
        "message": f"Generated {count} simulated readings",
        "readings": readings,
        "predictions": predictions
    }

# Statistics Endpoint
@api_router.get("/stats/summary")
async def get_statistics_summary():
    """Get statistical summary of sensor data"""
    # Get recent readings
    readings = await db.sensor_readings.find(
        {}, {"_id": 0}
    ).sort("timestamp", -1).limit(100).to_list(100)
    
    if not readings:
        return {
            "total_readings": 0,
            "avg_temperature": 0,
            "avg_humidity": 0,
            "avg_sound_level": 0,
            "anomaly_rate": 0
        }
    
    temps = [r["temperature"] for r in readings]
    humidities = [r["humidity"] for r in readings]
    sounds = [r["sound_level"] for r in readings]
    
    total_predictions = await db.predictions.count_documents({})
    anomalies = await db.predictions.count_documents({"is_anomaly": True})
    anomaly_rate = (anomalies / total_predictions * 100) if total_predictions > 0 else 0
    
    return {
        "total_readings": len(readings),
        "avg_temperature": round(sum(temps) / len(temps), 2),
        "avg_humidity": round(sum(humidities) / len(humidities), 2),
        "avg_sound_level": round(sum(sounds) / len(sounds), 2),
        "min_temperature": round(min(temps), 2),
        "max_temperature": round(max(temps), 2),
        "min_humidity": round(min(humidities), 2),
        "max_humidity": round(max(humidities), 2),
        "min_sound_level": round(min(sounds), 2),
        "max_sound_level": round(max(sounds), 2),
        "anomaly_rate": round(anomaly_rate, 2)
    }

# Model Management
@api_router.post("/model/retrain")
async def retrain_model():
    """Retrain the anomaly detection model with stored data"""
    readings = await db.sensor_readings.find({}, {"_id": 0}).to_list(5000)
    
    if len(readings) < 100:
        # Use synthetic data if not enough real data
        train_initial_model()
        return {"message": "Model retrained with synthetic data", "samples": 1100}
    
    # Use stored readings
    X = np.array([
        [r["temperature"], r["humidity"], r["sound_level"]]
        for r in readings
    ])
    
    global model
    model = IsolationForest(
        n_estimators=100,
        contamination=0.1,
        random_state=42
    )
    model.fit(X)
    joblib.dump(model, MODEL_PATH)
    
    return {"message": "Model retrained with stored data", "samples": len(readings)}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    """Initialize model on startup"""
    load_or_train_model()
    logger.info("IoT Anomaly Detection System started")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
