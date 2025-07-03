import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
//import Navbar from './components/layout/Navbar';
import Dashboard from "./pages/Dashboard";
import Economic from "./pages/Economic/Economic";
import Landing from "./pages/Landing";
import SmartLanding from "./components/SmartLanding";
import LoginPage from "./pages/Login_page/Login_page";
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";
import { AuthProvider } from "./contexts/AuthContext";
import { CO2Provider } from "./contexts/CO2Context";
import EconomicRepository from "./pages/Economic/EconomicRepository";
import EnvironmentEnergy from "./pages/Envi/EnvironmentEnergy";
import EnvironmentWater from "./pages/Envi/EnvironmentWater";
import EnvironmentWaste from "./pages/Envi/EnvironmentWaste";
import EnvironmentAir from "./pages/Envi/EnvironmentAir";
import EnvironmentCare from "./pages/Envi/EnvironmentCare";
import EnvironmentWaterDash from "./pages/Envi/EnvironmentWaterDash";
import EnvironmentAirDash from "./pages/Envi/EnvironmentAirDash";
import EnvironmentCareDash from "./pages/Envi/EnvironmentCareDash";
import CSR from "./pages/CSR/CSRActivity";
import Energy from "./pages/Energy/Energy";
import HR from "./pages/HR/HRMain";
import HRDashboard from "./pages/HR/HRMainDash";
import PowerDashboard from "./pages/Energy/PowerDashboard";
import EnvironmentEnergyDash from "./pages/Envi/EnvironmentEnergyDash";
import EnvironmentWasteDash from "./pages/Envi/EnvironmentWasteDash";
import HELPDash from "./pages/CSR/HELPDash";
import FundsDashboard from "./pages/Energy/FundsDashboard";
import ProfilePage from "./pages/Profile_page/Profile_page";

import AdminLanding from "./pages/AdminLanding";
import UserManagement from "./pages/UserManagement";
import AuditTrail from "./pages/AuditTrail/AuditTrail";

function App() {
  return (
    <AuthProvider>
      <CO2Provider>
        <Router>
          <div className="app">
            <main><Routes>
              <Route path="/" element={<SmartLanding />} />
              <Route path="/landing" element={<Landing />} />
              <Route path="/login" element={<LoginPage />} />

              {/* Admin Landing Page */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requiredRoles={["R01"]}>
                    <AdminLanding />
                  </ProtectedRoute>
                }
              />

              {/* Protected Routes Economics - Removed duplicates, proper roles defined below */}

              {/* Protected Routes Environment */}
              <Route
                path="/environment/energy"
                element={
                  <ProtectedRoute requiredRoles={["R05", "R04", "R03"]}>
                    <EnvironmentEnergy />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/environment/water"
                element={
                  <ProtectedRoute requiredRoles={["R05", "R04", "R03"]}>
                    <EnvironmentWater />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/environment/waste"
                element={
                  <ProtectedRoute requiredRoles={["R05", "R04", "R03"]}>
                    <EnvironmentWaste />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/environment/air"
                element={
                  <ProtectedRoute requiredRoles={["R05", "R04", "R03"]}>
                    <EnvironmentAir />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/environment/care"
                element={
                  <ProtectedRoute requiredRoles={["R05", "R04", "R03"]}>
                    <EnvironmentCare />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/environment/water-dash"
                element={
                  <ProtectedRoute requiredRoles={["R04", "R03", "R02"]}>
                    <EnvironmentWaterDash />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/environment/energy-dash"
                element={
                  <ProtectedRoute requiredRoles={["R04", "R03", "R02"]}>
                    <EnvironmentEnergyDash />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/environment/waste-dash"
                element={
                  <ProtectedRoute requiredRoles={["R04", "R03", "R02"]}>
                    <EnvironmentWasteDash />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/environment/air-dash"
                element={
                  <ProtectedRoute requiredRoles={["R04", "R03", "R02"]}>
                    <EnvironmentAirDash />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/environment/care-dash"
                element={
                  <ProtectedRoute requiredRoles={["R04", "R03", "R02"]}>
                    <EnvironmentCareDash />
                  </ProtectedRoute>
                }
              />

              {/* Protected Routes */}
              <Route
                path="/economic"
                element={
                  <ProtectedRoute requiredRoles={["R04", "R03", "R02"]}>
                    <Economic />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/economic/repository"
                element={
                  <ProtectedRoute requiredRoles={["R05", "R04", "R03"]}>
                    <EconomicRepository />
                  </ProtectedRoute>
                }
              />

              {/* CSV Routes */}
              <Route
                path="/energy/power-generation"
                element={
                  <ProtectedRoute requiredRoles={["R05", "R04", "R03"]}>
                    <Energy />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/energy"
                element={
                  <ProtectedRoute requiredRoles={["R04", "R03", "R02"]}>
                    <PowerDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/social/er1-94"
                element={
                  <ProtectedRoute requiredRoles={["R04", "R03", "R02"]}>
                    <FundsDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Environment Routes */}

              {/* HELP Routes */}
              <Route
                path="/social/help"
                element={
                  <ProtectedRoute requiredRoles={["R05", "R04", "R03"]}>
                    <CSR />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/social/help-dash"
                element={
                  <ProtectedRoute requiredRoles={["R04", "R03", "R02"]}>
                    <HELPDash />
                  </ProtectedRoute>
                }
              />

              {/* HR Routes */}
              <Route
                path="/social/hr"
                element={
                  <ProtectedRoute requiredRoles={["R05", "R04", "R03"]}>
                    <HR />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/social/hrdashboard"
                element={
                  <ProtectedRoute requiredRoles={["R04", "R03", "R02"]}>
                    <HRDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin"
                element={
                  <ProtectedRoute requiredRoles={["R01"]}>
                    <AdminLanding />
                  </ProtectedRoute>
                }></Route>

              <Route 
                path="/user-management"
                element={
                  <ProtectedRoute requiredRoles={["R01"]}>
                    <UserManagement/>
                  </ProtectedRoute>
                }></Route>

              <Route
                path="/audit-trail"
                element={
                  <ProtectedRoute requiredRoles={["R01", "R04", "R03"]}>
                    <AuditTrail />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              /></Routes>
          </main>
        </div>
      </Router>
      </CO2Provider>
    </AuthProvider>
  );
}

export default App;
