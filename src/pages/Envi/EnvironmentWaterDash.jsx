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
import ZoomModal from "../../components/DashboardComponents/ZoomModal";
import { IconButton, useTheme, useMediaQuery } from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';

const COLORS = ['#3B82F6', '#F97316', '#10B981'];
const getYearRangeText = (fromYear, toYear) => {
  if (fromYear && toYear) {
    return `${fromYear}-${toYear}`;
  } else if (fromYear && !toYear) {
    return `${fromYear} to Present`;
  } else if (!fromYear && toYear) {
    return `Up to ${toYear}`;
  } else {
    return 'All Years';
  }
};

function EnvironmentWaterDash() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
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
      
      // Calculate percentage
      const total = pieData.reduce((sum, item) => sum + (item.value || 0), 0);
      const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : '0';
      
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
          <p style={{ margin: 0, color: '#64748b' }}>
            {percentage}% of total
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
      flexDirection: isMobile ? 'column' : 'row',
      height: isMobile ? 'auto' : '100vh',
      minHeight: isMobile ? '100vh' : 'auto',
      width: '100%',
      margin: 0,
      padding: 0,
      overflow: isMobile ? 'visible' : 'hidden',
      backgroundColor: '#f8fafc'
    }}>
      <Sidebar />

      {/* Main Content */}
      <div style={{ 
        flex: 1,
        padding: isSmallScreen ? '8px' : '15px',
        backgroundColor: '#f4f6fb',
        overflow: isMobile ? 'visible' : 'hidden',
        display: 'flex',
        flexDirection: 'column',
        zoom: isSmallScreen ? '0.7' : '0.8'
      }}>        {/* Header - Responsive */}
        <div style={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between', 
          alignItems: isMobile ? 'flex-start' : 'center',
          gap: isMobile ? '10px' : '0',
          marginBottom: '15px',
          flexShrink: 0
        }}>
          <div>
            <div style={{ 
              color: '#64748b', 
              fontSize: isSmallScreen ? '10px' : '12px',
              fontWeight: '500',
              marginBottom: '3px'
            }}>
              DASHBOARD
            </div>
            <h1 style={{ 
              fontSize: isSmallScreen ? '18px' : isMobile ? '20px' : '24px',
              fontWeight: 'bold', 
              color: '#1e293b',
              margin: 0 
            }}>
              Environment - Water
            </h1>
            <div style={{ 
              color: '#64748b', 
              fontSize: isSmallScreen ? '8px' : '10px',
              fontWeight: '400',
              marginTop: '4px',
              display: isSmallScreen ? 'none' : 'block'
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
              padding: isSmallScreen ? '8px 16px' : '12px 24px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: isSmallScreen ? '6px' : '10px',
              cursor: 'pointer',
              fontSize: isSmallScreen ? '12px' : '16px',
              fontWeight: '700',
              transition: 'background-color 0.2s ease, color 0.2s ease',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              alignSelf: isMobile ? 'flex-start' : 'auto'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#115293';
              e.target.style.color = 'white';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#1976d2';
              e.target.style.color = 'white';
            }}
          >
            <RefreshIcon style={{ fontSize: '20px', color: 'inherit' }} />
            Refresh
          </button>
        </div>        {/* Filters - Responsive */}
        <div style={{ 
          display: 'flex', 
          gap: isSmallScreen ? '6px' : '10px',
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
        </div>        {/* Key Metrics Cards - Responsive */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', 
          gap: isSmallScreen ? '8px' : '12px',
          marginBottom: '15px',
          flexShrink: 0
        }}>
          <div style={{
            backgroundColor: '#3B82F6',
            color: 'white',
            padding: isSmallScreen ? '10px' : '15px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: isSmallScreen ? '16px' : '20px', fontWeight: 'bold', marginBottom: '3px' }}>
              {filteredTotalAbstracted.toLocaleString()} m³
            </div>
            <div style={{ fontSize: isSmallScreen ? '8px' : '10px', opacity: 0.9, marginBottom: '6px' }}>
              WATER ABSTRACTION
            </div>
            <div style={{ fontSize: isSmallScreen ? '7px' : '9px', opacity: 0.8, display: isSmallScreen ? 'none' : 'block' }}>
              {getFilterDescription()} {getDateRangeText()}
            </div>
          </div>

          <div style={{
            backgroundColor: '#F97316',
            color: 'white',
            padding: isSmallScreen ? '10px' : '15px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: isSmallScreen ? '16px' : '20px', fontWeight: 'bold', marginBottom: '3px' }}>
              {filteredTotalDischarged.toLocaleString()} m³
            </div>
            <div style={{ fontSize: isSmallScreen ? '8px' : '10px', opacity: 0.9, marginBottom: '6px' }}>
              WATER DISCHARGE
            </div>
            <div style={{ fontSize: isSmallScreen ? '7px' : '9px', opacity: 0.8, display: isSmallScreen ? 'none' : 'block' }}>
              {getFilterDescription()} {getDateRangeText()}
            </div>
          </div>

          <div style={{
            backgroundColor: '#10B981',
            color: 'white',
            padding: isSmallScreen ? '10px' : '15px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: isSmallScreen ? '16px' : '20px', fontWeight: 'bold', marginBottom: '3px' }}>
              {filteredTotalConsumed.toLocaleString()} m³
            </div>
            <div style={{ fontSize: isSmallScreen ? '8px' : '10px', opacity: 0.9, marginBottom: '6px' }}>
              WATER CONSUMPTION
            </div>
            <div style={{ fontSize: isSmallScreen ? '7px' : '9px', opacity: 0.8, display: isSmallScreen ? 'none' : 'block' }}>
              {getFilterDescription()} {getDateRangeText()}
            </div>
          </div>
        </div>        {/* Charts Section - Responsive Layout */}
        <div style={{ 
          flex: 1,
          display: 'grid', 
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: isSmallScreen ? '10px' : '15px',
          minHeight: 0
        }}>          {/* Pie Chart - Takes full height of first column */}
          <div style={{ 
            flex: 1,
            backgroundColor: 'white', 
            padding: isSmallScreen ? '8px' : '12px', 
            borderRadius: '8px', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
            minHeight: isMobile ? '300px' : 0,
            position: 'relative' // Add this
          }}>
            {/* Zoom button */}
            <IconButton
              onClick={() => openZoomModal(
                'Water Volume Summary', 
                'water-volume-summary',
                <div style={{ 
                  width: '100%', 
                  height: '600px', 
                  display: 'flex', 
                  flexDirection: 'column',
                  padding: '20px'
                }}>
                  {/* Pie Chart Container */}
                  <div style={{ 
                    flex: 1, 
                    minHeight: '400px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center'
                  }}>
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
                  
                  {/* Legend Section */}
                  <div style={{
                    backgroundColor: '#f8f9fa',
                    borderRadius: '8px',
                    padding: '20px',
                    marginTop: '20px',
                    minHeight: '120px'
                  }}>
                    <h4 style={{ 
                      margin: '0 0 16px 0', 
                      fontSize: '16px', 
                      fontWeight: '600',
                      textAlign: 'center',
                      color: '#1e293b'
                    }}>
                      Water Volume Breakdown
                    </h4>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                      gap: '12px',
                      fontSize: '14px'
                    }}>
                      {pieData.map((entry, index) => (
                        <div
                          key={index}
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '8px',
                            padding: '8px',
                            backgroundColor: 'white',
                            borderRadius: '6px',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                          }}
                        >
                          <div style={{
                            width: '16px',
                            height: '16px',
                            backgroundColor: entry.color || COLORS[index % COLORS.length],
                            borderRadius: '3px',
                            flexShrink: 0
                          }}></div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '600', marginBottom: '2px' }}>
                              {entry.label}
                            </div>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>
                              {(entry.value || 0).toLocaleString()} {unit} ({entry.percentage}%)
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                zIndex: 10,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 1)' }
              }}
              size="small"
            >
              <ZoomInIcon fontSize="small" />
            </IconButton>

            <h3 style={{
              fontSize: '15px',
              fontWeight: '600',
              marginBottom: '10px',
              color: '#1e293b',
              flexShrink: 0
            }}>
              Water Volume Summary
            </h3>

            {/* Rest of your existing pie chart code stays the same */}
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
                  gap: '12px',
                  fontSize: '12px',
                  flexShrink: 0,
                  marginTop: '8px'
                }}>
                  {pieData.map((entry, index) => (
                    <div
                      key={index}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '6px'
                      }}
                    >
                      <div style={{
                        width: '12px',
                        height: '12px',
                        backgroundColor: entry.color || COLORS[index % COLORS.length],
                        borderRadius: '2px',
                        flexShrink: 0
                      }}></div>
                      <span style={{ fontWeight: '500', fontSize: '12px' }}>
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
              position: 'relative' // Add this
            }}>
              {/* Zoom button */}
              <IconButton
                onClick={() => openZoomModal(
                  'Water Volumes Over Time', 
                  'water-volumes-over-time',
                  <div style={{ width: '100%', height: '500px', paddingTop: '20px' }}>
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
                        <Legend wrapperStyle={{ fontSize: '15px' }} />
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
                )}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  zIndex: 10,
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 1)' }
                }}
                size="small"
              >
                <ZoomInIcon fontSize="small" />
              </IconButton>

              <h3 style={{ 
                fontSize: '15px', 
                fontWeight: '600', 
                marginBottom: '10px',
                color: '#1e293b',
                flexShrink: 0
              }}>
                Water Volumes Over Time
              </h3>
              
              {/* Rest of your existing line chart code stays the same */}
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
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
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
              position: 'relative' // Add this
            }}>
              {/* Zoom button */}
              <IconButton
                onClick={() => openZoomModal(
                  `Water Management by Quarter - ${getYearRangeText(fromYear, toYear)}`, 
                  'water-management-by-quarter',
                  <div style={{ width: '100%', height: '500px', paddingTop: '20px' }}>
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
                )}
                sx={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  zIndex: 10,
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  '&:hover': { backgroundColor: 'rgba(255, 255, 255, 1)' }
                }}
                size="small"
              >
                <ZoomInIcon fontSize="small" />
              </IconButton>

              <h3 style={{ 
                fontSize: '15px', 
                fontWeight: '600', 
                marginBottom: '10px',
                color: '#1e293b',
                flexShrink: 0
              }}>
                Water Management by Quarter - {getYearRangeText(fromYear, toYear)}
              </h3>
              
              {/* Rest of your existing stacked bar chart code stays the same */}
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
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
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
          height={700} // Increase height to accommodate legend
        >
          {zoomModal.content && typeof zoomModal.content === 'function' ? zoomModal.content() : zoomModal.content}
        </ZoomModal>
      </div>
    </div>
  );
}

export default EnvironmentWaterDash;