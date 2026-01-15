import { useState } from "react";
import { Copy, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Layout from "@/components/Layout";

const API_BASE = process.env.REACT_APP_BACKEND_URL;

export default function ApiDocs() {
  const [copiedEndpoint, setCopiedEndpoint] = useState(null);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(id);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  const endpoints = [
    {
      id: "post-sensor",
      method: "POST",
      path: "/api/sensor/data",
      description: "Submit new sensor reading",
      requestBody: {
        temperature: 45.5,
        humidity: 55.0,
        sound_level: 70.0,
        sensor_id: "SENSOR_001"
      },
      response: {
        id: "uuid",
        temperature: 45.5,
        humidity: 55.0,
        sound_level: 70.0,
        timestamp: "2024-01-15T10:30:00Z",
        sensor_id: "SENSOR_001"
      }
    },
    {
      id: "get-readings",
      method: "GET",
      path: "/api/sensor/readings",
      description: "Get historical sensor readings",
      params: ["limit (int, default 100)", "sensor_id (optional)"],
      response: [
        {
          id: "uuid",
          temperature: 45.5,
          humidity: 55.0,
          sound_level: 70.0,
          timestamp: "2024-01-15T10:30:00Z",
          sensor_id: "SENSOR_001"
        }
      ]
    },
    {
      id: "post-predict",
      method: "POST",
      path: "/api/predict",
      description: "Get anomaly prediction for sensor data",
      requestBody: {
        temperature: 85.0,
        humidity: 20.0,
        sound_level: 105.0
      },
      response: {
        id: "uuid",
        reading_id: "uuid",
        anomaly_score: 0.85,
        is_anomaly: true,
        confidence: 0.92,
        timestamp: "2024-01-15T10:30:00Z",
        features: {
          temperature: 85.0,
          humidity: 20.0,
          sound_level: 105.0
        }
      }
    },
    {
      id: "get-predictions",
      method: "GET",
      path: "/api/predictions",
      description: "Get historical predictions",
      params: ["limit (int, default 100)", "anomalies_only (bool, default false)"],
      response: []
    },
    {
      id: "get-alerts",
      method: "GET",
      path: "/api/alerts",
      description: "Get system alerts",
      params: ["limit (int, default 50)", "unacknowledged_only (bool)"],
      response: [
        {
          id: "uuid",
          prediction_id: "uuid",
          severity: "high",
          message: "Anomaly detected: Temp=85°C",
          acknowledged: false,
          timestamp: "2024-01-15T10:30:00Z"
        }
      ]
    },
    {
      id: "put-acknowledge",
      method: "PUT",
      path: "/api/alerts/{alert_id}/acknowledge",
      description: "Acknowledge an alert",
      response: { message: "Alert acknowledged" }
    },
    {
      id: "get-status",
      method: "GET",
      path: "/api/system/status",
      description: "Get system status and statistics",
      response: {
        status: "operational",
        model_loaded: true,
        total_readings: 1500,
        total_predictions: 1500,
        anomalies_detected: 150,
        uptime: "2d 5h 30m"
      }
    },
    {
      id: "post-simulate",
      method: "POST",
      path: "/api/sensor/simulate",
      description: "Generate simulated sensor data for testing",
      params: ["count (int, default 1)", "include_anomalies (bool, default true)"],
      response: {
        message: "Generated 10 simulated readings",
        readings: [],
        predictions: []
      }
    },
    {
      id: "get-stats",
      method: "GET",
      path: "/api/stats/summary",
      description: "Get statistical summary of sensor data",
      response: {
        total_readings: 100,
        avg_temperature: 45.5,
        avg_humidity: 55.0,
        avg_sound_level: 70.0,
        anomaly_rate: 10.5
      }
    },
    {
      id: "post-retrain",
      method: "POST",
      path: "/api/model/retrain",
      description: "Retrain the anomaly detection model",
      response: {
        message: "Model retrained with stored data",
        samples: 1500
      }
    }
  ];

  const getMethodColor = (method) => {
    switch (method) {
      case "GET": return "text-success bg-success/10 border-success/30";
      case "POST": return "text-primary bg-primary/10 border-primary/30";
      case "PUT": return "text-warning bg-warning/10 border-warning/30";
      case "DELETE": return "text-danger bg-danger/10 border-danger/30";
      default: return "text-text-muted bg-surface border-surface-highlight";
    }
  };

  return (
    <Layout>
      <div className="p-6 space-y-6" data-testid="api-docs-page">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-white text-glow">
              API Documentation
            </h1>
            <p className="text-text-muted mt-1">
              RESTful API endpoints for the IoT Anomaly Detection System
            </p>
          </div>
          <a 
            href={`${API_BASE}/docs`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 btn-secondary px-4 py-2 text-sm"
            data-testid="swagger-link"
          >
            <ExternalLink className="w-4 h-4" />
            Open Swagger UI
          </a>
        </div>

        {/* Base URL */}
        <div className="card-industrial p-4">
          <div className="text-xs uppercase tracking-wider text-text-muted mb-2">Base URL</div>
          <div className="flex items-center gap-2">
            <code className="font-mono text-primary flex-1">{API_BASE}/api</code>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => copyToClipboard(`${API_BASE}/api`, 'base')}
              data-testid="copy-base-url"
            >
              {copiedEndpoint === 'base' ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Endpoints */}
        <div className="space-y-4">
          {endpoints.map((endpoint) => (
            <div key={endpoint.id} className="card-industrial" data-testid={`endpoint-${endpoint.id}`}>
              <div className="p-4 border-b border-surface-highlight">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 text-xs font-mono font-bold border ${getMethodColor(endpoint.method)}`}>
                    {endpoint.method}
                  </span>
                  <code className="font-mono text-white flex-1">{endpoint.path}</code>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => copyToClipboard(`${API_BASE}${endpoint.path}`, endpoint.id)}
                  >
                    {copiedEndpoint === endpoint.id ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-text-muted text-sm mt-2">{endpoint.description}</p>
              </div>
              
              <div className="p-4">
                <Tabs defaultValue="response" className="w-full">
                  <TabsList className="bg-surface mb-4">
                    {endpoint.params && <TabsTrigger value="params">Parameters</TabsTrigger>}
                    {endpoint.requestBody && <TabsTrigger value="request">Request Body</TabsTrigger>}
                    <TabsTrigger value="response">Response</TabsTrigger>
                  </TabsList>
                  
                  {endpoint.params && (
                    <TabsContent value="params">
                      <ul className="space-y-1 text-sm">
                        {endpoint.params.map((param, i) => (
                          <li key={i} className="font-mono text-text-muted">
                            <span className="text-primary">•</span> {param}
                          </li>
                        ))}
                      </ul>
                    </TabsContent>
                  )}
                  
                  {endpoint.requestBody && (
                    <TabsContent value="request">
                      <pre className="code-block text-sm overflow-x-auto">
                        {JSON.stringify(endpoint.requestBody, null, 2)}
                      </pre>
                    </TabsContent>
                  )}
                  
                  <TabsContent value="response">
                    <pre className="code-block text-sm overflow-x-auto">
                      {JSON.stringify(endpoint.response, null, 2)}
                    </pre>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          ))}
        </div>

        {/* Example Usage */}
        <div className="card-industrial p-6">
          <h3 className="text-sm font-medium uppercase tracking-wider text-text-muted mb-4">
            Example: cURL Request
          </h3>
          <pre className="code-block text-sm overflow-x-auto">
{`# Submit sensor data and get anomaly prediction
curl -X POST "${API_BASE}/api/predict" \\
  -H "Content-Type: application/json" \\
  -d '{
    "temperature": 85.0,
    "humidity": 20.0,
    "sound_level": 105.0
  }'`}
          </pre>
        </div>
      </div>
    </Layout>
  );
}
