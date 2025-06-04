import { useState, useEffect } from "react";
import SideBar from "../../components/Sidebar";
import ImportPowerFileModal from "../../components/ImportPowerFileModal";
import {
  Box,
  Container,
  Typography,
  Button,
  IconButton
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import Overlay from "../../components/modal";
import AddEnergyGenerationModal from "../../components/AddPowerGeneratedModal";
import Pagination from "../../components/Pagination/pagination";
import Table from "../../components/Table/Table";
import Filter from "../../components/Filter/Filter"; 
import StatusChip from "../../components/StatusChip";
import api from '../../services/api';

function Energy() {
  const [data, setData] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const [isAddEnergyModalOpen, setIsAddEnergyModalOpen] = useState(false);
  const [isImportEnergyModalOpen, setIsImportEnergyModalOpen] = useState(false);

  const [filters, setFilters] = useState({
    company: "",
    powerPlant: "",
    generationSource: "",
    province: "",
    status: "",
  });

  // New state for power plants list
  const [powerPlants, setPowerPlants] = useState([]);

  const fetchEnergyData = async () => {
    try {
      const response = await api.get("/energy/energy_records_by_status");
      const result = response.data;

      const records = Array.isArray(result) ? result : [result];

      const formattedData = records.map((item) => ({
        energyId: item.energy_id,
        powerPlant: item.power_plant_id,
        companyName: item.company_name,
        generationSource: item.generation_source,
        province: item.province || "",
        date: item.date_generated,
        energyGenerated: parseFloat(item.energy_generated_kwh),
        co2Avoidance: (parseFloat(item.co2_avoidance_kg) / 1000).toFixed(3),
        status: item.status_id,
      }));

      setData(formattedData);
    } catch (error) {
      console.error("Error fetching energy data:", error);
    }
  };

  // Fetch power plants once on mount
  useEffect(() => {
    const fetchPowerPlants = async () => {
      try {
        const response = await api.get('/reference/power_plants');
        setPowerPlants(response.data);
      } catch (error) {
        console.error('Failed to fetch power plants:', error);
      }
    };

    fetchPowerPlants();
  }, []);

  useEffect(() => {
    fetchEnergyData();
  }, []);

  // Build unique options for filters
  const companyOptions = Array.from(
    new Set(data.map((item) => item.companyName))
  ).map((val) => ({ label: val, value: val }));
  const powerPlantOptions = Array.from(
    new Set(data.map((item) => item.powerPlant))
  ).map((val) => ({ label: val, value: val }));
  const generationSourceOptions = Array.from(
    new Set(data.map((item) => item.generationSource))
  ).map((val) => ({
    label: val.charAt(0).toUpperCase() + val.slice(1),
    value: val,
  }));
  const provinceOptions = Array.from(
    new Set(data.map((item) => item.province))
  ).map((val) => ({ label: val, value: val }));
  const statusOptions = [
    { label: "Pending", value: "PND" },
    { label: "Head Approved", value: "HAP" },
    { label: "Site Approved", value: "SAP" },
    { label: "For Revision (Site)", value: "FRS" },
    { label: "For Revision (Head)", value: "FRH" },
  ];

  // Filter data by date and all filters
  const filteredData = data.filter((item) => {
    const itemDate = dayjs(item.date);
    if (startDate && itemDate.isBefore(dayjs(startDate), "day")) return false;
    if (endDate && itemDate.isAfter(dayjs(endDate), "day")) return false;

    if (filters.company && item.companyName !== filters.company) return false;
    if (filters.powerPlant && item.powerPlant !== filters.powerPlant)
      return false;
    if (
      filters.generationSource &&
      item.generationSource !== filters.generationSource
    )
      return false;
    if (filters.province && item.province !== filters.province) return false;
    if (filters.status && item.status !== filters.status) return false;

    return true;
  });

  const paginatedData = filteredData.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const columns = [
    { key: "powerPlant", label: "Power Plant" },
    {
      key: "date",
      label: "Date",
      render: (val) => dayjs(val).format("YYYY-MM-DD"),
    },
    { key: "energyGenerated", label: "Energy Generated (kWh)" },
    { key: "co2Avoidance", label: "CO² Avoidance (Metric Ton)" },
    { key: "status", label: "Status", render: (val) => <StatusChip status={val} /> },
  ];

  const renderActions = (row) => (
    <IconButton size="small">
      <EditIcon />
    </IconButton>
  );

  const handleChangePage = (newPage) => {
    setPage(newPage);
  };

  return (
    <Box sx={{ display: "flex" }}>
      <SideBar />
      <Box sx={{ flexGrow: 1, height: "100vh", overflow: "auto" }}>
        <Container maxWidth={false} disableGutters sx={{ padding: "2rem" }}>
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Box>
              <Typography
                variant="h1"
                sx={{ fontSize: "1.5rem", fontWeight: "bold", mb: 0.5 }}
              >
                REPOSITORY
              </Typography>
              <Typography
                variant="h2"
                sx={{ fontSize: "2rem", fontWeight: "bold", color: "#182959" }}
              >
                Power Generation
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 2, ml: "auto" }}>
              <Button
                variant="contained"
                startIcon={<FileUploadIcon />}
                sx={{ backgroundColor: "#182959" }}
              >
                EXPORT DATA
              </Button>
              <Button 
                variant="contained" 
                sx={{ backgroundColor: "#182959" }}
                onClick={() => setIsImportEnergyModalOpen(true)}>
                IMPORT
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setIsAddEnergyModalOpen(true)}
                sx={{ backgroundColor: "#2B8C37" }}
              >
                ADD RECORD
              </Button>
            </Box>
          </Box>

          {/* Filters */}
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>
            <Filter
              label="Company"
              options={[{ label: "All Companies", value: "" }, ...companyOptions]}
              value={filters.company}
              onChange={(val) => {
                setFilters((prev) => ({ ...prev, company: val }));
                setPage(1);
              }}
              placeholder="Company"
            />
            <Filter
              label="Power Plant"
              options={[{ label: "All Power Plants", value: "" }, ...powerPlantOptions]}
              value={filters.powerPlant}
              onChange={(val) => {
                setFilters((prev) => ({ ...prev, powerPlant: val }));
                setPage(1);
              }}
              placeholder="Power Plant"
            />
            <Filter
              label="Generation Source"
              options={[
                { label: "All Sources", value: "" },
                ...generationSourceOptions,
              ]}
              value={filters.generationSource}
              onChange={(val) => {
                setFilters((prev) => ({ ...prev, generationSource: val }));
                setPage(1);
              }}
              placeholder="Source"
            />
            <Filter
              label="Province"
              options={[{ label: "All Provinces", value: "" }, ...provinceOptions]}
              value={filters.province}
              onChange={(val) => {
                setFilters((prev) => ({ ...prev, province: val }));
                setPage(1);
              }}
              placeholder="Province"
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

          {/* Date Filters */}
          <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Start Date"
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                maxDate={endDate || undefined}
                slotProps={{
                  textField: {
                    size: "small",
                    sx: {
                      width: 150,
                      "& .MuiInputBase-root": { height: 36, fontSize: "0.8rem" },
                      "& .MuiInputLabel-root": { fontSize: "0.75rem" },
                    },
                  },
                }}
              />
              <DatePicker
                label="End Date"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                minDate={startDate || undefined}
                slotProps={{
                  textField: {
                    size: "small",
                    sx: {
                      width: 150,
                      "& .MuiInputBase-root": { height: 36, fontSize: "0.8rem" },
                      "& .MuiInputLabel-root": { fontSize: "0.75rem" },
                    },
                  },
                }}
              />
            </LocalizationProvider>
          </Box>

          {/* Table or fallback */}
          {paginatedData.length === 0 ? (
            <Typography align="center" sx={{ py: 5 }}>
              No records found for the selected filters.
            </Typography>
          ) : (
            <Table
              columns={columns}
              rows={filteredData}
              actions={renderActions}
              emptyMessage="No records found for the selected filters."
            />
          )}

          {/* Pagination */}
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <Pagination
              page={page}
              count={Math.ceil(filteredData.length / rowsPerPage)}
              onChange={handleChangePage}
            />
          </Box>
        </Container>

        {/* Modal */}
        {isAddEnergyModalOpen && (
          <Overlay onClose={() => setIsAddEnergyModalOpen(false)}>
            <AddEnergyGenerationModal
              onClose={() => {
                setIsAddEnergyModalOpen(false);
                fetchEnergyData();
              }}
              powerPlants={powerPlants}  
            />
          </Overlay>
        )}
        {isImportEnergyModalOpen && (
        <Overlay onClose={() => setIsImportEnergyModalOpen(false)}>
          <ImportPowerFileModal
            onClose={() => {
              setIsImportEnergyModalOpen(false);
              fetchEnergyData(); // optional
            }}
          />
        </Overlay>
      )}
      </Box>
    </Box>
  );
}

export default Energy;
