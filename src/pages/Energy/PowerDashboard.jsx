import React, { useState, useEffect } from "react";
import {
  Box,
  Stack,
  Typography,
  Grid,
  Paper
} from "@mui/material";

import CircularProgress from '@mui/material/CircularProgress';

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


const AvoidanceTab = () => <div>Diesel content</div>;

function PowerDashboard() {
  const lastUpdated = new Date();

  const [activeTab, setActiveTab] = useState("generation");
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [filteredData, setFilteredData] = useState([]);

  // Filter values
  const [companyFilter, setCompanyFilter] = useState([]);
  const [powerPlantFilter, setPowerPlantFilter] = useState([]);
  const [generationSourceFilter, setGenerationSourceFilter] = useState([]);
  const [provinceFilter, setProvinceFilter] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [x, setX] = useState('power_plant_id');
  const [y, setY] = useState('monthly');
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

  const handleRefresh = () => {
    // TODO: Add refresh logic here
  };

  const clearAllFilters = () => {
    setCompanyFilter([]);
    setPowerPlantFilter([]);
    setGenerationSourceFilter([]);
    setProvinceFilter([]);
    setStartDate(null);
    setEndDate(null);
  };

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
  const fetchData = async () => {
    setLoading(true);
    setData({});
    setFilteredData([]);

    try {
      const params = { x, y };

      if (filters.company) {
        params.p_company_id = filters.company;
        console.log("Added company filter:", filters.company);
      }
      if (filters.powerPlant) {
        params.p_power_plant_id = filters.powerPlant;
        console.log("Added power plant filter:", filters.powerPlant);
      }
      if (filters.generationSource) {
        params.p_generation_source = filters.generationSource;
        console.log("Added generation source filter:", filters.generationSource);
      }
      if (filters.province) {
        params.p_province = filters.province;
        console.log("Added province filter:", filters.province);
      }

      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        const months = [];
        const years = new Set();
        const current = new Date(start.getFullYear(), start.getMonth(), 1);

        while (current <= end) {
          months.push(current.getMonth() + 1);
          years.add(current.getFullYear());
          current.setMonth(current.getMonth() + 1);
        }

        params.p_month = months;
        params.p_year = Array.from(years);

        console.log("Added date range filters:", {
          months: params.p_month,
          years: params.p_year,
        });
      }

      const query = new URLSearchParams(params).toString();
      console.log("Final query params:", query);

      const response = await api.get(`/energy/energy_dashboard?${query}`);

      const raw = response?.data;
      const energyData = raw?.energy_data || {};
      const rawData = energyData?.results || [];

      setData(energyData);
      setFilteredData(rawData);
      setEquivalenceData(raw?.equivalence_data || {});
      setHousePowerData(raw?.house_powered || {});
    } catch (error) {
      console.error("Error fetching data:", error);
      setData({});
      setFilteredData([]);
    } finally {
      setLoading(false);
    }
  };

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


  return (
    <Box
      sx={{
        display: "flex"
      }}
    >
      <SideBar />
      <Box
        sx={{
          flex: 1,
          p: 0,
          bgcolor: "#ffffff",
          display: "flex",
          flexDirection: "column",
          pb:1,
          height: "100vh", overflow: "auto"
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            px: "15px",
            pt: "15px",
            flexShrink: 0,
          }}
        >
          <DashboardHeader
            title="Power Generation"
            lastUpdated={lastUpdated}
            formatDateTime={formatDateTime}
          />
          <Box sx={{ mt: "15px" }}>
            <RefreshButton onClick={handleRefresh} />
          </Box>
        </Box>

        {/* Tabs */}
        <Box sx={{ px: "15px", pt: 0, pb: 0, flexShrink: 0 }}>
          <TabButtons tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
        </Box>

        <Box sx={{ px: "15px", pt: 0, pb: 0, flexShrink: 0 }}>
        <Stack
          direction="row"
          spacing={1}
          alignItems="flex-start"
          flexWrap="wrap" // Allow wrapping
          sx={{
            minHeight: 40,
            rowGap: 1,
            columnGap: 1,
            '@media (max-width: 600px)': {
              flexDirection: 'column',
              alignItems: 'stretch',
            },
          }}
        >
          {/* Left-side filters */}
          <MultiSelectWithChips
            label="Companies"
            options={companyOptions}
            selectedValues={companyFilter}
            onChange={setCompanyFilter}
            placeholder="All Companies"
          />

          <MultiSelectWithChips
            label="Power Plants"
            options={powerPlantOptions}
            selectedValues={powerPlantFilter}
            onChange={setPowerPlantFilter}
            placeholder="All Power Projects"
          />

          <MultiSelectWithChips
            label="Generation Sources"
            options={generationSourceOptions}
            selectedValues={generationSourceFilter}
            onChange={setGenerationSourceFilter}
            placeholder="All Sources"
          />

          <MonthRangeSelect
            label="All Time"
            startDate={startDate}
            endDate={endDate}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
          />

          {showClearButton && (
            <ClearButton onClick={clearAllFilters} />
          )}

          {/* Spacer */}
          <Box sx={{ flexGrow: 1, minWidth: 10 }} />

          {/* Right-side dropdowns */}
          <SingleSelectDropdown
            label="Group By"
            options={xOptions}
            selectedValue={x}
            onChange={setX}
          />

          <SingleSelectDropdown
            label="Time Interval"
            options={yOptions}
            selectedValue={y}
            onChange={setY}
          />
        </Stack>
      </Box>

      <Box sx={{ px: "10px", pt: 0, pb: 0, flexShrink: 0 }}>
        {/* Main KPI */}
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            flexWrap: 'nowrap',
            px: "15px",
            pt: 1,
            pb: 1,
            flexShrink: 0,
          }}
        >
          <KPICard
            loading={false}
            value={`${(data?.totals?.total_energy_generated || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
            unit="kWh"
            title="Total Energy Generated"
            colorScheme={{
              backgroundColor: '#1E40AF', // dark blue
              textColor: '#FFFFFF',       // white text
              iconColor: '#FFFFFF',       // white icon
            }}
            style={{ flex: 1 }}
          />
          <KPICard
            loading={false}
            value={`${(data?.totals?.total_co2_avoidance || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
            unit="tons CO2"
            title="Total CO₂ Avoided"
            colorScheme={{
              backgroundColor: '#1E40AF', // dark blue
              textColor: '#FFFFFF',       // white text
              iconColor: '#FFFFFF',       // white icon
            }}
            style={{ flex: 1 }}
          />
          <KPICard
            loading={false}
            value={`${(housePowerData?.totals?.est_house_powered || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
            unit=""
            title="Estimated No. of Households Powered"
            colorScheme={{
              backgroundColor: '#1E40AF', // dark blue
              textColor: '#FFFFFF',       // white text
              iconColor: '#FFFFFF',       // white icon
            }}

            style={{ flex: 1 }}
          />
        </Box>          
        </Box>
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              flexWrap: 'nowrap',
              px: "15px",
              pt: 0,
              pb: 0,
              flexShrink: 0,
            }}
          >
          {/* Content Charts */}
      {activeTab === "generation" && (
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            px: 1,
            gap: 2,
            overflowY: 'inherit',
          }}
        >
          {/* Row 1: Line and Pie */}
          <Box
            sx={{
              display: 'flex',
              flexGrow: 1,
              minHeight: 0,
              gap: 2,
              flexWrap: 'wrap',
            }}
          >
            <Box sx={{ flex: 2, minHeight: 0, height: '40vh' }}>
              <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
                <LineChartComponent
                  title="Total Energy Generated Over Time"
                  data={data?.line_graph?.total_energy_generated || []}
                  xAxisLabel=""
                  yAxisLabel="Energy Generated (kWh)"
                />
              </Paper>
            </Box>

            <Box sx={{ flex: 1, minHeight: 0, height: '40vh' }}>
              <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
                <PieChartComponent
                  title="Total Energy Generated (Pie)"
                  data={data?.pie_chart?.total_energy_generated || []}
                />
              </Paper>
            </Box>
          </Box>

          {/* Row 2: Bar and Households */}
          <Box
            sx={{
              display: 'flex',
              flexGrow: 1,
              minHeight: 0,
              gap: 2,
              flexWrap: 'wrap',
            }}
          >
            <Box sx={{ flex: 1, minHeight: 0, height: '40vh' }}>
              <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
                <BarChartComponent
                  title="Total Energy Generated (Bar)"
                  data={data?.bar_chart?.total_energy_generated || []}
                  legendName="Total Energy Generated"
                  unit="kWh"
                />
              </Paper>
            </Box>

            <Box sx={{ flex: 1, minHeight: 0, height: '40vh' }}>
              <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
                <LineChartComponent
                  title="Estimated Households Powered Over Time"
                  data={housePowerData?.line_graph?.est_house_powered || []}
                  xAxisLabel=""
                  yAxisLabel="No. of Households"
                />
              </Paper>
            </Box>
          </Box>
        </Box>
      )}










          {activeTab === "avoidance" && <AvoidanceTab />}

        </Box>
      </Box> 
      </Box>
  );
}

export default PowerDashboard;
