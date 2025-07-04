import React from "react";
import { Box, Paper, Typography, Grid } from "@mui/material";

function StatWidget({ label, value, color }) {
  return (
    <Paper elevation={2} sx={{ p: 2, minWidth: 180, textAlign: "center", borderRadius: 2, bgcolor: color || "#fff" }}>
      <Typography variant="h5" fontWeight={700} color="primary.main">
        {value}
      </Typography>
      <Typography variant="body1" color="textSecondary">
        {label}
      </Typography>
    </Paper>
  );
}

export default function UserStatsWidgets({ stats }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={2} justifyContent="flex-start">
        <Grid item>
          <StatWidget label="Active Users" value={stats.activeUsers} color="#e3fcec" />
        </Grid>
        <Grid item>
          <StatWidget label="Deactivated Users" value={stats.deactivatedUsers} color="#ffeaea" />
        </Grid>
        <Grid item>
          <StatWidget label="Total Users" value={stats.totalUsers} color="#eaf4ff" />
        </Grid>
        <Grid item>
          <StatWidget label="Admins" value={stats.admins} color="#f3eaff" />
        </Grid>
        {/* Add more widgets as needed */}
      </Grid>
    </Box>
  );
}
