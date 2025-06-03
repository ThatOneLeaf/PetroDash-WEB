import { useState, useEffect } from "react";
import { Button, Box } from "@mui/material";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import AddIcon from "@mui/icons-material/Add";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import api from "../../services/api";
import Overlay from "../../components/modal";

import AddParentalLeaveModal from "../../components/hr_components/AddParentalLeaveModal";
import ImportHRModal from "../../components/hr_components/ImportHRModal";
import Sidebar from "../../components/Sidebar";

import Table from "../../components/Table/Table";
import Filter from "../../components/Filter/Filter";
import Search from "../../components/Filter/Search";
import Pagination from "../../components/Pagination/pagination";
import StatusChip from "../../components/StatusChip";

import { useNavigate } from "react-router-dom";

function ParentalLeave() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedButton, setSelectedButton] = useState("button2");

  const [filters, setFilters] = useState({});
  const [search, setSearch] = useState("");

  const [sortConfig, setSortConfig] = useState({
    key: "year",
    direction: "desc",
  });

  const rowsPerPage = 10;

  const companyOptions = Array.from(
    new Set(data.map((item) => item.company_name))
  ).map((val) => ({ label: val, value: val }));

  const typeOfLeaveOptions = Array.from(
    new Set(data.map((item) => item.type_of_leave))
  ).map((val) => ({ label: val, value: val }));

  const statusOptions = [
    { label: "Pending", value: "PND" },
    { label: "Head Approved", value: "HAP" },
    { label: "Site Approved", value: "SAP" },
    { label: "For Revision (Site)", value: "FRS" },
    { label: "For Revision (Head)", value: "FRH" },
  ];

  useEffect(() => {
    fetchParentalData();
  }, []);

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

  const navigate = useNavigate();

  const buttonRoutes = [
    { label: "Employability", value: "button1", path: "/social/hr" },
    {
      label: "Parental Leave",
      value: "button2",
      path: "/social/hr/parentalleave",
    },
    {
      label: "Safety Work Data",
      value: "button3",
      path: "/social/hr/safetyworkdata",
    },
    { label: "Training", value: "button4", path: "/social/hr/training" },
    { label: "OSH", value: "button5", path: "/osh" },
  ];

  // Table columns config
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
  const pagedData = filteredData.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [pagedData.length, rowsPerPage]);

  const renderActions = (row) => <></>;
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

          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>
            <Filter
              label="Company"
              options={[
                { label: "All Companies", value: "" },
                ...companyOptions,
              ]}
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
          </Box>

          {/* Filters */}
          {/*}
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>
            <Filter
              label="Company"
              options={[
                { label: "All Companies", value: "" },
                ...companyOptions,
              ]}
              value={filters.company_id}
              onChange={(val) => {
                setFilters((prev) => ({ ...prev, company_id: val }));
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
              value={filters.employment_status}
              onChange={(val) => {
                setFilters((prev) => ({ ...prev, employment_status: val }));
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
              value={filters.status_id}
              onChange={(val) => {
                setFilters((prev) => ({ ...prev, status_id: val }));
                setPage(1);
              }}
              placeholder="Status"
            />
          </Box>*/}

          {/* Table with updated colors 
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow style={{ backgroundColor: "#182959" }}>
                  {[
                    { key: "companyId", label: "Company ID" },
                    { key: "employeeId", label: "Employee ID" },
                    { key: "dateAvailed", label: "Date Availed" },
                    { key: "daysAvailed", label: "Days Availed" },
                    { key: "typeOfLeave", label: "Type Of Leave" },
                    { key: "approvalStatus", label: "Approval Status" },
                  ].map(({ key, label }) => (
                    <TableCell
                      key={key}
                      onClick={() => handleSort(key)}
                      style={{
                        color: "white",
                        cursor: "pointer",
                        padding: "16px",
                        fontWeight: "bold",
                        whiteSpace: "nowrap",
                        userSelect: "none",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        {label}
                        {renderSortIcon(key)}
                      </div>
                    </TableCell>
                  ))}
                  <TableCell
                    style={{
                      color: "white",
                      padding: "16px",
                      fontWeight: "bold",
                      width: "100px",
                    }}
                  >
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
             
                {getCurrentPageData().map((row) => (
                  <TableRow key={row.employee_id} hover>
                    <TableCell>{row.employee_id}</TableCell>
                    <TableCell>{row.gender}</TableCell>
                    <TableCell>
                      {new Date(row.birthdate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{row.position_id}</TableCell>
                    <TableCell>{row.p_np}</TableCell>
                    <TableCell>{row.company_id}</TableCell>
                    <TableCell>{row.employment_status}</TableCell>
                    <TableCell style={{ textAlign: "center" }}>
                      <IconButton size="small">
                        
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>*/}

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

          {/* Pagination with updated colors 
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "2rem",
              gap: "0.5rem",
            }}
          >
            <Button
              onClick={() => handlePageChange(1)}
              variant="outlined"
              size="small"
              disabled={page === 1}
            >
              {"<<"}
            </Button>
            <Button
              onClick={() => handlePageChange(page - 1)}
              variant="outlined"
              size="small"
              disabled={page === 1}
            >
              {"<"}
            </Button>

            {[...Array(totalPages)].map((_, index) => (
              <Button
                key={index + 1}
                variant={page === index + 1 ? "contained" : "outlined"}
                size="small"
                onClick={() => handlePageChange(index + 1)}
                style={{
                  minWidth: "40px",
                  backgroundColor:
                    page === index + 1 ? "#182959" : "transparent",
                }}
              >
                {index + 1}
              </Button>
            ))}

            <Button
              onClick={() => handlePageChange(page + 1)}
              variant="outlined"
              size="small"
              disabled={page === totalPages}
            >
              {">"}
            </Button>
            <Button
              onClick={() => handlePageChange(totalPages)}
              variant="outlined"
              size="small"
              disabled={page === totalPages}
            >
              {">>"}
            </Button>
          </div>*/}

          {/* Add Modal */}
          {isAddModalOpen && (
            <Overlay onClose={() => setIsAddModalOpen(false)}>
              <AddParentalLeaveModal
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
                context="parentalleave"
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

export default ParentalLeave;
