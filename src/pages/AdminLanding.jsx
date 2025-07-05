import React, { useEffect, useState } from "react";
import {
  Typography,
  CircularProgress,
  Box,
  Paper,
  Grid,
  useTheme,
  useMediaQuery,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
} from "@mui/material";
import {
  CheckCircle,
  Assessment,
  Warning,
  Group,
  Settings,
  ExitToApp,
  Person,
} from "@mui/icons-material";

import api from "../services/api";
import RepositoryHeader from "../components/RepositoryHeader";
import SideBar from "../components/Sidebar";

function KPIWidget({ label, value, color }) {
  return (
    <Paper
      elevation={2}
      sx={{
        width: "100%",         // fill full width of parent Grid item
        height: "100%",        // fill full height of parent Box/Grid
        minHeight: 120,        // increase if you want more vertical space
        p: 2,
        textAlign: "center",
        bgcolor: color || "#fff",
        borderRadius: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Typography variant="h5" fontWeight={700} color="primary.main">
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
    </Paper>
  );
}

function AdminLanding() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    admins: 0,
    executives: 0,
    hoCheckers: 0,
    siteCheckers: 0,
    encoders: 0,
    activeUsers: 0,
    deactivatedUsers: 0,    
  });
  const [systemStatus, setSystemStatus] = useState({
    api: "-",
    server: "-",
    database: "-",
    apiResponseTimeMs: "-",
    serverUptime: "-"
  });
  const [activityLog, setActivityLog] = useState([]);

  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));

  // Helper to format time as 'x minutes ago', 'now', etc.
  function timeAgo(dateString) {
    if (!dateString) return '';
    const now = new Date();
    const date = new Date(dateString);
    const diff = Math.floor((now - date) / 1000); // seconds
    if (diff < 5) return 'now';
    if (diff < 60) return `${diff} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    const days = Math.floor(diff / 86400);
    if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
    return date.toLocaleString();
  }

  const fetchAuditTrail = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/reference/audit-trail");
      let arr = res.data;
      if (!Array.isArray(arr)) {
        arr = Array.isArray(arr.results) ? arr.results : [];
      }
      setData(arr);
      // Map audit trail to activity log (show latest 3)
      const mapped = arr
        .sort((a, b) => new Date(b.audit_timestamp) - new Date(a.audit_timestamp))
        .slice(0, 3)
        .map(row => ({
          user: row.email || 'Unknown',
          action: row.description || row.action_type || 'did something',
          time: row.audit_timestamp ? timeAgo(row.audit_timestamp) : '',
        }));
      setActivityLog(mapped);
    } catch (err) {
      setError("Failed to fetch audit trail data.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAuditTrail();
    // Fetch KPI data
    api.get("/reference/kpi-data")
      .then(res => {
        if (res.data) setUserStats(res.data);
      })
      .catch(() => {});
    // Fetch System Health
    api.get("/reference/system-health")
      .then(res => {
        if (res.data) setSystemStatus(res.data);
      })
      .catch(() => {});
  }, []);

  const columns = [
    { key: "audit_timestamp", label: "Timestamp" },
    { key: "record_id", label: "Record ID" },
    { key: "description", label: "Description" },
  ];

  const renderRows = () => {
    if (loading) {
      return (
        <TableRow>
          <TableCell colSpan={columns.length} align="center">
            <CircularProgress />
          </TableCell>
        </TableRow>
      );
    }
    if (error) {
      return (
        <TableRow>
          <TableCell colSpan={columns.length} align="center" style={{ color: "red" }}>
            {error}
          </TableCell>
        </TableRow>
      );
    }
    if (!data.length) {
      return (
        <TableRow>
          <TableCell colSpan={columns.length} align="center">
            No records found.
          </TableCell>
        </TableRow>
      );
    }
    const sorted = [...data].sort((a, b) => new Date(b.audit_timestamp) - new Date(a.audit_timestamp));
    return sorted.map((row, idx) => (
      <TableRow key={idx}>
        {columns.map((col) => (
          <TableCell key={col.key}>
            {col.key === "audit_timestamp"
              ? row[col.key]
                ? new Date(row[col.key]).toLocaleString()
                : ""
              : row[col.key] ?? ""}
          </TableCell>
        ))}
      </TableRow>
    ));
  };

  const kpiLabels = {
  totalUsers: "Total Users",
  admins: "Admins",
  executives: "Executives",
  hoCheckers: "HO Checkers",
  siteCheckers: "Site Checkers",
  encoders: "Encoders",
  activeUsers: "Active Users",
  deactivatedUsers: "Deactivated Users",
};

return (
  <Box sx={{ display: "flex", width: "100%" }}>
    <SideBar />
    <Box
      sx={{
        flex: 1,
        minWidth: 0,
        overflow: "auto",
        bgcolor: "background.default",
        display: "flex",
        flexDirection: "column",
        p: 2,
        width: "100%",
      }}
    >
      <RepositoryHeader label="ADMIN" title="Dashboard" />

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {/* Row 1: Welcome */}
        <Box>
          <Typography variant="h5" fontWeight={700} color="primary.main">
            Welcome, Admin!
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Quick overview of your system. Use the shortcuts to manage users and review logs.
          </Typography>
        </Box>

        {/* Row 2: KPI + System Health */}
<Box
  sx={{
    display: "flex",
    flexDirection: isSmall ? "column" : "row",
    gap: 2,
    alignItems: "stretch",
    width: "100%",
    height: "100%", // Fill parent
  }}
>
 {/* KPI Section */}
<Box sx={{ flex: 2, minWidth: 300, display: "flex", flexDirection: "column" }}>
  <Paper sx={{ p: 2, borderRadius: 2, flex: 1 }}>
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 2,
        width: "100%",
      }}
    >
      {Object.entries(userStats).map(([key, val]) => (
        <Box
          key={key}
          sx={{
            flex: "1 1 250px", // grow, shrink, and base width
            minWidth: "200px",
            maxWidth: "100%",
            height: "100%",
          }}
        >
          <KPIWidget
            label={kpiLabels[key] || key}
            value={val}
            color="#f5f5f5"
          />
        </Box>
      ))}
    </Box>
  </Paper>
</Box>

  {/* System Health */}
  <Box sx={{ flex: 1, minWidth: 280, display: "flex", flexDirection: "column" }}>
    <Paper sx={{ p: 2, borderRadius: 2, flex: 1 }}>
      <Typography variant="h6" fontWeight={600} gutterBottom>
        System Health
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <CheckCircle color="success" />
          <Typography variant="body1">
            API: <b style={{ color: "#388e3c" }}>{systemStatus.api}</b>
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <CheckCircle color="success" />
          <Typography variant="body1">
            Server: <b style={{ color: "#388e3c" }}>{systemStatus.server}</b>
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <CheckCircle color={systemStatus.database === "Online" ? "success" : "error"} />
          <Typography variant="body1">
            Database: <b style={{ color: systemStatus.database === "Online" ? "#388e3c" : "#d32f2f" }}>{systemStatus.database}</b>
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Assessment color="primary" />
          <Typography variant="body1">
            API Response Time: <b>{systemStatus.apiResponseTimeMs} ms</b>
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Assessment color="primary" />
          <Typography variant="body1">
            Server Uptime: <b>{systemStatus.serverUptime}</b>
          </Typography>
        </Box>
      </Box>
    </Paper>
  </Box>
</Box>

        {/* Row 3: Recent Activity + Quick Links */}
        <Box
          sx={{
            display: "flex",
            flexDirection: isSmall ? "column" : "row",
            gap: 2,
            width: "100%",
            alignItems: "stretch",
          }}
        >
          {/* Recent Activity */}
          <Box sx={{ flex: 2, minWidth: 300 }}>
            <Paper sx={{ p: 2, borderRadius: 2, height: "100%" }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Recent Activity
              </Typography>
              <List>
                {activityLog.map((item, idx) => (
                  <ListItem key={idx}>
                    <ListItemIcon>
                      <Avatar
                        sx={{
                          width: 28,
                          height: 28,
                          bgcolor: "#e3fcec",
                          color: "primary.main",
                          fontSize: 16,
                        }}
                      >
                        <Person />
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText
                      primary={<span><b>{item.user}</b> {item.action}</span>}
                      secondary={item.time}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Box>

          {/* Quick Links */}
          <Box sx={{ flex: 1, minWidth: 280 }}>
            <Paper elevation={2} sx={{ p: 2, borderRadius: 2, height: "100%" }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Quick Links
              </Typography>
              <List>
                <ListItem button component="a" href="/user-management">
                  <ListItemIcon><Group color="primary" /></ListItemIcon>
                  <ListItemText primary="User Management" />
                </ListItem>
                <ListItem button component="a" href="/audit-trail">
                  <ListItemIcon><Assessment color="primary" /></ListItemIcon>
                  <ListItemText primary="Audit Trail" />
                </ListItem>
                <ListItem button component="a" href="#/settings">
                  <ListItemIcon><Settings color="primary" /></ListItemIcon>
                  <ListItemText primary="Settings" />
                </ListItem>
                <ListItem button component="a" href="#/logout">
                  <ListItemIcon><ExitToApp color="primary" /></ListItemIcon>
                  <ListItemText primary="Logout" />
                </ListItem>
              </List>
            </Paper>
          </Box>
        </Box>
      </Box>
    </Box>
  </Box>
);

}

export default AdminLanding;
