import React, { useEffect, useState } from "react";
import { Paper, Box, Typography, CircularProgress, IconButton, Tooltip as MuiTooltip } from "@mui/material";
import BarChartComponent from "../../../components/charts/BarChartComponent";
import api from "../../../services/api";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomModal from "../../../components/DashboardComponents/ZoomModal";

/**
 * Props:
 * - year: number (optional)
 * - companyId: string (optional)
 */
const InvestmentPerProgram = ({ year: yearProp, companyId }) => {
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
  }, [year, companyId, yearProp]);

  // Map API data to BarChartComponent format
  const chartData = data.map(item => ({
    name: item.companyName,
    value: item.projectExpenses
  }));

  // Chart rendering logic for modal reuse
  const renderChart = (height = 350) => (
    <BarChartComponent
      title="Investments Per Company"
      data={chartData}
      legendName="Investment (₱)"
      unit="₱"
      height={height}
    />
  );

  return (
    <Paper sx={{ p: 3, borderRadius: 2, width: "100%", minHeight: 400 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Investments Per Company
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
          {availableYears.length > 0 && (
            <select
              value={year || ""}
              onChange={e => setYear(Number(e.target.value))}
              style={{ padding: "4px 8px", borderRadius: 4, border: "1px solid #ccc" }}
            >
              {availableYears.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          )}
          <MuiTooltip title="Zoom">
            <IconButton onClick={() => setZoomOpen(true)} size="small">
              <ZoomInIcon />
            </IconButton>
          </MuiTooltip>
        </Box>
      </Box>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
          <CircularProgress />
        </Box>
      ) : (
        renderChart()
      )}
      {!loading && data.length === 0 && (
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4 }}>
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
        {renderChart(550)}
      </ZoomModal>
    </Paper>
  );
};

export default InvestmentPerProgram;