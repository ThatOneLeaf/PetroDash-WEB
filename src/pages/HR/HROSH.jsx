import { useState, useEffect } from "react";
import { Button, IconButton, Box, Typography } from "@mui/material";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import AddIcon from "@mui/icons-material/Add";

import EditIcon from "@mui/icons-material/Edit";

import api from "../../services/api";
import Overlay from "../../components/modal";
import AddTrainingModal from "../../components/hr_components/AddTrainingModal";
import ImportHRModal from "../../components/hr_components/ImportHRModal";
import Sidebar from "../../components/Sidebar";

import { useFilteredData } from "../../components/hr_components/filtering"; //change when moved

import Pagination from "../../components/Pagination/pagination";
import Table from "../../components/Table/Table";
import Filter from "../../components/Filter/Filter";
import StatusChip from "../../components/StatusChip";

import { useNavigate } from "react-router-dom";

function OSH() {
  //remove and change ui with states
  const [selectedButton, setSelectedButton] = useState("button4");
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
    { label: "OSH", value: "button5", path: "/social/hr/osh" },
  ]; // ---------------------------------------------------

  //INITIALIZE

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  // DATA -- CHANGE PER PAGE
  const fetchOSHData = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        "hr/occupational_safety_health_records_by_status"
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
    fetchOSHData();
  }, []);

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
      render: (val) => val.split("T")[0],
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
    <IconButton size="small">
      <EditIcon />
    </IconButton>
  );

  //FILTERS -- ITEMS --CHANGE PER PAGE
  const companyOptions = Array.from(
    new Set(data.map((item) => item.company_name))
  ).map((val) => ({ label: val, value: val }));

  const workforceTypeOptions = Array.from(
    new Set(data.map((item) => item.workforce_type))
  ).map((val) => ({ label: val, value: val }));

  const lostTimeOptions = Array.from(
    new Set(data.map((item) => item.lost_time))
  ).map((val) => ({
    label: val ? "Yes" : "No",
    value: val,
  }));

  const incidentTypeOptions = Array.from(
    new Set(data.map((item) => item.incident_type))
  ).map((val) => ({ label: val, value: val }));

  const incidentTitleOptions = Array.from(
    new Set(data.map((item) => item.incident_title))
  ).map((val) => ({ label: val, value: val }));

  //STATUS DONT CHANGE
  const statusOptions = [
    { label: "Pending", value: "PND" },
    { label: "Head Approved", value: "HAP" },
    { label: "Site Approved", value: "SAP" },
    { label: "For Revision (Site)", value: "FRS" },
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

  //FILTERS --DONT CHANGE

  const filteredData = useFilteredData(data, filters);

  //PAGINATION -- DONT CHANGE

  const rowsPerPage = 10;

  const totalPages = Math.ceil(data.length / rowsPerPage);

  const paginatedData = filteredData.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  if (loading) return <div>Loading...</div>;
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
                { label: "Incident Title", value: "" },
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

          {/* Add Modal */}
          {isAddModalOpen && (
            <Overlay onClose={() => setIsAddModalOpen(false)}>
              <AddTrainingModal
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
                context="training"
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

export default OSH;
