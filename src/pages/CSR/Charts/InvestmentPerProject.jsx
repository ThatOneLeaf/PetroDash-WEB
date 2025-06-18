import React, { useEffect, useState } from "react";
import { Paper, Box, Typography, CircularProgress } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import api from "../../../services/api";

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

  return (
    <Paper sx={{ p: 3, borderRadius: 2, width: "100%", minHeight: 400 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Investments Per Project
        </Typography>
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
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 16, right: 24, left: 8, bottom: 32 }}
          >
            <XAxis
              type="number"
              tickFormatter={(value) => `₱${value.toLocaleString()}`}
              // label={{ value: "Investment (₱)", position: "insideBottom", offset: -10 }}
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
      )}
      {!loading && data.length === 0 && (
        <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4 }}>
          No data available for the selected filters.
        </Typography>
      )}
    </Paper>
  );
};

export default InvestmentPerProject;