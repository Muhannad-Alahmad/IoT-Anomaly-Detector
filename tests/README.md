# Tests Directory

This directory contains tests for the IoT Anomaly Detection System.

## Running Tests

### Backend API Tests

```bash
cd backend
source venv/bin/activate
pytest tests/ -v
```

### Manual API Testing

```bash
# Health check
curl http://localhost:8001/api/health

# Test normal data prediction
curl -X POST "http://localhost:8001/api/predict" \
  -H "Content-Type: application/json" \
  -d '{"temperature": 45, "humidity": 55, "sound_level": 70}'

# Test anomalous data prediction
curl -X POST "http://localhost:8001/api/predict" \
  -H "Content-Type: application/json" \
  -d '{"temperature": 95, "humidity": 15, "sound_level": 115}'

# Generate sample data
curl -X POST "http://localhost:8001/api/sensor/simulate?count=20"
```

## Test Coverage

- [ ] API endpoint tests
- [ ] ML model prediction tests
- [ ] Database connection tests
- [ ] Frontend component tests
