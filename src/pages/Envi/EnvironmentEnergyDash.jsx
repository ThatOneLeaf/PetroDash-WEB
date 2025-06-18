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

const COLORS = ['#3B82F6', '#F97316', '#10B981', '#EF4444', '#8B5CF6', '#F59E0B'];

function EnvironmentEnergyDash() {
  const [activeTab, setActiveTab] = useState('electricity'); // 'electricity' or 'diesel'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date()); // Add state for last updated time

  // Filters
  const [selectedCompanyIds, setSelectedCompanyIds] = useState([]);
  const [selectedQuarters, setSelectedQuarters] = useState([]);
  const [fromYear, setFromYear] = useState('');
  const [toYear, setToYear] = useState('');
  const [selectedConsumptionSources, setSelectedConsumptionSources] = useState([]);
  
  // Diesel-specific filters
  const [selectedCompanyPropertyNames, setSelectedCompanyPropertyNames] = useState([]);
  const [selectedCompanyPropertyTypes, setSelectedCompanyPropertyTypes] = useState([]);
  const [selectedMonths, setSelectedMonths] = useState([]);

  // State for API data
  const [companies, setCompanies] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  const [consumptionSources, setConsumptionSources] = useState([]);
  
  // Diesel-specific API data
  const [companyProperties, setCompanyProperties] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [dieselYears, setDieselYears] = useState([]);

  // Chart data from APIs (Electricity)
  const [electricityPieData, setElectricityPieData] = useState([]);
  const [electricityLineData, setElectricityLineData] = useState([]);
  const [lineChartColors, setLineChartColors] = useState({});
  const [electricityBarData, setElectricityBarData] = useState([]);
  const [hoveredBar, setHoveredBar] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [electricitySourceData, setElectricitySourceData] = useState([]);
  const [sourceColors, setSourceColors] = useState({});
  const [electricityQuarterData, setElectricityQuarterData] = useState([]);
  const [quarterCompanyColors, setQuarterCompanyColors] = useState({});

  // Chart data from APIs (Diesel)
  const [dieselPieData, setDieselPieData] = useState([]);
  const [dieselPropertyPieData, setDieselPropertyPieData] = useState([]);
  const [dieselLineData, setDieselLineData] = useState([]);
  const [dieselLineColors, setDieselLineColors] = useState({});
  const [dieselPropertyTypeData, setDieselPropertyTypeData] = useState([]);
  const [hoveredPropertyTypeBar, setHoveredPropertyTypeBar] = useState(null);
  const [dieselMonthlyLineData, setDieselMonthlyLineData] = useState([]);
  const [dieselMonthlyLineColors, setDieselMonthlyLineColors] = useState({});
  const [dieselQuarterlyBarData, setDieselQuarterlyBarData] = useState([]);
  const [dieselQuarterlyBarColors, setDieselQuarterlyBarColors] = useState({});

  // Static key metrics - fetched once on mount and don't change with filters
  const [electricityMetrics, setElectricityMetrics] = useState({
    total_consumption: 0,
    unit_of_measurement: 'kWh',
    peak_year: null,
    peak_consumption: 0,
    average_consumption: 0
  });

  const [dieselMetrics, setDieselMetrics] = useState({
    total_diesel_consumption: 0,
    unit_of_measurement: 'Liters',
    average_annual_consumption: 0,
    yearly_deviation: []
  });

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

  const consumptionSourceOptions = consumptionSources.map(source => ({
    value: source,
    label: source
  }));

  const companyPropertyOptions = companyProperties.map(property => ({
    value: property,
    label: property
  }));

  const propertyTypeOptions = propertyTypes.map(type => ({
    value: type,
    label: type
  }));

  const monthOptions = [
    { value: 'January', label: 'January' },
    { value: 'February', label: 'February' },
    { value: 'March', label: 'March' },
    { value: 'April', label: 'April' },
    { value: 'May', label: 'May' },
    { value: 'June', label: 'June' },
    { value: 'July', label: 'July' },
    { value: 'August', label: 'August' },
    { value: 'September', label: 'September' },
    { value: 'October', label: 'October' },
    { value: 'November', label: 'November' },
    { value: 'December', label: 'December' }
  ];

  // Mock chart data (to be replaced with API calls later)
  const electricityChartData = {
    lineChartData: [
      { year: 2018, PSC: 75000, PWEI: 120000 },
      { year: 2019, PSC: 150000, PWEI: 125000 },
      { year: 2020, PSC: 160000, PWEI: 115000 },
      { year: 2021, PSC: 170000, PWEI: 130000 },
      { year: 2022, PSC: 180000, PWEI: 140000 },
      { year: 2023, PSC: 250000, PWEI: 145000 },
      { year: 2024, PSC: 950000, PWEI: 150000 },
      { year: 2025, PSC: 150000, PWEI: 80000 }
    ],
    barChartData: [
      { company: 'PSC', consumption: 1400000, color: '#3B82F6' },
      { company: 'PWEI', consumption: 950000, color: '#F97316' }
    ],
    companySourceData: [
      { company: 'PSC', 'Control Building': 1455393, 'Logistics Station': 0 },
      { company: 'PWEI', 'Control Building': 937604, 'Logistics Station': 305413 }
    ],
    stackedBarData: [
      { quarter: 'Q1', PSC: 150000, PWEI: 65000 },
      { quarter: 'Q2', PSC: 165000, PWEI: 70000 },
      { quarter: 'Q3', PSC: 185000, PWEI: 60000 },
      { quarter: 'Q4', PSC: 155000, PWEI: 68000 }
    ]
  };

  // Diesel mock chart data (to be replaced with API calls later)
  const dieselChartData = {
    pieData: [
      { label: 'PSC', value: 15200, color: '#10B981' },
      { label: 'PMC', value: 6250, color: '#F97316' }
    ],
    lineChartData: [
      { year: 2018, psc: 1200, pmc: 800 },
      { year: 2019, psc: 1350, pmc: 750 },
      { year: 2020, psc: 1100, pmc: 900 },
      { year: 2021, psc: 1400, pmc: 850 },
      { year: 2022, psc: 1500, pmc: 950 },
      { year: 2023, psc: 1450, pmc: 900 },
      { year: 2024, psc: 1600, pmc: 1000 }
    ],
    stackedBarData: [
      { quarter: 'Q1', psc: 400, pmc: 250 },
      { quarter: 'Q2', psc: 420, pmc: 280 },
      { quarter: 'Q3', psc: 450, pmc: 300 },
      { quarter: 'Q4', psc: 380, pmc: 270 }
    ]
  };

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
    if (activeTab === 'electricity') {
      return {
        pieData: electricityPieData,
        lineChartData: electricityLineData,
        barChartData: electricityBarData,
        companySourceData: electricitySourceData,
        stackedBarData: electricityQuarterData,
        unit: electricityMetrics.unit_of_measurement || 'kWh' // CHANGED: removed "static"
      };
    } else {
      return {
        pieData: dieselPieData, // Company distribution pie chart
        propertyPieData: dieselPropertyPieData, // Property distribution pie chart
        propertyTypeData: dieselPropertyTypeData, // Property type horizontal bar chart
        lineChartData: dieselLineData, // Use API data for diesel line chart
        monthlyLineData: dieselMonthlyLineData, // Monthly line chart data
        quarterlyBarData: dieselQuarterlyBarData, // Quarterly stacked bar chart data
        stackedBarData: dieselChartData.stackedBarData,
        unit: dieselMetrics.unit_of_measurement || 'Liters' // CHANGED: removed "static"
      };
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const currentData = getCurrentData();

  const transformLineChartData = (apiData, colors) => {
    if (!apiData || Object.keys(apiData).length === 0) {
      return [];
    }

    // Get all unique years from all companies
    const allYears = new Set();
    Object.values(apiData).forEach(companyData => {
      companyData.forEach(item => allYears.add(item.year));
    });

    // Sort years
    const sortedYears = Array.from(allYears).sort();

    // Transform data for Recharts
    const transformedData = sortedYears.map(year => {
      const yearData = { year };
      
      // For each company, find the consumption for this year
      Object.keys(apiData).forEach(companyId => {
        const companyYearData = apiData[companyId].find(item => item.year === year);
        yearData[companyId] = companyYearData ? companyYearData.total_consumption : 0;
      });
      
      return yearData;
    });

    return transformedData;
  };

  const transformBarChartData = (apiData) => {
    if (!apiData || apiData.length === 0) {
      return [];
    }

    console.log('Raw API data for bar chart:', apiData);

    // Transform API response to match the format expected by the bar chart
    const transformed = apiData.map(item => ({
      company: item.label || 'Unknown',
      consumption: Number(item.value) || 0,
      color: item.color || '#3B82F6'
    }));

    console.log('Transformed bar chart data:', transformed);
    
    return transformed;
  };

  const transformSourceBarChartData = (apiData) => {
    if (!apiData || apiData.length === 0) {
      return { chartData: [], sources: [], colors: {} };
    }

    console.log('Raw API data for source chart:', apiData);

    // Group data by company
    const groupedByCompany = {};
    const allSources = new Set();
    const sourceColorMap = {};

    apiData.forEach(item => {
      const company = item.company_id;
      const source = item.source;
      const value = item.value;
      
      // Collect all sources and their colors
      allSources.add(source);
      sourceColorMap[source] = item.color;
      
      // Group by company
      if (!groupedByCompany[company]) {
        groupedByCompany[company] = { company };
      }
      
      groupedByCompany[company][source] = value;
    });

    // Convert to array format for Recharts
    const chartData = Object.values(groupedByCompany);
    
    // Ensure all companies have all sources (fill missing with 0)
    const sources = Array.from(allSources);
    chartData.forEach(companyData => {
      sources.forEach(source => {
        if (!companyData[source]) {
          companyData[source] = 0;
        }
      });
    });

    console.log('Transformed source chart data:', chartData);
    console.log('Available sources:', sources);
    console.log('Source colors:', sourceColorMap);

    return {
      chartData,
      sources,
      colors: sourceColorMap
    };
  };

  const transformQuarterBarChartData = (apiData) => {
    if (!apiData || apiData.length === 0) {
      return { chartData: [], companies: [], colors: {} };
    }

    console.log('Raw API data for quarterly chart:', apiData);

    // Group data by quarter
    const groupedByQuarter = {};
    const allCompanies = new Set();
    const companyColorMap = {};

    apiData.forEach(item => {
      const quarter = item.quarter;
      const company = item.company_id;
      const value = item.value;
      
      // Collect all companies and their colors
      allCompanies.add(company);
      companyColorMap[company] = item.color;
      
      // Group by quarter
      if (!groupedByQuarter[quarter]) {
        groupedByQuarter[quarter] = { quarter };
      }
      
      groupedByQuarter[quarter][company] = value;
    });

    // Convert to array format for Recharts with proper quarter order
    const quarterOrder = ['Q1', 'Q2', 'Q3', 'Q4'];
    const chartData = quarterOrder.map(quarter => {
      if (groupedByQuarter[quarter]) {
        return groupedByQuarter[quarter];
      } else {
        // Create empty quarter data if no data exists
        const emptyQuarter = { quarter };
        Array.from(allCompanies).forEach(company => {
          emptyQuarter[company] = 0;
        });
        return emptyQuarter;
      }
    });

    // Ensure all quarters have all companies (fill missing with 0)
    const companies = Array.from(allCompanies);
    chartData.forEach(quarterData => {
      companies.forEach(company => {
        if (!quarterData[company]) {
          quarterData[company] = 0;
        }
      });
    });

    console.log('Transformed quarterly chart data:', chartData);
    console.log('Available companies:', companies);
    console.log('Company colors:', companyColorMap);

    return {
      chartData,
      companies,
      colors: companyColorMap
    };
  };

  const transformDieselPieData = (apiData) => {
    if (!apiData || apiData.length === 0) {
      return [];
    }

    console.log('Raw diesel pie API data:', apiData);

    // Transform API response to match pie chart format
    const transformedData = apiData.map(item => ({
      label: item.company_id || 'Unknown',
      value: Number(item.value) || 0,
      percentage: Number(item.percentage) || 0,
      color: item.color || '#3B82F6'
    }));

    console.log('Transformed diesel pie data:', transformedData);
    
    return transformedData;
  };

  const transformDieselPropertyPieData = (apiData) => {
    if (!apiData || apiData.length === 0) {
      return [];
    }

    console.log('Raw diesel property pie API data:', apiData);

    // Transform API response to match pie chart format
    // Note: The API already includes formatted labels with value and percentage
    const transformedData = apiData.map(item => ({
      label: item.label || 'Unknown', // This already includes the formatted text
      value: Number(item.value) || 0,
      percentage: Number(item.percentage) || 0,
      color: item.color || '#3B82F6'
    }));

    console.log('Transformed diesel property pie data:', transformedData);
    
    return transformedData;
  };

  const transformDieselLineChartData = (apiData) => {
    if (!apiData || apiData.length === 0) {
      return { chartData: [], properties: [], colors: {} };
    }

    console.log('Raw diesel line API data:', apiData);

    // Get all unique years from all properties
    const allYears = new Set();
    apiData.forEach(propertyData => {
      propertyData.data.forEach(item => allYears.add(item.year));
    });

    // Sort years
    const sortedYears = Array.from(allYears).sort();

    // Transform data for Recharts (group by year, properties as columns)
    const transformedData = sortedYears.map(year => {
      const yearData = { year };
      
      // For each property, find the consumption for this year
      apiData.forEach(propertyData => {
        const propertyName = propertyData.property_name;
        const yearConsumption = propertyData.data.find(item => item.year === year);
        yearData[propertyName] = yearConsumption ? yearConsumption.total_consumption : 0;
      });
      
      return yearData;
    });

    // USE COLORS FROM API RESPONSE (not generate new ones)
    const properties = apiData.map(item => item.property_name);
    const colorMap = {};
    apiData.forEach(propertyData => {
      colorMap[propertyData.property_name] = propertyData.color;
    });

    console.log('Transformed diesel line data:', transformedData);
    console.log('Properties:', properties);
    console.log('Colors from API:', colorMap);

    return {
      chartData: transformedData,
      properties,
      colors: colorMap
    };
  };

  const transformDieselPropertyTypeData = (apiData) => {
    if (!apiData || apiData.length === 0) {
      return [];
    }

    console.log('Raw diesel property type API data:', apiData);

    // Transform API response to match horizontal bar chart format
    const transformedData = apiData.map(item => ({
      label: item.label || 'Unknown',
      value: Number(item.value) || 0,
      color: item.color || '#3B82F6'
    }));

    console.log('Transformed diesel property type data:', transformedData);
    
    return transformedData;
  };

  const transformDieselMonthlyLineData = (apiData, colorMap) => {
    if (!apiData || Object.keys(apiData).length === 0) {
      return { chartData: [], properties: [], colors: {} };
    }

    console.log('Raw diesel monthly line API data:', apiData);
    console.log('Color map:', colorMap);

    // Month order for proper sorting
    const monthOrder = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Combine all months across all years
    const combinedMonthData = {};
    
    // Initialize combined data structure
    monthOrder.forEach(month => {
      combinedMonthData[month] = { month };
    });

    // Get all properties from the API data
    const allProperties = new Set();
    Object.values(apiData).forEach(yearData => {
      Object.keys(yearData).forEach(property => {
        allProperties.add(property);
      });
    });

    // Initialize properties with 0 values for each month
    Array.from(allProperties).forEach(property => {
      monthOrder.forEach(month => {
        combinedMonthData[month][property] = 0;
      });
    });

    // Sum up consumption across all years for each month and property
    Object.keys(apiData).forEach(year => {
      const yearData = apiData[year];
      
      Object.keys(yearData).forEach(property => {
        const propertyData = yearData[property];
        
        Object.keys(propertyData).forEach(month => {
          const consumption = propertyData[month] || 0;
          if (combinedMonthData[month]) {
            combinedMonthData[month][property] += consumption;
          }
        });
      });
    });

    // Convert to array format for Recharts
    const transformedData = monthOrder.map(month => combinedMonthData[month]);

    const properties = Array.from(allProperties);

    console.log('Transformed diesel monthly line data (combined):', transformedData);
    console.log('Properties:', properties);

    return {
      chartData: transformedData,
      properties,
      colors: colorMap || {}
    };
  };

  const transformDieselQuarterlyBarData = (apiData, colorMap) => {
    if (!apiData || apiData.length === 0) {
      return { chartData: [], properties: [], colors: {} };
    }

    console.log('Raw diesel quarterly bar API data:', apiData);
    console.log('Color map:', colorMap);

    // Group data by quarter
    const groupedByQuarter = {};
    const allProperties = new Set();

    apiData.forEach(item => {
      const quarter = item.quarter;
      const property = item.property_name;
      const value = item.total_consumption;
      
      // Collect all properties
      allProperties.add(property);
      
      // Group by quarter
      if (!groupedByQuarter[quarter]) {
        groupedByQuarter[quarter] = { quarter };
      }
      
      groupedByQuarter[quarter][property] = value;
    });

    // Convert to array format for Recharts with proper quarter order
    const quarterOrder = ['Q1', 'Q2', 'Q3', 'Q4'];
    const chartData = quarterOrder.map(quarter => {
      if (groupedByQuarter[quarter]) {
        return groupedByQuarter[quarter];
      } else {
        // Create empty quarter data if no data exists
        const emptyQuarter = { quarter };
        Array.from(allProperties).forEach(property => {
          emptyQuarter[property] = 0;
        });
        return emptyQuarter;
      }
    });

    // Ensure all quarters have all properties (fill missing with 0)
    const properties = Array.from(allProperties);
    chartData.forEach(quarterData => {
      properties.forEach(property => {
        if (!quarterData[property]) {
          quarterData[property] = 0;
        }
      });
    });

    console.log('Transformed diesel quarterly bar data:', chartData);
    console.log('Properties:', properties);

    return {
      chartData,
      properties,
      colors: colorMap || {}
    };
  };

  useEffect(() => {
    const fetchElectricityKeyMetrics = async () => {
      if (activeTab !== 'electricity') return;
      if (companies.length === 0 || availableYears.length === 0 || consumptionSources.length === 0) return;

      try {
        setLoading(true);
        
        // Build parameters using URLSearchParams (same as other API calls)
        const params = new URLSearchParams();

        // Company filter
        if (selectedCompanyIds.length > 0) {
          selectedCompanyIds.forEach(companyId => {
            params.append('company_id', companyId);
          });
        } else {
          companies.forEach(company => {
            params.append('company_id', company.id);
          });
        }

        // Consumption source filter
        if (selectedConsumptionSources.length > 0) {
          selectedConsumptionSources.forEach(source => {
            params.append('consumption_source', source);
          });
        } else {
          consumptionSources.forEach(source => {
            params.append('consumption_source', source);
          });
        }

        // Quarter filter
        if (selectedQuarters.length > 0) {
          selectedQuarters.forEach(quarter => {
            params.append('quarter', quarter);
          });
        } else {
          ['Q1', 'Q2', 'Q3', 'Q4'].forEach(q => {
            params.append('quarter', q);
          });
        }
        
        // Year filter
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

        console.log('Fetching electricity metrics with params:', params.toString());

        const response = await api.get(`/environment_dash/electricity-key-metrics?${params.toString()}`);

        console.log('Electricity metrics response:', response.data);
        
        setElectricityMetrics(response.data);
        
      } catch (error) {
        console.error('Failed to fetch electricity key metrics:', error);
        console.error('Error response:', error.response?.data);
        // Set default values on error
        setElectricityMetrics({
          total_consumption: 0,
          unit_of_measurement: 'kWh',
          peak_year: null,
          peak_consumption: 0,
          average_consumption: 0
        });
      } finally {
        setLoading(false);
      }
    };

    // Fetch when filters change
    fetchElectricityKeyMetrics();
  }, [activeTab, selectedCompanyIds, selectedQuarters, fromYear, toYear, selectedConsumptionSources, companies, availableYears, consumptionSources]);

  useEffect(() => {
    const fetchDieselKeyMetrics = async () => {
      if (activeTab !== 'diesel') return;
      if (companies.length === 0 || dieselYears.length === 0 || 
          companyProperties.length === 0 || propertyTypes.length === 0) return;

      try {
        setLoading(true);
        
        // Build parameters using URLSearchParams (same as other API calls)
        const params = new URLSearchParams();

        // Company filter
        if (selectedCompanyIds.length > 0) {
          selectedCompanyIds.forEach(companyId => {
            params.append('company_id', companyId);
          });
        } else {
          companies.forEach(company => {
            params.append('company_id', company.id);
          });
        }

        // Property name filter
        if (selectedCompanyPropertyNames.length > 0) {
          selectedCompanyPropertyNames.forEach(propertyName => {
            params.append('company_property_name', propertyName);
          });
        } else {
          companyProperties.forEach(property => {
            params.append('company_property_name', property);
          });
        }

        // Property type filter
        if (selectedCompanyPropertyTypes.length > 0) {
          selectedCompanyPropertyTypes.forEach(propertyType => {
            params.append('company_property_type', propertyType);
          });
        } else {
          propertyTypes.forEach(type => {
            params.append('company_property_type', type);
          });
        }

        // Quarter filter
        if (selectedQuarters.length > 0) {
          selectedQuarters.forEach(quarter => {
            params.append('quarter', quarter);
          });
        } else {
          ['Q1', 'Q2', 'Q3', 'Q4'].forEach(q => {
            params.append('quarter', q);
          });
        }

        // Month filter
        if (selectedMonths.length > 0) {
          selectedMonths.forEach(month => {
            params.append('month', month);
          });
        } else {
          ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].forEach(monthName => {
            params.append('month', monthName);
          });
        }
        
        // Year filter using diesel years
        let yearRange = [];
        if (fromYear && toYear) {
          yearRange = dieselYears.filter(year => year >= parseInt(fromYear) && year <= parseInt(toYear));
        } else if (fromYear && !toYear) {
          yearRange = dieselYears.filter(year => year >= parseInt(fromYear));
        } else if (!fromYear && toYear) {
          yearRange = dieselYears.filter(year => year <= parseInt(toYear));
        } else {
          yearRange = dieselYears;
        }
        
        yearRange.forEach(year => {
          params.append('year', year);
        });

        console.log('Fetching diesel metrics with params:', params.toString());

        const response = await api.get(`/environment_dash/diesel-key-metrics?${params.toString()}`);

        console.log('Diesel metrics response:', response.data);
        
        setDieselMetrics(response.data);
        
      } catch (error) {
        console.error('Failed to fetch diesel key metrics:', error);
        console.error('Error response:', error.response?.data);
        // Set default values on error
        setDieselMetrics({
          total_diesel_consumption: 0,
          unit_of_measurement: 'Liters',
          average_annual_consumption: 0,
          yearly_deviation: []
        });
      } finally {
        setLoading(false);
      }
    };

    // Fetch when filters change
    fetchDieselKeyMetrics();
  }, [activeTab, selectedCompanyIds, selectedQuarters, fromYear, toYear, selectedCompanyPropertyNames, selectedCompanyPropertyTypes, selectedMonths, 
    companies, dieselYears, companyProperties, propertyTypes]);

  // Fetch companies and available years on component mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [
          companiesResponse,
          yearsResponse,
          sourcesResponse,
          companyPropertiesResponse,
          propertyTypesResponse,
          dieselYearsResponse
        ] = await Promise.all([
          api.get('/reference/companies'),
          api.get('/environment_dash/water-years'),
          api.get('/environment_dash/comsumption-source'),
          api.get('/environment_dash/diesel-cp-name'),
          api.get('/environment_dash/diesel-cp-type'),
          api.get('/environment_dash/diesel-years')
        ]);
   
        console.log('Companies fetched:', companiesResponse.data);
        console.log('Available years fetched:', yearsResponse.data);
        console.log('Consumption sources fetched:', sourcesResponse.data);
        console.log('Company properties fetched:', companyPropertiesResponse.data);
        console.log('Property types fetched:', propertyTypesResponse.data);
        console.log('Diesel years fetched:', dieselYearsResponse.data);
        
        setCompanies(companiesResponse.data);
        setAvailableYears(yearsResponse.data.data || []);
        setConsumptionSources(sourcesResponse.data.data || []);
        setCompanyProperties(companyPropertiesResponse.data.data || []);
        setPropertyTypes(propertyTypesResponse.data.data || []);
        setDieselYears(dieselYearsResponse.data.data || []);
        setLastUpdated(new Date());
        setError(null); // Clear any previous errors
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setCompanies([]);
        setAvailableYears([]);
        setConsumptionSources([]);
        setCompanyProperties([]);
        setPropertyTypes([]);
        setDieselYears([]);
        setError('Not accessible. Only authorized people can access this.');
      }
    };
   
    fetchInitialData();
   }, []);

  // Fetch electricity pie chart data when filters change
  useEffect(() => {
    const fetchElectricityPieChart = async () => {
      if (activeTab !== 'electricity') return;

      try {
        setLoading(true); // Add loading state
        
        // Build parameters
        const params = {};

        // Company filter
        if (selectedCompanyIds.length > 0) {
          params.company_id = selectedCompanyIds;
        } else {
          params.company_id = companies.map(company => company.id);
        }

        // Consumption source filter
        if (selectedConsumptionSources.length > 0) {
          params.consumption_source = selectedConsumptionSources;
        } else {
          params.consumption_source = consumptionSources;
        }

        // Quarter filter
        if (selectedQuarters.length > 0) {
          params.quarter = selectedQuarters;
        } else {
          params.quarter = ['Q1', 'Q2', 'Q3', 'Q4'];
        }
        
        // For year range: handle both single years and ranges using available years
        if (fromYear && toYear) {
          // Generate array of years from fromYear to toYear, filtered by available years
          const yearRange = availableYears.filter(year => year >= parseInt(fromYear) && year <= parseInt(toYear));
          params.year = yearRange;
        } else if (fromYear && !toYear) {
          // Only from year specified - use from year to latest available year
          const yearRange = availableYears.filter(year => year >= parseInt(fromYear));
          params.year = yearRange;
        } else if (!fromYear && toYear) {
          // Only to year specified - use earliest available year to to year
          const yearRange = availableYears.filter(year => year <= parseInt(toYear));
          params.year = yearRange;
        } else {
          // No year filter - send all available years
          params.year = availableYears;
        }
        
        console.log('Sending params to electricity pie chart API:', params);
        
        const response = await api.get('/environment_dash/elec-pie-chart', { 
          params,
          paramsSerializer: {
            indexes: null
          }
        });

        console.log('Electricity pie chart response:', response.data);
        
        // Validate response data
        const responseData = response.data?.data || [];
        console.log('Validated response data:', responseData);
        
        // Make sure data has the correct structure
        const validatedData = responseData.map(item => ({
          label: item.label || 'Unknown',
          value: Number(item.value) || 0,
          percentage: Number(item.percentage) || 0,
          color: item.color || COLORS[0]
        }));
        
        console.log('Final validated data for pie chart:', validatedData);
        
        // Set the pie chart data from API response
        setElectricityPieData(validatedData);
        
      } catch (error) {
        console.error('Failed to fetch electricity pie chart:', error);
        console.error('Error response:', error.response?.data);
        setElectricityPieData([]); // Set empty array on error
        setError('Failed to load pie chart data'); // Add error state
      } finally {
        setLoading(false); // Always clear loading state
      }
    };

    // Only fetch data if companies and available years have been loaded
    if (companies.length > 0 && availableYears.length > 0 && consumptionSources.length > 0) {
      fetchElectricityPieChart();
    }
  }, [activeTab, selectedCompanyIds, selectedQuarters, fromYear, toYear, selectedConsumptionSources, companies, availableYears, consumptionSources]);

  useEffect(() => {
    const fetchElectricityLineChart = async () => {
      if (activeTab !== 'electricity') return;

      try {
        // Build parameters (same logic as pie chart)
        const params = {};

        // Company filter
        if (selectedCompanyIds.length > 0) {
          params.company_id = selectedCompanyIds;
        } else {
          params.company_id = companies.map(company => company.id);
        }

        // Consumption source filter
        if (selectedConsumptionSources.length > 0) {
          params.consumption_source = selectedConsumptionSources;
        } else {
          params.consumption_source = consumptionSources;
        }

        // Quarter filter
        if (selectedQuarters.length > 0) {
          params.quarter = selectedQuarters;
        } else {
          params.quarter = ['Q1', 'Q2', 'Q3', 'Q4'];
        }
        
        if (fromYear && toYear) {
          const yearRange = availableYears.filter(year => year >= parseInt(fromYear) && year <= parseInt(toYear));
          params.year = yearRange;
        } else if (fromYear && !toYear) {
          const yearRange = availableYears.filter(year => year >= parseInt(fromYear));
          params.year = yearRange;
        } else if (!fromYear && toYear) {
          const yearRange = availableYears.filter(year => year <= parseInt(toYear));
          params.year = yearRange;
        } else {
          params.year = availableYears;
        }
        
        console.log('Sending params to electricity line chart API:', params);
        
        const response = await api.get('/environment_dash/elect-line-chart', { 
          params,
          paramsSerializer: {
            indexes: null
          }
        });

        console.log('Electricity line chart response:', response.data);
        
        // Transform the data for Recharts
        const transformedData = transformLineChartData(response.data.data, response.data.colors);
        
        console.log('Transformed line chart data:', transformedData);
        
        setElectricityLineData(transformedData);
        setLineChartColors(response.data.colors || {});
        
      } catch (error) {
        console.error('Failed to fetch electricity line chart:', error);
        console.error('Error response:', error.response?.data);
        setElectricityLineData([]);
        setLineChartColors({});
      }
    };

    // Only fetch data if companies and available years have been loaded
    if (companies.length > 0 && availableYears.length > 0 && consumptionSources.length > 0) {
      fetchElectricityLineChart();
    }
  }, [activeTab, selectedCompanyIds, selectedQuarters, fromYear, toYear, selectedConsumptionSources, companies, availableYears, consumptionSources]);

  useEffect(() => {
    const fetchElectricityBarChart = async () => {
      if (activeTab !== 'electricity') return;

      try {
        console.log('Fetching electricity bar chart...');
        
        // Build parameters (same logic as other charts)
        const params = {};

        // Company filter
        if (selectedCompanyIds.length > 0) {
          params.company_id = selectedCompanyIds;
        } else {
          params.company_id = companies.map(company => company.id);
        }

        // Consumption source filter
        if (selectedConsumptionSources.length > 0) {
          params.consumption_source = selectedConsumptionSources;
        } else {
          params.consumption_source = consumptionSources;
        }

        // Quarter filter
        if (selectedQuarters.length > 0) {
          params.quarter = selectedQuarters;
        } else {
          params.quarter = ['Q1', 'Q2', 'Q3', 'Q4'];
        }
        
        if (fromYear && toYear) {
          const yearRange = availableYears.filter(year => year >= parseInt(fromYear) && year <= parseInt(toYear));
          params.year = yearRange;
        } else if (fromYear && !toYear) {
          const yearRange = availableYears.filter(year => year >= parseInt(fromYear));
          params.year = yearRange;
        } else if (!fromYear && toYear) {
          const yearRange = availableYears.filter(year => year <= parseInt(toYear));
          params.year = yearRange;
        } else {
          params.year = availableYears;
        }
        
        console.log('Bar chart API params:', params);
        
        const response = await api.get('/environment_dash/elect-perc-bar-chart', { 
          params,
          paramsSerializer: {
            indexes: null
          }
        });

        console.log('Bar chart API response:', response.data);
        
        // Make sure we're getting the right data structure
        const responseData = response.data?.data || [];
        console.log('Response data array:', responseData);
        
        if (!Array.isArray(responseData)) {
          console.error('API response data is not an array:', responseData);
          setElectricityBarData([]);
          return;
        }
        
        // Transform the data
        const transformedData = transformBarChartData(responseData);
        
        console.log('Final transformed data for bar chart:', transformedData);
        
        // Validate that transformed data has the right structure
        const isValidData = transformedData.every(item => 
          item.hasOwnProperty('company') && 
          item.hasOwnProperty('consumption') && 
          typeof item.consumption === 'number'
        );
        
        if (!isValidData) {
          console.error('Transformed data is invalid:', transformedData);
          setElectricityBarData([]);
          return;
        }
        
        setElectricityBarData(transformedData);
        
      } catch (error) {
        console.error('Failed to fetch electricity bar chart:', error);
        console.error('Error response:', error.response?.data);
        setElectricityBarData([]);
      }
    };

    // Only fetch data if companies and available years have been loaded
    if (companies.length > 0 && availableYears.length > 0 && consumptionSources.length > 0) {
      fetchElectricityBarChart();
    }
  }, [activeTab, selectedCompanyIds, selectedQuarters, fromYear, toYear, selectedConsumptionSources, companies, availableYears, consumptionSources]);

  useEffect(() => {
    const fetchElectricitySourceChart = async () => {
      if (activeTab !== 'electricity') return;

      try {
        // Build parameters (same logic as other charts)
        const params = {};

        // Company filter
        if (selectedCompanyIds.length > 0) {
          params.company_id = selectedCompanyIds;
        } else {
          params.company_id = companies.map(company => company.id);
        }

        // Consumption source filter
        if (selectedConsumptionSources.length > 0) {
          params.consumption_source = selectedConsumptionSources;
        } else {
          params.consumption_source = consumptionSources;
        }

        // Quarter filter
        if (selectedQuarters.length > 0) {
          params.quarter = selectedQuarters;
        } else {
          params.quarter = ['Q1', 'Q2', 'Q3', 'Q4'];
        }
        
        if (fromYear && toYear) {
          const yearRange = availableYears.filter(year => year >= parseInt(fromYear) && year <= parseInt(toYear));
          params.year = yearRange;
        } else if (fromYear && !toYear) {
          const yearRange = availableYears.filter(year => year >= parseInt(fromYear));
          params.year = yearRange;
        } else if (!fromYear && toYear) {
          const yearRange = availableYears.filter(year => year <= parseInt(toYear));
          params.year = yearRange;
        } else {
          params.year = availableYears;
        }
        
        console.log('Sending params to electricity source chart API:', params);
        
        const response = await api.get('/environment_dash/elect-source-bar-chart', { 
          params,
          paramsSerializer: {
            indexes: null
          }
        });

        console.log('Electricity source chart response:', response.data);
        
        // Transform the data for stacked bar chart
        const transformedData = transformSourceBarChartData(response.data.data);
        
        setElectricitySourceData(transformedData.chartData);
        setSourceColors(transformedData.colors);
        
      } catch (error) {
        console.error('Failed to fetch electricity source chart:', error);
        console.error('Error response:', error.response?.data);
        setElectricitySourceData([]);
        setSourceColors({});
      }
    };

    // Only fetch data if companies and available years have been loaded
    if (companies.length > 0 && availableYears.length > 0 && consumptionSources.length > 0) {
      fetchElectricitySourceChart();
    }
  }, [activeTab, selectedCompanyIds, selectedQuarters, fromYear, toYear, selectedConsumptionSources, companies, availableYears, consumptionSources]);

  useEffect(() => {
    const fetchElectricityQuarterChart = async () => {
      if (activeTab !== 'electricity') return;

      try {
        // Build parameters (same logic as other charts)
        const params = {};

        // Company filter
        if (selectedCompanyIds.length > 0) {
          params.company_id = selectedCompanyIds;
        } else {
          params.company_id = companies.map(company => company.id);
        }

        // Consumption source filter
        if (selectedConsumptionSources.length > 0) {
          params.consumption_source = selectedConsumptionSources;
        } else {
          params.consumption_source = consumptionSources;
        }

        // Quarter filter
        if (selectedQuarters.length > 0) {
          params.quarter = selectedQuarters;
        } else {
          params.quarter = ['Q1', 'Q2', 'Q3', 'Q4'];
        }
        
        if (fromYear && toYear) {
          const yearRange = availableYears.filter(year => year >= parseInt(fromYear) && year <= parseInt(toYear));
          params.year = yearRange;
        } else if (fromYear && !toYear) {
          const yearRange = availableYears.filter(year => year >= parseInt(fromYear));
          params.year = yearRange;
        } else if (!fromYear && toYear) {
          const yearRange = availableYears.filter(year => year <= parseInt(toYear));
          params.year = yearRange;
        } else {
          params.year = availableYears;
        }
        
        console.log('Sending params to electricity quarterly chart API:', params);
        
        const response = await api.get('/environment_dash/elect-quarter-bar-chart', { 
          params,
          paramsSerializer: {
            indexes: null
          }
        });

        console.log('Electricity quarterly chart response:', response.data);
        
        // Transform the data for stacked bar chart
        const transformedData = transformQuarterBarChartData(response.data.data);
        
        setElectricityQuarterData(transformedData.chartData);
        setQuarterCompanyColors(transformedData.colors);
        
      } catch (error) {
        console.error('Failed to fetch electricity quarterly chart:', error);
        console.error('Error response:', error.response?.data);
        setElectricityQuarterData([]);
        setQuarterCompanyColors({});
      }
    };

    // Only fetch data if companies and available years have been loaded
    if (companies.length > 0 && availableYears.length > 0 && consumptionSources.length > 0) {
      fetchElectricityQuarterChart();
    }
  }, [activeTab, selectedCompanyIds, selectedQuarters, fromYear, toYear, selectedConsumptionSources, companies, availableYears, consumptionSources]);

  useEffect(() => {
    const fetchDieselPieChart = async () => {
      if (activeTab !== 'diesel') return;

      try {
        // Build parameters for diesel API
        const params = {};

        // Company filter
        if (selectedCompanyIds.length > 0) {
          params.company_id = selectedCompanyIds;
        } else {
          params.company_id = companies.map(company => company.id);
        }

        // Property name filter
        if (selectedCompanyPropertyNames.length > 0) {
          params.property_name = selectedCompanyPropertyNames; // or company_property_name depending on API
        } else {
          params.property_name = companyProperties; // or company_property_name depending on API
        }

        // Property type filter
        if (selectedCompanyPropertyTypes.length > 0) {
          params.property_type = selectedCompanyPropertyTypes; // or company_property_type depending on API
        } else {
          params.property_type = propertyTypes; // or company_property_type depending on API
        }

        // Quarter filter
        if (selectedQuarters.length > 0) {
          params.quarter = selectedQuarters;
        } else {
          params.quarter = ['Q1', 'Q2', 'Q3', 'Q4'];
        }

        // Month filter
        if (selectedMonths.length > 0) {
          params.month = selectedMonths;
        } else {
          params.month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        }
        
        // Year filter using diesel years
        if (fromYear && toYear) {
          const yearRange = dieselYears.filter(year => year >= parseInt(fromYear) && year <= parseInt(toYear));
          params.year = yearRange;
        } else if (fromYear && !toYear) {
          const yearRange = dieselYears.filter(year => year >= parseInt(fromYear));
          params.year = yearRange;
        } else if (!fromYear && toYear) {
          const yearRange = dieselYears.filter(year => year <= parseInt(toYear));
          params.year = yearRange;
        } else {
          params.year = dieselYears;
        }
        
        console.log('Sending params to diesel pie chart API:', params);
        
        const response = await api.get('/environment_dash/diesel-pie-chart', { 
          params,
          paramsSerializer: {
            indexes: null
          }
        });

        console.log('Diesel pie chart response:', response.data);
        
        // Transform the data for pie chart
        const transformedData = transformDieselPieData(response.data.data);
        
        setDieselPieData(transformedData);
        
      } catch (error) {
        console.error('Failed to fetch diesel pie chart:', error);
        console.error('Error response:', error.response?.data);
        setDieselPieData([]);
      }
    };

    // Only fetch data if companies and diesel years have been loaded
    if (companies.length > 0 && dieselYears.length > 0 && 
        companyProperties.length > 0 && propertyTypes.length > 0) {
      fetchDieselPieChart();
    }
  }, [activeTab, selectedCompanyIds, selectedQuarters, fromYear, toYear, selectedCompanyPropertyNames, selectedCompanyPropertyTypes, selectedMonths, 
    companies, dieselYears, companyProperties, propertyTypes]);

  useEffect(() => {
    const fetchDieselPropertyPieChart = async () => {
      if (activeTab !== 'diesel') return;

      try {
        // Build parameters for diesel property API
        const params = {};

        // Company filter
        if (selectedCompanyIds.length > 0) {
          params.company_id = selectedCompanyIds;
        } else {
          params.company_id = companies.map(company => company.id);
        }

        // Property name filter - FIXED: use company_property_name consistently
        if (selectedCompanyPropertyNames.length > 0) {
          params.company_property_name = selectedCompanyPropertyNames;
        } else {
          params.company_property_name = companyProperties;
        }

        // Property type filter - FIXED: use company_property_type consistently
        if (selectedCompanyPropertyTypes.length > 0) {
          params.company_property_type = selectedCompanyPropertyTypes;
        } else {
          params.company_property_type = propertyTypes;
        }

        // Quarter filter
        if (selectedQuarters.length > 0) {
          params.quarter = selectedQuarters;
        } else {
          params.quarter = ['Q1', 'Q2', 'Q3', 'Q4'];
        }

        // Month filter
        if (selectedMonths.length > 0) {
          params.month = selectedMonths;
        } else {
          params.month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        }
        
        // Year filter using diesel years
        if (fromYear && toYear) {
          const yearRange = dieselYears.filter(year => year >= parseInt(fromYear) && year <= parseInt(toYear));
          params.year = yearRange;
        } else if (fromYear && !toYear) {
          const yearRange = dieselYears.filter(year => year >= parseInt(fromYear));
          params.year = yearRange;
        } else if (!fromYear && toYear) {
          const yearRange = dieselYears.filter(year => year <= parseInt(toYear));
          params.year = yearRange;
        } else {
          params.year = dieselYears;
        }
        
        console.log('Sending params to diesel property pie chart API:', params);
        
        const response = await api.get('/environment_dash/diesel-cp-chart', { 
          params,
          paramsSerializer: {
            indexes: null
          }
        });

        console.log('Diesel property pie chart response:', response.data);
        
        // Transform the data for pie chart
        const transformedData = transformDieselPropertyPieData(response.data.data);
        
        setDieselPropertyPieData(transformedData);
        
      } catch (error) {
        console.error('Failed to fetch diesel property pie chart:', error);
        console.error('Error response:', error.response?.data);
        setDieselPropertyPieData([]);
      }
    };

    // Only fetch data if companies and diesel years have been loaded
    if (companies.length > 0 && dieselYears.length > 0 && 
        companyProperties.length > 0 && propertyTypes.length > 0) {
      fetchDieselPropertyPieChart();
    }
  }, [activeTab, selectedCompanyIds, selectedQuarters, fromYear, toYear, selectedCompanyPropertyNames, selectedCompanyPropertyTypes, selectedMonths, 
    companies, dieselYears, companyProperties, propertyTypes]);

  useEffect(() => {
    const fetchDieselLineChart = async () => {
      if (activeTab !== 'diesel') return;

      try {
        // Build parameters for diesel line chart API
        const params = {};

        // Company filter
        if (selectedCompanyIds.length > 0) {
          params.company_id = selectedCompanyIds;
        } else {
          params.company_id = companies.map(company => company.id);
        }

        // Property name filter
        if (selectedCompanyPropertyNames.length > 0) {
          params.property_name = selectedCompanyPropertyNames; // or company_property_name depending on API
        } else {
          params.property_name = companyProperties; // or company_property_name depending on API
        }

        // Property type filter
        if (selectedCompanyPropertyTypes.length > 0) {
          params.property_type = selectedCompanyPropertyTypes; // or company_property_type depending on API
        } else {
          params.property_type = propertyTypes; // or company_property_type depending on API
        }

        // Quarter filter
        if (selectedQuarters.length > 0) {
          params.quarter = selectedQuarters;
        } else {
          params.quarter = ['Q1', 'Q2', 'Q3', 'Q4'];
        }

        // Month filter
        if (selectedMonths.length > 0) {
          params.month = selectedMonths;
        } else {
          params.month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        }
        
        // Year filter using diesel years
        if (fromYear && toYear) {
          const yearRange = dieselYears.filter(year => year >= parseInt(fromYear) && year <= parseInt(toYear));
          params.year = yearRange;
        } else if (fromYear && !toYear) {
          const yearRange = dieselYears.filter(year => year >= parseInt(fromYear));
          params.year = yearRange;
        } else if (!fromYear && toYear) {
          const yearRange = dieselYears.filter(year => year <= parseInt(toYear));
          params.year = yearRange;
        } else {
          params.year = dieselYears;
        }
        
        console.log('Sending params to diesel line chart API:', params);
        
        const response = await api.get('/environment_dash/diesel-line-chart', { 
          params,
          paramsSerializer: {
            indexes: null
          }
        });

        console.log('Diesel line chart response:', response.data);
        
        // Transform the data for line chart
        const transformedData = transformDieselLineChartData(response.data.data);
        
        setDieselLineData(transformedData.chartData);
        setDieselLineColors(transformedData.colors);
        
      } catch (error) {
        console.error('Failed to fetch diesel line chart:', error);
        console.error('Error response:', error.response?.data);
        setDieselLineData([]);
        setDieselLineColors({});
      }
    };

    // Only fetch data if companies and diesel years have been loaded
    if (companies.length > 0 && dieselYears.length > 0 && 
        companyProperties.length > 0 && propertyTypes.length > 0) {
      fetchDieselLineChart();
    }
  }, [activeTab, selectedCompanyIds, selectedQuarters, fromYear, toYear, selectedCompanyPropertyNames, selectedCompanyPropertyTypes, selectedMonths, 
    companies, dieselYears, companyProperties, propertyTypes]);
    
  useEffect(() => {
    const fetchDieselPropertyTypeChart = async () => {
      if (activeTab !== 'diesel') return;

      try {
        // Build parameters for diesel property type API
        const params = {};

        // Company filter
        if (selectedCompanyIds.length > 0) {
          params.company_id = selectedCompanyIds;
        } else {
          params.company_id = companies.map(company => company.id);
        }

        // Property name filter
        if (selectedCompanyPropertyNames.length > 0) {
          params.property_name = selectedCompanyPropertyNames; // or company_property_name depending on API
        } else {
          params.property_name = companyProperties; // or company_property_name depending on API
        }

        // Property type filter
        if (selectedCompanyPropertyTypes.length > 0) {
          params.property_type = selectedCompanyPropertyTypes; // or company_property_type depending on API
        } else {
          params.property_type = propertyTypes; // or company_property_type depending on API
        }

        // Quarter filter
        if (selectedQuarters.length > 0) {
          params.quarter = selectedQuarters;
        } else {
          params.quarter = ['Q1', 'Q2', 'Q3', 'Q4'];
        }

        // Month filter
        if (selectedMonths.length > 0) {
          params.month = selectedMonths;
        } else {
          params.month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        }
        
        // Year filter using diesel years
        if (fromYear && toYear) {
          const yearRange = dieselYears.filter(year => year >= parseInt(fromYear) && year <= parseInt(toYear));
          params.year = yearRange;
        } else if (fromYear && !toYear) {
          const yearRange = dieselYears.filter(year => year >= parseInt(fromYear));
          params.year = yearRange;
        } else if (!fromYear && toYear) {
          const yearRange = dieselYears.filter(year => year <= parseInt(toYear));
          params.year = yearRange;
        } else {
          params.year = dieselYears;
        }
        
        console.log('Sending params to diesel property type chart API:', params);
        
        const response = await api.get('/environment_dash/diesel-cp-type-chart', { 
          params,
          paramsSerializer: {
            indexes: null
          }
        });

        console.log('Diesel property type chart response:', response.data);
        
        // Transform the data for horizontal bar chart
        const transformedData = transformDieselPropertyTypeData(response.data.data);
        
        setDieselPropertyTypeData(transformedData);
        
      } catch (error) {
        console.error('Failed to fetch diesel property type chart:', error);
        console.error('Error response:', error.response?.data);
        setDieselPropertyTypeData([]);
      }
    };

    // Only fetch data if companies and diesel years have been loaded
    if (companies.length > 0 && dieselYears.length > 0 && 
        companyProperties.length > 0 && propertyTypes.length > 0) {
      fetchDieselPropertyTypeChart();
    }
  }, [activeTab, selectedCompanyIds, selectedQuarters, fromYear, toYear, selectedCompanyPropertyNames, selectedCompanyPropertyTypes, selectedMonths, 
    companies, dieselYears, companyProperties, propertyTypes]);

  useEffect(() => {
    const fetchDieselMonthlyLineChart = async () => {
      if (activeTab !== 'diesel') return;

      try {
        // Build parameters for diesel monthly line chart API
        const params = {};

        // Company filter
        if (selectedCompanyIds.length > 0) {
          params.company_id = selectedCompanyIds;
        } else {
          params.company_id = companies.map(company => company.id);
        }

        // Property name filter - FIXED: use company_property_name consistently
        if (selectedCompanyPropertyNames.length > 0) {
          params.company_property_name = selectedCompanyPropertyNames;
        } else {
          params.company_property_name = companyProperties;
        }

        // Property type filter - FIXED: use company_property_type consistently
        if (selectedCompanyPropertyTypes.length > 0) {
          params.company_property_type = selectedCompanyPropertyTypes;
        } else {
          params.company_property_type = propertyTypes;
        }

        // Quarter filter
        if (selectedQuarters.length > 0) {
          params.quarter = selectedQuarters;
        } else {
          params.quarter = ['Q1', 'Q2', 'Q3', 'Q4'];
        }

        // Month filter
        if (selectedMonths.length > 0) {
          params.month = selectedMonths;
        } else {
          params.month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        }
        
        // Year filter using diesel years
        if (fromYear && toYear) {
          const yearRange = dieselYears.filter(year => year >= parseInt(fromYear) && year <= parseInt(toYear));
          params.year = yearRange;
        } else if (fromYear && !toYear) {
          const yearRange = dieselYears.filter(year => year >= parseInt(fromYear));
          params.year = yearRange;
        } else if (!fromYear && toYear) {
          const yearRange = dieselYears.filter(year => year <= parseInt(toYear));
          params.year = yearRange;
        } else {
          params.year = dieselYears;
        }
        
        console.log('Sending params to diesel monthly line chart API:', params);
        
        const response = await api.get('/environment_dash/diesel-cp-line-chart', { 
          params,
          paramsSerializer: {
            indexes: null
          }
        });

        console.log('Diesel monthly line chart response:', response.data);
        
        // Transform the data for line chart
        const transformedData = transformDieselMonthlyLineData(response.data.data, response.data.color_map);
        
        setDieselMonthlyLineData(transformedData.chartData);
        setDieselMonthlyLineColors(transformedData.colors);
        
      } catch (error) {
        console.error('Failed to fetch diesel monthly line chart:', error);
        console.error('Error response:', error.response?.data);
        setDieselMonthlyLineData([]);
        setDieselMonthlyLineColors({});
      }
    };

    // Only fetch data if companies and diesel years have been loaded
    if (companies.length > 0 && dieselYears.length > 0 && 
        companyProperties.length > 0 && propertyTypes.length > 0) {
      fetchDieselMonthlyLineChart();
    }
  }, [activeTab, selectedCompanyIds, selectedQuarters, fromYear, toYear, selectedCompanyPropertyNames, selectedCompanyPropertyTypes, selectedMonths, 
    companies, dieselYears, companyProperties, propertyTypes]);

  useEffect(() => {
    const fetchDieselQuarterlyBarChart = async () => {
      if (activeTab !== 'diesel') return;

      try {
        // Build parameters for diesel quarterly bar chart API
        const params = {};

        // Company filter
        if (selectedCompanyIds.length > 0) {
          params.company_id = selectedCompanyIds;
        } else {
          params.company_id = companies.map(company => company.id);
        }

        // Property name filter - FIXED: use company_property_name consistently
        if (selectedCompanyPropertyNames.length > 0) {
          params.company_property_name = selectedCompanyPropertyNames;
        } else {
          params.company_property_name = companyProperties;
        }

        // Property type filter - FIXED: use company_property_type consistently
        if (selectedCompanyPropertyTypes.length > 0) {
          params.company_property_type = selectedCompanyPropertyTypes;
        } else {
          params.company_property_type = propertyTypes;
        }

        // Quarter filter
        if (selectedQuarters.length > 0) {
          params.quarter = selectedQuarters;
        } else {
          params.quarter = ['Q1', 'Q2', 'Q3', 'Q4'];
        }

        // Month filter
        if (selectedMonths.length > 0) {
          params.month = selectedMonths;
        } else {
          params.month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        }
        
        // Year filter using diesel years
        if (fromYear && toYear) {
          const yearRange = dieselYears.filter(year => year >= parseInt(fromYear) && year <= parseInt(toYear));
          params.year = yearRange;
        } else if (fromYear && !toYear) {
          const yearRange = dieselYears.filter(year => year >= parseInt(fromYear));
          params.year = yearRange;
        } else if (!fromYear && toYear) {
          const yearRange = dieselYears.filter(year => year <= parseInt(toYear));
          params.year = yearRange;
        } else {
          params.year = dieselYears;
        }
        
        console.log('Sending params to diesel quarterly bar chart API:', params);
        
        const response = await api.get('/environment_dash/diesel-quarter-bar-chart', { 
          params,
          paramsSerializer: {
            indexes: null
          }
        });

        console.log('Diesel quarterly bar chart response:', response.data);
        
        // Transform the data for stacked bar chart
        const transformedData = transformDieselQuarterlyBarData(response.data.data, response.data.color_map);
        
        setDieselQuarterlyBarData(transformedData.chartData);
        setDieselQuarterlyBarColors(transformedData.colors);
        
      } catch (error) {
        console.error('Failed to fetch diesel quarterly bar chart:', error);
        console.error('Error response:', error.response?.data);
        setDieselQuarterlyBarData([]);
        setDieselQuarterlyBarColors({});
      }
    };

    // Only fetch data if companies and diesel years have been loaded
    if (companies.length > 0 && dieselYears.length > 0 && 
        companyProperties.length > 0 && propertyTypes.length > 0) {
      fetchDieselQuarterlyBarChart();
    }
  }, [activeTab, selectedCompanyIds, selectedQuarters, fromYear, toYear, selectedCompanyPropertyNames, selectedCompanyPropertyTypes, selectedMonths, 
    companies, dieselYears, companyProperties, propertyTypes]);

  // Clear all filters function
  const clearAllFilters = () => {
    setSelectedCompanyIds([]);
    setSelectedQuarters([]);
    setFromYear('');
    setToYear('');
    setSelectedConsumptionSources([]);
    
    // Clear diesel-specific filters
    setSelectedCompanyPropertyNames([]);
    setSelectedCompanyPropertyTypes([]);
    setSelectedMonths([]);
  };

  const renderDieselPropertyTooltip = ({ active, payload }) => {
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
              {entry.dataKey.toUpperCase()}: {Number(entry.value).toLocaleString()} {currentData.unit}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

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
    
    // Add electricity-specific filters
    if (activeTab === 'electricity' && selectedConsumptionSources.length > 0) {
      if (selectedConsumptionSources.length === 1) {
        filters.push(selectedConsumptionSources[0]);
      } else {
        filters.push(`${selectedConsumptionSources.length} SOURCES`);
      }
    }
    
    // Add diesel-specific filters
    if (activeTab === 'diesel') {
      if (selectedCompanyPropertyNames.length > 0) {
        if (selectedCompanyPropertyNames.length === 1) {
          filters.push(selectedCompanyPropertyNames[0]);
        } else {
          filters.push(`${selectedCompanyPropertyNames.length} PROPERTIES`);
        }
      }
      
      if (selectedCompanyPropertyTypes.length > 0) {
        if (selectedCompanyPropertyTypes.length === 1) {
          filters.push(selectedCompanyPropertyTypes[0]);
        } else {
          filters.push(`${selectedCompanyPropertyTypes.length} PROPERTY TYPES`);
        }
      }
      
      if (selectedMonths.length > 0) {
        if (selectedMonths.length === 1) {
          filters.push(selectedMonths[0]);
        } else {
          filters.push(`${selectedMonths.length} MONTHS`);
        }
      }
    }
    
    // Add year filters
    if (fromYear || toYear) {
      if (fromYear && toYear) {
        filters.push(`${fromYear}-${toYear}`);
      } else if (fromYear) {
        filters.push(`FROM ${fromYear}`);
      } else if (toYear) {
        filters.push(`TO ${toYear}`);
      }
    }
    
    if (filters.length === 0) {
      return "ALL DATA";
    }
    
    return filters.join(" • ").toUpperCase();
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
        backgroundColor: '#ffffff',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        zoom: '0.8'  // Add this line
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
              Environment - Energy
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
            onClick={() => setActiveTab('electricity')}
            style={{
              padding: '8px 16px',
              backgroundColor: activeTab === 'electricity' ? '#10B981' : '#9CA3AF',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              minWidth: '80px'
            }}
          >
            Electricity
          </button>
          <button
            onClick={() => setActiveTab('diesel')}
            style={{
              padding: '8px 16px',
              backgroundColor: activeTab === 'diesel' ? '#10B981' : '#9CA3AF',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              minWidth: '80px'
            }}
          >
            Diesel
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
          {/* Company Multi-Select Filter */}
          <MultiSelectWithChips
            label="Companies"
            options={companyOptions}
            selectedValues={selectedCompanyIds}
            onChange={setSelectedCompanyIds}
            placeholder="All Companies"
          />

          {/* Source Multi-Select Filter - Only show for electricity tab */}
          {activeTab === 'electricity' && (
            <MultiSelectWithChips
              label="Sources"
              options={consumptionSourceOptions}
              selectedValues={selectedConsumptionSources}
              onChange={setSelectedConsumptionSources}
              placeholder="All Sources"
            />
          )}

          {/* Company Property Name Multi-Select Filter - Only show for diesel tab */}
          {activeTab === 'diesel' && (
            <MultiSelectWithChips
              label="Properties"
              options={companyPropertyOptions}
              selectedValues={selectedCompanyPropertyNames}
              onChange={setSelectedCompanyPropertyNames}
              placeholder="Company Properties"
            />
          )}

          {/* Property Type Multi-Select Filter - Only show for diesel tab */}
          {activeTab === 'diesel' && (
            <MultiSelectWithChips
              label="Property Types"
              options={propertyTypeOptions}
              selectedValues={selectedCompanyPropertyTypes}
              onChange={setSelectedCompanyPropertyTypes}
              placeholder="Property Types"
            />
          )}

          {/* Month Multi-Select Filter - Only show for diesel tab */}
          {activeTab === 'diesel' && (
            <MultiSelectWithChips
              label="Months"
              options={monthOptions}
              selectedValues={selectedMonths}
              onChange={setSelectedMonths}
              placeholder="All Months"
            />
          )}

          {/* Quarter Multi-Select Filter */}
          <MultiSelectWithChips
            label="Quarters"
            options={quarterOptions}
            selectedValues={selectedQuarters}
            onChange={setSelectedQuarters}
            placeholder="All Quarters"
          />

          {/* Year Range Filter - Keep as single select */}
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
          {(selectedCompanyIds.length > 0 || selectedQuarters.length > 0 || fromYear || toYear || 
            (activeTab === 'electricity' && selectedConsumptionSources.length > 0) ||
            (activeTab === 'diesel' && (selectedCompanyPropertyNames.length > 0 || selectedCompanyPropertyTypes.length > 0 || selectedMonths.length > 0))) && (
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
          gridTemplateColumns: activeTab === 'electricity' ? '1fr 1fr 1fr' : '1fr 1fr', 
          gap: '12px',
          marginBottom: '15px',
          flexShrink: 0
        }}>
          {activeTab === 'electricity' ? (
            <>
              <div style={{
                backgroundColor: '#3B82F6',
                color: 'white',
                padding: '15px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '3px' }}>
                  {loading ? 'Loading...' : electricityMetrics.total_consumption.toLocaleString()} {electricityMetrics.unit_of_measurement}
                </div>
                <div style={{ fontSize: '10px', opacity: 0.9, marginBottom: '6px' }}>
                  YEAR-ON-YEAR CUMULATIVE ELECTRICITY CONSUMPTION
                </div>
                <div style={{ fontSize: '8px', opacity: 0.8, fontWeight: '600' }}>
                  {getFilterDescription()}
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
                  {loading ? 'Loading...' : electricityMetrics.peak_consumption.toLocaleString()} {electricityMetrics.unit_of_measurement}
                </div>
                <div style={{ fontSize: '10px', opacity: 0.9, marginBottom: '6px' }}>
                  YEAR WITH HIGHEST ELECTRICITY CONSUMPTION
                </div>
                <div style={{ fontSize: '9px', opacity: 0.8 }}>
                  {electricityMetrics.peak_year || ''}
                </div>
                <div style={{ fontSize: '8px', opacity: 0.8, fontWeight: '600' }}>
                  {getFilterDescription()}
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
                  {loading ? 'Loading...' : electricityMetrics.average_consumption.toLocaleString()} {electricityMetrics.unit_of_measurement}
                </div>
                <div style={{ fontSize: '10px', opacity: 0.9, marginBottom: '6px' }}>
                  AVERAGE ANNUAL ELECTRICITY CONSUMPTION
                </div>
                <div style={{ fontSize: '8px', opacity: 0.8, fontWeight: '600' }}>
                  {getFilterDescription()}
                </div>
              </div>
            </>
          ) : (
            <>
              <div style={{
                backgroundColor: '#3B82F6',
                color: 'white',
                padding: '15px',
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '3px' }}>
                  {loading ? 'Loading...' : dieselMetrics.total_diesel_consumption.toLocaleString()} {dieselMetrics.unit_of_measurement}
                </div>
                <div style={{ fontSize: '10px', opacity: 0.9, marginBottom: '6px' }}>
                  YEAR-ON-YEAR CUMULATIVE DIESEL CONSUMPTION
                </div>
                <div style={{ fontSize: '8px', opacity: 0.8, fontWeight: '600' }}>
                  {getFilterDescription()}
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
                  {loading ? 'Loading...' : dieselMetrics.average_annual_consumption.toLocaleString()} {dieselMetrics.unit_of_measurement}
                </div>
                <div style={{ fontSize: '10px', opacity: 0.9, marginBottom: '6px' }}>
                  AVERAGE ANNUAL DIESEL CONSUMPTION
                </div>
                <div style={{ fontSize: '8px', opacity: 0.8, fontWeight: '600' }}>
                  {getFilterDescription()}
                </div>
              </div>
            </>
          )}
        </div>
            
        {/* Charts Section */}
        <div style={{ 
          flex: 1,
          display: 'grid', 
          gridTemplateColumns: activeTab === 'electricity' ? '1fr 1fr 1fr' : '1fr 1fr 1fr', // Diesel: 3 columns 
          gridTemplateRows: activeTab === 'electricity' ? 'auto' : '1fr 1fr', // Diesel: 2 rows to accommodate 6 charts
          gap: '15px',
          minHeight: 0
        }}>
          {/* Electricity charts (keep existing structure) */}
          {activeTab === 'electricity' && (
            <>
              {/* Pie Chart */}
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
                  Distribution of Electricity Consumption by Company
                </h3>

                {/* Debug info - remove this in production */}
                <div style={{ 
                  fontSize: '10px', 
                  color: '#64748b', 
                  marginBottom: '8px',
                  padding: '4px 8px',
                  backgroundColor: '#f1f5f9',
                  borderRadius: '4px'
                }}>
                  Debug: {currentData.pieData.length} items, Loading: {loading ? 'Yes' : 'No'}
                </div>

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

              {/* Second Column - Line Chart and Horizontal Bar Chart */}
              <div style={{ 
                display: 'flex',
                flexDirection: 'column',
                gap: '15px',
                minHeight: 0
              }}>
                {/* Line Chart */}
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
                    Electricity Consumption Over Years by Company
                  </h3>
                  
                  {/* Debug info - remove in production */}
                  <div style={{ 
                    fontSize: '10px', 
                    color: '#64748b', 
                    marginBottom: '8px',
                    padding: '4px 8px',
                    backgroundColor: '#f1f5f9',
                    borderRadius: '4px'
                  }}>
                    Debug: {currentData.lineChartData.length} data points, Loading: {loading ? 'Yes' : 'No'}
                  </div>
                  
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
                          <Tooltip 
                            formatter={(value, name) => [
                              `${Number(value).toLocaleString()} ${currentData.unit}`, 
                              name.toUpperCase()
                            ]}
                            labelStyle={{ color: '#1e293b', fontSize: '12px' }}
                            contentStyle={{ fontSize: '12px' }}
                          />
                          <Legend wrapperStyle={{ fontSize: '10px' }} />
                          
                          {/* Dynamically render lines based on available companies */}
                          {Object.keys(lineChartColors).map((companyId, index) => (
                            <Line 
                              key={companyId}
                              type="monotone" 
                              dataKey={companyId} 
                              stroke={lineChartColors[companyId] || COLORS[index % COLORS.length]} 
                              strokeWidth={2}
                              dot={{ fill: lineChartColors[companyId] || COLORS[index % COLORS.length], strokeWidth: 2, r: 3 }}
                              name={companyId}
                            />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                {/* Horizontal Bar Chart */}
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
                  <h3 style={{ 
                    fontSize: '13px', 
                    fontWeight: '600', 
                    marginBottom: '10px',
                    color: '#1e293b',
                    flexShrink: 0
                  }}>
                    Total Electricity Consumption per Company
                  </h3>
                  
                  <div style={{ flex: 1, minHeight: 0, padding: '10px' }}>
                    {loading ? (
                      <div>Loading...</div>
                    ) : currentData.barChartData.length === 0 ? (
                      <div>No data available</div>
                    ) : (
                      <div style={{ 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        justifyContent: 'space-around',
                        position: 'relative'
                      }}>
                        {currentData.barChartData.map((item, index) => {
                          const maxValue = Math.max(...currentData.barChartData.map(d => d.consumption));
                          const barWidth = (item.consumption / maxValue) * 80;
                          const percentage = ((item.consumption / currentData.barChartData.reduce((sum, d) => sum + d.consumption, 0)) * 100);
                          
                          return (
                            <div 
                              key={index} 
                              style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                marginBottom: '15px',
                                position: 'relative'
                              }}
                            >
                              <div style={{ 
                                width: '60px', 
                                fontSize: '11px', 
                                fontWeight: '500',
                                textAlign: 'right',
                                marginRight: '10px',
                                color: '#64748b'
                              }}>
                                {item.company}
                              </div>
                              <div style={{ flex: 1, position: 'relative' }}>
                                <div 
                                  style={{
                                    height: '25px',
                                    width: `${barWidth}%`,
                                    backgroundColor: item.color,
                                    borderRadius: '0 4px 4px 0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'flex-end',
                                    paddingRight: '8px',
                                    minWidth: '80px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    position: 'relative'
                                  }}
                                  onMouseEnter={() => setHoveredBar(index)}
                                  onMouseLeave={() => setHoveredBar(null)}
                                  title={`${item.company}: ${item.consumption.toLocaleString()} ${currentData.unit} (${percentage.toFixed(1)}%)`}
                                >
                                  <span style={{ 
                                    color: 'white', 
                                    fontSize: '9px', 
                                    fontWeight: '600',
                                    textShadow: '1px 1px 1px rgba(0,0,0,0.5)'
                                  }}>
                                    {(item.consumption / 1000000).toFixed(1)}M
                                  </span>

                                  {/* Inline tooltip that appears on hover */}
                                  {hoveredBar === index && (
                                    <div
                                      style={{
                                        position: 'absolute',
                                        left: '100%',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        marginLeft: '10px',
                                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                        color: 'white',
                                        padding: '6px 10px',
                                        borderRadius: '4px',
                                        fontSize: '11px',
                                        whiteSpace: 'nowrap',
                                        zIndex: 10,
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                      }}
                                    >
                                      <div style={{ fontWeight: 'bold' }}>
                                        {item.company}
                                      </div>
                                      <div>
                                        {item.consumption.toLocaleString()} {currentData.unit}
                                      </div>
                                      <div style={{ fontSize: '10px', opacity: 0.8 }}>
                                        {percentage.toFixed(1)}% of total
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Third Column - Source Chart and Quarterly Chart */}
              <div style={{ 
                display: 'flex',
                flexDirection: 'column',
                gap: '15px',
                minHeight: 0
              }}>
                {/* Total Electricity Consumption by Company and Source */}
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
                    Total Electricity Consumption by Company and Source
                  </h3>
                  
                  {/* Debug info - remove in production */}
                  <div style={{ 
                    fontSize: '10px', 
                    color: '#64748b', 
                    marginBottom: '8px',
                    padding: '4px 8px',
                    backgroundColor: '#f1f5f9',
                    borderRadius: '4px'
                  }}>
                    Debug: {currentData.companySourceData.length} companies, Sources: {Object.keys(sourceColors).join(', ')}
                  </div>
                  
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
                    ) : currentData.companySourceData.length === 0 ? (
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
                          <div>No source data available</div>
                          <div style={{ fontSize: '12px', marginTop: '4px' }}>
                            Try adjusting your filters
                          </div>
                        </div>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart 
                          data={currentData.companySourceData}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                          <XAxis 
                            dataKey="company"
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
                          <Tooltip 
                            formatter={(value, name) => [
                              `${Number(value).toLocaleString()} ${currentData.unit}`, 
                              name
                            ]}
                            labelStyle={{ color: '#1e293b', fontSize: '12px' }}
                            contentStyle={{ fontSize: '12px' }}
                          />
                          <Legend wrapperStyle={{ fontSize: '10px' }} />
                          
                          {/* Dynamically render bars for each source */}
                          {Object.keys(sourceColors).map((source, index) => (
                            <Bar 
                              key={source}
                              dataKey={source} 
                              stackId="a" 
                              fill={sourceColors[source] || COLORS[index % COLORS.length]}
                              name={source}
                              radius={index === Object.keys(sourceColors).length - 1 ? [3, 3, 0, 0] : [0, 0, 0, 0]}
                            />
                          ))}
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </div>

                {/* Electricity Consumption per Quarter */}
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
                    Electricity Consumption per Quarter - {fromYear && toYear ? `${fromYear}-${toYear}` : toYear || fromYear || 'All Years'}
                  </h3>
                  
                  {/* Debug info - remove in production */}
                  <div style={{ 
                    fontSize: '10px', 
                    color: '#64748b', 
                    marginBottom: '8px',
                    padding: '4px 8px',
                    backgroundColor: '#f1f5f9',
                    borderRadius: '4px'
                  }}>
                    Debug: {currentData.stackedBarData.length} quarters, Companies: {Object.keys(quarterCompanyColors).join(', ')}
                  </div>
                  
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
                    ) : currentData.stackedBarData.length === 0 ? (
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
                        <BarChart data={currentData.stackedBarData}>
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
                          <Legend wrapperStyle={{ fontSize: '10px' }} />
                          
                          {/* Dynamically render bars for each company */}
                          {Object.keys(quarterCompanyColors).map((company, index) => (
                            <Bar 
                              key={company}
                              dataKey={company} 
                              stackId="a" 
                              fill={quarterCompanyColors[company] || COLORS[index % COLORS.length]}
                              name={company}
                              radius={index === Object.keys(quarterCompanyColors).length - 1 ? [3, 3, 0, 0] : [0, 0, 0, 0]}
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

          {/* Diesel charts - 3 COLUMN x 2 ROW LAYOUT */}
          {activeTab === 'diesel' && (
            <>
              {/* Row 1 - Top 3 charts */}
              
              {/* Column 1 - Company Distribution Pie Chart */}
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
                  Distribution of Diesel Consumption by Company
                </h3>
                {/* Debug info - remove in production */}
                  <div style={{ 
                    fontSize: '10px', 
                    color: '#64748b', 
                    marginBottom: '8px',
                    padding: '4px 8px',
                    backgroundColor: '#f1f5f9',
                    borderRadius: '4px'
                  }}>
                    Debug: {currentData.pieData.length} items, Loading: {loading ? 'Yes' : 'No'}
                  </div>

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
                          <div>No diesel data available</div>
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
                              outerRadius={100}
                              innerRadius={35}
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
                              {entry.label}: {(entry.value || 0).toLocaleString()} L
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
              </div>

              {/* Column 2 - Property Type Horizontal Bar Chart */}
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
                  Diesel Consumption by Property Type
                </h3>

                {/* Debug info - remove in production */}
                <div style={{ 
                  fontSize: '10px', 
                  color: '#64748b', 
                  marginBottom: '8px',
                  padding: '4px 8px',
                  backgroundColor: '#f1f5f9',
                  borderRadius: '4px'
                }}>
                  Debug: {currentData.propertyTypeData ? currentData.propertyTypeData.length : 0} types, Loading: {loading ? 'Yes' : 'No'}
                </div>

                <div style={{ flex: 1, minHeight: 0, padding: '10px' }}>
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
                  ) : (!currentData.propertyTypeData || currentData.propertyTypeData.length === 0) ? (
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
                        <div>No property type data available</div>
                        <div style={{ fontSize: '12px', marginTop: '4px' }}>
                          Try adjusting your filters
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      justifyContent: 'space-around',
                      position: 'relative'
                    }}>
                      {currentData.propertyTypeData.map((item, index) => {
                        const maxValue = Math.max(...currentData.propertyTypeData.map(d => d.value));
                        const barWidth = (item.value / maxValue) * 80;
                        const percentage = ((item.value / currentData.propertyTypeData.reduce((sum, d) => sum + d.value, 0)) * 100);
                        
                        return (
                          <div 
                            key={index} 
                            style={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              marginBottom: '15px',
                              position: 'relative'
                            }}
                          >
                            <div style={{ 
                              width: '80px', 
                              fontSize: '11px', 
                              fontWeight: '500',
                              textAlign: 'right',
                              marginRight: '10px',
                              color: '#64748b'
                            }}>
                              {item.label}
                            </div>
                            <div style={{ flex: 1, position: 'relative' }}>
                              <div 
                                style={{
                                  height: '25px',
                                  width: `${barWidth}%`,
                                  backgroundColor: item.color,
                                  borderRadius: '0 4px 4px 0',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'flex-end',
                                  paddingRight: '8px',
                                  minWidth: '80px',
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease',
                                  position: 'relative'
                                }}
                                onMouseEnter={() => setHoveredPropertyTypeBar(index)}
                                onMouseLeave={() => setHoveredPropertyTypeBar(null)}
                                title={`${item.label}: ${item.value.toLocaleString()} L (${percentage.toFixed(1)}%)`}
                              >
                                <span style={{ 
                                  color: 'white', 
                                  fontSize: '9px', 
                                  fontWeight: '600',
                                  textShadow: '1px 1px 1px rgba(0,0,0,0.5)'
                                }}>
                                  {item.value >= 1000 ? `${(item.value / 1000).toFixed(1)}K` : item.value.toFixed(0)} L
                                </span>

                                {/* Inline tooltip that appears on hover */}
                                {hoveredPropertyTypeBar === index && (
                                  <div
                                    style={{
                                      position: 'absolute',
                                      left: '100%',
                                      top: '50%',
                                      transform: 'translateY(-50%)',
                                      marginLeft: '10px',
                                      backgroundColor: 'rgba(0, 0, 0, 0.8)',
                                      color: 'white',
                                      padding: '6px 10px',
                                      borderRadius: '4px',
                                      fontSize: '11px',
                                      whiteSpace: 'nowrap',
                                      zIndex: 10,
                                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                    }}
                                  >
                                    <div style={{ fontWeight: 'bold' }}>
                                      {item.label}
                                    </div>
                                    <div>
                                      {item.value.toLocaleString()} L
                                    </div>
                                    <div style={{ fontSize: '10px', opacity: 0.8 }}>
                                      {percentage.toFixed(1)}% of total
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Column 3 - Line Chart (Consumption Over Time) */}
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
                  Diesel Consumption Over Time - PSC
                </h3>
                {/* Debug info - remove in production */}
                  <div style={{ 
                    fontSize: '10px', 
                    color: '#64748b', 
                    marginBottom: '8px',
                    padding: '4px 8px',
                    backgroundColor: '#f1f5f9',
                    borderRadius: '4px'
                  }}>
                    Debug: {currentData.lineChartData.length} data points, Properties: {Object.keys(dieselLineColors).join(', ')}, Loading: {loading ? 'Yes' : 'No'}
                  </div>

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
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
                    ) : currentData.lineChartData.length === 0 ? (
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
                          <div style={{ fontSize: '24px', marginBottom: '8px' }}>📈</div>
                          <div>No line chart data available</div>
                          <div style={{ fontSize: '12px', marginTop: '4px' }}>
                            Try adjusting your filters
                          </div>
                        </div>
                      </div>
                    ) : (
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
                              if (value >= 1000) {
                                return `${(value / 1000).toFixed(1)}K`;
                              } else {
                                return value.toString();
                              }
                            }}
                          />
                          <Tooltip 
                            formatter={(value, name) => [
                              `${Number(value).toLocaleString()} ${currentData.unit}`, 
                              name
                            ]}
                            labelStyle={{ color: '#1e293b', fontSize: '12px' }}
                            contentStyle={{ fontSize: '12px' }}
                          />
                          <Legend wrapperStyle={{ fontSize: '10px' }} />
                          
                          {/* Dynamically render lines for each property */}
                          {Object.keys(dieselLineColors).map((property, index) => (
                            <Line 
                              key={property}
                              type="monotone" 
                              dataKey={property} 
                              stroke={dieselLineColors[property] || COLORS[index % COLORS.length]} 
                              strokeWidth={2}
                              dot={{ fill: dieselLineColors[property] || COLORS[index % COLORS.length], strokeWidth: 2, r: 3 }}
                              name={property}
                              connectNulls={false}
                            />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
              </div>

              {/* Row 2 - Bottom 3 charts */}
              
              {/* Column 1 - Property Distribution Pie Chart */}
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
                  Diesel Consumption by Property
                </h3>
                {/* Debug info - remove in production */}
                  <div style={{ 
                    fontSize: '10px', 
                    color: '#64748b', 
                    marginBottom: '8px',
                    padding: '4px 8px',
                    backgroundColor: '#f1f5f9',
                    borderRadius: '4px'
                  }}>
                    Debug: {currentData.propertyPieData ? currentData.propertyPieData.length : 0} properties, Loading: {loading ? 'Yes' : 'No'}
                  </div>

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
                    ) : (!currentData.propertyPieData || currentData.propertyPieData.length === 0) ? (
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
                          <div style={{ fontSize: '24px', marginBottom: '8px' }}>🥧</div>
                          <div>No property data available</div>
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
                              data={currentData.propertyPieData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={100}
                              innerRadius={35}
                              fill="#8884d8"
                              dataKey="value"
                              paddingAngle={2}
                              startAngle={90}
                              endAngle={450}
                            >
                              {currentData.propertyPieData.map((entry, index) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={entry.color || COLORS[index % COLORS.length]} 
                                />
                              ))}
                            </Pie>
                            <Tooltip content={renderDieselPropertyTooltip} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    )}

                    {/* Legend - only show if there's data */}
                    {!loading && currentData.propertyPieData && currentData.propertyPieData.length > 0 && (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        flexWrap: 'wrap',
                        gap: '8px',
                        fontSize: '10px',
                        flexShrink: 0,
                        marginTop: '8px'
                      }}>
                        {currentData.propertyPieData.map((entry, index) => {
                          // Extract property name from formatted label (before newline)
                          const propertyName = entry.label.split('\n')[0];
                          return (
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
                                {propertyName}: {(entry.value || 0).toLocaleString()} L
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
              </div>

              {/* Column 2 - Quarterly Stacked Bar Chart */}
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
                  PSC: Diesel Consumption - {fromYear && toYear ? `${fromYear}-${toYear}` : toYear || fromYear || 'All Years'}
                </h3>

                {/* Debug info - remove in production */}
                <div style={{ 
                  fontSize: '10px', 
                  color: '#64748b', 
                  marginBottom: '8px',
                  padding: '4px 8px',
                  backgroundColor: '#f1f5f9',
                  borderRadius: '4px'
                }}>
                  Debug: {currentData.quarterlyBarData ? currentData.quarterlyBarData.length : 0} quarters, Properties: {Object.keys(dieselQuarterlyBarColors).join(', ')}, Loading: {loading ? 'Yes' : 'No'}
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
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
                  ) : (!currentData.quarterlyBarData || currentData.quarterlyBarData.length === 0) ? (
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
                        <div>No quarterly data available</div>
                        <div style={{ fontSize: '12px', marginTop: '4px' }}>
                          Try adjusting your filters
                        </div>
                      </div>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={currentData.quarterlyBarData}>
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
                            if (value >= 1000) {
                              return `${(value / 1000).toFixed(1)}K`;
                            } else {
                              return value.toString();
                            }
                          }}
                        />
                        <Tooltip 
                          formatter={(value, name) => [
                            `${Number(value).toLocaleString()} ${currentData.unit}`, 
                            name
                          ]}
                          labelStyle={{ color: '#1e293b', fontSize: '12px' }}
                          contentStyle={{ fontSize: '12px' }}
                        />
                        <Legend wrapperStyle={{ fontSize: '10px' }} />
                        
                        {/* Dynamically render bars for each property */}
                        {Object.keys(dieselQuarterlyBarColors).map((property, index) => (
                          <Bar 
                            key={property}
                            dataKey={property} 
                            stackId="a" 
                            fill={dieselQuarterlyBarColors[property] || COLORS[index % COLORS.length]}
                            name={property}
                            radius={index === Object.keys(dieselQuarterlyBarColors).length - 1 ? [3, 3, 0, 0] : [0, 0, 0, 0]}
                          />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>

              {/* Column 3 - Monthly Property Line Chart */}
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
                  Diesel Consumption by Property ({fromYear && toYear ? `${fromYear}-${toYear}` : toYear || fromYear || 'All Years'})
                </h3>

                {/* Debug info - remove in production */}
                <div style={{ 
                  fontSize: '10px', 
                  color: '#64748b', 
                  marginBottom: '8px',
                  padding: '4px 8px',
                  backgroundColor: '#f1f5f9',
                  borderRadius: '4px'
                }}>
                  Debug: {currentData.monthlyLineData ? currentData.monthlyLineData.length : 0} data points, Properties: {Object.keys(dieselMonthlyLineColors).join(', ')}, Loading: {loading ? 'Yes' : 'No'}
                </div>

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
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
                  ) : (!currentData.monthlyLineData || currentData.monthlyLineData.length === 0) ? (
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
                        <div style={{ fontSize: '24px', marginBottom: '8px' }}>📈</div>
                        <div>No monthly data available</div>
                        <div style={{ fontSize: '12px', marginTop: '4px' }}>
                          Try adjusting your filters
                        </div>
                      </div>
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={currentData.monthlyLineData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="month" 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 8, fill: '#64748b' }}
                          angle={-45}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis 
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 10, fill: '#64748b' }}
                          tickFormatter={(value) => {
                            if (value >= 1000) {
                              return `${(value / 1000).toFixed(1)}K`;
                            } else {
                              return value.toString();
                            }
                          }}
                        />
                        <Tooltip 
                          formatter={(value, name) => [
                            `${Number(value).toLocaleString()} ${currentData.unit}`, 
                            name
                          ]}
                          labelStyle={{ color: '#1e293b', fontSize: '12px' }}
                          contentStyle={{ fontSize: '12px' }}
                        />
                        <Legend wrapperStyle={{ fontSize: '10px' }} />
                        
                        {/* Dynamically render lines for each property */}
                        {Object.keys(dieselMonthlyLineColors).map((property, index) => (
                          <Line 
                            key={property}
                            type="monotone" 
                            dataKey={property} 
                            stroke={dieselMonthlyLineColors[property] || COLORS[index % COLORS.length]} 
                            strokeWidth={2}
                            dot={{ fill: dieselMonthlyLineColors[property] || COLORS[index % COLORS.length], strokeWidth: 2, r: 3 }}
                            name={property}
                            connectNulls={false}
                          />
                        ))}
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default EnvironmentEnergyDash;