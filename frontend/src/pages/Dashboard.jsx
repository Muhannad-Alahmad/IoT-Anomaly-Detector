import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "sonner";
import { 
  Activity, 
  Thermometer, 
  Droplets, 
  Volume2, 
  AlertTriangle, 
  CheckCircle,
  RefreshCw,
  Play,
  Pause,
  Bell
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import Layout from "@/components/Layout";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function Dashboard() {
  const [latestReading, setLatestReading] = useState(null);
  const [latestPrediction, setLatestPrediction] = useState(null);
  const [recentReadings, setRecentReadings] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [systemStatus, setSystemStatus] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [readingsRes, predictionsRes, alertsRes, statusRes, latestRes] = await Promise.all([
        axios.get(`${API}/sensor/readings?limit=50`),
        axios.get(`${API}/predictions?limit=1`),
        axios.get(`${API}/alerts?limit=10&unacknowledged_only=true`),
        axios.get(`${API}/system/status`),
        axios.get(`${API}/sensor/latest`)
      ]);

      setRecentReadings(readingsRes.data.reverse());
      if (predictionsRes.data.length > 0) {
        setLatestPrediction(predictionsRes.data[0]);
      }
      setAlerts(alertsRes.data);
      setSystemStatus(statusRes.data);
      setLatestReading(latestRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    let streamInterval;
    if (isStreaming) {
      streamInterval = setInterval(async () => {
        try {
          await axios.post(`${API}/sensor/simulate?count=1&include_anomalies=true`);
          fetchData();
        } catch (error) {
          console.error("Error simulating data:", error);
          toast.error("Failed to simulate data");
        }
      }, 2000);
    }
    return () => clearInterval(streamInterval);
  }, [isStreaming, fetchData]);

  const handleSimulate = async (count = 10) => {
    try {
      const res = await axios.post(`${API}/sensor/simulate?count=${count}&include_anomalies=true`);
      toast.success(`Generated ${count} sensor readings`);
      fetchData();
    } catch (error) {
      toast.error("Failed to generate data");
    }
  };

  const acknowledgeAlert = async (alertId) => {
    try {
      await axios.put(`${API}/alerts/${alertId}/acknowledge`);
      toast.success("Alert acknowledged");
      fetchData();
    } catch (error) {
      toast.error("Failed to acknowledge alert");
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "critical": return "text-danger";
      case "high": return "text-[#FF6B6B]";
      case "medium": return "text-warning";
      case "low": return "text-success";
      default: return "text-text-muted";
    }
  };

  const getSeverityBadge = (severity) => {
    const classes = {
      critical: "badge-critical",
      high: "badge-high", 
      medium: "badge-medium",
      low: "badge-low"
    };
    return classes[severity] || "";
  };

  const chartData = recentReadings.map((r, i) => ({
    index: i,
    temperature: r.temperature,
    humidity: r.humidity,
    sound_level: r.sound_level,
    time: new Date(r.timestamp).toLocaleTimeString()
  }));

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="spinner" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-6 space-y-6" data-testid="dashboard">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-white text-glow">
              Control Room
            </h1>
            <p className="text-text-muted mt-1">
              Real-time monitoring of wind turbine production sensors
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => setIsStreaming(!isStreaming)}
              className={isStreaming ? "bg-danger hover:bg-danger/80" : "btn-primary"}
              data-testid="toggle-stream-btn"
            >
              {isStreaming ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
              {isStreaming ? "Stop Stream" : "Start Stream"}
            </Button>
            <Button 
              onClick={() => handleSimulate(10)}
              variant="outline"
              className="btn-secondary"
              data-testid="simulate-btn"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Generate Data
            </Button>
          </div>
        </div>

        {/* Status Bar */}
        {systemStatus && (
          <div className="card-industrial p-4 flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2">
              <span className={`status-dot ${systemStatus.status === "operational" ? "online" : "offline"}`} />
              <span className="text-sm font-medium uppercase tracking-wide">
                System {systemStatus.status}
              </span>
            </div>
            <div className="h-4 w-px bg-surface-highlight" />
            <div className="text-sm text-text-muted">
              <span className="font-mono text-primary">{systemStatus.total_readings}</span> Readings
            </div>
            <div className="text-sm text-text-muted">
              <span className="font-mono text-primary">{systemStatus.total_predictions}</span> Predictions
            </div>
            <div className="text-sm text-text-muted">
              <span className="font-mono text-danger">{systemStatus.anomalies_detected}</span> Anomalies
            </div>
            <div className="text-sm text-text-muted ml-auto">
              Uptime: <span className="font-mono text-primary">{systemStatus.uptime}</span>
            </div>
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sensor Gauges */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              title="Temperature"
              value={latestReading?.temperature || 0}
              unit="°C"
              icon={<Thermometer className="w-5 h-5" />}
              min={15}
              max={100}
              warningThreshold={75}
              criticalThreshold={85}
              color="#66FCF1"
            />
            <MetricCard
              title="Humidity"
              value={latestReading?.humidity || 0}
              unit="%"
              icon={<Droplets className="w-5 h-5" />}
              min={20}
              max={90}
              warningThreshold={30}
              criticalThreshold={20}
              invertWarning={true}
              color="#45A29E"
            />
            <MetricCard
              title="Sound Level"
              value={latestReading?.sound_level || 0}
              unit="dB"
              icon={<Volume2 className="w-5 h-5" />}
              min={40}
              max={120}
              warningThreshold={95}
              criticalThreshold={105}
              color="#F9ED69"
            />
          </div>

          {/* Anomaly Score */}
          <div className={`card-industrial p-6 ${latestPrediction?.is_anomaly ? 'anomaly' : ''}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium uppercase tracking-wider text-text-muted">
                Anomaly Detection
              </h3>
              {latestPrediction?.is_anomaly ? (
                <AlertTriangle className="w-5 h-5 text-danger alert-pulse" />
              ) : (
                <CheckCircle className="w-5 h-5 text-success" />
              )}
            </div>
            <div className="text-center py-4">
              <div className={`data-value ${latestPrediction?.is_anomaly ? 'text-danger' : 'text-success'}`}>
                {latestPrediction ? (latestPrediction.anomaly_score * 100).toFixed(1) : 0}%
              </div>
              <div className="data-label mt-2">Anomaly Score</div>
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Status</span>
                <span className={latestPrediction?.is_anomaly ? 'text-danger font-semibold' : 'text-success'}>
                  {latestPrediction?.is_anomaly ? 'ANOMALY DETECTED' : 'Normal'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Confidence</span>
                <span className="font-mono text-primary">
                  {latestPrediction ? (latestPrediction.confidence * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sensor Trends Chart */}
          <div className="lg:col-span-2 card-industrial p-6">
            <h3 className="text-sm font-medium uppercase tracking-wider text-text-muted mb-4">
              Sensor Trends
            </h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#66FCF1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#66FCF1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="humidGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#45A29E" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#45A29E" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="soundGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F9ED69" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#F9ED69" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2C353F" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#C5C6C7" 
                    tick={{ fill: '#C5C6C7', fontSize: 11 }}
                    interval="preserveStartEnd"
                  />
                  <YAxis stroke="#C5C6C7" tick={{ fill: '#C5C6C7', fontSize: 11 }} />
                  <Tooltip 
                    contentStyle={{ 
                      background: '#0B0C10', 
                      border: '1px solid #66FCF1',
                      borderRadius: '4px'
                    }}
                    labelStyle={{ color: '#C5C6C7' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="temperature" 
                    stroke="#66FCF1" 
                    fill="url(#tempGradient)"
                    strokeWidth={2}
                    name="Temperature (°C)"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="humidity" 
                    stroke="#45A29E" 
                    fill="url(#humidGradient)"
                    strokeWidth={2}
                    name="Humidity (%)"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="sound_level" 
                    stroke="#F9ED69" 
                    fill="url(#soundGradient)"
                    strokeWidth={2}
                    name="Sound (dB)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Alerts Panel */}
          <div className="card-industrial p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium uppercase tracking-wider text-text-muted">
                Active Alerts
              </h3>
              <Bell className="w-4 h-4 text-text-muted" />
            </div>
            <ScrollArea className="h-[280px]">
              {alerts.length === 0 ? (
                <div className="text-center py-8 text-text-muted">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-success" />
                  <p>No active alerts</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {alerts.map((alert) => (
                    <div 
                      key={alert.id} 
                      className={`alert-item ${alert.severity} p-3 cursor-pointer`}
                      onClick={() => acknowledgeAlert(alert.id)}
                      data-testid={`alert-item-${alert.id}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 text-xs font-mono uppercase ${getSeverityBadge(alert.severity)}`}>
                              {alert.severity}
                            </span>
                          </div>
                          <p className="text-sm text-text-muted truncate">
                            {alert.message}
                          </p>
                          <p className="text-xs text-text-muted/60 mt-1 font-mono">
                            {new Date(alert.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      </div>
    </Layout>
  );
}

// Metric Card Component
function MetricCard({ title, value, unit, icon, min, max, warningThreshold, criticalThreshold, invertWarning, color }) {
  const percentage = ((value - min) / (max - min)) * 100;
  
  let status = "normal";
  if (invertWarning) {
    if (value <= criticalThreshold) status = "critical";
    else if (value <= warningThreshold) status = "warning";
  } else {
    if (value >= criticalThreshold) status = "critical";
    else if (value >= warningThreshold) status = "warning";
  }

  const statusColors = {
    normal: "text-primary",
    warning: "text-warning",
    critical: "text-danger"
  };

  const glowClass = status === "critical" ? "glow-danger" : status === "warning" ? "glow-warning" : "";

  return (
    <div className={`metric-card card-industrial p-5 ${glowClass}`} data-testid={`metric-${title.toLowerCase()}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium uppercase tracking-wider text-text-muted">
          {title}
        </span>
        <span className={statusColors[status]}>{icon}</span>
      </div>
      <div className={`data-value ${statusColors[status]}`}>
        {value.toFixed(1)}
        <span className="text-lg ml-1">{unit}</span>
      </div>
      <div className="mt-3">
        <div className="h-1.5 bg-surface-highlight rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-500"
            style={{ 
              width: `${Math.min(100, Math.max(0, percentage))}%`,
              backgroundColor: status === "critical" ? "#FF2E63" : status === "warning" ? "#F9ED69" : color
            }}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs text-text-muted font-mono">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>
    </div>
  );
}
