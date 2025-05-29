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
import api from '../../services/api';
import Sidebar from '../../components/Sidebar';

function Economic() {
  const [retentionData, setRetentionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/economic/retention');
        console.log('Data from API:', response.data);
        setRetentionData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error:', err);
        setError('Error fetching data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return (<div style={{ 
      display: 'flex',
      flexDirection: 'row',
      minHeight: '100vh',
      width: '100%',
      margin: 0,
      padding: 0,
      overflowX: 'hidden'
    }}>
      <Sidebar />
      Loading...
    </div>);
  if (error) return (<div style={{ 
      display: 'flex',
      flexDirection: 'row',
      minHeight: '100vh',
      width: '100%',
      margin: 0,
      padding: 0,
      overflowX: 'hidden'
    }}>
      <Sidebar />{error}</div>);

  return (
    <div style={{ 
      display: 'flex',
      flexDirection: 'row',
      minHeight: '100vh',
      width: '100%',
      margin: 0,
      padding: 0,
      overflowX: 'hidden'
    }}>
      <Sidebar />
      <div style={{ padding: '20px' }}>
        <h1>Economic Value Retention Ratio</h1>
        
        <div style={{ marginBottom: '20px' }}>
          <h2>Raw Data from API</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Year</th>
                <th style={{ border: '1px solid #ddd', padding: '8px' }}>Retention Ratio (%)</th>
              </tr>
            </thead>
            <tbody>
              {retentionData.map((item) => (
                <tr key={item.year}>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.year}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.retention_ratio}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
            <ComposedChart
              data={retentionData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis 
                tickFormatter={(value) => `${value}%`}
                domain={[-20, 60]}
              />
              <Tooltip formatter={(value) => `${value}%`} />
              <Legend />
              <Bar 
                dataKey="retention_ratio" 
                fill="#82ca9d" 
                name="Retention Ratio"
                legendType="none"
              />
              <Line
                type="monotone"
                dataKey="retention_ratio"
                stroke="#8884d8"
                dot={{ fill: '#8884d8' }}
                name="Retention Ratio"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default Economic; 