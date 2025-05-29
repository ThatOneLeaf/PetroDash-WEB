import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
//import Navbar from './components/layout/Navbar';
import Dashboard from './pages/Dashboard';
import Economic from './pages/Economic/Economic';
import Landing from './pages/Landing';
import Sidebar from './components/Sidebar';
import EconomicGenerated from './pages/Economic/EconomicGenerated';
import CSR from './pages/CSR/CSR';

function App() {
  return (
    <Router>
      <div className="app">
        <main>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/economic" element={<Economic />} />
            <Route path="/economic/generated" element={<EconomicGenerated />} />
            <Route path='/dashboard' element={<Dashboard />} />
            <Route path="/economics" element={<Economic />} />
            <Route path="/social-csr" element={<CSR/>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;