import { useState, useEffect, useMemo } from "react";
import { Button, Box, Paper, Typography, Stack } from "@mui/material";

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
import ClearButton from "../../components/DashboardComponents/ClearButton";
import KPIIndicatorCard from "../../components/KPIIndicatorCard";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Bar,
  BarChart,
} from "recharts";

const manHours = [
  { year: 2014, yearly: 124000 },
  { year: 2015, yearly: 132500 },
  { year: 2016, yearly: 140200 },
  { year: 2017, yearly: 135800 },
  { year: 2018, yearly: 145000 },
  { year: 2019, yearly: 150300 },
  { year: 2020, yearly: 138000 },
  { year: 2021, yearly: 143700 },
  { year: 2022, yearly: 155400 },
  { year: 2023, yearly: 160200 },
  { year: 2024, yearly: 165500 },
];

const manpowerPerYear = [
  { year: 2014, manpower: 2100 },
  { year: 2015, manpower: 2300 },
  { year: 2016, manpower: 2500 },
  { year: 2017, manpower: 2700 },
  { year: 2018, manpower: 3100 },
  { year: 2019, manpower: 3400 },
  { year: 2020, manpower: 3200 },
  { year: 2021, manpower: 3600 },
  { year: 2022, manpower: 3800 },
  { year: 2023, manpower: 3950 },
  { year: 2024, manpower: 4000 },
];

const incidentPerMonth = [
  { incident_type: "Accident", month_name: "January", incident_count: 0 },
  { incident_type: "Illness", month_name: "January", incident_count: 0 },
  { incident_type: "Accident", month_name: "January", incident_count: 0 },
  { incident_type: "Near Miss", month_name: "January", incident_count: 0 },
  { incident_type: "Accident", month_name: "January", incident_count: 0 },
  {
    incident_type: "Property Incident",
    month_name: "January",
    incident_count: 0,
  },
  { incident_type: "Accident", month_name: "January", incident_count: 0 },
  { incident_type: "Violation", month_name: "January", incident_count: 0 },
  { incident_type: "Illness", month_name: "January", incident_count: 0 },
  { incident_type: "Accident", month_name: "January", incident_count: 0 },
  { incident_type: "Accident", month_name: "January", incident_count: 0 },
  { incident_type: "Accident", month_name: "January", incident_count: 0 },
  { incident_type: "Accident", month_name: "January", incident_count: 0 },
  { incident_type: "Near Miss", month_name: "January", incident_count: 0 },
  {
    incident_type: "Property Incident",
    month_name: "January",
    incident_count: 0,
  },
  { incident_type: "Violation", month_name: "January", incident_count: 0 },
  { incident_type: "Accident", month_name: "February", incident_count: 0 },
  { incident_type: "Accident", month_name: "February", incident_count: 0 },
  { incident_type: "Accident", month_name: "February", incident_count: 0 },
  { incident_type: "Accident", month_name: "February", incident_count: 0 },
  { incident_type: "Illness", month_name: "February", incident_count: 0 },
  { incident_type: "Near Miss", month_name: "February", incident_count: 0 },
  {
    incident_type: "Property Incident",
    month_name: "February",
    incident_count: 0,
  },
  { incident_type: "Violation", month_name: "February", incident_count: 0 },
  { incident_type: "Illness", month_name: "February", incident_count: 0 },
  { incident_type: "Near Miss", month_name: "February", incident_count: 0 },
  {
    incident_type: "Property Incident",
    month_name: "February",
    incident_count: 0,
  },
  { incident_type: "Violation", month_name: "February", incident_count: 0 },
  { incident_type: "Accident", month_name: "February", incident_count: 0 },
  { incident_type: "Accident", month_name: "February", incident_count: 0 },
  { incident_type: "Accident", month_name: "February", incident_count: 0 },
  { incident_type: "Accident", month_name: "February", incident_count: 0 },
  { incident_type: "Illness", month_name: "March", incident_count: 0 },
  { incident_type: "Accident", month_name: "March", incident_count: 0 },
  { incident_type: "Accident", month_name: "March", incident_count: 0 },
  {
    incident_type: "Property Incident",
    month_name: "March",
    incident_count: 1,
  },
  { incident_type: "Accident", month_name: "March", incident_count: 0 },
  { incident_type: "Near Miss", month_name: "March", incident_count: 0 },
  { incident_type: "Violation", month_name: "March", incident_count: 0 },
  { incident_type: "Accident", month_name: "March", incident_count: 0 },
  { incident_type: "Near Miss", month_name: "March", incident_count: 0 },
  { incident_type: "Accident", month_name: "March", incident_count: 0 },
  { incident_type: "Accident", month_name: "March", incident_count: 0 },
  { incident_type: "Accident", month_name: "March", incident_count: 0 },
  {
    incident_type: "Property Incident",
    month_name: "March",
    incident_count: 0,
  },
  { incident_type: "Illness", month_name: "March", incident_count: 0 },
  { incident_type: "Violation", month_name: "March", incident_count: 0 },
  { incident_type: "Accident", month_name: "March", incident_count: 0 },
  { incident_type: "Accident", month_name: "April", incident_count: 0 },
  { incident_type: "Accident", month_name: "April", incident_count: 0 },
  { incident_type: "Accident", month_name: "April", incident_count: 0 },
  { incident_type: "Accident", month_name: "April", incident_count: 0 },
  { incident_type: "Illness", month_name: "April", incident_count: 0 },
  { incident_type: "Near Miss", month_name: "April", incident_count: 0 },
  {
    incident_type: "Property Incident",
    month_name: "April",
    incident_count: 0,
  },
  { incident_type: "Violation", month_name: "April", incident_count: 0 },
  { incident_type: "Illness", month_name: "April", incident_count: 0 },
  { incident_type: "Near Miss", month_name: "April", incident_count: 0 },
  {
    incident_type: "Property Incident",
    month_name: "April",
    incident_count: 0,
  },
  { incident_type: "Violation", month_name: "April", incident_count: 0 },
  { incident_type: "Accident", month_name: "April", incident_count: 0 },
  { incident_type: "Accident", month_name: "April", incident_count: 0 },
  { incident_type: "Accident", month_name: "April", incident_count: 0 },
  { incident_type: "Accident", month_name: "April", incident_count: 0 },
  { incident_type: "Accident", month_name: "May", incident_count: 0 },
  { incident_type: "Illness", month_name: "May", incident_count: 0 },
  { incident_type: "Accident", month_name: "May", incident_count: 0 },
  { incident_type: "Near Miss", month_name: "May", incident_count: 0 },
  { incident_type: "Property Incident", month_name: "May", incident_count: 0 },
  { incident_type: "Accident", month_name: "May", incident_count: 0 },
  { incident_type: "Violation", month_name: "May", incident_count: 0 },
  { incident_type: "Accident", month_name: "May", incident_count: 0 },
  { incident_type: "Violation", month_name: "May", incident_count: 0 },
  { incident_type: "Accident", month_name: "May", incident_count: 0 },
  { incident_type: "Accident", month_name: "May", incident_count: 0 },
  { incident_type: "Accident", month_name: "May", incident_count: 0 },
  { incident_type: "Accident", month_name: "May", incident_count: 0 },
  { incident_type: "Illness", month_name: "May", incident_count: 0 },
  { incident_type: "Near Miss", month_name: "May", incident_count: 0 },
  { incident_type: "Property Incident", month_name: "May", incident_count: 0 },
  { incident_type: "Violation", month_name: "June", incident_count: 0 },
  { incident_type: "Accident", month_name: "June", incident_count: 0 },
  { incident_type: "Accident", month_name: "June", incident_count: 0 },
  { incident_type: "Accident", month_name: "June", incident_count: 0 },
  { incident_type: "Accident", month_name: "June", incident_count: 0 },
  { incident_type: "Illness", month_name: "June", incident_count: 0 },
  { incident_type: "Property Incident", month_name: "June", incident_count: 0 },
  { incident_type: "Near Miss", month_name: "June", incident_count: 0 },
  { incident_type: "Illness", month_name: "June", incident_count: 0 },
  { incident_type: "Property Incident", month_name: "June", incident_count: 0 },
  { incident_type: "Violation", month_name: "June", incident_count: 0 },
  { incident_type: "Accident", month_name: "June", incident_count: 0 },
  { incident_type: "Near Miss", month_name: "June", incident_count: 0 },
  { incident_type: "Accident", month_name: "June", incident_count: 0 },
  { incident_type: "Accident", month_name: "June", incident_count: 0 },
  { incident_type: "Accident", month_name: "June", incident_count: 0 },
  { incident_type: "Accident", month_name: "July", incident_count: 0 },
  { incident_type: "Accident", month_name: "July", incident_count: 0 },
  { incident_type: "Accident", month_name: "July", incident_count: 0 },
  { incident_type: "Accident", month_name: "July", incident_count: 0 },
  { incident_type: "Illness", month_name: "July", incident_count: 0 },
  { incident_type: "Near Miss", month_name: "July", incident_count: 0 },
  { incident_type: "Property Incident", month_name: "July", incident_count: 1 },
  { incident_type: "Violation", month_name: "July", incident_count: 0 },
  { incident_type: "Illness", month_name: "July", incident_count: 0 },
  { incident_type: "Accident", month_name: "July", incident_count: 0 },
  { incident_type: "Near Miss", month_name: "July", incident_count: 0 },
  { incident_type: "Accident", month_name: "July", incident_count: 0 },
  { incident_type: "Accident", month_name: "July", incident_count: 0 },
  { incident_type: "Property Incident", month_name: "July", incident_count: 0 },
  { incident_type: "Accident", month_name: "July", incident_count: 0 },
  { incident_type: "Violation", month_name: "July", incident_count: 0 },
  {
    incident_type: "Property Incident",
    month_name: "August",
    incident_count: 1,
  },
  { incident_type: "Accident", month_name: "August", incident_count: 0 },
  { incident_type: "Accident", month_name: "August", incident_count: 0 },
  { incident_type: "Accident", month_name: "August", incident_count: 0 },
  { incident_type: "Accident", month_name: "August", incident_count: 0 },
  { incident_type: "Illness", month_name: "August", incident_count: 0 },
  { incident_type: "Near Miss", month_name: "August", incident_count: 0 },
  { incident_type: "Violation", month_name: "August", incident_count: 0 },
  { incident_type: "Accident", month_name: "August", incident_count: 0 },
  { incident_type: "Accident", month_name: "August", incident_count: 0 },
  { incident_type: "Near Miss", month_name: "August", incident_count: 0 },
  { incident_type: "Violation", month_name: "August", incident_count: 0 },
  { incident_type: "Accident", month_name: "August", incident_count: 0 },
  {
    incident_type: "Property Incident",
    month_name: "August",
    incident_count: 0,
  },
  { incident_type: "Illness", month_name: "August", incident_count: 0 },
  { incident_type: "Accident", month_name: "August", incident_count: 0 },
  { incident_type: "Accident", month_name: "September", incident_count: 0 },
  { incident_type: "Near Miss", month_name: "September", incident_count: 0 },
  {
    incident_type: "Property Incident",
    month_name: "September",
    incident_count: 1,
  },
  { incident_type: "Accident", month_name: "September", incident_count: 0 },
  { incident_type: "Accident", month_name: "September", incident_count: 0 },
  { incident_type: "Violation", month_name: "September", incident_count: 0 },
  { incident_type: "Accident", month_name: "September", incident_count: 0 },
  { incident_type: "Illness", month_name: "September", incident_count: 0 },
  { incident_type: "Accident", month_name: "September", incident_count: 0 },
  { incident_type: "Violation", month_name: "September", incident_count: 0 },
  { incident_type: "Accident", month_name: "September", incident_count: 0 },
  { incident_type: "Accident", month_name: "September", incident_count: 0 },
  {
    incident_type: "Property Incident",
    month_name: "September",
    incident_count: 0,
  },
  { incident_type: "Accident", month_name: "September", incident_count: 0 },
  { incident_type: "Illness", month_name: "September", incident_count: 0 },
  { incident_type: "Near Miss", month_name: "September", incident_count: 0 },
  { incident_type: "Violation", month_name: "October", incident_count: 0 },
  { incident_type: "Accident", month_name: "October", incident_count: 0 },
  { incident_type: "Accident", month_name: "October", incident_count: 0 },
  { incident_type: "Accident", month_name: "October", incident_count: 0 },
  { incident_type: "Accident", month_name: "October", incident_count: 0 },
  { incident_type: "Illness", month_name: "October", incident_count: 0 },
  { incident_type: "Near Miss", month_name: "October", incident_count: 0 },
  {
    incident_type: "Property Incident",
    month_name: "October",
    incident_count: 0,
  },
  { incident_type: "Illness", month_name: "October", incident_count: 0 },
  { incident_type: "Near Miss", month_name: "October", incident_count: 0 },
  {
    incident_type: "Property Incident",
    month_name: "October",
    incident_count: 0,
  },
  { incident_type: "Violation", month_name: "October", incident_count: 0 },
  { incident_type: "Accident", month_name: "October", incident_count: 0 },
  { incident_type: "Accident", month_name: "October", incident_count: 0 },
  { incident_type: "Accident", month_name: "October", incident_count: 0 },
  { incident_type: "Accident", month_name: "October", incident_count: 0 },
  { incident_type: "Accident", month_name: "November", incident_count: 0 },
  { incident_type: "Accident", month_name: "November", incident_count: 0 },
  { incident_type: "Accident", month_name: "November", incident_count: 0 },
  { incident_type: "Accident", month_name: "November", incident_count: 0 },
  { incident_type: "Illness", month_name: "November", incident_count: 0 },
  { incident_type: "Near Miss", month_name: "November", incident_count: 0 },
  {
    incident_type: "Property Incident",
    month_name: "November",
    incident_count: 0,
  },
  { incident_type: "Violation", month_name: "November", incident_count: 0 },
  { incident_type: "Illness", month_name: "November", incident_count: 0 },
  {
    incident_type: "Property Incident",
    month_name: "November",
    incident_count: 0,
  },
  { incident_type: "Near Miss", month_name: "November", incident_count: 0 },
  { incident_type: "Accident", month_name: "November", incident_count: 0 },
  { incident_type: "Accident", month_name: "November", incident_count: 0 },
  { incident_type: "Accident", month_name: "November", incident_count: 0 },
  { incident_type: "Accident", month_name: "November", incident_count: 0 },
  { incident_type: "Violation", month_name: "November", incident_count: 0 },
  {
    incident_type: "Property Incident",
    month_name: "December",
    incident_count: 0,
  },
  { incident_type: "Accident", month_name: "December", incident_count: 0 },
  { incident_type: "Accident", month_name: "December", incident_count: 0 },
  { incident_type: "Accident", month_name: "December", incident_count: 0 },
  { incident_type: "Accident", month_name: "December", incident_count: 0 },
  { incident_type: "Illness", month_name: "December", incident_count: 0 },
  { incident_type: "Violation", month_name: "December", incident_count: 0 },
  { incident_type: "Near Miss", month_name: "December", incident_count: 0 },
  { incident_type: "Accident", month_name: "December", incident_count: 0 },
  { incident_type: "Near Miss", month_name: "December", incident_count: 0 },
  { incident_type: "Accident", month_name: "December", incident_count: 0 },
  { incident_type: "Accident", month_name: "December", incident_count: 0 },
  { incident_type: "Accident", month_name: "December", incident_count: 0 },
  { incident_type: "Illness", month_name: "December", incident_count: 0 },
  { incident_type: "Violation", month_name: "December", incident_count: 0 },
  {
    incident_type: "Property Incident",
    month_name: "December",
    incident_count: 0,
  },
];

function HRSafetyTrainingDash({}) {
  //INITIALIZE

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

  const isFiltering = useMemo(() => {
    return Object.values(filters).some((v) => v !== null && v !== "");
  }, [filters]);

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
              options={""}
              selectedValues={""}
              onChange={""}
              placeholder="All Companies"
            />

            <MultiSelectWithChips
              label="Position"
              options={""}
              selectedValues={""}
              onChange={""}
              placeholder="All Position"
            />
            <MultiSelectWithChips label="Start Date" placeholder="Start Date" />
            <MultiSelectWithChips label="End Date" placeholder="End Date" />

            {showClearButton && <ClearButton onClick={clearAllFilters} />}

            <Box sx={{ flexGrow: 1, minWidth: 10 }} />
          </Stack>
        </Box>
        <Box sx={{ display: "flex", height: "120px", gap: 2, mb: 3 }}>
          <KPIIndicatorCard
            value="535765"
            label="Total Safety manhours"
            variant="outlined"
          />
          <KPIIndicatorCard
            value="1234"
            label="Total manhours since last accident"
            variant="filled"
          />
          <KPIIndicatorCard
            value="968"
            label="Total Training hours"
            variant="outlined"
          />
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gridAutoRows: "1fr",
            gap: 2,
            flexGrow: 1,
          }}
        >
          <Paper
            sx={{
              p: 2,
              textAlign: "center",
            }}
          >
            <Typography variant="h6" sx={{ color: "#000000", mb: 1 }}>
              Incidents Per Month
            </Typography>
            <Box sx={{ height: 350, bgcolor: "#fff", borderRadius: 2, p: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={
                    // Transform data for grouped bar chart
                    (() => {
                      // Get all months in order
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
                      // Get all unique incident types
                      const types = [
                        ...new Set(
                          incidentPerMonth.map((i) => i.incident_type)
                        ),
                      ];
                      // Build data: one object per month, each type as a key
                      return months.map((month) => {
                        const row = { month };
                        types.forEach((type) => {
                          row[type] = incidentPerMonth
                            .filter(
                              (i) =>
                                i.month_name === month &&
                                i.incident_type === type
                            )
                            .reduce((sum, i) => sum + i.incident_count, 0);
                        });
                        return row;
                      });
                    })()
                  }
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="month"
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  {/* Render a Bar for each incident type */}
                  {Array.from(
                    new Set(incidentPerMonth.map((i) => i.incident_type))
                  ).map((type, idx) => (
                    <Bar
                      key={type}
                      dataKey={type}
                      stackId="a"
                      fill={
                        [
                          "#1976d2", // blue
                          "#e57373", // red
                          "#ffb300", // orange
                          "#388e3c", // green
                          "#8e24aa", // purple
                          "#fbc02d", // yellow
                          "#0288d1", // light blue
                          "#c62828", // dark red
                          "#43a047", // light green
                        ][idx % 9]
                      }
                      name={type}
                      barSize={12}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr ",
              gridAutoRows: "1fr",
              gap: 2,
              flexGrow: 1,
            }}
          >
            <Paper
              sx={{
                p: 1,
                textAlign: "center",

                color: "#fff",
              }}
            >
              <Typography variant="h6" sx={{ color: "#000", mb: 1 }}>
                Total Man Hours Per Year
              </Typography>
              <Box sx={{ height: 250 }}>
                <ResponsiveContainer>
                  <LineChart
                    data={manHours}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis domain={[0, "auto"]} />
                    <Tooltip
                      formatter={(value) => `${value} man hours`}
                      itemStyle={{
                        color: "#000",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="yearly"
                      stroke="#1976d2"
                      dot={{ fill: "#1976d2" }}
                      name="Count"
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
            >
              <Typography variant="h6" sx={{ color: "#000", mb: 1 }}>
                Total Man Power Per Year
              </Typography>
              <Box sx={{ height: 250 }}>
                <ResponsiveContainer>
                  <LineChart
                    data={manpowerPerYear}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis domain={[0, "auto"]} />
                    <Tooltip
                      formatter={(value) => `${value} manpowers`}
                      itemStyle={{
                        color: "#000",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="manpower"
                      stroke="#1976d2"
                      dot={{ fill: "#1976d2" }}
                      name="Count"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default HRSafetyTrainingDash;
