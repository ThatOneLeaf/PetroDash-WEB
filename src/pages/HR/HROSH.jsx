import { useState, useEffect, useMemo } from "react";
import { Button, IconButton, Box, Typography } from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";

import LaunchIcon from "@mui/icons-material/Launch";
import ClearIcon from "@mui/icons-material/Clear";

import api from "../../services/api";

import { useFilteredData } from "../../components/hr_components/filtering"; //change when moved

import Pagination from "../../components/Pagination/pagination";
import Table from "../../components/Table/Table";
import Filter from "../../components/Filter/Filter";
import Search from "../../components/Filter/Search";
import Overlay from "../../components/modal";
import StatusChip from "../../components/StatusChip";

import { useAuth } from "../../contexts/AuthContext";

import dayjs from "dayjs";

import ViewUpdateOSHModal from "../../components/hr_components/ViewUpdateOSHModal";

import CustomTable from "../../components/Table/Table";

function OSH({
  onFilterChange,
  shouldReload,
  setShouldReload,
  onSelectedRowIdsChange,
  setFilteredData,
  parentSelectedRowIds,
}) {
  //INITIALIZE

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedRecord, setSelectedRecord] = useState(null); // Old Data

  const [selectedRowIds, setSelectedRowIds] = useState([]);

  const { user } = useAuth();

  const isEncoder =
    Array.isArray(user?.roles) &&
    user.roles.some((role) => ["R05"].includes(role));

  const companyId = isEncoder ? user?.company_id : null;

  // DATA -- CHANGE PER PAGE
  const fetchOSHData = async () => {
    try {
      setLoading(true);

      const params = companyId ? { company_id: companyId } : {};
      const response = await api.get(
        "hr/occupational_safety_health_records_by_status",
        { params }
      );
      console.log("OSH Data from API:", response.data);
      setData(response.data);
    } catch (error) {
      console.error("Error fetching OSH data:", error);
      setError("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("User inside useEffect:", user);
    if (user) {
      fetchOSHData();
    }
  }, [user]);

  useEffect(() => {
    if (shouldReload) {
      fetchOSHData();
      setShouldReload(false);
    }
  }, [shouldReload]);

  //TABLE -- CHANGE PER PAGE

  const columns = [
    { key: "company_name", label: "Company" },
    { key: "workforce_type", label: "Workforce Type" },
    {
      key: "lost_time",
      label: "Lost Time",
      render: (val) => (val ? "Yes" : "No"),
    },
    {
      key: "date",
      label: "Date",
      render: (val) => (val ? dayjs(val).format("MMMM YYYY") : "N/A"),
    },
    { key: "incident_type", label: "Incident Type" },
    { key: "incident_title", label: "Incident Title" },
    { key: "incident_count", label: "Incident Count" },
    {
      key: "status_id",
      label: "Status",
      render: (val) => <StatusChip status={val} />,
    },
  ];

  const renderActions = (row) => (
    <IconButton
      size="small"
      onClick={(event) => {
        event.stopPropagation();
        setSelectedRecord(row);
      }}
    >
      <LaunchIcon />
    </IconButton>
  );

  //FILTERS -- ITEMS --CHANGE PER PAGE
  const companyOptions = Array.from(
    new Set(data.map((item) => item.company_name))
  ).map((val) => ({ label: val, value: val }));

  const workforceTypeOptions = Array.from(
    new Set(data.map((item) => item.workforce_type))
  ).map((val) => ({ label: val, value: val }));

  const lostTimeOptions = [
    { label: "Yes", value: true },
    { label: "No", value: false },
  ];

  const incidentTypeOptions = Array.from(
    new Set(data.map((item) => item.incident_type))
  ).map((val) => ({ label: val, value: val }));

  const incidentTitleOptions = Array.from(
    new Set(data.map((item) => item.incident_title))
  ).map((val) => ({ label: val, value: val }));

  //STATUS DONT CHANGE
  const statusOptions = [
    { label: "Under Review (Head)", value: "URH" },
    { label: "Approved", value: "APP" },
    { label: "For Revision (Head)", value: "FRH" },
  ];

  const [filters, setFilters] = useState({
    company_name: "",
    workforce_type: "",
    lost_time: "",
    incident_type: "",
    incident_title: "",
    status_id: "",
  });

  const isFiltering = useMemo(() => {
    return Object.values(filters).some((v) => v !== null && v !== "");
  }, [filters]);

  //FILTERS --DONT CHANGE

  const filteredData = useFilteredData(data, filters, searchQuery);

  useEffect(() => {
    if (typeof onFilterChange === "function") {
      onFilterChange(filteredData);
    }

    if (typeof setFilteredData === "function") {
      setFilteredData(filteredData);
    }
  }, [filteredData]);

  const handleRowSelect = (newIds) => {
    setSelectedRowIds(newIds);
    if (typeof onSelectedRowIdsChange === "function") {
      onSelectedRowIdsChange(newIds);
    }
  };

  useEffect(() => {
    setSelectedRowIds(parentSelectedRowIds || []);
  }, [parentSelectedRowIds]);

  //SEARCH
  const suggestions = useMemo(() => {
    const uniqueValues = new Set();
    filteredData.forEach((item) => {
      Object.values(item).forEach((val) => {
        if (val) uniqueValues.add(val.toString());
      });
    });
    return Array.from(uniqueValues);
  }, [filteredData]);

  //PAGINATION -- DONT CHANGE

  const rowsPerPage = 10;

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const paginatedData = filteredData.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  if (loading)
    return (
      <Box
        sx={{
          display: "flex",
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          bgcolor: "#f5f7fa",
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <CircularProgress size={64} thickness={5} sx={{ color: "#182959" }} />
          <Typography
            sx={{
              mt: 2,
              color: "#182959",
              fontWeight: 700,
              fontSize: 20,
            }}
          >
            Loading OSH Data...
          </Typography>
        </Box>
      </Box>
    );
  if (error)
    return (
      <Box sx={{ display: "flex" }}>
        <div>{error}</div>
      </Box>
    );

  return (
    <Box sx={{ display: "flex" }}>
      <Box sx={{ flexGrow: 1, height: "100%", overflow: "auto" }}>
        {/* 

          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>
            {buttonRoutes.map(({ label, value, path }) => (
              <Button
                key={value}
                variant={selectedButton === value ? "contained" : "outlined"}
                onClick={() => {
                  setSelectedButton(value);
                  navigate(path);
                }}
                style={{
                  backgroundColor: selectedButton === value ? "#182959" : "",
                  color: selectedButton === value ? "white" : "#182959",
                  borderColor: "#182959",
                }}
              >
                {label}
              </Button>
            ))}
          </Box>*/}

        {/* Filters */}
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>
          <Search onSearch={setSearchQuery} suggestions={suggestions} />
          <Filter
            label="Company"
            options={[{ label: "All Companies", value: "" }, ...companyOptions]}
            value={filters.company_name}
            onChange={(val) => {
              setFilters((prev) => ({ ...prev, company_name: val }));
              setPage(1);
            }}
            placeholder="Company"
          />

          <Filter
            label="Workforce Type"
            options={[
              { label: "All Workforce Type", value: "" },
              ...workforceTypeOptions,
            ]}
            value={filters.workforce_type}
            onChange={(val) => {
              setFilters((prev) => ({ ...prev, workforce_type: val }));
              setPage(1);
            }}
            placeholder="Workforce Type"
          />

          <Filter
            label="Lost Time"
            options={[
              { label: "All Lost Time", value: "" },
              ...lostTimeOptions,
            ]}
            value={filters.lost_time}
            onChange={(val) => {
              setFilters((prev) => ({ ...prev, lost_time: val }));
              setPage(1);
            }}
            placeholder="Lost Time"
          />

          <Filter
            label="Incident Type"
            options={[
              { label: "All Incident Type", value: "" },
              ...incidentTypeOptions,
            ]}
            value={filters.incident_type}
            onChange={(val) => {
              setFilters((prev) => ({ ...prev, incident_type: val }));
              setPage(1);
            }}
            placeholder="Incident Type"
          />

          <Filter
            label="Incident Title"
            options={[
              { label: "All Incident Title", value: "" },
              ...incidentTitleOptions,
            ]}
            value={filters.incident_title}
            onChange={(val) => {
              setFilters((prev) => ({ ...prev, incident_title: val }));
              setPage(1);
            }}
            placeholder="Incident Title"
          />

          <Filter
            label="Status"
            options={[{ label: "All Status", value: "" }, ...statusOptions]}
            value={filters.status_id}
            onChange={(val) => {
              setFilters((prev) => ({ ...prev, status_id: val }));
              setPage(1);
            }}
            placeholder="Status"
          />

          {isFiltering && (
            <Button
              variant="outline"
              startIcon={<ClearIcon />}
              sx={{
                color: "#182959",
                borderRadius: "999px",
                padding: "9px 18px",
                fontSize: "0.85rem",
                fontWeight: "bold",
              }}
              onClick={() => {
                setFilters({
                  company_name: "",
                  workforce_type: "",
                  lost_time: "",
                  incident_type: "",
                  incident_title: "",
                  status_id: "",
                });
                setPage(1);
              }}
            >
              Clear Filters
            </Button>
          )}
        </Box>

        {/* Table or fallback */}

        <CustomTable
          columns={columns}
          rows={paginatedData}
          filteredData={filteredData}
          idKey={"osh_id"} // or "id", "recordId", etc. depending on the page
          onSelectionChange={(selectedRows) => {
            handleRowSelect(selectedRows);
          }}
          emptyMessage="No osh data found."
          maxHeight="60vh"
          minHeight="300px"
          actions={renderActions}
        />

        {/* Pagination */}

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "1rem",
          }}
        >
          {/* Row Count Display */}

          <Box>
            <Typography sx={{ fontSize: "0.85rem" }}>
              Total {filteredData.length}{" "}
              {filteredData.length === 1 ? "record" : "records"}
            </Typography>
            {selectedRowIds.length > 0 && (
              <Typography
                sx={{ fontSize: "0.85rem", color: "#2B8C37", fontWeight: 700 }}
              >
                {selectedRowIds.length} selected record
                {selectedRowIds.length > 1 ? "s" : ""}
              </Typography>
            )}
          </Box>

          <Pagination
            page={page}
            count={Math.ceil(filteredData.length / rowsPerPage)}
            onChange={handlePageChange}
          />
          <Typography sx={{ fontSize: "0.85rem" }}>
            Showing{" "}
            {Math.min((page - 1) * rowsPerPage + 1, filteredData.length)}–
            {Math.min(page * rowsPerPage, filteredData.length)} records
          </Typography>
        </Box>

        {selectedRecord != null &&
          (console.log("Selected Record:", selectedRecord),
          (
            <Overlay onClose={() => setSelectedRecord(null)}>
              <ViewUpdateOSHModal
                title={"HR Occupational Safety Health Details"}
                record={selectedRecord}
                onSuccess={() => {
                  setShouldReload(true);
                  setSelectedRecord(null);
                }}
                onClose={() => setSelectedRecord(null)}
              />
            </Overlay>
          ))}
      </Box>
    </Box>
  );
}

export default OSH;
