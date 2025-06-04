import { useState, useEffect, useMemo } from "react";
import { Button, IconButton, Box, Typography } from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import api from "../../services/api";

import { useFilteredData } from "../../components/hr_components/filtering"; //change when moved

import Pagination from "../../components/Pagination/pagination";
import Table from "../../components/Table/Table";
import Filter from "../../components/Filter/Filter";
import Search from "../../components/Filter/Search";
import Overlay from "../../components/modal";
import StatusChip from "../../components/StatusChip";

import ViewSafetyWorkDataModal from "../../components/hr_components/ViewSafetyWorkDataModal";
import UpdateSafetyWorkDataModal from "../../components/hr_components/UpdateSafetyWorkDataModal";

function SafetyWorkData({ onFilterChange }) {
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

  //TABLE -- CHANGE PER PAGE

  const columns = [
    { key: "company_name", label: "Company" },
    { key: "contractor", label: "Contractor" },
    {
      key: "date",
      label: "Date",
      render: (val) => val.split("T")[0],
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
        setIsUpdateModal(true);
        setRow(row);
      }}
    >
      <EditIcon />
    </IconButton>
  );

  const showView = (row) => {
    setIsViewModal(true), setRow(row);
  };

  //FILTERS -- ITEMS --CHANGE PER PAGE
  const companyOptions = Array.from(
    new Set(data.map((item) => item.company_name))
  ).map((val) => ({ label: val, value: val }));

  const contractorOptions = Array.from(
    new Set(data.map((item) => item.contractor))
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
    companyName: "",
    contractor: "",
    status_id: "",
  });

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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

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
            <UpdateSafetyWorkDataModal
              onClose={() => setIsUpdateModal(false)}
              row={row}
            />
          </Overlay>
        )}

        {isViewModal && (
          <Overlay onClose={() => setIsViewModal(false)}>
            <ViewSafetyWorkDataModal
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

export default SafetyWorkData;
