import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Box,
} from "@mui/material";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import AddIcon from "@mui/icons-material/Add";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import api from "../../services/api";
import Overlay from "../../components/modal";
import AddSafetyWorkDataModal from "../../components/hr_components/AddSafetyWorkDataModal";
import ImportHRModal from "../../components/hr_components/ImportHRModal";
import Sidebar from "../../components/Sidebar";

import { useNavigate } from "react-router-dom";

function SafetyWorkData() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedButton, setSelectedButton] = useState("button3");
  const [sortConfig, setSortConfig] = useState({
    key: "year",
    direction: "desc",
  });

  const rowsPerPage = 10;

  //WAITING FOR API
  /*
  useEffect(() => {
    fetchEconomicData(); //change
  }, []); // Remove sortConfig dependency


  //update
  const fetchEmployabilityData = async () => {
    try {
      setLoading(true);
      const response = await api.get("/economic/value-generated-data");
      console.log("Data from API:", response.data);
      setData(response.data);
    } catch (error) {
      console.error("Error fetching economic data:", error);
      setError("Error fetching data");
    } finally {
      setLoading(false);
    }
  };*/

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

  const handleSort = (key) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "asc"
          ? "desc"
          : "asc",
    }));
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? (
      <ArrowUpwardIcon fontSize="small" />
    ) : (
      <ArrowDownwardIcon fontSize="small" />
    );
  };

  // Sort data locally
  const getSortedData = () => {
    const sortedData = [...data].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key])
        return sortConfig.direction === "asc" ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key])
        return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
    return sortedData;
  };

  // Get current page data from sorted data
  const getCurrentPageData = () => {
    const sortedData = getSortedData();
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return sortedData.slice(start, end);
  };

  // Calculate total pages based on data length
  const totalPages = Math.ceil(data.length / rowsPerPage);

  // Handle page changes
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  //if (loading) return <div>Loading...</div>; // UN COMMENT
  //if (error) return <div>{error}</div>;

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

              <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
                {buttonRoutes.map(({ label, value, path }) => (
                  <Button
                    key={value}
                    variant={
                      selectedButton === value ? "contained" : "outlined"
                    }
                    onClick={() => {
                      setSelectedButton(value);
                      navigate(path);
                    }}
                    style={{
                      backgroundColor:
                        selectedButton === value ? "#182959" : "",
                      color: selectedButton === value ? "white" : "#182959",
                      borderColor: "#182959",
                    }}
                  >
                    {label}
                  </Button>
                ))}
              </div>
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

          {/* Table with updated colors */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow style={{ backgroundColor: "#182959" }}>
                  {[
                    { key: "companyId", label: "Company ID" },
                    { key: "contractor", label: "Contractor" },
                    { key: "date", label: "Date" },
                    { key: "safetyManpower", label: "Safety Manpower" },
                    { key: "safetyManhours", label: "Safety Manhours" },
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
                {/* update */}{" "}
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
                        {/* Action icon or logic goes here */}
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {/* Pagination with updated colors */}
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
          </div>

          {/* Add Modal */}
          {isAddModalOpen && (
            <Overlay onClose={() => setIsAddModalOpen(false)}>
              <AddSafetyWorkDataModal
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
                context="safetyworkdata"
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

export default SafetyWorkData;
