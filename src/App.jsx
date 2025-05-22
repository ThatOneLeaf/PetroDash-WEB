import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
//import Navbar from './components/layout/Navbar';
import Dashboard from './pages/Dashboard';
import Economic from './pages/Economic';

function App() {
  return (
    <Router>
      <div className="app">
        <main>
          <Routes>
            <Route path="/" element={<Economic />} />
            <Route path="/economic" element={<Economic />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App; 