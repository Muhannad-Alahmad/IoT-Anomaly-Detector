import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  History, 
  FileCode, 
  GitBranch,
  Activity
} from "lucide-react";

export const Layout = ({ children }) => {
  const location = useLocation();
  
  const navItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/history", label: "History", icon: History },
    { path: "/api-docs", label: "API Docs", icon: FileCode },
    { path: "/architecture", label: "Architecture", icon: GitBranch },
  ];

  return (
    <div className="min-h-screen bg-background grid-overlay">
      {/* Header */}
      <header className="border-b border-surface-highlight bg-surface/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-sm">
                <Activity className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="font-display text-xl font-bold text-white">
                  IoT Anomaly Detector
                </h1>
                <p className="text-xs text-text-muted uppercase tracking-wider">
                  Wind Turbine Factory
                </p>
              </div>
            </div>
            
            <nav className="flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`nav-link flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                      isActive ? 'active' : ''
                    }`}
                    data-testid={`nav-${item.label.toLowerCase().replace(' ', '-')}`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden md:inline">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1600px] mx-auto">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-surface-highlight mt-8">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between text-xs text-text-muted">
            <span>IoT Anomaly Detection System v1.0.0</span>
            <span className="font-mono">
              Isolation Forest ML Model | FastAPI + React + MongoDB
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
