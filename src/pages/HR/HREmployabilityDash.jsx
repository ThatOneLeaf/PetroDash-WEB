import { useState, useEffect, useMemo } from "react";
import {
  Button,
  Box,
  Modal,
  Paper,
  Typography,
  IconButton,
  Stack,
} from "@mui/material";

import {
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
} from "recharts";

import CloseIcon from "@mui/icons-material/Close";
import LaunchIcon from "@mui/icons-material/Launch";
import ClearIcon from "@mui/icons-material/Clear";
import api from "../../services/api";

import { useFilteredData } from "../../components/hr_components/filtering";

import { format } from "date-fns";

import Table from "../../components/Table/Table";
import Filter from "../../components/Filter/Filter";
import Search from "../../components/Filter/Search";
import Pagination from "../../components/Pagination/pagination";
import Overlay from "../../components/modal";
import StatusChip from "../../components/StatusChip";
import SingleSelectDropdown from "../../components/DashboardComponents/SingleSelectDropdown";
import MultiSelectWithChips from "../../components/DashboardComponents/MultiSelectDropdown";
import MonthRangeSelect from "../../components/DashboardComponents/MonthRangeSelect";
import KPICard from "../../components/DashboardComponents/KPICard";
import BarChartComponent from "../../components/charts/BarChartComponent";
import LineChartComponent from "../../components/charts/LineChartComponent";
import PieChartComponent from "../../components/charts/PieChartComponent";
import StackedBarChartComponent from "../../components/charts/StackedBarChartComponent";
import ClearButton from "../../components/DashboardComponents/ClearButton";
import MonthRangePicker from "../../components/Filter/MonthRangePicker";
import ZoomModal from "../../components/DashboardComponents/ZoomModal"; // Adjust path as needed
import ZoomInIcon from "@mui/icons-material/ZoomIn";

const formatDateTime = (date) => format(date, "PPPpp");

// Dashboard values
const COLORS = [
  "#3B82F6",
  "#F97316",
  "#10B981",
  "#EF4444",
  "#8B5CF6",
  "#F59E0B",
];

function DemographicsDash({ shouldReload, setShouldReload }) {
  //INITIALIZE -DATA
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  //KPIs
  const [totalTrainingHours, setTotalTrainingHours] = useState(null);
  const [totalManpower, setTotalManpower] = useState(null);
  const [totalManhour, setTotalManhour] = useState(null);
  const [noLostTime, setNoLostTime] = useState(null);

  // CHARTS
  const [ageDistribution, setAgeDistribution] = useState([]);
  const [genderDistribution, setGenderDistribution] = useState([]);
  const [employeeCountByCompany, setEmployeeCountByCompany] = useState([]);
  const [incidentCount, setIncidentCount] = useState([]);
  const [monthlyManpower, setMonthlyManpower] = useState([]);
  const [monthlyManhour, setMonthlyManhour] = useState([]);

  // FILTERING
  const [companyFilter, setCompanyFilter] = useState([]);
  //const [positionFilter, setPositionFilter] = useState([]); // REMOVE THIS
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const clearAllFilters = () => {
    setCompanyFilter([]);
    //setPositionFilter([]); // REMOVE THIS
    setStartDate(null);
    setEndDate(null); 
  };

  const showClearButton = 
    companyFilter.length > 0 || 
    //positionFilter.length > 0 || //to be removed
    startDate !== null ||
    endDate !== null;


  const [zoomModal, setZoomModal] = useState({
    open: false,
    content: null,
    title: "",
    fileName: "",
  });

  const openZoomModal = (title, fileName, content) => {
    setZoomModal({
      open: true,
      title,
      fileName,
      content,
    });
  };

  //CHARTS
  useEffect(() => {
    console.log(companyFilter);

    const fetchHRData = async () => {
      try {
        const params = {};
        // if (companyFilter.length > 0)
        //   params.company_id = companyFilter.join(",");
        // if (positionFilter.length > 0) // REMOVE THIS
        //   params.position_id = positionFilter.join(",");
        // ADD START AND END DATE FILTER

        const [
          totalManpowerRes,
          totalManhoursRes, 
          totalTrainingHoursRes,
          noLostTimeRes,
          companyCountRes,
          ageDistRes,
          genderDistRes,
          incidentCountRes,
          monthlyManhourRes,
          monthlyManpowerRes,
        ] = await Promise.all([
          //KPIS
          api.get("hr/total_safety_manpower", { params }), 
          api.get("hr/total_safety_manhours", { params }),
          api.get("hr/total_training_hours", { params }),
          api.get("hr/no_lost_time", { params }),

          //CHART
          api.get("hr/employee_count_per_company", { params }), 
          api.get("hr/age_distribution", { params }),
          api.get("hr/gender_distribution_per_position", { params }), 
          api.get("hr/incident_count_per_month", { params }),
          api.get("hr/safety_manhours_per_month", { params }),
          api.get("hr/safety_manpower_per_month", { params }),
          
        ]);

        console.log("genderDistRes.data", genderDistRes.data);
        console.log("ageDistRes.data", ageDistRes.data);
        console.log("incidentCountRes.data", incidentCountRes.data);


        setTotalManpower(totalManpowerRes.data[0]["total_safety_manpower"]);
        setTotalManhour(totalManhoursRes.data[0]["total_safety_manhours"]);
        setTotalTrainingHours(totalTrainingHoursRes.data[0]["total_training_hours"]);
        setNoLostTime(noLostTimeRes.data[0]["lost_time_incidents"]);

        setEmployeeCountByCompany(
          companyCountRes.data.map((item) => ({
            company: item.company_name,
            count: item.num_employees,
          }))
        );

        setGenderDistribution(
          genderDistRes.data.map((item) => ({
            position: item.position,
            Male: parseInt(item.male),
            Female: parseInt(item.female),
          }))
        );

        setAgeDistribution(
          ageDistRes.data.map((item) => ({
            age_group: item.age_category,
            count: parseInt(item.employee_count),
          }))
        );

        setIncidentCount(
          incidentCountRes.data.map((item) => ({
            company_name: item.company_name,
            year: item.year,
            month_name: item.month_name,
            incidents: parseInt(item.incidents)
          }))
        );

        setMonthlyManhour(
          monthlyManhourRes.data.map((item) => ({
            company_name: item.company_name,
            year: item.year,
            month_name: item.month_name,
            manhours: parseInt(item.manhours)
          }))
        );

        setMonthlyManpower(
          monthlyManpowerRes.data.map((item) => ({
            company_name: item.company_name,
            year: item.year,
            month_name: item.month_name,
            total_monthly_safety_manpower: parseInt(item.total_monthly_safety_manpower)
          }))

        
        );
      } catch (error) {
        console.error("Failed to fetch HR data:", error);
        // KPIS
        setTotalManpower("N/A");
        setTotalManhour("N/A");
        setTotalTrainingHours("N/A");
        setNoLostTime("N/A");
        // CHART
        setEmployeeCountByCompany([]);
        setGenderDistribution([]);
        setAgeDistribution([]);
        setIncidentCount([]);
        setMonthlyManhour([]);
        setMonthlyManpower([])
      } finally {
        setLoading(false);
      }
    };

    fetchHRData();
  }, [companyFilter, shouldReload]);// REMOVE POSITION FILTER, ADD START AND END DATE

  const uniqueOptions = (key) => {
    return Array.from(new Set(data.map((item) => item[key]))).map((val) => ({
      label: val,
      value: val,
    }));
  };

  //helper functions for charts TEMPORARY
  const barColors = [
    "#1976d2",
    "#e57373",
    "#ffb300",
    "#388e3c",
    "#8e24aa",
    "#fbc02d",
    "#0288d1",
    "#c62828",
    "#43a047",
  ];

  const getIncidentTypes = (data) => [
    ...new Set(data.map((i) => i.incident_type)),
  ];

  const transformIncidentData = (data) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const types = getIncidentTypes(data);

    return months.map((month) => {
      const row = { month };
      types.forEach((type) => {
        row[type] = data
          .filter((i) => i.month_name === month && i.incident_type === type)
          .reduce((sum, i) => sum + i.incident_count, 0);
      });
      return row;
    });
  };

  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          zoom: "0.8",
        }}
      >
        {/* Filters */}
        <Box sx={{ px: 0, pb: 1, flexShrink: 0 }}>
          <Stack
            direction="row"
            spacing={1}
            flexWrap="wrap"
            alignItems="flex-start"
            sx={{
              rowGap: 1,
              columnGap: 0,
              "@media (max-width: 600px)": {
                flexDirection: "column",
                alignItems: "stretch",
              },
            }}
          >
            <MultiSelectWithChips
              label="Companies"
              options={uniqueOptions("company_id")}
              selectedValues={companyFilter}
              onChange={setCompanyFilter}
              placeholder="All Companies"
            />

            <MonthRangeSelect label="All Time" startDate={startDate} endDate={endDate} setStartDate={setStartDate} setEndDate={setEndDate} />
            
            {showClearButton && <ClearButton onClick={clearAllFilters} />}

            <Box sx={{ flexGrow: 1, minWidth: 10 }} />
          </Stack>
        </Box>

        {/* KPI Cards */}
        <Box sx={{ display: "flex", gap: 2, flexWrap: "nowrap", pb: 2 }}>
          <KPICard
            loading={false}
            value={totalManpower}
            unit=""
            title="Total Safety Manpower"
            colorScheme={{
              backgroundColor: "#1E40AF",
              textColor: "#FFFFFF",
              iconColor: "#FFFFFF",
            }}
            style={{ flex: 1, minHeight: "100px", fontSize: "18px" }}
          />
          <KPICard
            loading={false}
            value={totalManhour}
            unit=""
            title="Total Safety Manhours"
            colorScheme={{
              backgroundColor: "#1E40AF",
              textColor: "#FFFFFF",
              iconColor: "#FFFFFF",
            }}
            style={{ flex: 1, minHeight: "100px", fontSize: "18px" }}
          />
          <KPICard
            loading={false}
            value={totalTrainingHours}
            unit=""
            title="Total Training hours"
            colorScheme={{
              backgroundColor: "#1E40AF",
              textColor: "#FFFFFF",
              iconColor: "#FFFFFF",
            }}
            style={{ flex: 1, minHeight: "100px" }}
          />
          <KPICard
            loading={false}
            value={noLostTime}
            unit=""
            title="No Lost Time"
            colorScheme={{
              backgroundColor: "#1E40AF",
              textColor: "#FFFFFF",
              iconColor: "#FFFFFF",
            }}
            style={{ flex: 1, minHeight: "100px" }}
          />
        </Box>

        {/* Charts */}
        
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 2,
            minHeight: 0,
            flexGrow: 1,
            height: 0,
          }}
        >
        {/* Monthly Manpower */}
          <Box
            sx={{
              backgroundColor: "white",
              p: 1.5,
              borderRadius: 2,
              boxShadow: 1,
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
              height: "100%",
              width: "100%",
              maxWidth: "800px",
              cursor: "pointer",
              transition: "box-shadow 0.2s",
              overflow: "hidden",
            }}
            onClick={() =>
              openZoomModal(
                "Monthly Safety Manpower (per Company)",
                "monthly-manpower-per-company",
                () => (
            <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
              <Box sx={{ flex: 1, minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
              data={(() => {
                // Group by month, then for each company, add a line
                // Get all unique months in order
                const months = [
                  "January", "February", "March", "April", "May", "June",
                  "July", "August", "September", "October", "November", "December"
                ];
                // Get all unique companies
                const companies = [
                  ...new Set(monthlyManpower.map(item => item.company_name))
                ];
                // Group data by year and month
                const grouped = {};
                monthlyManpower.forEach(item => {
                  const key = `${item.year}-${item.month_name}`;
                  if (!grouped[key]) {
                    grouped[key] = { year: item.year, month_name: item.month_name };
                  }
                  grouped[key][item.company_name] = item.total_monthly_safety_manpower;
                });
                // Sort by year and month
                const sorted = Object.values(grouped).sort((a, b) => {
                  if (a.year !== b.year) return a.year - b.year;
                  return months.indexOf(a.month_name) - months.indexOf(b.month_name);
                });
                // Add a label for X axis
                return sorted.map(row => ({
                  ...row,
                  label: `${row.month_name} ${row.year}`,
                }));
              })()}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" angle={-45} textAnchor="end" height={60} />
              <YAxis allowDecimals={false} domain={[0, "dataMax + 10"]} />
              <Tooltip />
              <Legend />
              {[
                ...new Set(monthlyManpower.map(item => item.company_name))
              ].map((company, idx) => (
                <Line
                  key={company}
                  type="monotone"
                  dataKey={company}
                  stroke={COLORS[idx % COLORS.length]}
                  dot={{ fill: COLORS[idx % COLORS.length] }}
                  name={company}
                  strokeWidth={4}
                />
              ))}
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Box>
                )
              )
            }
            onMouseOver={e => {
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(59,130,246,0.15)";
            }}
            onMouseOut={e => {
              e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
            }}
            title="Click to enlarge"
          >
            <Typography
              sx={{
                fontSize: "13px",
                fontWeight: 600,
                mb: 1,
                color: "#1e293b",
                flexShrink: 0,
              }}
            >
              Monthly Safety Manpower (per Company)
            </Typography>
            {!monthlyManpower || monthlyManpower.length === 0 ? (
              <Box
                sx={{
            textAlign: "center",
            py: 4,
            color: "#64748b",
            backgroundColor: "#f8fafc",
            borderRadius: 1,
            fontSize: "12px",
            flex: 1,
                }}
              >
                No data available for selected filters
              </Box>
            ) : (
              <Box sx={{ flex: 1, minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={(() => {
                const months = [
                  "January", "February", "March", "April", "May", "June",
                  "July", "August", "September", "October", "November", "December"
                ];
                const companies = [
                  ...new Set(monthlyManpower.map(item => item.company_name))
                ];
                const grouped = {};
                monthlyManpower.forEach(item => {
                  const key = `${item.year}-${item.month_name}`;
                  if (!grouped[key]) {
              grouped[key] = { year: item.year, month_name: item.month_name };
                  }
                  grouped[key][item.company_name] = item.total_monthly_safety_manpower;
                });
                const sorted = Object.values(grouped).sort((a, b) => {
                  if (a.year !== b.year) return a.year - b.year;
                  return months.indexOf(a.month_name) - months.indexOf(b.month_name);
                });
                return sorted.map(row => ({
                  ...row,
                  label: `${row.month_name} ${row.year}`,
                }));
              })()}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" angle={-45} textAnchor="end" height={60} />
              <YAxis allowDecimals={false} domain={[0, "dataMax + 10"]} />
              <Tooltip />
              <Legend />
              {[
                ...new Set(monthlyManpower.map(item => item.company_name))
              ].map((company, idx) => (
                <Line
                  key={company}
                  type="monotone"
                  dataKey={company}
                  stroke={COLORS[idx % COLORS.length]}
                  dot={{ fill: COLORS[idx % COLORS.length] }}
                  name={company}
                  strokeWidth={4}
                />
              ))}
            </LineChart>
                </ResponsiveContainer>
              </Box>
            )}
          </Box>

          {/* Monthly Manhour */}
          <Box
            sx={{
              backgroundColor: "white",
              p: 1.5,
              borderRadius: 2,
              boxShadow: 1,
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
              height: "100%",
              width: "100%",
              maxWidth: "800px",
              cursor: "pointer",
              transition: "box-shadow 0.2s",
              overflow: "hidden",
            }}
            onClick={() =>
              openZoomModal(
                "Monthly Safety Manhours (per Company)",
                "monthly-manhour-per-company",
                () => (
            <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
              <Box sx={{ flex: 1, minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
              data={(() => {
                // Prepare data: group by year and month, each company as a line
                const months = [
                  "January", "February", "March", "April", "May", "June",
                  "July", "August", "September", "October", "November", "December"
                ];
                const companies = [
                  ...new Set(monthlyManhour.map(item => item.company_name))
                ];
                const grouped = {};
                monthlyManhour.forEach(item => {
                  const key = `${item.year}-${item.month_name}`;
                  if (!grouped[key]) {
                    grouped[key] = { year: item.year, month_name: item.month_name };
                  }
                  grouped[key][item.company_name] = item.manhours;
                });
                const sorted = Object.values(grouped).sort((a, b) => {
                  if (a.year !== b.year) return a.year - b.year;
                  return months.indexOf(a.month_name) - months.indexOf(b.month_name);
                });
                return sorted.map(row => ({
                  ...row,
                  label: `${row.month_name} ${row.year}`,
                }));
              })()}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" angle={-45} textAnchor="end" height={60} />
              <YAxis allowDecimals={false} domain={[0, "dataMax + 10000"]} />
              <Tooltip />
              <Legend />
              {[
                ...new Set(monthlyManhour.map(item => item.company_name))
              ].map((company, idx) => (
                <Line
                  key={company}
                  type="monotone"
                  dataKey={company}
                  stroke={COLORS[idx % COLORS.length]}
                  dot={{ fill: COLORS[idx % COLORS.length] }}
                  name={company}
                  strokeWidth={4}
                />
              ))}
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Box>
                )
              )
            }
            onMouseOver={e => {
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(59,130,246,0.15)";
            }}
            onMouseOut={e => {
              e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
            }}
            title="Click to enlarge"
          >
            <Typography
              sx={{
                fontSize: "13px",
                fontWeight: 600,
                mb: 1,
                color: "#1e293b",
                flexShrink: 0,
              }}
            >
              Monthly Safety Manhours (per Company)
            </Typography>
            {!monthlyManhour || monthlyManhour.length === 0 ? (
              <Box
                sx={{
            textAlign: "center",
            py: 4,
            color: "#64748b",
            backgroundColor: "#f8fafc",
            borderRadius: 1,
            fontSize: "12px",
            flex: 1,
                }}
              >
                No data available for selected filters
              </Box>
            ) : (
              <Box sx={{ flex: 1, minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={(() => {
                const months = [
                  "January", "February", "March", "April", "May", "June",
                  "July", "August", "September", "October", "November", "December"
                ];
                const companies = [
                  ...new Set(monthlyManhour.map(item => item.company_name))
                ];
                const grouped = {};
                monthlyManhour.forEach(item => {
                  const key = `${item.year}-${item.month_name}`;
                  if (!grouped[key]) {
              grouped[key] = { year: item.year, month_name: item.month_name };
                  }
                  grouped[key][item.company_name] = item.manhours;
                });
                const sorted = Object.values(grouped).sort((a, b) => {
                  if (a.year !== b.year) return a.year - b.year;
                  return months.indexOf(a.month_name) - months.indexOf(b.month_name);
                });
                return sorted.map(row => ({
                  ...row,
                  label: `${row.month_name} ${row.year}`,
                }));
              })()}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" angle={-45} textAnchor="end" height={60} />
              <YAxis allowDecimals={false} domain={[0, "dataMax + 10000"]} />
              <Tooltip />
              <Legend />
              {[
                ...new Set(monthlyManhour.map(item => item.company_name))
              ].map((company, idx) => (
                <Line
                  key={company}
                  type="monotone"
                  dataKey={company}
                  stroke={COLORS[idx % COLORS.length]}
                  dot={{ fill: COLORS[idx % COLORS.length] }}
                  name={company}
                  strokeWidth={4}
                />
              ))}
            </LineChart>
                </ResponsiveContainer>
              </Box>
            )}
          </Box>

        {/* Incident Count */}
        <Box
          sx={{
            backgroundColor: "white",
            p: 1.5,
            borderRadius: 2,
            boxShadow: 1,
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            height: "100%",
            cursor: "pointer",
            transition: "box-shadow 0.2s",
            width: "100%",
            maxWidth: "100%",
            overflow: "hidden",
          }}
          onClick={() =>
            openZoomModal(
              "Incidents Count",
              "incidents-count",
              () => (
                <Box
                  sx={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Box sx={{ flex: 1, minHeight: 400 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={transformIncidentData(incidentCount)}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="month"
                          angle={-45}
                          textAnchor="end"
                          height={60}
                        />
                        <YAxis allowDecimals={false} domain={[0, "dataMax + 2"]} />
                        <Tooltip />
                        <Legend />
                        {getIncidentTypes(incidentCount).map((type, idx) => (
                          <Bar
                            key={type}
                            dataKey={type}
                            stackId="a"
                            fill={barColors[idx % barColors.length]}
                            name={type}
                            barSize={12}
                          />
                        ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                </Box>
              )
            )
          }
          onMouseOver={e => {
            e.currentTarget.style.boxShadow = "0 4px 16px rgba(59,130,246,0.15)";
          }}
          onMouseOut={e => {
            e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
          }}
          title="Click to enlarge"
        >
          <Typography
            sx={{
              fontSize: "13px",
              fontWeight: 600,
              mb: 1,
              color: "#1e293b",
              flexShrink: 0,
            }}
          >
            Incidents Count
          </Typography>
          {!incidentCount || incidentCount.length === 0 ? (
            <Box
              sx={{
                textAlign: "center",
                py: 4,
                color: "#64748b",
                backgroundColor: "#f8fafc",
                borderRadius: 1,
                fontSize: "12px",
                flex: 1,
              }}
            >
              No data available for selected filters
            </Box>
          ) : (
            <Box sx={{ flex: 1, minHeight: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={transformIncidentData(incidentCount)}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis allowDecimals={false} domain={[0, "dataMax + 2"]} />
                  <Tooltip />
                  <Legend />
                  {getIncidentTypes(incidentCount).map((type, idx) => (
                    <Bar
                      key={type}
                      dataKey={type}
                      stackId="a"
                      fill={barColors[idx % barColors.length]}
                      name={type}
                      barSize={12}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </Box>
          )}
        </Box>

          {/* Bottom charts: span all 3 columns */}
          <Box
            sx={{
              gridColumn: "1 / span 3",
              display: "flex",
              justifyContent: "center",
              gap: 2,
              minHeight: 0,
              height: "40vh",
              mt: 2,
            }}
          >
            
          {/* Gender Distribution */}
          
          <Box
            sx={{
              backgroundColor: "white",
              p: 1.5,
              borderRadius: 2,
              boxShadow: 1,
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
              height: "100%",
              cursor: "pointer",
              transition: "box-shadow 0.2s",
              width: "100%",
              maxWidth: "100%",
              overflow: "hidden",
            }}
            onClick={() =>
              openZoomModal(
                "Gender Distribution by Position",
                "gender-distribution",
                () => (
                  <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
                    <Box sx={{ flex: 1, minHeight: 0 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={genderDistribution}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="position" />
                          <YAxis />
                          <Tooltip itemStyle={{ color: "#000" }} />
                          <Legend />
                          <Bar dataKey="Male" fill="#4285F4" />
                          <Bar dataKey="Female" fill="#EA4335" />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </Box>
                )
              )
            }
            onMouseOver={e => {
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(59,130,246,0.15)";
            }}
            onMouseOut={e => {
              e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
            }}
            title="Click to enlarge"
          >
            <Typography
              sx={{
                fontSize: "13px",
                fontWeight: 600,
                mb: 1,
                color: "#1e293b",
                flexShrink: 0,
              }}
            >
              Gender Distribution by Position
            </Typography>
            {!genderDistribution || genderDistribution.length === 0 ? (
              <Box
                sx={{
                  textAlign: "center",
                  py: 4,
                  color: "#64748b",
                  backgroundColor: "#f8fafc",
                  borderRadius: 1,
                  fontSize: "12px",
                  flex: 1,
                }}
              >
                No data available for selected filters
              </Box>
            ) : (
              <Box sx={{ flex: 1, minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={genderDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="position" />
                    <YAxis />
                    <Tooltip itemStyle={{ color: "#000" }} />
                    <Legend />
                    <Bar dataKey="Male" fill="#4285F4" />
                    <Bar dataKey="Female" fill="#EA4335" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            )}
          </Box>

          {/* Age Group Distribution */}
          <Box
            sx={{
              backgroundColor: "white",
              p: 1.5,
              borderRadius: 2,
              boxShadow: 1,
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
              height: "100%",
              cursor: "pointer",
              transition: "box-shadow 0.2s",
              width: "100%",
              maxWidth: "100%",
              overflow: "hidden",
            }}
            onClick={() =>
              openZoomModal(
                "Age Group Distribution",
                "age-distribution",
                () => (
                  <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
                    <Box sx={{ flex: 1, minHeight: 0 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={ageDistribution}
                            dataKey="count"
                            nameKey="age_group"
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) =>
                              `${name}: ${(percent * 100).toFixed(0)}%`
                            }
                            outerRadius="80%"
                            innerRadius="40%"
                            fill="#8884d8"
                            paddingAngle={2}
                            startAngle={90}
                            endAngle={450}
                          >
                            {ageDistribution.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value, name) => [`${value}`, name]} />
                          <Legend iconType="square" />
                        </PieChart>
                      </ResponsiveContainer>
                    </Box>
                  </Box>
                )
              )
            }
            onMouseOver={e => {
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(59,130,246,0.15)";
            }}
            onMouseOut={e => {
              e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
            }}
            title="Click to enlarge"
          >
            <Typography
              sx={{
                fontSize: "13px",
                fontWeight: 600,
                mb: 1,
                color: "#1e293b",
                flexShrink: 0,
              }}
            >
              Age Group Distribution
            </Typography>
            {!ageDistribution || ageDistribution.length === 0 ? (
              <Box
                sx={{
                  textAlign: "center",
                  py: 4,
                  color: "#64748b",
                  backgroundColor: "#f8fafc",
                  borderRadius: 1,
                  fontSize: "12px",
                  flex: 1,
                }}
              >
                No data available for selected filters
              </Box>
            ) : (
              <Box sx={{ flex: 1, minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={ageDistribution}
                      dataKey="count"
                      nameKey="age_group"
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                      outerRadius="80%"
                      innerRadius="40%"
                      fill="#8884d8"
                      paddingAngle={2}
                      startAngle={90}
                      endAngle={450}
                    >
                      {ageDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value}`, name]} />
                    <Legend iconType="square" />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            )}
          </Box>

          
          <Box
            sx={{
              backgroundColor: "white",
              p: 1.5,
              borderRadius: 2,
              boxShadow: 1,
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
              height: "100%",
              width: "100%",
                maxWidth: "800px",
                cursor: "pointer",
                transition: "box-shadow 0.2s",
                overflow: "hidden",
              }}
              onClick={() =>
                openZoomModal(
                  "Employee Count Per Company",
                  "employee-count-company",
                  () => (
                    <Box sx={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
                      <Box sx={{ flex: 1, minHeight: 0 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={employeeCountByCompany}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="company" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" name="Employee Count">
                              {employeeCountByCompany.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={COLORS[index % COLORS.length]}
                                  className="recharts-sector"
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </Box>
                    </Box>
                  )
                )
              }
              onMouseOver={e => {
                e.currentTarget.style.boxShadow = "0 4px 16px rgba(59,130,246,0.15)";
              }}
              onMouseOut={e => {
                e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
              }}
              title="Click to enlarge"
            >
              <Typography
                sx={{
                  fontSize: "13px",
                  fontWeight: 600,
                  mb: 1,
                  color: "#1e293b",
                  flexShrink: 0,
                }}
              >
                Employee Count Per Company
              </Typography>
              {!employeeCountByCompany || employeeCountByCompany.length === 0 ? (
                <Box
                  sx={{
                    textAlign: "center",
                    py: 4,
                    color: "#64748b",
                    backgroundColor: "#f8fafc",
                    borderRadius: 1,
                    fontSize: "12px",
                    flex: 1,
                  }}
                >
                  No data available for selected filters
                </Box>
              ) : (
                <Box sx={{ flex: 1, minHeight: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={employeeCountByCompany}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="company" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" name="Employee Count">
                        {employeeCountByCompany.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                            className="recharts-sector"
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              )}
            </Box>
          </Box>
        </Box> 

        <ZoomModal
          open={zoomModal.open}
          title={zoomModal.title}
          onClose={() => setZoomModal({ ...zoomModal, open: false })}
          enableDownload
          downloadFileName={zoomModal.fileName}
          height={600}
        >
          {/* Render the content function if it exists */}
          {zoomModal.content && typeof zoomModal.content === "function"
            ? zoomModal.content()
            : zoomModal.content}
        </ZoomModal>
      </Box> 
    </Box>
  );
}

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginBottom: "20px",
};

const cellStyle = {
  border: "1px solid #ddd",
  padding: "8px",
};

export default DemographicsDash;
