import { useState, useEffect, useMemo } from "react";
import { Button, Box, IconButton } from "@mui/material";
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

import ViewParentalLeaveModal from "../../components/hr_components/ViewParentalLeaveModal";
import UpdateParentalLeaveModal from "../../components/hr_components/UpdateParentalLeaveModal";
import Sidebar from "../../components/Sidebar";

function ParentalLeave({ onFilterChange }) {
  //INITIALIZE

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");

  const [isUpdateModal, setIsUpdateModal] = useState(false);
  const [isViewModal, setIsViewModal] = useState(false);
  const [row, setRow] = useState([]);

  // DATA -- CHANGE PER PAGE
  const fetchParentalData = async () => {
    try {
      setLoading(true);
      const response = await api.get("hr/parental_leave_records_by_status");
      console.log("Parental Data from API:", response.data);
      setData(response.data);
    } catch (error) {
      console.error("Error fetching Parental data:", error);
      setError("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParentalData();
  }, []);

  //TABLE -- CHANGE PER PAGE

  const columns = [
    { key: "company_name", label: "Company" },
    { key: "employee_id", label: "Employee ID" },
    { key: "date", label: "Date Availed", render: (val) => val.split("T")[0] },
    {
      key: "end_date",
      label: "Date Ended",
      render: (val) => val.split("T")[0],
    },
    { key: "type_of_leave", label: "Type Of Leave" },
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
        setIsUpdateModal(true);
        setRow(row);
      }}
    >
      <LaunchIcon />
    </IconButton>
  );

  const showView = (row) => {
    setIsViewModal(true), setRow(row);
  };

  //FILTERS -- ITEMS --CHANGE PER PAGE
  const companyOptions = Array.from(
    new Set(data.map((item) => item.company_name))
  ).map((val) => ({ label: val, value: val }));

  const typeOfLeaveOptions = Array.from(
    new Set(data.map((item) => item.type_of_leave))
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
    company_name: "",
    type_of_leave: "",
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
            Loading Parental Leave Data...
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
          </Box> */}

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
            label="Type Of Leave"
            options={[
              { label: "All Types Of Leave", value: "" },
              ...typeOfLeaveOptions,
            ]}
            value={filters.type_of_leave}
            onChange={(val) => {
              setFilters((prev) => ({ ...prev, type_of_leave: val }));
              setPage(1);
            }}
            placeholder="Type Of Leave"
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
                  type_of_leave: "",
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
            onRowClick={showView}
            emptyMessage="No records found for the selected filters."
          />
        }

        {/* Pagination */}
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Pagination page={page} count={totalPages} onChange={setPage} />
        </Box>

        {isUpdateModal && (
          <Overlay onClose={() => setIsUpdateModal(false)}>
            <UpdateParentalLeaveModal
              onClose={() => setIsUpdateModal(false)}
              row={row}
            />
          </Overlay>
        )}

        {isViewModal && (
          <Overlay onClose={() => setIsViewModal(false)}>
            <ViewParentalLeaveModal
              onClose={() => {
                setIsViewModal(false);
              }}
              row={row}
            />
          </Overlay>
        )}
      </Box>
    </Box>
  );
}

export default ParentalLeave;
