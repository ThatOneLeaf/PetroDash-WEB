import { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar,
  Line,
  LineChart,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  ComposedChart
} from 'recharts';
import api from '../services/api';
import {Box, Button} from "@mui/material";
import Sidebar from '../components/Sidebar';
import { logout } from '../services/auth';

function Dashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const response = await api.get('/your-endpoint');
  //       setData(response.data);
  //       setLoading(false);
  //     } catch (err) {
  //       console.error('Error:', err);
  //       setError('Error fetching data');
  //       setLoading(false);
  //     }
  //   };

  //   fetchData();
  // }, []);

  // if (loading) return <div>Loading...</div>;
  // if (error) return <div>{error}</div>;

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, height: "100vh", overflow: "auto", p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <h1>Dashboard</h1>
          <Button 
            variant="outlined" 
            onClick={logout}
            sx={{ color: '#666', borderColor: '#666' }}
          >
            Logout
          </Button>
        </Box>
        <p>Token will expire in 30 seconds and automatically redirect you to home page.</p>
      </Box>
    </Box>
  );
}

export default Dashboard; 