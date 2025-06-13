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
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import ElectricCarIcon from "@mui/icons-material/ElectricCar";
import MapIcon from "@mui/icons-material/Map";
import LocalGasStationIcon from "@mui/icons-material/LocalGasStation";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import FactoryIcon from "@mui/icons-material/Factory";
import SmartphoneIcon from "@mui/icons-material/Smartphone";
import RecyclingIcon from "@mui/icons-material/Recycling";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";
import WindPowerIcon from "@mui/icons-material/WindPower";
import ForestIcon from "@mui/icons-material/Forest";

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

const data = [
  { month: "January", DSPP: 2863740.00, M1GPP: 13875420.00, M2GPP: 8310740.00, NWPP1: 12719520.00, NWPP2: 3538090.00, SJSPP: 2504910.00, TSPP1: 5602480.00, TSPP2: 2331230.00 },
  { month: "February", DSPP: 2706350.00, M1GPP: 12617340.00, M2GPP: 7498340.00, NWPP1: 11896840.00, NWPP2: 3407820.00, SJSPP: 2481960.00, TSPP1: 5344230.00, TSPP2: 2211910.00 },
  { month: "March", DSPP: 3410900.00, M1GPP: 13917870.00, M2GPP: 8210550.00, NWPP1: 11263670.00, NWPP2: 3584230.00, SJSPP: 3062220.00, TSPP1: 6958750.00, TSPP2: 2853930.00 },
  { month: "April", DSPP: 3829800.00, M1GPP: 13562100.00, M2GPP: 8031770.00, NWPP1: 6274100.00, NWPP2: 2616820.00, SJSPP: 3054940.00, TSPP1: 6262930.91, TSPP2: 2590440.00 },
  { month: "May", DSPP: 1638360.00, M1GPP: 5459340.00, M2GPP: 3752140.00, NWPP1: 1172878.00, NWPP2: 542672.00, SJSPP: 1149860.00, TSPP1: 2800428.73, TSPP2: 1149790.00 },
  { month: "June", DSPP: 0, M1GPP: 2500.00, M2GPP: 125000.00, NWPP1: 0, NWPP2: 0, SJSPP: 17010010000.00, TSPP1: 120000.00, TSPP2: 0 }
];

const plants = ["DSPP", "M1GPP", "M2GPP", "NWPP1", "NWPP2", "SJSPP", "TSPP1", "TSPP2"];

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
  {
    label: "Gasoline Vehicles (1 yr)",
    value: "87,000",
    icon: <DirectionsCarIcon color="primary" fontSize="large" />,
  },
  {
    label: "Electric Vehicles (1 yr)",
    value: "25,000",
    icon: <ElectricCarIcon color="success" fontSize="large" />,
  },
  {
    label: "Miles Driven (Gas)",
    value: "1.2M miles",
    icon: <MapIcon color="secondary" fontSize="large" />,
  },
  {
    label: "Gasoline Consumed",
    value: "500,000 gal",
    icon: <LocalGasStationIcon color="error" fontSize="large" />,
  },
  {
    label: "Diesel Consumed",
    value: "350,000 gal",
    icon: <LocalShippingIcon color="warning" fontSize="large" />,
  },
  {
    label: "Coal Plants (1 yr)",
    value: "3 Plants",
    icon: <FactoryIcon color="action" fontSize="large" />,
  },
  {
    label: "Smartphones Charged",
    value: "1.5B",
    icon: <SmartphoneIcon color="info" fontSize="large" />,
  },
  {
    label: "Waste Recycled (Tons)",
    value: "9,000 tons",
    icon: <RecyclingIcon color="success" fontSize="large" />,
  },
  {
    label: "Trash Bags Recycled",
    value: "180,000 bags",
    icon: <DeleteIcon color="secondary" fontSize="large" />,
  },
  {
    label: "Garbage Trucks Saved",
    value: "150 trucks",
    icon: <DeleteSweepIcon color="error" fontSize="large" />,
  },
  {
    label: "Wind Turbines (1 yr)",
    value: "120 units",
    icon: <WindPowerIcon color="primary" fontSize="large" />,
  },
  {
    label: "Tree Seedlings (10 yrs)",
    value: "3M trees",
    icon: <ForestIcon color="success" fontSize="large" />,
  },
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
                  Monthly Energy Generation Trends by Power Plant
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                  <CartesianGrid stroke="#eee" strokeDasharray="5 5" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey={plants} stroke="#8884d8" dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
              </Box>

              {/* Pie Chart */}
              <Box sx={{ flex: "1 1 35%", minWidth: 250, height: 300, backgroundColor: "#fff", padding: 2, borderRadius: 2, boxShadow: 1, textAlign: "center" }}>
                <Typography variant="h6" mb={2}>
                  Energy Generation Breakdown by Company
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
                  Monthly Distribution of Energy Generated by Company
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
                  Number of Households Powered per Month by Company
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
              Monthly Distribution of CO2 Avoidance by Company
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
