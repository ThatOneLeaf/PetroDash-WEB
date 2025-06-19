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
import KPICard from "../../components/DashboardComponents/KPICard";
import ZoomModal from "../../components/DashboardComponents/ZoomModal"; // Adjust path as needed
import ZoomInIcon from "@mui/icons-material/ZoomIn";
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
  {
    year: 2019,
    total_manhours: 9434,
    manpower: 5,
  },
  {
    year: 2020,
    total_manhours: 13496,
    manpower: 8,
  },
  {
    year: 2021,
    total_manhours: 15066,
    manpower: 9,
  },
  {
    year: 2022,
    total_manhours: 19283,
    manpower: 9,
  },
  {
    year: 2023,
    total_manhours: 20767,
    manpower: 10,
  },
  {
    year: 2024,
    total_manhours: 19333,
    manpower: 9,
  },
  {
    year: 2025,
    total_manhours: 7173,
    manpower: 8,
  },
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

function HRSafetyTrainingDash({ shouldReload, setShouldReload }) {
  //INITIALIZE

  //INITIALIZE -DATA
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [totalSafetyManhours, setTotalSafetyManhours] = useState(null);
  const [totalTrainingHours, setTotalTrainingHours] = useState(null);

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

  useEffect(() => {
    const fetchTrainingAndSafetyData = async () => {
      try {
        const params = {};
        if (companyFilter.length > 0)
          params.company_id = companyFilter.join(",");
        if (positionFilter.length > 0)
          params.position_id = positionFilter.join(",");

        const [totalManHoursRes, totalTrainingHoursRes] = await Promise.all([
          api.get("hr/total_safety_manhours", { params }),
          api.get("hr/total_training_hours", { params }),
        ]);

        setTotalSafetyManhours(
          totalManHoursRes.data[0]["total_safety_manhours"]
        );

        setTotalTrainingHours(
          totalTrainingHoursRes.data[0]["total_training_hours"]
        );
      } catch (error) {
        console.error("Failed to fetch totals:", error);
        setTotalSafetyManhours("N/A");
        setTotalTrainingHours("N/A");
      } finally {
        setLoading(false);
      }
    };

    fetchTrainingAndSafetyData();
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

  //helper functions for charts
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
    <Box sx={{ display: "flex", height: "100vh" }}>
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
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
            value={totalSafetyManhours}
            unit=""
            title="Total Safety manhours"
            colorScheme={{
              backgroundColor: "#1E40AF",
              textColor: "#FFFFFF",
              iconColor: "#FFFFFF",
            }}
            style={{ flex: 1, minHeight: "100px" }}
          />
          <KPICard
            loading={false}
            value={"123"}
            unit=""
            title="Lost Time Accident"
            colorScheme={{
              backgroundColor: "#1E40AF",
              textColor: "#FFFFFF",
              iconColor: "#FFFFFF",
            }}
            style={{ flex: 1, minHeight: "100px" }}
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
            style={{ flex: 1 }}
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
          <div
            style={{
              backgroundColor: "white",
              padding: "12px",
              borderRadius: "8px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
              position: "relative",
              cursor: "pointer",
              transition: "box-shadow 0.2s",
              width: "100%",
              height: "100%",
            }}
            onClick={() =>
              openZoomModal(
                "Incidents Per Month",
                "incidents-per-month",
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
                        <BarChart
                          data={transformIncidentData(incidentPerMonth)}
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
                          {getIncidentTypes(incidentPerMonth).map(
                            (type, idx) => (
                              <Bar
                                key={type}
                                dataKey={type}
                                stackId="a"
                                fill={barColors[idx % barColors.length]}
                                name={type}
                                barSize={12}
                              />
                            )
                          )}
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
              Incidents Per Month
            </h3>

            {!incidentPerMonth || incidentPerMonth.length === 0 ? (
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
              <div style={{ flex: 1, minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={transformIncidentData(incidentPerMonth)}
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
                    {getIncidentTypes(incidentPerMonth).map((type, idx) => (
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
              </div>
            )}
          </div>

          {/* 
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
          </Paper>*/}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr ",
              gridAutoRows: "1fr",
              gap: 2,
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
                minHeight: 0,
                position: "relative",
                cursor: "pointer",
                transition: "box-shadow 0.2s",
                width: "100%",
                height: "100%",
              }}
              onClick={() =>
                openZoomModal(
                  "Total Man Hours Per Year",
                  "total-man-hours-year",
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
                            data={manpowerPerYear}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="year" />
                            <YAxis domain={[0, "auto"]} />
                            <Tooltip
                              formatter={(value) => `${value} man hours`}
                              itemStyle={{ color: "#000" }}
                            />
                            <Legend />
                            <Line
                              type="monotone"
                              dataKey="total_manhours"
                              stroke="#1976d2"
                              dot={{ fill: "#1976d2" }}
                              name="Man Hours"
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
                Total Man Hours Per Year
              </h3>

              {!manpowerPerYear || manpowerPerYear.length === 0 ? (
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
                <div style={{ flex: 1, minHeight: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={manpowerPerYear}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis domain={[0, "auto"]} />
                      <Tooltip
                        formatter={(value) => `${value} man hours`}
                        itemStyle={{ color: "#000" }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="total_manhours"
                        stroke="#1976d2"
                        dot={{ fill: "#1976d2" }}
                        name="Man Hours"
                      />
                    </LineChart>
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
            </Paper>*/}

            <div
              style={{
                backgroundColor: "white",
                padding: "12px",
                borderRadius: "8px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                display: "flex",
                flexDirection: "column",
                minHeight: 0,
                position: "relative",
                cursor: "pointer",
                transition: "box-shadow 0.2s",
                width: "100%",
                height: "100%",
              }}
              onClick={() =>
                openZoomModal(
                  "Total Man Power Per Year",
                  "total-manpower-year",
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
                            data={manpowerPerYear}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="year" />
                            <YAxis domain={[0, "auto"]} />
                            <Tooltip
                              formatter={(value) => `${value} manpowers`}
                              itemStyle={{ color: "#000" }}
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
                Total Man Power Per Year
              </h3>

              {!manpowerPerYear || manpowerPerYear.length === 0 ? (
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
                <div style={{ flex: 1, minHeight: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={manpowerPerYear}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis domain={[0, "auto"]} />
                      <Tooltip
                        formatter={(value) => `${value} manpowers`}
                        itemStyle={{ color: "#000" }}
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
}

export default HRSafetyTrainingDash;
