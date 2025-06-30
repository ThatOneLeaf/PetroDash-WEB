import { useState, useEffect, useMemo } from "react";
import {
  Button,
  Box,
  IconButton,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";

import LaunchIcon from "@mui/icons-material/Launch";
import ClearIcon from "@mui/icons-material/Clear";
import api from "../../services/api";

import { useFilteredData } from "../../components/hr_components/filtering";

import Table from "../../components/Table/Table";
import Filter from "../../components/Filter/Filter";
import Search from "../../components/Filter/Search";
import Pagination from "../../components/Pagination/pagination";
import Overlay from "../../components/modal";
import StatusChip from "../../components/StatusChip";

import dayjs from "dayjs";

import ViewUpdateEmployeeModal from "../../components/hr_components/ViewUpdateEmployeeModal";

import CustomTable from "../../components/Table/Table";

function Demographics({
  onFilterChange,
  shouldReload,
  setShouldReload,
  onSelectedRowIdsChange,
  setFilteredData,
  parentSelectedRowIds,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isTablet = useMediaQuery(theme.breakpoints.down("lg"));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  //INITIALIZE
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedRecord, setSelectedRecord] = useState(null); // Old Data

  const [selectedRowIds, setSelectedRowIds] = useState([]);

  // DATA -- CHANGE PER PAGE
  const fetchEmployabilityData = async () => {
    try {
      setLoading(true);
      const response = await api.get("hr/employability_records_by_status");
      console.log("Employability Data from API:", response.data);
      setData(response.data);
    } catch (error) {
      console.error("Error fetching Employability data:", error);
      setError("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployabilityData();
  }, []);

  useEffect(() => {
    if (shouldReload) {
      fetchEmployabilityData();
      setShouldReload(false);
    }
  }, [shouldReload]);

  //TABLE -- CHANGE PER PAGE

  const columns = [
    { key: "company_name", label: "Company ID" },
    { key: "employee_id", label: "Employee ID" },
    {
      key: "gender",
      label: "Gender",
      render: (val) =>
        val?.toLowerCase() === "m"
          ? "Male"
          : val?.toLowerCase() === "f"
          ? "Female"
          : val,
    },
    {
      key: "birthdate",
      label: "Birthdate",
      render: (val) => (val ? dayjs(val).format("MM/DD/YYYY") : "N/A"),
    },
    {
      key: "position_id",
      label: "Position",
      render: (val) =>
        val?.toLowerCase() === "rf"
          ? "Rank-and-File"
          : val?.toLowerCase() === "mm"
          ? "Middle Management"
          : val?.toLowerCase() === "sm"
          ? "Senior Management"
          : val,
    },

    {
      key: "p_np",
      label: "Employee Category",
      render: (val) =>
        val?.toLowerCase() === "p"
          ? "Professional"
          : val?.toLowerCase() === "np"
          ? "Non-Professional"
          : val,
    },
    { key: "employment_status", label: "Employee Status" },

    {
      key: "start_date",
      label: "Start Date",
      render: (val) => (val ? dayjs(val).format("MM/DD/YYYY") : "N/A"),
    },
    {
      key: "end_date",
      label: "End Date",
      render: (val) => (val ? dayjs(val).format("MM/DD/YYYY") : "N/A"),
    },
    {
      key: "status_id",
      label: "Status",
      render: (val) => <StatusChip status={val} />,
    },
  ];

  const renderActions = (row) => (
    <IconButton size="small" onClick={() => setSelectedRecord(row)}>
      <LaunchIcon />
    </IconButton>
  );

  //FILTERS -- ITEMS --CHANGE PER PAGE
  const companyOptions = Array.from(
    new Set(data.map((item) => item.company_name))
  ).map((val) => ({ label: val, value: val }));

  const genderOptions = Array.from(
    new Set(data.map((item) => item.gender?.trim().toLowerCase()))
  ).map((val) => ({
    label: val === "m" ? "Male" : val === "f" ? "Female" : val,
    value: val,
  }));

  const positionOptions = Array.from(
    new Set(data.map((item) => item.position_id?.trim().toLowerCase()))
  ).map((val) => ({
    label:
      val?.toLowerCase() === "rf"
        ? "Rank-and-File"
        : val?.toLowerCase() === "mm"
        ? "Middle Management"
        : val?.toLowerCase() === "sm"
        ? "Senior Management"
        : val,
    value: val,
  }));
  const employementCategoryOptions = Array.from(
    new Set(data.map((item) => item.p_np?.trim().toLowerCase()))
  ).map((val) => ({
    label:
      val?.toLowerCase() === "p"
        ? "Professional"
        : val?.toLowerCase() === "np"
        ? "Non-Professional"
        : val,
    value: val,
  }));
  const employementStatusOptions = Array.from(
    new Set(data.map((item) => item.employment_status))
  ).map((val) => ({ label: val, value: val }));

  //STATUS DONT CHANGE
  const statusOptions = [
    { label: "Under Review (Head)", value: "URH" },
    { label: "Approved", value: "APP" },
    { label: "For Revision (Head)", value: "FRH" },
  ];

  const [filters, setFilters] = useState({
    company_name: "",
    gender: "",
    position_id: "",
    p_np: "",
    employment_status: "",
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
            Loading HR Demographics...
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
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        height: "100%", //added
        p: { xs: 1, sm: 2 },
      }}
    >
      <Box
        sx={{
          flexGrow: 1,
          height: "100%",
          overflow: "auto",
          maxWidth: "100%",
        }}
      >
        {/* Filters */}
        <Box
          sx={{
            display: "flex",
            gap: isSmallScreen ? 1 : 2,
            flexWrap: "wrap",
            mb: 3,
            px: { xs: 1, sm: 0 },
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "stretch", sm: "center" },
          }}
        >
          {" "}
          <Search
            onSearch={setSearchQuery}
            suggestions={suggestions}
            sx={{
              width: { xs: "100%", sm: "auto" },
              minWidth: { xs: "100%", sm: "200px" },
              mb: { xs: 1, sm: 0 },
            }}
          />
          <Filter
            label="Company"
            options={[{ label: "All Companies", value: "" }, ...companyOptions]}
            value={filters.company_name}
            onChange={(val) => {
              setFilters((prev) => ({ ...prev, company_name: val }));
              setPage(1);
            }}
            placeholder="Company"
            sx={{
              width: { xs: "100%", sm: "auto" },
              minWidth: { xs: "100%", sm: "150px" },
              mb: { xs: 1, sm: 0 },
            }}
          />
          <Filter
            label="Gender"
            options={[{ label: "All Genders", value: "" }, ...genderOptions]}
            value={filters.gender}
            onChange={(val) => {
              setFilters((prev) => ({ ...prev, gender: val }));
              setPage(1);
            }}
            placeholder="Gender"
            sx={{
              width: { xs: "100%", sm: "auto" },
              minWidth: { xs: "100%", sm: "120px" },
              mb: { xs: 1, sm: 0 },
            }}
          />
          <Filter
            label="Position"
            options={[{ label: "All Position", value: "" }, ...positionOptions]}
            value={filters.position_id}
            onChange={(val) => {
              setFilters((prev) => ({ ...prev, position_id: val }));
              setPage(1);
            }}
            placeholder="Position"
            sx={{
              width: { xs: "100%", sm: "auto" },
              minWidth: { xs: "100%", sm: "150px" },
              mb: { xs: 1, sm: 0 },
            }}
          />
          <Filter
            label="Employment Category"
            options={[
              { label: "All Employment Category", value: "" },
              ...employementCategoryOptions,
            ]}
            value={filters.p_np}
            onChange={(val) => {
              setFilters((prev) => ({ ...prev, p_np: val }));
              setPage(1);
            }}
            placeholder="Employment Category"
            sx={{
              width: { xs: "100%", sm: "auto" },
              minWidth: { xs: "100%", sm: "180px" },
              mb: { xs: 1, sm: 0 },
            }}
          />
          <Filter
            label="Employment Status"
            options={[
              { label: "All Employment Status", value: "" },
              ...employementStatusOptions,
            ]}
            value={filters.employment_status}
            onChange={(val) => {
              setFilters((prev) => ({ ...prev, employment_status: val }));
              setPage(1);
            }}
            placeholder="Employment Status"
            sx={{
              width: { xs: "100%", sm: "auto" },
              minWidth: { xs: "100%", sm: "180px" },
              mb: { xs: 1, sm: 0 },
            }}
          />
          <Filter
            label="Status"
            options={[{ label: "All Statuses", value: "" }, ...statusOptions]}
            value={filters.status_id}
            onChange={(val) => {
              setFilters((prev) => ({ ...prev, status_id: val }));
              setPage(1);
            }}
            placeholder="Status"
            sx={{
              width: { xs: "100%", sm: "auto" },
              minWidth: { xs: "100%", sm: "120px" },
              mb: { xs: 1, sm: 0 },
            }}
          />
          {isFiltering && (
            <Button
              variant="outline"
              startIcon={<ClearIcon />}
              sx={{
                color: "#182959",
                borderRadius: "999px",
                padding: isSmallScreen ? "6px 12px" : "9px 18px",
                fontSize: isSmallScreen ? "0.75rem" : "0.85rem",
                fontWeight: "bold",
                width: { xs: "100%", sm: "auto" },
                minWidth: { xs: "100%", sm: "auto" },
                mt: { xs: 1, sm: 0 },
              }}
              onClick={() => {
                setFilters({
                  company_name: "",
                  gender: "",
                  position_id: "",
                  p_np: "",
                  employment_status: "",
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
        {/*
          <Table
            columns={columns}
            rows={paginatedData}
            actions={renderActions}
            emptyMessage="No records found for the selected filters."
          />
        */}{" "}
        {/* Custom Table Component */}
        <Box
          sx={{
            width: "100%",
            overflowX: "auto",
            mb: 2,
          }}
        >
          <CustomTable
            columns={columns}
            rows={paginatedData}
            filteredData={filteredData}
            idKey={"employee_id"} // or "id", "recordId", etc. depending on the page
            onSelectionChange={(selectedRows) => {
              handleRowSelect(selectedRows);
            }}
            emptyMessage="No demographics data found."
            maxHeight={isSmallScreen ? "50vh" : "60vh"}
            minHeight={isSmallScreen ? "250px" : "300px"}
            actions={renderActions}
          />
        </Box>
        {/* Pagination */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "center", sm: "flex-start" },
            marginTop: "1rem",
            gap: { xs: 2, sm: 0 },
            px: { xs: 1, sm: 0 },
          }}
        >
          {/* Row Count Display */}
          <Box
            sx={{
              textAlign: { xs: "center", sm: "left" },
              order: { xs: 2, sm: 1 },
            }}
          >
            <Typography
              sx={{
                fontSize: isSmallScreen ? "0.75rem" : "0.85rem",
              }}
            >
              Total {filteredData.length}{" "}
              {filteredData.length === 1 ? "record" : "records"}
            </Typography>
            {selectedRowIds.length > 0 && (
              <Typography
                sx={{
                  fontSize: isSmallScreen ? "0.75rem" : "0.85rem",
                  color: "#2B8C37",
                  fontWeight: 700,
                }}
              >
                {selectedRowIds.length} selected record
                {selectedRowIds.length > 1 ? "s" : ""}
              </Typography>
            )}
          </Box>

          <Box
            sx={{
              order: { xs: 1, sm: 2 },
              display: "flex",
              alignItems: "center",
            }}
          >
            <Pagination
              page={page}
              count={Math.ceil(filteredData.length / rowsPerPage)}
              onChange={handlePageChange}
              size={isSmallScreen ? "small" : "medium"}
            />
          </Box>

          <Box
            sx={{
              order: { xs: 3, sm: 3 },
              textAlign: { xs: "center", sm: "right" },
            }}
          >
            <Typography
              sx={{
                fontSize: isSmallScreen ? "0.75rem" : "0.85rem",
              }}
            >
              Showing{" "}
              {Math.min((page - 1) * rowsPerPage + 1, filteredData.length)}–
              {Math.min(page * rowsPerPage, filteredData.length)} records
            </Typography>
          </Box>
        </Box>
        {selectedRecord != null &&
          (console.log("Selected Record:", selectedRecord),
          (
            <Overlay onClose={() => setSelectedRecord(null)}>
              <ViewUpdateEmployeeModal
                title={"HR Employability Details"}
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

export default Demographics;
