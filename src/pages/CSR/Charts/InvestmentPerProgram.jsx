import React, { useEffect, useState } from "react";
// import { Paper, Box, Typography, CircularProgress } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts";
// import ZoomInIcon from '@mui/icons-material/ZoomIn';
import { Paper, Box, Typography, CircularProgress, IconButton, Tooltip as MuiTooltip } from "@mui/material";
// import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
// import ZoomInIcon from '@mui/icons-material/ZoomIn';
// import ZoomModal from "../../../components/DashboardComponents/ZoomModal";
import api from "../../../services/api";

/**
 * Props:
 * - year: number (optional)
 * - companyId: string (optional)
 * - height: number (optional)
 * - width: number (optional)
 */

// Program color map
const programColorMap = {
  health: "#ef4444",
  education: "#1976d2",
  livelihood: "#fbbf24",
  default: "#a3a3a3"
};

// Helper to get program from programName
function getProgram(row) {
  const name = (row.programName || "").toLowerCase();
  if (name.includes("health")) return "health";
  if (name.includes("education")) return "education";
  if (name.includes("livelihood")) return "livelihood";
  return "default";
}

const InvestmentPerProgram = ({ year: yearProp, companyId, height, width }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
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
      })
      .catch(() => setAvailableYears([]));
  }, [yearProp]);

  // Fetch data from API (always fetch, use yearProp and companyId directly)
  useEffect(() => {
    setLoading(true);
    api
      .get("/help/investments-per-program", {
        params: {
          ...(yearProp ? { year: yearProp } : {}),
          ...(companyId ? { company_id: companyId } : {}),
        },
      })
      .then((res) => {
        // Sort data in descending order by projectExpenses
        const sorted = (res.data || []).slice().sort((a, b) => b.projectExpenses - a.projectExpenses);
        setData(sorted);
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [yearProp, companyId]);

  // Calculate max program name length for dynamic offset
  const maxProgramNameLength = data.reduce(
    (max, row) => Math.max(max, (row.programName || '').length),
    0
  );
  // Adjust X axis label offset and tick font size based on name length
  const xAxisLabelOffset = maxProgramNameLength > 18 ? -15 : -5;
  const xAxisTickFontSize = maxProgramNameLength > 18 ? 10 : 11;

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

  // Chart rendering logic as a function for reuse
  const renderChart = (h = height || 350, w = width || "100%") => (
    <ResponsiveContainer width={w} height={h}>
      <BarChart
        data={data}
        margin={{ top: 16, right: 24, left: 32, bottom: 32 }}
      >
        <XAxis
          dataKey="programName"
          type="category"
          interval={0}
          tick={{ fontSize: 10 }}
        />
        <YAxis
          type="number"
          tick={{ fontSize: 10 }}
          tickFormatter={(value) => `₱${value.toLocaleString()}`}
        />
        <Tooltip formatter={(value) => `₱${value.toLocaleString()}`} />
        <Bar
          dataKey="projectExpenses"
          name={getWrappedLegendName("Investment Per Program")}
          fill="#1976d2"
        >
          {data.map((entry, idx) => (
            <Cell
              key={`cell-${idx}`}
              fill={programColorMap[getProgram(entry)] || programColorMap.default}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );

  return (
    <Box sx={{ p: 0, width: "100%", height: "100%", minHeight: 0 }}>
      {/* Removed Zoom Icon/Button */}
      {/* <Box display="flex" alignItems="center" justifyContent="flex-end" sx={{ mb: 1 }}>
        <MuiTooltip title="Zoom In">
          <IconButton onClick={() => setZoomOpen(true)} size="small">
            <ZoomInIcon />
          </IconButton>
        </MuiTooltip>
      </Box> */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={100} height="100%">
          <CircularProgress />
        </Box>
      ) : (
        <Box
          sx={{
            width: "100%",
            height: "100%",
            minHeight: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}
        >
          {renderChart("100%", "100%")}
        </Box>
      )}
      {!loading && data.length === 0 && (
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
          No data available for the selected filters.
        </Typography>
      )}
      {/* <ZoomModal
        open={zoomOpen}
        onClose={() => setZoomOpen(false)}
        title="Investments Per Program"
        height={600}
        enableDownload
        downloadFileName="investments-per-program"
      >
        <Box sx={{ width: 900, height: 500, minWidth: 300, display: "flex", justifyContent: "center", alignItems: "center" }}>
          {renderChart(500, 800)}
        </Box>
      </ZoomModal> */}
    </Box>
  );
};

export default InvestmentPerProgram;