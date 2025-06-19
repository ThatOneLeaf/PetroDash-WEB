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

import Table from "../../components/Table/Table";
import Filter from "../../components/Filter/Filter";
import Search from "../../components/Filter/Search";
import Pagination from "../../components/Pagination/pagination";
import Overlay from "../../components/modal";
import StatusChip from "../../components/StatusChip";
import MultiSelectWithChips from "../../components/DashboardComponents/MultiSelectDropdown";
import MonthRangeSelect from "../../components/DashboardComponents/MonthRangeSelect";
import KPICard from "../../components/DashboardComponents/KPICard";
import ClearButton from "../../components/DashboardComponents/ClearButton";
import MonthRangePicker from "../../components/Filter/MonthRangePicker";
import ZoomModal from "../../components/DashboardComponents/ZoomModal"; // Adjust path as needed
import ZoomInIcon from "@mui/icons-material/ZoomIn";
const leaveTypes = [
  { year: 2019, SPL: 3, Paternity: 1, Maternity: 6 },
  { year: 2020, SPL: 2, Paternity: 0, Maternity: 5 },
  { year: 2021, SPL: 4, Paternity: 1, Maternity: 5 },
  { year: 2022, SPL: 5, Paternity: 2, Maternity: 7 },
];

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
  const [totalEmployees, setTotalEmployees] = useState(null);
  const [avgTenure, setAvgTenure] = useState(null);
  const [employeeCountByCompany, setEmployeeCountByCompany] = useState([]);
  const [ageDistribution, setAgeDistribution] = useState([]);
  const [leaveSeasons, setLeaveSeasons] = useState([]);
  const [genderDistribution, setGenderDistribution] = useState([]);

  // FILTERING
  const [companyFilter, setCompanyFilter] = useState([]);
  const [positionFilter, setPositionFilter] = useState([]);

  const clearAllFilters = () => {
    setCompanyFilter([]);
    setPositionFilter([]);
  };

  const showClearButton = companyFilter.length > 0 || positionFilter.length > 0;

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
        if (companyFilter.length > 0)
          params.company_id = companyFilter.join(",");
        if (positionFilter.length > 0)
          params.position_id = positionFilter.join(",");

        const [
          totalEmpRes,
          avgTenureRes,
          companyCountRes,
          ageDistRes,
          leaveSeasonsRes,
          genderDistRes,
        ] = await Promise.all([
          api.get("hr/total_active_employees", { params }),
          api.get("hr/average_tenure_rate", { params }),
          api.get("hr/employee_count_per_company", { params }),
          api.get("hr/age_distribution", { params }),
          api.get("hr/peak_leave_seasons", { params }),
          api.get("hr/gender_distribution_per_position", { params }),
        ]);

        setTotalEmployees(totalEmpRes.data[0]["total_active_employees"]);
        setAvgTenure(avgTenureRes.data[0]["avg_tenure_rate"]);

        setEmployeeCountByCompany(
          companyCountRes.data.map((item) => ({
            company: item.company_id,
            count: item.employee_count,
          }))
        );

        setAgeDistribution(
          ageDistRes.data.map((item) => ({
            age_group: item.age_category,
            count: parseInt(item.total_employees),
          }))
        );

        setLeaveSeasons(
          leaveSeasonsRes.data.map((item) => ({
            year: item.year,
            leave_count: parseInt(item.total_leave),
          }))
        );

        const grouped = {};
        genderDistRes.data.forEach(
          ({ position_id, gender, employee_count }) => {
            if (!grouped[position_id])
              grouped[position_id] = {
                position: position_id,
                Male: 0,
                Female: 0,
              };
            if (gender === "M") grouped[position_id].Male = employee_count;
            if (gender === "F") grouped[position_id].Female = employee_count;
          }
        );
        setGenderDistribution(Object.values(grouped));
      } catch (error) {
        console.error("Failed to fetch HR data:", error);
        setTotalEmployees("N/A");
        setAvgTenure("N/A");
        setEmployeeCountByCompany([]);
        setAgeDistribution([]);
        setLeaveSeasons([]);
        setGenderDistribution([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHRData();
  }, [companyFilter, positionFilter, shouldReload]);

  const fetchEmployabilityData = async () => {
    try {
      setLoading(true);
      const response = await api.get("hr/employability_records_by_status");
      console.log("Employability Data from API:", response.data);
      setData(response.data);
    } catch (error) {
      console.error("Error fetching Employability data:", error);
      setError("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployabilityData();
  }, []);

  const uniqueOptions = (key) => {
    return Array.from(new Set(data.map((item) => item[key]))).map((val) => ({
      label: val,
      value: val,
    }));
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

            <MultiSelectWithChips
              label="Position"
              options={uniqueOptions("position_id")}
              selectedValues={positionFilter}
              onChange={setPositionFilter}
              placeholder="All Position"
            />
            <MultiSelectWithChips label="Start Date" placeholder="Start Date" />
            <MultiSelectWithChips label="End Date" placeholder="End Date" />

            {showClearButton && <ClearButton onClick={clearAllFilters} />}

            <Box sx={{ flexGrow: 1, minWidth: 10 }} />
          </Stack>
        </Box>

        {/* KPI Cards */}
        <Box sx={{ display: "flex", gap: 2, flexWrap: "nowrap", pb: 2 }}>
          <KPICard
            loading={false}
            value={totalEmployees}
            unit=""
            title="Total Active Employees"
            colorScheme={{
              backgroundColor: "#1E40AF",
              textColor: "#FFFFFF",
              iconColor: "#FFFFFF",
            }}
            style={{ flex: 1, minHeight: "100px", fontSize: "18px" }}
          />
          <KPICard
            loading={false}
            value={avgTenure}
            unit=""
            title="Average Tenure Rate"
            colorScheme={{
              backgroundColor: "#1E40AF",
              textColor: "#FFFFFF",
              iconColor: "#FFFFFF",
            }}
            style={{ flex: 1, minHeight: "100px" }}
          />
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 2,
            minHeight: 320,
            flexGrow: 1,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "12px",
              borderRadius: "8px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              display: "flex",
              flexDirection: "column",
              height: "400px", // ✅ Match height
              position: "relative",
              cursor: "pointer",
              transition: "box-shadow 0.2s",
              width: "100%",
              maxWidth: "1000px",
            }}
            onClick={() =>
              openZoomModal(
                "Gender Distribution by Position",
                "gender-distribution",
                () => (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div style={{ flex: 1 }}>
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
                    </div>
                  </div>
                )
              )
            }
            onMouseOver={(e) => {
              e.currentTarget.style.boxShadow =
                "0 4px 16px rgba(59,130,246,0.15)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
            }}
            title="Click to enlarge"
          >
            <h3
              style={{
                fontSize: "13px",
                fontWeight: "600",
                marginBottom: "10px",
                color: "#1e293b",
                flexShrink: 0,
              }}
            >
              Gender Distribution by Position
            </h3>

            {!genderDistribution || genderDistribution.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "30px 15px",
                  color: "#64748b",
                  backgroundColor: "#f8fafc",
                  borderRadius: "6px",
                  fontSize: "12px",
                  flex: 1,
                }}
              >
                No data available for selected filters
              </div>
            ) : (
              <div style={{ flex: 1 }}>
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
              </div>
            )}
          </div>

          {/*
          <Paper
            sx={{
              p: 1,
              textAlign: "center",
              flex: 1,
              maxWidth: 600,

              color: "#fff",
            }}
            onClick={() =>
              handleOpen({
                chartKey: "genderDistributionChart",
                chartText: "Gender Distribution by Position",
              })
            }
          >
            <Typography variant="h6" sx={{ color: "#000", mb: 1 }}>
              Gender Distribution by Position
            </Typography>
            <Box sx={{ height: 250 }}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={genderDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="position" />
                  <YAxis />
                  <Tooltip
                    itemStyle={{
                      color: "#000",
                    }}
                  />
                  <Legend />
                  <Bar dataKey="Male" fill="#4285F4" />
                  <Bar dataKey="Female" fill="#EA4335" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper> */}
          <div
            style={{
              backgroundColor: "white",
              padding: "12px",
              borderRadius: "8px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              display: "flex",
              flexDirection: "column",
              height: "400px", // ✅ Consistent height
              cursor: "pointer",
              transition: "box-shadow 0.2s",
              width: "100%",
              maxWidth: "1000px",
            }}
            onClick={() =>
              openZoomModal(
                "Age Group Distribution",
                "age-distribution",
                () => (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={ageDistribution}
                            dataKey="count"
                            nameKey="age_group"
                            cx="50%"
                            cy="50%"
                            labelLine={false}
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
                          <Tooltip
                            formatter={(value, name) => [`${value}`, name]}
                          />
                          <Legend iconType="square" />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )
              )
            }
            onMouseOver={(e) => {
              e.currentTarget.style.boxShadow =
                "0 4px 16px rgba(59,130,246,0.15)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
            }}
            title="Click to enlarge"
          >
            <h3
              style={{
                fontSize: "13px",
                fontWeight: "600",
                marginBottom: "10px",
                color: "#1e293b",
                flexShrink: 0,
              }}
            >
              Age Group Distribution
            </h3>

            {!ageDistribution || ageDistribution.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "30px 15px",
                  color: "#64748b",
                  backgroundColor: "#f8fafc",
                  borderRadius: "6px",
                  fontSize: "12px",
                  flex: 1,
                }}
              >
                No data available for selected filters
              </div>
            ) : (
              <div style={{ flex: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={ageDistribution}
                      dataKey="count"
                      nameKey="age_group"
                      cx="50%"
                      cy="50%"
                      labelLine={false}
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
              </div>
            )}
          </div>

          {/*

          <Paper
            sx={{
              p: 1,
              textAlign: "center",
              color: "#fff",
            }}
            onClick={() =>
              handleOpen({
                chartKey: "ageDistributionChart",
                chartText: "Age Group Distribution",
              })
            }
          >
            <>
              <style>
                {`
      .recharts-sector {
        outline: none;
      }
    `}
              </style>
            </>
           
            <Typography variant="h6" sx={{ color: "#000", mb: 1 }}>
              Age Group Distribution
            </Typography>

          
            <Box sx={{ height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ageDistribution}
                    dataKey="count"
                    nameKey="age_group"
                    cx="50%"
                    cy="50%"
                    labelLine={false}
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
                        className="recharts-sector"
                      />
                    ))}
                  </Pie>
                  <Legend iconType="square" />
                  <Tooltip formatter={(value, name) => [`${value}`, name]} />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </Paper>

          */}
          <div
            style={{
              backgroundColor: "white",
              padding: "12px",
              borderRadius: "8px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              display: "flex",
              flexDirection: "column",
              height: "400px", // ✅ match height
              cursor: "pointer",
              transition: "box-shadow 0.2s",
              width: "100%",
              maxWidth: "1000px", // optional limit
            }}
            onClick={() =>
              openZoomModal(
                "Types of Leaves Taken Per Year",
                "leave-types",
                () => (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={leaveTypes}
                          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="year" />
                          <YAxis />
                          <Tooltip itemStyle={{ color: "#000" }} />
                          <Legend iconType="square" />
                          <Bar
                            dataKey="SPL"
                            stackId="a"
                            fill="#1976d2"
                            name="SPL"
                          />
                          <Bar
                            dataKey="Paternity"
                            stackId="a"
                            fill="#ffa726"
                            name="Paternity"
                          />
                          <Bar
                            dataKey="Maternity"
                            stackId="a"
                            fill="#66bb6a"
                            name="Maternity"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )
              )
            }
            onMouseOver={(e) => {
              e.currentTarget.style.boxShadow =
                "0 4px 16px rgba(59,130,246,0.15)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
            }}
            title="Click to enlarge"
          >
            <h3
              style={{
                fontSize: "13px",
                fontWeight: "600",
                marginBottom: "10px",
                color: "#1e293b",
                flexShrink: 0,
              }}
            >
              Types of Leaves Taken Per Year
            </h3>

            {!leaveTypes || leaveTypes.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "30px 15px",
                  color: "#64748b",
                  backgroundColor: "#f8fafc",
                  borderRadius: "6px",
                  fontSize: "12px",
                  flex: 1,
                }}
              >
                No data available for selected filters
              </div>
            ) : (
              <div style={{ flex: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={leaveTypes}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip itemStyle={{ color: "#000" }} />
                    <Legend iconType="square" />
                    <Bar dataKey="SPL" stackId="a" fill="#1976d2" name="SPL" />
                    <Bar
                      dataKey="Paternity"
                      stackId="a"
                      fill="#ffa726"
                      name="Paternity"
                    />
                    <Bar
                      dataKey="Maternity"
                      stackId="a"
                      fill="#66bb6a"
                      name="Maternity"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/*
          <Paper
            sx={{
              p: 1,
              textAlign: "center",

              color: "#fff",
            }}
            onClick={() =>
              handleOpen({
                chartKey: "typesOfLeaveTakenPerYearChart",
                chartText: "Types of Leaves Taken Per Year",
              })
            }
          >
            {" "}
            <Typography variant="h6" sx={{ color: "#000", mb: 1 }}>
              Types of Leaves Taken Per Year
            </Typography>
            <Box sx={{ height: 250 }}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={leaveTypes}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis />
                  <Tooltip
                    itemStyle={{
                      color: "#000",
                    }}
                  />
                  <Legend iconType="square" />
                  <Bar dataKey="SPL" stackId="a" fill="#1976d2" name="SPL" />
                  <Bar
                    dataKey="Paternity"
                    stackId="a"
                    fill="#ffa726"
                    name="Paternity"
                  />
                  <Bar
                    dataKey="Maternity"
                    stackId="a"
                    fill="#66bb6a"
                    name="Maternity"
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper> */}

          {/* 
          <Paper
            sx={{
              p: 1,
              textAlign: "center",

              color: "#fff",
            }}
            onClick={() =>
              handleOpen({
                chartKey: "attrtitionRatePerYearChart",
                chartText: "Attrition Rate Per Year",
              })
            }
          >
             <Typography variant="h6" sx={{ color: "#000", mb: 1 }}>
              Attrition Rate Per Year
            </Typography>
            <Box sx={{ height: 250 }}>
              <ResponsiveContainer>
                <LineChart
                  data={attritionData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis
                    domain={[0, "auto"]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip
                    formatter={(value) => `${value}%`}
                    itemStyle={{
                      color: "#000",
                    }}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="attrition_rate_percent"
                    stroke="#ff7300"
                    dot={{ fill: "#ff7300" }}
                    name="Attrition Rate (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>*/}

          <Box
            sx={{
              gridColumn: "1 / -1", // span all 3 columns
              display: "flex",
              justifyContent: "center",
              gap: 2,
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                padding: "12px",
                borderRadius: "8px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                display: "flex",
                flexDirection: "column",
                height: "400px",
                width: "100%",
                maxWidth: "800px",
                cursor: "pointer",
                transition: "box-shadow 0.2s",
              }}
              onClick={() =>
                openZoomModal(
                  "Employee Count Per Company",
                  "employee-count-company",
                  () => (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <div style={{ flex: 1 }}>
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
                      </div>
                    </div>
                  )
                )
              }
              onMouseOver={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 4px 16px rgba(59,130,246,0.15)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
              }}
              title="Click to enlarge"
            >
              <h3
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  marginBottom: "10px",
                  color: "#1e293b",
                  flexShrink: 0,
                }}
              >
                Employee Count Per Company
              </h3>

              {!employeeCountByCompany ||
              employeeCountByCompany.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "30px 15px",
                    color: "#64748b",
                    backgroundColor: "#f8fafc",
                    borderRadius: "6px",
                    fontSize: "12px",
                    flex: 1,
                  }}
                >
                  No data available for selected filters
                </div>
              ) : (
                <div style={{ flex: 1 }}>
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
                </div>
              )}
            </div>

            {/* 
            <Paper
              sx={{
                p: 1,
                textAlign: "center",
                flex: 1,
                maxWidth: 600,
                color: "#fff",
              }}
              onClick={() =>
                handleOpen({
                  chartKey: "employeeCountChart",
                  chartText: "Employee Count Per Company",
                })
              }
            >
              <Typography variant="h6" sx={{ color: "#000", mb: 1 }}>
                Employee Count Per Company
              </Typography>
              <Box sx={{ height: 250 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={employeeCountByCompany}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="company" />
                    <YAxis />
                    <Tooltip />
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
            </Paper>*/}

            <div
              style={{
                backgroundColor: "white",
                padding: "12px",
                borderRadius: "8px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                display: "flex",
                flexDirection: "column",
                height: "400px", // ✅ Match height
                width: "100%",
                maxWidth: "800px",
                cursor: "pointer",
                transition: "box-shadow 0.2s",
              }}
              onClick={() =>
                openZoomModal(
                  "Parental Leaves Per Year",
                  "parental-leaves",
                  () => (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <div style={{ flex: 1, minHeight: 400 }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            data={leaveSeasons}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="year" />
                            <YAxis domain={[0, "auto"]} />
                            <Tooltip
                              formatter={(value) => `${value} leaves`}
                              itemStyle={{ color: "#000" }}
                            />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="leave_count"
                              stroke="#1976d2"
                              dot={{ fill: "#1976d2" }}
                              name="Leave Count"
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )
                )
              }
              onMouseOver={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 4px 16px rgba(59,130,246,0.15)";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
              }}
              title="Click to enlarge"
            >
              <h3
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  marginBottom: "10px",
                  color: "#1e293b",
                  flexShrink: 0,
                }}
              >
                Parental Leaves Per Year
              </h3>

              {!leaveSeasons || leaveSeasons.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "30px 15px",
                    color: "#64748b",
                    backgroundColor: "#f8fafc",
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}
                >
                  No data available for selected filters
                </div>
              ) : (
                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    minHeight: 0,
                  }}
                >
                  <div style={{ flex: 1, minHeight: 0 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={leaveSeasons}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="year" />
                        <YAxis domain={[0, "auto"]} />
                        <Tooltip
                          formatter={(value) => `${value} leaves`}
                          itemStyle={{ color: "#000" }}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="leave_count"
                          stroke="#1976d2"
                          dot={{ fill: "#1976d2" }}
                          name="Leave Count"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>

            {/* 
            <Paper
              sx={{
                p: 1,
                textAlign: "center",
                flex: 1,
                maxWidth: 600,
                color: "#fff",
              }}
              onClick={() =>
                handleOpen({
                  chartKey: "parentalLeavePerYearChart",
                  chartText: "Pareantal Leave Per Year",
                })
              }
            >
              <Typography variant="h6" sx={{ color: "#000", mb: 1 }}>
                Parental Leaves Per Year
              </Typography>
              <Box sx={{ height: 250 }}>
                <ResponsiveContainer>
                  <LineChart
                    data={leaveSeasons}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis domain={[0, "auto"]} />
                    <Tooltip
                      formatter={(value) => `${value} leaves`}
                      itemStyle={{
                        color: "#000",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="leave_count"
                      stroke="#1976d2"
                      dot={{ fill: "#1976d2" }}
                      name="Leave Count"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Paper>*/}
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

  // return (
  //   <Box sx={{ display: "flex", height: "100vh" }}>
  //     <Box
  //       sx={{
  //         flexGrow: 1,
  //         display: "flex",
  //         flexDirection: "column",
  //         height: "100%",
  //       }}
  //     >
  //       <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>
  //         <Filter
  //           label="Company"
  //           options={[{ label: "All Companies", value: "" }, ...companyOptions]}
  //           value={filters.company_name}
  //           onChange={(val) => {
  //             setFilters((prev) => ({ ...prev, company_name: val }));
  //             setPage(1);
  //           }}
  //           placeholder="Company"
  //         />

  //         <Filter
  //           label="Gender"
  //           options={[{ label: "All Genders", value: "" }, ...genderOptions]}
  //           value={filters.gender}
  //           onChange={(val) => {
  //             setFilters((prev) => ({ ...prev, gender: val }));
  //             setPage(1);
  //           }}
  //           placeholder="Gender"
  //         />

  //         <Filter
  //           label="Position"
  //           options={[{ label: "All Position", value: "" }, ...positionOptions]}
  //           value={filters.position_id}
  //           onChange={(val) => {
  //             setFilters((prev) => ({ ...prev, position_id: val }));
  //             setPage(1);
  //           }}
  //           placeholder="Position"
  //         />

  //         <Filter
  //           label="Employement Category"
  //           options={[
  //             { label: "All Employement Category", value: "" },
  //             ...employementCategoryOptions,
  //           ]}
  //           value={filters.p_np}
  //           onChange={(val) => {
  //             setFilters((prev) => ({ ...prev, p_np: val }));
  //             setPage(1);
  //           }}
  //           placeholder="Employement Category"
  //         />

  //         <Filter
  //           label="Employement Status"
  //           options={[
  //             { label: "All Employement Status", value: "" },
  //             ...employementStatusOptions,
  //           ]}
  //           value={filters.employment_status}
  //           onChange={(val) => {
  //             setFilters((prev) => ({ ...prev, employment_status: val }));
  //             setPage(1);
  //           }}
  //           placeholder="Employement Status"
  //         />

  //         {isFiltering && (
  //           <Button
  //             variant="outline"
  //             startIcon={<ClearIcon />}
  //             sx={{
  //               color: "#182959",
  //               borderRadius: "999px",
  //               padding: "9px 18px",
  //               fontSize: "0.85rem",
  //               fontWeight: "bold",
  //             }}
  //             onClick={() => {
  //               setFilters({
  //                 company_name: "",
  //                 gender: "",
  //                 position_id: "",
  //                 p_np: "",
  //                 employment_status: "",
  //                 status_id: "",
  //               });
  //               setPage(1);
  //             }}
  //           >
  //             Clear Filters
  //           </Button>
  //         )}
  //       </Box>
  //       <Box sx={{ display: "flex", height: "120px", gap: 2, mb: 3 }}>
  //         <KPIIndicatorCard
  //           value={totalEmployees}
  //           label="TOTAL ACTIVE WORKFORCE"
  //           variant="outlined"
  //         />
  //         <KPIIndicatorCard
  //           value={avgTenure}
  //           label="AVERAGE TENURE RATE"
  //           variant="filled"
  //         />
  //         {/* <KPIIndicatorCard
  //           value={attritionRate} // get overall or latest year???
  //           label="ATTRITION RATE"
  //           variant="outlined"
  //         /> */}
  //       </Box>
  //       <Modal open={openModal} onClose={handleClose}>
  //         <Box
  //           sx={{
  //             position: "absolute",
  //             top: "50%",
  //             left: "50%",
  //             transform: "translate(-50%, -50%)",
  //             width: "90%",
  //             maxWidth: 1000,
  //             bgcolor: "#fff",
  //             borderRadius: 3,
  //             p: 3,

  //             boxShadow: 24,
  //             outline: "none",
  //           }}
  //         >
  //           <Box
  //             sx={{
  //               display: "flex",
  //               justifyContent: "space-between",
  //               alignItems: "center",
  //               mb: 2, // margin below the header
  //             }}
  //           >
  //             <Box sx={{ flexGrow: 1, textAlign: "center" }}>
  //               <Typography variant="h6" sx={{ color: "#000" }}>
  //                 {chartText}
  //               </Typography>
  //             </Box>

  //             <IconButton
  //               onClick={handleClose}
  //               sx={{
  //                 position: "relative", // relative to Box, not absolute
  //                 zIndex: 10,
  //               }}
  //             >
  //               <CloseIcon />
  //             </IconButton>
  //           </Box>

  //           {activeChart === "employeeCountChart" && (
  //             <ResponsiveContainer width="100%" height={500}>
  //               <BarChart data={employeeCountByCompany}>
  //                 <CartesianGrid strokeDasharray="3 3" />
  //                 <XAxis dataKey="company" />
  //                 <YAxis />
  //                 <Tooltip />
  //                 <Legend />
  //                 <Bar dataKey="count" name="Employee Count">
  //                   {employeeCountByCompany.map((entry, index) => (
  //                     <Cell
  //                       key={`cell-${index}`}
  //                       fill={COLORS[index % COLORS.length]}
  //                     />
  //                   ))}
  //                 </Bar>
  //               </BarChart>
  //             </ResponsiveContainer>
  //           )}

  //           {activeChart === "ageDistributionChart" && (
  //             <ResponsiveContainer width="100%" height={400}>
  //               <PieChart>
  //                 <Pie
  //                   data={ageDistribution}
  //                   dataKey="count"
  //                   nameKey="age_group"
  //                   cx="50%"
  //                   cy="50%"
  //                   labelLine={false}
  //                   outerRadius="80%"
  //                   innerRadius="40%"
  //                   fill="#8884d8"
  //                   paddingAngle={2}
  //                   startAngle={90}
  //                   endAngle={450}
  //                 >
  //                   {ageDistribution.map((entry, index) => (
  //                     <Cell
  //                       key={`cell-${index}`}
  //                       fill={COLORS[index % COLORS.length]}
  //                       className="recharts-sector"
  //                     />
  //                   ))}
  //                 </Pie>
  //                 <Legend iconType="square" />
  //                 <Tooltip formatter={(value, name) => [`${value}`, name]} />
  //               </PieChart>
  //             </ResponsiveContainer>
  //           )}

  //           {activeChart === "parentalLeavePerYearChart" && (
  //             <ResponsiveContainer width="100%" height={400}>
  //               <LineChart
  //                 data={leaveSeasons}
  //                 margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
  //               >
  //                 <CartesianGrid strokeDasharray="3 3" />
  //                 <XAxis dataKey="year" />
  //                 <YAxis domain={[0, "auto"]} />
  //                 <Tooltip
  //                   formatter={(value) => `${value} leaves`}
  //                   itemStyle={{
  //                     color: "#000",
  //                   }}
  //                 />
  //                 <Legend />
  //                 <Line
  //                   type="monotone"
  //                   dataKey="leave_count"
  //                   stroke="#1976d2"
  //                   dot={{ fill: "#1976d2" }}
  //                   name="Leave Count"
  //                 />
  //               </LineChart>
  //             </ResponsiveContainer>
  //           )}

  //           {/* {activeChart === "attrtitionRatePerYearChart" && (
  //             <ResponsiveContainer width="100%" height={400}>
  //               <LineChart
  //                 data={attritionData}
  //                 margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
  //               >
  //                 <CartesianGrid strokeDasharray="3 3" />
  //                 <XAxis dataKey="year" />
  //                 <YAxis
  //                   domain={[0, "auto"]}
  //                   tickFormatter={(value) => `${value}%`}
  //                 />
  //                 <Tooltip
  //                   formatter={(value) => `${value}%`}
  //                   itemStyle={{
  //                     color: "#000",
  //                   }}
  //                 />
  //                 <Legend />
  //                 <Line
  //                   type="monotone"
  //                   dataKey="attrition_rate_percent"
  //                   stroke="#ff7300"
  //                   dot={{ fill: "#ff7300" }}
  //                   name="Attrition Rate (%)"
  //                 />
  //               </LineChart>
  //             </ResponsiveContainer>
  //           )} */}

  //           {activeChart === "genderDistributionChart" && (
  //             <ResponsiveContainer width="100%" height={300}>
  //               <BarChart data={transformed}>
  //                 <CartesianGrid strokeDasharray="3 3" />
  //                 <XAxis dataKey="position" />
  //                 <YAxis />
  //                 <Tooltip
  //                   itemStyle={{
  //                     color: "#000",
  //                   }}
  //                 />
  //                 <Legend />
  //                 <Bar dataKey="Male" fill="#4285F4" />
  //                 <Bar dataKey="Female" fill="#EA4335" />
  //               </BarChart>
  //             </ResponsiveContainer>
  //           )}

  //           {activeChart === "typesOfLeaveTakenPerYearChart" && (
  //             <ResponsiveContainer width="100%" height={300}>
  //               <BarChart
  //                 data={leaveTypes}
  //                 margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
  //               >
  //                 <CartesianGrid strokeDasharray="3 3" />
  //                 <XAxis dataKey="year" />
  //                 <YAxis />
  //                 <Tooltip
  //                   itemStyle={{
  //                     color: "#000",
  //                   }}
  //                 />
  //                 <Legend iconType="square" />
  //                 <Bar dataKey="SPL" stackId="a" fill="#1976d2" name="SPL" />
  //                 <Bar
  //                   dataKey="Paternity"
  //                   stackId="a"
  //                   fill="#ffa726"
  //                   name="Paternity"
  //                 />
  //                 <Bar
  //                   dataKey="Maternity"
  //                   stackId="a"
  //                   fill="#66bb6a"
  //                   name="Maternity"
  //                 />
  //               </BarChart>
  //             </ResponsiveContainer>
  //           )}
  //         </Box>
  //       </Modal>

  //       <Box
  //         sx={{
  //           display: "grid",
  //           gridTemplateColumns: "1fr 1fr 1fr",
  //           gridAutoRows: "1fr",
  //           gap: 2,
  //           minHeight: 320,
  //           flexGrow: 1,
  //         }}
  //       >
  //         <Paper
  //           sx={{
  //             p: 1,
  //             textAlign: "center",
  //             cursor: "pointer",
  //             color: "#fff",
  //           }}
  //           onClick={() =>
  //             handleOpen({
  //               chartKey: "employeeCountChart",
  //               chartText: "Employee Count Per Company",
  //             })
  //           }
  //         >
  //           <Typography variant="h6" sx={{ color: "#000", mb: 1 }}>
  //             Employee Count Per Company
  //           </Typography>
  //           <Box sx={{ height: 250 }}>
  //             <ResponsiveContainer width="100%" height="100%">
  //               <BarChart data={employeeCountByCompany}>
  //                 <CartesianGrid strokeDasharray="3 3" />
  //                 <XAxis dataKey="company" />
  //                 <YAxis />
  //                 <Tooltip />
  //                 <Bar dataKey="count" name="Employee Count">
  //                   {employeeCountByCompany.map((entry, index) => (
  //                     <Cell
  //                       key={`cell-${index}`}
  //                       fill={COLORS[index % COLORS.length]}
  //                       className="recharts-sector"
  //                     />
  //                   ))}
  //                 </Bar>
  //               </BarChart>
  //             </ResponsiveContainer>
  //           </Box>
  //         </Paper>

  //         <Paper
  //           sx={{
  //             p: 1,
  //             textAlign: "center",
  //             color: "#fff",
  //           }}
  //           onClick={() =>
  //             handleOpen({
  //               chartKey: "ageDistributionChart",
  //               chartText: "Age Group Distribution",
  //             })
  //           }
  //         >
  //           <>
  //             <style>
  //               {`
  //     .recharts-sector {
  //       outline: none;
  //     }
  //   `}
  //             </style>
  //           </>
  //           {/* Title outside ResponsiveContainer */}
  //           <Typography variant="h6" sx={{ color: "#000", mb: 1 }}>
  //             Age Group Distribution
  //           </Typography>

  //           {/* Set a fixed height for the chart wrapper */}
  //           <Box sx={{ height: 250 }}>
  //             <ResponsiveContainer width="100%" height="100%">
  //               <PieChart>
  //                 <Pie
  //                   data={ageDistribution}
  //                   dataKey="count"
  //                   nameKey="age_group"
  //                   cx="50%"
  //                   cy="50%"
  //                   labelLine={false}
  //                   outerRadius="80%"
  //                   innerRadius="40%"
  //                   fill="#8884d8"
  //                   paddingAngle={2}
  //                   startAngle={90}
  //                   endAngle={450}
  //                 >
  //                   {ageDistribution.map((entry, index) => (
  //                     <Cell
  //                       key={`cell-${index}`}
  //                       fill={COLORS[index % COLORS.length]}
  //                       className="recharts-sector"
  //                     />
  //                   ))}
  //                 </Pie>
  //                 <Legend iconType="square" />
  //                 <Tooltip formatter={(value, name) => [`${value}`, name]} />
  //               </PieChart>
  //             </ResponsiveContainer>
  //           </Box>
  //         </Paper>
  //         <Paper
  //           sx={{
  //             p: 1,
  //             textAlign: "center",

  //             color: "#fff",
  //           }}
  //           onClick={() =>
  //             handleOpen({
  //               chartKey: "parentalLeavePerYearChart",
  //               chartText: "Pareantal Leave Per Year",
  //             })
  //           }
  //         >
  //           <Typography variant="h6" sx={{ color: "#000", mb: 1 }}>
  //             Parental Leaves Per Year
  //           </Typography>
  //           <Box sx={{ height: 250 }}>
  //             <ResponsiveContainer>
  //               <LineChart
  //                 data={leaveSeasons}
  //                 margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
  //               >
  //                 <CartesianGrid strokeDasharray="3 3" />
  //                 <XAxis dataKey="year" />
  //                 <YAxis domain={[0, "auto"]} />
  //                 <Tooltip
  //                   formatter={(value) => `${value} leaves`}
  //                   itemStyle={{
  //                     color: "#000",
  //                   }}
  //                 />
  //                 <Legend />
  //                 <Line
  //                   type="monotone"
  //                   dataKey="leave_count"
  //                   stroke="#1976d2"
  //                   dot={{ fill: "#1976d2" }}
  //                   name="Leave Count"
  //                 />
  //               </LineChart>
  //             </ResponsiveContainer>
  //           </Box>
  //         </Paper>

  //         <Paper
  //           sx={{
  //             p: 1,
  //             textAlign: "center",

  //             color: "#fff",
  //           }}
  //           onClick={() =>
  //             handleOpen({
  //               chartKey: "attrtitionRatePerYearChart",
  //               chartText: "Attrition Rate Per Year",
  //             })
  //           }
  //         >
  //           {/* <Typography variant="h6" sx={{ color: "#000", mb: 1 }}>
  //             Attrition Rate Per Year
  //           </Typography>
  //           <Box sx={{ height: 250 }}>
  //             <ResponsiveContainer>
  //               <LineChart
  //                 data={attritionData}
  //                 margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
  //               >
  //                 <CartesianGrid strokeDasharray="3 3" />
  //                 <XAxis dataKey="year" />
  //                 <YAxis
  //                   domain={[0, "auto"]}
  //                   tickFormatter={(value) => `${value}%`}
  //                 />
  //                 <Tooltip
  //                   formatter={(value) => `${value}%`}
  //                   itemStyle={{
  //                     color: "#000",
  //                   }}
  //                 />
  //                 <Legend />
  //                 <Line
  //                   type="monotone"
  //                   dataKey="attrition_rate_percent"
  //                   stroke="#ff7300"
  //                   dot={{ fill: "#ff7300" }}
  //                   name="Attrition Rate (%)"
  //                 />
  //               </LineChart>
  //             </ResponsiveContainer>
  //           </Box>
  //         </Paper>

  //         <Paper
  //           sx={{
  //             p: 1,
  //             textAlign: "center",

  //             color: "#fff",
  //           }}
  //           onClick={() =>
  //             handleOpen({
  //               chartKey: "genderDistributionChart",
  //               chartText: "Gender Distribution by Position",
  //             })
  //           }
  //         > */}
  //           <Typography variant="h6" sx={{ color: "#000", mb: 1 }}>
  //             Gender Distribution by Position
  //           </Typography>
  //           <Box sx={{ height: 250 }}>
  //             <ResponsiveContainer width="100%" height={300}>
  //               <BarChart data={transformed}>
  //                 <CartesianGrid strokeDasharray="3 3" />
  //                 <XAxis dataKey="position" />
  //                 <YAxis />
  //                 <Tooltip
  //                   itemStyle={{
  //                     color: "#000",
  //                   }}
  //                 />
  //                 <Legend />
  //                 <Bar dataKey="Male" fill="#4285F4" />
  //                 <Bar dataKey="Female" fill="#EA4335" />
  //               </BarChart>
  //             </ResponsiveContainer>
  //           </Box>
  //         </Paper>
  //         <Paper
  //           sx={{
  //             p: 1,
  //             textAlign: "center",

  //             color: "#fff",
  //           }}
  //           onClick={() =>
  //             handleOpen({
  //               chartKey: "typesOfLeaveTakenPerYearChart",
  //               chartText: "Types of Leaves Taken Per Year",
  //             })
  //           }
  //         >
  //           {" "}
  //           <Typography variant="h6" sx={{ color: "#000", mb: 1 }}>
  //             Types of Leaves Taken Per Year
  //           </Typography>
  //           <Box sx={{ height: 250 }}>
  //             <ResponsiveContainer width="100%" height={300}>
  //               <BarChart
  //                 data={leaveTypes}
  //                 margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
  //               >
  //                 <CartesianGrid strokeDasharray="3 3" />
  //                 <XAxis dataKey="year" />
  //                 <YAxis />
  //                 <Tooltip
  //                   itemStyle={{
  //                     color: "#000",
  //                   }}
  //                 />
  //                 <Legend iconType="square" />
  //                 <Bar dataKey="SPL" stackId="a" fill="#1976d2" name="SPL" />
  //                 <Bar
  //                   dataKey="Paternity"
  //                   stackId="a"
  //                   fill="#ffa726"
  //                   name="Paternity"
  //                 />
  //                 <Bar
  //                   dataKey="Maternity"
  //                   stackId="a"
  //                   fill="#66bb6a"
  //                   name="Maternity"
  //                 />
  //               </BarChart>
  //             </ResponsiveContainer>
  //           </Box>
  //         </Paper>
  //       </Box>
  //     </Box>
  //   </Box>
  // );
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
