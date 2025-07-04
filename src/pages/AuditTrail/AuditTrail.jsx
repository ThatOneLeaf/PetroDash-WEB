import React, { useEffect, useState, useMemo } from "react";
import {
  Typography,
  CircularProgress,
  Box,
  IconButton,
} from "@mui/material";
import Search from "../../components/Filter/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import dayjs from "dayjs";

import AuditTrailTable from "../../components/CustomTable/CustomTable";
import RepositoryHeader from "../../components/RepositoryHeader";
import SideBar from "../../components/Sidebar";
import api from "../../services/api";

function AuditTrail() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [searchTerm, setSearchTerm] = useState("");

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
      setError("Failed to fetch audit trail.");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAuditTrail();
  }, []);

  const columns = [
    {
      key: "audit_timestamp",
      label: "Timestamp",
      render: (val) => {
        if (!val) return "";
        const d = dayjs(val);
        if (!d.isValid()) return val;
        // Example: July 3, 2025, 2:30 PM
        return d.format("MMMM D, YYYY, h:mm A");
      },
    },
    { key: "email", label: "User Email" },
    { key: "target_table", label: "Table" },
    { key: "record_id", label: "Record ID" },
    { key: "action_type", label: "Action" },
    { key: "old_value", label: "Old Value" },
    { key: "new_value", label: "New Value" },
    { key: "description", label: "Description" },
  ];

  const filteredData = useMemo(() => {
    const arr = Array.isArray(data) ? data : [];
    // First sort by timestamp in descending order
    const sortedArr = [...arr].sort((a, b) => {
      const dateA = dayjs(a.audit_timestamp);
      const dateB = dayjs(b.audit_timestamp);
      return dateB.valueOf() - dateA.valueOf(); // Descending order (newest first)
    });
    
    if (!searchTerm) return sortedArr;
    const lower = searchTerm.toLowerCase();
    return sortedArr.filter((row) =>
      columns.some((col) => {
        if (col.key === "audit_timestamp") {
          // Search both raw and formatted date
          const raw = String(row[col.key] ?? "").toLowerCase();
          const formatted = row[col.key]
            ? dayjs(row[col.key]).isValid()
              ? dayjs(row[col.key]).format("MMMM D, YYYY, h:mm A").toLowerCase()
              : ""
            : "";
          // Also allow searching by just date part (e.g. July 3, 2024)
          const formattedShort = row[col.key]
            ? dayjs(row[col.key]).isValid()
              ? dayjs(row[col.key]).format("MMMM D, YYYY").toLowerCase()
              : ""
            : "";
          return (
            raw.includes(lower) ||
            formatted.includes(lower) ||
            formattedShort.includes(lower)
          );
        }
        return String(row[col.key] ?? "").toLowerCase().includes(lower);
      })
    );
  }, [data, searchTerm]);

  const paginatedData = Array.isArray(filteredData)
    ? filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : [];

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
      <Box sx={{ padding: 2, flex: 1, overflow: "hidden", bgcolor: "background.default" }}>
        {loading ? (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              p: 4,
            }}
          >
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              p: 4,
            }}
          >
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
            <IconButton onClick={fetchAuditTrail}>
              <RefreshIcon />
            </IconButton>
          </Box>
        ) : (
          <Box sx={{ padding: 0 }}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              sx={{ padding: "8px 16px", gap: 8 }}
            >
              <RepositoryHeader label="REPOSITORY" title="Audit Trail" />
              <Search
                value={searchTerm}
                onSearch={(val) => {
                  setSearchTerm(val);
                  setPage(0);
                }}
                suggestions={[
                  ...new Set([
                    ...data.map((row) => row.email).filter(Boolean),
                    ...data.map((row) => row.target_table).filter(Boolean),
                    ...data.map((row) => String(row.record_id)).filter(Boolean),
                    ...data.map((row) => row.action_type).filter(Boolean),
                    ...data.map((row) => row.description).filter(Boolean),
                  ]),
                ]}
                placeholder="Search audit trail..."
              />
            </Box>

            <AuditTrailTable
              columns={columns}
              rows={paginatedData}
              emptyMessage="No audit trail records found."
              maxHeight="calc(100vh - 140px)"
            />

            <Box display="flex" justifyContent="space-between" px={2} mt={1}>
              <Typography variant="body2" color="textSecondary">
                Showing {filteredData.length}{" "}
                {filteredData.length === 1 ? "record" : "records"}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}

export default AuditTrail;
