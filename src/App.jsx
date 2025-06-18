import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
//import Navbar from './components/layout/Navbar';
import Dashboard from "./pages/Dashboard";
import Economic from "./pages/Economic/Economic";
import Landing from "./pages/Landing";
import LoginPage from "./pages/Login_page/Login_page";
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";
import EconomicRepository from "./pages/Economic/EconomicRepository";
import EnvironmentEnergy from "./pages/Envi/EnvironmentEnergy";
import EnvironmentWater from "./pages/Envi/EnvironmentWater";
import EnvironmentWaste from "./pages/Envi/EnvironmentWaste";
import EnvironmentAir from "./pages/Envi/EnvironmentAir";
import EnvironmentCare from "./pages/Envi/EnvironmentCare";
import EnvironmentWaterDash from "./pages/Envi/EnvironmentWaterDash";
import CSR from "./pages/CSR/CSRActivity";
import Energy from "./pages/Energy/Energy";
import HR from "./pages/HR/HRMain";
import HRDashboard from "./pages/HR/HRMainDash";
import PowerDashboard from "./pages/Energy/PowerDashboard";
import EnvironmentEnergyDash from "./pages/Envi/EnvironmentEnergyDash";
import EnvironmentWasteDash from "./pages/Envi/EnvironmentWasteDash";
import HELPDash from "./pages/CSR/HELPDash";
import EnergyDashboard from "./pages/Energy/EnergyDashboard";

function App() {
  return (
    <Router>
      <div className="app">
        <main>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Routes Economics */}
            <Route path="/economic" element={<ProtectedRoute><Economic /></ProtectedRoute>} />
            <Route path="/economic/repository" element={<ProtectedRoute><EconomicRepository /></ProtectedRoute>} />
            
            {/* Protected Routes Environment */}
            <Route path="/environment/energy" element={<ProtectedRoute><EnvironmentEnergy /></ProtectedRoute>} />
            <Route path="/environment/water" element={<ProtectedRoute><EnvironmentWater /></ProtectedRoute>} />
            <Route path="/environment/waste" element={<ProtectedRoute><EnvironmentWaste /></ProtectedRoute>} />
            <Route path="/environment/water-dash" element={<ProtectedRoute><EnvironmentWaterDash /></ProtectedRoute>} />
            <Route path="/environment/energy-dash" element={<ProtectedRoute><EnvironmentEnergyDash /></ProtectedRoute>} />

            {/* CSV Routes */}
            <Route path="/energy/power-generation" element={<Energy />} />
            <Route path="/energy/dashboard" element={<PowerDashboard />} />
            <Route path="/energy" element={<EnergyDashboard/>}/>

            {/* Environment Routes */}
            <Route path="/environment/air" element={<EnvironmentAir />} />
            <Route path="/environment/care" element={<EnvironmentCare />} />
            <Route path="/environment/energy-dash" element={<EnvironmentEnergyDash />} />
            <Route path="/environment/waste-dash" element={<EnvironmentWasteDash />} />
            
            {/* HELP Routes */}
            <Route path="/social/help" element={<CSR />} />
            <Route path="/social/help-dash" element={<HELPDash />} />

            {/* HR Routes */}
            <Route path="/social/hr" element={<HR />} />
            <Route path="/social/hrdashboard" element={<HRDashboard />} />

            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
