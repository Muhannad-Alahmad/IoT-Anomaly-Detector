import { 
  Database, 
  Server, 
  Monitor, 
  Cpu, 
  Activity, 
  AlertTriangle,
  ArrowRight,
  ArrowDown,
  Layers
} from "lucide-react";
import Layout from "@/components/Layout";

export default function Architecture() {
  return (
    <Layout>
      <div className="p-6 space-y-8" data-testid="architecture-page">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-bold text-white text-glow">
            System Architecture
          </h1>
          <p className="text-text-muted mt-1">
            Conceptual design of the IoT Anomaly Detection System
          </p>
        </div>

        {/* Architecture Diagram */}
        <div className="card-industrial p-8">
          <h3 className="text-sm font-medium uppercase tracking-wider text-text-muted mb-8 text-center">
            Data Flow Architecture
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center">
            {/* Sensors */}
            <div className="text-center">
              <div className="arch-node mx-auto max-w-[180px]">
                <Activity className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="font-semibold text-white">IoT Sensors</div>
                <div className="text-xs text-text-muted mt-1">Temperature, Humidity, Sound</div>
              </div>
            </div>

            <div className="hidden md:flex justify-center">
              <ArrowRight className="w-8 h-8 text-primary-dim" />
            </div>
            <div className="flex md:hidden justify-center">
              <ArrowDown className="w-8 h-8 text-primary-dim" />
            </div>

            {/* API Layer */}
            <div className="text-center">
              <div className="arch-node mx-auto max-w-[180px]">
                <Server className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="font-semibold text-white">FastAPI Backend</div>
                <div className="text-xs text-text-muted mt-1">RESTful API + Stream Processing</div>
              </div>
            </div>

            <div className="hidden md:flex justify-center">
              <ArrowRight className="w-8 h-8 text-primary-dim" />
            </div>
            <div className="flex md:hidden justify-center">
              <ArrowDown className="w-8 h-8 text-primary-dim" />
            </div>

            {/* ML Model */}
            <div className="text-center">
              <div className="arch-node mx-auto max-w-[180px] border-primary/50">
                <Cpu className="w-8 h-8 text-primary mx-auto mb-2" />
                <div className="font-semibold text-white">ML Model</div>
                <div className="text-xs text-text-muted mt-1">Isolation Forest Algorithm</div>
              </div>
            </div>
          </div>

          {/* Second Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 items-center">
            <div className="md:col-start-2 text-center">
              <div className="flex justify-center mb-4">
                <ArrowDown className="w-8 h-8 text-primary-dim" />
              </div>
              <div className="arch-node mx-auto max-w-[180px]">
                <Database className="w-8 h-8 text-warning mx-auto mb-2" />
                <div className="font-semibold text-white">MongoDB</div>
                <div className="text-xs text-text-muted mt-1">Data Storage & Persistence</div>
              </div>
            </div>
          </div>

          {/* Third Row - Outputs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <ArrowDown className="w-8 h-8 text-primary-dim transform md:-rotate-45" />
              </div>
              <div className="arch-node mx-auto max-w-[180px]">
                <Monitor className="w-8 h-8 text-success mx-auto mb-2" />
                <div className="font-semibold text-white">Dashboard</div>
                <div className="text-xs text-text-muted mt-1">React Frontend</div>
              </div>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-4">
                <ArrowDown className="w-8 h-8 text-primary-dim" />
              </div>
              <div className="arch-node mx-auto max-w-[180px]">
                <Layers className="w-8 h-8 text-info mx-auto mb-2" />
                <div className="font-semibold text-white">Predictions</div>
                <div className="text-xs text-text-muted mt-1">Anomaly Scores</div>
              </div>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-4">
                <ArrowDown className="w-8 h-8 text-primary-dim transform md:rotate-45" />
              </div>
              <div className="arch-node mx-auto max-w-[180px]">
                <AlertTriangle className="w-8 h-8 text-danger mx-auto mb-2" />
                <div className="font-semibold text-white">Alerts</div>
                <div className="text-xs text-text-muted mt-1">Real-time Notifications</div>
              </div>
            </div>
          </div>
        </div>

        {/* Component Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Data Ingestion */}
          <div className="card-industrial p-6">
            <h3 className="font-display text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Data Ingestion
            </h3>
            <ul className="space-y-2 text-sm text-text-muted">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                Continuous stream processing from factory sensors
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                RESTful API endpoints for data submission
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                Support for multiple sensor types and IDs
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                Simulated data generation for testing
              </li>
            </ul>
          </div>

          {/* Processing */}
          <div className="card-industrial p-6">
            <h3 className="font-display text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-primary" />
              ML Processing
            </h3>
            <ul className="space-y-2 text-sm text-text-muted">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                Isolation Forest algorithm for anomaly detection
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                Features: temperature, humidity, sound level
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                Real-time prediction with confidence scores
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                Model retraining capability with new data
              </li>
            </ul>
          </div>

          {/* Storage */}
          <div className="card-industrial p-6">
            <h3 className="font-display text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-warning" />
              Data Storage
            </h3>
            <ul className="space-y-2 text-sm text-text-muted">
              <li className="flex items-start gap-2">
                <span className="text-warning mt-1">•</span>
                MongoDB for flexible document storage
              </li>
              <li className="flex items-start gap-2">
                <span className="text-warning mt-1">•</span>
                Collections: sensor_readings, predictions, alerts
              </li>
              <li className="flex items-start gap-2">
                <span className="text-warning mt-1">•</span>
                Async operations for high throughput
              </li>
              <li className="flex items-start gap-2">
                <span className="text-warning mt-1">•</span>
                Historical data retention and analysis
              </li>
            </ul>
          </div>

          {/* Monitoring */}
          <div className="card-industrial p-6">
            <h3 className="font-display text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Monitor className="w-5 h-5 text-success" />
              Monitoring & Alerts
            </h3>
            <ul className="space-y-2 text-sm text-text-muted">
              <li className="flex items-start gap-2">
                <span className="text-success mt-1">•</span>
                Real-time dashboard with live updates
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success mt-1">•</span>
                Severity-based alert classification
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success mt-1">•</span>
                Historical trend visualization
              </li>
              <li className="flex items-start gap-2">
                <span className="text-success mt-1">•</span>
                System health monitoring
              </li>
            </ul>
          </div>
        </div>

        {/* Technical Stack */}
        <div className="card-industrial p-6">
          <h3 className="font-display text-lg font-semibold text-white mb-4">
            Technology Stack
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <TechItem name="FastAPI" description="Python backend framework" />
            <TechItem name="React" description="Frontend UI library" />
            <TechItem name="MongoDB" description="NoSQL database" />
            <TechItem name="scikit-learn" description="ML library (Isolation Forest)" />
            <TechItem name="Recharts" description="Data visualization" />
            <TechItem name="Tailwind CSS" description="Styling framework" />
            <TechItem name="Motor" description="Async MongoDB driver" />
            <TechItem name="Pydantic" description="Data validation" />
          </div>
        </div>

        {/* Key Features for Presentation */}
        <div className="card-industrial p-6">
          <h3 className="font-display text-lg font-semibold text-white mb-4">
            Key System Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard 
              title="Scalability"
              description="Async processing, modular architecture, and database indexing support horizontal scaling."
            />
            <FeatureCard 
              title="Maintainability"
              description="Clean separation of concerns, RESTful API design, and comprehensive documentation."
            />
            <FeatureCard 
              title="Adaptability"
              description="Model retraining endpoint, configurable thresholds, and extensible sensor support."
            />
          </div>
        </div>
      </div>
    </Layout>
  );
}

function TechItem({ name, description }) {
  return (
    <div className="bg-surface/50 p-3 border border-surface-highlight">
      <div className="font-mono text-primary text-sm">{name}</div>
      <div className="text-xs text-text-muted mt-1">{description}</div>
    </div>
  );
}

function FeatureCard({ title, description }) {
  return (
    <div className="bg-surface/30 p-4 border-l-2 border-primary">
      <div className="font-semibold text-white mb-2">{title}</div>
      <div className="text-sm text-text-muted">{description}</div>
    </div>
  );
}
