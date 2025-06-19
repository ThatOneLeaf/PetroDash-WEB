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
 * - height: number (optional)
 * - width: number (optional)
 */
const InvestmentPerCompany = ({ year: yearProp, companyId, height, width }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState(yearProp || null);
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
        if (!yearProp && years.length > 0) setYear(years[0]);
      })
      .catch(() => {/* do nothing */});
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
  const getWrappedLegendName = (name) => {
    const words = name.split(" ");
    let fontSize = 16;
    if (words.length > 4) fontSize = 11;
    else if (words.length > 3) fontSize = 13;
    else if (words.length > 2) fontSize = 14;
    // Wrap after 2 words
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

  const renderChart = (h = height || 350, w = width || "100%") => (
    <BarChartComponent
      title="Investments Per Company"
      data={chartData}
      legendName={getWrappedLegendName("Investment (₱)")}
      unit="₱"
      height={h}
      width={w}
      legendPosition="right"
    />
  );

  return (
    <Paper sx={{ p: 3, borderRadius: 2, width: "100%", minHeight: 0, height: "100%" }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Investments Per Company
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
          <MuiTooltip title="Zoom">
            <IconButton onClick={() => setZoomOpen(true)} size="small">
              <ZoomInIcon />
            </IconButton>
          </MuiTooltip>
        </Box>
      </Box>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={300} height="100%">
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ width: "100%", height: "100%", minHeight: 0 }}>
          {renderChart("100%", "100%")}
        </Box>
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
        {renderChart(550, "100%")}
      </ZoomModal>
    </Paper>
  );
};

export default InvestmentPerCompany;