import AddIcon from "@mui/icons-material/Add";
import ClearIcon from '@mui/icons-material/Clear';
import FileUploadIcon from "@mui/icons-material/FileUpload";
import LaunchIcon from "@mui/icons-material/Launch";
import {
  Box,
  Button,
  Container,
  IconButton,
  Typography
} from "@mui/material";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import AddEnergyGeneratedModal from "../../components/AddPowerGeneratedModal";
import ButtonComp from "../../components/ButtonComp";
import DateRangePicker from "../../components/Filter/DateRangePicker";
import Filter from "../../components/Filter/Filter";
import Search from "../../components/Filter/Search";
import ImportFileModal from "../../components/ImportFileModal";
import Overlay from "../../components/modal";
import Pagination from "../../components/Pagination/pagination";
import RepositoryHeader from "../../components/RepositoryHeader";
import SideBar from "../../components/Sidebar";
import StatusChip from "../../components/StatusChip";
import Table from "../../components/Table/Table";
import api from '../../services/api';
import { exportExcelData } from "../../services/directExport";
import ViewEditEnergyModal from "../../components/ViewEditEnergyModal";

function Energy() {
  const [data, setData] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [isAddEnergyModalOpen, setIsAddEnergyModalOpen] = useState(false);
  const [isImportEnergyModalOpen, setIsImportEnergyModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
    const [sortConfig, setSortConfig] = useState({
    key: 'date',
    direction: 'desc'
  });

  const [filters, setFilters] = useState({
    company: "",
    powerPlant: "",
    generationSource: "",
    province: "",
    status: "",
  });

  const isFiltering = useMemo(() => {
    return (
      Object.values(filters).some(v => v !== null && v !== '') ||
      startDate !== null ||
      endDate !== null
    );
  }, [filters, startDate, endDate]);
    const [open, setOpen] = useState(false);



  const handleOpen = (record) => {
    setSelectedRecord(record);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedRecord(null);
  };


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
    { label: "Under Review (Site)", value: "URS" },
    { label: "Under Review (Head)", value: "URH" },
    { label: "Approved", value: "APP" },
    { label: "For Revision (Site)", value: "FRS" },
    { label: "For Revision (Head)", value: "FRH" },
  ];

  const filteredData = data.filter((item) => {
    const itemDate = dayjs(item.date);
    const searchMatch =
      searchTerm === "" ||
      Object.values(item).some(val =>
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      );

    if (!searchMatch) return false;
    if (startDate && itemDate.isBefore(dayjs(startDate), "day")) return false;
    if (endDate && itemDate.isAfter(dayjs(endDate), "day")) return false;
    if (filters.company && item.companyName !== filters.company) return false;
    if (filters.powerPlant && item.powerPlant !== filters.powerPlant) return false;
    if (filters.generationSource && item.generationSource !== filters.generationSource) return false;
    if (filters.province && item.province !== filters.province) return false;
    if (filters.status && item.status !== filters.status) return false;

    return true;
  });

  const paginatedData = filteredData.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const columns = [
    { key: "powerPlant", label: "Power Project" },
    {
      key: "date",
      label: "Date",
      render: (val) => dayjs(val).format("YYYY-MM-DD"),
    },
    { key: "energyGenerated", label: "Energy Generated (kWh)" },
    { key: "co2Avoidance", label: "CO² Avoidance (Metric Ton)" },
    { key: "status", label: "Status", render: (val) => <StatusChip status={val} /> },
  ];

    const exportFields = [
    { key: "powerPlant", label: "Power Project" },
     { key: "companyName", label: "Company" },
     { key: "generationSource", label: "Source" },
     { key: "province", label: "Location" },
    {
      key: "date",
      label: "Date",
      render: (val) => dayjs(val).format("MM-DD-YYYY"),
    },
    { key: "energyGenerated", label: "Energy Generated (kWh)" },
    { key: "co2Avoidance", label: "CO² Avoidance (Metric Ton)" },
    {
        key: "status",
        label: "Status",
        render: (val) => {
          const match = statusOptions.find((opt) => opt.value === val);
          return match ? match.label : val;
        }}
  ];

  const renderActions = (row) => (
    <IconButton size="small">
      <EditIcon />
    </IconButton>
  );

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
    setPage(1); // Reset to first page on sort
  };

  const handleChangePage = (newPage) => {
    setPage(newPage);
  };

  useEffect(() => {
    const calculateRowsPerPage = () => {
      const vh = window.innerHeight;
      const rowHeight = 48; // Approximate row height in px (depends on your styling)
      const headerFooterHeight = 200; // Adjust based on your layout (header, pagination, etc.)
      const availableHeight = vh * 0.75 - headerFooterHeight;

      const calculatedRows = Math.floor(availableHeight / rowHeight);
      setRowsPerPage(Math.max(calculatedRows, 10));
    };

    calculateRowsPerPage();
    window.addEventListener('resize', calculateRowsPerPage);
    return () => window.removeEventListener('resize', calculateRowsPerPage);
  }, []);

  return (
    <Box sx={{ display: "flex" }}>
      <SideBar />
      <Box sx={{ flexGrow: 1, height: "100vh", overflow: "auto" }}>
        <Container maxWidth={false} disableGutters sx={{ padding: "2rem" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Box>
            <RepositoryHeader
                label="REPOSITORY"
                title="Power Generation"
              />
            </Box>


            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 2,
                justifyContent: { xs: "center", sm: "flex-end" },
                alignItems: "center",
                width: "100%",
              }}
            >
              <ButtonComp
                label="Export Data"
                rounded={true}
                onClick={() => exportExcelData(filteredData, exportFields, "Daily Power Generated")}
                color="blue"
                startIcon={<FileUploadIcon />}
              />    

              <ButtonComp
                label="Import"
                rounded={true}
                onClick={() => setIsImportEnergyModalOpen(true)}
                color="blue"
              />

              <ButtonComp
                label="Add Record"
                rounded={true}
                onClick={() => setIsAddEnergyModalOpen(true)}
                color="green"
                startIcon={<AddIcon />}
              />
            </Box>

          </Box>

          {/* Filters */}
          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>
            <Search
              value={searchTerm}
              onSearch={(val) => {
                setSearchTerm(val);
                setPage(1);
              }}
              suggestions={[
                ...new Set([
                  ...data.map((row) => row.companyName).filter(Boolean),
                  ...data.map((row) => row.powerPlant).filter(Boolean),
                  ...data.map((row) => String(row.date)).filter(Boolean),
                  ...data.map((row) => row.generationSource).filter(Boolean),
                  ...data.map((row) => row.province).filter(Boolean),
                ]),
              ]}
            />
            <Filter label="Company" placeholder="Company" options={[{ label: "All Companies", value: "" }, ...companyOptions]} value={filters.company} onChange={(val) => { setFilters((prev) => ({ ...prev, company: val })); setPage(1); }} />
            <Filter label="Power Project" placeholder="Power Project" options={[{ label: "All Power Projects", value: "" }, ...powerPlantOptions]} value={filters.powerPlant} onChange={(val) => { setFilters((prev) => ({ ...prev, powerPlant: val })); setPage(1); }} />
            <Filter label="Generation Source" placeholder="Source" options={[{ label: "All Sources", value: "" }, ...generationSourceOptions]} value={filters.generationSource} onChange={(val) => { setFilters((prev) => ({ ...prev, generationSource: val })); setPage(1); }} />
            <Filter label="Status" placeholder="Status" options={[{ label: "All Statuses", value: "" }, ...statusOptions]} value={filters.status} onChange={(val) => { setFilters((prev) => ({ ...prev, status: val })); setPage(1); }} />
            <DateRangePicker
              label="Date Range"
              startDate={startDate}
              endDate={endDate}
              setStartDate={setStartDate}
              setEndDate={setEndDate}
            />
            {(isFiltering || startDate || endDate ) && (
              <Button
                variant="outline"
                startIcon={<ClearIcon />}
                sx={{ 
                  color: '#182959',
                  borderRadius: '999px',
                  padding: '9px 18px',
                  fontSize: '0.85rem',
                  fontWeight: 'bold',
                }}
                onClick={() => {
                  setFilters({
                    company: '',
                    powerPlant: '',
                    generationSource: '',
                    province: '',
                    status: '',
                  });
                  setStartDate(null);
                  setEndDate(null);
                  setPage(1);
                }}
              >
                Clear Filters
              </Button>
            )}
  
          </Box>

          {/* Table */}
          {paginatedData.length === 0 ? (
            <Typography align="center" sx={{ py: 5 }}>
              No records found for the selected filters.
            </Typography>
          ) : (
            <Table
              columns={columns}
              rows={paginatedData}
              rowsPerPage={rowsPerPage}
              onSort={handleSort}
              sortConfig={sortConfig}
              emptyMessage="No energy data found."
              maxHeight={'75vh'}
              scrollable
              actions={(row) => (
                <IconButton size="small" onClick={() => handleOpen(row)}>
                 <LaunchIcon />
                </IconButton>
              )}
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


      {/* Modals */}
      {open && selectedRecord && (
        <Overlay onClose={handleClose}>
        <ViewEditEnergyModal
          title="Daily Power Generation"
          energyId={selectedRecord.energyId}
          powerplantId={selectedRecord.powerPlant}
          companyName={selectedRecord.companyName}  
          status = {selectedRecord.status}
          updatePath="/energy/update"
          onClose={handleClose}
          updateStatus={(updated) => {
            if (updated) fetchEnergyData();
          }}
        />
        </Overlay>
      )}

        {isAddEnergyModalOpen && (
          <Overlay onClose={() => setIsAddEnergyModalOpen(false)}>
            <AddEnergyGeneratedModal
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
            <ImportFileModal
                  title="Daily Generation"
                  downloadPath=""
                  uploadPath=""
                  onClose={() => {
                            setIsImportEnergyModalOpen(false);
                            fetchEnergyData();
                          }} 
                />
          </Overlay>
        )}
      </Box>
    </Box>
  );
}

export default Energy;
