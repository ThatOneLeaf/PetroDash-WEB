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

import ViewEmployeeModal from "../../components/hr_components/ViewEmployeeModal";
import UpdateEmployeeModal from "../../components/hr_components/UpdateEmployeeModal";

function Demographics({ onFilterChange }) {
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
      render: (val) => val.split("T")[0],
    },
    {
      key: "end_date",
      label: "End Date",
      render: (val) => (val ? val.split("T")[0] : "N/A"),
    },
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
    { label: "Under Review (Site)", value: "URS" },
    { label: "Under Review (Head)", value: "URH" },
    { label: "Approved", value: "APP" },
    { label: "For Revision (Site)", value: "FRS" },
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
            label="Gender"
            options={[{ label: "All Genders", value: "" }, ...genderOptions]}
            value={filters.gender}
            onChange={(val) => {
              setFilters((prev) => ({ ...prev, gender: val }));
              setPage(1);
            }}
            placeholder="Gender"
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
          />

          <Filter
            label="Employement Category"
            options={[
              { label: "All Employement Category", value: "" },
              ...employementCategoryOptions,
            ]}
            value={filters.p_np}
            onChange={(val) => {
              setFilters((prev) => ({ ...prev, p_np: val }));
              setPage(1);
            }}
            placeholder="Employement Category"
          />

          <Filter
            label="Employement Status"
            options={[
              { label: "All Employement Status", value: "" },
              ...employementStatusOptions,
            ]}
            value={filters.employment_status}
            onChange={(val) => {
              setFilters((prev) => ({ ...prev, employment_status: val }));
              setPage(1);
            }}
            placeholder="Employement Status"
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
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <Pagination
            page={page}
            count={Math.ceil(filteredData.length / rowsPerPage)}
            onChange={handlePageChange}
          />
        </Box>

        {isUpdateModal && (
          <Overlay onClose={() => setIsUpdateModal(false)}>
            <UpdateEmployeeModal
              onClose={() => setIsUpdateModal(false)}
              row={row}
            />
          </Overlay>
        )}
        {/* 
        {isImportdModalOpen && (
          <Overlay onClose={() => setIsImportModalOpen(false)}>
            <ImportFileModal
              title="Hr - Electricity"
              downloadPath="environment/create_template/envi_electric_consumption"
              uploadPath="environment/bulk_upload_electric_consumption"
              onClose={() => setIsImportModalOpen(false)} // or any close handler
            />
          </Overlay>
        )}*/}

        {isViewModal && (
          <Overlay onClose={() => setIsViewModal(false)}>
            <ViewEmployeeModal
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

export default Demographics;
