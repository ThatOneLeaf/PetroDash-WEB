import React, { useState, useEffect } from "react";
import {
  Box,
  Stack,
  Typography,
  Grid,
  Paper,
    Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  useTheme,
  useMediaQuery,
} from "@mui/material";

import CircularProgress from '@mui/material/CircularProgress';

import ZoomModal from "../../components/DashboardComponents/ZoomModal";
import { getPowerPlantColors } from "../../utils/colorFromCompany";

import SideBar from "../../components/Sidebar";
import DashboardHeader from "../../components/DashboardComponents/DashboardHeader";
import RefreshButton from "../../components/DashboardComponents/RefreshButton";
import TabButtons from "../../components/DashboardComponents/TabButtons";
import MultiSelectWithChips from "../../components/DashboardComponents/MultiSelectDropdown";
import MonthRangeSelect from "../../components/DashboardComponents/MonthRangeSelect";
import { format } from "date-fns";
import api from "../../services/api";
import SingleSelectDropdown from "../../components/DashboardComponents/SingleSelectDropdown";
import ClearButton from "../../components/DashboardComponents/ClearButton";
import KPICard from "../../components/DashboardComponents/KPICard";
import BarChartComponent from "../../components/charts/BarChartComponent";
import LineChartComponent from "../../components/charts/LineChartComponent";
import PieChartComponent from "../../components/charts/PieChartComponent";
import StackedBarChartComponent from "../../components/charts/StackedBarChartComponent";


import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import ElectricCarIcon from '@mui/icons-material/ElectricCar';
import MapIcon from '@mui/icons-material/Map';
import LocalGasStationIcon from '@mui/icons-material/LocalGasStation';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import FactoryIcon from '@mui/icons-material/Factory';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import RecyclingIcon from '@mui/icons-material/Recycling';
import DeleteIcon from '@mui/icons-material/Delete';
import LocalMallIcon from '@mui/icons-material/LocalMall';
import WindPowerIcon from '@mui/icons-material/WindPower';
import ForestIcon from '@mui/icons-material/Forest';
import VerticalStackedBarChartComponent from "../../components/charts/VerticalStackedBar";
import HorizontalGroupedBarChartComponent from "../../components/charts/HorizontalGrouped";
import { useAuth } from "../../contexts/AuthContext";
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import dayjs from "dayjs";

// Utils
const formatDateTime = (date) => format(date, "PPPpp");

const getUniqueOptions = (data, idField, nameField) => {
  const seen = new Set();
  return data
    .filter((item) => {
      const id = String(item[idField]);
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    })
    .map((item) => {
      let label = item[nameField];
      if (label === label.toLowerCase()) {
        const [firstWord, ...rest] = label.split(' ');
        label = [firstWord.charAt(0).toUpperCase() + firstWord.slice(1), ...rest].join(' ');
      }
      return {
        value: item[idField],
        label,
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label));
};

const tabs = [
  { key: "generation", label: "Power Generation" },
  { key: "avoidance", label: "CO2 Avoidance" },
];
  const iconMap = {
  EQ_1: DirectionsCarIcon ,
  EQ_2: ElectricCarIcon ,
  EQ_3: MapIcon ,
  EQ_4: LocalGasStationIcon ,
  EQ_5: LocalShippingIcon ,
  EQ_6: FactoryIcon ,
  EQ_7: SmartphoneIcon ,
  EQ_8: RecyclingIcon ,
  EQ_9: DeleteIcon ,
  EQ_10:LocalMallIcon ,
  EQ_11:WindPowerIcon ,
  EQ_12:ForestIcon ,
};

const colorSchemes = {
  'greenhouse gas emissions': {
    backgroundColor: '#8E44AD', // Purple (red-violet)
    textColor: '#FFFFFF',
    iconColor: '#FFFFFF',
  },
  'CO2 emissions': {
    backgroundColor: '#D35400', // Burnt orange (red-orange)
    textColor: '#FFFFFF',
    iconColor: '#FFFFFF',
  },
  'greenhouse gas emissions avoided': {
    backgroundColor: '#16A085', // Teal (blue-green)
    textColor: '#FFFFFF',
    iconColor: '#FFFFFF',
  },
  'carbon sequestered': {
    backgroundColor: '#27AE60', // Green (yellow-greenish)
    textColor: '#FFFFFF',
    iconColor: '#FFFFFF',
  },
  default: {
    backgroundColor: '#7F8C8D', // Muted cyan-gray (neutral fallback)
    textColor: '#FFFFFF',
    iconColor: '#FFFFFF',
  },
};

function roundUpToNiceNumber(num) {
  if (num >= 1000) {
    return Math.ceil(num / 1000) * 1000;
  } else if (num >= 100) {
    return Math.ceil(num / 100) * 100;
  } else {
    return Math.ceil(num / 10) * 10;
  }
}

// Utility to fill missing periods with zero values for stacked bar charting
function fillMissingPeriods(dataArray, startDate, endDate, timeInterval = 'monthly', keyName = 'period', valueKeys = []) {
  const periods = [];
  
  if (timeInterval === 'quarterly') {
    // Generate quarters (2024-Q1, 2024-Q2, etc.)
    const startYear = startDate.getFullYear();
    const endYear = endDate.getFullYear();
    const startQuarter = Math.ceil((startDate.getMonth() + 1) / 3);
    const endQuarter = Math.ceil((endDate.getMonth() + 1) / 3);
    
    for (let year = startYear; year <= endYear; year++) {
      const firstQ = year === startYear ? startQuarter : 1;
      const lastQ = year === endYear ? endQuarter : 4;
      for (let q = firstQ; q <= lastQ; q++) {
        periods.push(`${year}-Q${q}`);
      }
    }
  } else if (timeInterval === 'yearly') {
    // Generate years (2024, 2025, etc.)
    const startYear = startDate.getFullYear();
    const endYear = endDate.getFullYear();
    
    for (let year = startYear; year <= endYear; year++) {
      periods.push(year.toString());
    }
  } else {
    // Monthly (default behavior)
    let current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
    while (current <= end) {
      periods.push(`${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`);
      current.setMonth(current.getMonth() + 1);
    }
  }
  
  if (valueKeys.length === 0 && dataArray.length > 0) {
    valueKeys = Object.keys(dataArray[0]).filter(k => k !== keyName);
  }
  const allValueKeys = new Set(valueKeys);
  dataArray.forEach(item => {
    Object.keys(item).forEach(k => {
      if (k !== keyName) allValueKeys.add(k);
    });
  });
  const allKeysArr = Array.from(allValueKeys);
  const dataMap = {};
  dataArray.forEach(item => {
    dataMap[item[keyName]] = item;
  });
  return periods.map(period => {
    if (dataMap[period]) {
      const filled = { ...dataMap[period] };
      allKeysArr.forEach(k => {
        if (!(k in filled)) filled[k] = 0;
      });
      return filled;
    }
    const zeroObj = { [keyName]: period };
    allKeysArr.forEach(k => {
      zeroObj[k] = 0;
    });
    return zeroObj;
  });
}

// Helper for line chart series: fills missing periods for each series
function fillLineSeriesWithZeroes(seriesArray, startDate, endDate, timeInterval = 'monthly') {
  if (!Array.isArray(seriesArray)) return [];
  
  const periods = [];
  
  if (timeInterval === 'quarterly') {
    // Generate quarters (2024-Q1, 2024-Q2, etc.)
    const startYear = startDate.getFullYear();
    const endYear = endDate.getFullYear();
    const startQuarter = Math.ceil((startDate.getMonth() + 1) / 3);
    const endQuarter = Math.ceil((endDate.getMonth() + 1) / 3);
    
    for (let year = startYear; year <= endYear; year++) {
      const firstQ = year === startYear ? startQuarter : 1;
      const lastQ = year === endYear ? endQuarter : 4;
      for (let q = firstQ; q <= lastQ; q++) {
        periods.push(`${year}-Q${q}`);
      }
    }
  } else if (timeInterval === 'yearly') {
    // Generate years (2024, 2025, etc.)
    const startYear = startDate.getFullYear();
    const endYear = endDate.getFullYear();
    
    for (let year = startYear; year <= endYear; year++) {
      periods.push(year.toString());
    }
  } else {
    // Monthly (default behavior)
    let current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
    while (current <= end) {
      periods.push(`${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`);
      current.setMonth(current.getMonth() + 1);
    }
  }
  
  return seriesArray.map(series => {
    const dataMap = {};
    (series.data || []).forEach(d => { dataMap[d.x] = d.y; });
    return {
      ...series,
      data: periods.map(period => ({ x: period, y: dataMap[period] !== undefined ? dataMap[period] : 0 }))
    };
  });
}








function PowerDashboard() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  const [lastUpdated, setLastUpdated] = useState(new Date());


  const [zoomModal, setZoomModal] = useState({
    open: false,
    title: '',
    fileName: '',
    chartConfig: null,
  });

  const openZoomModal = (title, fileName, chartConfig) => {
    setZoomModal({ open: true, title, fileName, chartConfig });
  };


  const [activeTab, setActiveTab] = useState("generation");
  const [data, setData] = useState({});
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [plantColors, setPlantColors] = useState({});
  const [generationSourceColors, setGenerationSourceColors] = useState({});


  // Filter values
  const [y, setY] = useState('monthly');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [companyFilter, setCompanyFilter] = useState([]);
  const [powerPlantFilter, setPowerPlantFilter] = useState([]);
  const [generationSourceFilter, setGenerationSourceFilter] = useState([]);
  const [provinceFilter, setProvinceFilter] = useState([]);
  const [x, setX] = useState('power_plant_id');
  const [filters, setFilters] = useState({
    company: '',
    powerPlant: '',
    generationSource: '',
    province: '',
  });
  

  // Options
  const [companyOptions, setCompanyOptions] = useState([]);
  const [powerPlantOptions, setPowerPlantOptions] = useState([]);
  const [generationSourceOptions, setGenerationSourceOptions] = useState([]);
  const [provinceOptions, setProvinceOptions] = useState([]);
  const [plantMetadata, setPlantMetadata] = useState([]);
  const [equivalenceData, setEquivalenceData] = useState({});
  const [housePowerData, setHousePowerData] = useState({});
  const [staticData, setStaticData] = useState({});  const { getUserRole } = useAuth();
  const {getUserCompanyId} = useAuth();
  const{getUserPowerPlantId}=useAuth();
  const role = getUserRole();
  const companyId = getUserCompanyId();
  const powerPlantId = getUserPowerPlantId();

  const chartReady =
  Object.keys(plantColors).length > 0 &&
  plantMetadata.length > 0 &&
  Object.keys(generationSourceColors).length > 0;

  

  const generateFullChartTitle = (baseTitle, xField, yField, filters, startDate, endDate) => {
    const xLabelMap = {
      power_plant_id: "Power Plant",
      company_id: "Company",
      generation_source: "Generation Source",
    };

    const yLabelMap = {
      monthly: "Monthly",
      quarterly: "Quarterly",
      yearly: "Yearly",
    };

    const parts = [];

    if (startDate && endDate) {
      // Defensive: ensure startDate/endDate are Date objects
      const start = format(startDate instanceof Date ? startDate : new Date(startDate), 'MMM yyyy');
      const end = format(endDate instanceof Date ? endDate : new Date(endDate), 'MMM yyyy');
      parts.push(`Period: ${start} - ${end}`);
    }

    const groupBy = xLabelMap[xField] || xField;
    const timeLabel = yLabelMap[yField] || yField;

    const filterSuffix = parts.length ? ` | ${parts.join(' | ')}` : '';

    return `${baseTitle} by ${groupBy} (${timeLabel})${filterSuffix}`;
};



const getColorMapForGroupBy = (
  groupByKey,
  dataItems,
  plantColors,
  plantMetadata,
  generationSourceColors
) => {
  const colorMap = {};

  dataItems.forEach((item) => {
    const rawKey = item.name; // <-- use `name` field instead of `item[groupByKey]`

    if (!rawKey) return;

    const key = typeof rawKey === 'string' ? rawKey.trim().toUpperCase() : rawKey;

    if (groupByKey === 'power_plant_id') {
      colorMap[key] = plantColors[key] || '#CBD5E1';
    } else if (groupByKey === 'company_id') {
      const match = plantMetadata.find(
        (entry) => entry.company_id.toUpperCase() === key
      );
      colorMap[key] = match?.color || '#A5B4FC';
    } else if (groupByKey === 'generation_source') {
      colorMap[key.toLowerCase()] = generationSourceColors[key.toLowerCase()] || '#D1FAE5';
    } else {
      colorMap[key] = '#E5E7EB';
    }
  });


  

  return colorMap;
};




const fetchData = async () => {
  setLoading(true);
  setData({});
  setFilteredData([]);

  try {
    const params = { x, y };

    if (role === 'R04' && companyId) {
      params.p_company_id = companyId;
    } else if (filters.company) {
      params.p_company_id = filters.company;
    }
    if (filters.powerPlant) params.p_power_plant_id = filters.powerPlant;
    if (filters.generationSource) params.p_generation_source = filters.generationSource;
    if (filters.province) params.p_province = filters.province;

    const isValidDate = (d) => {
      if (!d) return false;
      if (typeof d === "string") return d.trim() !== "" && !isNaN(new Date(d).getTime());
      if (d instanceof Date) return !isNaN(d.getTime());
      return false;
    };

    if (isValidDate(startDate)) {
      const start = new Date(startDate);
      const end = isValidDate(endDate) ? new Date(endDate) : new Date();

      params.p_date_from = start.toISOString().split("T")[0];
      params.p_date_to = end.toISOString().split("T")[0];
    }

    const query = new URLSearchParams(params).toString();
    const response = await api.get(`/energy/energy_dashboard?${query}`);

    const raw = response?.data;
    const energyData = raw?.energy_data || {};
    const rawData = energyData?.results || [];    setData(energyData);
    console.log("Raw Data:", raw); // Log the raw data for debugging
    setFilteredData(rawData);
    setEquivalenceData(raw?.equivalence_data || {});
    setHousePowerData(raw?.house_powered || {});
    setStaticData(raw?.formula || {});

    const updatedTime = new Date();
    setLastUpdated(updatedTime);  // ✅ Update the last updated time here
    
  } catch (error) {
    console.error("Error fetching data:", error);
    setData({});
    setFilteredData([]);
  } finally {
    setLoading(false);
  }
};


  const handleRefresh = () => {
    fetchData();
  };

  // Track if user has manually changed any filter
  const [userChangedFilters, setUserChangedFilters] = useState(false);

  // Set default date range based on y (time interval) on first load or y change, unless user changed filters
  useEffect(() => {
    if (!userChangedFilters) {
      const today = new Date();
      let newStartDate = null;
      let newEndDate = today;

      if (y === "monthly") {
        // 12 months ago from today (start of month)
        newStartDate = new Date(today.getFullYear(), today.getMonth() - 6, 1);
      } else if (y === "quarterly") {
        // 4 quarters ago (start of quarter)
        const startMonth = today.getMonth() - (2 * 4); // 3 months per quarter * 3 = 9 months ago
        newStartDate = new Date(today.getFullYear(), startMonth, 1);
      } else if (y === "yearly") {
        // 5 years ago (start of year)
        newStartDate = new Date(today.getFullYear() - 3, 0, 1);
      }

      // Always store as Date objects
      setStartDate(newStartDate instanceof Date ? newStartDate : null);
      setEndDate(newEndDate instanceof Date ? newEndDate : null);
    }
    // Only run when y changes or on first mount
    // eslint-disable-next-line
  }, [y]);

  // Handler wrappers to detect manual filter changes
  const handleCompanyFilter = (val) => {
    setUserChangedFilters(true);
    setCompanyFilter(val);
  };
  const handlePowerPlantFilter = (val) => {
    setUserChangedFilters(true);
    setPowerPlantFilter(val);
  };
  const handleGenerationSourceFilter = (val) => {
    setUserChangedFilters(true);
    setGenerationSourceFilter(val);
  };
  const handleProvinceFilter = (val) => {
    setUserChangedFilters(true);
    setProvinceFilter(val);
  };
  const handleStartDate = (val) => {
    setUserChangedFilters(true);
    // Defensive: always convert to Date if not null
    setStartDate(val ? new Date(val) : null);
  };
  const handleEndDate = (val) => {
    setUserChangedFilters(true);
    setEndDate(val ? new Date(val) : null);
  };
  // Reset userChangedFilters when clearing all
const clearAllFilters = () => {
  setCompanyFilter([]);
  setPowerPlantFilter([]);
  setGenerationSourceFilter([]);
  setProvinceFilter([]);
  setStartDate(null);
  setEndDate(null);
  setUserChangedFilters(false);
};
useEffect(() => {
  const loadColors = async () => {
    const colors = await getPowerPlantColors();
    setPlantColors(colors);
  };

  loadColors();
}, []);


  useEffect(() => {


    const fetchFilterData = async () => {
      try {
        const res = await api.get("/reference/pp_info");
        const data = res.data;
        setPlantMetadata(data);

        const u = getUniqueOptions;

        setCompanyOptions(u(data, "company_id", "company_name"));
        setPowerPlantOptions(u(data, "power_plant_id", "power_plant_id"));
        setGenerationSourceOptions(u(data, "generation_source", "generation_source"));
        setProvinceOptions(u(data, "province", "province"));

          const uniqueSources = [...new Set(data.map(d => d.generation_source).filter(Boolean))];

        // Generate a color for each generation source
        const palette = [
          '#FBBF24', '#34D399', '#60A5FA', '#A78BFA', '#F97316',
          '#6B7280', '#059669', '#EF4444', '#10B981', '#8B5CF6',
          '#F43F5E', '#22D3EE', '#4ADE80', '#EAB308', '#3B82F6',
        ];

        const sourceColors = {};
        uniqueSources.forEach((source, index) => {
          sourceColors[source.toLowerCase()] = palette[index % palette.length];
        });

        setGenerationSourceColors(sourceColors);
      } catch (err) {
        console.error("Error loading filters", err);
      }
    };

    fetchFilterData();
  }, []);


// Compute filtered power plant and generation source options based on selected company
const filteredPowerPlantOptions = React.useMemo(() => {
  if (role === 'R04' && companyId && plantMetadata.length > 0) {
    return plantMetadata
      .filter(item => item.company_id === companyId)
      .map(item => ({ value: item.power_plant_id, label: item.power_plant_id }));
  }
  if (companyFilter.length > 0 && plantMetadata.length > 0) {
    // companyFilter is an array of selected company IDs
    return plantMetadata
      .filter(item => companyFilter.includes(item.company_id))
      .map(item => ({ value: item.power_plant_id, label: item.power_plant_id }));
  }
  return powerPlantOptions;
}, [role, companyId, plantMetadata, powerPlantOptions, companyFilter]);

const filteredGenerationSourceOptions = React.useMemo(() => {
  if (companyFilter.length > 0 && plantMetadata.length > 0) {
    // Only show generation sources for selected companies
    const sources = plantMetadata
      .filter(item => companyFilter.includes(item.company_id))
      .map(item => item.generation_source)
      .filter(Boolean);
    const uniqueSources = Array.from(new Set(sources));
    return uniqueSources.map(source => ({ value: source, label: source }));
  }
  return generationSourceOptions;
}, [companyFilter, plantMetadata, generationSourceOptions]);

// When companyFilter changes, update powerPlantFilter and generationSourceFilter if their values are no longer valid
useEffect(() => {
  // Only run if not R04 (R04 is handled by filteredPowerPlantOptions)
  if (role === 'R04') return;
  // Power Plant
  const validPowerPlantValues = filteredPowerPlantOptions.map(opt => opt.value);
  if (powerPlantFilter.some(val => !validPowerPlantValues.includes(val))) {
    setPowerPlantFilter(powerPlantFilter.filter(val => validPowerPlantValues.includes(val)));
  }
  // Generation Source
  const validGenSourceValues = filteredGenerationSourceOptions.map(opt => opt.value);
  if (generationSourceFilter.some(val => !validGenSourceValues.includes(val))) {
    setGenerationSourceFilter(generationSourceFilter.filter(val => validGenSourceValues.includes(val)));
  }
}, [companyFilter, filteredPowerPlantOptions, filteredGenerationSourceOptions, powerPlantFilter, generationSourceFilter, role]);

// Sync multi-select filter arrays into the filters object
useEffect(() => {
  const newFilters = {
    company: companyFilter,
    powerPlant: powerPlantFilter,
    generationSource: generationSourceFilter,
    province: provinceFilter,
  };

  const syncedFilters = Object.fromEntries(
    Object.entries(newFilters).map(([key, arr]) => [key, arr.length > 0 ? arr.join(",") : ""])
  );

  setFilters(syncedFilters);
}, [companyFilter, powerPlantFilter, generationSourceFilter, provinceFilter]);

useEffect(() => {
  fetchData();
}, [x, y, filters, startDate, endDate]);

  const xOptions = [
    { label: "Power Plant", value: "power_plant_id" },
    { label: "Company", value: "company_id" },
    { label: "Generation Source", value: "generation_source" }
  ];

  const yOptions = [
    { label: "Monthly", value: "monthly" },
    { label: "Quarterly", value: "quarterly" },
    { label: "Yearly", value: "yearly" },
  ];

  const showClearButton =
    companyFilter.length > 0 ||
    powerPlantFilter.length > 0 ||
    generationSourceFilter.length > 0 ||
    provinceFilter.length > 0 ||
    startDate !== null ||
    endDate !== null;

  const categoryHeadings = {
  'greenhouse gas emissions': 'This is equivalent to greenhouse gas emissions from:',
  'CO2 emissions': 'This is equivalent to CO2 emissions from:',
  'greenhouse gas emissions avoided': 'This is equivalent to greenhouse gas emissions avoided by:',
  'carbon sequestered': 'This is equivalent to carbon sequestered by:',
};


if (loading) {
  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      {/* Sidebar (fixed width) */}
      <Box sx={{ width: 240, flexShrink: 0 }}>
        <SideBar />
      </Box>

      {/* Main content area with centered loader */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          overflow: "auto",
          padding: "2rem",
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress size={64} thickness={5} sx={{ color: "#182959" }} />
          <Typography
            sx={{
              mt: 2,
              color: "#182959",
              fontWeight: 700,
              fontSize: 20,
            }}
          >
            Loading Energy Dashboard...
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

  // Compute filled chart data for all periods in range (define before return!)
  const filledLineData = (startDate && endDate && data?.line_graph?.total_energy_generated?.length > 0)
    ? fillLineSeriesWithZeroes(data.line_graph.total_energy_generated, new Date(startDate), new Date(endDate), y)
    : (data?.line_graph?.total_energy_generated || []);
  const filledCo2Data = (startDate && endDate && data?.line_graph?.total_co2_avoidance?.length > 0)
    ? fillLineSeriesWithZeroes(data.line_graph.total_co2_avoidance, new Date(startDate), new Date(endDate), y)
    : (data?.line_graph?.total_co2_avoidance || []);
  const filledStackedBarData = (startDate && endDate && data?.stacked_bar?.length > 0)
    ? fillMissingPeriods(data.stacked_bar, new Date(startDate), new Date(endDate), y, 'period')
    : (data?.stacked_bar || []);
  const filledHousePowerStackedBar = (startDate && endDate && housePowerData?.stacked_bar?.length > 0)
    ? fillMissingPeriods(housePowerData.stacked_bar, new Date(startDate), new Date(endDate), y, 'period')
    : (housePowerData?.stacked_bar || []);

return (
  <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
    <SideBar />

    <Box sx={{ flex: 1, overflow: 'hidden', position: 'relative' }}>

    <Box sx={{ 
      flex: 1, 
      display: 'flex', 
      flexDirection: 'column', 
      overflow: 'hidden',
      width: isMobile ? '100%' : '111.11%',
      height: isMobile ? '100%' : '111.11%', 
      transform: isMobile ? "scale(0.7)" : isTablet ? "scale(0.8)" : "scale(0.9)",  
      transformOrigin: 'top left'
    }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        px: isMobile ? 1 : 2, 
        pt: isMobile ? 1 : 2, 
        flexShrink: 0,
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? 1 : 0,
      }}>
        <DashboardHeader
          title="Energy"
          lastUpdated={lastUpdated}
          formatDateTime={formatDateTime}
        />
        <Box sx={{ mt: isMobile ? 0 : "15px", alignSelf: isMobile ? 'flex-start' : 'auto' }}>
          <RefreshButton onClick={handleRefresh} />
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ px: isMobile ? 1 : 2, flexShrink: 0 }}>
        <TabButtons tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </Box>

      {/* Filters */}
      <Box sx={{ px: isMobile ? 1 : 2, pb: 1, flexShrink: 0 }}>
        <Stack
          direction={isMobile ? "column" : "row"}
          spacing={1}
          flexWrap="wrap"
          alignItems={isMobile ? "stretch" : "flex-start"}
          sx={{
            rowGap: 1,
            columnGap: 1,
          }}
        >
          {role !== 'R04' && (
            <MultiSelectWithChips
              label="Companies"
              options={companyOptions}
              selectedValues={companyFilter}
              onChange={handleCompanyFilter}
              placeholder="All Companies"
            />
          )}
          <MultiSelectWithChips
            label="Power Plants"
            options={filteredPowerPlantOptions}
            selectedValues={powerPlantFilter}
            onChange={handlePowerPlantFilter}
            placeholder="All Power Projects"
          />
          {role !== 'R04' && (
            <MultiSelectWithChips label="Generation Sources" options={filteredGenerationSourceOptions} selectedValues={generationSourceFilter} onChange={handleGenerationSourceFilter} placeholder="All Sources" />)}
          <MonthRangeSelect label="All Time" startDate={startDate} endDate={endDate} setStartDate={handleStartDate} setEndDate={handleEndDate} />

          {userChangedFilters && showClearButton && <ClearButton onClick={clearAllFilters} />}

          <Box sx={{ flexGrow: 1, minWidth: 10 }} />
          <SingleSelectDropdown label="Group By" options={xOptions} selectedValue={x} onChange={setX} />
          <SingleSelectDropdown label="Time Interval" options={yOptions} selectedValue={y} onChange={setY} />
        </Stack>
      </Box>      {/* Main Content */}
      <Box sx={{ 
        flex: 1, 
        px: isMobile ? 1 : 2, 
        pb: isMobile ? 1 : 2, 
        minHeight: 0, 
        display: 'flex', 
        flexDirection: 'column' 
      }}>


        {/* KPI Cards */}
        <Box sx={{ 
          display: 'flex', 
          gap: isMobile ? 1 : 2, 
          flexWrap: isMobile ? 'wrap' : 'nowrap', 
          pb: 2 
        }}>
          <KPICard
            loading={false}
            value={`${(data?.totals?.total_energy_generated || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
            unit="kWh"
            title="Total Energy Generated"
            colorScheme={{ backgroundColor: '#1E40AF', textColor: '#FFFFFF', iconColor: '#FFFFFF' }}
            style={{ 
              flex: isMobile ? '1 1 calc(50% - 4px)' : 1,
              minHeight: isMobile ? '80px' : 'auto',
            }}
          />
          <KPICard
            loading={false}
            value={`${(data?.totals?.total_co2_avoidance || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
            unit="tons CO2"
            title="Total CO₂ Avoided"
            colorScheme={{ backgroundColor: '#1E40AF', textColor: '#FFFFFF', iconColor: '#FFFFFF' }}
            style={{ 
              flex: isMobile ? '1 1 calc(50% - 4px)' : 1,
              minHeight: isMobile ? '80px' : 'auto',
            }}
          />
          <KPICard
            loading={false}
            value={`${roundUpToNiceNumber(housePowerData?.totals?.est_house_powered || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
            unit=""
            title="Estimated No. of Households Powered"
            label={"Based on average consumption from PIDS (2017)"}
            colorScheme={{ backgroundColor: '#1E40AF', textColor: '#FFFFFF', iconColor: '#FFFFFF' }}
            style={{ 
              flex: isMobile ? '1 1 100%' : 1,
              minHeight: isMobile ? '80px' : 'auto',
            }}
          />
        </Box>        {/* Generation Charts */}
        {activeTab === "generation" && (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: isMobile ? 1 : 2, 
            minHeight: 0, 
            flex: 1 
          }}>
            <Box sx={{ 
              display: 'flex', 
              gap: isMobile ? 1 : 2, 
              flex: 1, 
              minHeight: 0, 
              maxHeight: '50%',
              flexDirection: isMobile ? 'column' : 'row',
            }}>
              {/* Line Chart - 60% width */}
              <Box sx={{ 
                flex: isMobile ? 1 : 3, 
                minHeight: 0, 
                height: isMobile ? '300px' : '100%' 
              }}>
                <Paper sx={{ height: '100%', p: 2, position: 'relative' }}>
                  <Box sx={{ width: '100%', height: '100%' }}>
                    <LineChartComponent
                      title={generateFullChartTitle("Power Generation Over Time", x, y, filters, startDate, endDate)}
                      data={filledLineData}
                      unit="kWh"
                      colorMap={
                        chartReady
                          ? getColorMapForGroupBy(
                              x,
                              data?.line_graph?.total_energy_generated || [],
                              plantColors,
                              plantMetadata,
                              generationSourceColors
                            )
                          : {}
                      }/>
                  </Box>
                  <Button
                    size="small"
                    sx={{ position: 'absolute', top: 8, right: 8 }}
                    onClick={() =>
                      openZoomModal(
                        generateFullChartTitle("Power Generation Over Time", x, y, filters, startDate, endDate),
                        "total_energy_generated_chart",
                        {
                          type: "line",
                          props: {
                            title: generateFullChartTitle("Power Generation Over Time", x, y, filters, startDate, endDate),
                            data: filledLineData,
                            unit: "kWh",
                            colorMap: chartReady
                              ? getColorMapForGroupBy(
                                  x,
                                  data?.line_graph?.total_energy_generated || [],
                                  plantColors,
                                  plantMetadata,
                                  generationSourceColors
                                )
                              : {}
                          }
                        }
                      )
                    }
                  >
                    <ZoomInIcon fontSize="small" />
                  </Button>
                </Paper>
              </Box>

              {/* Pie Chart - 40% width */}
              <Box sx={{ flex: 2, minHeight: 0, height: '100%' }}>
                <Paper sx={{ height: '100%', p: 2, position: 'relative' }}>
                  <Box sx={{ width: '100%', height: '100%' }}>
                    <PieChartComponent
                      title={generateFullChartTitle("Power Generation Distribution", x, y, filters, startDate, endDate)}
                      data={data?.pie_chart?.total_energy_generated || []}
                      colorMap={
                            chartReady
                              ? getColorMapForGroupBy(
                                  x,
                                  data?.line_graph?.total_energy_generated || [],
                                  plantColors,
                                  plantMetadata,
                                  generationSourceColors
                                )
                              : {}
                          }/>
                  </Box>
                  <Button
                    size="small"
                    sx={{ position: 'absolute', top: 8, right: 8 }}
                    onClick={() =>
                      openZoomModal(
                        generateFullChartTitle("Power Generation Distribution", x, y, filters, startDate, endDate),
                        "total_energy_generated_pie",
                        {
                          type: "pie",
                          props: {
                            title: generateFullChartTitle("Power Generation Distribution", x, y, filters, startDate, endDate),
                            data: data?.pie_chart?.total_energy_generated || [],
                            colorMap: chartReady
                              ? getColorMapForGroupBy(
                                  x,
                                  data?.line_graph?.total_energy_generated || [],
                                  plantColors,
                                  plantMetadata,
                                  generationSourceColors
                                )
                              : {}
                          }
                        }
                      )
                    }
                  >
                    <ZoomInIcon fontSize="small" />
                  </Button>
                </Paper>
              </Box>
            </Box>


            <Box sx={{ display: 'flex', gap: 2, flex: 1, minHeight: 0, maxHeight: '50%' }}>
              {/* Stacked Bar Chart */}
              <Box sx={{ flex: 1, minHeight: 0, height: '100%' }}>
                <Paper sx={{ height: '100%', p: 2, position: 'relative' }}>
                  <Box sx={{ width: '100%', height: '100%' }}>
                    <VerticalStackedBarChartComponent
                      title={generateFullChartTitle("Cumulative Power Generation", x, y, filters, startDate, endDate)}
                      data={filledStackedBarData}
                      legendName="Cumulative Power Generation"
                      unit="kWh"
                      colorMap={
                            chartReady
                              ? getColorMapForGroupBy(
                                  x,
                                  data?.line_graph?.total_energy_generated || [],
                                  plantColors,
                                  plantMetadata,
                                  generationSourceColors
                                )
                              : {}
                          }
                    />
                  </Box>
                  <Button
                    size="small"
                    sx={{ position: 'absolute', top: 8, right: 8 }}
                    onClick={() =>
                      openZoomModal(
                        generateFullChartTitle("Cumulative Power Generation", x, y, filters, startDate, endDate),
                        "total_energy_generated_bar",
                        {
                          type: "verticalBar",
                          props: {
                            title: generateFullChartTitle("Cumulative Power Generation", x, y, filters, startDate, endDate),
                            data: filledStackedBarData,
                            legendName: "Cumulative Power Generation",
                            unit: "kWh",
                            colorMap: chartReady
                              ? getColorMapForGroupBy(
                                  x,
                                  data?.line_graph?.total_energy_generated || [],
                                  plantColors,
                                  plantMetadata,
                                  generationSourceColors
                                )
                              : {}
                          }
                        }
                      )
                    }
                  >
                    <ZoomInIcon fontSize="small" />
                  </Button>
                </Paper>
              </Box>

              {/* Line Chart - Households Powered */}
              <Box sx={{ flex: 1, minHeight: 0, height: '100%' }}>
                <Paper sx={{ height: '100%', p: 2, position: 'relative' }}>
                  <Box sx={{ width: '100%', height: '100%' }}>
                    <VerticalStackedBarChartComponent
                      title={generateFullChartTitle("Number of Households Powered", x, y, filters, startDate, endDate)}
                      data={filledHousePowerStackedBar}
                      legendName="Total Energy Generated"
                      yAxisLabel={"No. of Household"}
                      colorMap={
                            chartReady
                              ? getColorMapForGroupBy(
                                  x,
                                  data?.line_graph?.total_energy_generated || [],
                                  plantColors,
                                  plantMetadata,
                                  generationSourceColors
                                )
                              : {}
                          }
                    />
                  </Box>
                  <Button
                    size="small"
                    sx={{ position: 'absolute', top: 8, right: 8 }}
                    onClick={() =>
                      openZoomModal(
                        generateFullChartTitle("Number of Households Powered", x, y, filters, startDate, endDate),
                        "households_powered_over_time",
                        {
                          type: "verticalBar",
                          props: {
                            title: generateFullChartTitle("Number of Households Powered", x, y, filters, startDate, endDate),
                            data: filledHousePowerStackedBar,
                            legendName: "Total Energy Generated",
                            yAxisLabel: "No. of Household",
                            colorMap: chartReady
                              ? getColorMapForGroupBy(
                                  x,
                                  data?.line_graph?.total_energy_generated || [],
                                  plantColors,
                                  plantMetadata,
                                  generationSourceColors
                                )
                              : {}
                          }
                        }
                      )
                    }
                  >
                    <ZoomInIcon fontSize="small" />
                  </Button>
                </Paper>
              </Box>
            </Box>
          </Box>
        )}

        {/*Avoidance Section*/}
        {activeTab === "avoidance" && (
        <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1, minHeight: 0, flex: 1 }}>
{/* Column 1 */}
  <Box
    sx={{
      flex: '0 0 45%',
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      minHeight: 0,
    }}
  >
    {/* Chart - 60% */}
    <Paper
      elevation={3}
      sx={{
        p: 1,
        flex: 6,
        position: 'relative',
        minHeight: 0,
      }}
    >
      <LineChartComponent
        title={generateFullChartTitle("CO₂ Avoidance Over Time", x, y, filters, startDate, endDate)}
        data={filledCo2Data}
        yAxisLabel="tons CO2"
        unit="tons CO2"
        colorMap={
          chartReady
            ? getColorMapForGroupBy(
                x,
                data?.line_graph?.total_energy_generated || [],
                plantColors,
                plantMetadata,
                generationSourceColors
              )
            : {}
        }
      />
      <Button
        size="small"
        sx={{ position: 'absolute', top: 8, right: 8 }}
        onClick={() =>
          openZoomModal(
            generateFullChartTitle("CO₂ Avoidance Over Time", x, y, filters, startDate, endDate),
            "co2_avoidance_trends_chart",
            {
              type: "line",
              props: {
                title: generateFullChartTitle("CO₂ Avoidance Over Time", x, y, filters, startDate, endDate),
                data: filledCo2Data,
                yAxisLabel: "tons CO2",
                unit: "tons CO2",
                colorMap: chartReady
                  ? getColorMapForGroupBy(
                      x,
                      data?.line_graph?.total_energy_generated || [],
                      plantColors,
                      plantMetadata,
                      generationSourceColors
                    )
                  : {}
              }
            }
          )
        }
      >
        <ZoomInIcon fontSize="small" />
      </Button>
    </Paper>

    {/* Table - 40% */}
<Paper
  elevation={3}
  sx={{
    p: 1,
    flex: 4,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
  }}
>
  <TableContainer
    component={Box}
    sx={{
      flex: 1,
      minHeight: 0,
      overflowX: 'hidden', // ✅ prevent horizontal scrollbar
      overflowY: 'hidden',   // ✅ allow vertical scroll if really needed
    }}
  >
    <Table
      size="small"
      stickyHeader
      aria-label="summary table"
      sx={{
        width: '100%',
        tableLayout: 'fixed',
        height: '100%',
        '& td, & th': {
          whiteSpace: 'normal',
          wordWrap: 'break-word',
        },
      }}
    >
      <TableHead>
        <TableRow>
          <TableCell sx={{ width: '25%' }}>
            <Typography
              sx={{ fontSize: 'clamp(0.5rem, 0.8vw, 1rem)', fontWeight: 'bold' }}
            >
              Source
            </Typography>
          </TableCell>
          <TableCell sx={{ width: '75%' }}>
            <Typography
              sx={{ fontSize: 'clamp(0.5rem, 0.8vw, 1rem)', fontWeight: 'bold' }}
            >
              Formula
            </Typography>
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {[...Array(3)].map((_, index) => (
          <TableRow key={index}>
            <TableCell>
              <Typography sx={{ fontSize: 'clamp(0.3rem, 0.8vw, 1rem)' }}>
                {(staticData?.[index]?.label || `Label ${index + 1}`)
                  .replace(/\b\w/g, char => char.toUpperCase())}
              </Typography>
            </TableCell>
            <TableCell>
              {staticData?.[index]?.formula
                ? staticData[index].formula.split(';').map((line, i) => (
                    <Typography
                      key={i}
                      sx={{ fontSize: 'clamp(0.3rem, 0.8vw, 1rem)' }}
                    >
                      {line}
                    </Typography>
                  ))
                : '-'}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
</Paper>

  </Box>


          {/* Column 2 */}
{/* Column 2 */}
<Box
  sx={{
    flex: '0 0 55%',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: 0,
  }}
>
  <Paper
    elevation={3}
    sx={{
      flex: 1,
      height: '100%',
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: 1,
      p: 1,
    }}
  >
    {Object.entries(equivalenceData).map(([category, records]) => (
      <Box
        key={category}
        sx={{
          border: '1px solid #ccc',
          borderRadius: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0,
          overflow: 'hidden',
          p: 1,
        }}
      >
        <Typography
          variant="subtitle1"
          gutterBottom
          sx={{
            fontWeight: 600,
            mb: 0.5,
            fontSize: {
              xs: '0.25rem',
              sm: '0.4rem',
              md: '0.75rem',
            },
          }}
        >
          {categoryHeadings[category] || category}
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: '1fr 1fr',
            },
            gap: 1,
            flex: 1,
            minHeight: 0,
            gridAutoRows: '1fr', // 🔑 Makes each row same height
          }}
        >
          {Object.entries(records).map(([eqKey, [eq]], index, arr) => {
            const isLast = index === arr.length - 1;
            const isOdd = arr.length % 2 === 1;
            const scheme = colorSchemes[eq.equivalence_category] || colorSchemes.default;

            return (
              <Box
                key={eqKey}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  width: '100%',
                  ...(isLast && isOdd && {
                    gridColumn: 'span 2',
                  }),
                }}
              >
                <KPICard
                  loading={false}
                  value={`${(eq.co2_equivalent || 0).toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}`}
                  unit=""
                  title={eq.equivalence_label || `Metric ${index + 1}`}
                  icon={iconMap[eqKey]}
                  colorScheme={scheme}
                  style={{
                    height: '100%',
                    width: '100%',
                  }}
                  tooltip={eq.equivalence_label}
                />
              </Box>
            );
          })}
        </Box>
      </Box>
    ))}
  </Paper>
</Box>


        </Box>
    )}

        <ZoomModal
          open={zoomModal.open}
          onClose={() => setZoomModal({ ...zoomModal, open: false })}
          title={zoomModal.title}
          downloadFileName={zoomModal.fileName}
          maxWidth="lg"
          enableDownload
          enableScroll={true}
        >          <div style={{ width: '100%', height: '60vh', minHeight: 400 }}>
            {zoomModal.chartConfig?.type === "line" && (
              <LineChartComponent {...zoomModal.chartConfig.props} />
            )}
            {zoomModal.chartConfig?.type === "pie" && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <PieChartComponent {...zoomModal.chartConfig.props} />
              </div>
            )}
            {zoomModal.chartConfig?.type === "verticalBar" && (
              <VerticalStackedBarChartComponent {...zoomModal.chartConfig.props} zoom={true} />
            )}
          </div>
        </ZoomModal>
      </Box>
    </Box>
    </Box>
  </Box>
);

}

export default PowerDashboard;
