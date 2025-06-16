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
  CircularProgress
} from '@mui/material';

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
  const [x, setX] = useState('company_id');
  const [y, setY] = useState('monthly');

  const [companyOptions, setCompanyOptions] = useState([]);
  const [powerPlantOptions, setPowerPlantOptions] = useState([]);
  const [generationSourceOptions, setGenerationSourceOptions] = useState([]);
  const [provinceOptions, setProvinceOptions] = useState([]);

  const exportFields = ['company_name', 'site_name', 'generation_source', 'province', 'period'];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setData({});
      setFilteredData([]);

      try {
        const response = await api.get(`/energy/energy_dashboard?x=${x}&y=${y}`);
        console.log("API Response:", response.data);

        const raw = response?.data;
        const rawData = raw?.results || [];

        setData(raw || {});
        setFilteredData(rawData);
        generateFilterOptions(rawData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setData({});
        setFilteredData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [x, y]);

  const generateFilterOptions = (data) => {
    setCompanyOptions([...new Set(data.map((item) => item.company_name))].map((val) => ({ label: val, value: val })));
    setPowerPlantOptions([...new Set(data.map((item) => item.site_name))].map((val) => ({ label: val, value: val })));
    setGenerationSourceOptions([...new Set(data.map((item) => item.generation_source))].map((val) => ({ label: val, value: val })));
    setProvinceOptions([...new Set(data.map((item) => item.province))].map((val) => ({ label: val, value: val })));
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const isFiltering = Object.values(filters).some((val) => val);

  useEffect(() => {
    const applyFilters = () => {
      let temp = [...(data?.results || [])];

      if (filters.company) temp = temp.filter(item => item.company_name === filters.company);
      if (filters.powerPlant) temp = temp.filter(item => item.site_name === filters.powerPlant);
      if (filters.generationSource) temp = temp.filter(item => item.generation_source === filters.generationSource);
      if (filters.province) temp = temp.filter(item => item.province === filters.province);

      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        temp = temp.filter(item => {
          const itemDate = new Date(`${item.year}-${item.month}-01`);
          return itemDate >= start && itemDate <= end;
        });
      }

      setFilteredData(temp);
    };

    applyFilters();
  }, [filters, startDate, endDate, data]);

  const exportExcelData = (data, fields, filename) => {
    console.log('Exporting...', data, fields, filename);
    // Implement actual export logic
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
            <ButtonComp
              label="Export Data"
              rounded
              onClick={() => exportExcelData(filteredData, exportFields, "Daily Power Generated")}
              color="blue"
              startIcon={<FileUploadIcon />}
            />
          </Box>

          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>
            <Filter label="Company" placeholder="Company" options={[{ label: "All Companies", value: "" }, ...companyOptions]} value={filters.company} onChange={(val) => setFilters((prev) => ({ ...prev, company: val }))} />
            <Filter label="Power Project" placeholder="Power Project" options={[{ label: "All Power Projects", value: "" }, ...powerPlantOptions]} value={filters.powerPlant} onChange={(val) => setFilters((prev) => ({ ...prev, powerPlant: val }))} />
            <Filter label="Generation Source" placeholder="Source" options={[{ label: "All Sources", value: "" }, ...generationSourceOptions]} value={filters.generationSource} onChange={(val) => setFilters((prev) => ({ ...prev, generationSource: val }))} />
            <Filter label="Location" placeholder="Location" options={[{ label: "All Locations", value: "" }, ...provinceOptions]} value={filters.province} onChange={(val) => setFilters((prev) => ({ ...prev, province: val }))} />
            <MonthRangePicker label="Date Range" startDate={startDate} endDate={endDate} setStartDate={setStartDate} setEndDate={setEndDate} />
            <FilterRow>
              <StyledFormControl>
                <InputLabel id="x-label">Group By (X)</InputLabel>
                <StyledMUISelect labelId="x-label" value={x} onChange={(e) => setX(e.target.value)} label="Group By (X)">
                  {xOptions.map((opt) => <StyledMenuItem key={opt.value} value={opt.value}>{opt.label}</StyledMenuItem>)}
                </StyledMUISelect>
              </StyledFormControl>
              <StyledFormControl>
                <InputLabel id="y-label">Time Interval (Y)</InputLabel>
                <StyledMUISelect labelId="y-label" value={y} onChange={(e) => setY(e.target.value)} label="Time Interval (Y)">
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
              }}>
                Clear Filters
              </Button>
            )}
          </Box>

        <Box sx={{ display: "flex", gap: 3, mb: 4, flexWrap: "wrap", justifyContent: "space-between" }}>
        {data?.totals ? (
            <>
            <Box sx={{ flex: "1 1 30%", backgroundColor: "#f5f7fa", padding: "1.5rem", borderRadius: 2, boxShadow: 1, minWidth: 200, textAlign: "center" }}>
                <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>Total Energy Generated</Typography>
                <Typography variant="h5" fontWeight="bold">
                {parseFloat(data.totals.total_energy_generated || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })} kWh
                </Typography>
            </Box>
            <Box sx={{ flex: "1 1 30%", backgroundColor: "#f5f7fa", padding: "1.5rem", borderRadius: 2, boxShadow: 1, minWidth: 200, textAlign: "center" }}>
                <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>Total CO₂ Avoided</Typography>
                <Typography variant="h5" fontWeight="bold">
                {parseFloat(data.totals.total_co2_avoidance || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })} tons CO2
                </Typography>
            </Box>
            </>
        ) : (
            <>
            <Box sx={{ flex: "1 1 30%", backgroundColor: "#f5f7fa", padding: "1.5rem", borderRadius: 2, boxShadow: 1, minWidth: 200, textAlign: "center" }}>
                <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>Total Energy Generated</Typography>
                <Typography variant="h5" fontWeight="bold">
                {filteredData.reduce((sum, row) => sum + parseFloat(row.total_energy_generated || 0), 0).toLocaleString(undefined, { maximumFractionDigits: 2 })} MWh
                </Typography>
            </Box>
            <Box sx={{ flex: "1 1 30%", backgroundColor: "#f5f7fa", padding: "1.5rem", borderRadius: 2, boxShadow: 1, minWidth: 200, textAlign: "center" }}>
                <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>Total CO₂ Avoided</Typography>
                <Typography variant="h5" fontWeight="bold">
                {filteredData.reduce((sum, row) => sum + parseFloat(row.total_co2_avoidance || 0), 0).toLocaleString(undefined, { maximumFractionDigits: 2 })} tons
                </Typography>
            </Box>
            </>
        )}
        </Box>


          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
            <Tabs value={tabValue} onChange={handleTabChange} aria-label="charts tabs" variant="fullWidth">
              <Tab label="Power Generation" />
              <Tab label="CO₂ Avoidance" />
            </Tabs>
          </Box>

          {/* Chart Components */}
          {data?.line_graph?.total_energy_generated && (
            <LineChartComponent title="Total Energy Generated Over Time" data={data.line_graph.total_energy_generated} />
          )}
          {data?.line_graph?.total_co2_avoidance && (
            <LineChartComponent title="Total CO₂ Avoidance Over Time" data={data.line_graph.total_co2_avoidance} />
          )}

          {data?.bar_chart?.total_energy_generated && (
            <BarChartComponent title="Total Energy Generated (Bar)" data={data.bar_chart.total_energy_generated} />
          )}
          {data?.bar_chart?.total_co2_avoidance && (
            <BarChartComponent title="Total CO₂ Avoidance (Bar)" data={data.bar_chart.total_co2_avoidance} />
          )}

          {data?.pie_chart?.total_energy_generated && (
            <PieChartComponent title="Total Energy Generated (Pie)" data={data.pie_chart.total_energy_generated} />
          )}
          {data?.pie_chart?.total_co2_avoidance && (
            <PieChartComponent title="Total CO₂ Avoidance (Pie)" data={data.pie_chart.total_co2_avoidance} />
          )}
        </Container>
      </Box>
    </Box>
  );
}

export default EnergyDashboard;
