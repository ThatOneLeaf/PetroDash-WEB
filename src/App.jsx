import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
//import Navbar from './components/layout/Navbar';
import Dashboard from './pages/Dashboard';
import Economic from './pages/Economic/Economic';
import Landing from './pages/Landing';

function App() {
  return (
    <Router>
      <div className="app">
        <main>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/economic" element={<Economic />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App; 