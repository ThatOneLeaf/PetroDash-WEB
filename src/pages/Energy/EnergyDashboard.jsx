import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import SideBar from '../../components/Sidebar';
import RepositoryHeader from '../../components/RepositoryHeader';
import ButtonComp from '../../components/ButtonComp';
import Filter from '../../components/Filter/Filter';
import MonthRangePicker from '../../components/Filter/MonthRangePicker';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import ClearIcon from '@mui/icons-material/Clear';
import LineChartComponent from '../../components/charts/LineChartComponent';
import BarChartComponent from '../../components/charts/BarChartComponent';
import PieChartComponent from '../../components/charts/PieChartComponent';
import {
  FilterRow,
  StyledFormControl,
  StyledMUISelect,
  StyledMenuItem,
} from "../../components/StyledSelect";
import {
  Box,
  InputLabel,
  Container,
  Typography,
  Button,
  Tabs,
  Tab,
  Tooltip,
  CircularProgress
} from '@mui/material';

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

const getUniqueOptions = (data, idField, nameField) => {
  const seen = new Set();
  return data
    .filter(item => {
      const id = String(item[idField]);
      if (!id || seen.has(id)) return false;
      seen.add(id);
      return true;
    })
    .map(item => ({
      value: item[idField],
      label: item[nameField]
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
};

function formatValue(value) {
  const num = parseFloat(value);

  // If it's >= 1000 or has no decimals, show no decimal places
  if (num >= 1000 || Number.isInteger(num)) {
    return num.toLocaleString(undefined, { maximumFractionDigits: 0 });
  }

  // Otherwise, keep up to 2 decimal places
  return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
}


function EnergyDashboard() {
  const [data, setData] = useState({});
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    company: '',
    powerPlant: '',
    generationSource: '',
    province: '',
  });

  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(1);
  const [x, setX] = useState('power_plant_id');
  const [y, setY] = useState('monthly');

  const [companyOptions, setCompanyOptions] = useState([]);
  const [powerPlantOptions, setPowerPlantOptions] = useState([]);
  const [generationSourceOptions, setGenerationSourceOptions] = useState([]);
  const [provinceOptions, setProvinceOptions] = useState([]);
  const [plantMetadata, setPlantMetadata] = useState([]);
  const [equivalenceData, setEquivalenceData] = useState({});
  const [housePowerData, setHousePowerData] = useState({});

  const exportFields = ['company_name', 'site_name', 'generation_source', 'province', 'period'];

  const iconMap = {
  EQ_1: <DirectionsCarIcon fontSize="large" />,
  EQ_2: <ElectricCarIcon fontSize="large" />,
  EQ_3: <MapIcon fontSize="large" />,
  EQ_4: <LocalGasStationIcon fontSize="large" />,
  EQ_5: <LocalShippingIcon fontSize="large" />,
  EQ_6: <FactoryIcon fontSize="large" />,
  EQ_7: <SmartphoneIcon fontSize="large" />,
  EQ_8: <RecyclingIcon fontSize="large" />,
  EQ_9: <DeleteIcon fontSize="large" />,
  EQ_10: <LocalMallIcon fontSize="large" />,
  EQ_11: <WindPowerIcon fontSize="large" />,
  EQ_12: <ForestIcon fontSize="large" />,
};

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setData({});
      setFilteredData([]);

      try {
        const params = { x, y };

        if (filters.company) params.p_company_id = filters.company;
        if (filters.powerPlant) params.p_power_plant_id = filters.powerPlant;
        if (filters.generationSource) params.p_generation_source = filters.generationSource;
        if (filters.province) params.p_province = filters.province;

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
        }

        const query = new URLSearchParams(params).toString();
        const response = await api.get(`/energy/energy_dashboard?${query}`);

        const raw = response?.data;
        const energyData = raw?.energy_data || {};
        const rawData = energyData?.results || [];

        setData(energyData);
        setFilteredData(rawData);
        setEquivalenceData(raw?.equivalence_data || {});
        setHousePowerData(raw?.house_powered || {});
      } catch (error) {
        console.error('Error fetching data:', error);
        setData({});
        setFilteredData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [x, y, filters, startDate, endDate]);

  useEffect(() => {
    const fetchFilterData = async () => {
      try {
        const res = await api.get('/reference/pp_info');
        const data = res.data;
        setPlantMetadata(data);

        const u = getUniqueOptions;
        const withDefault = (options, label) => [{ value: '', label }, ...options];

        setCompanyOptions(withDefault(u(data, 'company_id', 'company_name'), 'All Companies'));
        setPowerPlantOptions(withDefault(u(data, 'power_plant_id', 'site_name'), 'All Power Projects'));
        setGenerationSourceOptions(withDefault(u(data, 'generation_source', 'generation_source'), 'All Sources'));
        setProvinceOptions(withDefault(u(data, 'province', 'province'), 'All Locations'));
      } catch (err) {
        console.error('Error loading filters', err);
      }
    };

    fetchFilterData();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const isFiltering = Object.values(filters).some((val) => val);

  const exportExcelData = (data, fields, filename) => {
    console.log('Exporting...', data, fields, filename);
  };

  const xOptions = [
    { label: "Power Plant", value: "power_plant_id" },
    { label: "Company", value: "company_id" },
    { label: "Generation Source", value: "generation_source" },
    { label: "Province", value: "province" },
  ];

  const yOptions = [
    { label: "Monthly", value: "monthly" },
    { label: "Quarterly", value: "quarterly" },
    { label: "Yearly", value: "yearly" },
  ];

  const kpis = [
    {
      label: 'Total Energy Generated',
      value: filteredData.reduce((sum, row) => sum + parseFloat(row.total_energy_generated || 0), 0).toLocaleString(undefined, { maximumFractionDigits: 2 }) + ' MWh'
    },
    {
      label: 'Total CO₂ Avoided',
      value: filteredData.reduce((sum, row) => sum + parseFloat(row.total_co2_avoidance || 0), 0).toLocaleString(undefined, { maximumFractionDigits: 2 }) + ' tons'
    }
  ];

  if (loading) return (
    <Box sx={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', height: '100vh', bgcolor: '#f5f7fa' }}>
      <Box sx={{ textAlign: 'center' }}>
        <CircularProgress size={64} thickness={5} sx={{ color: '#182959' }} />
        <Typography sx={{ mt: 2, color: '#182959', fontWeight: 700, fontSize: 20 }}>
          Loading Energy Dashboard...
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <SideBar />
      <Box sx={{ flexGrow: 1, height: "100vh", overflow: "auto" }}>
        <Container maxWidth={false} disableGutters sx={{ padding: "2rem" }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
            <RepositoryHeader label="REPOSITORY" title="Power Generation" />
            <ButtonComp label="Export Data" rounded onClick={() => exportExcelData(filteredData, exportFields, "Daily Power Generated")} color="blue" startIcon={<FileUploadIcon />} />
          </Box>

          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>
            <Filter label="Company" placeholder='Company' options={companyOptions} value={filters.company} onChange={(val) => setFilters((prev) => ({ ...prev, company: val || '' }))} />
            <Filter label="Power Project" placeholder='Power Project' options={powerPlantOptions} value={filters.powerPlant} onChange={(val) => setFilters(prev => ({ ...prev, powerPlant: val }))} />
            <Filter label="Generation Source" placeholder='Source' options={generationSourceOptions} value={filters.generationSource} onChange={(val) => setFilters(prev => ({ ...prev, generationSource: val }))} />
            <Filter label="Location" placeholder='Location' options={provinceOptions} value={filters.province} onChange={(val) => setFilters(prev => ({ ...prev, province: val }))} />
            <MonthRangePicker startDate={startDate} endDate={endDate} setStartDate={setStartDate} setEndDate={setEndDate} />
            <FilterRow>
              <StyledFormControl>
                <InputLabel id="x-label">Group By (X)</InputLabel>
                <StyledMUISelect labelId="x-label" value={x} onChange={(e) => setX(e.target.value)}>
                  {xOptions.map((opt) => <StyledMenuItem key={opt.value} value={opt.value}>{opt.label}</StyledMenuItem>)}
                </StyledMUISelect>
              </StyledFormControl>
              <StyledFormControl>
                <InputLabel id="y-label">Time Interval (Y)</InputLabel>
                <StyledMUISelect labelId="y-label" value={y} onChange={(e) => setY(e.target.value)}>
                  {yOptions.map((opt) => <StyledMenuItem key={opt.value} value={opt.value}>{opt.label}</StyledMenuItem>)}
                </StyledMUISelect>
              </StyledFormControl>
            </FilterRow>
            {(isFiltering || startDate || endDate) && (
              <Button variant="outlined" startIcon={<ClearIcon />} sx={{ color: "#182959", borderRadius: "999px", padding: "9px 18px", fontSize: "0.85rem", fontWeight: "bold" }} onClick={() => {
                setFilters({ company: "", powerPlant: "", generationSource: "", province: "" });
                setStartDate(null);
                setEndDate(null);
                setX("company_id");
                setY("monthly");
                setPage(1);
              }}>Clear Filters</Button>
            )}
          </Box>

          <Box sx={{ display: "flex", gap: 3, mb: 4, flexWrap: "wrap", justifyContent: "space-between" }}>
            <Box sx={{ flex: "1 1 30%", backgroundColor: "#f5f7fa", padding: "1.5rem", borderRadius: 2, boxShadow: 1, minWidth: 200, textAlign: "center" }}>
              <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>Total Energy Generated</Typography>
              <Typography variant="h5" fontWeight="bold">
                {(data?.totals?.total_energy_generated || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })} kWh
              </Typography>
            </Box>
            <Box sx={{ flex: "1 1 30%", backgroundColor: "#f5f7fa", padding: "1.5rem", borderRadius: 2, boxShadow: 1, minWidth: 200, textAlign: "center" }}>
              <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>Total CO₂ Avoided</Typography>
              <Typography variant="h5" fontWeight="bold">
                {(data?.totals?.total_co2_avoidance || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })} tons
              </Typography>
            </Box>
            <Box sx={{ flex: "1 1 30%", backgroundColor: "#f5f7fa", padding: "1.5rem", borderRadius: 2, boxShadow: 1, minWidth: 200, textAlign: "center" }}>
              <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>Estimated Households Powered</Typography>
              <Typography variant="h5" fontWeight="bold">
                {(housePowerData?.totals?.est_house_powered || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </Typography>
            </Box>
{Object.entries(equivalenceData).map(([eqKey, eq]) => (
  <Box
    key={eqKey}
    sx={{
      flex: "1 1 30%",
      backgroundColor: "#f5f7fa",
      padding: "1.5rem",
      borderRadius: 2,
      boxShadow: 1,
      minWidth: 200,
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-start"
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
      {iconMap[eqKey] || <InfoOutlined fontSize="large" />}
      <Tooltip title={eq.equivalence_label} arrow>
        <Typography variant="subtitle1" fontWeight="bold" sx={{ ml: 1 }}>
          {eq.metric}
        </Typography>
      </Tooltip>
    </Box>
    <Typography variant="h6" fontWeight="bold" sx={{ alignSelf: "center" }}>
      {formatValue(eq.co2_equivalent)}
    </Typography>
  </Box>
))}

          </Box>

          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="charts tabs" variant="fullWidth">
              <Tab label="Power Generation" />
              <Tab label="CO₂ Avoidance" />
              <Tab label="Households Powered" />
            </Tabs>
          </Box>

          {tabValue === 0 && data?.line_graph?.total_energy_generated && (
            <LineChartComponent title="Total Energy Generated Over Time" data={data.line_graph.total_energy_generated} />
          )}
          {tabValue === 1 && data?.line_graph?.total_co2_avoidance && (
            <LineChartComponent title="Total CO₂ Avoidance Over Time" data={data.line_graph.total_co2_avoidance} />
          )}
          {tabValue === 2 && housePowerData?.line_graph?.est_house_powered && (
            <LineChartComponent title="Estimated Households Powered Over Time" data={housePowerData.line_graph.est_house_powered} />
          )}

          {tabValue === 0 && data?.bar_chart?.total_energy_generated && (
            <BarChartComponent title="Total Energy Generated (Bar)" data={data.bar_chart.total_energy_generated} />
          )}
          {tabValue === 1 && data?.bar_chart?.total_co2_avoidance && (
            <BarChartComponent title="Total CO₂ Avoidance (Bar)" data={data.bar_chart.total_co2_avoidance} />
          )}
          {tabValue === 2 && housePowerData?.bar_chart?.est_house_powered && (
            <BarChartComponent title="Estimated Households Powered (Bar)" data={housePowerData.bar_chart.est_house_powered} />
          )}

          {tabValue === 0 && data?.pie_chart?.total_energy_generated && (
            <PieChartComponent title="Total Energy Generated (Pie)" data={data.pie_chart.total_energy_generated} />
          )}
          {tabValue === 1 && data?.pie_chart?.total_co2_avoidance && (
            <PieChartComponent title="Total CO₂ Avoidance (Pie)" data={data.pie_chart.total_co2_avoidance} />
          )}
          {tabValue === 2 && housePowerData?.pie_chart?.est_house_powered && (
            <PieChartComponent title="Estimated Households Powered (Pie)" data={housePowerData.pie_chart.est_house_powered} />
          )}
        </Container>
      </Box>
    </Box>
  );
}

export default EnergyDashboard;