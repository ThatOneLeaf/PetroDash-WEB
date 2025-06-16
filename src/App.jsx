import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
//import Navbar from './components/layout/Navbar';
import Dashboard from "./pages/Dashboard";
import Economic from "./pages/Economic/Economic";
import Landing from "./pages/Landing";
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

            {/* Economic Routes */}
            <Route path="/economic" element={<Economic />} />
            <Route path="/economic/repository" element={<EconomicRepository />} />

            {/* CSV Routes */}
            <Route path="/energy/power-generation" element={<Energy />} />
            <Route path="/energy/dashboard" element={<PowerDashboard />} />
            <Route path="/energy" element={<EnergyDashboard/>}/>

            {/* Environment Routes */}
            <Route path="/environment/energy" element={<EnvironmentEnergy />} />
            <Route path="/environment/water" element={<EnvironmentWater />} />
            <Route path="/environment/waste" element={<EnvironmentWaste />} />
            <Route path="/environment/air" element={<EnvironmentAir />} />
            <Route path="/environment/care" element={<EnvironmentCare />} />
            <Route path="/environment/water-dash" element={<EnvironmentWaterDash />} />
            <Route path="/environment/energy-dash" element={<EnvironmentEnergyDash />} />
            <Route path="/environment/waste-dash" element={<EnvironmentWasteDash />} />
            
            {/* HELP Routes */}
            <Route path="/social/help" element={<CSR />} />
            <Route path="/social/help-dash" element={<HELPDash />} />

            {/* HR Routes */}
            <Route path="/social/hr" element={<HR />} />
            <Route path="/social/hrdashboard" element={<HRDashboard />} />

            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/economics" element={<Economic />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
