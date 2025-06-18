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
import MultiSelectWithChips from '../../components/DashboardComponents/MultiSelectDropdown'; // Import the component

const COLORS = ['#3B82F6', '#F97316', '#10B981', '#EF4444', '#8B5CF6', '#F59E0B', '#64748b', '#06B6D4', '#84CC16'];

function EnvironmentWasteDash() {
  const [activeTab, setActiveTab] = useState('hazardous_generated'); // 'hazardous_generated', 'hazardous_disposed', 'non_hazardous_generated'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date()); // Add state for last updated time

  // Filters - Common for all tabs
  const [companyId, setCompanyId] = useState([]); // Now handles array of company IDs
  const [quarter, setQuarter] = useState([]); // Now handles array of quarters
  const [fromYear, setFromYear] = useState('');
  const [toYear, setToYear] = useState('');
  const [wasteType, setWasteType] = useState([]); // Now handles array of waste types
  const [metricsType, setMetrics] = useState([]); // Now handles array of metrics
  const [unit, setUnit] = useState('Kilogram'); // Now handles array of units with default
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
  const [keyMetrics, setKeyMetrics] = useState([]);

  const [hazGenPieData, setHazGenPieData] = useState([]);
  const [hazGenTypePieData, setHazGenTypePieData] = useState([]);
  const [hazGenLineData, setHazGenLineData] = useState([]);
  const [lineChartColors, setLineChartColors] = useState([]);
  const [hazGenTypeBarData, setHazGenTypeBarData] = useState([]);
  const [hazGenQrtrBarData, setHazGenQrtrBarData] = useState([]);
  const [barChartColors, setBarChartColors] = useState({});
  const [hazDisYearBarData, setHazDisYearBarData] = useState({
    chartData: [],
    companies: [],
    colors: {}
  });
  const [nonHazMetricsBarData, setNonHazMetricsBarData] = useState({
    chartData: [],
    companies: [],
    metrics: [],
    metricsLegend: [],
    units: [],
    grandTotal: 0
  });
  const [nonHazMetricsLineData, setNonHazMetricsLineData] = useState({
    chartData: [],
    transformedData: [],
    companies: [],
    metrics: [],
    years: [],
    units: [],
    legend: [],
    yearSummary: [],
    grandTotal: 0
  });
  const [nonHazMetricsHeatmapData, setNonHazMetricsHeatmapData] = useState({
    data: [],
    companies: [],
    metrics: [],
    years: [],
    units: [],
    companyTotals: [],
    yearTotals: [],
    scale: { min_waste: 0, max_waste: 0 },
    gridDimensions: { width: 0, height: 0 },
    grandTotal: 0
  });
  const [nonHazQuarterBarData, setNonHazQuarterBarData] = useState({
    chartData: [],
    companies: [],
    metrics: [],
    quarters: [],
    years: [],
    units: [],
    metricsLegend: [],
    companySummary: [],
    quarterSummary: [],
    quarterYearLabels: [],
    grandTotal: 0
  });

  const [wasteTypeColors, setWasteTypeColors] = useState({});

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
        setError(null); // Clear any previous errors
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setCompanies([]);
        setHazGenYears([]);
        setHazGenWasteType([]);
        setHazGenUnits([]);
        setHazDisYears([]);
        setHazDisWasteType([]);
        setHazDisUnits([]);
        setNonHazYears([]);
        setNonHazMetrics([]);
        setNonHazUnits([]);
        setError('Not Accessible. Only authorized people can access this.');
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
        setActiveMetrics(nonHazMetrics || []);
        setActiveUnits(hazGenUnits || []);
        break;
      case 'hazardous_disposed':
        setActiveYears(hazDisYears || []);
        setActiveWasteType(hazDisWasteType || []);
        setActiveMetrics(nonHazMetrics || []);
        setActiveUnits(hazDisUnits || []);
        break;
      case 'non_hazardous_generated':
        setActiveYears(nonHazYears || []);
        setActiveWasteType(hazGenWasteType || []);
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
    setFromYear(activeYears[0]);
    setToYear(activeYears[activeYears.length - 1]);
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
    } else if (activeTab === 'hazardous_disposed') {
      return {
        pieData: hazGenPieData,
        pieTypeData: hazGenTypePieData,
        lineChartData: hazGenLineData,
        barChartData: hazGenTypeBarData,
        barChartYearData: hazDisYearBarData.chartData || [],
        colors: hazDisYearBarData.colors || {},
        companies: hazDisYearBarData.companies || [],
        unit: unit
      };
    } else {
      return {
        pieData: hazGenPieData,
        unit: unit
      };
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const currentData = getCurrentData();

  // Move the helper function OUTSIDE ng transformHazGenTypePieData
  const generateColorForWasteType = (wasteType) => {
    // Simple hash-based color generation
    let hash = 0;
    for (let i = 0; i < wasteType.length; i++) {
      hash = wasteType.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 70%, 60%)`;
  };

  // Fixed transform function
  const transformHazGenTypePieData = (data) => {
    if (!data || data.length === 0) {
      return [];
    }

    // Aggregate data by waste_type (combine all companies)
    const aggregatedData = {};

    data.forEach(item => {
      const wasteType = item.waste_type;
      const generate = item.total_generate !== null && item.total_generate !== undefined ? parseFloat(item.total_generate) : 0;
      const dispose = item.total_disposed !== null && item.total_disposed !== undefined ? parseFloat(item.total_disposed) : 0;

      if (aggregatedData[wasteType]) {
        aggregatedData[wasteType].total_generate += generate;
        aggregatedData[wasteType].total_disposed += dispose;
      } else {
        aggregatedData[wasteType] = {
          waste_type: wasteType,
          total_generate: generate,
          total_disposed: dispose,
          unit: item.unit,
          color: item.color || generateColorForWasteType(wasteType)
        };
      }
    });

    // Convert to array and sort by the correct field
    const transformedData = Object.values(aggregatedData)
      .sort((a, b) => {
        const field = activeTab === 'hazardous_generated' ? 'total_generate' : 'total_disposed';
        return b[field] - a[field];
      })
      .map(item => ({
        name: item.waste_type,
        value: activeTab === 'hazardous_generated'
          ? item.total_generate
          : item.total_disposed,
        color: item.color,
        unit: item.unit
      }));

    console.log('Transformed combined pie data:', transformedData);
    return transformedData;
  };

  const transformLineChartData = (apiData, colors) => {
    if (!Array.isArray(apiData) || apiData.length === 0) {
      return [];
    }

    // Collect all unique years
    const allYears = new Set();
    apiData.forEach(wasteTypeObj => {
      (wasteTypeObj.data || []).forEach(item => {
        if (item && item.year != null) allYears.add(item.year);
      });
    });
    const sortedYears = Array.from(allYears).sort();

    // Build data for recharts: [{year: 2018, "Used Oil": 16, ...}, ...]
    const transformedData = sortedYears.map(year => {
      const yearData = { year };
      apiData.forEach(wasteTypeObj => {
        const found = (wasteTypeObj.data || []).find(item => item && item.year === year);
        let value = 0;
        if (found) {
          value = activeTab === 'hazardous_generated'
            ? Number(found.total_generate ?? 0)
            : Number(found.total_disposed ?? 0);
        }
        yearData[wasteTypeObj.waste_type] = value;
      });
      return yearData;
    });

    return transformedData;
  };

  const transformBarChartDataWithColors = (apiData) => {
    if (!Array.isArray(apiData) || apiData.length === 0) {
      return {
        chartData: [],
        wasteTypes: [],
        colors: {}
      };
    }

    console.log('API Data for bar chart:', apiData);

    // USE THE STORED COLOR MAPPING INSTEAD OF API COLORS
    const wasteTypeColorMap = { ...wasteTypeColors };
    const allWasteTypes = new Set();

    // Aggregate by waste_type for both generated and disposed
    const wasteMap = {};
    apiData.forEach(item => {
      const id = item.waste_type || 'Unknown';
      const generate = item.total_generate !== undefined && item.total_generate !== null ? Number(item.total_generate) : 0;
      const dispose = item.total_disposed !== undefined && item.total_disposed !== null ? Number(item.total_disposed) : 0;

      allWasteTypes.add(id);
      
      // Use stored color mapping or fallback
      if (!wasteTypeColorMap[id]) {
        wasteTypeColorMap[id] = wasteTypeColors[id] || COLORS[Array.from(allWasteTypes).indexOf(id) % COLORS.length];
      }

      if (!wasteMap[id]) {
        wasteMap[id] = {
          waste_type: id,
          total_generate: 0,
          total_disposed: 0,
          color: wasteTypeColorMap[id]
        };
      }
      wasteMap[id].total_generate += generate;
      wasteMap[id].total_disposed += dispose;
    });

    const chartData = Object.values(wasteMap);
    const wasteTypes = Array.from(allWasteTypes);

    console.log('Transformed bar chart data:', chartData);
    
    return {
      chartData,
      wasteTypes,
      colors: wasteTypeColorMap
    };
  };

  const transformQuarterBarChartData = (apiData) => {
    if (!Array.isArray(apiData) || apiData.length === 0) {
      return [];
    }

    // Group data by quarter, stack by waste_type
    const groupedByQuarter = {};
    const allWasteTypes = new Set();
    // USE THE STORED COLOR MAPPING INSTEAD OF API COLORS
    const wasteTypeColorMap = { ...wasteTypeColors };

    apiData.forEach(item => {
      const quarter = item.quarter;
      const wasteType = item.waste_type;
      const value = item.total_generate;

      allWasteTypes.add(wasteType);
      // Use stored color mapping or fallback
      if (!wasteTypeColorMap[wasteType]) {
        wasteTypeColorMap[wasteType] = wasteTypeColors[wasteType] || COLORS[Array.from(allWasteTypes).indexOf(wasteType) % COLORS.length];
      } 

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

  const transformYearBarChartData = (apiData) => {
    if (!Array.isArray(apiData) || apiData.length === 0) {
      return {
        chartData: [],
        companies: [],
        colors: {}
      };
    }

    // 1. Collect all years and companies
    const allYears = new Set();
    const companies = [];
    const companyColorMap = {};

    apiData.forEach(companyObj => {
      companies.push(companyObj.company_id);
      companyColorMap[companyObj.company_id] = companyObj.color;
      (companyObj.data || []).forEach(item => {
        allYears.add(item.year);
      });
    });

    const sortedYears = Array.from(allYears).sort();

    // 2. Build chartData: [{ year: 2024, PSC: 6248, PWEI: 3207, ... }, ...]
    const chartData = sortedYears.map(year => {
      const row = { year };
      companies.forEach(company => {
        // Find the company object
        const companyObj = apiData.find(c => c.company_id === company);
        // Find the year data for this company
        const yearData = (companyObj.data || []).find(d => d.year === year);
        row[company] = yearData ? yearData.total_disposed : 0;
      });
      return row;
    });

    return {
      chartData,
      companies,
      colors: companyColorMap
    };
  };

  const transformNonHazLineChartData = (apiData, years) => {
    if (!Array.isArray(apiData) || apiData.length === 0) {
      return [];
    }

    // Create chart data where each year is a point, and each company-metric combination is a line
    const transformedData = years.map(year => {
      const yearData = { year };
      
      // Add data for each company-metric combination
      apiData.forEach(line => {
        const lineKey = `${line.company_id}_${line.metrics}`;
        const dataPoint = line.data_points.find(point => point.year === year);
        yearData[lineKey] = dataPoint ? dataPoint.total_waste : 0;
      });
      
      return yearData;
    });

    return transformedData;
  };

  const getHeatmapColor = (intensity) => {
    if (intensity === 0) return '#f8f9fa'; // Very light gray for zero values
    
    // Color scale similar to the image: light green to dark blue
    // Using a gradient from light yellow-green to dark blue
    const colors = [
      '#f7fcf0', // Very light green (0)
      '#e0f3db', // Light green (0.1)
      '#ccebc5', // Light green (0.2)
      '#a8ddb5', // Green (0.3)
      '#7bccc4', // Green-blue (0.4)
      '#4eb3d3', // Light blue (0.5)
      '#2b8cbe', // Blue (0.6)
      '#0868ac', // Dark blue (0.7)
      '#084081', // Darker blue (0.8)
      '#08306b'  // Darkest blue (1.0)
    ];
    
    const index = Math.min(Math.floor(intensity * colors.length), colors.length - 1);
    return colors[index];
  };

  const transformNonHazQuarterChartData = (apiData, metricsLegend) => {
    if (!Array.isArray(apiData) || apiData.length === 0) {
      return [];
    }

    // Group data by quarter, aggregating across all years
    const quarterGroups = {
      'Q1': { quarter: 'Q1', total_waste: 0 },
      'Q2': { quarter: 'Q2', total_waste: 0 },
      'Q3': { quarter: 'Q3', total_waste: 0 },
      'Q4': { quarter: 'Q4', total_waste: 0 }
    };

    // Initialize metrics for each quarter
    metricsLegend.forEach(metric => {
      Object.keys(quarterGroups).forEach(quarter => {
        quarterGroups[quarter][metric.metrics] = 0;
      });
    });

    // Aggregate data by quarter across all years
    apiData.forEach(quarterData => {
      const quarter = quarterData.quarter;
      if (quarterGroups[quarter]) {
        quarterGroups[quarter].total_waste += quarterData.total_waste;
        
        // Aggregate each metric
        quarterData.metrics_data.forEach(metricData => {
          quarterGroups[quarter][metricData.metrics] += metricData.total_waste;
        });
      }
    });

    // Convert to array and round values
    return Object.values(quarterGroups).map(quarterData => {
      const rounded = { ...quarterData };
      rounded.total_waste = Math.round(rounded.total_waste * 100) / 100;
      
      metricsLegend.forEach(metric => {
        rounded[metric.metrics] = Math.round(rounded[metric.metrics] * 100) / 100;
      });
      
      return rounded;
    });
  };

  // Modified fetchParams function to handle arrays
  const fetchParams = () => {
    try {
      const params = {};
      
      // Handle company ID - check if it's an array and has values
      if (Array.isArray(companyId) && companyId.length > 0) {
        params.company_id = companyId;
      } else if (!Array.isArray(companyId) && companyId) {
        params.company_id = companyId;
      } else {
        params.company_id = companies.map(company => company.id);
      }

      // Handle year range
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

      // Handle quarter - check if it's an array and has values
      if (Array.isArray(quarter) && quarter.length > 0) {
        params.quarter = quarter;
      } else if (!Array.isArray(quarter) && quarter) {
        params.quarter = quarter;
      } else {
        params.quarter = ['Q1', 'Q2', 'Q3', 'Q4'];
      }
      
      if (activeTab !== 'non_hazardous_generated') {
        // Handle waste type - check if it's an array and has values
        if (Array.isArray(wasteType) && wasteType.length > 0) {
          params.waste_type = wasteType;
        } else if (!Array.isArray(wasteType) && wasteType) {
          params.waste_type = wasteType;
        } else {
          params.waste_type = activeWasteType;
        }

        // Handle unit - check if it's an array and has values
        if (unit) {
          params.unit = unit;
        } else {
          params.unit = activeUnits;
        }

      } else {
        // Handle metrics type - check if it's an array and has values
        if (Array.isArray(metricsType) && metricsType.length > 0) {
          params.metrics = metricsType;
        } else if (!Array.isArray(metricsType) && metricsType) {
          params.metrics = metricsType;
        } else {
          params.metrics = activeMetrics;
        }
      }

      return params;
    } catch (error) {
      console.error('Error response:', error.response?.data);
    }
  };

  useEffect(() => {
  const fetchKeyMetrics = async () => {
    try {
      // Build parameters using the same logic as other charts
      const params = fetchParams();
      
      // Add the correct unit parameter based on active tab
      if (activeTab === 'non_hazardous_generated') {
        params.unit_of_measurement = unit;
      } else {
        params.unit = unit;
      }

      console.log('Fetching key metrics with params:', params);

      let path = ''
      if (activeTab === 'hazardous_generated') {
        path = 'hazard-waste-key-metrics';
      } else if (activeTab === 'hazardous_disposed') {
        path = 'hazard-waste-dis-key-metrics';
      } else {
        path = 'non-haz-waste-key-metrics';
      }

      const response = await api.get(`/environment_dash/${path}`, { 
        params,
        paramsSerializer: { indexes: null }
      });

      console.log(`${activeTab} key metrics response:`, response.data);
      
      setKeyMetrics(response.data);
      
    } catch (error) {
      console.error('Failed to fetch key metrics:', error);
      console.error('Error response:', error.response?.data);
      // Set default values on error
      setKeyMetrics([]);
    } finally {
      setLoading(false);
    }
  };

  // Update the condition to include activeMetrics for non-hazardous tab
  if (companies.length > 0 && activeYears.length > 0) {
    if (activeTab === 'non_hazardous_generated') {
      // For non-hazardous, also wait for activeMetrics
      if (activeMetrics.length > 0) {
        fetchKeyMetrics();
      }
    } else {
      // For hazardous tabs, wait for activeWasteType
      if (activeWasteType.length > 0) {
        fetchKeyMetrics();
      }
    }
  }
}, [activeTab, companyId, quarter, fromYear, toYear, wasteType, metricsType, unit, companies, activeYears, activeWasteType, activeMetrics, activeUnits]);

  useEffect(() => {
  const fetchHazGenTypePieChart = async () => {
    if (activeTab === 'non_hazardous_generated') return;

    try {
      // Build parameters (same logic as pie chart)
      const params = fetchParams();
      params.unit = unit; // always send the selected unit as a string
      
      console.log(`Sending params to ${activeTab} pie chart API:`, params);

      let path = '';
      if (activeTab === 'hazardous_generated'){ path = 'hazard-waste-type-bar-chart'
      } else {path = 'hazard-waste-dis-type-chart'}
      
      const response = await api.get(`/environment_dash/${path}`, { 
        params,
        paramsSerializer: { indexes: null }
      });

      console.log(`${activeTab} response:`, response.data);
      
      // CREATE COLOR MAPPING - This is the key fix
      const colorMapping = {};
      response.data.data.forEach(item => {
        if (item.waste_type && item.color) {
          colorMapping[item.waste_type] = item.color;
        }
      });
      
      // Store the color mapping for use by other charts
      setWasteTypeColors(colorMapping);
      
      // Transform the data for pie chart
      const transformedData = transformHazGenTypePieData(response.data.data);
      
      console.log("Transformed Pie Type Data", transformedData);

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
}, [activeTab, companyId, quarter, fromYear, toYear, wasteType, metricsType, unit, companies, activeYears, activeWasteType, activeUnits]);
  
  useEffect(() => {
    const fetchHazGenPieChart = async () => {
      try {
        // Build parameters (same logic as pie chart)
        const params = fetchParams();

        params.unit_of_measurement = unit; // always send the selected unit as a string

        let path = '';
        if (activeTab === 'hazardous_generated'){ path = 'hazard-waste-perc-pie-chart'
        } else if (activeTab === 'hazardous_disposed'){path = 'hazard-waste-dis-perc-pie-chart'
        } else {path = 'non-hazard-waste-perc-pie-chart' }

        const response = await api.get(`/environment_dash/${path}`, { 
          params,
          paramsSerializer: { indexes: null }
        });

        console.log(`${activeTab} response:`, response.data); // Preferred
        
        // Validate response data
        const responseData = response.data?.data || [];
        //console.log('Validated response data:', responseData);

        // Make sure data has the correct structure
        const validatedData = responseData.map(item => ({
          label: item.company_id || 'Unknown',
          value: activeTab === 'hazardous_generated' 
            ? (item.total_generate != null ? Number(item.total_generate) : 0)
            : activeTab === 'hazardous_disposed' 
            ? (item.total_disposed != null ? Number(item.total_disposed) : 0)
            : (item.total_waste != null ? Number(item.total_waste) : 0),
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
    if (companies.length > 0 && activeYears.length > 0 && activeWasteType.length > 0 && activeMetrics.length > 0) {
      fetchHazGenPieChart();
    }
  }, [activeTab, companyId, quarter, fromYear, toYear, wasteType, metricsType, unit, companies, activeYears, activeWasteType, activeMetrics, activeUnits]);


  useEffect(() => {
    const fetchHazGenLineChart = async () => {
      if (activeTab === 'non_hazardous_generated') return;

      try {
        // Build parameters (same logic as pie chart)
        const params = fetchParams();
        
        let path = '';
        if (activeTab === 'hazardous_generated'){ path = 'hazard-waste-generated-line-chart'
        } else {path = 'hazard-waste-dis-line-chart'}
        
        const response = await api.get(`/environment_dash/${path}`, { 
          params,
          paramsSerializer: { indexes: null }
        });

        console.log('Hazard Generated line chart response:', response.data);
        
        // Transform the data for Recharts
        const transformedData = transformLineChartData(response.data.data, response.data.colors);
        
        console.log('Transformed line chart data:', transformedData);
        
        setHazGenLineData(transformedData);
        setLineChartColors(wasteTypeColors);
        
      } catch (error) {
        console.error('Failed to fetch hazard generated line chart:', error);
        console.error('Error response:', error.response?.data);
        setHazGenLineData([]);
        setLineChartColors({});
      }
    };

    // Only fetch data if companies and available years have been loaded AND we have colors
    if (companies.length > 0 && activeYears.length > 0 && activeWasteType.length > 0 && Object.keys(wasteTypeColors).length > 0) {
      fetchHazGenLineChart();
    }
  }, [activeTab, companyId, quarter, fromYear, toYear, wasteType, unit, companies, activeYears, activeWasteType, activeUnits, wasteTypeColors]);

  useEffect(() => {
    const fetchHazGenBarChart = async () => {
      if (activeTab === 'non_hazardous_generated') return;

      try {
        //console.log('Fetching hazard generated bar chart...');
        
        // Build parameters (same logic as other charts)
        const params = fetchParams();
        
        let path = '';
        if (activeTab === 'hazardous_generated'){ path = 'hazard-waste-type-bar-chart'
        } else {path = 'hazard-waste-dis-type-chart'}
        
        const response = await api.get(`/environment_dash/${path}`, { 
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
        const barChartResult = transformBarChartDataWithColors(responseData);
        
        console.log('Final transformed data for bar chart:', barChartResult.chartData);
        
        // Validate that transformed data has the right structure
        const isValidData = barChartResult.chartData.every(item => {
          if (!item.hasOwnProperty('waste_type')) return false;
          if (activeTab === 'hazardous_generated') {
            return item.hasOwnProperty('total_generate') && typeof item.total_generate === 'number';
          } else if (activeTab === 'hazardous_disposed') {
            return item.hasOwnProperty('total_disposed') && typeof item.total_disposed === 'number';
          }
          return false;
        });
        
        if (!isValidData) {
          console.error('Transformed data is invalid:', barChartResult.chartData);
          setHazGenTypeBarData([]);
          return;
        }
        
        setHazGenTypeBarData(barChartResult.chartData);
        setBarChartColors(barChartResult.colors); // Store colors separately
        
      } catch (error) {
        console.error('Failed to fetch hazard generated bar chart:', error);
        console.error('Error response:', error.response?.data);
        setHazGenTypeBarData([]);
      }
    };

    // Only fetch data if companies and available years have been loaded
    if (companies.length > 0 && activeYears.length > 0 && activeWasteType.length > 0 && Object.keys(wasteTypeColors).length > 0) {
      fetchHazGenBarChart();
    }
  }, [activeTab, companyId, quarter, fromYear, toYear, wasteType, unit, companies, activeYears, activeWasteType, activeUnits, wasteTypeColors]);

  useEffect(() => {
    const fetchHazGenQuarterChart = async () => {
      if (activeTab !== 'hazardous_generated') return;

      try {
        //console.log('Fetching hazard generated bar chart...');
        
        // Build parameters (same logic as other charts)
        const params = fetchParams();
        
        console.log('Sending params to haz gen quarterly chart API:', params);
        
        const response = await api.get('/environment_dash/hazard-waste-quarter-bar-chart', { 
          params,
          paramsSerializer: { indexes: null }
        });

        console.log('Haz gen quarterly chart response:', response.data);
        
        // Transform the data for stacked bar chart
        const transformedData = transformQuarterBarChartData(response.data.data);
        
        setHazGenQrtrBarData(transformedData.chartData);
        
      } catch (error) {
        console.error('Failed to fetch haz gen quarterly chart:', error);
        console.error('Error response:', error.response?.data);
        setHazGenQrtrBarData([]);
      }
    };

    // Only fetch data if companies and available years have been loaded
    if (companies.length > 0 && activeYears.length > 0 && activeWasteType.length > 0 && Object.keys(wasteTypeColors).length > 0) {
      fetchHazGenQuarterChart();
    }
  }, [activeTab, companyId, quarter, fromYear, toYear, wasteType, unit, companies, activeYears, activeWasteType, activeUnits, wasteTypeColors]);

  useEffect(() => {
    const fetchHazDisYearChart = async () => {
      if (activeTab === 'non_hazardous_generated') return;

      try {
        //console.log('Fetching hazard generated bar chart...');
        
        // Build parameters (same logic as other charts)
        const params = fetchParams();
        
        console.log('Sending params to haz dis yearly chart API:', params);
        
        const response = await api.get('/environment_dash/hazard-waste-dis-perc-bar-chart', { 
          params,
          paramsSerializer: { indexes: null }
        });

        console.log('Haz dis year chart response:', response.data);
        
        // Transform the data for stacked bar chart
        const transformedData = transformYearBarChartData(response.data.data);
        
        setHazDisYearBarData(transformedData);
        
      } catch (error) {
        console.error('Failed to fetch haz gen quarterly chart:', error);
        console.error('Error response:', error.response?.data);
        setHazDisYearBarData({ chartData: [], companies: [], colors: {} });      }
    };

    // Only fetch data if companies and available years have been loaded
    if (companies.length > 0 && activeYears.length > 0 && activeWasteType.length > 0) {
      fetchHazDisYearChart();
    }
  }, [activeTab, companyId, quarter, fromYear, toYear, wasteType, unit, companies, activeYears, activeWasteType, activeUnits]);

  useEffect(() => {
    const fetchNonHazMetricsBarChart = async () => {
      if (activeTab !== 'non_hazardous_generated') return;

      try {
        const params = fetchParams();
        params.unit_of_measurement = unit;
        const response = await api.get('/environment_dash/non-hazard-waste-metrics-bar-chart', { 
          params,
          paramsSerializer: { indexes: null }
        });

        setNonHazMetricsBarData({
          chartData: response.data.data || [],
          companies: response.data.companies || [],
          metrics: response.data.metrics || [],
          metricsLegend: response.data.metrics_legend || [],
          units: response.data.units || [],
          grandTotal:  Number(response.data.grand_total) || 0
        });

      } catch (error) {
        setNonHazMetricsBarData({
          chartData: [],
          companies: [],
          metrics: [],
          metricsLegend: [],
          units: [],
          grandTotal: 0
        });
      } 
    };

    if (companies.length > 0 && activeYears.length > 0 && activeMetrics.length > 0) {
      fetchNonHazMetricsBarChart();
    }
  }, [activeTab, companyId, quarter, fromYear, toYear, metricsType, unit, companies, activeYears, activeMetrics, activeUnits]);

  useEffect(() => {
    const fetchNonHazMetricsLineChart = async () => {
      if (activeTab !== 'non_hazardous_generated') return;

      try {
        setLoading(true);
        
        // Build parameters using the same logic as other charts
        const params = fetchParams();
        params.unit_of_measurement = unit;
        console.log('Sending params to non-hazard waste metrics line chart API:', params);
        
        const response = await api.get('/environment_dash/non-hazard-waste-metrics-line-chart', { 
          params,
          paramsSerializer: { indexes: null }
        });

        console.log('Non-hazard waste metrics line chart response:', response.data);
        
        // Transform the data for Recharts
        const transformedChartData = transformNonHazLineChartData(
          response.data.data || [], 
          response.data.years || []
        );
        
        // Set the data from API response
        setNonHazMetricsLineData({
          chartData: response.data.data || [],
          transformedData: transformedChartData,
          companies: response.data.companies || [],
          metrics: response.data.metrics || [],
          years: response.data.years || [],
          units: response.data.units || [],
          legend: response.data.legend || [],
          yearSummary: response.data.year_summary || [],
          grandTotal: response.data.grand_total || 0
        });
        
      } catch (error) {
        console.error('Failed to fetch non-hazard waste metrics line chart:', error);
        console.error('Error response:', error.response?.data);
        setNonHazMetricsLineData({
          chartData: [],
          transformedData: [],
          companies: [],
          metrics: [],
          years: [],
          units: [],
          legend: [],
          yearSummary: [],
          grandTotal: 0
        });
      } finally {
        setLoading(false);
      }
    };

    // Only fetch data if required data is available
    if (companies.length > 0 && activeYears.length > 0 && activeMetrics.length > 0) {
      fetchNonHazMetricsLineChart();
    }
  }, [activeTab, companyId, quarter, fromYear, toYear, metricsType, unit, companies, activeYears, activeMetrics, activeUnits]);

  useEffect(() => {
    const fetchNonHazMetricsHeatmap = async () => {
      if (activeTab !== 'non_hazardous_generated') return;

      try {
        setLoading(true);
        
        // Build parameters using the same logic as other charts
        const params = fetchParams();
        params.unit_of_measurement = unit;
        console.log('Sending params to non-hazard waste metrics heatmap API:', params);
        
        const response = await api.get('/environment_dash/non-hazard-waste-metrics-heatmap', { 
          params,
          paramsSerializer: { indexes: null }
        });

        console.log('Non-hazard waste metrics heatmap response:', response.data);
        
        // Set the data from API response
        setNonHazMetricsHeatmapData({
          data: response.data.data || [],
          companies: response.data.companies || [],
          metrics: response.data.metrics || [],
          years: response.data.years || [],
          units: response.data.units || [],
          companyTotals: response.data.company_totals || [],
          yearTotals: response.data.year_totals || [],
          scale: response.data.scale || { min_waste: 0, max_waste: 0 },
          gridDimensions: response.data.grid_dimensions || { width: 0, height: 0 },
          grandTotal: response.data.grand_total || 0
          // Remove selectedMetric line
        });
        
      } catch (error) {
        console.error('Failed to fetch non-hazard waste metrics heatmap:', error);
        console.error('Error response:', error.response?.data);
        setNonHazMetricsHeatmapData({
          data: [],
          companies: [],
          metrics: [],
          years: [],
          units: [],
          companyTotals: [],
          yearTotals: [],
          scale: { min_waste: 0, max_waste: 0 },
          gridDimensions: { width: 0, height: 0 },
          grandTotal: 0
          // Remove selectedMetric: '' line
        });
      } finally {
        setLoading(false);
      }
    };

    // Only fetch data if required data is available
    if (companies.length > 0 && activeYears.length > 0 && activeMetrics.length > 0) {
      fetchNonHazMetricsHeatmap();
    }
  }, [activeTab, companyId, quarter, fromYear, toYear, metricsType, unit, companies, activeYears, activeMetrics, activeUnits]);

  useEffect(() => {
    const fetchNonHazQuarterBarChart = async () => {
      if (activeTab !== 'non_hazardous_generated') return;

      try {
        setLoading(true);
        
        // Build parameters using the same logic as other charts
        const params = fetchParams();
        params.unit_of_measurement = unit;
        
        console.log('Sending params to non-hazard waste quarter bar chart API:', params);
        
        const response = await api.get('/environment_dash/non-hazard-waste-quarter-bar-chart', { 
          params,
          paramsSerializer: { indexes: null }
        });

        console.log('Non-hazard waste quarter bar chart response:', response.data);
        
        // Set the data from API response
        setNonHazQuarterBarData({
          chartData: response.data.data || [],
          companies: response.data.companies || [],
          metrics: response.data.metrics || [],
          quarters: response.data.quarters || [],
          years: response.data.years || [],
          units: response.data.units || [],
          metricsLegend: response.data.metrics_legend || [],
          companySummary: response.data.company_summary || [],
          quarterSummary: response.data.quarter_summary || [],
          quarterYearLabels: response.data.quarter_year_labels || [],
          grandTotal: response.data.grand_total || 0
        });
        
      } catch (error) {
        console.error('Failed to fetch non-hazard waste quarter bar chart:', error);
        console.error('Error response:', error.response?.data);
        setNonHazQuarterBarData({
          chartData: [],
          companies: [],
          metrics: [],
          quarters: [],
          years: [],
          units: [],
          metricsLegend: [],
          companySummary: [],
          quarterSummary: [],
          quarterYearLabels: [],
          grandTotal: 0
        });
      } finally {
        setLoading(false);
      }
    };

    // Only fetch data if required data is available
    if (companies.length > 0 && activeYears.length > 0 && activeMetrics.length > 0) {
      fetchNonHazQuarterBarChart();
    }
  }, [activeTab, companyId, quarter, fromYear, toYear, metricsType, unit, companies, activeYears, activeMetrics, activeUnits]);


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

  const renderMetricsBarTooltip = ({ active, payload, label }) => {
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
              {entry.name}: {Number(entry.value).toLocaleString()} {entry.payload.unit_of_measurement || unit}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderNonHazLineTooltip = ({ active, payload, label }) => {
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
          maxHeight: '200px',
          overflowY: 'auto'
        }}
      >
        <div style={{ marginBottom: '5px', fontWeight: '600', color: '#1e293b' }}>
          Year: {label}
        </div>
        {payload
          .filter(entry => entry.value > 0) // Only show non-zero values
          .sort((a, b) => b.value - a.value) // Sort by value descending
          .map((entry, index) => {
            // Parse the line key to get company and metric
            const [company, ...metricParts] = entry.dataKey.split('_');
            const metric = metricParts.join('_');
            
            return (
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
                {company} - {metric}: {Number(entry.value).toLocaleString()} {unit}
              </div>
            );
          })}
      </div>
    );
  };

  const renderQuarterBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      // Calculate total for this quarter
      const total = payload.reduce((sum, entry) => sum + (entry.value || 0), 0);
      
      return (
        <div style={{
          backgroundColor: 'white',
          padding: '8px 12px',
          border: '1px solid #ccc',
          borderRadius: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          fontSize: '12px',
          maxWidth: '200px'
        }}>
          <p style={{ margin: '0 0 4px 0', fontWeight: 'bold' }}>{label}</p>
          {payload
            .filter(entry => entry.value > 0) // Only show non-zero values
            .sort((a, b) => b.value - a.value) // Sort by value descending
            .map((entry, index) => (
              <p key={index} style={{ margin: 0, color: entry.color }}>
                {entry.name}: {Number(entry.value).toLocaleString()} {unit}
              </p>
            ))}
        </div>
      );
    }
    return null;
  };

  const HeatmapChart = ({ data, companies, years, metrics, scale, unit }) => {
    const [hoveredCell, setHoveredCell] = useState(null);
    
    // Create a matrix structure: metrics as rows, years as columns
    const createHeatmapMatrix = () => {
      const matrix = [];
      
      metrics.forEach(metric => {
        const metricData = data.find(d => d.metrics === metric);
        if (!metricData) return;
        
        const row = {
          metric: metric,
          cells: []
        };
        
        years.forEach(year => {
          // Sum all companies for this metric-year combination
          const totalForYear = metricData.heatmap_cells
            .filter(cell => cell.year === year)
            .reduce((sum, cell) => sum + cell.total_waste, 0);
          
          // Calculate intensity based on the total across all metrics and years
          const intensity = scale.max_waste > 0 ? totalForYear / scale.max_waste : 0;
          
          row.cells.push({
            year: year,
            metric: metric,
            value: totalForYear,
            intensity: intensity
          });
        });
        
        matrix.push(row);
      });
      
      return matrix;
    };

    const matrix = createHeatmapMatrix();
    
    // Responsive cell sizing based on container
    const cellWidth = Math.min(45, Math.max(30, 280 / years.length));
    const cellHeight = Math.min(35, Math.max(25, 200 / metrics.length));
    const leftMargin = 90;
    const topMargin = 20; // Reduced since no top labels
    const bottomMargin = 25; // Space for bottom year labels
    const heatmapWidth = years.length * cellWidth + leftMargin + 10;
    const heatmapHeight = metrics.length * cellHeight + topMargin + bottomMargin;

    return (
      <div style={{ position: 'relative', minWidth: 0, minHeight: 0 }}>
        <svg width="100%" height="100%" viewBox={`0 0 ${heatmapWidth} ${heatmapHeight}`} style={{ fontFamily: 'inherit' }}>
          {/* Year labels (X-axis) - Bottom */}
          {years.map((year, xIndex) => (
            <text
              key={`year-${year}`}
              x={leftMargin + xIndex * cellWidth + cellWidth / 2}
              y={topMargin + metrics.length * cellHeight + 15}
              textAnchor="middle"
              fontSize="10"
              fill="#64748b"
              fontWeight="600"
            >
              {year}
            </text>
          ))}

          {/* Metric labels (Y-axis) */}
          {metrics.map((metric, yIndex) => (
            <text
              key={`metric-${metric}`}
              x={leftMargin - 8}
              y={topMargin + yIndex * cellHeight + cellHeight / 2}
              textAnchor="end"
              fontSize="9"
              fill="#64748b"
              fontWeight="600"
              dominantBaseline="middle"
            >
              {metric}
            </text>
          ))}

          {/* Heatmap cells */}
          {matrix.map((row, yIndex) => 
            row.cells.map((cell, xIndex) => {
              const x = leftMargin + xIndex * cellWidth;
              const y = topMargin + yIndex * cellHeight;
              const color = getHeatmapColor(cell.intensity);
              
              return (
                <g key={`cell-${yIndex}-${xIndex}`}>
                  <rect
                    x={x}
                    y={y}
                    width={cellWidth - 1}
                    height={cellHeight - 1}
                    fill={color}
                    stroke="#ffffff"
                    strokeWidth="1"
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => setHoveredCell({
                      ...cell,
                      x: x + cellWidth / 2,
                      y: y + cellHeight / 2
                    })}
                    onMouseLeave={() => setHoveredCell(null)}
                  />
                  {/* Value text inside cell (only if cell is large enough) */}
                  {cellWidth > 35 && cellHeight > 25 && (
                    <text
                      x={x + cellWidth / 2}
                      y={y + cellHeight / 2}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize="8"
                      fill={cell.intensity > 0.4 ? 'white' : '#1e293b'}
                      fontWeight="600"
                    >
                      {cell.value === 0 ? '0' : cell.value >= 1000 ? `${(cell.value/1000).toFixed(1)}K` : cell.value.toFixed(1)}
                    </text>
                  )}
                </g>
              );
            })
          )}
        </svg>

        {/* Tooltip */}
        {hoveredCell && (
          <div
            style={{
              position: 'absolute',
              left: Math.min(hoveredCell.x + 10, heatmapWidth - 150),
              top: hoveredCell.y - 10,
              backgroundColor: 'white',
              padding: '6px 10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              fontSize: '11px',
              zIndex: 1000,
              pointerEvents: 'none'
            }}
          >
            <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>
              {hoveredCell.metric} - {hoveredCell.year}
            </div>
            <div style={{ color: '#3B82F6' }}>
              {hoveredCell.value.toLocaleString()} {unit}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Modified clear filters function
  const clearAllFilters = () => {
    setCompanyId([]);
    setQuarter([]);
    setFromYear(activeYears[0]);
    setToYear(activeYears[activeYears.length - 1]);
    setWasteType([]);
    setMetrics([]);
    setUnit('Kilogram');
  };

  useEffect(() => {
    clearAllFilters();
  }, [activeTab])

  const wasteTypeShortNames = {
    "Electronic Waste": "Electronics",
    "Empty Containers": "Containers",
    "Oil Contaminated Materials": "Contaminated Oil",
    "Paints/Solvent Based": "Chemicals",
    // Add more mappings as needed
  };

  // Helper function to get current unit for display
  const getCurrentUnit = () => {
    if (Array.isArray(unit) && unit.length === 1) {
      return unit[0];
    } else if (Array.isArray(unit) && unit.length > 1) {
      return 'Mixed Units';
    } else if (!Array.isArray(unit)) {
      return unit || 'Kilogram';
    }
    return 'Kilogram';
  };

  // Prepare options for multi-select components
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

  const wasteTypeOptions = activeWasteType.map(type => ({
    value: type,
    label: type
  }));

  const metricsOptions = activeMetrics.map(metric => ({
    value: metric,
    label: metric
  }));

  const unitOptions = activeUnits.map(unitItem => ({
    value: unitItem,
    label: unitItem
  }));


// Helper function for year on year cumulative (keep original logic but handle arrays)
  const yearOnYearCumulative = () => {
    let value;
    switch (activeTab) {
      case 'hazardous_generated':
        value = keyMetrics?.combined?.total_generated;
        break;
      case 'hazardous_disposed':
        value = keyMetrics?.combined?.total_disposed;
        break;
      case 'non_hazardous_generated':
        value = keyMetrics?.combined?.total_waste;
        break;
      default:
        value = 0;
        break;
    }

    if (typeof value !== 'number' || isNaN(value)) return '--';
    const currentUnit = getCurrentUnit();
    if (currentUnit === 'Pieces' || currentUnit === 'Pcs') {
      return Math.ceil(value).toLocaleString();
    }
    return value.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  };

  const mostWasteType = () => {
    let value;

    if (!keyMetrics?.combined) return '--';

    switch (activeTab) {
      case 'hazardous_generated':
        value = keyMetrics.combined.most_generated_waste_type?.total_generated;
        break;
      case 'hazardous_disposed':
        value = keyMetrics.combined.most_generated_waste_type?.total_disposed;
        break;
      case 'non_hazardous_generated':
        value = keyMetrics.combined.most_generated_metrics?.total_waste;
        break;
      default:
        value = 0;
        break;
    }

    if (typeof value !== 'number' || isNaN(value)) return '--';
    const currentUnit = getCurrentUnit();
    if (currentUnit === 'Pieces' || currentUnit === 'Pcs') {
      return Math.ceil(value).toLocaleString();
    }
    return value.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  };

  // Transform nonHazMetricsBarData.chartData for unique companies and metrics as keys
  const metricsBarChartData = nonHazMetricsBarData.chartData.map(company => {
    const row = { company_id: company.company_id };
    (company.metrics_data || []).forEach(metric => {
      row[metric.metrics] = metric.total_waste;
    });
    return row;
  });

  useEffect(() => {
    console.log('Key metrics updated:', keyMetrics);
  }, [keyMetrics]);

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

        {/* Modified Filters Section with Multi-Select Components */}
        <div style={{ 
          display: 'flex', 
          gap: '10px',
          marginBottom: '15px',
          flexWrap: 'wrap',
          alignItems: 'center',
          flexShrink: 0
        }}>
          {/* Company Multi-Select */}
          <MultiSelectWithChips
            label="Companies"
            placeholder="All Companies"
            options={companyOptions}
            selectedValues={Array.isArray(companyId) ? companyId : (companyId ? [companyId] : [])}
            onChange={(values) => setCompanyId(values)}
          />

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
          
          {activeTab === 'non_hazardous_generated' ? (
            /* Metrics Multi-Select for non-hazardous */
            <MultiSelectWithChips
              label="Metrics"
              placeholder="All Metrics"
              options={metricsOptions}
              selectedValues={Array.isArray(metricsType) ? metricsType : (metricsType ? [metricsType] : [])}
              onChange={(values) => setMetrics(values)}
            />
          ) : (
            /* Waste Type Multi-Select for hazardous */
            <MultiSelectWithChips
              label="Waste Types"
              placeholder="All Waste Types"
              options={wasteTypeOptions}
              selectedValues={Array.isArray(wasteType) ? wasteType : (wasteType ? [wasteType] : [])}
              onChange={(values) => setWasteType(values)}
            />
          )}

          {activeTab !== 'hazardous_disposed' && (
            /* Quarter Multi-Select */
            <MultiSelectWithChips
              label="Quarters"
              placeholder="All Quarters"
              options={quarterOptions}
              selectedValues={Array.isArray(quarter) ? quarter : (quarter ? [quarter] : [])}
              onChange={(values) => setQuarter(values)}
            />
          )}

          {/* Year Range Filters (keep as single select) */}
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

            <span style={{ color: '#64748b', fontSize: '12px', fontWeight: '500' }}>to</span>

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
          {((Array.isArray(companyId) && companyId.length > 0) || 
            (Array.isArray(quarter) && quarter.length > 0) || 
            (fromYear !== activeYears[0]) || 
            (toYear !== activeYears[activeYears.length - 1]) || 
            (Array.isArray(wasteType) && wasteType.length > 0) || 
            (Array.isArray(metricsType) && metricsType.length > 0) || 
            (Array.isArray(unit) && (unit.length !== 1 || unit[0] !== 'Kilogram'))) && (
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
            <div style={{ fontSize: '30px', fontWeight: 'bold', marginBottom: '3px' }}>
              {yearOnYearCumulative() ?? '--'} {unit === 'Kilogram' ? 'Kg' : unit === 'Liter' ? 'L' : 'Pcs'}
            </div>
            <div style={{ fontSize: '10px', opacity: 0.9, marginBottom: '6px' }}>
              YEAR-ON-YEAR CUMULATIVE {activeTab === 'non_hazardous_generated' ? 'NON HAZARDOUS' : 'HAZARDOUS'} WASTE {activeTab === 'hazardous_disposed' ? 'DISPOSED' : 'GENERATED'}
            </div>
          </div>

          <div style={{
            backgroundColor: '#1e293b',
            color: 'white',
            padding: '15px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '10px', opacity: 0.9, marginBottom: '6px' }}>
              MOST {activeTab === 'hazardous_disposed' ? 'DISPOSED' : 'GENERATED'} {activeTab === 'non_hazardous_generated' ? 'METRIC' : 'WASTE TYPE'}
            </div>
            <div style={{ fontSize: '25px', fontWeight: 'bold', marginBottom: '3px' }}>
              {keyMetrics?.combined?.most_generated_waste_type?.waste_type 
              ? keyMetrics?.combined?.most_generated_waste_type?.waste_type 
              : keyMetrics?.combined?.most_disposed_waste_type?.waste_type 
              ? keyMetrics?.combined?.most_disposed_waste_type?.waste_type 
              : keyMetrics?.combined?.most_generated_metrics?.metrics}
            </div>
            <div style={{ fontSize: '9px', opacity: 0.8 }}>
              {keyMetrics?.combined?.most_generated_waste_type?.total_generated
                ? `TOTAL: ${mostWasteType()}`
                : `TOTAL: ${mostWasteType()}`} {unit === 'Kilogram' ? 'Kg' : unit === 'Liter' ? 'L' : 'Pcs'}
            </div>
          </div>

          <div style={{
            backgroundColor: '#10B981',
            color: 'white',
            padding: '15px',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '30px', fontWeight: 'bold', marginBottom: '3px' }}>
              {(typeof keyMetrics?.combined?.average_per_year === 'number' && !isNaN(keyMetrics.combined.average_per_year))
              ? (unit === 'Pieces' || unit === 'Pcs'
                  ? Math.ceil(keyMetrics.combined.average_per_year).toLocaleString()
                  : keyMetrics.combined.average_per_year.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
                ) : '--'} {unit === 'Kilogram' ? 'Kg' : unit === 'Liter' ? 'L' : 'Pcs'}
            </div>
            <div style={{ fontSize: '10px', opacity: 0.9, marginBottom: '6px' }}>
              AVERAGE ANNUAL {activeTab === 'non_hazardous_generated' ? 'NON HAZARDOUS' : 'HAZARDOUS'} WASTE {activeTab === 'hazardous_disposed' ? 'DISPOSED' : 'GENERATED'}
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
                  Distribution of Hazardous Waste Generated by Company ({unit})
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
                            {entry.label}: {(entry.value || 0).toLocaleString()} {unit === 'Kilogram' ? 'Kg' : unit === 'Liter' ? 'L' : 'Pcs'}
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
                          width: '100%',
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
                          width: '100%',
                          color: '#64748b',
                          fontSize: '14px',
                          textAlign: 'center',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '24px', marginBottom: '8px' }}>🥧</div>
                          <div>No data available</div>
                          <div style={{ fontSize: '12px', marginTop: '4px' }}>
                            Try adjusting your filters
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Pie Chart Container */}
                        <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={currentData.pieTypeData}
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
                                {currentData.pieTypeData.map((entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color || COLORS[index % COLORS.length]}
                                  />
                                ))}
                              </Pie>
                              <Tooltip 
                                content={({ active, payload }) => {
                                  if (!active || !payload || payload.length === 0) {
                                    return null;
                                  }

                                  try {
                                    const data = payload[0];
                                    if (!data || !data.payload) {
                                      return null;
                                    }

                                    const name = data.payload.name || 'Unknown';
                                    const value = data.payload.value || 0;
                                    const color = data.payload.color || '#3B82F6';
                                    
                                    // Calculate percentage
                                    const total = currentData.pieTypeData.reduce((sum, item) => sum + (item.value || 0), 0);
                                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';

                                    return (
                                      <div style={{
                                        backgroundColor: 'white',
                                        padding: '8px 12px',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                        fontSize: '12px',
                                        zIndex: 1000,
                                        pointerEvents: 'none'
                                      }}>
                                        <p style={{ margin: 0, fontWeight: 'bold' }}>{name}</p>
                                        <p style={{ margin: 0, color: color }}>
                                          {value.toLocaleString()} {unit === 'Kilogram' ? 'kg' : unit === 'Liter' ? 'L' : 'pcs'}
                                        </p>
                                        <p style={{ margin: 0, color: '#64748b' }}>
                                          {percentage}% of total
                                        </p>
                                      </div>
                                    );
                                  } catch (error) {
                                    console.error('Tooltip error:', error);
                                    return null;
                                  }
                                }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Legend on the right */}
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            minWidth: '160px',
                            maxWidth: '180px',
                            flexShrink: 0,
                            fontSize: '10px',
                          }}
                        >
                          {currentData.pieTypeData.map((entry, index) => {
                            const total = currentData.pieTypeData.reduce((sum, item) => sum + (item.value || 0), 0);
                            const percentage = total > 0 ? ((entry.value / total) * 100).toFixed(1) : '0';
                            
                            return (
                              <div
                                key={index}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  marginBottom: '4px',
                                  padding: '2px',
                                  cursor: 'pointer'
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
                                <span style={{ fontWeight: '500', fontSize: '9px', lineHeight: '1.2' }}>
                                  {entry.name}: {(entry.value || 0).toLocaleString()}{' '}
                                  {unit === 'Kilogram' ? 'kg' : unit === 'Liter' ? 'L' : 'pcs'} ({percentage}%)
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
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
                          <Tooltip 
                            formatter={(value) => `${Number(value).toLocaleString()} ${currentData.unit}`}
                            labelFormatter={(label) => wasteTypeShortNames[label] || label}
                          />
                          <Bar
                            dataKey={'total_generate'}
                            fill="#3B82F6"
                            label={{ position: 'top', fontSize: 10 }}
                          >
                            {currentData.barChartData.map((entry, index) => (
                              <Cell
                                key={`bar-cell-${index}`}
                                fill={barChartColors[entry.waste_type] || wasteTypeColors[entry.waste_type]}
                              />
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
                            <Tooltip content={renderLineChartTooltip}/>
                            <Legend
                              layout="vertical"
                              align="right"
                              verticalAlign="middle"
                              wrapperStyle={{
                                fontSize: '9px',
                                marginLeft: 24, // Add space between chart and legend
                                paddingLeft: 24 // Or use paddingLeft
                              }}
                            />
                            
                            {/* Dynamically render lines based on available companies */}
                            {activeWasteType.map((wasteType, index) => (
                              <Line
                                key={wasteType}
                                type="monotone"
                                dataKey={wasteType}
                                stroke={wasteTypeColors[wasteType] || COLORS[index % COLORS.length]} // Use stored colors
                                strokeWidth={2}
                                dot={{ fill: wasteTypeColors[wasteType] || COLORS[index % COLORS.length], strokeWidth: 2, r: 3 }}
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
                    ) : !currentData.barChartQrtrData || currentData.barChartQrtrData.length === 0 ? (
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
                          <Legend
                            layout="vertical"
                            align="right"
                            verticalAlign="middle"
                            wrapperStyle={{
                              fontSize: '9px',
                              marginLeft: 24, // Add space between chart and legend
                              paddingLeft: 24 // Or use paddingLeft
                            }}
                          />                          {/* Render bars for each waste type */}
                          {Object.keys(currentData.barChartQrtrData[0])
                            .filter(key => key !== 'quarter')
                            .map((wasteType, index) => (
                              <Bar
                                key={wasteType}
                                dataKey={wasteType}
                                stackId="a"
                                fill={wasteTypeColors[wasteType] || COLORS[index % COLORS.length]} // Use stored colors
                                name={wasteTypeShortNames[wasteType] || wasteType}
                                label={{ position: 'top', fontSize: 10 }}
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
                  Distribution of Hazardous Waste Disposed by Company ({unit})
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
                            {entry.label}: {(entry.value || 0).toLocaleString()} {unit === 'Kilogram' ? 'Kg' : unit === 'Liter' ? 'L' : 'Pcs'}
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
                          width: '100%',
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
                          width: '100%',
                          color: '#64748b',
                          fontSize: '14px',
                          textAlign: 'center',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '24px', marginBottom: '8px' }}>🥧</div>
                          <div>No data available</div>
                          <div style={{ fontSize: '12px', marginTop: '4px' }}>
                            Try adjusting your filters
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Pie Chart Container */}
                        <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={currentData.pieTypeData}
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
                                {currentData.pieTypeData.map((entry, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={entry.color || COLORS[index % COLORS.length]}
                                  />
                                ))}
                              </Pie>
                              <Tooltip 
                                content={({ active, payload }) => {
                                  if (!active || !payload || payload.length === 0) {
                                    return null;
                                  }

                                  try {
                                    const data = payload[0];
                                    if (!data || !data.payload) {
                                      return null;
                                    }

                                    const name = data.payload.name || 'Unknown';
                                    const value = data.payload.value || 0;
                                    const color = data.payload.color || '#3B82F6';
                                    
                                    // Calculate percentage
                                    const total = currentData.pieTypeData.reduce((sum, item) => sum + (item.value || 0), 0);
                                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';

                                    return (
                                      <div style={{
                                        backgroundColor: 'white',
                                        padding: '8px 12px',
                                        border: '1px solid #ccc',
                                        borderRadius: '4px',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                        fontSize: '12px',
                                        zIndex: 1000,
                                        pointerEvents: 'none'
                                      }}>
                                        <p style={{ margin: 0, fontWeight: 'bold' }}>{name}</p>
                                        <p style={{ margin: 0, color: color }}>
                                          {value.toLocaleString()} {unit === 'Kilogram' ? 'kg' : unit === 'Liter' ? 'L' : 'pcs'}
                                        </p>
                                        <p style={{ margin: 0, color: '#64748b' }}>
                                          {percentage}% of total
                                        </p>
                                      </div>
                                    );
                                  } catch (error) {
                                    console.error('Tooltip error:', error);
                                    return null;
                                  }
                                }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Legend on the right */}
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            minWidth: '160px',
                            maxWidth: '180px',
                            flexShrink: 0,
                            fontSize: '10px',
                          }}
                        >
                          {currentData.pieTypeData.map((entry, index) => {
                            const total = currentData.pieTypeData.reduce((sum, item) => sum + (item.value || 0), 0);
                            const percentage = total > 0 ? ((entry.value / total) * 100).toFixed(1) : '0';
                            
                            return (
                              <div
                                key={index}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '6px',
                                  marginBottom: '4px',
                                  padding: '2px',
                                  cursor: 'pointer'
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
                                <span style={{ fontWeight: '500', fontSize: '9px', lineHeight: '1.2' }}>
                                  {entry.name}: {(entry.value || 0).toLocaleString()}{' '}
                                  {unit === 'Kilogram' ? 'kg' : unit === 'Liter' ? 'L' : 'pcs'} ({percentage}%)
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </>
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
                    Hazardous Waste Disposed Yearly Comparison ({unit})
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
                    ) : currentData.barChartYearData.length === 0 ? (
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
                          <div>No yearly data available</div>
                          <div style={{ fontSize: '12px', marginTop: '4px' }}>
                            Try adjusting your filters
                          </div>
                        </div>
                      </div>
                    ) : (
                      <ResponsiveContainer 
                        width="100%" 
                        height="100%" 
                        key={`yearly-chart-${unit}-${activeTab}`}
                      >
                        <BarChart 
                          data={currentData.barChartYearData.map(item => {
                            // Clean the data to prevent floating point issues
                            const cleanedItem = { ...item };
                            Object.keys(cleanedItem).forEach(key => {
                              if (key !== 'year' && typeof cleanedItem[key] === 'number') {
                                // Round to 2 decimal places and convert back to number
                                cleanedItem[key] = Math.round(cleanedItem[key] * 100) / 100;
                              }
                            });
                            return cleanedItem;
                          })}
                        >
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
                            tickFormatter={(value) => {
                              const numValue = Number(value);
                              if (!isFinite(numValue) || isNaN(numValue) || numValue === 0) return '0';
                              
                              if (numValue >= 1000000) {
                                return `${(numValue / 1000000).toFixed(1)}M`;
                              } else if (numValue >= 1000) {
                                return `${(numValue / 1000).toFixed(1)}K`;
                              } else if (numValue >= 1) {
                                return numValue.toFixed(0);
                              } else {
                                return numValue.toFixed(2);
                              }
                            }}
                          />
                          <Tooltip 
                            content={({ active, payload, label }) => {
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
                                    {payload.map((entry, index) => {
                                      const value = Number(entry.value);
                                      const cleanValue = Math.round(value * 100) / 100;
                                      return (
                                        <p key={index} style={{ margin: 0, color: entry.color }}>
                                          {entry.dataKey}: {cleanValue.toLocaleString(undefined, {
                                            minimumFractionDigits: 0,
                                            maximumFractionDigits: 2
                                          })} {unit}
                                        </p>
                                      );
                                    })}
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ fontSize: '10px' }} />
                          {/* Only show companies that exist in the current data */}
                          {currentData.barChartYearData.length > 0 &&
                            Object.keys(currentData.barChartYearData[0])
                              .filter(key => key !== 'year')
                              .map((companyName, index) => (
                                <Bar
                                  key={companyName}
                                  dataKey={companyName}
                                  stackId="a"
                                  fill={currentData.colors && currentData.colors[companyName] ? currentData.colors[companyName] : COLORS[index % COLORS.length]}
                                  name={companyName}
                                />
                              ))}
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
                    Hazardous Waste Disposed in Year ({unit})
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
                            <Tooltip content={renderLineChartTooltip}/>
                            <Legend
                              layout="vertical"
                              align="right"
                              verticalAlign="middle"
                              wrapperStyle={{
                                fontSize: '9px',
                                marginLeft: 24, // Add space between chart and legend
                                paddingLeft: 24 // Or use paddingLeft
                              }}
                            />
                            
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
                    Total Hazard Waste Disposed by Waste Type ({unit})
                  </h3>
                  <div style={{ flex: 1, minHeight: 0}}>
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
                    ) : currentData.barChartData.length === 0 ? (
                      <div>No data available</div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={[...currentData.barChartData].sort((a, b) => {
                            const field = activeTab === 'hazardous_generated' ? 'total_generate' : 'total_disposed';
                            return b[field] - a[field];
                          })}
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
                          <Tooltip
                            formatter={(value) => `${Number(value).toLocaleString()} ${currentData.unit}`}
                            labelFormatter={(label) => wasteTypeShortNames[label] || label}
                          />
                          <Bar
                            dataKey={activeTab === 'hazardous_generated' ? 'total_generate' : 'total_disposed'}
                            fill="#3B82F6"
                            label={{ position: 'top', fontSize: 10 }}
                          >
                            {currentData.barChartData.map((entry, index) => (
                              <Cell 
                                key={`cell-${index}`} 
                                fill={wasteTypeColors[entry.waste_type] || entry.color || COLORS[index % COLORS.length]} 
                              />
                            ))} 
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'non_hazardous_generated' && (
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
                  Distribution of Non Hazardous Waste Generated by Company ({unit})
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
                            {entry.label}: {(entry.value || 0).toLocaleString()} {unit === 'Kilogram' ? 'Kg' : unit === 'Liter' ? 'L' : 'Pcs'}
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
                minHeight: 0
              }}>
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
                    color: '#1e293b',
                    margin: '0 0 10px 0',
                    flexShrink: 0
                  }}>
                    Non-Hazardous Waste by Year and Metric ({unit})
                  </h3>
                  
                  <div style={{ flex: 1, minHeight: 0 }}>
                    {loading ? (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '250px',
                        color: '#64748b',
                        fontSize: '14px'
                      }}>
                        Loading heatmap data...
                      </div>
                    ) : nonHazMetricsHeatmapData.data.length === 0 ? (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '250px',
                        color: '#64748b',
                        fontSize: '14px',
                        textAlign: 'center'
                      }}>
                        <div>
                          <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔥</div>
                          <div>No heatmap data available</div>
                          <div style={{ fontSize: '12px', marginTop: '4px' }}>
                            Try adjusting your filters
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '20px' }}>
                        {/* Main Heatmap */}
                        <div style={{ flex: 1 }}>
                          <HeatmapChart
                            data={nonHazMetricsHeatmapData.data}
                            companies={nonHazMetricsHeatmapData.companies}
                            years={nonHazMetricsHeatmapData.years}
                            metrics={nonHazMetricsHeatmapData.metrics}
                            scale={nonHazMetricsHeatmapData.scale}
                            unit={unit}
                          />
                        </div>
                        
                        {/* Color Scale Legend (Vertical on Right) */}
                        <div style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          minWidth: '60px'
                        }}>
                          {/* Max value label */}
                          <div style={{ fontSize: '10px', marginBottom: '4px', fontWeight: '600' }}>
                            {nonHazMetricsHeatmapData.scale.max_waste.toLocaleString()} {unit === 'Kilogram' ? 'Kg' : unit === 'Liter' ? 'L' : 'Pcs'}
                          </div>
                          {/* Color scale */}
                          <div style={{
                            display: 'flex',
                            flexDirection: 'column',
                            border: '1px solid #e2e8f0',
                            borderRadius: '2px',
                            overflow: 'hidden'
                          }}>
                            {[1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0].map((intensity, idx) => (
                              <div
                                key={intensity}
                                style={{
                                  width: '20px',
                                  height: '15px',
                                  backgroundColor: getHeatmapColor(intensity)
                                }}
                              />
                            ))}
                          </div>
                          {/* Min value label */}
                          <div style={{ fontSize: '10px', marginTop: '4px', fontWeight: '600' }}>
                            0
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* New Metrics Bar Chart */}
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
                    Total Non-Hazardous Waste by Company per Metrics ({unit})
                  </h3>
                  
                  <div style={{ flex: 1, minHeight: 0 }}>
                    {loading ? (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '250px',
                        color: '#64748b',
                        fontSize: '14px'
                      }}>
                        Loading chart data...
                      </div>
                    ) : nonHazMetricsBarData.chartData.length === 0 ? (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '250px',
                        color: '#64748b',
                        fontSize: '14px',
                        textAlign: 'center'
                      }}>
                        <div>
                          <div style={{ fontSize: '24px', marginBottom: '8px' }}>📊</div>
                          <div>No metrics data available</div>
                          <div style={{ fontSize: '12px', marginTop: '4px' }}>
                            Try adjusting your filters
                          </div>
                        </div>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={metricsBarChartData}
                          margin={{ top: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis 
                            dataKey="company_id"
                            tick={{ fontSize: 10, fill: '#64748b' }}
                          />
                          <YAxis 
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
                          <Tooltip content={renderMetricsBarTooltip} />
                          {/* Dynamically render bars for each metric */}
                          {nonHazMetricsBarData.metricsLegend.map((metric, index) => (
                            <Bar
                              key={metric.metrics}
                              dataKey={metric.metrics}
                              stackId="a"
                              fill={metric.color}
                              name={metric.metrics}
                            />
                          ))}
                          <Legend
                            layout="vertical"
                            align="right"
                            verticalAlign="middle"
                            wrapperStyle={{
                              fontSize: '9px',
                              marginLeft: 24, // Add space between chart and legend
                              paddingLeft: 24 // Or use paddingLeft
                            }}
                          />
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
                    Total Non-Hazardous Waste by Metrics Over Time ({unit})
                  </h3>
                  
                  <div style={{ flex: 1, minHeight: 0 }}>
                    {loading ? (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '250px',
                        color: '#64748b',
                        fontSize: '14px'
                      }}>
                        Loading chart data...
                      </div>
                    ) : nonHazMetricsLineData.transformedData.length === 0 ? (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '250px',
                        color: '#64748b',
                        fontSize: '14px',
                        textAlign: 'center'
                      }}>
                        <div>
                          <div style={{ fontSize: '24px', marginBottom: '8px' }}>📈</div>
                          <div>No metrics timeline data available</div>
                          <div style={{ fontSize: '12px', marginTop: '4px' }}>
                            Try adjusting your filters
                          </div>
                        </div>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={nonHazMetricsLineData.transformedData}>
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
                          <Tooltip content={renderNonHazLineTooltip} />
                          <Legend
                            layout="vertical"
                            align="right"
                            verticalAlign="middle"
                            wrapperStyle={{
                              fontSize: '9px',
                              marginLeft: 24, // Add space between chart and legend
                              paddingLeft: 24 // Or use paddingLeft
                            }}
                          />
                          
                          {/* Dynamically render lines for each company-metric combination */}
                          {nonHazMetricsLineData.legend.map((legendItem, index) => {
                            const lineKey = `${legendItem.company_id}_${legendItem.metrics}`;
                            return (
                              <Line
                                key={lineKey}
                                type="monotone"
                                dataKey={lineKey}
                                stroke={legendItem.color}
                                strokeWidth={2}
                                dot={{ fill: legendItem.color, strokeWidth: 2, r: 3 }}
                                name={`${legendItem.metrics}`}
                                connectNulls={false}
                              />
                            );
                          })}
                        </LineChart>
                      </ResponsiveContainer>
                    )}
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
                    Non-Hazardous Waste by Quarter ({unit})
                  </h3>
                  
                  <div style={{ flex: 1, minHeight: 0 }}>
                    {loading ? (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '250px',
                        color: '#64748b',
                        fontSize: '14px'
                      }}>
                        Loading chart data...
                      </div>
                    ) : nonHazQuarterBarData.chartData.length === 0 ? (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '250px',
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
                        <BarChart
                          data={transformNonHazQuarterChartData(nonHazQuarterBarData.chartData, nonHazQuarterBarData.metricsLegend)}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis 
                            dataKey="quarter"
                            tick={{ fontSize: 11, fill: '#64748b' }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <YAxis 
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
                          <Tooltip content={renderQuarterBarTooltip} />
                          <Legend
                            layout="vertical"
                            align="right"
                            verticalAlign="middle"
                            wrapperStyle={{
                              fontSize: '9px',
                              marginLeft: 24, // Add space between chart and legend
                              paddingLeft: 24 // Or use paddingLeft
                            }}
                          />
                          
                          {/* Render stacked bars for each metric */}
                          {nonHazQuarterBarData.metricsLegend.map((metric, index) => (
                            <Bar
                              key={metric.metrics}
                              dataKey={metric.metrics}
                              stackId="quarter"
                              fill={metric.color}
                              name={metric.metrics}
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
        </div>
      </div>
    </div>
  );
}

export default EnvironmentWasteDash;