import React, { useEffect, useState } from "react";
import { Paper, Box, Typography, CircularProgress, IconButton, Tooltip as MuiTooltip } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import api from "../../../services/api";
import ZoomModal from "../../../components/DashboardComponents/ZoomModal";

/**
 * Props:
 * - year: number (optional)
 * - height: number (optional)
 * - width: number (optional)
 */
const InvestmentPerCompany = ({ year: yearProp, height, width }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState(yearProp || null);
  const [availableYears, setAvailableYears] = useState([]);
  const [zoomOpen, setZoomOpen] = useState(false);

  // Fetch available years for default selection
  useEffect(() => {
    api
      .get("/help/activities")
      .then((res) => {
        const years = Array.from(
          new Set((res.data || []).map((item) => item.projectYear))
        ).filter(Boolean);
        years.sort((a, b) => b - a); // Descending
        setAvailableYears(years);
        if (!yearProp && years.length > 0) setYear(years[0]);
      })
      .catch(() => setAvailableYears([]));
  }, [yearProp]);

  // Fetch data from API
  useEffect(() => {
    if (!year && !yearProp) return;
    setLoading(true);
    api
      .get("/help/investments-per-company", {
        params: {
          ...(year ? { year } : {}),
        },
      })
      .then((res) => {
        console.log("API data:", res.data); // <-- Add this line
        // Sort data in descending order by companyExpenses
        const sorted = (res.data || []).slice().sort((a, b) => b.companyExpenses - a.companyExpenses);
        setData(sorted);
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [year, yearProp]);

  // Helper to wrap legend name and adjust font size
  const getWrappedLegendName = (name) => {
    const words = name.split(" ");
    let fontSize = 16;
    if (words.length > 4) fontSize = 11;
    else if (words.length > 3) fontSize = 13;
    else if (words.length > 2) fontSize = 14;
    if (words.length > 2) {
      return (
        <span style={{ fontSize }}>
          {words.slice(0, 2).join(" ")}
          <br />
          {words.slice(2).join(" ")}
        </span>
      );
    }
    return <span style={{ fontSize }}>{name}</span>;
  };

  console.log(data)

  // Chart rendering logic as a function for reuse in modal
  const renderChart = (h = height || 350, w = width || "100%") => (
    <ResponsiveContainer width={w} height={h}>
      <BarChart
        data={data}
        margin={{ top: 16, right: 24, left: 8, bottom: 32 }}
      >
        <XAxis
          dataKey="companyId"
          interval={0}
          // angle={40}
          tick={{ fontSize: 10 }}
          label={{
            value: "Company Name",
            position: "insideBottom",
            offset: -10
          }}
        />
        <YAxis
          type="number"
          tickFormatter={(value) => `₱${value.toLocaleString()}`}
          tick={{ fontSize: 10 }}
          label={{
            value: "Investment (₱)",
            angle: -90,
            position: "insideLeft",
            offset: 0
          }}
        />
        <Tooltip formatter={(value) => `₱${value.toLocaleString()}`} />
        <Legend verticalAlign="top" align="right" />
        <Bar
          dataKey="projectExpenses"
          name={getWrappedLegendName("Investment (₱)")}
          fill="#1976d2"
        />
      </BarChart>
    </ResponsiveContainer>
  );

  return (
    <Box sx={{ p: 0, width: "100%", height: "100%", minHeight: 0 }}>
      <Box display="flex" alignItems="center" justifyContent="flex-end" sx={{ mb: 1 }}>
        {/* Zoom Button */}
        <MuiTooltip title="Zoom">
          <IconButton onClick={() => setZoomOpen(true)} size="small">
            <ZoomInIcon />
          </IconButton>
        </MuiTooltip>
      </Box>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={100} height="100%">
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ width: "100%", height: "100%", minHeight: 0 }}>
          {renderChart("100%", "100%")}
        </Box>
      )}
      {!loading && data.length === 0 && (
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
          No data available for the selected filters.
        </Typography>
      )}
      {/* Zoom Modal */}
      <ZoomModal
        open={zoomOpen}
        onClose={() => setZoomOpen(false)}
        title="Investments Per Company"
        height={600}
        enableDownload
        downloadFileName="investments-per-company"
      >
        {renderChart(550, "100%")}
      </ZoomModal>
    </Box>
  );
};

export default InvestmentPerCompany;
