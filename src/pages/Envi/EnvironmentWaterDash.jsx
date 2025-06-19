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
import MultiSelectWithChips from "../../components/DashboardComponents/MultiSelectDropdown";
import StyledSelect from "../../components/DashboardComponents/StyledSelect";
import RefreshIcon from '@mui/icons-material/Refresh';
import ZoomModal from "../../components/DashboardComponents/ZoomModal"; // Adjust path as needed
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import { IconButton } from '@mui/material';

const COLORS = ['#3B82F6', '#F97316', '#10B981'];

function EnvironmentWaterDash() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Updated state for filtered totals instead of cumulative totals
  const [filteredTotalAbstracted, setFilteredTotalAbstracted] = useState(0);
  const [filteredTotalDischarged, setFilteredTotalDischarged] = useState(0);
  const [filteredTotalConsumed, setFilteredTotalConsumed] = useState(0);

  const [pieData, setPieData] = useState([]);
  
  // Updated filter states to handle arrays for multi-select
  const [selectedCompanyIds, setSelectedCompanyIds] = useState([]); // Changed from companyId to array
  const [selectedQuarters, setSelectedQuarters] = useState([]); // Changed from quarter to array
  const [fromYear, setFromYear] = useState('');
  const [toYear, setToYear] = useState('');
  const [unit, setUnit] = useState('');
  
  // New state for companies and line chart data
  const [companies, setCompanies] = useState([]);
  const [lineChartData, setLineChartData] = useState([]);
  const [lineChartLabels, setLineChartLabels] = useState([]);
  
  // New state for stacked bar chart data
  const [stackedBarData, setStackedBarData] = useState([]);

  // New state for available years from API
  const [availableYears, setAvailableYears] = useState([]);

  const [zoomModal, setZoomModal] = useState({ 
    open: false, 
    content: null, 
    title: '', 
    fileName: '' 
  });
  const openZoomModal = (title, fileName, content) => {
    setZoomModal({ 
      open: true, 
      title, 
      fileName, 
      content 
    });
  };

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
        setLastUpdated(new Date());
        setError(null); // Clear any previous errors
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setCompanies([]);
        setAvailableYears([]);
        setError('Not accessible. Only authorized people can access this.');
      }
    };
  
    fetchInitialData();
  }, []);

  // Updated useEffect to fetch filtered totals with multi-select support
  useEffect(() => {
    const fetchFilteredTotals = async () => {
      try {
        const params = new URLSearchParams();
        
        // For company_ids: if array is empty, pass all companies
        if (selectedCompanyIds.length > 0) {
          selectedCompanyIds.forEach(companyId => {
            params.append('company_id', companyId);
          });
        } else {
          companies.forEach(company => {
            params.append('company_id', company.id);
          });
        }
        
        // For quarters: if array is empty, pass all quarters  
        if (selectedQuarters.length > 0) {
          selectedQuarters.forEach(quarter => {
            params.append('quarter', quarter);
          });
        } else {
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
        setLastUpdated(new Date());
      } catch (error) {
        console.error('Error fetching filtered totals:', error);
        console.error('Error details:', error.response?.data);
        setFilteredTotalAbstracted(0);
        setFilteredTotalDischarged(0);
        setFilteredTotalConsumed(0);
      }
    };

    if (companies.length > 0 && availableYears.length > 0) {
      fetchFilteredTotals();
    }
  }, [selectedCompanyIds, selectedQuarters, fromYear, toYear, companies, availableYears]);

  // Updated useEffect to fetch chart data with multi-select support
  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = new URLSearchParams();
        
        // For company_ids: if array is empty, pass all companies
        if (selectedCompanyIds.length > 0) {
          selectedCompanyIds.forEach(companyId => {
            params.append('company_id', companyId);
          });
        } else {
          companies.forEach(company => {
            params.append('company_id', company.id);
          });
        }
        
        // For quarters: if array is empty, pass all quarters  
        if (selectedQuarters.length > 0) {
          selectedQuarters.forEach(quarter => {
            params.append('quarter', quarter);
          });
        } else {
          ['Q1', 'Q2', 'Q3', 'Q4'].forEach(q => {
            params.append('quarter', q);
          });
        }
        
        // For year range
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
        
        yearRange.forEach(year => {
          params.append('year', year);
        });
        
        console.log('Sending params to API:', params.toString());
        
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
        
        setLastUpdated(new Date());
        
      } catch (error) {
        console.error('Failed to fetch chart data:', error);
        console.error('Error response:', error.response?.data);
        setPieData([]);
        setLineChartData([]);
        setLineChartLabels([]);
        setStackedBarData([]);
      }
    };

    if (companies.length > 0 && availableYears.length > 0) {
      fetchData();
    }
  }, [selectedCompanyIds, selectedQuarters, fromYear, toYear, companies, availableYears]);

  // Clear all filters function
  const clearAllFilters = () => {
    setSelectedCompanyIds([]);
    setSelectedQuarters([]);
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

  // Updated function to get filter description for metrics cards
  const getFilterDescription = () => {
    const filters = [];
    
    if (selectedCompanyIds.length > 0) {
      if (selectedCompanyIds.length === 1) {
        const selectedCompany = companies.find(c => c.id === selectedCompanyIds[0]);
        if (selectedCompany) {
          filters.push(selectedCompany.name);
        }
      } else {
        filters.push(`${selectedCompanyIds.length} COMPANIES`);
      }
    }
    
    if (selectedQuarters.length > 0) {
      if (selectedQuarters.length === 1) {
        filters.push(selectedQuarters[0]);
      } else {
        filters.push(`${selectedQuarters.length} QUARTERS`);
      }
    }
    
    if (filters.length === 0) {
      return "ALL DATA";
    }
    
    return filters.join(" • ").toUpperCase();
  };

  // Prepare options for MultiSelect components
  const companyOptions = companies.map(company => ({
    value: company.id,
    label: company.name
  }));

  const quarterOptions = [
    { value: 'Q1', label: 'Q1' },
    { value: 'Q2', label: 'Q2' },
    { value: 'Q3', label: 'Q3' },
    { value: 'Q4', label: 'Q4' }
  ];

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

  if (error) {
    return (
      <div style={{ 
        display: 'flex',
        flexDirection: 'row',
        height: '100vh',
        width: '100%',
        margin: 0,
        padding: 0,
        overflow: 'hidden',
        backgroundColor: '#f8fafc'
      }}>
        <Sidebar />
        <div style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#ffffff'
        }}>
          <div style={{
            color: '#ef4444',
            fontSize: '18px',
            fontWeight: '600',
            textAlign: 'center'
          }}>
            {error}
          </div>
        </div>
      </div>
    );
   }

  return (
    <div style={{ 
      display: 'flex',
      flexDirection: 'row',
      height: '100vh',
      width: '100%',
      margin: 0,
      padding: 0,
      overflow: 'hidden',
      backgroundColor: '#f8fafc'
    }}>
      <Sidebar />

      {/* Main Content */}
      <div style={{ 
        flex: 1,
        padding: '15px',
        backgroundColor: '#f4f6fb',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        zoom: '0.8'  // Add this line
      }}>
        {/* Header - Compact */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '15px',
          flexShrink: 0
        }}>
          <div>
            <div style={{ 
              color: '#64748b', 
              fontSize: '12px',
              fontWeight: '500',
              marginBottom: '3px'
            }}>
              DASHBOARD
            </div>
            <h1 style={{ 
              fontSize: '24px',
              fontWeight: 'bold', 
              color: '#1e293b',
              margin: 0 
            }}>
              Environment - Water
            </h1>
            <div style={{ 
              color: '#64748b', 
              fontSize: '10px',
              fontWeight: '400',
              marginTop: '4px'
            }}>
               The data presented in this dashboard is accurate as of: {formatDateTime(lastUpdated)}
            </div>
          </div>
          <button 
            onClick={handleRefresh}
            style={{
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '700',
              transition: 'background-color 0.2s ease',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#115293'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#1976d2'}
          >
            <RefreshIcon style={{ fontSize: '16px' }} />
            Refresh
          </button>
        </div>

        {/* Filters - Updated with MultiSelect */}
        <div style={{ 
          display: 'flex', 
          gap: '10px',
          marginBottom: '15px',
          flexWrap: 'wrap',
          alignItems: 'center',
          flexShrink: 0
        }}>
          {/* Company Multi-Select Filter */}
          <MultiSelectWithChips
            label="Companies"
            options={companyOptions}
            selectedValues={selectedCompanyIds}
            onChange={setSelectedCompanyIds}
            placeholder="All Companies"
          />

          {/* Quarter Multi-Select Filter */}
          <MultiSelectWithChips
            label="Quarters"
            options={quarterOptions}
            selectedValues={selectedQuarters}
            onChange={setSelectedQuarters}
            placeholder="All Quarters"
          />

          {/* Year Range Filter - Keep as single select for now */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <StyledSelect
              value={fromYear}
              onChange={(value) => setFromYear(value)}
              options={availableYears.map(year => ({ value: year, label: year.toString() }))}
              placeholder="From Year"
              style={{ minWidth: '85px', width: 'auto', maxWidth: '120px' }}
            />
            <span style={{
              color: '#64748b',
              fontSize: '12px',
              fontWeight: '500'
            }}>
              to
            </span>
            <StyledSelect
              value={toYear}
              onChange={(value) => setToYear(value)}
              options={availableYears
                .filter(year => !fromYear || year >= parseInt(fromYear))
                .map(year => ({ value: year, label: year.toString() }))
              }
              placeholder="To Year"
              style={{ minWidth: '85px', width: 'auto', maxWidth: '120px' }}
            />
          </div>

          {/* Clear All Filters Button */}
          {(selectedCompanyIds.length > 0 || selectedQuarters.length > 0 || fromYear || toYear) && (
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
          gap: '12px',
          marginBottom: '15px',
          flexShrink: 0
        }}>
          <div style={{
            backgroundColor: '#3B82F6',
            color: 'white',
            padding: '15px',
            borderRadius: '8px',
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
          flex: 1,
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr',
          gap: '15px',
          minHeight: 0
        }}>
          {/* Pie Chart - Takes full height of first column */}
          <div style={{ 
            backgroundColor: 'white', 
            padding: '12px', 
            borderRadius: '8px', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            position: 'relative'
          }}>
            {/* Zoom button */}
            <IconButton
              onClick={() => openZoomModal(
                'Water Volume Summary', 
                'water-volume-summary',
                // Pass content as a function that returns JSX
                () => (
                  <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <div style={{ flex: 1, minHeight: 400 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={150}
                            innerRadius={60}
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
                    {/* Legend */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      flexWrap: 'wrap',
                      gap: '12px',
                      fontSize: '14px',
                      marginTop: '16px',
                      padding: '16px'
                    }}>
                      {pieData.map((entry, index) => (
                        <div
                          key={index}
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px'
                          }}
                        >
                          <div style={{
                            width: '16px',
                            height: '16px',
                            backgroundColor: entry.color || COLORS[index % COLORS.length],
                            borderRadius: '2px',
                            flexShrink: 0
                          }}></div>
                          <span style={{ fontWeight: '500', fontSize: '14px' }}>
                            {entry.label}: {(entry.value || 0).toLocaleString()} {unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              )}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                zIndex: 10,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 1)',
                }
              }}
              size="small"
            >
              <ZoomInIcon fontSize="small" />
            </IconButton>
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
                        outerRadius={250}
                        innerRadius={100}
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
              minHeight: 0,
              position: 'relative'
            }}>
              {/* Zoom button */}
              <IconButton
                onClick={() => openZoomModal(
                  'Water Volumes Over Time', 
                  'water-volumes-over-time',
                  () => (
                    <div style={{ width: '100%', height: '100%' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={lineChartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis 
                            dataKey="year" 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 14, fill: '#64748b' }}
                          />
                          <YAxis 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 14, fill: '#64748b' }}
                          />
                          <Tooltip 
                            formatter={(value, name) => [
                              `${Number(value).toLocaleString()} ${unit}`, 
                              name
                            ]}
                            labelStyle={{ color: '#1e293b', fontSize: '16px' }}
                            contentStyle={{ fontSize: '14px' }}
                          />
                          <Legend wrapperStyle={{ fontSize: '14px' }} />
                          <Line 
                            type="monotone" 
                            dataKey="abstracted" 
                            stroke="#3B82F6" 
                            strokeWidth={4}
                            dot={{ fill: '#3B82F6', strokeWidth: 3, r: 5 }}
                            name="Abstracted"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="discharged" 
                            stroke="#F97316" 
                            strokeWidth={4}
                            dot={{ fill: '#F97316', strokeWidth: 3, r: 5 }}
                            name="Discharged"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="consumed" 
                            stroke="#10B981" 
                            strokeWidth={4}
                            dot={{ fill: '#10B981', strokeWidth: 3, r: 5 }}
                            name="Consumed"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )
                )}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  zIndex: 10,
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 1)',
                  }
                }}
                size="small"
              >
                <ZoomInIcon fontSize="small" />
              </IconButton>
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
              minHeight: 0,
              position: 'relative'
            }}>
              {/* Zoom button */}
              <IconButton
                onClick={() => openZoomModal(
                  'Water Management by Quarter', 
                  'water-management-by-quarter',
                  () => (
                    <div style={{ width: '100%', height: '100%' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={stackedBarData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis 
                            dataKey="quarter" 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 14, fill: '#64748b' }}
                          />
                          <YAxis 
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 14, fill: '#64748b' }}
                          />
                          <Tooltip 
                            formatter={(value, name) => [
                              `${Number(value).toLocaleString()} ${unit}`, 
                              name
                            ]}
                            labelStyle={{ color: '#1e293b', fontSize: '16px' }}
                            contentStyle={{ fontSize: '14px' }}
                          />
                          <Legend wrapperStyle={{ fontSize: '14px' }} />
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
                  )
                )}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  zIndex: 10,
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 1)',
                  }
                }}
                size="small"
              >
                <ZoomInIcon fontSize="small" />
              </IconButton>
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
        <ZoomModal 
          open={zoomModal.open}
          title={zoomModal.title}
          onClose={() => setZoomModal({ ...zoomModal, open: false })} 
          enableDownload 
          downloadFileName={zoomModal.fileName}
          height={600}
        >
          {/* Render the content function if it exists */}
          {zoomModal.content && typeof zoomModal.content === 'function' ? zoomModal.content() : zoomModal.content}
        </ZoomModal>
      </div>
    </div>
  );
}

export default EnvironmentWaterDash;