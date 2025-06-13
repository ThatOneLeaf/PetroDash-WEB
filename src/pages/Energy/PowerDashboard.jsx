import React, { useState } from "react";
import ClearIcon from '@mui/icons-material/Clear';
import FileUploadIcon from "@mui/icons-material/FileUpload";
import {
  Box,
  Button,
  Container,
  Typography,
  Tabs,
  Tab,
} from "@mui/material";

import ButtonComp from "../../components/ButtonComp";
import DateRangePicker from "../../components/Filter/DateRangePicker";
import Filter from "../../components/Filter/Filter";
import RepositoryHeader from "../../components/RepositoryHeader";
import SideBar from "../../components/Sidebar";
import { exportExcelData } from "../../services/directExport";

// Import Icons
import FlashOnIcon from "@mui/icons-material/FlashOn";
import EnergySavingsLeafIcon from "@mui/icons-material/EnergySavingsLeaf";
import HomeIcon from "@mui/icons-material/Home";
import FactoryIcon from "@mui/icons-material/Factory";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import WaterIcon from "@mui/icons-material/Water";
import WindPowerIcon from "@mui/icons-material/WindPower";
import SolarPowerIcon from "@mui/icons-material/SolarPower";
import BatteryChargingFullIcon from "@mui/icons-material/BatteryChargingFull";
import TroubleshootIcon from "@mui/icons-material/Troubleshoot";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import TimelineIcon from "@mui/icons-material/Timeline";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
  BarChart, Bar,
} from 'recharts';
import MonthRangePicker from "../../components/Filter/MonthRangePicker";

function PowerDashboard() {
  // State for filters, dates, page
  const [filters, setFilters] = useState({
    company: '',
    powerPlant: '',
    generationSource: '',
    province: ''
  });
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [page, setPage] = useState(1);

  // State for tab selection
  const [tabValue, setTabValue] = useState(0);
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Dummy options (replace with your actual options)
  const companyOptions = [];
  const powerPlantOptions = [];
  const generationSourceOptions = [];
  const provinceOptions = [];

  // Dummy export fields and filtered data
  const exportFields = [];
  const filteredData = [];

  // KPIs dummy data
  const kpis = [
    { label: "Total Energy Generated", value: "217.06 Gwh" },
    { label: "Total Emission Reduction", value: "49,639.06 tons CO2" },
    { label: "Estimated Number of Households Powered", value: "87,000" },
  ];

  // Dummy data for charts - replace with your real data

  // Line chart data
  const lineChartData = [
    { date: "2025-06-01", power: 50 },
    { date: "2025-06-02", power: 75 },
    { date: "2025-06-03", power: 65 },
    { date: "2025-06-04", power: 90 },
    { date: "2025-06-05", power: 100 },
    { date: "2025-06-06", power: 85 },
    { date: "2025-06-07", power: 95 },
  ];

  // Pie chart data
  const pieChartData = [
    { name: "Solar", value: 400 },
    { name: "Wind", value: 300 },
    { name: "Hydro", value: 300 },
    { name: "Thermal", value: 200 },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  // Bar chart 1 data
  const barChartData1 = [
    { name: "Jan", generated: 400 },
    { name: "Feb", generated: 300 },
    { name: "Mar", generated: 500 },
    { name: "Apr", generated: 700 },
    { name: "May", generated: 600 },
  ];

  // Bar chart 2 data
  const barChartData2 = [
    { name: "Solar", count: 5 },
    { name: "Wind", count: 4 },
    { name: "Hydro", count: 3 },
    { name: "Thermal", count: 3 },
  ];
  const kpisTab2 = [
  { label: "Total Energy Generated", value: "217.06 GWh", icon: <FlashOnIcon color="primary" fontSize="large" /> },
  { label: "CO2 Emission Reduction", value: "49,639.06 tons", icon: <EnergySavingsLeafIcon color="success" fontSize="large" /> },
  { label: "Households Powered", value: "87,000", icon: <HomeIcon color="secondary" fontSize="large" /> },
  { label: "Total Projects", value: "15", icon: <FactoryIcon color="action" fontSize="large" /> },
  { label: "Avg. Power Output", value: "325 MWh", icon: <TimelineIcon color="info" fontSize="large" /> },
  { label: "Thermal Plants", value: "3", icon: <ThermostatIcon color="error" fontSize="large" /> },
  { label: "Hydro Plants", value: "3", icon: <WaterIcon color="primary" fontSize="large" /> },
  { label: "Wind Plants", value: "4", icon: <WindPowerIcon color="info" fontSize="large" /> },
  { label: "Solar Plants", value: "5", icon: <SolarPowerIcon color="warning" fontSize="large" /> },
  { label: "Battery Storage", value: "2 Units", icon: <BatteryChargingFullIcon color="success" fontSize="large" /> },
  { label: "Monitoring Sites", value: "12", icon: <TroubleshootIcon color="secondary" fontSize="large" /> },
  { label: "KPIs Tracked", value: "25", icon: <QueryStatsIcon color="action" fontSize="large" /> },
];

  const computation = [
    {source:"Geothermal", formula:"kg CO2 avoided = Energy Generated (kWh) * 0.607 kg CO2/kWh \nkg CO2 emitted = Energy Generated (kWh) * 0.128 kg CO2/kWh\nEmission Reduction = kg CO2 avoided - kg CO2 emitted"},
    {source:"Wind (On shore)", formula:"Emission Reduction = Energy Generated (kWh) * 0.00460 kg CO2/kWh"},
    {source:"Solar", formula:"Emission Reduction = Energy Generated (kWh) * 0.05800 kg CO2/kWh"}
  ]
  

  // Boolean to track filtering state
  const isFiltering = Object.values(filters).some(val => val) || startDate || endDate;

  return (
    <Box sx={{ display: "flex" }}>
      <SideBar />
      <Box sx={{ flexGrow: 1, height: "100vh", overflow: "auto" }}>
        <Container maxWidth={false} disableGutters sx={{ padding: "2rem" }}>

          {/* Header & Export Button */}
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
                    {/* Filters */}
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>
            <Filter
              label="Company"
              placeholder="Company"
              options={[{ label: "All Companies", value: "" }, ...companyOptions]}
              value={filters.company}
              onChange={(val) => {
                setFilters((prev) => ({ ...prev, company: val }));
                setPage(1);
              }}
            />
            <Filter
              label="Power Project"
              placeholder="Power Project"
              options={[{ label: "All Power Projects", value: "" }, ...powerPlantOptions]}
              value={filters.powerPlant}
              onChange={(val) => {
                setFilters((prev) => ({ ...prev, powerPlant: val }));
                setPage(1);
              }}
            />
            <Filter
              label="Generation Source"
              placeholder="Source"
              options={[{ label: "All Sources", value: "" }, ...generationSourceOptions]}
              value={filters.generationSource}
              onChange={(val) => {
                setFilters((prev) => ({ ...prev, generationSource: val }));
                setPage(1);
              }}
            />
            <Filter
              label="Location"
              placeholder="Location"
              options={[{ label: "All Locations", value: "" }, ...provinceOptions]}
              value={filters.province}
              onChange={(val) => {
                setFilters((prev) => ({ ...prev, status: val }));
                setPage(1);
              }}
            />
            <MonthRangePicker
              label="Date Range"
              startDate={startDate}
              endDate={endDate}
              setStartDate={setStartDate}
              setEndDate={setEndDate}
            />
            {(isFiltering || startDate || endDate) && (
              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                sx={{
                  color: '#182959',
                  borderRadius: '999px',
                  padding: '9px 18px',
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                }}
                onClick={() => {
                  setFilters({
                    company: '',
                    powerPlant: '',
                    generationSource: '',
                    province: '',
                    status: '',
                  });
                  setStartDate(null);
                  setEndDate(null);
                  setPage(1);
                }}
              >
                Clear Filters
              </Button>
            )}
          </Box>

          {/* KPI Boxes */}
          <Box
            sx={{
              display: "flex",
              gap: 3,
              mb: 4,
              flexWrap: "wrap",
              justifyContent: "space-between",
            }}
          >
            {kpis.map(({ label, value }, index) => (
              <Box
                key={index}
                sx={{
                  flex: "1 1 30%",
                  backgroundColor: "#f5f7fa",
                  padding: "1.5rem",
                  borderRadius: 2,
                  boxShadow: 1,
                  minWidth: 200,
                  textAlign: "center",
                }}
              >
                <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1 }}>
                  {label}
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {value}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Tabs for charts */}
          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
                <Tabs
                value={tabValue}
                onChange={handleTabChange}
                aria-label="charts tabs"
                variant="fullWidth"
                >
                <Tab label="Power Generation" />
                <Tab label="CO2 Avoidance" />
                </Tabs>
          </Box>

          {/* Tab Panel for Overview: Line Chart + Pie Chart */}
          {tabValue === 0 && (
            <Box
              sx={{
                display: "flex",
                gap: 4,
                flexWrap: "wrap",
                mb: 4,
                justifyContent: "space-between",
              }}
            >
              {/* Line Chart */}
              <Box sx={{ flex: "1 1 60%", minWidth: 300, height: 300, backgroundColor: "#fff", padding: 2, borderRadius: 2, boxShadow: 1 }}>
                <Typography variant="h6" mb={2}>
                  Daily Power Generated (MWh)
                </Typography>
                <ResponsiveContainer width="100%" height="85%">
                  <LineChart data={lineChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="power" stroke="#8884d8" strokeWidth={3} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </Box>

              {/* Pie Chart */}
              <Box sx={{ flex: "1 1 35%", minWidth: 250, height: 300, backgroundColor: "#fff", padding: 2, borderRadius: 2, boxShadow: 1, textAlign: "center" }}>
                <Typography variant="h6" mb={2}>
                  Power Generation Sources
                </Typography>
                <ResponsiveContainer width="100%" height="85%">
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      label
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
              {/* Bar Chart 1 */}
              <Box sx={{ flex: "1 1 48%", minWidth: 300, height: 300, backgroundColor: "#fff", padding: 2, borderRadius: 2, boxShadow: 1 }}>
                <Typography variant="h6" mb={2}>
                  Monthly Power Generated (MWh)
                </Typography>
                <ResponsiveContainer width="100%" height="85%">
                  <BarChart data={barChartData1} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="generated" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>

              {/* Bar Chart 2 */}
              <Box sx={{ flex: "1 1 48%", minWidth: 300, height: 300, backgroundColor: "#fff", padding: 2, borderRadius: 2, boxShadow: 1 }}>
                <Typography variant="h6" mb={2}>
                  Number of Projects by Source
                </Typography>
                <ResponsiveContainer width="100%" height="85%">
                  <BarChart data={barChartData2} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          )}

          {/* Tab 2 Content */}
        {tabValue === 1 && (
          <Box sx={{ mb: 4 }}>
            {/* KPI Section */}
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 3,
                justifyContent: "space-between",
                mb: 4,
              }}
            >
              {kpisTab2.map(({ label, value, icon }, index) => (
                <Box
                  key={index}
                  sx={{
                    flex: "1 1 22%",
                    minWidth: 220,
                    backgroundColor: "#f5f7fa",
                    borderRadius: 2,
                    padding: 2,
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    boxShadow: 1,
                  }}
                >
                  <Box>{icon}</Box>
                  <Box>
                    <Typography variant="body2" color="textSecondary">
                      {label}
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {value}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 2,
                mb: 4,
              }}
            >
          {/* Line Chart */}
          <Box
            sx={{
              flex: "1 1 60%",
              minWidth: 300,
              height: 300,
              backgroundColor: "#fff",
              padding: 2,
              borderRadius: 2,
              boxShadow: 1,
            }}
          >
            <Typography variant="h6" mb={2}>
              Daily Power Generated (MWh)
            </Typography>
            <ResponsiveContainer width="100%" height="85%">
              <LineChart data={lineChartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="power" stroke="#8884d8" strokeWidth={3} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </Box>

        {/* Table Section */}
        <Box
          sx={{
            flex: "1 1 38%",
            minWidth: 300,
            backgroundColor: "#fff",
            padding: 2,
            borderRadius: 2,
            boxShadow: 1,
          }}
        >
          <Typography variant="h6" mb={2}>
            Emission Reduction Computation
          </Typography>
            <Box sx={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f0f0f0" }}>
                    <th style={{ padding: "12px", textAlign: "left" }}>Source</th>
                    <th style={{ padding: "12px", textAlign: "left" }}>Formula</th>
                  </tr>
                </thead>
                <tbody>
                  {computation.map((item, index) => (
                    <tr key={index}>
                      <td style={{ padding: "10px", verticalAlign: "top" }}>{item.source}</td>
                      <td style={{ padding: "10px", whiteSpace: "pre-line" }}>{item.formula}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          </Box>
        </Box>   
      </Box>
        )}
        </Container>
      </Box>
    </Box>
  );
}

export default PowerDashboard;
