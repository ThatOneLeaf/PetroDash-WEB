import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
//import Navbar from './components/layout/Navbar';
import Dashboard from "./pages/Dashboard";
import Economic from "./pages/Economic/Economic";
import Landing from "./pages/Landing";
import Sidebar from "./components/Sidebar";
import EconomicGenerated from "./pages/Economic/EconomicGenerated";
import EconomicExpenditures from "./pages/Economic/EconomicExpenditures";
import EconomicCapitalProvider from "./pages/Economic/EconomicCapitalProvider";
import EnvironmentEnergy from "./pages/Envi/EnvironmentEnergy";
import EnvironmentWater from "./pages/Envi/EnvironmentWater";
import EnvironmentWaste from "./pages/Envi/EnvironmentWaste";
import EnvironmentAir from "./pages/Envi/EnvironmentAir";
import EnvironmentCare from "./pages/Envi/EnvironmentCare";
import CSR from "./pages/CSR/CSRActivity";
import Energy from "./pages/Energy/Energy";
import HR from "./pages/HR/HR";

function App() {
  return (
    <Router>
      <div className="app">
        <main>
          <Routes>
            <Route path="/" element={<Landing />} />
            {/* <Route path="/energy" element={<Energy />} /> */}
            <Route path="/economic" element={<Economic />} />
            <Route path="/economic/generated" element={<EconomicGenerated />} />
            <Route
              path="/economic/expenditures"
              element={<EconomicExpenditures />}
            />
            <Route
              path="/economic/capital-provider"
              element={<EconomicCapitalProvider />}
            />
            <Route path="/environment/energy" element={<EnvironmentEnergy />} />
            <Route path="/environment/water" element={<EnvironmentWater />} />
            <Route path="/environment/waste" element={<EnvironmentWaste />} />
            <Route path="/environment/air" element={<EnvironmentAir />} />
            <Route path="/environment/care" element={<EnvironmentCare />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/economics" element={<Economic />} />
            <Route path="/social/help" element={<CSR />} />
            <Route path="/social/hr" element={<HR />} />
            <Route path="/energy/power-generation" element={<Energy />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
