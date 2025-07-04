import React, { useState, useEffect } from "react";
import { Box, Typography, Paper } from "@mui/material";
import api from "../../services/api";
import EngineeringIcon from "@mui/icons-material/Engineering";
import GroupsIcon from "@mui/icons-material/Groups";
import PsychologyIcon from "@mui/icons-material/Psychology";

const KPI_STYLES = {
  manhours: {
    bg: "#b2e0e6", // pastel teal
  },
  manpower: {
    bg: "#d1b3e6", // pastel purple
  },
  training: {
    bg: "#b7e6c7", // pastel green
  },
};

const KPI_ICON_COLORS = {
  manhours: "#17808a", // deep teal for pastel teal
  manpower: "#7c3aad", // deep purple for pastel purple
  training: "#228b4e", // deep green for pastel green
};

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
            api.get("hr/overview_safety_manpower"),
            api.get("hr/overview_safety_manhours"),
            api.get("hr/overview_training"),
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

  const MetricCard = ({ title, value, unit, bg }) => (
    <Paper
      elevation={0}
      sx={{
        backgroundColor: bg,
        borderRadius: 3,
        p: 2,
        textAlign: "center",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          height: "100%",
          justifyContent: "center",
          gap: "0.8",
        }}
      >
        {title === "Safety Manhours" && (
          <EngineeringIcon
            sx={{ fontSize: 36, color: KPI_ICON_COLORS.manhours }}
          />
        )}
        {title === "Safety Manpower" && (
          <GroupsIcon sx={{ fontSize: 36, color: KPI_ICON_COLORS.manpower }} />
        )}
        {title === "Training Hours" && (
          <PsychologyIcon
            sx={{ fontSize: 36, color: KPI_ICON_COLORS.training }}
          />
        )}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              fontSize: "clamp(1rem, 3vw, 1.5rem)",
              fontWeight: 900,
              marginBottom: 2,
              textAlign: "center",
              color: "#182959",
              letterSpacing: 0.5,
              lineHeight: 1.1,
            }}
          >
            {loading ? "######" : formatNumber(value)}
          </div>
          <div
            style={{
              fontSize: "clamp(0.6rem, 1.5vw, 1rem)",
              fontWeight: 700,
              color: "#222",
              textAlign: "center",
              lineHeight: 1.2,
              letterSpacing: 0.2,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {title}
          </div>
        </div>
      </Box>
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
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" },
          gap: { xs: 1, sm: 2 },
          height: "100%",
        }}
      >
        <MetricCard
          title="Safety Manhours"
          value={totalSafetyManhours}
          bg={KPI_STYLES.manhours.bg}
        />
        <MetricCard
          title="Safety Manpower"
          value={totalSafetyPower}
          bg={KPI_STYLES.manpower.bg}
        />
        <MetricCard
          title="Training Hours"
          value={totalTrainingHours}
          bg={KPI_STYLES.training.bg}
        />
      </Box>
    </Box>
  );
};

export default HROverview;
