import { useState, useEffect } from 'react';
import api from '../../services/api';
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
  ComposedChart,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import Sidebar from '../../components/Sidebar';

const quarterlyData = [
  { quarter: 'Q1', abstracted: 6000, discharged: 4000, consumed: 6000 },
  { quarter: 'Q2', abstracted: 5500, discharged: 5500, consumed: 5000 },
  { quarter: 'Q3', abstracted: 5000, discharged: 4500, consumed: 5500 },
  { quarter: 'Q4', abstracted: 5200, discharged: 4800, consumed: 4800 }
];

const COLORS = ['#3B82F6', '#F97316', '#10B981'];

function EnvironmentWaterDash() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [totalAbstracted, setTotalAbstracted] = useState(0);
  const [totalDischarged, setTotalDischarged] = useState(0);
  const [totalConsumed, setTotalConsumed] = useState(0);

  const [pieData, setPieData] = useState([]);
  const [companyId, setCompanyId] = useState('');
  const [quarter, setQuarter] = useState('');
  const [year, setYear] = useState('');
  const [unit, setUnit] = useState(''); // Optional, for units like cubic meters
  
  // New state for companies and line chart data
  const [companies, setCompanies] = useState([]);
  const [lineChartData, setLineChartData] = useState([]);
  const [lineChartLabels, setLineChartLabels] = useState([]);

  // Fetch companies on component mount
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await api.get('/reference/companies');
        console.log('Companies fetched:', response.data);
        setCompanies(response.data);
      } catch (error) {
        console.error('Error fetching companies:', error);
        setCompanies([]);
      }
    };

    fetchCompanies();
  }, []);

  useEffect(() => {
  const fetchData = async () => {
    try {
      const [abstractedRes, dischargedRes, consumedRes] = await Promise.all([
        api.get('/environment_dash/abstraction'),
        api.get('/environment_dash/discharge'),
        api.get('/environment_dash/consumption')
      ]);

      console.log('Abstracted:', abstractedRes.data);
      console.log('Discharged:', dischargedRes.data);
      console.log('Consumed:', consumedRes.data);

      setTotalAbstracted(abstractedRes.data?.total_volume ?? 0);
      setTotalDischarged(dischargedRes.data?.total_volume ?? 0);
      setTotalConsumed(consumedRes.data?.total_volume ?? 0);
    } catch (error) {
      console.error('Error fetching totals:', error);
    }
  };

  fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
        try {
        // Build parameters - ALWAYS send values, never empty arrays
        const params = {};
        
        // For company_id: if empty, pass all companies as individual parameters
        if (companyId) {
            params.company_id = companyId;
        } else {
            // Send all companies from the fetched companies data
            params.company_id = companies.map(company => company.id);
        }
        
        // For quarter: if empty, pass all quarters  
        if (quarter) {
            params.quarter = quarter;
        } else {
            // Send all quarters - FastAPI will receive this as a list
            params.quarter = ['Q1', 'Q2', 'Q3', 'Q4'];
        }
        
        // For year: if empty, pass all available years
        if (year) {
            params.year = parseInt(year);
        } else {
            // Send all years - FastAPI will receive this as a list
            params.year = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
        }
        
        console.log('Sending params to API:', params); // Debug log
        
        // Fetch both pie chart and line chart data
        const [pieResponse, lineResponse] = await Promise.all([
          api.get('/environment_dash/pie-chart', { 
              params,
              paramsSerializer: {
                indexes: null
              }
          }),
          api.get('/environment_dash/line-chart', { 
              params,
              paramsSerializer: {
                indexes: null
              }
          })
        ]);

        console.log('Pie chart response:', pieResponse.data);
        console.log('Line chart response:', lineResponse.data);
        
        // Handle pie chart data
        const formattedPieData = pieResponse.data.data?.map((item, index) => ({
            ...item,
            value: Number(item.value) || 0,
            color: item.color || COLORS[index % COLORS.length]
        })) || [];

        console.log('Formatted pie data:', formattedPieData);
        setPieData(formattedPieData);
        setUnit(pieResponse.data.unit || 'cubic meters');
        
        // Handle line chart data
        if (lineResponse.data.data && lineResponse.data.labels) {
          const lineData = lineResponse.data.labels.map((year, index) => ({
            year: year,
            abstracted: lineResponse.data.data.find(d => d.label === 'Abstracted')?.data[index] || 0,
            discharged: lineResponse.data.data.find(d => d.label === 'Discharged')?.data[index] || 0,
            consumed: lineResponse.data.data.find(d => d.label === 'Consumed')?.data[index] || 0
          }));
          
          console.log('Formatted line chart data:', lineData);
          setLineChartData(lineData);
          setLineChartLabels(lineResponse.data.labels);
        } else {
          setLineChartData([]);
          setLineChartLabels([]);
        }
        
        } catch (error) {
        console.error('Failed to fetch chart data:', error);
        console.error('Error response:', error.response?.data);
        setPieData([]);
        setLineChartData([]);
        setLineChartLabels([]);
        }
    };

    // Only fetch data if companies have been loaded
    if (companies.length > 0) {
      fetchData();
    }
  }, [companyId, quarter, year, companies]);

  // Custom tooltip for pie chart
  const renderCustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div style={{
          backgroundColor: 'white',
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>{data.payload.label}</p>
          <p style={{ margin: 0, color: data.payload.color }}>
            {data.value.toLocaleString()} {unit}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ 
      display: 'flex',
      flexDirection: 'row',
      minHeight: '100vh',
      width: '100%',
      margin: 0,
      padding: 0,
      overflowX: 'hidden',
      backgroundColor: '#f8fafc'
    }}>
      <Sidebar />

      {/* Main Content */}
      <div style={{ 
        flex: 1,
        padding: '30px',
        backgroundColor: '#ffffff'
      }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '30px'
        }}>
          <div>
            <div style={{ 
              color: '#64748b', 
              fontSize: '14px', 
              fontWeight: '500',
              marginBottom: '5px' 
            }}>
              DASHBOARD
            </div>
            <h1 style={{ 
              fontSize: '32px', 
              fontWeight: 'bold', 
              color: '#1e293b',
              margin: 0 
            }}>
              Environment - Water
            </h1>
          </div>
          <button style={{
            backgroundColor: '#f8fafc',
            border: '1px solid #e2e8f0',
            padding: '10px 20px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            📊 EXPORT DATA
          </button>
        </div>

        {/* Filters */}
        <div style={{ 
            display: 'flex', 
            gap: '15px', 
            marginBottom: '30px' 
            }}>
            {/* Company Filter */}
            <select 
                value={companyId}
                onChange={(e) => setCompanyId(e.target.value)}
                style={{
                padding: '12px 20px',
                border: '2px solid #e2e8f0',
                borderRadius: '25px',
                backgroundColor: 'white',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                minWidth: '120px'
                }}
            >
                <option value="">All Companies</option>
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
            </select>

            {/* Quarter Filter */}
            <select 
                value={quarter}
                onChange={(e) => setQuarter(e.target.value)}
                style={{
                padding: '12px 20px',
                border: '2px solid #e2e8f0',
                borderRadius: '25px',
                backgroundColor: 'white',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                minWidth: '120px'
                }}
            >
                <option value="">All Quarters</option>
                <option value="Q1">Q1</option>
                <option value="Q2">Q2</option>
                <option value="Q3">Q3</option>
                <option value="Q4">Q4</option>
            </select>

            {/* Year Filter */}
            <select 
                value={year}
                onChange={(e) => setYear(e.target.value)}
                style={{
                padding: '12px 20px',
                border: '2px solid #e2e8f0',
                borderRadius: '25px',
                backgroundColor: 'white',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                minWidth: '120px'
                }}
            >
                <option value="">All Years</option>
                {Array.from({ length: 2025 - 2018 + 1 }, (_, i) => (
                <option key={i} value={2018 + i}>{2018 + i}</option>
                ))}
            </select>
        </div>

        {/* Key Metrics Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr 1fr', 
          gap: '20px', 
          marginBottom: '30px' 
        }}>
          <div style={{
            backgroundColor: '#3B82F6',
            color: 'white',
            padding: '25px',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '8px' }}>
              CUMULATIVE WATER ABSTRACTION
            </div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '5px' }}>
              {totalAbstracted.toLocaleString()} m³
            </div>
            <div style={{ fontSize: '11px', opacity: 0.8 }}>
              (2018 to PRESENT)
            </div>
          </div>

          <div style={{
            backgroundColor: '#F97316',
            color: 'white',
            padding: '25px',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '8px' }}>
              CUMULATIVE WATER DISCHARGE
            </div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '5px' }}>
              {totalDischarged.toLocaleString()} m³
            </div>
            <div style={{ fontSize: '11px', opacity: 0.8 }}>
              (2018 to PRESENT)
            </div>
          </div>

          <div style={{
            backgroundColor: '#10B981',
            color: 'white',
            padding: '25px',
            borderRadius: '12px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '8px' }}>
              CUMULATIVE WATER CONSUMPTION
            </div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '5px' }}>
              {totalConsumed.toLocaleString()} m³
            </div>
            <div style={{ fontSize: '11px', opacity: 0.8 }}>
              (2018 to PRESENT)
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '30px',
          marginBottom: '30px'
        }}>
          {/* Pie Chart - FIXED VERSION */}
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{
              fontSize: '16px',
              fontWeight: '600',
              marginBottom: '20px',
              color: '#1e293b',
            }}>
              Water Volume Summary: Total Abstracted, Discharged, and Consumed
            </h3>

            {/* Debug info */}
            {console.log('Current pieData:', pieData)}
            
            {!pieData || pieData.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '60px 20px',
                color: '#64748b',
                backgroundColor: '#f8fafc',
                borderRadius: '8px'
              }}>
                <p style={{ margin: 0, fontSize: '14px' }}>
                  Loading data...
                </p>
              </div>
            ) : pieData.every(item => (item.value || 0) === 0) ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '60px 20px',
                color: '#64748b',
                backgroundColor: '#f8fafc',
                borderRadius: '8px'
              }}>
                <p style={{ margin: 0, fontSize: '14px' }}>
                  No data available for selected filters
                </p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      innerRadius={40}
                      fill="#8884d8"
                      dataKey="value"
                      paddingAngle={2}
                      startAngle={90}
                      endAngle={450}
                    >
                      {pieData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color || COLORS[index % COLORS.length]} 
                        />
                      ))}
                    </Pie>
                    <Tooltip content={renderCustomTooltip} />
                  </PieChart>
                </ResponsiveContainer>

                {/* Legend */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                  gap: '15px',
                  marginTop: '20px',
                  fontSize: '12px',
                }}>
                  {pieData.map((entry, index) => (
                    <div
                      key={index}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px',
                        minWidth: '120px'
                      }}
                    >
                      <div style={{
                        width: '12px',
                        height: '12px',
                        backgroundColor: entry.color || COLORS[index % COLORS.length],
                        borderRadius: '2px',
                        flexShrink: 0
                      }}></div>
                      <span style={{ fontWeight: '500' }}>
                        {entry.label}: {(entry.value || 0).toLocaleString()} 
                        {entry.percentage ? ` (${Number(entry.percentage).toFixed(1)}%)` : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Line Chart */}
          <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ 
              fontSize: '16px', 
              fontWeight: '600', 
              marginBottom: '20px',
              color: '#1e293b'
            }}>
              Water Volumes Over Time
            </h3>
            
            {!lineChartData || lineChartData.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '60px 20px',
                color: '#64748b',
                backgroundColor: '#f8fafc',
                borderRadius: '8px'
              }}>
                <p style={{ margin: 0, fontSize: '14px' }}>
                  {companies.length === 0 ? 'Loading companies...' : 'No data available for selected filters'}
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={lineChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="year" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12, fill: '#64748b' }}
                  />
                  <Tooltip 
                    formatter={(value, name) => [
                      `${Number(value).toLocaleString()} ${unit}`, 
                      name
                    ]}
                    labelStyle={{ color: '#1e293b' }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="abstracted" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                    name="Abstracted Volume"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="discharged" 
                    stroke="#F97316" 
                    strokeWidth={2}
                    dot={{ fill: '#F97316', strokeWidth: 2, r: 4 }}
                    name="Discharged Volume"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="consumed" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                    name="Consumption Volume"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Stacked Bar Chart */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ 
            fontSize: '16px', 
            fontWeight: '600', 
            marginBottom: '20px',
            color: '#1e293b'
          }}>
            Stacked Water Volume per Quarter - Company PWEI
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={quarterlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis 
                dataKey="quarter"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#64748b' }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#64748b' }}
              />
              <Tooltip />
              <Legend />
              <Bar dataKey="abstracted" stackId="a" fill="#3B82F6" name="Abstracted" />
              <Bar dataKey="discharged" stackId="a" fill="#F97316" name="Discharged" />
              <Bar dataKey="consumed" stackId="a" fill="#10B981" name="Consumed" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default EnvironmentWaterDash;