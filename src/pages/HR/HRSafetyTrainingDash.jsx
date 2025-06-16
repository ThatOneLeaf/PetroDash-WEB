import { useState, useEffect, useMemo } from "react";
import { Button, Box, Paper, Typography } from "@mui/material";

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

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
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
            value="1234"
            label="TOTAL SAFETY MANHOURS"
            variant="outlined"
          />
          <KPIIndicatorCard
            value="1234"
            label="TOTAL NUMBER OF ACCIDENTS"
            variant="filled"
          />
          <KPIIndicatorCard
            value="1234"
            label="TOTAL TRAINING HOURS"
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
              bgcolor: "#e57373",
              color: "#fff",
            }}
          >
            Section 1
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
