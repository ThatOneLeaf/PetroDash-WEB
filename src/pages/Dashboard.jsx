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
import Sidebar from '../components/Sidebar';

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
    <div style={{ 
      display: 'flex',
      flexDirection: 'row',
      minHeight: '200dvh',
      width: '100%',
      margin: 0,
      padding: 0,
      overflowX: 'hidden'
    }}>
      <Sidebar />
      <h1>Dashboard</h1>
      {/* Add your dashboard content here */}
    </div>
  );
}

export default Dashboard; 