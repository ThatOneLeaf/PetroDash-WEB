import React, { useEffect, useState } from "react";
import { Paper, Box, Typography, CircularProgress } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Cell } from "recharts";
// import ZoomInIcon from "@mui/icons-material/ZoomIn";
import api from "../../../services/api";
import ZoomModal from "../../../components/DashboardComponents/ZoomModal";

/**
 * Props:
 * - year: number (optional)
 * - companyId: string (optional)
 * - height: number (optional)
 * - width: number (optional)
 */
const InvestmentPerProject = ({ year: yearProp, companyId, height, width }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [availableYears, setAvailableYears] = useState([]);
  const [zoomOpen, setZoomOpen] = useState(false);

  // Define program colors (should match KPI colors)
  const PROGRAM_COLORS = {
    health: "#f8bcbc",     
    education: "#b6d4f7",   
    livelihood: "#fff3b0", 
    default: "#e2e8f0"     
  };

  // Helper to determine program by project/program name
  function getProgram(row) {
    const project = String(row.projectName || '').toLowerCase();
    const program = String(row.programName || '').toLowerCase();
    if (
      program.includes('health') ||
      project.includes('medical') ||
      project.includes('health center') ||
      project.includes('ambulance') ||
      project.includes('nutrition') ||
      project.includes('feeding') ||
      project.includes('supplement') ||
      project.includes('mobile clinic') 
    ) {
      return 'health';
    }
    if (
      program.includes('education') ||
      project.includes('school') ||
      project.includes('scholar') ||
      project.includes('teacher') ||
      project.includes('tablet') ||
      project.includes('mobile device') ||
      project.includes('educational device')
    ) {
      return 'education';
    }
    if (
      program.includes('livelihood') ||
      project.includes('livelihood') ||
      program.includes('individual recipient') ||
      project.includes('individual recipient')
    ) {
      return 'livelihood';
    }
    return 'default';
  }

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

  // Fetch data from API
  useEffect(() => {
    // Use yearProp and companyId directly
    setLoading(true);
    api
      .get("/help/investments-per-project", {
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

  // Chart rendering logic as a function for reuse in modal
  const renderChart = (h = height || 350, w = width || "100%") => (
    <Box sx={{ width: "100%", height: "100%", overflow: "hidden" }}>
      <Box sx={{ width: "100%", height: h, overflow: "hidden" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 16, right: 24, left: 8, bottom: 32 }}
          >
            <XAxis
              type="number"
              tick={{ fontSize: 10 }}
              tickFormatter={(value) => `₱${value.toLocaleString()}`}
            />
            <YAxis
              type="category"
              dataKey="projectName"
              width={120}
              interval={0}
              tick={{ fontSize: 10 }}
            />
            <Tooltip formatter={(value) => `₱${value.toLocaleString()}`} />
            {/* <Legend verticalAlign="middle" align="right" layout="vertical" /> */}
            <Bar
              dataKey="projectExpenses"
              name="Investment (₱)"
            >
              {data.map((entry, idx) => (
                <Cell
                  key={`cell-${idx}`}
                  fill={PROGRAM_COLORS[getProgram(entry)] || PROGRAM_COLORS.default}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
      {/* Custom Legend */}
      <Box display="flex" flexWrap="wrap" alignItems="center" mt={1} gap={2}>
        <Box display="flex" alignItems="center">
          <Box sx={{ width: 16, height: 16, bgcolor: PROGRAM_COLORS.health, mr: 1, borderRadius: 0.5, border: '1px solid #ccc' }} />
          <Typography variant="caption">Health</Typography>
        </Box>
        <Box display="flex" alignItems="center">
          <Box sx={{ width: 16, height: 16, bgcolor: PROGRAM_COLORS.education, mr: 1, borderRadius: 0.5, border: '1px solid #ccc' }} />
          <Typography variant="caption">Education</Typography>
        </Box>
        <Box display="flex" alignItems="center">
          <Box sx={{ width: 16, height: 16, bgcolor: PROGRAM_COLORS.livelihood, mr: 1, borderRadius: 0.5, border: '1px solid #ccc' }} />
          <Typography variant="caption">Livelihood</Typography>
        </Box>
        <Box display="flex" alignItems="center">
          <Box sx={{ width: 16, height: 16, bgcolor: PROGRAM_COLORS.default, mr: 1, borderRadius: 0.5, border: '1px solid #ccc' }} />
          <Typography variant="caption">Other</Typography>
        </Box>
      </Box>
    </Box>
    // <ResponsiveContainer width={w} height={h}>
    //   <BarChart
    //     data={data}
    //     layout="vertical"
    //     margin={{ top: 16, right: 24, left: 8, bottom: 32 }}
    //   >
    //     <XAxis
    //       type="number"
    //       tickFormatter={(value) => `₱${value.toLocaleString()}`}
    //       tick={{ fontSize: 10 }}
    //     />
    //     <YAxis
    //       type="category"
    //       dataKey="projectName"
    //       width={120}
    //       interval={0}
    //       tick={{ fontSize: 11 }}
    //       label={{
    //         value: "Project Name",
    //         angle: -90,
    //         position: "insideleft",
    //         offset: 0
    //       }}
    //     />
    //     <Tooltip formatter={(value) => `₱${value.toLocaleString()}`} />
    //     <Legend verticalAlign="middle" align="right" layout="vertical" />
    //     <Bar
    //       dataKey="projectExpenses"
    //       name={getWrappedLegendName("Investment (₱)")}
    //       fill="#1976d2"
    //     />
    //   </BarChart>
    // </ResponsiveContainer>
  );

  return (
    <Box sx={{ p: 0, width: "100%", height: "100%", minHeight: 0 }}>
      {/* Removed Zoom Icon/Button */}
      {/* <Box display="flex" alignItems="center" justifyContent="flex-end" sx={{ mb: 1 }}>
        <MuiTooltip title="Zoom">
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
        title="Investments Per Project"
        height={600}
        enableDownload
        downloadFileName="investments-per-project"
      >
        {renderChart(550, "100%")}
      </ZoomModal>
    </Box>
  );
};

export default InvestmentPerProject;