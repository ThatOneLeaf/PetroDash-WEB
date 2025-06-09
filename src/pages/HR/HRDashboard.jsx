import { useState, useEffect } from 'react';
import { 
  LineChart,
  Line,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
} from 'recharts';
import api from '../../services/api';
import Sidebar from '../../components/Sidebar';

function HRDash() {
  const [attritionData, setAttritionData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/hr/attrition_rate');
        console.log('Attrition Rate Data:', response.data);
        setAttritionData(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Fetch Error:', err);
        setError('Failed to load attrition rate data');
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  // SIDEBAR
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
        <h1>Yearly Attrition Rate</h1>

        <div style={{ marginBottom: '20px' }}>
          <h2>Raw Data</h2>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={cellStyle}>Year</th>
                <th style={cellStyle}>Total Employees</th>
                <th style={cellStyle}>Resigned</th>
                <th style={cellStyle}>Attrition Rate (%)</th>
              </tr>
            </thead>
            <tbody>
              {attritionData.map((item) => (
                <tr key={item.year}>
                  <td style={cellStyle}>{item.year}</td>
                  <td style={cellStyle}>{item.total_employees}</td>
                  <td style={cellStyle}>{item.resigned_count}</td>
                  <td style={cellStyle}>{item.attrition_rate_percent}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
            <LineChart
              data={attritionData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis 
                domain={[0, 'auto']}
                tickFormatter={(value) => `${value}%`} 
              />
              <Tooltip formatter={(value) => `${value}%`} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="attrition_rate_percent" 
                stroke="#ff7300" 
                dot={{ fill: '#ff7300' }}
                name="Attrition Rate (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  marginBottom: '20px',
};

const cellStyle = {
  border: '1px solid #ddd',
  padding: '8px',
};
export default HRDash; 