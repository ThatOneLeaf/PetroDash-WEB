import { useState, useEffect } from "react";
import { Button, Box } from "@mui/material";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import AddIcon from "@mui/icons-material/Add";
import api from "../../services/api";
import Overlay from "../../components/modal";
import AddEmployeeModal from "../../components/hr_components/AddEmployeeModal";
import ImportHRModal from "../../components/hr_components/ImportHRModal";
import Sidebar from "../../components/Sidebar";
import Table from "../../components/Table/Table";
import Filter from "../../components/Filter/Filter";
import Search from "../../components/Filter/Search";
import Pagination from "../../components/Pagination/pagination";
import StatusChip from "../../components/StatusChip";

import { useNavigate } from "react-router-dom";

function Demographics() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const [selectedButton, setSelectedButton] = useState("button1");

  const [filters, setFilters] = useState({});
  const [search, setSearch] = useState("");

  const [sortConfig, setSortConfig] = useState({
    key: "year",
    direction: "desc",
  });

  const rowsPerPage = 10;

  //INIITIALIZE FILTER INPUTS
  const companyOptions = Array.from(
    new Set(data.map((item) => item.company_id))
  ).map((val) => ({ label: val, value: val }));
  const genderOptions = Array.from(
    new Set(data.map((item) => item.gender))
  ).map((val) => ({ label: val, value: val }));
  const positionOptions = Array.from(
    new Set(data.map((item) => item.position_id))
  ).map((val) => ({
    label: val,
    value: val,
  }));
  const employementCategoryOptions = Array.from(
    new Set(data.map((item) => item.p_np))
  ).map((val) => ({
    label: val,
    value: val,
  }));
  const employementStatusOptions = Array.from(
    new Set(data.map((item) => item.employment_status))
  ).map((val) => ({ label: val, value: val }));
  const statusOptions = [
    { label: "Pending", value: "PND" },
    { label: "Head Approved", value: "HAP" },
    { label: "Site Approved", value: "SAP" },
    { label: "For Revision (Site)", value: "FRS" },
    { label: "For Revision (Head)", value: "FRH" },
  ];

  useEffect(() => {
    fetchEmployabilityData();
  }, []);

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

  const navigate = useNavigate();

  const buttonRoutes = [
    { label: "Employability", value: "button1", path: "/social-hr" },
    {
      label: "Parental Leave",
      value: "button2",
      path: "/social-hr/parentalleave",
    },
    {
      label: "Safety Work Data",
      value: "button3",
      path: "/social-hr/safetyworkdata",
    },
    { label: "Training", value: "button4", path: "/social-hr/training" },
    { label: "OSH", value: "button5", path: "/osh" },
  ];

  // Table columns config
  const columns = [
    { key: "company_id", label: "Company ID" },
    { key: "employee_id", label: "Employee ID" },
    { key: "gender", label: "Gender" },
    { key: "position_id", label: "Position" },
    { key: "p_np", label: "Employee Category" },
    { key: "employment_status", label: "Employee Status" },
    {
      key: "status_id",
      label: "Status",
      render: (val) => <StatusChip status={val} />,
    },
  ];

  // Sorting logic
  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "asc"
          ? "desc"
          : "asc",
    }));
  };

  const filteredData = data
    .filter((row) => {
      // Filter
      return Object.entries(filters).every(([key, value]) => {
        if (value == null || value.length === 0) return true;
        if (Array.isArray(value)) return value.includes(row[key]);
        return row[key] === value;
      });
    })
    .filter((row) => {
      // Search (searches all fields as string)
      if (!search) return true;
      const searchStr = search.toLowerCase();
      return Object.values(row).some((val) =>
        String(val).toLowerCase().includes(searchStr)
      );
    });

  // Sorting
  const sortedData = [...filteredData].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key])
      return sortConfig.direction === "asc" ? -1 : 1;
    if (a[sortConfig.key] > b[sortConfig.key])
      return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(sortedData.length / rowsPerPage));
  const pagedData = sortedData.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  // Reset to page 1 if filters/search change and page is out of range
  useEffect(() => {
    if (page > totalPages) setPage(1);
    // eslint-disable-next-line
  }, [pagedData.length, rowsPerPage]);

  // Table actions (optional)
  const renderActions = (row) => (
    <></>
    // Add action buttons here if needed
  );

  if (loading) return <div>Loading...</div>; // UN COMMENT
  if (error) return <div>{error}</div>;

  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, height: "100vh", overflow: "auto" }}>
        <div style={{ padding: "2rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "2rem",
            }}
          >
            <div>
              <Box>
                <h1
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    marginBottom: "0.5rem",
                  }}
                >
                  REPOSITORY
                </h1>
                <h2 style={{ fontSize: "2rem", color: "#182959" }}>
                  Social - Human Resources
                </h2>
              </Box>
            </div>

            <div style={{ display: "flex", gap: "1rem" }}>
              <Button
                variant="contained"
                startIcon={<FileUploadIcon />}
                style={{ backgroundColor: "#182959" }}
              >
                EXPORT DATA
              </Button>
              <Button
                variant="contained"
                style={{ backgroundColor: "#182959" }}
                onClick={() => setIsImportModalOpen(true)}
              >
                IMPORT
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                style={{ backgroundColor: "#2B8C37" }}
                onClick={() => setIsAddModalOpen(true)}
              >
                ADD RECORD
              </Button>
            </div>
          </div>

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
          </Box>

          {/* Filters */}
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>
            <Filter
              label="Company"
              options={[
                { label: "All Companies", value: "" },
                ...companyOptions,
              ]}
              value={filters.company}
              onChange={(val) => {
                setFilters((prev) => ({ ...prev, company: val }));
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
              options={[
                { label: "All Position", value: "" },
                ...positionOptions,
              ]}
              value={filters.position_id}
              onChange={(val) => {
                setFilters((prev) => ({ ...prev, position_id: val }));
                setPage(1);
              }}
              placeholder="Position"
            />

            <Filter
              label="Employement Status"
              options={[
                { label: "All Employement Status", value: "" },
                ...employementStatusOptions,
              ]}
              value={filters.employement_status}
              onChange={(val) => {
                setFilters((prev) => ({ ...prev, employement_status: val }));
                setPage(1);
              }}
              placeholder="Employement Status"
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
              label="Status"
              options={[{ label: "All Statuses", value: "" }, ...statusOptions]}
              value={filters.status}
              onChange={(val) => {
                setFilters((prev) => ({ ...prev, status: val }));
                setPage(1);
              }}
              placeholder="Status"
            />
          </Box>

          {/* Table */}
          <Table
            columns={columns}
            rows={pagedData}
            onSort={handleSort}
            sortConfig={sortConfig}
            actions={renderActions}
            filters={{}} // No filters in table, handled above
            onFilterChange={() => {}} // No-op
            emptyMessage="No data available."
          />

          {/* Pagination */}
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <Pagination page={page} count={totalPages} onChange={setPage} />
          </Box>

          {/* Add Modal */}
          {isAddModalOpen && (
            <Overlay onClose={() => setIsAddModalOpen(false)}>
              <AddEmployeeModal
                onClose={() => {
                  setIsAddModalOpen(false);
                }}
              />
            </Overlay>
          )}

          {/* Add Import Modal */}

          {isImportModalOpen && (
            <Overlay onClose={() => setIsImportModalOpen(false)}>
              <ImportHRModal
                context="employability"
                onClose={() => {
                  setIsImportModalOpen(false);
                }}
              />
            </Overlay>
          )}
        </div>
      </Box>
    </Box>
  );
}

export default Demographics;
