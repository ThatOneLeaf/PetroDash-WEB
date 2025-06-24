import React, { useState, useEffect } from "react";
import { Box, Typography, Paper } from "@mui/material";
import api from "../../services/api";

const HROverview = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [totalSafetyManhours, setTotalSafetyManhours] = useState(null);
  const [totalSafetyPower, setTotalSafetyPower] = useState(null);
  const [totalTrainingHours, setTotalTrainingHours] = useState(null);

  useEffect(() => {
    const fetchTrainingAndSafetyData = async () => {
      try {
        const [totalManHoursRes, totalSafetyPowerRes, totalTrainingHoursRes] =
          await Promise.all([
            api.get("hr/total_safety_manpower"),
            api.get("hr/total_safety_manhours"),
            api.get("hr/total_training_hours"),
          ]);

        setTotalSafetyPower(
          Number(totalManHoursRes.data[0]?.total_safety_manpower ?? 0)
        );
        setTotalSafetyManhours(
          Number(totalSafetyPowerRes.data[0]?.total_safety_manhours ?? 0)
        );
        setTotalTrainingHours(
          Number(totalTrainingHoursRes.data[0]?.total_training_hours ?? 0)
        );
      } catch (error) {
        console.error("Failed to fetch totals:", error);
        setTotalSafetyManhours("N/A");
        setTotalSafetyPower("N/A");
        setTotalTrainingHours("N/A");
      } finally {
        setLoading(false);
      }
    };

    fetchTrainingAndSafetyData();
  }, []);

  const formatNumber = (num) => {
    const parsed = Number(num);
    if (isNaN(parsed)) return "N/A";
    return parsed.toLocaleString();
  };
  const MetricCard = ({ title, value, unit, color }) => (
    <Paper
      elevation={0}
      sx={{
        backgroundColor: color,
        borderRadius: 3,
        p: 2,
        color: "white",
        textAlign: "center",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Typography
        variant="h5"
        sx={{
          fontWeight: "bold",
          fontSize: "1.5rem",
        }}
      >
        {loading ? "######" : formatNumber(value)}
        {!loading && unit && (
          <Typography component="span" sx={{ fontSize: "0.8rem", ml: 0.5 }}>
            {unit}
          </Typography>
        )}
      </Typography>

      <Typography
        variant="body2"
        sx={{
          fontSize: "0.75rem",
          fontWeight: "bold",
          mt: 0.5, // margin-top instead of mb
          letterSpacing: "0.5px",
        }}
      >
        {title}
      </Typography>
    </Paper>
  );

  if (error && !loading) {
    console.warn("Using default environment data due to API error");
  }

  return (
    <Box sx={{ height: "100%", width: "100%", p: 0 }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 1,
          height: "100%",
        }}
      >
        <MetricCard
          title="Total Safety Manhours"
          value={totalSafetyManhours}
          color="#2E4057"
        />
        <MetricCard
          title="Total Safety Manpower"
          value={totalSafetyPower}
          color="#2E4057"
        />
        <MetricCard
          title="Total Training Hours"
          value={totalTrainingHours}
          color="#2E4057"
        />
      </Box>
    </Box>
  );
};

export default HROverview;
