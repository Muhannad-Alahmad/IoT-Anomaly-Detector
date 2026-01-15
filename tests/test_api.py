"""
IoT Anomaly Detection System - API Tests

Run with: pytest tests/test_api.py -v
"""

import requests
import pytest

BASE_URL = "http://localhost:8001/api"


class TestHealthEndpoint:
    """Test health check endpoint"""
    
    def test_health_check(self):
        """Test that health endpoint returns healthy status"""
        response = requests.get(f"{BASE_URL}/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "timestamp" in data


class TestSensorEndpoints:
    """Test sensor data endpoints"""
    
    def test_submit_sensor_data(self):
        """Test submitting sensor data"""
        payload = {
            "temperature": 45.0,
            "humidity": 55.0,
            "sound_level": 70.0
        }
        response = requests.post(f"{BASE_URL}/sensor/data", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["temperature"] == 45.0
        assert data["humidity"] == 55.0
        assert data["sound_level"] == 70.0
    
    def test_get_sensor_readings(self):
        """Test retrieving sensor readings"""
        response = requests.get(f"{BASE_URL}/sensor/readings?limit=10")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_simulate_data(self):
        """Test data simulation endpoint"""
        response = requests.post(f"{BASE_URL}/sensor/simulate?count=5")
        assert response.status_code == 200
        data = response.json()
        assert len(data["readings"]) == 5
        assert len(data["predictions"]) == 5


class TestPredictionEndpoints:
    """Test anomaly prediction endpoints"""
    
    def test_predict_normal_data(self):
        """Test prediction with normal sensor values"""
        payload = {
            "temperature": 45.0,
            "humidity": 55.0,
            "sound_level": 70.0
        }
        response = requests.post(f"{BASE_URL}/predict", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "anomaly_score" in data
        assert "is_anomaly" in data
        assert "confidence" in data
        # Normal data should not be flagged as anomaly
        assert data["is_anomaly"] == False
    
    def test_predict_anomalous_data(self):
        """Test prediction with anomalous sensor values"""
        payload = {
            "temperature": 95.0,
            "humidity": 15.0,
            "sound_level": 115.0
        }
        response = requests.post(f"{BASE_URL}/predict", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert "anomaly_score" in data
        assert "is_anomaly" in data
        # Anomalous data should be flagged
        assert data["is_anomaly"] == True
    
    def test_get_predictions(self):
        """Test retrieving prediction history"""
        response = requests.get(f"{BASE_URL}/predictions?limit=10")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)


class TestSystemEndpoints:
    """Test system status endpoints"""
    
    def test_system_status(self):
        """Test system status endpoint"""
        response = requests.get(f"{BASE_URL}/system/status")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "operational"
        assert data["model_loaded"] == True
        assert "total_readings" in data
        assert "total_predictions" in data
    
    def test_stats_summary(self):
        """Test statistics summary endpoint"""
        response = requests.get(f"{BASE_URL}/stats/summary")
        assert response.status_code == 200
        data = response.json()
        assert "avg_temperature" in data or "total_readings" in data


class TestAlertEndpoints:
    """Test alert endpoints"""
    
    def test_get_alerts(self):
        """Test retrieving alerts"""
        response = requests.get(f"{BASE_URL}/alerts?limit=10")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
