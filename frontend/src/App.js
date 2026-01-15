import { BrowserRouter, Routes, Route } from "react-router-dom";
import "@fontsource/manrope/400.css";
import "@fontsource/manrope/500.css";
import "@fontsource/manrope/600.css";
import "@fontsource/manrope/700.css";
import "@fontsource/chivo/400.css";
import "@fontsource/chivo/700.css";
import "@fontsource/jetbrains-mono/400.css";
import "@fontsource/jetbrains-mono/500.css";
import "@/App.css";
import { Toaster } from "@/components/ui/sonner";

import Dashboard from "@/pages/Dashboard";
import History from "@/pages/History";
import ApiDocs from "@/pages/ApiDocs";
import Architecture from "@/pages/Architecture";

function App() {
  return (
    <div className="App min-h-screen bg-background noise-overlay">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/history" element={<History />} />
          <Route path="/api-docs" element={<ApiDocs />} />
          <Route path="/architecture" element={<Architecture />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;
