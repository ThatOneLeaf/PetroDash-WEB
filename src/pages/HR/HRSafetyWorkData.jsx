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

import dayjs from "dayjs";

import ViewUpdateSafetyWorkDataModal from "../../components/hr_components/ViewUpdateSafetyWorkDataModal";

function SafetyWorkData({ onFilterChange, shouldReload, setShouldReload }) {
  //INITIALIZE
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedRecord, setSelectedRecord] = useState(null); // Old Data

  // DATA -- CHANGE PER PAGE
  const fetchSafetyWorkData = async () => {
    try {
      setLoading(true);
      const response = await api.get("hr/safety_workdata_records_by_status");
      console.log("Safety Work Data from API:", response.data);
      setData(response.data);
    } catch (error) {
      console.error("Error fetching Safety data:", error);
      setError("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSafetyWorkData();
  }, []);

  useEffect(() => {
    if (shouldReload) {
      fetchSafetyWorkData();
      setShouldReload(false);
    }
  }, [shouldReload]);

  //TABLE -- CHANGE PER PAGE

  const columns = [
    { key: "company_name", label: "Company" },
    { key: "contractor", label: "Contractor" },
    {
      key: "date",
      label: "Date",
      render: (val) => (val ? dayjs(val).format("MM-DD-YYYY") : "N/A"),
    },
    { key: "manpower", label: "Manpower" },
    { key: "manhours", label: "Manhours" },
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

  const contractorOptions = Array.from(
    new Set(data.map((item) => item.contractor))
  ).map((val) => ({ label: val, value: val }));

  //STATUS DONT CHANGE
  const statusOptions = [
    { label: "Under Review (Site)", value: "URS" },
    { label: "Under Review (Head)", value: "URH" },
    { label: "Approved", value: "APP" },
    { label: "For Revision (Site)", value: "FRS" },
    { label: "For Revision (Head)", value: "FRH" },
  ];

  const [filters, setFilters] = useState({
    companyName: "",
    contractor: "",
    status_id: "",
  });

  const isFiltering = useMemo(() => {
    return Object.values(filters).some((v) => v !== null && v !== "");
  }, [filters]);

  //FILTERS --DONT CHANGE

  const filteredData = useFilteredData(data, filters, searchQuery);

  useEffect(() => {
    if (typeof onFilterChange === "function" && filteredData !== null) {
      onFilterChange(filteredData);
    }
  }, [filteredData, onFilterChange]);

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
          <CircularProgress
            size={64}
            thickness={5}
            sx={{ color: "#182959" }}
          />
          <Typography
            sx={{
              mt: 2,
              color: "#182959",
              fontWeight: 700,
              fontSize: 20,
            }}
          >
            Loading Safety Work Data...
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
            label="Contractors"
            options={[
              { label: "All Contractors", value: "" },
              ...contractorOptions,
            ]}
            value={filters.contractor}
            onChange={(val) => {
              setFilters((prev) => ({ ...prev, contractor: val }));
              setPage(1);
            }}
            placeholder="Contractors"
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
                  companyName: "",
                  contractor: "",
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

        {
          <Table
            columns={columns}
            rows={paginatedData}
            actions={renderActions}
            emptyMessage="No records found for the selected filters."
          />
        }

        {/* Pagination */}
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination
            page={page}
            count={Math.ceil(filteredData.length / rowsPerPage)}
            onChange={handlePageChange}
          />
        </Box>

        {selectedRecord != null &&
          (console.log("Selected Record:", selectedRecord),
          (
            <Overlay onClose={() => setSelectedRecord(null)}>
              <ViewUpdateSafetyWorkDataModal
                title={"HR Safety Work Data Details"}
                record={selectedRecord}
                status={(data) => {
                  if (!data) {
                    fetchSafetyWorkData();
                  }
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

export default SafetyWorkData;
