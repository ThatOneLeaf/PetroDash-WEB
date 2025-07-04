import React, { useEffect, useState, useMemo } from "react";
import {
  Typography,
  CircularProgress,
  Box,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import api from "../services/api";

import RepositoryHeader from "../components/RepositoryHeader";
import SideBar from "../components/Sidebar";
// import api from "../../services/api";
import UserStatsWidgets from "../pages/AdminDashboard/UserStatsWidgets";

function KPIWidget({ label, value, color }) {
  return (
    <Paper elevation={2} sx={{
      minWidth: 120,
      minHeight: 80,
      p: 2,
      textAlign: 'center',
      bgcolor: color || '#fff',
      borderRadius: 2,
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <Typography variant="h5" fontWeight={700} color="primary.main">
        {value}
      </Typography>
      <Typography variant="body2" color="textSecondary">
        {label}
      </Typography>
    </Paper>
  );
}

function AdminLanding() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [searchTerm, setSearchTerm] = useState("");
  const [userStats, setUserStats] = useState({
    activeUsers: 0,
    deactivatedUsers: 0,
    totalUsers: 0,
    admins: 0,
  });

  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));

  // Fetch audit trail data for the table
  const fetchAuditTrail = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/reference/audit-trail");
      let arr = res.data;
      if (!Array.isArray(arr)) {
        if (arr && typeof arr === "object" && Array.isArray(arr.results)) {
          arr = arr.results;
        } else {
          arr = [];
        }
      }
      setData(arr);
    } catch (err) {
      setError("Failed to fetch audit trail data.");
    }
    setLoading(false);
  };

  // Dummy data for user stats
  useEffect(() => {
    fetchAuditTrail();
    setUserStats({
      activeUsers: 42,
      deactivatedUsers: 7,
      totalUsers: 49,
      admins: 3,
    });
  }, []);

  // Table columns for audit trail
  const columns = [
    { key: "audit_timestamp", label: "Timestamp" },
    { key: "record_id", label: "Record ID" },
    { key: "description", label: "Description" },
  ];

  // Render table rows
  const renderRows = () => {
    if (loading) {
      return (
        <TableRow>
          <TableCell colSpan={columns.length} align="center">
            Loading...
          </TableCell>
        </TableRow>
      );
    }
    if (error) {
      return (
        <TableRow>
          <TableCell colSpan={columns.length} align="center" style={{ color: 'red' }}>
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
    // Sort by timestamp descending (recent first)
    const sorted = [...data].sort((a, b) => {
      const ta = new Date(a.audit_timestamp).getTime();
      const tb = new Date(b.audit_timestamp).getTime();
      return tb - ta;
    });
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

  return (
    <Box sx={{ display: "flex", height: "100dvh", overflow: "hidden" }}>
      {/* Sidebar */}
      <Box
        sx={{
          width: "auto",
          flexShrink: 0,
          borderRight: "1px solid #e0e0e0",
          bgcolor: "background.paper",
        }}
      >
        <SideBar />
      </Box>

      {/* Main content */}
      <Box
        sx={{
          padding: 2,
          flex: 1,
          overflow: "hidden",
          bgcolor: "background.default",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box sx={{ padding: 0 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            sx={{ padding: "8px 16px", gap: 8 }}
          >
            <RepositoryHeader label="ADMIN" title="Dashboard" />
          </Box>
          {/* 1st row: widgets */}
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', mb: 3, flexWrap: 'wrap', gap: 3 }}>
            {/* Big Active Users Square */}
            <Paper elevation={4} sx={{
              minWidth: 120,
              minHeight: 120,
              maxWidth: 180,
              maxHeight: 180,
              width: { xs: '36vw', sm: '16vw' },
              height: { xs: '36vw', sm: '16vw' },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: '#e3fcec',
              borderRadius: 4,
              boxShadow: 6,
              flexShrink: 0,
            }}>
              <Typography variant="h2" color="primary" fontWeight={700} sx={{ fontSize: { xs: 32, sm: 40, md: 56 } }}>
                {userStats.activeUsers}
              </Typography>
              <Typography variant="h6" color="textSecondary" fontWeight={500}>
                Active Users
              </Typography>
            </Paper>
            {/* KPIs beside the square */}
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 2, flex: 1, minWidth: 220 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <KPIWidget label="Deactivated Users" value={userStats.deactivatedUsers} color="#ffeaea" />
                <KPIWidget label="Admins" value={userStats.admins} color="#f3eaff" />
                <KPIWidget label="Executives" value={userStats.executives ?? 0} color="#eaf4ff" />
              </Box>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <KPIWidget label="HO Checkers" value={userStats.hoCheckers ?? 0} color="#e3fcec" />
                <KPIWidget label="Site Checkers" value={userStats.siteCheckers ?? 0} color="#fffbe6" />
                <KPIWidget label="Encoders" value={userStats.encoders ?? 0} color="#e6f7ff" />
              </Box>
            </Box>
          </Box>
        </Box>
        {/* 2nd row: audit trail table always at the bottom */}
        <Box sx={{ mt: 2, flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
          <TableContainer
            component={Paper}
            sx={{
              maxHeight: isSmall ? 56 * 2.5 + 56 : 56 * 4 + 56,
              overflowY: 'auto',
            }}
          >
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  {columns.map((col) => (
                    <TableCell key={col.key}>{col.label}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {renderRows()}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </Box>
  );
}

export default AdminLanding;
