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
  Cell,
  Area,
  AreaChart
} from 'recharts';
import Sidebar from '../../components/Sidebar';

const COLORS = ['#3B82F6', '#F97316', '#10B981', '#EF4444', '#8B5CF6', '#F59E0B', '#64748b', '#06B6D4', '#84CC16'];

function EnvironmentWasteDash() {
  const [activeTab, setActiveTab] = useState('hazardous_generated'); // 'hazardous_generated', 'hazardous_disposed', 'non_hazardous_generated'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date()); // Add state for last updated time

  // Filters - Common for all tabs
  const [companyId, setCompanyId] = useState('');
  const [quarter, setQuarter] = useState('');
  const [fromYear, setFromYear] = useState('');
  const [toYear, setToYear] = useState('');
  const [wasteType, setWasteType] = useState(''); // Hazard Waste Filter 
  const [metrics, setMetrics] = useState('');
  const [unit, setUnit] = useState('Kilogram'); // Default Selection

  // Active APIs
  const [activeYears, setActiveYears] = useState([]);
  const [activeWasteType, setActiveWasteType] = useState([]);
  const [activeMetrics, setActiveMetrics] = useState([]);
  const [activeUnits, setActiveUnits] = useState([]);

  // State for API data
  const [companies, setCompanies] = useState([]);

  // Hazard Generated Waste-specific API data
  const [hazGenYears, setHazGenYears] = useState([]);
  const [hazGenWasteType, setHazGenWasteType] = useState([]);
  const [hazGenUnits, setHazGenUnits] = useState([]);

  // Hazard Disposed Waste-specific API data
  const [hazDisYears, setHazDisYears] = useState([]);
  const [hazDisWasteType, setHazDisWasteType] = useState([]);
  const [hazDisUnits, setHazDisUnits] = useState([]);

  // Hazard Disposed Waste-specific API data
  const [nonHazYears, setNonHazYears] = useState([]);
  const [nonHazMetrics, setNonHazMetrics] = useState([]);
  const [nonHazUnits, setNonHazUnits] = useState([]);

  // Chart data from APIs (Hazardouse Generated)
  const [hazGenPieData, setHazGenPieData] = useState([]);
  const [hazGenTypePieData, setHazGenTypePieData] = useState([]);
  const [hazGenLineData, setHazGenLineData] = useState([]);
  const [lineChartColors, setLineChartColors] = useState([]);
  const [hazGenTypeBarData, setHazGenTypeBarData] = useState([]);
  const [hazGenQrtrBarData, setHazGenQrtrBarData] = useState([]);
  const [quarterCompanyColors, setQuarterCompanyColors] = useState({});

  // 1. Fetch all data ONCE on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [
          companiesResponse, 
          hazGenYearsResponse, 
          hazGenWasteTypeResponse,
          hazGenUnitsResponse,
          hazDisYearsResponse, 
          hazDisWasteTypeResponse,
          hazDisUnitsResponse,
          nonHazYearsResponse, 
          nonHazUnitsResponse,
          nonHazMetricsResponse,
        ] = await Promise.all([
          api.get('/reference/companies'),
          api.get('/environment_dash/hazardous-waste-years'),
          api.get('/environment_dash/hazardous-waste-type'),
          api.get('/environment_dash/hazardous-waste-units'),
          api.get('/environment_dash/hazardous-waste-dis-years'),
          api.get('/environment_dash/hazardous-waste-dis-type'),
          api.get('/environment_dash/hazardous-waste-dis-units'),
          api.get('/environment_dash/non-hazardous-waste-years'),
          api.get('/environment_dash/non-hazardous-waste-units'),
          api.get('/environment_dash/non-hazardous-metrics'),
        ]);

        setCompanies(companiesResponse.data);

        setHazGenYears(hazGenYearsResponse.data.data || []);
        setHazGenWasteType(hazGenWasteTypeResponse.data.data || []);
        setHazGenUnits(hazGenUnitsResponse.data.data || []);

        setHazDisYears(hazDisYearsResponse.data.data || []);
        setHazDisWasteType(hazDisWasteTypeResponse.data.data || []);
        setHazDisUnits(hazDisUnitsResponse.data.data || []);

        setNonHazYears(nonHazYearsResponse.data.data || []);
        setNonHazMetrics(nonHazMetricsResponse.data.data || []);
        setNonHazUnits(nonHazUnitsResponse.data.data || []);

        setLastUpdated(new Date());
      } catch (error) {
        // handle error
      }
    };

    fetchInitialData();
  }, []);

  // 2. Update active filters when tab or data changes
  useEffect(() => {
    switch (activeTab) {
      case 'hazardous_generated':
        setActiveYears(hazGenYears || []);
        setActiveWasteType(hazGenWasteType || []);
        setActiveMetrics([]);
        setActiveUnits(hazGenUnits || []);
        break;
      case 'hazardous_disposed':
        setActiveYears(hazDisYears || []);
        setActiveWasteType(hazDisWasteType || []);
        setActiveMetrics([]);
        setActiveUnits(hazDisUnits || []);
        break;
      case 'non_hazardous_generated':
        setActiveYears(nonHazYears || []);
        setActiveWasteType([]);
        setActiveMetrics(nonHazMetrics || []);
        setActiveUnits(nonHazUnits || []);
        break;
      default:
        setActiveYears([]);
        setActiveWasteType([]);
        setActiveMetrics([]);
        setActiveUnits([]);
        break;
    }
  }, [
    activeTab,
    hazGenYears, hazGenWasteType, hazGenUnits,
    hazDisYears, hazDisWasteType, hazDisUnits,
    nonHazYears, nonHazMetrics, nonHazUnits
  ]);

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

    // Get current data based on active tab
  const getCurrentData = () => {
    if (activeTab === 'hazardous_generated') {
      return {
        pieData: hazGenPieData,
        pieTypeData: hazGenTypePieData,
        lineChartData: hazGenLineData,
        barChartData: hazGenTypeBarData,
        barChartQrtrData: hazGenQrtrBarData,
        unit: unit
      };
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const currentData = getCurrentData();

  const transformHazGenTypePieData = (apiData) => {
    if (!Array.isArray(apiData) || apiData.length === 0) {
      return [];
    }

    console.log('Raw haz gen type pie API data:', apiData);

    // Transform API response to match pie chart format
    // Note: The API already includes formatted labels with value and percentage
    const transformedData = apiData.map(item => ({
      label: item.waste_type || 'Unknown', // for tooltip and legend
      value: Number(item.total_generate) || 0, // recharts expects 'value'
      percentage: Number(item.percentage) || 0,
      unit: item.unit || '',
      color: item.color || '#3B82F6'
    }));

    console.log('Transformed haz gen type pie data:', transformedData);
    
    return transformedData;
  };

  const transformLineChartData = (apiData, colors) => {
    if (!Array.isArray(apiData) || apiData.length === 0) {
      return [];
    }

    // Collect all unique years
    const allYears = new Set();
    apiData.forEach(wasteTypeObj => {
      wasteTypeObj.data.forEach(item => allYears.add(item.year));
    });
    const sortedYears = Array.from(allYears).sort();

    // Build data for recharts: [{year: 2018, "Used Oil": 16, ...}, ...]
    const transformedData = sortedYears.map(year => {
      const yearData = { year };
      apiData.forEach(wasteTypeObj => {
        const found = wasteTypeObj.data.find(item => item.year === year);
        yearData[wasteTypeObj.waste_type] = found ? found.total_generate : 0;
      });
      return yearData;
    });

    return transformedData;
  };

  const transformBarChartData = (apiData) => {
    if (!Array.isArray(apiData) || apiData.length === 0) {
      return [];
    }

    // Aggregate total_generate by company_id
    const wasteMap = {};
    apiData.forEach(item => {
      const id = item.waste_type || 'Unknown';
      if (!wasteMap[id]) {
        wasteMap[id] = {
          waste_type: id,
          total_generate: 0,
          // Assign a color based on the order of unique companies
          color: null // We'll assign colors after aggregation
        };
      }
      wasteMap[id].total_generate += Number(item.total_generate) || 0;
    });

    // Assign a unique color from COLORS array to each company
    const wasteType = Object.values(wasteMap);
    wasteType.forEach((type, idx) => {
      type.color = COLORS[idx % COLORS.length];
    });

    return wasteType;
  };

  const transformQuarterBarChartData = (apiData) => {
    if (!Array.isArray(apiData) || apiData.length === 0) {
      return [];
    }

    // Group data by quarter, stack by waste_type
    const groupedByQuarter = {};
    const allWasteTypes = new Set();
    const wasteTypeColorMap = {};

    apiData.forEach(item => {
      const quarter = item.quarter;
      const wasteType = item.waste_type;
      const value = item.total_generate;

      allWasteTypes.add(wasteType);
      wasteTypeColorMap[wasteType] = item.color;

      if (!groupedByQuarter[quarter]) {
        groupedByQuarter[quarter] = { quarter };
      }
      groupedByQuarter[quarter][wasteType] = value;
    });

    // Ensure all quarters and all waste types are present
    const wasteTypes = Array.from(allWasteTypes);
    const quarterOrder = ['Q1', 'Q2', 'Q3', 'Q4'];
    const chartData = quarterOrder.map(quarter => {
      const data = groupedByQuarter[quarter] || { quarter };
      wasteTypes.forEach(wt => {
        if (!data[wt]) data[wt] = 0;
      });
      return data;
    });

    return {
      chartData,
      wasteTypes,
      colors: wasteTypeColorMap
    };
  };

  console.log("Quarter Bar Chart Data:", currentData.barChartQrtrData);

  useEffect(() => {
    const fetchHazGenTypePieChart = async () => {
      if (activeTab !== 'hazardous_generated') return;

      try {
        // Build parameters (same logic as pie chart)
        const params = {};
        
        if (companyId) {
          params.company_id = companyId;
        } else {
          params.company_id = companies.map(company => company.id);
        }

        if (fromYear && toYear) {
          const yearRange = activeYears.filter(year => year >= parseInt(fromYear) && year <= parseInt(toYear));
          params.year = yearRange;
        } else if (fromYear && !toYear) {
          const yearRange = activeYears.filter(year => year >= parseInt(fromYear));
          params.year = yearRange;
        } else if (!fromYear && toYear) {
          const yearRange = activeYears.filter(year => year <= parseInt(toYear));
          params.year = yearRange;
        } else {
          params.year = activeYears;
        }

        if (quarter) {
          params.quarter = quarter;
        } else {
          params.quarter = ['Q1', 'Q2', 'Q3', 'Q4'];
        }
        
        if (wasteType) {
          params.waste_type = wasteType;
        } else if (activeWasteType.length === 1) {
          params.waste_type = activeWasteType[0];
        } else {
          params.waste_type = activeWasteType;
        }

        params.unit = unit; // always send the selected unit as a string
        
        // Year filter using diesel years
        if (fromYear && toYear) {
          const yearRange = activeYears.filter(year => year >= parseInt(fromYear) && year <= parseInt(toYear));
          params.year = yearRange;
        } else if (fromYear && !toYear) {
          const yearRange = activeYears.filter(year => year >= parseInt(fromYear));
          params.year = yearRange;
        } else if (!fromYear && toYear) {
          const yearRange = activeYears.filter(year => year <= parseInt(toYear));
          params.year = yearRange;
        } else {
          params.year = activeYears;
        }
        
        console.log('Sending params to haz gen type pie chart API:', params);
        
        const response = await api.get('/environment_dash/hazard-waste-type-bar-chart', { 
          params,
          paramsSerializer: { indexes: null }
        });

        console.log('Haz gen type pie chart response:', response.data);
        
        // Transform the data for pie chart
        const transformedData = transformHazGenTypePieData(response.data.data);
        
        setHazGenTypePieData(transformedData);
        
      } catch (error) {
        console.error('Failed to fetch haz gen type pie chart:', error);
        console.error('Error response:', error.response?.data);
        setHazGenTypePieData([]);
      }
    };

    if (companies.length > 0 && activeYears.length > 0 && activeWasteType.length > 0) {
      fetchHazGenTypePieChart();
    }
  }, [activeTab, companyId, quarter, fromYear, toYear, wasteType, unit, companies, activeYears, activeWasteType, activeUnits]);
  useEffect(() => {
    const fetchHazGenPieChart = async () => {
      if (activeTab !== 'hazardous_generated') return;

      try {
        // Build parameters (same logic as pie chart)
        const params = {};
        
        if (companyId) {
          params.company_id = companyId;
        } else {
          params.company_id = companies.map(company => company.id);
        }

        if (fromYear && toYear) {
          const yearRange = activeYears.filter(year => year >= parseInt(fromYear) && year <= parseInt(toYear));
          params.year = yearRange;
        } else if (fromYear && !toYear) {
          const yearRange = activeYears.filter(year => year >= parseInt(fromYear));
          params.year = yearRange;
        } else if (!fromYear && toYear) {
          const yearRange = activeYears.filter(year => year <= parseInt(toYear));
          params.year = yearRange;
        } else {
          params.year = activeYears;
        }

        if (quarter) {
          params.quarter = quarter;
        } else {
          params.quarter = ['Q1', 'Q2', 'Q3', 'Q4'];
        }
        
        if (wasteType) {
          params.waste_type = wasteType;
        } else if (activeWasteType.length === 1) {
          params.waste_type = activeWasteType[0];
        } else {
          params.waste_type = activeWasteType;
        }

        params.unit = unit; // always send the selected unit as a string
        
        console.log('Sending params to hazard generated pie chart API:', params);
        
        const response = await api.get('/environment_dash/hazard-waste-perc-pie-chart', { 
          params,
          paramsSerializer: { indexes: null }
        });

        //console.log('Hazard generated pie chart response:', response.data);
        
        // Validate response data
        const responseData = response.data?.data || [];
        //console.log('Validated response data:', responseData);
        
        // Make sure data has the correct structure
        const validatedData = responseData.map(item => ({
          label: item.company_id || 'Unknown',
          value: Number(item.total_generate) || 0,
          percentage: Number(item.percentage) || 0,
          color: item.color || COLORS[0]
        }));
        
        console.log('Final validated data for pie chart:', validatedData);
        
        // Set the pie chart data from API response
        setHazGenPieData(validatedData);
        
      } catch (error) {
        console.error('Failed to fetch hazard generated pie chart:', error);
        console.error('Error response:', error.response?.data);
        setHazGenPieData([]); // Set empty array on error
        setError('Failed to load pie chart data'); // Add error state
      } finally {
        setLoading(false); // Always clear loading state
      }
    };

    // Only fetch data if companies and available years have been loaded
    if (companies.length > 0 && activeYears.length > 0 && activeWasteType.length > 0) {
      fetchHazGenPieChart();
    }
  }, [activeTab, companyId, quarter, fromYear, toYear, wasteType, unit, companies, activeYears, activeWasteType, activeUnits]);


  useEffect(() => {
    const fetchHazGenLineChart = async () => {
      if (activeTab !== 'hazardous_generated') return;

      try {
        // Build parameters (same logic as pie chart)
        const params = {};
        
        if (companyId) {
          params.company_id = companyId;
        } else {
          params.company_id = companies.map(company => company.id);
        }

        if (fromYear && toYear) {
          const yearRange = activeYears.filter(year => year >= parseInt(fromYear) && year <= parseInt(toYear));
          params.year = yearRange;
        } else if (fromYear && !toYear) {
          const yearRange = activeYears.filter(year => year >= parseInt(fromYear));
          params.year = yearRange;
        } else if (!fromYear && toYear) {
          const yearRange = activeYears.filter(year => year <= parseInt(toYear));
          params.year = yearRange;
        } else {
          params.year = activeYears;
        }

        if (quarter) {
          params.quarter = quarter;
        } else {
          params.quarter = ['Q1', 'Q2', 'Q3', 'Q4'];
        }
        
        if (wasteType) {
          params.waste_type = wasteType;
        } else {
          params.waste_type = activeWasteType;
        }

        if (unit) {
          params.unit = unit;
        } else {
          params.unit = activeUnits;
        }
        
        //console.log('Sending params to hazard generated line chart API:', params);
        
        const response = await api.get('/environment_dash/hazard-waste-generated-line-chart', { 
          params,
          paramsSerializer: { indexes: null }
        });

        //console.log('Hazard Generated line chart response:', response.data);
        
        // Transform the data for Recharts
        const transformedData = transformLineChartData(response.data.data, response.data.colors);
        
        console.log('Transformed line chart data:', transformedData);
        
        setHazGenLineData(transformedData);
        setLineChartColors(response.data.colors || {});
        
      } catch (error) {
        console.error('Failed to fetch hazard generated line chart:', error);
        console.error('Error response:', error.response?.data);
        setHazGenLineData([]);
        setLineChartColors({});
      }
    };

    // Only fetch data if companies and available years have been loaded
    if (companies.length > 0 && activeYears.length > 0 && activeWasteType.length > 0) {
      fetchHazGenLineChart();
    }
  }, [activeTab, companyId, quarter, fromYear, toYear, wasteType, unit, companies, activeYears, activeWasteType, activeUnits]);

  useEffect(() => {
    const fetchHazGenBarChart = async () => {
      if (activeTab !== 'hazardous_generated') return;

      try {
        //console.log('Fetching hazard generated bar chart...');
        
        // Build parameters (same logic as other charts)
        const params = {};
        
        if (companyId) {
          params.company_id = companyId;
        } else {
          params.company_id = companies.map(company => company.id);
        }

        if (fromYear && toYear) {
          const yearRange = activeYears.filter(year => year >= parseInt(fromYear) && year <= parseInt(toYear));
          params.year = yearRange;
        } else if (fromYear && !toYear) {
          const yearRange = activeYears.filter(year => year >= parseInt(fromYear));
          params.year = yearRange;
        } else if (!fromYear && toYear) {
          const yearRange = activeYears.filter(year => year <= parseInt(toYear));
          params.year = yearRange;
        } else {
          params.year = activeYears;
        }

        if (quarter) {
          params.quarter = quarter;
        } else {
          params.quarter = ['Q1', 'Q2', 'Q3', 'Q4'];
        }
        
        if (wasteType) {
          params.waste_type = wasteType;
        } else {
          params.waste_type = activeWasteType;
        }

        if (unit) {
          params.unit = unit;
        } else {
          params.unit = activeUnits;
        }
        
        //console.log('Bar chart API params:', params);
        
        const response = await api.get('/environment_dash/hazard-waste-type-bar-chart', { 
          params,
          paramsSerializer: { indexes: null }
        });

        //console.log('Bar chart API response:', response.data);
        
        // Make sure we're getting the right data structure
        const responseData = response.data?.data || [];
        console.log('Response data array:', responseData);
        
        if (!Array.isArray(responseData)) {
          console.error('API response data is not an array:', responseData);
          setHazGenTypeBarData([]);
          return;
        }
        
        // Transform the data
        const transformedData = transformBarChartData(responseData);
        
        console.log('Final transformed data for bar chart:', transformedData);
        
        // Validate that transformed data has the right structure
        const isValidData = transformedData.every(item => 
          item.hasOwnProperty('waste_type') && 
          item.hasOwnProperty('total_generate') && 
          typeof item.total_generate === 'number'
        );
        
        if (!isValidData) {
          console.error('Transformed data is invalid:', transformedData);
          setHazGenTypeBarData([]);
          return;
        }
        
        setHazGenTypeBarData(transformedData);
        
      } catch (error) {
        console.error('Failed to fetch hazard generated bar chart:', error);
        console.error('Error response:', error.response?.data);
        setHazGenTypeBarData([]);
      }
    };

    // Only fetch data if companies and available years have been loaded
    if (companies.length > 0 && activeYears.length > 0 && activeWasteType.length > 0) {
      fetchHazGenBarChart();
    }
  }, [activeTab, companyId, quarter, fromYear, toYear, wasteType, unit, companies, activeYears, activeWasteType, activeUnits]);

  useEffect(() => {
    const fetchHazGenQuarterChart = async () => {
      if (activeTab !== 'hazardous_generated') return;

      try {
        //console.log('Fetching hazard generated bar chart...');
        
        // Build parameters (same logic as other charts)
        const params = {};
        
        if (companyId) {
          params.company_id = companyId;
        } else {
          params.company_id = companies.map(company => company.id);
        }

        if (fromYear && toYear) {
          const yearRange = activeYears.filter(year => year >= parseInt(fromYear) && year <= parseInt(toYear));
          params.year = yearRange;
        } else if (fromYear && !toYear) {
          const yearRange = activeYears.filter(year => year >= parseInt(fromYear));
          params.year = yearRange;
        } else if (!fromYear && toYear) {
          const yearRange = activeYears.filter(year => year <= parseInt(toYear));
          params.year = yearRange;
        } else {
          params.year = activeYears;
        }

        if (quarter) {
          params.quarter = quarter;
        } else {
          params.quarter = ['Q1', 'Q2', 'Q3', 'Q4'];
        }
        
        if (wasteType) {
          params.waste_type = wasteType;
        } else {
          params.waste_type = activeWasteType;
        }

        if (unit) {
          params.unit = unit;
        } else {
          params.unit = activeUnits;
        }
        
        console.log('Sending params to haz gen quarterly chart API:', params);
        
        const response = await api.get('/environment_dash/hazard-waste-quarter-bar-chart', { 
          params,
          paramsSerializer: { indexes: null }
        });

        console.log('Haz gen quarterly chart response:', response.data);
        
        // Transform the data for stacked bar chart
        const transformedData = transformQuarterBarChartData(response.data.data);
        
        setHazGenQrtrBarData(transformedData.chartData);
        setQuarterCompanyColors(transformedData.colors);
        
      } catch (error) {
        console.error('Failed to fetch haz gen quarterly chart:', error);
        console.error('Error response:', error.response?.data);
        setHazGenQrtrBarData([]);
        setQuarterCompanyColors({});
      }
    };

    // Only fetch data if companies and available years have been loaded
    if (companies.length > 0 && activeYears.length > 0 && activeWasteType.length > 0) {
      fetchHazGenQuarterChart();
    }
  }, [activeTab, companyId, quarter, fromYear, toYear, wasteType, unit, companies, activeYears, activeWasteType, activeUnits]);

  // Get tab display properties
  const getTabInfo = () => {
    switch(activeTab) {
      case 'hazardous_generated':
        return {
          title: 'Hazardous Generated',
          keyMetrics: {
            card1: { title: 'YEAR-ON-YEAR CUMULATIVE HAZARDOUS WASTE GENERATED', value: '26,275.47', unit: 'kg | 24,353.33 L' },
            card2: { title: 'MOST GENERATED WASTE TYPE', value: '24,353.33 L', subtitle: 'Used Oil' },
            card3: { title: 'AVERAGE ANNUAL HAZARDOUS WASTE GENERATED', value: '3,284.43', unit: 'kg | 3,044.17 L' }
          }
        };
      case 'hazardous_disposed':
        return {
          title: 'Hazardous Disposed', 
          keyMetrics: {
            card1: { title: 'YEAR-ON-YEAR CUMULATIVE HAZARDOUS WASTE DISPOSED', value: '22,343.47', unit: 'kg | 16,864.45 L' },
            card2: { title: 'MOST DISPOSED WASTE TYPE', value: '16,864.44 L', subtitle: 'Used Oil' },
            card3: { title: 'AVERAGE ANNUAL HAZARDOUS WASTE DISPOSED', value: '2,792.93', unit: 'kg | 2,108.06 L' }
          }
        };
      case 'non_hazardous_generated':
        return {
          title: 'Non-hazardous Generated',
          keyMetrics: {
            card1: { title: 'YEAR-ON-YEAR CUMULATIVE NON-HAZARDOUS WASTE GENERATED', value: '17909.95', unit: 'kg' },
            card2: { title: 'MOST GENERATED METRIC', value: '9574.26', unit: 'kg', subtitle: 'Residual' },
            card3: { title: 'AVERAGE ANNUAL NON HAZARDOUS WASTE GENERATED', value: '2238.74', unit: 'kg' }
          }
        };
      default:
        return { title: '', keyMetrics: {} };
    }
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
            {data.value.toLocaleString()} {currentData.unit}
          </p>
          <p style={{ margin: 0, color: '#64748b' }}>
            {data.payload.percentage}% of total
          </p>
        </div>
      );
    }
    return null;
  };

  const renderHazGenTypeTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      // Extract property name from the formatted label (before the newline)
      const propertyName = data.payload.label.split('\n')[0];
      return (
        <div style={{
          backgroundColor: 'white',
          padding: '8px 12px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          fontSize: '12px'
        }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>{propertyName}</p>
          <p style={{ margin: 0, color: data.payload.color }}>
            {data.value.toLocaleString()} L
          </p>
          <p style={{ margin: 0, fontSize: '10px' }}>
            {data.payload.percentage}%
          </p>
        </div>
      );
    }
    return null;
  };

  const renderLineChartTooltip = ({ active, payload, label }) => {
    if (!active || !payload || payload.length === 0) return null;

    return (
      <div
        style={{
          backgroundColor: 'white',
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '6px',
          boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
          fontSize: '12px',
        }}
      >
        <div style={{ marginBottom: '5px', fontWeight: '600', color: '#1e293b' }}>
          Year: {label}
        </div>
        {payload.map((entry, index) => (
          <div key={index} style={{ marginBottom: '2px', color: '#1e293b' }}>
            <span
              style={{
                display: 'inline-block',
                width: '10px',
                height: '10px',
                backgroundColor: entry.color,
                marginRight: '6px',
                borderRadius: '2px',
              }}
            />
            {entry.name}: {Number(entry.value).toLocaleString()} {currentData.unit}
          </div>
        ))}
      </div>
    );
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
              {entry.dataKey.toUpperCase()}: {Number(entry.value).toLocaleString()} {currentData.unit}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Clear all filters function
  const clearAllFilters = () => {
    setCompanyId('');
    setQuarter('');
    setFromYear('');
    setToYear('');
    setWasteType('');
    setUnit('Kilogram');
  };

  const tabInfo = getTabInfo();

  const wasteTypeShortNames = {
    "Electronic Waste": "Electronics",
    "Empty Containers": "Containers",
    "Oil Contaminated Materials": "Contaminated Oil",
    "Paints/Solvent Based": "Chemicals",
    // Add more mappings as needed
  };

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
        backgroundColor: '#ffffff',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
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
              Environment - Waste
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

        {/* Tab Buttons */}
        <div style={{ 
          display: 'flex', 
          gap: '8px',
          marginBottom: '15px',
          flexShrink: 0
        }}>
          <button
            onClick={() => setActiveTab('hazardous_generated')}
            style={{
              padding: '8px 16px',
              backgroundColor: activeTab === 'hazardous_generated' ? '#10B981' : '#9CA3AF',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              minWidth: '120px'
            }}
          >
            Hazardous Generated
          </button>
          <button
            onClick={() => setActiveTab('hazardous_disposed')}
            style={{
              padding: '8px 16px',
              backgroundColor: activeTab === 'hazardous_disposed' ? '#10B981' : '#9CA3AF',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              minWidth: '120px'
            }}
          >
            Hazardous Disposed
          </button>
          <button
            onClick={() => setActiveTab('non_hazardous_generated')}
            style={{
              padding: '8px 16px',
              backgroundColor: activeTab === 'non_hazardous_generated' ? '#10B981' : '#9CA3AF',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              minWidth: '150px'
            }}
          >
            Non-hazardous Generated
          </button>
        </div>

        {/* Filters */}
        <div style={{ 
          display: 'flex', 
          gap: '10px',
          marginBottom: '15px',
          flexWrap: 'wrap',
          alignItems: 'center',
          flexShrink: 0
        }}>
          {/* Company Filter */}
          <select 
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
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
            <option value="">All Quarter</option>
            <option value="Q1">Q1</option>
            <option value="Q2">Q2</option>
            <option value="Q3">Q3</option>
            <option value="Q4">Q4</option>
          </select>

          

          {activeTab === 'non_hazardous_generated' ? (
            <>
              {/*Metrics Filter */}
              <select 
                value={metrics}
                onChange={(e) => setMetrics(e.target.value)}
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
                <option value="">All Metrics</option>
                {activeMetrics.map((metrics) => (
                  <option key={metrics} value={metrics}>
                    {metrics}
                  </option>
                ))}
              </select>
            </>
          ) :
          <>
            {/* Waste Type Filter */}
            <select 
              value={wasteType}
              onChange={(e) => setWasteType(e.target.value)}
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
              <option value="">All Waste Type</option>
              {activeWasteType.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </>
          }

          {/* Unit Filter */}
          <select 
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
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
            {activeUnits.map((units) => (
              <option key={units} value={units}>
                {units}
              </option>
            ))}
          </select>

          {/* Year Range Filter */}
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
              {activeYears.map((year) => (
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
              {activeYears
                .filter(year => !fromYear || year >= parseInt(fromYear))
                .map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
            </select>
          </div>

          {/* Clear All Filters Button */}
          {(companyId || quarter || fromYear || toYear || wasteType || (unit !== 'Kilogram')) && (
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

        {/* Key Metrics Cards */}
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
              {tabInfo.keyMetrics.card1?.value} {tabInfo.keyMetrics.card1?.unit}
            </div>
            <div style={{ fontSize: '10px', opacity: 0.9, marginBottom: '6px' }}>
              {tabInfo.keyMetrics.card1?.title}
            </div>
          </div>

          <div style={{
            backgroundColor: '#1e293b',
            color: 'white',
            padding: '15px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '3px' }}>
              {tabInfo.keyMetrics.card2?.value}
            </div>
            <div style={{ fontSize: '10px', opacity: 0.9, marginBottom: '6px' }}>
              {tabInfo.keyMetrics.card2?.title}
            </div>
            {tabInfo.keyMetrics.card2?.subtitle && (
              <div style={{ fontSize: '9px', opacity: 0.8 }}>
                {tabInfo.keyMetrics.card2?.subtitle}
              </div>
            )}
          </div>

          <div style={{
            backgroundColor: '#10B981',
            color: 'white',
            padding: '15px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '3px' }}>
              {tabInfo.keyMetrics.card3?.value} {tabInfo.keyMetrics.card3?.unit}
            </div>
            <div style={{ fontSize: '10px', opacity: 0.9, marginBottom: '6px' }}>
              {tabInfo.keyMetrics.card3?.title}
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div style={{ 
          flex: 1,
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gridTemplateRows: 'auto',
          gap: '15px',
          minHeight: 0
        }}>
          {activeTab === 'hazardous_generated' && (
            <>
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
                  Total Hazardous Waste Generated by Company Combined
                </h3>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                  {/* Show loading state */}
                  {loading ? (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: '200px',
                      color: '#64748b',
                      fontSize: '14px'
                    }}>
                      Loading chart data...
                    </div>
                  ) : currentData.pieData.length === 0 ? (
                    // Show no data message
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: '200px',
                      color: '#64748b',
                      fontSize: '14px',
                      textAlign: 'center'
                    }}>
                      <div>
                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>📊</div>
                        <div>No data available</div>
                        <div style={{ fontSize: '12px', marginTop: '4px' }}>
                          Try adjusting your filters
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Show pie chart
                    <div style={{ flex: 1, minHeight: 0 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={currentData.pieData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={200}
                            innerRadius={70}
                            fill="#8884d8"
                            dataKey="value"
                            paddingAngle={2}
                            startAngle={90}
                            endAngle={450}
                          >
                            {currentData.pieData.map((entry, index) => (
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
                  )}

                  {/* Legend - only show if there's data */}
                  {!loading && currentData.pieData.length > 0 && (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      flexWrap: 'wrap',
                      gap: '8px',
                      fontSize: '10px',
                      flexShrink: 0,
                      marginTop: '8px'
                    }}>
                      {currentData.pieData.map((entry, index) => (
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
                  )}
                </div>
              </div>

              <div style={{ 
                display: 'flex',
                flexDirection: 'column',
                gap: '15px',
                minHeight: '300px',  // Ensure a visible minimum height
                height: '100%'       // Allow the chart to scale with the container
              }}>

                <div
                  style={{
                    backgroundColor: 'white',
                    padding: '12px',
                    borderRadius: '8px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    minHeight: 0,
                    height: '100%'
                  }}
                >
                  <h3
                    style={{
                      fontSize: '13px',
                      fontWeight: '600',
                      marginBottom: '10px',
                      color: '#1e293b',
                      flexShrink: 0,
                    }}
                  >
                    Hazard Waste Composition by Type
                  </h3>

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'row', minHeight: 0 }}>
                    {loading ? (
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          height: '250px',
                          color: '#64748b',
                          fontSize: '14px',
                        }}
                      >
                        Loading chart data...
                      </div>
                    ) : !currentData.pieTypeData || currentData.pieTypeData.length === 0 ? (
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          height: '250px',
                          color: '#64748b',
                          fontSize: '14px',
                          textAlign: 'center',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '24px', marginBottom: '8px' }}>🥧</div>
                          <div>No property data available</div>
                          <div style={{ fontSize: '12px', marginTop: '4px' }}>
                            Try adjusting your filters
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ flex: 1, minHeight: 0 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={currentData.pieTypeData}
                              cx="50%"
                              cy="50%" // ✅ Centered vertically
                              labelLine={false}
                              outerRadius={100} // ✅ Slightly smaller radius to avoid clipping
                              innerRadius={40}
                              fill="#8884d8"
                              dataKey="value"
                              paddingAngle={2}
                              startAngle={90}
                              endAngle={450}
                            >
                              {currentData.pieTypeData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={entry.color || COLORS[index % COLORS.length]}
                                />
                              ))}
                            </Pie>
                            <Tooltip content={renderHazGenTypeTooltip} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    {/* Legend on the right */}
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        paddingLeft: '16px',
                        minWidth: '160px',
                        flexShrink: 0,
                        fontSize: '10px',
                      }}
                    >
                      {currentData.pieTypeData.map((entry, index) => {
                        const propertyName =
                          typeof entry.label === 'string'
                            ? entry.label.split('\n')[0]
                            : entry.waste_type || entry.company_id || '';
                        return (
                          <div
                            key={index}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              marginBottom: '4px',
                            }}
                          >
                            <div
                              style={{
                                width: '8px',
                                height: '8px',
                                backgroundColor: entry.color || COLORS[index % COLORS.length],
                                borderRadius: '1px',
                                flexShrink: 0,
                              }}
                            ></div>
                            <span style={{ fontWeight: '500', fontSize: '9px' }}>
                              {propertyName}: {(entry.value || 0).toLocaleString()}{' '}
                              {unit === 'Kilogram' ? 'Kg' : unit === 'Liter' ? 'L' : 'Pcs'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div style={{ 
                  backgroundColor: 'white',
                  padding: '12px',
                  borderRadius: '8px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  minHeight: 0,
                  height: '100%'
                }}>
                  <h3 style={{ 
                    fontSize: '13px', 
                    fontWeight: '600', 
                    marginBottom: '10px',
                    color: '#1e293b',
                    flexShrink: 0
                  }}>
                    Total Hazard Waste Generated by Waste Type ({unit})
                  </h3>
                  <div style={{ flex: 1, minHeight: 0}}>
                    {loading ? (
                      <div>Loading...</div>
                    ) : currentData.barChartData.length === 0 ? (
                      <div>No data available</div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[...currentData.barChartData].sort((a, b) => b.total_generate - a.total_generate)} // Sort descending
                          layout="horizontal"
                          margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis 
                            type="category"
                            dataKey="waste_type"
                            tick={{ fontSize: 11, fill: '#64748b' }}
                            tickFormatter={(wasteType) => wasteTypeShortNames[wasteType] || wasteType}
                          />
                          <YAxis 
                            type="number"
                            tick={{ fontSize: 10, fill: '#64748b' }}
                          />
                          <Tooltip 
                            formatter={(value) => `${Number(value).toLocaleString()} ${currentData.unit}`}
                            labelFormatter={(label) => wasteTypeShortNames[label] || label}
                          />
                          <Bar 
                            dataKey="total_generate" 
                            fill="#3B82F6"
                            label={{ position: 'top', fontSize: 10 }}
                          >
                            {currentData.barChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </div>
              
              <div style={{ 
                display: 'flex',
                flexDirection: 'column',
                gap: '15px',
                minHeight: 0
              }}>
                <div style={{ 
                  backgroundColor: 'white',
                  padding: '12px',
                  borderRadius: '8px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  minHeight: 0,
                  height: '100%'
                }}>
                  <h3 style={{ 
                    fontSize: '13px', 
                    fontWeight: '600', 
                    marginBottom: '10px',
                    color: '#1e293b',
                    flexShrink: 0
                  }}>
                    Hazardous Waste Generated in Year
                  </h3>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'row', minHeight: 0 }}>
                    {loading ? (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                        color: '#64748b',
                        fontSize: '14px'
                      }}>
                        Loading chart data...
                      </div>
                    ) : currentData.lineChartData.length === 0 ? (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                        color: '#64748b',
                        fontSize: '14px',
                        textAlign: 'center'
                      }}>
                        <div>
                          <div style={{ fontSize: '24px', marginBottom: '8px' }}>📈</div>
                          <div>No line chart data available</div>
                          <div style={{ fontSize: '12px', marginTop: '4px' }}>
                            Try adjusting your filters
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ flex: 1, minHeight: 0 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={currentData.lineChartData}>
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
                              tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                            />
                            <Tooltip content={renderLineChartTooltip}/>
                            <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{fontSize: '9px', p:3}}/>
                            
                            {/* Dynamically render lines based on available companies */}
                            {activeWasteType.map((wasteType, index) => (
                              <Line
                                key={wasteType}
                                type="monotone"
                                dataKey={wasteType}
                                stroke={lineChartColors[wasteType] || COLORS[index % COLORS.length]}
                                strokeWidth={2}
                                dot={{ fill: lineChartColors[wasteType] || COLORS[index % COLORS.length], strokeWidth: 2, r: 3 }}
                                name={wasteTypeShortNames[wasteType] || wasteType}
                              />
                            ))}
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                </div>

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
                    Total Hazardous Waste Generated per Quarter by Waste Type
                  </h3>
                  
                  <div style={{ flex: 1, minHeight: 0 }}>
                    {loading ? (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                        color: '#64748b',
                        fontSize: '14px'
                      }}>
                        Loading chart data...
                      </div>
                    ) : currentData.barChartQrtrData.length === 0 ? (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                        color: '#64748b',
                        fontSize: '14px',
                        textAlign: 'center'
                      }}>
                        <div>
                          <div style={{ fontSize: '24px', marginBottom: '8px' }}>📊</div>
                          <div>No quarterly data available</div>
                          <div style={{ fontSize: '12px', marginTop: '4px' }}>
                            Try adjusting your filters
                          </div>
                        </div>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={currentData.barChartQrtrData || []}>
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
                            tickFormatter={(value) => {
                              if (value >= 1000000) {
                                return `${(value / 1000000).toFixed(1)}M`;
                              } else if (value >= 1000) {
                                return `${(value / 1000).toFixed(0)}K`;
                              } else {
                                return value.toString();
                              }
                            }}
                          />
                          <Tooltip content={renderStackedBarTooltip} />
                          <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ fontSize: '10px' }} />
                          {/* Render bars for each waste type */}
                          {Object.keys(currentData.barChartQrtrData[0])
                            .filter(key => key !== 'quarter')
                            .map((wasteType, index) => (
                              <Bar
                                key={wasteType}
                                dataKey={wasteType}
                                stackId="a"
                                fill={currentData.colors && currentData.colors[wasteType] ? currentData.colors[wasteType] : COLORS[index % COLORS.length]}
                                name={wasteTypeShortNames[wasteType] || wasteType}
                              />
                          ))}
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'hazardous_disposed' && (
            <>
              {/* Top Row - 4 charts */}
              <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '10px', color: '#1e293b', flexShrink: 0 }}>
                  Waste Disposed in Company
                </h3>
                <div style={{ flex: 1, minHeight: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[]} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} />
                      <YAxis type="category" dataKey="company" tick={{ fontSize: 10, fill: '#64748b' }} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '10px', color: '#1e293b', flexShrink: 0 }}>
                  Total Hazardous Waste Disposed by Unit
                </h3>
                <div style={{ flex: 1, minHeight: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={[]} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '10px', color: '#1e293b', flexShrink: 0 }}>
                  Hazardous Waste Disposed in Year
                </h3>
                <div style={{ flex: 1, minHeight: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                      <Tooltip />
                      <Legend />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '10px', color: '#1e293b', flexShrink: 0 }}>
                  Hazard Disposed Yearly Comparison
                </h3>
                <div style={{ flex: 1, minHeight: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                      <Tooltip />
                      <Legend />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bottom Row - 4 charts */}
              <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '10px', color: '#1e293b', flexShrink: 0 }}>
                  YoH Control Consumption Waste Types
                </h3>
                <div style={{ flex: 1, minHeight: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '10px', color: '#1e293b', flexShrink: 0 }}>
                  Yearly Disposal Change %
                </h3>
                <div style={{ flex: 1, minHeight: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '10px', color: '#1e293b', flexShrink: 0 }}>
                  Additional Chart
                </h3>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '12px' }}>
                  {/* Placeholder for additional chart */}
                </div>
              </div>
            </>
          )}

          {activeTab === 'non_hazardous_generated' && (
            <>
              {/* Top Row - 2 charts */}
              <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '10px', color: '#1e293b', flexShrink: 0 }}>
                  Distribution of Non-Hazardous Waste Generated by Company
                </h3>
                <div style={{ flex: 1, minHeight: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={[]} cx="50%" cy="50%" outerRadius={80} innerRadius={40} fill="#8884d8" dataKey="value" />
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '10px', color: '#1e293b', flexShrink: 0 }}>
                  Non-Hazardous Waste by Year and Metric (Kilograms)
                </h3>
                <div style={{ flex: 1, minHeight: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                      <Tooltip />
                      <Legend />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bottom Row - 2 charts */}
              <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '10px', color: '#1e293b', flexShrink: 0 }}>
                  Total Non-Hazardous Waste by Metrics per Company (Unit: Kilograms)
                </h3>
                <div style={{ flex: 1, minHeight: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[]} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} />
                      <YAxis type="category" dataKey="company" tick={{ fontSize: 10, fill: '#64748b' }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="food" stackId="a" fill="#F59E0B" />
                      <Bar dataKey="residual" stackId="a" fill="#EF4444" />
                      <Bar dataKey="compostable" stackId="a" fill="#84CC16" />
                      <Bar dataKey="petBottles" stackId="a" fill="#06B6D4" />
                      <Bar dataKey="scrapMetal" stackId="a" fill="#8B5CF6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{ backgroundColor: 'white', padding: '12px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '13px', fontWeight: '600', marginBottom: '10px', color: '#1e293b', flexShrink: 0 }}>
                  PWEI - Non-Hazardous Waste by Quarter - 2024
                </h3>
                <div style={{ flex: 1, minHeight: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="quarter" tick={{ fontSize: 10, fill: '#64748b' }} />
                      <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="food" fill="#F59E0B" name="Food" />
                      <Bar dataKey="residual" fill="#06B6D4" name="Residual" />
                      <Bar dataKey="scrapTires" fill="#EC4899" name="Scrap Tires" />
                      <Bar dataKey="compostable" fill="#84CC16" name="Compostable" />
                      <Bar dataKey="petBottles" fill="#10B981" name="PET Bottles" />
                      <Bar dataKey="scrapMetal" fill="#64748b" name="Scrap Metal" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default EnvironmentWasteDash;