import React, { useEffect, useState } from "react";
import { Paper, Box, Typography, CircularProgress } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
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

  // Fetch data from API (use yearProp directly)
  useEffect(() => {
    setLoading(true);
    api
      .get("/help/investments-per-company", {
        params: {
          ...(yearProp ? { year: yearProp } : {}),
        },
      })
      .then((res) => {
        // Sort data in descending order by companyExpenses
        const sorted = (res.data || []).slice().sort((a, b) => b.companyExpenses - a.companyExpenses);
        setData(sorted);
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, [yearProp]);

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

  // Helper: generate a color palette (extend as needed)
  const COLORS = [
    "#1976d2", "#388e3c", "#fbc02d", "#d32f2f", "#7b1fa2", "#0288d1", "#c2185b",
    "#ffa000", "#388e3c", "#455a64", "#f57c00", "#0288d1", "#afb42b", "#6d4c41",
    "#00897b", "#c62828", "#5d4037", "#303f9f", "#0097a7", "#fbc02d"
  ];

  // Helper: get color for a company index
  const getCompanyColor = (idx) => COLORS[idx % COLORS.length];

  // Chart rendering logic as a function for reuse in modal
  const renderChart = (h = height || 350, w = width || "100%") => (
    <ResponsiveContainer width={w} height={h}>
      <BarChart
        data={data}
        margin={{ top: 16, right: 24, left: 8, bottom: 48 }}
      >
        <XAxis
          dataKey="companyId"
          interval={0}
          angle={20}
          tick={{ fontSize: 10 }}
        />
        <YAxis
          type="number"
          tickFormatter={(value) => `₱${value.toLocaleString()}`}
          tick={{ fontSize: 10 }}
        />
        <Tooltip formatter={(value) => `₱${value.toLocaleString()}`} />
        {/* Custom Legend at the bottom, small font */}
        <Legend
          verticalAlign="bottom"
          align="center"
          height={36}
          iconSize={10}
          wrapperStyle={{ fontSize: 11, marginTop: 8 }}
          payload={
            data.map((entry, idx) => ({
              value: entry.companyId,
              type: "square",
              color: getCompanyColor(idx),
              id: entry.companyId
            }))
          }
        />
        {/* Single Bar, color by company */}
        <Bar
          dataKey="projectExpenses"
          name="Investment (₱)"
          isAnimationActive={false}
          barSize={30}
          fill={
            // fallback color if function not supported
            COLORS[0]
          }
          // Per-bar color
          {...{
            shape: (props) => {
              const { x, y, width, height, index } = props;
              return (
                <rect
                  x={x}
                  y={y}
                  width={width}
                  height={height}
                  fill={getCompanyColor(index)}
                />
              );
            }
          }}
        />
      </BarChart>
    </ResponsiveContainer>
  );

  return (
    <Box sx={{ p: 0, width: "100%", height: "100%", minHeight: 0 }}>
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

