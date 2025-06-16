import { useState, useEffect, useMemo } from "react";
import {
  Button,
  Box,
  Modal,
  Paper,
  Typography,
  IconButton,
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

import KPIIndicatorCard from "../../components/KPIIndicatorCard";

import Sidebar from "../../components/Sidebar";

// Dummy data
const attritionData = [
  {
    year: 2019,
    total_employees: 154,
    resigned_count: 0,
    attrition_rate_percent: "0.00",
  },
  {
    year: 2020,
    total_employees: 156,
    resigned_count: 1,
    attrition_rate_percent: "0.64",
  },
  {
    year: 2021,
    total_employees: 156,
    resigned_count: 6,
    attrition_rate_percent: "3.85",
  },
  {
    year: 2022,
    total_employees: 155,
    resigned_count: 1,
    attrition_rate_percent: "0.65",
  },
];

const genderDistribution = [
  { position: "MM", gender: "M", count: 35 },
  { position: "RF", gender: "M", count: 60 },
  { position: "SM", gender: "M", count: 5 },
  { position: "MM", gender: "F", count: 25 },
  { position: "RF", gender: "F", count: 30 },
  { position: "SM", gender: "F", count: 3 },
];

const leaveSeasons = [
  { year: 2019, leave_count: 8 },
  { year: 2020, leave_count: 8 },
  { year: 2021, leave_count: 9 },
  { year: 2022, leave_count: 14 },
];

const ageDistribution = [
  { age_group: "30-50", count: 100 },
  { age_group: "Above 50", count: 25 },
  { age_group: "Below 30", count: 29 },
];

const employeeCountByCompany = [
  { company: "MGI", count: 30 },
  { company: "PSC", count: 30 },
  { company: "PWEI", count: 25 },
  { company: "RGEC", count: 69 },
];

const leaveTypes = [
  { year: 2019, SPL: 3, Paternity: 1, Maternity: 6 },
  { year: 2020, SPL: 2, Paternity: 0, Maternity: 5 },
  { year: 2021, SPL: 4, Paternity: 1, Maternity: 5 },
  { year: 2022, SPL: 5, Paternity: 2, Maternity: 7 },
];

// Dashboard values
const totalEmployees = attritionData[attritionData.length - 1].total_employees;
const avgTenure = 5.68;
const attritionRate =
  attritionData[attritionData.length - 1].attrition_rate_percent;

const COLORS = [
  "#3B82F6",
  "#F97316",
  "#10B981",
  "#EF4444",
  "#8B5CF6",
  "#F59E0B",
];

function DemographicsDash({}) {
  //INITIALIZE
  const [attritionData, setAttritionData] = useState([]);

  const [filters, setFilters] = useState({
    company_name: "",
    gender: "",
    position_id: "",
    p_np: "",
    employment_status: "",
    status_id: "",
  });

  const companyOptions = [];
  const genderOptions = [];
  const positionOptions = [];
  const employementCategoryOptions = [];
  const employementStatusOptions = [];

  const [openModal, setOpenModal] = useState(false);
  const [activeChart, setActiveChart] = useState(null);
  const [chartText, setchartText] = useState(null);
  const handleClose = () => setOpenModal(false);

  const handleOpen = ({ chartKey, chartText }) => {
    setActiveChart(chartKey);
    setchartText(chartText);
    setOpenModal(true);
  };

  const isFiltering = useMemo(() => {
    return Object.values(filters).some((v) => v !== null && v !== "");
  }, [filters]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("/hr/attrition_rate");
        console.log("Attrition Rate Data:", response.data);
        setAttritionData(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Fetch Error:", err);
        setError("Failed to load attrition rate data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const transformed = [];

  genderDistribution.forEach((entry) => {
    const { position, gender, count } = entry;

    let existing = transformed.find((item) => item.position === position);
    if (!existing) {
      existing = { position, Male: 0, Female: 0 };
      transformed.push(existing);
    }

    if (gender === "M") {
      existing.Male = count;
    } else if (gender === "F") {
      existing.Female = count;
    }
  });

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>
          <Filter
            label="Company"
            options={[{ label: "All Companies", value: "" }, ...companyOptions]}
            value={filters.company_name}
            onChange={(val) => {
              setFilters((prev) => ({ ...prev, company_name: val }));
              setPage(1);
            }}
            placeholder="Company"
          />

          <Filter
            label="Gender"
            options={[{ label: "All Genders", value: "" }, ...genderOptions]}
            value={filters.gender}
            onChange={(val) => {
              setFilters((prev) => ({ ...prev, gender: val }));
              setPage(1);
            }}
            placeholder="Gender"
          />

          <Filter
            label="Position"
            options={[{ label: "All Position", value: "" }, ...positionOptions]}
            value={filters.position_id}
            onChange={(val) => {
              setFilters((prev) => ({ ...prev, position_id: val }));
              setPage(1);
            }}
            placeholder="Position"
          />

          <Filter
            label="Employement Category"
            options={[
              { label: "All Employement Category", value: "" },
              ...employementCategoryOptions,
            ]}
            value={filters.p_np}
            onChange={(val) => {
              setFilters((prev) => ({ ...prev, p_np: val }));
              setPage(1);
            }}
            placeholder="Employement Category"
          />

          <Filter
            label="Employement Status"
            options={[
              { label: "All Employement Status", value: "" },
              ...employementStatusOptions,
            ]}
            value={filters.employment_status}
            onChange={(val) => {
              setFilters((prev) => ({ ...prev, employment_status: val }));
              setPage(1);
            }}
            placeholder="Employement Status"
          />

          {isFiltering && (
            <Button
              variant="outline"
              startIcon={<ClearIcon />}
              sx={{
                color: "#182959",
                borderRadius: "999px",
                padding: "9px 18px",
                fontSize: "0.85rem",
                fontWeight: "bold",
              }}
              onClick={() => {
                setFilters({
                  company_name: "",
                  gender: "",
                  position_id: "",
                  p_np: "",
                  employment_status: "",
                  status_id: "",
                });
                setPage(1);
              }}
            >
              Clear Filters
            </Button>
          )}
        </Box>
        <Box sx={{ display: "flex", height: "120px", gap: 2, mb: 3 }}>
          <KPIIndicatorCard
            value={totalEmployees}
            label="TOTAL ACTIVE WORKFORCE"
            variant="outlined"
          />
          <KPIIndicatorCard
            value={avgTenure}
            label="AVERAGE TENURE RATE"
            variant="filled"
          />
          <KPIIndicatorCard
            value={attritionRate} // get overall or latest year???
            label="ATTRITION RATE"
            variant="outlined"
          />
        </Box>
        <Modal open={openModal} onClose={handleClose}>
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "90%",
              maxWidth: 1000,
              bgcolor: "#fff",
              borderRadius: 3,
              p: 3,

              boxShadow: 24,
              outline: "none",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2, // margin below the header
              }}
            >
              <Box sx={{ flexGrow: 1, textAlign: "center" }}>
                <Typography variant="h6" sx={{ color: "#000" }}>
                  {chartText}
                </Typography>
              </Box>

              <IconButton
                onClick={handleClose}
                sx={{
                  position: "relative", // relative to Box, not absolute
                  zIndex: 10,
                }}
              >
                <CloseIcon />
              </IconButton>
            </Box>

            {activeChart === "employeeCountChart" && (
              <ResponsiveContainer width="100%" height={500}>
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
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}

            {activeChart === "ageDistributionChart" && (
              <ResponsiveContainer width="100%" height={400}>
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
            )}

            {activeChart === "parentalLeavePerYearChart" && (
              <ResponsiveContainer width="100%" height={400}>
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
            )}

            {activeChart === "attrtitionRatePerYearChart" && (
              <ResponsiveContainer width="100%" height={400}>
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
            )}

            {activeChart === "genderDistributionChart" && (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={transformed}>
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
            )}

            {activeChart === "typesOfLeaveTakenPerYearChart" && (
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
            )}
          </Box>
        </Modal>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gridAutoRows: "1fr",
            gap: 2,
            minHeight: 320,
            flexGrow: 1,
          }}
        >
          <Paper
            sx={{
              p: 1,
              textAlign: "center",
              cursor: "pointer",
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
          </Paper>

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
            {/* Title outside ResponsiveContainer */}
            <Typography variant="h6" sx={{ color: "#000", mb: 1 }}>
              Age Group Distribution
            </Typography>

            {/* Set a fixed height for the chart wrapper */}
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
          <Paper
            sx={{
              p: 1,
              textAlign: "center",

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
          </Paper>

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
          </Paper>

          <Paper
            sx={{
              p: 1,
              textAlign: "center",

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
                <BarChart data={transformed}>
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
          </Paper>
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
          </Paper>
        </Box>
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
