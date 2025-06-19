import React, { useEffect, useState } from "react";
import { Paper, Box, Typography, CircularProgress, IconButton, Tooltip as MuiTooltip } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import api from "../../../services/api";
import ZoomModal from "../../../components/DashboardComponents/ZoomModal";

/**
 * Props:
 * - year: number (optional)
 * - companyId: string (optional)
 */
const InvestmentPerProject = ({ year: yearProp, companyId }) => {
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
      .get("/help/investments-per-project", {
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

  // Chart rendering logic as a function for reuse in modal
  const renderChart = (height = 350) => (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 16, right: 24, left: 8, bottom: 32 }}
      >
        <XAxis
          type="number"
          tickFormatter={(value) => `₱${value.toLocaleString()}`}
        />
        <YAxis
          type="category"
          dataKey="projectName"
          width={180}
          interval={0}
          tick={{ fontSize: 13 }}
          label={{
            value: "Project Name",
            angle: -90,
            position: "insideleft",
            offset: 0
          }}
        />
        <Tooltip formatter={(value) => `₱${value.toLocaleString()}`} />
        <Legend />
        <Bar dataKey="projectExpenses" name="Investment (₱)" fill="#1976d2" />
      </BarChart>
    </ResponsiveContainer>
  );

  return (
    <Box sx={{ p: 3, width: "100%", minHeight: 400 }}>
      <Box display="flex" alignItems="center" justifyContent="flex-end" sx={{ mb: 2 }}>
        {/* Zoom Button */}
        <MuiTooltip title="Zoom">
          <IconButton onClick={() => setZoomOpen(true)} size="small">
            <ZoomInIcon />
          </IconButton>
        </MuiTooltip>
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
        title="Investments Per Project"
        height={600}
        enableDownload
        downloadFileName="investments-per-project"
      >
        {renderChart(550)}
      </ZoomModal>
    </Box>
  );
};

export default InvestmentPerProject;