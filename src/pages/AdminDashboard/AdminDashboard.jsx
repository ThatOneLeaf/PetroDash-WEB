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
} from "@mui/material";
import Search from "../../components/Filter/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import dayjs from "dayjs";

import RepositoryHeader from "../../components/RepositoryHeader";
import SideBar from "../../components/Sidebar";
// import api from "../../services/api";
import UserStatsWidgets from "./UserStatsWidgets";

function AdminDashboard() {
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

  const fetchAdminData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Replace with your admin dashboard API endpoint
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
      setError("Failed to fetch admin dashboard data.");
    }
    setLoading(false);
  };

  // const fetchUserStats = async () => {
  //   try {
  //     // Replace with your actual API endpoints for user stats
  //     const res = await api.get("/reference/user-stats");
  //     setUserStats({
  //       activeUsers: res.data.activeUsers ?? 0,
  //       deactivatedUsers: res.data.deactivatedUsers ?? 0,
  //       totalUsers: res.data.totalUsers ?? 0,
  //       admins: res.data.admins ?? 0,
  //     });
  //   } catch {
  //     // fallback: keep zeros
  //   }
  // };

  // Dummy data for user stats
  useEffect(() => {
    fetchAdminData();
    setUserStats({
      activeUsers: 42,
      deactivatedUsers: 7,
      totalUsers: 49,
      admins: 3,
    });
  }, []);

  // Dummy data for the simple table
  const simpleTableData = [
    {
      name: "John Doe",
      email: "john@example.com",
      role: "Admin",
      status: "Active",
    },
    {
      name: "Jane Smith",
      email: "jane@example.com",
      role: "User",
      status: "Deactivated",
    },
    {
      name: "Alice Brown",
      email: "alice@example.com",
      role: "User",
      status: "Active",
    },
    {
      name: "Bob White",
      email: "bob@example.com",
      role: "Admin",
      status: "Active",
    },
  ];

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
        }}
      >
        <Box sx={{ padding: 0 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            sx={{ padding: "8px 16px", gap: 8 }}
          >
            <RepositoryHeader label="ADMIN DASHBOARD" title="Admin Dashboard" />
          </Box>
          {/* 1st row: widgets */}
          <UserStatsWidgets stats={userStats} />
          {/* 2nd row: simple table */}
          <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {simpleTableData.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>{row.role}</TableCell>
                    <TableCell>{row.status}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </Box>
  );
}

export default AdminDashboard;
