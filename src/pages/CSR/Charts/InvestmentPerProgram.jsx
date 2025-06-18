import React, { useEffect, useState } from "react";
import { Paper, Box, Typography, CircularProgress, IconButton, Tooltip as MuiTooltip } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomModal from "../../../components/DashboardComponents/ZoomModal";
import api from "../../../services/api";

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
      .get("/help/investments-per-program", {
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

  // Chart rendering logic as a function for reuse
  const renderChart = (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart
        data={data}
        margin={{ top: 16, right: 24, left: 8, bottom: 32 }}
      >
        <XAxis
          dataKey="programName"
          type="category"
          interval={0}
          tick={{ fontSize: 13 }}
          label={{
            value: "Program Name",
            position: "insideBottom",
            offset: -5
          }}
        />
        <YAxis
          type="number"
          tickFormatter={(value) => `₱${value.toLocaleString()}`}
        />
        <Tooltip formatter={(value) => `₱${value.toLocaleString()}`} />
        <Legend />
        <Bar dataKey="projectExpenses" name="Investment Per Program" fill="#1976d2" />
      </BarChart>
    </ResponsiveContainer>
  );

  return (
    <>
      <Paper sx={{ p: 3, borderRadius: 2, width: "100%", minHeight: 400 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Investments Per Project
          </Typography>
          <MuiTooltip title="Zoom In">
            <IconButton onClick={() => setZoomOpen(true)} size="small">
              <ZoomInIcon />
            </IconButton>
          </MuiTooltip>
          {/* Year filter dropdown */}
          {/* {availableYears.length > 0 && (
            <select
              value={year || ""}
              onChange={e => setYear(Number(e.target.value))}
              style={{ padding: "4px 8px", borderRadius: 4, border: "1px solid #ccc" }}
            >
              {availableYears.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          )} */}
        </Box>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
            <CircularProgress />
          </Box>
        ) : (
          renderChart
        )}
        {!loading && data.length === 0 && (
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4 }}>
            No data available for the selected filters.
          </Typography>
        )}
      </Paper>
      <ZoomModal
        open={zoomOpen}
        onClose={() => setZoomOpen(false)}
        title="Investments Per Project"
        height={600}
        enableDownload
        downloadFileName="investments-per-program"
      >
        <Box sx={{ width: 900, height: 500, minWidth: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 16, right: 24, left: 8, bottom: 32 }}
            >
              <XAxis
                dataKey="programName"
                type="category"
                interval={0}
                tick={{ fontSize: 15 }}
                label={{
                  value: "Program Name",
                  position: "insideBottom",
                  offset: -5
                }}
              />
              <YAxis
                type="number"
                tickFormatter={(value) => `₱${value.toLocaleString()}`}
              />
              <Tooltip formatter={(value) => `₱${value.toLocaleString()}`} />
              <Legend />
              <Bar dataKey="projectExpenses" name="Investment Per Program" fill="#1976d2" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </ZoomModal>
    </>
  );
};

export default InvestmentPerProgram;