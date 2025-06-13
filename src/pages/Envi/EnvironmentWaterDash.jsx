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

const COLORS = ['#3B82F6', '#F97316', '#10B981'];

function EnvironmentWaterDash() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date()); // Add state for last updated time

  // Updated state for filtered totals instead of cumulative totals
  const [filteredTotalAbstracted, setFilteredTotalAbstracted] = useState(0);
  const [filteredTotalDischarged, setFilteredTotalDischarged] = useState(0);
  const [filteredTotalConsumed, setFilteredTotalConsumed] = useState(0);

  const [pieData, setPieData] = useState([]);
  const [companyId, setCompanyId] = useState('');
  const [quarter, setQuarter] = useState('');
  const [fromYear, setFromYear] = useState(''); // Changed from year to fromYear
  const [toYear, setToYear] = useState(''); // Added toYear
  const [unit, setUnit] = useState(''); // Optional, for units like cubic meters
  
  // New state for companies and line chart data
  const [companies, setCompanies] = useState([]);
  const [lineChartData, setLineChartData] = useState([]);
  const [lineChartLabels, setLineChartLabels] = useState([]);
  
  // New state for stacked bar chart data
  const [stackedBarData, setStackedBarData] = useState([]);

  // New state for available years from API
  const [availableYears, setAvailableYears] = useState([]);

  // Function to format the current date and time
  const formatDateTime = (date) => {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    };
    return date.toLocaleString('en-US', options);
  };

  // Function to refresh the entire page
  const handleRefresh = () => {
    window.location.reload();
  };

  // Fetch companies and available years on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [companiesResponse, yearsResponse] = await Promise.all([
          api.get('/reference/companies'),
          api.get('/environment_dash/water-years')
        ]);

        console.log('Companies fetched:', companiesResponse.data);
        console.log('Available years fetched:', yearsResponse.data);
        
        setCompanies(companiesResponse.data);
        setAvailableYears(yearsResponse.data.data || []);
        setLastUpdated(new Date()); // Update the last updated time
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setCompanies([]);
        setAvailableYears([]);
      }
    };

    fetchInitialData();
  }, []);

  // Updated useEffect to fetch filtered totals instead of cumulative totals
  useEffect(() => {
    const fetchFilteredTotals = async () => {
      try {
        // Build parameters - same logic as chart data
        const params = new URLSearchParams();
        
        // For company_id: if empty, pass all companies as individual parameters
        if (companyId) {
          params.append('company_id', companyId);
        } else {
          // Send all companies from the fetched companies data
          companies.forEach(company => {
            params.append('company_id', company.id);
          });
        }
        
        // For quarter: if empty, pass all quarters  
        if (quarter) {
          params.append('quarter', quarter);
        } else {
          // Send all quarters
          ['Q1', 'Q2', 'Q3', 'Q4'].forEach(q => {
            params.append('quarter', q);
          });
        }
        
        // For year range: handle both single years and ranges using available years
        let yearRange = [];
        if (fromYear && toYear) {
          // Generate array of years from fromYear to toYear, filtered by available years
          yearRange = availableYears.filter(year => year >= parseInt(fromYear) && year <= parseInt(toYear));
        } else if (fromYear && !toYear) {
          // Only from year specified - use from year to latest available year
          yearRange = availableYears.filter(year => year >= parseInt(fromYear));
        } else if (!fromYear && toYear) {
          // Only to year specified - use earliest available year to to year
          yearRange = availableYears.filter(year => year <= parseInt(toYear));
        } else {
          // No year filter - send all available years
          yearRange = availableYears;
        }
        
        // Add years to params
        yearRange.forEach(year => {
          params.append('year', year);
        });

        console.log('Fetching filtered totals with params:', params.toString());

        const [abstractedRes, dischargedRes, consumedRes] = await Promise.all([
          api.get(`/environment_dash/abstraction?${params.toString()}`),
          api.get(`/environment_dash/discharge?${params.toString()}`),
          api.get(`/environment_dash/consumption?${params.toString()}`)
        ]);

        console.log('Filtered Abstracted:', abstractedRes.data);
        console.log('Filtered Discharged:', dischargedRes.data);
        console.log('Filtered Consumed:', consumedRes.data);

        setFilteredTotalAbstracted(abstractedRes.data?.total_volume ?? 0);
        setFilteredTotalDischarged(dischargedRes.data?.total_volume ?? 0);
        setFilteredTotalConsumed(consumedRes.data?.total_volume ?? 0);
        setLastUpdated(new Date()); // Update the last updated time
      } catch (error) {
        console.error('Error fetching filtered totals:', error);
        console.error('Error details:', error.response?.data);
        // Set to 0 if error occurs
        setFilteredTotalAbstracted(0);
        setFilteredTotalDischarged(0);
        setFilteredTotalConsumed(0);
      }
    };

    // Only fetch data if companies and available years have been loaded
    if (companies.length > 0 && availableYears.length > 0) {
      fetchFilteredTotals();
    }
  }, [companyId, quarter, fromYear, toYear, companies, availableYears]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Build parameters using URLSearchParams
        const params = new URLSearchParams();
        
        // For company_id: if empty, pass all companies as individual parameters
        if (companyId) {
          params.append('company_id', companyId);
        } else {
          // Send all companies from the fetched companies data
          companies.forEach(company => {
            params.append('company_id', company.id);
          });
        }
        
        // For quarter: if empty, pass all quarters  
        if (quarter) {
          params.append('quarter', quarter);
        } else {
          // Send all quarters
          ['Q1', 'Q2', 'Q3', 'Q4'].forEach(q => {
            params.append('quarter', q);
          });
        }
        
        // For year range: handle both single years and ranges using available years
        let yearRange = [];
        if (fromYear && toYear) {
          yearRange = availableYears.filter(year => year >= parseInt(fromYear) && year <= parseInt(toYear));
        } else if (fromYear && !toYear) {
          yearRange = availableYears.filter(year => year >= parseInt(fromYear));
        } else if (!fromYear && toYear) {
          yearRange = availableYears.filter(year => year <= parseInt(toYear));
        } else {
          yearRange = availableYears;
        }
        
        // Add years to params
        yearRange.forEach(year => {
          params.append('year', year);
        });
        
        console.log('Sending params to API:', params.toString()); // Debug log
        
        // Fetch pie chart, line chart, and stacked bar data
        const [pieResponse, lineResponse, stackedBarResponse] = await Promise.all([
          api.get(`/environment_dash/pie-chart?${params.toString()}`),
          api.get(`/environment_dash/line-chart?${params.toString()}`),
          api.get(`/environment_dash/stacked-bar?${params.toString()}`)
        ]);

        console.log('Pie chart response:', pieResponse.data);
        console.log('Line chart response:', lineResponse.data);
        console.log('Stacked bar response:', stackedBarResponse.data);
        
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
        
        // Handle stacked bar chart data
        if (stackedBarResponse.data.data && stackedBarResponse.data.data.length > 0) {
          const formattedStackedData = stackedBarResponse.data.data.map(item => ({
            quarter: item.quarter,
            abstracted: item.abstracted?.value || 0,
            discharged: item.discharged?.value || 0,
            consumed: item.consumed?.value || 0
          }));
          
          console.log('Formatted stacked bar data:', formattedStackedData);
          setStackedBarData(formattedStackedData);
        } else {
          setStackedBarData([]);
        }
        
        setLastUpdated(new Date()); // Update the last updated time after successful data fetch
        
      } catch (error) {
        console.error('Failed to fetch chart data:', error);
        console.error('Error response:', error.response?.data);
        setPieData([]);
        setLineChartData([]);
        setLineChartLabels([]);
        setStackedBarData([]);
      }
    };

    // Only fetch data if companies and available years have been loaded
    if (companies.length > 0 && availableYears.length > 0) {
      fetchData();
    }
  }, [companyId, quarter, fromYear, toYear, companies, availableYears]);

  // Clear all filters function
  const clearAllFilters = () => {
    setCompanyId('');
    setQuarter('');
    setFromYear('');
    setToYear('');
  };

  // Function to get the display text for the date range
  const getDateRangeText = () => {
    if (fromYear && toYear) {
      return `(${fromYear} to ${toYear})`;
    } else if (fromYear && !toYear) {
      return `(${fromYear} to ${availableYears.length > 0 ? Math.max(...availableYears) : 'PRESENT'})`;
    } else if (!fromYear && toYear) {
      return `(${availableYears.length > 0 ? Math.min(...availableYears) : '2018'} to ${toYear})`;
    } else {
      return `(${availableYears.length > 0 ? Math.min(...availableYears) : '2018'} to ${availableYears.length > 0 ? Math.max(...availableYears) : 'PRESENT'})`;
    }
  };

  // Function to get filter description for metrics cards
  const getFilterDescription = () => {
    const filters = [];
    
    if (companyId) {
      const selectedCompany = companies.find(c => c.id === companyId);
      if (selectedCompany) {
        filters.push(selectedCompany.name);
      }
    }
    
    if (quarter) {
      filters.push(quarter);
    }
    
    if (filters.length === 0) {
      return "ALL DATA";
    }
    
    return filters.join(" • ").toUpperCase();
  };

  // Custom tooltip for pie chart
  const renderCustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div style={{
          backgroundColor: 'white',
          padding: '8px 12px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          fontSize: '12px'
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

  // Custom tooltip for stacked bar chart
  const renderStackedBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: 'white',
          padding: '8px 12px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          fontSize: '12px'
        }}>
          <p style={{ margin: '0 0 4px 0', fontWeight: 'bold' }}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ margin: 0, color: entry.color }}>
              {entry.name}: {Number(entry.value).toLocaleString()} {unit}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ 
      display: 'flex',
      flexDirection: 'row',
      height: '100vh', // Fixed viewport height
      width: '100%',
      margin: 0,
      padding: 0,
      overflow: 'hidden', // Prevent scrolling
      backgroundColor: '#f8fafc'
    }}>
      <Sidebar />

      {/* Main Content */}
      <div style={{ 
        flex: 1,
        padding: '15px', // Reduced from 30px
        backgroundColor: '#ffffff',
        overflow: 'hidden', // Prevent content overflow
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header - Compact */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '15px', // Reduced from 30px
          flexShrink: 0 // Prevent shrinking
        }}>
          <div>
            <div style={{ 
              color: '#64748b', 
              fontSize: '12px', // Reduced from 14px
              fontWeight: '500',
              marginBottom: '3px' // Reduced from 5px
            }}>
              DASHBOARD
            </div>
            <h1 style={{ 
              fontSize: '24px', // Reduced from 32px
              fontWeight: 'bold', 
              color: '#1e293b',
              margin: 0 
            }}>
              Environment - Water
            </h1>
            {/* Add "As of now" timestamp */}
            <div style={{ 
              color: '#64748b', 
              fontSize: '10px',
              fontWeight: '400',
              marginTop: '4px'
            }}>
               The data presented in this dashboard is accurate as of: {formatDateTime(lastUpdated)}
            </div>
          </div>
          {/* Add Refresh Button */}
          <button 
            onClick={handleRefresh}
            style={{
              backgroundColor: '#3B82F6',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500',
              transition: 'background-color 0.2s ease'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#2563EB'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#3B82F6'}
          >
            🔄 REFRESH
          </button>
        </div>

        {/* Filters - Compact */}
        <div style={{ 
          display: 'flex', 
          gap: '10px', // Reduced from 15px
          marginBottom: '15px', // Reduced from 20px
          flexWrap: 'wrap',
          alignItems: 'center',
          flexShrink: 0
        }}>
          {/* Company Filter */}
          <select 
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
            style={{
              padding: '8px 12px', // Reduced padding
              border: '2px solid #e2e8f0',
              borderRadius: '20px', // Reduced border radius
              backgroundColor: 'white',
              fontSize: '12px', // Reduced from 14px
              fontWeight: '500',
              cursor: 'pointer',
              minWidth: '100px' // Reduced from 120px
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
              padding: '8px 12px',
              border: '2px solid #e2e8f0',
              borderRadius: '20px',
              backgroundColor: 'white',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              minWidth: '100px'
            }}
          >
            <option value="">All Quarters</option>
            <option value="Q1">Q1</option>
            <option value="Q2">Q2</option>
            <option value="Q3">Q3</option>
            <option value="Q4">Q4</option>
          </select>

          {/* Year Range Filter - Now using dynamic years from API */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <select 
              value={fromYear}
              onChange={(e) => setFromYear(e.target.value)}
              style={{
                padding: '8px 10px',
                border: '2px solid #e2e8f0',
                borderRadius: '20px',
                backgroundColor: 'white',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                minWidth: '85px'
              }}
            >
              <option value="">From Year</option>
              {availableYears.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            <span style={{ 
              color: '#64748b', 
              fontSize: '12px', 
              fontWeight: '500' 
            }}>
              to
            </span>

            <select 
              value={toYear}
              onChange={(e) => setToYear(e.target.value)}
              style={{
                padding: '8px 10px',
                border: '2px solid #e2e8f0',
                borderRadius: '20px',
                backgroundColor: 'white',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                minWidth: '85px'
              }}
            >
              <option value="">To Year</option>
              {availableYears
                .filter(year => !fromYear || year >= parseInt(fromYear))
                .map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
            </select>
          </div>

          {/* Clear All Filters Button */}
          {(companyId || quarter || fromYear || toYear) && (
            <button
              onClick={clearAllFilters}
              style={{
                padding: '8px 12px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                fontSize: '11px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              Clear All
            </button>
          )}
        </div>

        {/* Key Metrics Cards - Now showing filtered data */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr 1fr', 
          gap: '12px', // Reduced from 20px
          marginBottom: '15px', // Reduced from 30px
          flexShrink: 0
        }}>
          <div style={{
            backgroundColor: '#3B82F6',
            color: 'white',
            padding: '15px', // Reduced from 25px
            borderRadius: '8px', // Reduced from 12px
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '3px' }}>
              {filteredTotalAbstracted.toLocaleString()} m³
            </div>
            <div style={{ fontSize: '10px', opacity: 0.9, marginBottom: '6px' }}>
              WATER ABSTRACTION
            </div>
            <div style={{ fontSize: '9px', opacity: 0.8 }}>
              {getFilterDescription()} {getDateRangeText()}
            </div>
          </div>

          <div style={{
            backgroundColor: '#F97316',
            color: 'white',
            padding: '15px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '3px' }}>
              {filteredTotalDischarged.toLocaleString()} m³
            </div>
            <div style={{ fontSize: '10px', opacity: 0.9, marginBottom: '6px' }}>
              WATER DISCHARGE
            </div>
            <div style={{ fontSize: '9px', opacity: 0.8 }}>
              {getFilterDescription()} {getDateRangeText()}
            </div>
          </div>

          <div style={{
            backgroundColor: '#10B981',
            color: 'white',
            padding: '15px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '3px' }}>
              {filteredTotalConsumed.toLocaleString()} m³
            </div>
            <div style={{ fontSize: '10px', opacity: 0.9, marginBottom: '6px' }}>
              WATER CONSUMPTION
            </div>
            <div style={{ fontSize: '9px', opacity: 0.8 }}>
              {getFilterDescription()} {getDateRangeText()}
            </div>
          </div>
        </div>

        {/* Charts Section - New Layout: Pie chart in first column, Line and Bar charts stacked in second column */}
        <div style={{ 
          flex: 1, // Take remaining space
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', // Two equal columns
          gap: '15px',
          minHeight: 0 // Allow grid items to shrink
        }}>
          {/* Pie Chart - Takes full height of first column */}
          <div style={{ 
            backgroundColor: 'white', 
            padding: '12px', 
            borderRadius: '8px', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0
          }}>
            <h3 style={{
              fontSize: '13px',
              fontWeight: '600',
              marginBottom: '10px',
              color: '#1e293b',
              flexShrink: 0
            }}>
              Water Volume Summary
            </h3>

            {!pieData || pieData.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '30px 15px',
                color: '#64748b',
                backgroundColor: '#f8fafc',
                borderRadius: '6px',
                fontSize: '12px'
              }}>
                {availableYears.length === 0 ? 'Loading available years...' : 'No data available for selected filters'}
              </div>
            ) : pieData.every(item => (item.value || 0) === 0) ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '30px 15px',
                color: '#64748b',
                backgroundColor: '#f8fafc',
                borderRadius: '6px',
                fontSize: '12px'
              }}>
                No data available for selected filters
              </div>
            ) : (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                <div style={{ flex: 1, minHeight: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={250} // Increased from 80 to 110 for larger circle
                        innerRadius={100} // Increased proportionally from 35 to 45
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
                </div>

                {/* Compact Legend */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                  gap: '8px',
                  fontSize: '10px',
                  flexShrink: 0,
                  marginTop: '8px'
                }}>
                  {pieData.map((entry, index) => (
                    <div
                      key={index}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '4px'
                      }}
                    >
                      <div style={{
                        width: '8px',
                        height: '8px',
                        backgroundColor: entry.color || COLORS[index % COLORS.length],
                        borderRadius: '1px',
                        flexShrink: 0
                      }}></div>
                      <span style={{ fontWeight: '500', fontSize: '9px' }}>
                        {entry.label}: {(entry.value || 0).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Second Column - Line Chart and Stacked Bar Chart */}
          <div style={{ 
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            minHeight: 0
          }}>
            {/* Line Chart - Top half of second column */}
            <div style={{ 
              flex: 1,
              backgroundColor: 'white', 
              padding: '12px', 
              borderRadius: '8px', 
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0
            }}>
              <h3 style={{ 
                fontSize: '13px', 
                fontWeight: '600', 
                marginBottom: '10px',
                color: '#1e293b',
                flexShrink: 0
              }}>
                Water Volumes Over Time
              </h3>
              
              {!lineChartData || lineChartData.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '30px 15px',
                  color: '#64748b',
                  backgroundColor: '#f8fafc',
                  borderRadius: '6px',
                  fontSize: '12px'
                }}>
                  {companies.length === 0 || availableYears.length === 0 ? 'Loading data...' : 'No data available for selected filters'}
                </div>
              ) : (
                <div style={{ flex: 1, minHeight: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="year" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#64748b' }}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#64748b' }}
                      />
                      <Tooltip 
                        formatter={(value, name) => [
                          `${Number(value).toLocaleString()} ${unit}`, 
                          name
                        ]}
                        labelStyle={{ color: '#1e293b', fontSize: '12px' }}
                        contentStyle={{ fontSize: '12px' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '10px' }} />
                      <Line 
                        type="monotone" 
                        dataKey="abstracted" 
                        stroke="#3B82F6" 
                        strokeWidth={2}
                        dot={{ fill: '#3B82F6', strokeWidth: 2, r: 3 }}
                        name="Abstracted"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="discharged" 
                        stroke="#F97316" 
                        strokeWidth={2}
                        dot={{ fill: '#F97316', strokeWidth: 2, r: 3 }}
                        name="Discharged"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="consumed" 
                        stroke="#10B981" 
                        strokeWidth={2}
                        dot={{ fill: '#10B981', strokeWidth: 2, r: 3 }}
                        name="Consumed"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Stacked Bar Chart - Bottom half of second column */}
            <div style={{ 
              flex: 1,
              backgroundColor: 'white', 
              padding: '12px', 
              borderRadius: '8px', 
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0
            }}>
              <h3 style={{ 
                fontSize: '13px', 
                fontWeight: '600', 
                marginBottom: '10px',
                color: '#1e293b',
                flexShrink: 0
              }}>
                Water Management by Quarter
              </h3>
              
              {!stackedBarData || stackedBarData.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '30px 15px',
                  color: '#64748b',
                  backgroundColor: '#f8fafc',
                  borderRadius: '6px',
                  fontSize: '12px'
                }}>
                  {companies.length === 0 || availableYears.length === 0 ? 'Loading data...' : 'No data available for selected filters'}
                </div>
              ) : (
                <div style={{ flex: 1, minHeight: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={stackedBarData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="quarter" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#64748b' }}
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 10, fill: '#64748b' }}
                      />
                      <Tooltip 
                        formatter={(value, name) => [
                          `${Number(value).toLocaleString()} ${unit}`, 
                          name
                        ]}
                        labelStyle={{ color: '#1e293b', fontSize: '12px' }}
                        contentStyle={{ fontSize: '12px' }}
                      />
                      <Legend wrapperStyle={{ fontSize: '10px' }} />
                      <Bar 
                        dataKey="abstracted" 
                        stackId="a" 
                        strokeWidth={2}
                        stroke="#3B82F6"
                        fill="#3B82F6"
                        name="Abstracted"
                      />
                      <Bar 
                        dataKey="discharged" 
                        stackId="a" 
                        strokeWidth={2}
                        stroke="#F97316"
                        fill="#F97316"
                        name="Discharged"
                      />
                      <Bar 
                        dataKey="consumed" 
                        stackId="a" 
                        strokeWidth={2}
                        stroke="#10B981"
                        fill="#10B981"
                        name="Consumed"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EnvironmentWaterDash;