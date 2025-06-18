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
  Button
} from "@mui/material";

import CircularProgress from '@mui/material/CircularProgress';

import ZoomModal from "../../components/DashboardComponents/ZoomModal";

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






function PowerDashboard() {
  const lastUpdated = new Date();

  const [zoomModal, setZoomModal] = useState({
    open: false,
    title: '',
    fileName: '',
    content: null,
  });

  const openZoomModal = (title, fileName, content) => {
    setZoomModal({ open: true, title, fileName, content });
  };


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
  const [staticData, setStaticData] = useState({});
  

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

      if (startDate) {
        const start = new Date(startDate);
        const end = endDate ? new Date(endDate) : new Date(); // default to today if endDate is null


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
      setStaticData(raw?.formula || {});
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
  <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
    <SideBar />

    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 2, pt: 2, flexShrink: 0 }}>
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
      <Box sx={{ px: 2, flexShrink: 0 }}>
        <TabButtons tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </Box>

      {/* Filters */}
      <Box sx={{ px: 2, pb: 1, flexShrink: 0 }}>
        <Stack
          direction="row"
          spacing={1}
          flexWrap="wrap"
          alignItems="flex-start"
          sx={{
            rowGap: 1,
            columnGap: 1,
            '@media (max-width: 600px)': {
              flexDirection: 'column',
              alignItems: 'stretch',
            },
          }}
        >
          <MultiSelectWithChips label="Companies" options={companyOptions} selectedValues={companyFilter} onChange={setCompanyFilter} placeholder="All Companies" />
          <MultiSelectWithChips label="Power Plants" options={powerPlantOptions} selectedValues={powerPlantFilter} onChange={setPowerPlantFilter} placeholder="All Power Projects" />
          <MultiSelectWithChips label="Generation Sources" options={generationSourceOptions} selectedValues={generationSourceFilter} onChange={setGenerationSourceFilter} placeholder="All Sources" />
          <MonthRangeSelect label="All Time" startDate={startDate} endDate={endDate} setStartDate={setStartDate} setEndDate={setEndDate} />

          {showClearButton && <ClearButton onClick={clearAllFilters} />}

          <Box sx={{ flexGrow: 1, minWidth: 10 }} />
          <SingleSelectDropdown label="Group By" options={xOptions} selectedValue={x} onChange={setX} />
          <SingleSelectDropdown label="Time Interval" options={yOptions} selectedValue={y} onChange={setY} />
        </Stack>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, px: 2, pb: 2, minHeight: 0, display: 'flex', flexDirection: 'column' }}>


        {/* KPI Cards */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'nowrap', pb: 2 }}>
          <KPICard
            loading={false}
            value={`${(data?.totals?.total_energy_generated || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
            unit="kWh"
            title="Total Energy Generated"
            colorScheme={{ backgroundColor: '#1E40AF', textColor: '#FFFFFF', iconColor: '#FFFFFF' }}
            style={{ flex: 1 }}
          />
          <KPICard
            loading={false}
            value={`${(data?.totals?.total_co2_avoidance || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
            unit="tons CO2"
            title="Total CO₂ Avoided"
            colorScheme={{ backgroundColor: '#1E40AF', textColor: '#FFFFFF', iconColor: '#FFFFFF' }}
            style={{ flex: 1 }}
          />
          <KPICard
            loading={false}
            value={`${roundUpToNiceNumber(housePowerData?.totals?.est_house_powered || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
            unit=""
            title="Estimated No. of Households Powered"
            colorScheme={{ backgroundColor: '#1E40AF', textColor: '#FFFFFF', iconColor: '#FFFFFF' }}
            style={{ flex: 1 }}
          />
        </Box>

        {/* Generation Charts */}
        {activeTab === "generation" && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, minHeight: 0, flex: 1 }}>
            <Box sx={{ display: 'flex', gap: 2, flex: 1, minHeight: 0, maxHeight: '50%' }}>
              <Box sx={{ flex: 1, minHeight: 0, height: '100%' }}>
                <Paper sx={{ height: '100%', p: 2, position: 'relative' }}>
                  <Box sx={{ width: '100%', height: '100%' }}>
                    <LineChartComponent
                      title={generateFullChartTitle("Total Energy Generated", x, y, filters, startDate, endDate)}
                      data={data?.line_graph?.total_energy_generated || []}
                      yAxisLabel="Energy Generated (kWh)"
                    />
                  </Box>
                  <Button
                    size="small"
                    sx={{ position: 'absolute', top: 8, right: 8 }}
                    onClick={() =>
                      openZoomModal(
                        generateFullChartTitle("Total Energy Generated", x, y, filters, startDate, endDate),
                        "total_energy_generated_chart",
                        <LineChartComponent
                          title={generateFullChartTitle("Total Energy Generated", x, y, filters, startDate, endDate)}
                          data={data?.line_graph?.total_energy_generated || []}
                          yAxisLabel="Energy Generated (kWh)"
                        />
                      )
                    }
                  >
                    🔍
                  </Button>
                </Paper>
              </Box>

              <Box sx={{ flex: 1, minHeight: 0, height: '100%' }}>
                <Paper sx={{ height: '100%', p: 2, position: 'relative' }}>
                  <Box sx={{ width: '100%', height: '100%' }}>
                    <PieChartComponent
                      title={generateFullChartTitle("Power Generation Breakdown", x, y, filters, startDate, endDate)}
                      data={data?.pie_chart?.total_energy_generated || []}
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
                          data={data?.pie_chart?.total_energy_generated || []}
                        />
                      )
                    }
                  >
                    🔍
                  </Button>
                </Paper>
              </Box>
            </Box>


            <Box sx={{ display: 'flex', gap: 2, flex: 1, minHeight: 0, maxHeight: '50%' }}>
              {/* Stacked Bar Chart */}
              <Box sx={{ flex: 1, minHeight: 0, height: '100%' }}>
                <Paper sx={{ height: '100%', p: 2, position: 'relative' }}>
                  <Box sx={{ width: '100%', height: '100%' }}>
                    <StackedBarChartComponent
                      title="sample"
                      data={data?.stacked_bar || []}
                      legendName="Total Energy Generated"
                      unit="kWh"
                    />
                  </Box>
                  <Button
                    size="small"
                    sx={{ position: 'absolute', top: 8, right: 8 }}
                    onClick={() =>
                      openZoomModal(
                        "Zoomed In: Total Energy Generated (Bar)",
                        "total_energy_generated_bar",
                        <BarChartComponent
                          title="Total Energy Generated (Bar)"
                          data={data?.bar_chart?.total_energy_generated || []}
                          legendName="Total Energy Generated"
                          unit="kWh"
                        />
                      )
                    }
                  >
                    🔍
                  </Button>
                </Paper>
              </Box>

              {/* Line Chart - Households Powered */}
              <Box sx={{ flex: 1, minHeight: 0, height: '100%' }}>
                <Paper sx={{ height: '100%', p: 2, position: 'relative' }}>
                  <Box sx={{ width: '100%', height: '100%' }}>
                    <LineChartComponent
                      title="Estimated Households Powered Over Time"
                      data={housePowerData?.line_graph?.est_house_powered || []}
                      yAxisLabel="No. of Households"
                    />
                  </Box>
                  <Button
                    size="small"
                    sx={{ position: 'absolute', top: 8, right: 8 }}
                    onClick={() =>
                      openZoomModal(
                        "Zoomed In: Households Powered Over Time",
                        "households_powered_over_time",
                        <LineChartComponent
                          title="Estimated Households Powered Over Time"
                          data={housePowerData?.line_graph?.est_house_powered || []}
                          yAxisLabel="No. of Households"
                        />
                      )
                    }
                  >
                    🔍
                  </Button>
                </Paper>
              </Box>
            </Box>
          </Box>
        )}

        {/* Avoidance Charts (keep as is) */}
        {activeTab === "avoidance" && (
        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'row', px: 1, gap: 2, overflowY: 'inherit'}}>
          {/* Column 1 */}
          <Box sx={{ flex: '0 0 45%', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Paper elevation={3} sx={{ p: 1, height: 200, position: 'relative' }}>
              <LineChartComponent
                title="Monthly CO2 Avoidance Trends by Power Plant"
                data={data?.line_graph?.total_co2_avoidance || []}
                xAxisLabel=""
                yAxisLabel="tons CO2"
                unit="tons CO2"
              />
              <Button
                size="small"
                sx={{ position: 'absolute', top: 8, right: 8 }}
                onClick={() =>
                  openZoomModal(
                    "Zoomed In: Monthly CO2 Avoidance Trends by Power Plant",
                    "co2_avoidance_trends_chart",
                    <LineChartComponent
                      title="Monthly CO2 Avoidance Trends by Power Plant"
                      data={data?.line_graph?.total_co2_avoidance || []}
                      xAxisLabel=""
                      yAxisLabel="tons CO2"
                      unit="tons CO2"
                    />
                  )
                }
              >
                🔍
              </Button>
            </Paper>

            <Paper elevation={3} sx={{ p: 1, flex: 1, height: 150 }}>
              <TableContainer component={Box} sx={{ maxHeight: 200 }}>
                <Table size="small" aria-label="summary table">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Source</strong></TableCell>
                      <TableCell><strong>Formula</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[...Array(3)].map((_, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {(staticData?.[index]?.label || `Label ${index + 1}`)
                            .replace(/\b\w/g, char => char.toUpperCase())}
                        </TableCell>

                        <TableCell>{staticData?.[index]?.formula
                            ? staticData[index].formula.split(';').map((line, i) => (
                                <div key={i}>{line}</div>
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
          <Box sx={{ flex: '0 0 55%', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Paper elevation={3} sx={{ p: 1, height: 'calc(100% - 20px)', position: 'relative' }}>
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  alignContent: 'center',
                  alignItems: 'center',
                  height: '100%',
                  gap: 2,
                }}
              >
                {Object.entries(equivalenceData).map(([eqKey, eq], index) => {
                  const category = (eq.metric || '').toLowerCase();
                  const scheme = colorSchemes[eq.equivalence_category] || colorSchemes.default;

                  return (
                    <Box
                      key={eqKey}
                      sx={{
                        flex: '1 0 calc(33.333% - 12px)',
                        minWidth: '200px',
                        height: '90px',
                      }}
                    >
                      <KPICard
                        loading={false}
                        value={`${(eq.co2_equivalent || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
                        unit=""
                        title={eq.metric || `Metric ${index + 1}`}
                        icon={iconMap[eqKey]}
                        colorScheme={scheme}
                        style={{
                          height: '100%',
                          width: '100%',
                          display: 'flex',
                          flexDirection: 'row',
                          justifyContent: 'center',
                        }}
                      />
                    </Box>
                  );
                })}
              </Box>
            </Paper>
          </Box>
        </Box>
      )}

        <ZoomModal
          open={zoomModal.open}
          onClose={() => setZoomModal({ ...zoomModal, open: false })}
          title={zoomModal.title}
          downloadFileName={zoomModal.fileName}
          enableDownload
        >
          {zoomModal.content}
        </ZoomModal>
      </Box>
    </Box>
  </Box>
);

}

export default PowerDashboard;
