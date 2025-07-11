// Utility to fill missing years with zero values for stacked bar charting
function fillMissingYears(dataArray, startDate, endDate, keyName = 'period', valueKeys = []) {
  // Get all years between startDate and endDate in "YYYY" format
  const years = [];
  let current = new Date(startDate.getFullYear(), 0, 1);
  const end = new Date(endDate.getFullYear(), 0, 1);
  while (current <= end) {
    years.push(`${current.getFullYear()}`);
    current.setFullYear(current.getFullYear() + 1);
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
  return years.map(year => {
    if (dataMap[year]) {
      const filled = { ...dataMap[year] };
      allKeysArr.forEach(k => {
        if (!(k in filled)) filled[k] = 0;
      });
      return filled;
    }
    const zeroObj = { [keyName]: year };
    allKeysArr.forEach(k => {
      zeroObj[k] = 0;
    });
    return zeroObj;
  });
}
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
  ToggleButton, ToggleButtonGroup,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import ZoomInIcon from '@mui/icons-material/ZoomIn';

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
import dayjs from "dayjs";
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
import GenericResponsiveTable from "../../components/DashboardComponents/ResponsiveTable";
import { useAuth } from "../../contexts/AuthContext";



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
  { key: "main", label: "Primary Allocation" },
  { key: "sub", label: "Beneficiaries" },
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

// Utility to fill missing months with zero values for stacked bar charting
function fillMissingMonths(dataArray, startDate, endDate, keyName = 'period', valueKeys = []) {
  const months = [];
  let current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
  while (current <= end) {
    months.push(`${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`);
    current.setMonth(current.getMonth() + 1);
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
  return months.map(month => {
    if (dataMap[month]) {
      const filled = { ...dataMap[month] };
      allKeysArr.forEach(k => {
        if (!(k in filled)) filled[k] = 0;
      });
      return filled;
    }
    const zeroObj = { [keyName]: month };
    allKeysArr.forEach(k => {
      zeroObj[k] = 0;
    });
    return zeroObj;
  });
}

// Utility to fill missing quarters with zero values for stacked bar charting
function fillMissingQuarters(dataArray, startDate, endDate, keyName = 'period', valueKeys = []) {
  // Get all quarters between startDate and endDate in "YYYY-Qn" format
  const quarters = [];
  let current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
  while (current <= end) {
    const year = current.getFullYear();
    const q = Math.floor(current.getMonth() / 3) + 1;
    quarters.push(`${year}-Q${q}`);
    // Move to next quarter
    current.setMonth(current.getMonth() + 3);
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
  return quarters.map(quarter => {
    if (dataMap[quarter]) {
      const filled = { ...dataMap[quarter] };
      allKeysArr.forEach(k => {
        if (!(k in filled)) filled[k] = 0;
      });
      return filled;
    }
    const zeroObj = { [keyName]: quarter };
    allKeysArr.forEach(k => {
      zeroObj[k] = 0;
    });
    return zeroObj;
  });
}








import { useLocation, useNavigate } from "react-router-dom";

function FundsDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));

  // Do not redirect if not in repository mode (requirement update)

  const [lastUpdated, setLastUpdated] = useState(new Date());
  const { getUserRole } = useAuth();
  const {getUserCompanyId} = useAuth();
  const{getUserPowerPlantId}=useAuth();
  const role = getUserRole();
  const companyId = getUserCompanyId();
  const powerPlantId = getUserPowerPlantId();


  const [zoomModal, setZoomModal] = useState({
    open: false,
    title: '',
    fileName: '',
    content: null,
  });

  const openZoomModal = (title, fileName, content) => {
    setZoomModal({ open: true, title, fileName, content });
  };


  const [activeTab, setActiveTab] = useState("main");
  const [data, setData] = useState({});
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [plantColors, setPlantColors] = useState({});
  const [generationSourceColors, setGenerationSourceColors] = useState({});


  // Filter values
  const [companyFilter, setCompanyFilter] = useState([]);
  const [powerPlantFilter, setPowerPlantFilter] = useState([]);
  const [generationSourceFilter, setGenerationSourceFilter] = useState([]);
  const [provinceFilter, setProvinceFilter] = useState([]);
  const [x, setX] = useState('power_plant_id');
  const [y, setY] = useState('monthly');
  // Date range state (always JS Date objects)
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  // Set default date range based on y (time interval) on first load or y change, unless user changed filters
  useEffect(() => {
    if (!userChangedFilters) {
      const today = new Date();
      let newStartDate = null;
      let newEndDate = today;

      if (y === "monthly") {
        newStartDate = new Date(today.getFullYear(), today.getMonth() - 6, 1);
        newEndDate = today;
      } else if (y === "quarterly") {
        const startQuarter = new Date(today.getFullYear(), today.getMonth(), 1);
        startQuarter.setMonth(startQuarter.getMonth() - 2 * 4);
        newStartDate = new Date(startQuarter.getFullYear(), startQuarter.getMonth(), 1);
        newEndDate = new Date(today.getFullYear(), today.getMonth() - (today.getMonth() % 3), 1);
      } else if (y === "yearly") {
        newStartDate = new Date(today.getFullYear() - 5, 0, 1);
        newEndDate = new Date(today.getFullYear(), 0, 1);
      }

      setStartDate(newStartDate instanceof Date ? newStartDate : null);
      setEndDate(newEndDate instanceof Date ? newEndDate : null);
    }
  }, [y]);
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
  const [staticData, setStaticData] = useState({});


  // Build companyColors from pp_info (plantMetadata) and print to console
const [companyColors, setCompanyColors] = useState({});

useEffect(() => {
  if (plantMetadata && plantMetadata.length > 0) {
    // Map company_id to color (first occurrence wins)
    const map = {};
    plantMetadata.forEach(item => {
      if (item.company_id && item.color && !map[item.company_id.toUpperCase()]) {
        map[item.company_id.toUpperCase()] = item.color;
      }
    });
    console.log('Company Colors from API:', map);
    setCompanyColors(map);
  }
}, [plantMetadata]);

// Print companyColors to the console whenever it changes
useEffect(() => {
  if (companyColors && Object.keys(companyColors).length > 0) {
    console.log('Company Colors:', companyColors);
  }
}, [companyColors]);


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
    const start = format(new Date(startDate), 'MMM yyyy');
    const end = format(new Date(endDate), 'MMM yyyy');
    parts.push(`Period: ${start} - ${end}`);
  }

  const groupBy = xLabelMap[xField] || xField;
  const timeLabel = yLabelMap[yField] || yField;

  const filterSuffix = parts.length ? ` | ${parts.join(' | ')}` : '';

  return `${baseTitle} by ${groupBy} (${timeLabel})${filterSuffix}`;
};



// Update getColorMapForGroupBy to fallback to company_id color if power_plant_id color is not found
const getColorMapForGroupBy = (
  groupByKey,
  dataItems,
  plantColors,
  plantMetadata,
  generationSourceColors,
  companyColors = {}
) => {
  const colorMap = {};

  dataItems.forEach((item) => {
    let rawKey;
    if (groupByKey === 'power_plant_id') {
      rawKey = item.power_plant_id || item.name;
    } else if (groupByKey === 'company_id') {
      rawKey = item.company_id || item.name;
    } else if (groupByKey === 'generation_source') {
      rawKey = item.generation_source || item.name;
    } else if (groupByKey === 'ff_name') {
      rawKey = item.ff_name;
    } else {
      rawKey = item[groupByKey] || item.name;
    }
    if (!rawKey) return;
    const key = typeof rawKey === 'string' ? rawKey.trim().toUpperCase() : rawKey;
    if (groupByKey === 'power_plant_id') {
      // Fallback to company_id color if plant color not found
      const plantColor = plantColors[key];
      if (plantColor) {
        colorMap[key] = plantColor;
      } else if (item.company_id) {
        const companyKey = item.company_id.toUpperCase();
        colorMap[key] = companyColors[companyKey] || '#A5B4FC';
      } else {
        colorMap[key] = '#CBD5E1';
      }
    } else if (groupByKey === 'company_id') {
      const match = plantMetadata.find(
        (entry) => entry.company_id.toUpperCase() === key
      );
      colorMap[key] = companyColors[key] || match?.color || '#A5B4FC';
    } else if (groupByKey === 'generation_source') {
      colorMap[key.toLowerCase()] = generationSourceColors[key.toLowerCase()] || '#D1FAE5';
    } else if (groupByKey === 'ff_name') {
      colorMap[key] = generationSourceColors[key.toLowerCase()] || '#FDE68A';
    } else {
      colorMap[key] = '#E5E7EB';
    }
  });
  return colorMap;
};


const [lineView, setLineView] = React.useState('period');
const handleLineViewChange = (event, newValue) => {
  if (newValue !== null) {
    setLineView(newValue);
  }
};



const fetchData = async () => {
  setLoading(true);
  setData({});
  setFilteredData([]);

  try {
    const params = { x, y };

    // Always pass companyId for R04
    if (role === 'R04' && companyId) {
      params.p_company_id = companyId;
    } else if (filters.company) {
      params.p_company_id = filters.company;
    }
    if (filters.powerPlant) params.p_power_plant_id = filters.powerPlant;
    if (filters.generationSource) params.p_generation_source = filters.generationSource;
    if (filters.province) params.p_province = filters.province;

    // Send date range as p_start_date and p_end_date (YYYY-MM-DD)
    const isValidDate = (d) => {
      if (!d) return false;
      if (typeof d === "string") return d.trim() !== "" && !isNaN(new Date(d).getTime());
      if (d instanceof Date) return !isNaN(d.getTime());
      return false;
    };
    if (isValidDate(startDate)) {
      const start = new Date(startDate);
      const end = isValidDate(endDate) ? new Date(endDate) : new Date();
      params.p_start_date = start.toISOString().split("T")[0];
      params.p_end_date = end.toISOString().split("T")[0];
    }

    const query = new URLSearchParams(params).toString();
    const response = await api.get(`/energy/fund_allocation_dashboard?${query}`);
    const raw = response?.data;
    const energyData = raw?.data || {};
    const rawData = energyData?.results || [];

    setData(energyData);
    setFilteredData(rawData);
    setEquivalenceData(raw?.equivalence_data || {});
    setHousePowerData(raw?.house_powered || {});
    setStaticData(raw?.formula || {});

    setLastUpdated(new Date());
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

  const [userChangedFilters, setUserChangedFilters] = useState(false);
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
    setStartDate(val);
  };
  const handleEndDate = (val) => {
    setUserChangedFilters(true);
    setEndDate(val);
  };

const clearAllFilters = () => {
  setCompanyFilter([]);
  setPowerPlantFilter([]);
  setGenerationSourceFilter([]);
  setProvinceFilter([]);
  if (y === 'quarterly') {
    setStartDate(dayjs().startOf('quarter').subtract(8, 'quarter'));
    setEndDate(dayjs().startOf('quarter'));
  } else {
    setStartDate(dayjs().startOf('month').subtract(11, 'month'));
    setEndDate(dayjs().startOf('month'));
  }
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
      } catch (err) {
        console.error("Error loading filters", err);
      }
    };

    fetchFilterData();
  }, []);

// Sync multi-select filter arrays into the filters object
useEffect(() => {
  const newFilters = {
    company: companyFilter,
    powerPlant: powerPlantFilter
  };

  const syncedFilters = Object.fromEntries(
    Object.entries(newFilters).map(([key, arr]) => [key, arr.length > 0 ? arr.join(",") : ""])
  );

  setFilters(syncedFilters);
}, [companyFilter, powerPlantFilter]);

useEffect(() => {
  fetchData();
}, [x, y, filters, startDate, endDate]);


  const xOptions = [
    { label: "Power Plant", value: "power_plant_id" },
    { label: "Company", value: "company_id" },
  ];

  const yOptions = [
    { label: "Monthly", value: "monthly" },
    { label: "Quarterly", value: "quarterly" },
    { label: "Yearly", value: "yearly" },
  ];

  const showClearButton =
    companyFilter.length > 0 ||
    powerPlantFilter.length > 0 ||
    startDate !== null ||
    endDate !== null;


// Filter data by companyId if role is R04
useEffect(() => {
  if (role === 'R04' && companyId) {
    setCompanyFilter([companyId]);
  }
  // If you want to clear the filter for other roles, you can add an else block
  // else {
  //   setCompanyFilter([]);
  // }
}, [role, companyId]);




// Compute filtered power plant options based on selected company
const filteredPowerPlantOptions = React.useMemo(() => {
  if (role === 'R04' && companyId && plantMetadata.length > 0) {
    return plantMetadata
      .filter(item => item.company_id === companyId)
      .map(item => ({ value: item.power_plant_id, label: item.power_plant_id }));
  }
  if (companyFilter.length > 0 && plantMetadata.length > 0) {
    return plantMetadata
      .filter(item => companyFilter.includes(item.company_id))
      .map(item => ({ value: item.power_plant_id, label: item.power_plant_id }));
  }
  return powerPlantOptions;
}, [role, companyId, plantMetadata, powerPlantOptions, companyFilter]);

// When companyFilter changes, update powerPlantFilter if their values are no longer valid
useEffect(() => {
  if (role === 'R04') return;
  const validPowerPlantValues = filteredPowerPlantOptions.map(opt => opt.value);
  if (powerPlantFilter.some(val => !validPowerPlantValues.includes(val))) {
    setPowerPlantFilter(powerPlantFilter.filter(val => validPowerPlantValues.includes(val)));
  }
}, [companyFilter, filteredPowerPlantOptions, powerPlantFilter, role]);



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
            Loading ER 1-94 Funds Allocation Dashboard...
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}


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
          title="ER 1-94 Funds Allocation"
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
            <MultiSelectWithChips label="Companies" options={companyOptions} selectedValues={companyFilter} onChange={handleCompanyFilter} placeholder="All Companies" />
          )}
          <MultiSelectWithChips label="Power Plants" options={filteredPowerPlantOptions} selectedValues={powerPlantFilter} onChange={handlePowerPlantFilter} placeholder="All Power Projects" />
          <MonthRangeSelect label="All Time" startDate={startDate} endDate={endDate} setStartDate={handleStartDate} setEndDate={handleEndDate} />

          {role !== 'R04' && userChangedFilters && showClearButton && <ClearButton onClick={clearAllFilters} />}

          <Box sx={{ flexGrow: 1, minWidth: 10 }} />
          <SingleSelectDropdown label="Group By" options={xOptions} selectedValue={x} onChange={setX} />
          <SingleSelectDropdown label="Time Interval" options={yOptions} selectedValue={y} onChange={setY} />
        </Stack>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, px: 2, pb: 2, minHeight: 0, display: 'flex', flexDirection: 'column' }}>


{/* Generation Charts with KPI inside tab */}
{activeTab === "main" && (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minHeight: 0, flex: 1 }}>
    {/* Row 1: 2 Columns */}
<Box sx={{ display: 'flex', gap: 2, flex: 1, minHeight: 0 }}>
  {/* Column 1: 2 rows, equal height */}
  <Box sx={{ flex: 7, display: 'flex', flexDirection: 'column', gap: 2, minHeight: 0 }}>
    {/* Row 1: Line Chart */}
    {/* Row 1: Line Chart */}
<Box sx={{ flex: 1, minHeight: 0 }}>
  <Paper sx={{ height: '100%', p: 2, position: 'relative', display: 'flex', flexDirection: 'column' }}>
    
    {/* Toggle Buttons */}
{/* Toggle Button - lower right */}
<Box
  sx={{
    position: 'absolute',
    bottom: 8,
    right: 8,
    zIndex: 1, // Make sure it's above chart if overlapping
  }}
>
  <ToggleButtonGroup
    value={lineView}
    exclusive
    onChange={handleLineViewChange}
    size="small"
    color="primary"
    sx={{
      '& .MuiToggleButton-root': {
        px: 1.5,
        py: 0.5,
        fontSize: 10,
        minHeight: '18px',
      }
    }}
  >
    <ToggleButton value="period">Period</ToggleButton>
    <ToggleButton value="category">Category</ToggleButton>
  </ToggleButtonGroup>
</Box>




    {/* Chart Content */}
    <Box sx={{ flex: 1, width: '100%', height: '100%' }}>
      <VerticalStackedBarChartComponent
        title={generateFullChartTitle("Breakdown of Primary Allocation of Funds", x, y, filters, startDate, endDate)}
        data={
          (() => {
            const rawData = lineView === 'period'
              ? data?.funds_allocated_peso?.allocation?.stacked_by_period || []
              : data?.funds_allocated_peso?.allocation?.stacked_by_ffid || [];
            if (lineView === 'period' && startDate && endDate && rawData.length > 0) {
              const valueKeys = Object.keys(rawData[0]).filter(k => k !== 'period');
              if (y === 'quarterly') {
                return fillMissingQuarters(rawData, new Date(startDate), new Date(endDate), 'period', valueKeys);
              } else if (y === 'yearly') {
                return fillMissingYears(rawData, new Date(startDate), new Date(endDate), 'period', valueKeys);
              } else {
                return fillMissingMonths(rawData, new Date(startDate), new Date(endDate), 'period', valueKeys);
              }
            }
            return rawData;
          })()
        }
        legendName="Total Energy Generated"
        yAxisLabel={"Pesos"}
        unit="pesos"
        yAxisKey={lineView === 'period' ? 'period' : 'ff_name'}

        colorMap={
          lineView === 'period'
            ? getColorMapForGroupBy(
                x,
                data?.funds_allocated_peso?.allocation?.stacked_by_period || [],
                plantColors,
                plantMetadata,
                generationSourceColors
              )
            : x === 'company_id' ? companyColors : plantColors
        }
        />
    </Box>

    {/* Zoom Button */}
    <Button
      size="small"
      sx={{ position: 'absolute', top: 8, right: 8 }}
      onClick={() =>
        openZoomModal(
          generateFullChartTitle("Breakdown of Primary Allocation of Funds", x, y, filters, startDate, endDate),
          "total_energy_generated_chart",
          <VerticalStackedBarChartComponent
            title={generateFullChartTitle("Breakdown of Primary Allocation of Funds", x, y, filters, startDate, endDate)}
            data={
              (() => {
                const rawData = lineView === 'period'
                  ? data?.funds_allocated_peso?.allocation?.stacked_by_period || []
                  : data?.funds_allocated_peso?.allocation?.stacked_by_ffid || [];
                if (lineView === 'period' && startDate && endDate && rawData.length > 0) {
                  // Get all value keys except 'period'
                  const valueKeys = Object.keys(rawData[0]).filter(k => k !== 'period');
                  return fillMissingMonths(rawData, new Date(startDate), new Date(endDate), 'period', valueKeys);
                }
                return rawData;
              })()
            }
            legendName="Total Energy Generated"
            yAxisLabel={"Pesos"}
            unit="pesos"
            yAxisKey={lineView === 'period' ? 'period' : 'ff_name'}

            colorMap={
              lineView === 'period'
                ? getColorMapForGroupBy(
                    x,
                    data?.funds_allocated_peso?.allocation?.stacked_by_period || [],
                    plantColors,
                    plantMetadata,
                    generationSourceColors
                  )
                : x === 'company_id' ? companyColors : plantColors
            }
            />
        )
      }
    >
      <ZoomInIcon fontSize="small" />
    </Button>
  </Paper>
</Box>


{/* Row 2: Stacked Bar Chart */}
<Box sx={{ flex: 1, minHeight: 0 }}>
  <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
    <Box sx={{ flex: 1, minHeight: 0 }}>
      <GenericResponsiveTable
        data={data?.funds_allocated_peso?.allocation?.tabledata}
      />
    </Box>
  </Paper>
</Box>

  </Box>

  {/* Column 2: KPI + Pie Chart */}
  <Box sx={{ flex: 3, display: 'flex', flexDirection: 'column', gap: 1, minHeight: 0 }}>
    {/* KPI Card */}
    <Box sx={{ flexShrink: 0 }}>
      <KPICard
        loading={false}
        value={`₱ ${(data?.funds_allocated_peso?.allocation?.total || 0).toLocaleString(undefined, {
          maximumFractionDigits: 2,
        })}`}
        unit=""
        title="Total Energy Generated in Peso"
        colorScheme={{ backgroundColor: '#1E40AF', textColor: '#FFFFFF', iconColor: '#FFFFFF' }}
        style={{ width: '100%' }}
      />
    </Box>

    {/* Pie Chart */}
    <Box sx={{ flex: 1, minHeight: 0 }}>
      <Paper sx={{ height: '100%', p: 2, position: 'relative' }}>
        <Box sx={{ width: '100%', height: '100%' }}>
          <PieChartComponent
            title={generateFullChartTitle("Power Generation Breakdown", x, y, filters, startDate, endDate)}
            data={data?.funds_allocated_peso?.allocation?.pie || []}
            colorMap={plantColors}
          />
        </Box>
        <Button
          size="small"
          sx={{ position: 'absolute', top: 8, right: 8 }}
          onClick={() =>
            openZoomModal(
              generateFullChartTitle("Power Generation Breakdown", x, y, filters, startDate, endDate),
              "total_energy_generated_pie",
              <PieChartComponent
                title={generateFullChartTitle("Power Generation Breakdown", x, y, filters, startDate, endDate)}
                data={data?.funds_allocated_peso?.allocation?.pie || []}
                colorMap={plantColors}
              />
            )
          }
        >
          <ZoomInIcon fontSize="small" />
        </Button>
      </Paper>
    </Box>
  </Box>
</Box>

  </Box>
)}
{/* Generation Charts with KPI inside tab */}
{activeTab === "sub" && (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minHeight: 0, flex: 1 }}>
    {/* Row 1: 2 Columns */}
<Box sx={{ display: 'flex', gap: 2, flex: 1, minHeight: 0 }}>
  {/* Column 1: 2 rows, equal height */}
  <Box sx={{ flex: 7, display: 'flex', flexDirection: 'column', gap: 2, minHeight: 0 }}>
    {/* Row 1: Line Chart */}
    {/* Row 1: Line Chart */}
<Box sx={{ flex: 1, minHeight: 0 }}>
  <Paper sx={{ height: '100%', p: 2, position: 'relative', display: 'flex', flexDirection: 'column' }}>
    
    {/* Toggle Buttons */}
{/* Toggle Button - lower right */}
<Box
  sx={{
    position: 'absolute',
    bottom: 8,
    right: 8,
    zIndex: 1, // Make sure it's above chart if overlapping
  }}
>
  <ToggleButtonGroup
    value={lineView}
    exclusive
    onChange={handleLineViewChange}
    size="small"
    color="primary"
    sx={{
      '& .MuiToggleButton-root': {
        px: 1.5,
        py: 0.5,
        fontSize: 10,
        minHeight: '18px',
      }
    }}
  >
    <ToggleButton value="period">Period</ToggleButton>
    <ToggleButton value="category">Category</ToggleButton>
  </ToggleButtonGroup>
</Box>




    {/* Chart Content */}
    <Box sx={{ flex: 1, width: '100%', height: '100%' }}>
      <VerticalStackedBarChartComponent
        title={generateFullChartTitle("Breakdown of Funds Allocation for Beneficiaries", x, y, filters, startDate, endDate)}
        data={
          (() => {
            const rawData = lineView === 'period'
              ? data?.funds_allocated_peso?.beneficiaries?.stacked_by_period || []
              : data?.funds_allocated_peso?.beneficiaries?.stacked_by_ffid || [];
            if (lineView === 'period' && startDate && endDate && rawData.length > 0) {
              const valueKeys = Object.keys(rawData[0]).filter(k => k !== 'period');
              if (y === 'quarterly') {
                return fillMissingQuarters(rawData, new Date(startDate), new Date(endDate), 'period', valueKeys);
              } else if (y === 'yearly') {
                return fillMissingYears(rawData, new Date(startDate), new Date(endDate), 'period', valueKeys);
              } else {
                return fillMissingMonths(rawData, new Date(startDate), new Date(endDate), 'period', valueKeys);
              }
            }
            return rawData;
          })()
        }
        legendName="Total Energy Generated"
        yAxisLabel={"Pesos"}
        unit="pesos"
        yAxisKey={lineView === 'period' ? 'period' : 'ff_name'}

        colorMap={
          lineView === 'period'
            ? getColorMapForGroupBy(
                x,
                data?.funds_allocated_peso?.beneficiaries?.stacked_by_period || [],
                plantColors,
                plantMetadata,
                generationSourceColors
              )
            : x === 'company_id' ? companyColors : plantColors
        }
        />
    </Box>

    {/* Zoom Button */}
    <Button
      size="small"
      sx={{ position: 'absolute', top: 8, right: 8 }}
      onClick={() =>
        openZoomModal(
          generateFullChartTitle("Breakdown of Funds Allocation for Beneficiaries", x, y, filters, startDate, endDate),
          "total_energy_generated_chart",
          <VerticalStackedBarChartComponent
        title={generateFullChartTitle("Breakdown of Funds Allocation for Beneficiaries", x, y, filters, startDate, endDate)}
        data={
          (() => {
            const rawData = lineView === 'period'
              ? data?.funds_allocated_peso?.beneficiaries?.stacked_by_period || []
              : data?.funds_allocated_peso?.beneficiaries?.stacked_by_ffid || [];
            if (lineView === 'period' && startDate && endDate && rawData.length > 0) {
              const valueKeys = Object.keys(rawData[0]).filter(k => k !== 'period');
              return fillMissingMonths(rawData, new Date(startDate), new Date(endDate), 'period', valueKeys);
            }
            return rawData;
          })()
        }
        legendName="Total Energy Generated"
        yAxisLabel={"Pesos"}
        unit="pesos"
        yAxisKey={lineView === 'period' ? 'period' : 'ff_name'}

        colorMap={
          lineView === 'period'
            ? getColorMapForGroupBy(
                x,
                data?.funds_allocated_peso?.beneficiaries?.stacked_by_period || [],
                plantColors,
                plantMetadata,
                generationSourceColors
              )
            : x === 'company_id' ? companyColors : plantColors
        }
        />
        )
      }
    >
      <ZoomInIcon fontSize="small" />
    </Button>
  </Paper>
</Box>


{/* Row 2: Stacked Bar Chart */}
<Box sx={{ flex: 1, minHeight: 0 }}>
  <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
    <Box sx={{ flex: 1, minHeight: 0 }}>
      <GenericResponsiveTable
        data={data?.funds_allocated_peso?.beneficiaries?.tabledata}
      />
    </Box>
  </Paper>
</Box>

  </Box>

  {/* Column 2: KPI + Pie Chart */}
  <Box sx={{ flex: 3, display: 'flex', flexDirection: 'column', gap: 1, minHeight: 0 }}>
    {/* KPI Card */}
    <Box sx={{ flexShrink: 0 }}>
      <KPICard
        loading={false}
        value={`₱ ${(data?.funds_allocated_peso?.allocation?.total || 0).toLocaleString(undefined, {
          maximumFractionDigits: 2,
        })}`}
        unit=""
        title="Total Energy Generated in Peso"
        colorScheme={{ backgroundColor: '#1E40AF', textColor: '#FFFFFF', iconColor: '#FFFFFF' }}
        style={{ width: '100%' }}
      />
    </Box>

    {/* Pie Chart */}
    <Box sx={{ flex: 1, minHeight: 0 }}>
      <Paper sx={{ height: '100%', p: 2, position: 'relative' }}>
        <Box sx={{ width: '100%', height: '100%' }}>
          <PieChartComponent
            title={generateFullChartTitle("Power Generation Breakdown", x, y, filters, startDate, endDate)}
            data={data?.funds_allocated_peso?.beneficiaries?.pie || []}
            colorMap={plantColors}
          />
        </Box>
        <Button
          size="small"
          sx={{ position: 'absolute', top: 8, right: 8 }}
          onClick={() =>
            openZoomModal(
              generateFullChartTitle("Power Generation Breakdown", x, y, filters, startDate, endDate),
              "total_energy_generated_pie",
              <PieChartComponent
                title={generateFullChartTitle("Power Generation Breakdown", x, y, filters, startDate, endDate)}
                data={data?.funds_allocated_peso?.allocation?.pie || []}
                colorMap={
                  chartReady
                    ? getColorMapForGroupBy(
                        x,
                        data?.funds_allocated_peso?.beneficiaries?.pie || [],
                        plantColors,
                        plantMetadata,
                        generationSourceColors
                      )
                    : {}
                }
              />
            )
          }
        >
          <ZoomInIcon fontSize="small" />
        </Button>
      </Paper>
    </Box>
  </Box>
</Box>

  </Box>
)}        <ZoomModal
          open={zoomModal.open}
          onClose={() => setZoomModal({ ...zoomModal, open: false })}
          title={zoomModal.title}
          downloadFileName={zoomModal.fileName}
          enableDownload
          enableScroll={true}
        >
          <Box sx={{ 
            width: '100%', 
            height: '500px', 
            minHeight: '400px',
            display: 'flex', 
            alignItems: 'stretch', 
            justifyContent: 'center',
            '& > *': {
              width: '100% !important',
              maxWidth: 'none !important'
            }
          }}>
            {zoomModal.content}
          </Box>
        </ZoomModal>
      </Box>
      </Box>
    </Box>
  </Box>
);

}

export default FundsDashboard;
