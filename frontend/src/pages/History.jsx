import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis,
  Legend
} from "recharts";
import { Download, Filter, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Layout from "@/components/Layout";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ScatterTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;

  const p = payload[0].payload;

  const C_TEMP = "#66FCF1";
  const C_HUM = "#45A29E";
  const C_SND = "#F9ED69";
  const C_TEXT = "#C5C6C7";
  const C_CLASS = p.is_anomaly ? "#FF2E63" : "#45A29E";
  const C_SCORE = p.is_anomaly ? "#FF2E63" : "#45A29E";

  const fmt2 = (v) => (typeof v === "number" ? v.toFixed(2) : v);

  return (
      <div
          style={{
            background: "#0B0C10",
            border: "1px solid #66FCF1",
            borderRadius: 6,
            padding: 10,
            lineHeight: 1.5,
            minWidth: 220,
          }}
      >
        <div>
          <span style={{ color: C_HUM }}>Humidity:</span>{" "}
          <span style={{ color: C_TEXT }}>{fmt2(p.humidity)}%</span>
        </div>

        <div>
          <span style={{ color: C_SND }}>Sound:</span>{" "}
          <span style={{ color: C_TEXT }}>{fmt2(p.sound_level)} dB</span>
        </div>

        <div>
          <span style={{ color: C_TEMP }}>Temperature:</span>{" "}
          <span style={{ color: C_TEXT }}>{fmt2(p.temperature)}°C</span>
        </div>

        <div>
          <span style={{ color: C_TEXT }}>Anomaly score:</span>{" "}
          <span style={{ color: C_SCORE }}>{fmt2(p.anomaly_score)}</span>
        </div>

        <div>
          <span style={{ color: C_TEXT }}>Class:</span>{" "}
          <span style={{ color: C_CLASS }}>
          {p.is_anomaly ? "Anomaly" : "Normal"}
        </span>
        </div>
      </div>
  );
};

export default function History() {
  const [readings, setReadings] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState("100");
  const [filter, setFilter] = useState("all");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [readingsRes, predictionsRes, statsRes] = await Promise.all([
        axios.get(`${API}/sensor/readings?limit=${limit}`),
        axios.get(`${API}/predictions?limit=${limit}&anomalies_only=${filter === 'anomalies'}`),
        axios.get(`${API}/stats/summary`)
      ]);

      setReadings(readingsRes.data.reverse());
      setPredictions(predictionsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  }, [limit, filter]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const chartData = readings.map((r, i) => ({
    index: i,
    temperature: r.temperature,
    humidity: r.humidity,
    sound_level: r.sound_level,
    timestamp: new Date(r.timestamp).toLocaleString(),
    time: new Date(r.timestamp).toLocaleTimeString()
  }));

  const scatterData = predictions.map(p => ({
    temperature: p.features.temperature,
    humidity: p.features.humidity,
    sound_level: p.features.sound_level,
    anomaly_score: p.anomaly_score * 100,
    is_anomaly: p.is_anomaly
  }));

  const exportData = () => {
    const csvContent = [
      ["Timestamp", "Temperature", "Humidity", "Sound Level"].join(","),
      ...readings.map(r => 
        [r.timestamp, r.temperature, r.humidity, r.sound_level].join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sensor_data.csv";
    a.click();
  };

  return (
    <Layout>
      <div className="p-6 space-y-6" data-testid="history-page">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-white text-glow">
              Historical Data
            </h1>
            <p className="text-text-muted mt-1">
              Analyze past sensor readings and predictions
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={limit} onValueChange={setLimit}>
              <SelectTrigger className="w-[120px] bg-surface border-surface-highlight" data-testid="limit-select">
                <SelectValue placeholder="Limit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="50">50 Records</SelectItem>
                <SelectItem value="100">100 Records</SelectItem>
                <SelectItem value="500">500 Records</SelectItem>
                <SelectItem value="1000">1000 Records</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[140px] bg-surface border-surface-highlight" data-testid="filter-select">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Data</SelectItem>
                <SelectItem value="anomalies">Anomalies Only</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={fetchData} variant="outline" className="btn-secondary" data-testid="refresh-btn">
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button onClick={exportData} className="btn-primary" data-testid="export-btn">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Statistics Summary */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatCard label="Total Readings" value={stats.total_readings} />
            <StatCard label="Avg Temperature" value={`${stats.avg_temperature}°C`} />
            <StatCard label="Avg Humidity" value={`${stats.avg_humidity}%`} />
            <StatCard label="Avg Sound" value={`${stats.avg_sound_level} dB`} />
            <StatCard label="Anomaly Rate" value={`${stats.anomaly_rate}%`} highlight={stats.anomaly_rate > 15} />
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-[400px]">
            <div className="spinner" />
          </div>
        ) : (
          <>
            {/* Time Series Chart */}
            <div className="card-industrial p-6">
              <h3 className="text-sm font-medium uppercase tracking-wider text-text-muted mb-4">
                Sensor Data Over Time
              </h3>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
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
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="temperature" 
                      stroke="#66FCF1" 
                      dot={false}
                      strokeWidth={2}
                      name="Temperature (°C)"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="humidity" 
                      stroke="#45A29E" 
                      dot={false}
                      strokeWidth={2}
                      name="Humidity (%)"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="sound_level" 
                      stroke="#F9ED69" 
                      dot={false}
                      strokeWidth={2}
                      name="Sound (dB)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Scatter Plot - Anomaly Distribution */}
            <div className="card-industrial p-6">
              <h3 className="text-sm font-medium uppercase tracking-wider text-text-muted mb-4">
                Anomaly Distribution (Temperature vs Humidity)
              </h3>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2C353F" />
                    <XAxis 
                      type="number" 
                      dataKey="temperature" 
                      name="Temperature" 
                      unit="°C"
                      stroke="#C5C6C7"
                      tick={{ fill: '#C5C6C7', fontSize: 11 }}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="humidity" 
                      name="Humidity" 
                      unit="%"
                      stroke="#C5C6C7"
                      tick={{ fill: '#C5C6C7', fontSize: 11 }}
                    />
                    <ZAxis 
                      type="number" 
                      dataKey="anomaly_score" 
                      range={[50, 400]} 
                      name="Anomaly Score"
                    />
                    <Tooltip cursor={{ strokeDasharray: "3 3" }} content={<ScatterTooltip />} />
                    <Legend />
                    <Scatter 
                      name="Normal" 
                      data={scatterData.filter(d => !d.is_anomaly)} 
                      fill="#45A29E"
                    />
                    <Scatter 
                      name="Anomaly" 
                      data={scatterData.filter(d => d.is_anomaly)} 
                      fill="#FF2E63"
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Data Table */}
            <div className="card-industrial">
              <div className="p-4 border-b border-surface-highlight">
                <h3 className="text-sm font-medium uppercase tracking-wider text-text-muted">
                  Raw Data ({readings.length} records)
                </h3>
              </div>
              <ScrollArea className="h-[400px]">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>Temperature</th>
                      <th>Humidity</th>
                      <th>Sound Level</th>
                      <th>Sensor ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {readings.slice().reverse().map((reading, i) => (
                      <tr key={reading.id || i}>
                        <td className="text-text-muted">
                          {new Date(reading.timestamp).toLocaleString()}
                        </td>
                        <td className="text-primary">{reading.temperature.toFixed(2)}°C</td>
                        <td className="text-primary-dim">{reading.humidity.toFixed(2)}%</td>
                        <td className="text-warning">{reading.sound_level.toFixed(2)} dB</td>
                        <td className="text-text-muted">{reading.sensor_id}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}

function StatCard({ label, value, highlight }) {
  return (
    <div className={`card-industrial p-4 ${highlight ? 'border-danger/50' : ''}`}>
      <div className="text-xs uppercase tracking-wider text-text-muted mb-1">{label}</div>
      <div className={`font-mono text-xl font-semibold ${highlight ? 'text-danger' : 'text-primary'}`}>
        {value}
      </div>
    </div>
  );
}
