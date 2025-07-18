import AddIcon from "@mui/icons-material/Add";
import ClearIcon from '@mui/icons-material/Clear';
import FileUploadIcon from "@mui/icons-material/FileUpload";
import LaunchIcon from "@mui/icons-material/Launch";
import CheckIcon from '@mui/icons-material/Check';
import {
  Box,
  Button,
  Container,
  IconButton,
  Paper,
  TextField,
  Typography
} from "@mui/material";
import CircularProgress from '@mui/material/CircularProgress';
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
import { useAuth } from "../../contexts/AuthContext";
import ImportPowerModal from "../../components/ImportPowerModal";

function Energy() {
  const [data, setData] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [isAddEnergyModalOpen, setIsAddEnergyModalOpen] = useState(false);
  const [isImportEnergyModalOpen, setIsImportEnergyModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); // 'approve' or 'revise'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showApproveSuccessModal, setShowApproveSuccessModal] = useState(false);
  const [showStatusErrorModal, setShowStatusErrorModal] = useState(false);
  const [showBulkReviseModal, setShowBulkReviseModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showRemarksRequiredModal, setShowRemarksRequiredModal] = useState(false);
  const [remarks, setRemarks] = useState("");
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const listOfStatuses = ["URS","FRS","URH","FRH","APP"];
  const [searchTerm, setSearchTerm] = useState("");


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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getUserRole } = useAuth();
  const {getUserCompanyId} = useAuth();
  const{getUserPowerPlantId}=useAuth();
  const role = getUserRole();
  const companyId = getUserCompanyId();
  const powerPlantId = getUserPowerPlantId();

  // Role-based permissions
  const canEdit = role === 'R05' || role === 'R03' || role === 'R04';
  const canApprove = role === 'R03' || role === 'R04';
  const canAdd = canEdit; 
  const canImport = canEdit; 
  const canExport = canApprove || canEdit;



  const fetchEnergyData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/energy/energy_records_by_status");
      const result = response.data;

      const records = Array.isArray(result) ? result : [result];

      const formattedData = records.map((item) => ({
        energyId: item.energy_id,
        powerPlant: item.power_plant_id,
        companyId:item.company_id,
        companyName: item.company_name,
        generationSource: item.generation_source,
        province: item.province || "",
        date: item.date_generated,
        energyGenerated: parseFloat(item.energy_generated_kwh),
        co2Avoidance: (parseFloat(item.co2_avoidance_kg) / 1000).toFixed(3),
        status: item.status_id,
        status_name: item.status_name,
        remarks:item.remarks
      }));

      setData(formattedData);
    } catch (error) {
      console.error("Error fetching energy data:", error);
      setError("Failed to load energy data.");
    } finally {
      setLoading(false);
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

  const filteredData = data
    .filter((item) => {
      // Fixed filters by role
      if (role === 'R05') {
        if (item.companyId !== companyId || item.powerPlant !== powerPlantId) return false;
      } else if (role === 'R04') {
        if (item.companyId !== companyId) return false;
      }
      return true;
    })
    .filter((item) => {
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

  // Sort the entire filteredData before paginating
  const sortedData = filteredData;
  // Only paginate after sorting the full data
  const paginatedData = sortedData.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  const filteredPowerPlantOptions = useMemo(() => {
  if (role === 'R04') {
    // Find all power plants in the data that match the user's companyId
    const companyPowerPlants = data
      .filter(item => item.companyId === companyId)
      .map(item => item.powerPlant);
    // Remove duplicates
    const uniquePowerPlants = Array.from(new Set(companyPowerPlants));
    return uniquePowerPlants.map(val => ({ label: val, value: val }));
  }
  // Default: show all
  return powerPlantOptions;
}, [role, data, companyId, powerPlantOptions]);

  const columns = [
    { key: "powerPlant", label: "Power Project" },
    {
      key: "date",
      label: "Date",
      render: (val) => dayjs(val).format("YYYY-MM-DD"),
    },
    { key: "energyGenerated", label: "Energy Generated (kWh)" },
    { key: "co2Avoidance", label: "CO² Avoidance (Metric Ton)" },
    { key: "status_name", label: "Status", render: (val) => <StatusChip status={val} /> },
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
        key: "status_name",
        label: "Status"}
  ];

  const renderActions = (row) => (
    <IconButton size="small">
      <EditIcon />
    </IconButton>
  );


  const handleChangePage = (newPage) => {
    setPage(newPage);
  };

// ["URS","FRS","URH","FRH","APP"];
  const fetchNextStatus = (action, currentStatus) => {
    let newStatus = '';
    if (action === 'approve') {
      switch (currentStatus){
        case 'FRS':
          newStatus = listOfStatuses[0]; // "URS"
          break;
        case "URS":
          newStatus = listOfStatuses[2]; // "URH"
          break;
        case 'FRH':
          newStatus = listOfStatuses[2]; // "URH"
          break;
        case 'URH':
          newStatus = listOfStatuses[4]; // "APP"
          break;
      }
    } else if (action === 'revise') {
      switch (currentStatus) {
        case 'URS':
          newStatus = listOfStatuses[1]; // "FRS"
          break;
        case 'URH':
          newStatus = listOfStatuses[3]; // "FRH"
          break;
      }
    }
    return newStatus;
  }
  
const handleApproveConfirm = async () => {
  setIsModalOpen(false);
  // Call the bulk update directly, but skip opening the modal again
  await handleBulkStatusUpdate('approve', { skipModal: true });
};

const handleBulkStatusUpdate = async (action, options = {}) => {
  let currentStatus = null;
  if (selectedRowIds.length > 0) {
    const firstRow = filteredData.find(row => row['energyId'] === selectedRowIds[0]);
    currentStatus = firstRow?.status || null;
  } else {
    setShowStatusErrorModal(true);
    return;
  }

  const newStatus = fetchNextStatus(action, currentStatus);

  if (newStatus) {
    console.log("Updated status to:", newStatus);
  } else {
    console.warn("No matching status transition found.");
  }

  try {
    if (action === 'revise') {
      if (!remarks){
        setShowRemarksRequiredModal(true);
        return;
      }
    } else if (action === 'approve' && !options.skipModal) {
      // Show the modal instead of window.confirm
      setIsModalOpen(true);
      setModalType('approve');
      return; // Wait for modal confirmation
    }

    const payload = {
      record_ids: Array.isArray(selectedRowIds) ? selectedRowIds : [selectedRowIds],
      new_status: newStatus.trim(),
      remarks: remarks.trim(),
    };

    const response = await api.post(
      "/usable_apis/bulk_update_status",
      payload
    );

    // Use the helper function to refresh data
    fetchEnergyData();

    setIsModalOpen(false);
    setSelectedRowIds([]);
    setRemarks("");

    // Show bulk revise modal if action is revise
    if (action === 'revise') {
      setShowBulkReviseModal(true);
    }
    // Show approve success modal if action is approve
    if (action === 'approve') {
      setShowApproveSuccessModal(true);
    }
  } catch (error) {
    console.error("Error updating record status:", error);
    alert(error);
  }  
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

  if (loading) {
    return (
      <Box sx={{ display: "flex", height: "100vh" }}>
        {/* Sidebar (fixed width) */}
        <Box sx={{ width: 240, flexShrink: 0 }}>
          <SideBar />
        </Box>

        {/* Main content area with centered loader */}
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            overflow: "auto",
            padding: "2rem",
          }}
        >
          <Box sx={{ textAlign: "center" }}>
            <CircularProgress size={64} thickness={5} sx={{ color: "#182959" }} />
            <Typography
              sx={{
                mt: 2,
                color: "#182959",
                fontWeight: 700,
                fontSize: 20,
              }}
            >
              Loading Power Generation Data...
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  }
  if (error) return <div>{error}</div>;

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
            {/* Show when no row is selected */}
          {selectedRowIds.length === 0 && (
            <>
              {canExport && (
                <ButtonComp
                  label="Export Data"
                  rounded
                  onClick={() =>
                    exportExcelData(filteredData, exportFields, "Daily Power Generated")
                  }
                  color="blue"
                  startIcon={<FileUploadIcon />}
                />
              )}
              {canImport && !['R04', 'R03'].includes(role) && (
                <ButtonComp
                  label="Import"
                  rounded
                  onClick={() => setIsImportEnergyModalOpen(true)}
                  color="blue"
                />
              )}
              {canAdd && !['R04', 'R03'].includes(role) && (
                <ButtonComp
                  label="Add Record"
                  rounded
                  onClick={() => setIsAddEnergyModalOpen(true)}
                  color="green"
                  startIcon={<AddIcon />}
                />
              )}
            </>
          )}

          {/* Show Export, Approve, and Revise when rows are selected and user can approve/export */}
          {selectedRowIds.length > 0 && (
            <>
              <Typography sx={{ fontWeight: 600, color: '#182959', fontSize: '1rem', mr: 2 }}>
                {selectedRowIds.length} record{selectedRowIds.length > 1 ? 's' : ''} selected
              </Typography>
              {canExport && (
                <ButtonComp
                  label="Export Selected"
                  rounded
                  onClick={() => {
                    const selectedData = filteredData.filter(row => selectedRowIds.includes(row.energyId));
                    exportExcelData(selectedData, exportFields, "Selected Power Generated");
                  }}
                  color="blue"
                  startIcon={<FileUploadIcon />}
                />
              )}
              {canApprove && (
                <>
                  {(() => {
                    // Role-based approve button visibility for selection
                    const records = selectedRowIds.map(id => data.find(r => r.energyId === id)).filter(Boolean);
                    const statusList = records.map(record => record.status);
                    const allSameStatus = statusList.length > 0 && statusList.every(status => status === statusList[0]);
                    let canShowApprove = false;
                    if (role === 'R04') {
                      canShowApprove = allSameStatus && ['URS'].includes(statusList[0]);
                    } else if (role === 'R03') {
                      canShowApprove = allSameStatus && ['URH'].includes(statusList[0]);
                    } else {
                      canShowApprove = canApprove && allSameStatus && statusList[0] !== 'APP';
                    }
                    return canShowApprove ? (
                      <ButtonComp
                        label="Approve"
                        rounded
                        onClick={() => {
                          setSelectedRecords(records);
                          setStatuses(statusList);
                          setModalType('approve');
                          setIsModalOpen(true);
                        }}
                        color="green"
                        startIcon={<CheckIcon />}
                      />
                    ) : null;
                  })()}
                  {(() => {
                    // Role-based revise button visibility for selection
                    const records = selectedRowIds.map(id => data.find(r => r.energyId === id)).filter(Boolean);
                    const statusList = records.map(record => record.status);
                    const allSameStatus = statusList.length > 0 && statusList.every(status => status === statusList[0]);
                    let canShowRevise = false;
                    if (role === 'R04') {
                      canShowRevise = allSameStatus && ['URS'].includes(statusList[0]);
                    } else if (role === 'R03') {
                      canShowRevise = allSameStatus && ['URH'].includes(statusList[0]);
                    } else {
                      canShowRevise = canApprove && allSameStatus && statusList[0] !== 'APP' && !['FRS', 'FRH'].includes(statusList[0]);
                    }
                    return canShowRevise ? (
                      <ButtonComp
                        label="Revise"
                        rounded
                        onClick={() => {
                          setSelectedRecords(records);
                          setStatuses(statusList);
                          setModalType('revise');
                          setIsModalOpen(true);
                        }}
                        color="blue"
                      />
                    ) : null;
                  })()}
                </>
              )}
            </>
          )}
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
              style={{ display: role === 'R03' ? 'block' : 'none' }}
            />
            {role === 'R03' && (
              <Filter label="Company" placeholder="Company" options={[{ label: "All Companies", value: "" }, ...companyOptions]} value={filters.company} onChange={(val) => { setFilters((prev) => ({ ...prev, company: val })); setPage(1); }} />
            )}
            {(role === 'R03' || role === 'R04') && (
              <Filter
                label="Power Project"
                placeholder="Power Project"
                options={[{ label: "All Power Projects", value: "" }, ...filteredPowerPlantOptions]}
                value={filters.powerPlant}
                onChange={(val) => { setFilters((prev) => ({ ...prev, powerPlant: val })); setPage(1); }}
              />
            )}

            {role === 'R03' && (
              <Filter label="Generation Source" placeholder="Source" options={[{ label: "All Sources", value: "" }, ...generationSourceOptions]} value={filters.generationSource} onChange={(val) => { setFilters((prev) => ({ ...prev, generationSource: val })); setPage(1); }} />
            )}
            {role === 'R03' && (
              <Filter label="Province" placeholder="Province" options={[{ label: "All Provinces", value: "" }, ...provinceOptions]} value={filters.province} onChange={(val) => { setFilters((prev) => ({ ...prev, province: val })); setPage(1); }} />
            )}
            <Filter label="Status" placeholder="Status" options={[{ label: "All Status", value: "" }, ...statusOptions]} value={filters.status} onChange={(val) => { setFilters((prev) => ({ ...prev, status: val })); setPage(1); }} />
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
              idKey="energyId"
              onSelectionChange={(selectedRows) => {
                setTimeout(() => {
                  setSelectedRowIds(selectedRows);
                }, 0);
              }}
              columns={columns}
              rows={sortedData}
              filteredData={filteredData}
              rowsPerPage={rowsPerPage}
              emptyMessage="No energy data found."
              maxHeight={'75vh'}
              scrollable
              actions={(row) => (
                <IconButton size="small" onClick={() => handleOpen(row)}>
                 <LaunchIcon />
                </IconButton>
              )}
              page={page}
            />
          )}



          {/* Pagination */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
            {/* Row Count Display */}
            <Typography sx={{ fontSize: '0.85rem'}}>
              Showing {filteredData.length} {filteredData.length === 1 ? 'record' : 'records'}
            </Typography>
            <Pagination 
              page={page}
              count={Math.ceil(filteredData.length / rowsPerPage)}
              onChange={handleChangePage}
            />
            <Typography sx={{ fontSize: '0.85rem'}}>
              Showing {Math.min((page - 1) * rowsPerPage + 1, filteredData.length)}–
              {Math.min(page * rowsPerPage, filteredData.length)} records
            </Typography>
          </Box>
        </Container>


      {/* Modals */}
      {isModalOpen && modalType === 'approve' && (
        <Overlay onClose={() => setIsModalOpen(false)}>
          <Paper
            sx={{
              p: 4,
              width: "500px",
              borderRadius: "16px",
              bgcolor: "white",
            }}
          >
            <Typography sx={{ fontSize: '2rem', color: '#182959', fontWeight: 800}}>
              Approval Confirmation
            </Typography>
            <Box sx={{
              bgcolor: '#f5f5f5',
              p: 2,
              borderRadius: '8px',
              width: '100%',
              mb: 3
            }}>
              {selectedRowIds.map((id, idx) => (
                <Typography key={id} sx={{ fontSize: '0.9rem', mb: 1 }}>
                  <strong>ID:</strong> {id} | <strong>Status:</strong> {statuses[idx]}
                </Typography>
              ))}
            </Box>
            <Box sx={{
              display: 'flex',
              justifyContent: 'flex-end'
            }}>
              <Button 
                sx={{ 
                  color: '#182959',
                  borderRadius: '999px',
                  padding: '9px 18px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  '&:hover': {
                    color: '#0f1a3c',
                  },
                }}
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                variant='contained'
                sx={{ 
                  marginLeft: 1,
                  backgroundColor: '#2B8C37',
                  borderRadius: '999px',
                  padding: '9px 18px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  '&:hover': {
                    backgroundColor: '#256d2f',
                  },
                }}
                onClick={handleApproveConfirm}
              >
                Confirm
              </Button>
            </Box>
          </Paper>
        </Overlay>
      )}
      {isModalOpen && modalType === 'revise' && (
        <Overlay onClose={() => setIsModalOpen(false)}>
          <Paper
            sx={{
              p: 4,
              width: "500px",
              borderRadius: "16px",
              bgcolor: "white",
            }}
          >
            <Typography sx={{ fontSize: '2rem', color: '#182959', fontWeight: 800}}>
              Revision Request
            </Typography>
            <TextField
              sx={{
                mt: 2,
                mb: 2
              }}
              label={<> Remarks <span style={{ color: 'red' }}>*</span> </>}
              variant="outlined"
              fullWidth
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              multiline
            />
            <Box sx={{
              display: 'flex',
              justifyContent: 'flex-end'
            }}>
              <Button 
                sx={{ 
                  color: '#182959',
                  borderRadius: '999px',
                  padding: '9px 18px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  '&:hover': {
                    color: '#0f1a3c',
                  },
                }}
                onClick={() => {setIsModalOpen(false); setRemarks("");}}
              >
                Cancel
              </Button>
              <Button 
                variant='contained'
                sx={{ 
                  marginLeft: 1,
                  backgroundColor: '#2B8C37',
                  borderRadius: '999px',
                  padding: '9px 18px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  '&:hover': {
                    backgroundColor: '#256d2f',
                  },
                }}
                onClick={() => handleBulkStatusUpdate("revise")}
              >
                Confirm
              </Button>
            </Box>
          </Paper>
        </Overlay>          
      )}
      {showApproveSuccessModal && (
        <Overlay onClose={() => setShowApproveSuccessModal(false)}>
          <Paper sx={{
            p: 4,
            width: '400px',
            borderRadius: '16px',
            bgcolor: 'white',
            outline: 'none',
            textAlign: 'center'
          }}>
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 3
            }}>
              <Box sx={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: '#2B8C37',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2
              }}>
                <Typography sx={{ 
                  color: 'white', 
                  fontSize: '2rem',
                  fontWeight: 'bold'
                }}>
                  ✓
                </Typography>
              </Box>
              <Typography sx={{ 
                fontSize: '1.5rem', 
                fontWeight: 800,
                color: '#182959',
                mb: 2
              }}>
                Record(s) Approved Successfully!
              </Typography>
              <Typography sx={{ 
                fontSize: '1rem',
                color: '#666',
                mb: 3
              }}>
                The selected record(s) have been successfully approved.
              </Typography>
            </Box>
            <Box sx={{
              display: 'flex',
              justifyContent: 'center',
              mt: 3
            }}>
              <Button
                variant="contained"
                sx={{ 
                  backgroundColor: '#2B8C37',
                  borderRadius: '999px',
                  padding: '10px 24px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  '&:hover': {
                    backgroundColor: '#256d2f',
                  },
                }}
                onClick={() => setShowApproveSuccessModal(false)}
              >
                OK
              </Button>
            </Box>
          </Paper>
        </Overlay>
      )}
      {showStatusErrorModal && (
        <Overlay onClose={() => setShowStatusErrorModal(false)}>
          <Paper
            sx={{
              p: 4,
              width: "400px",
              borderRadius: "16px",
              bgcolor: "white",
              outline: "none",
              textAlign: "center"
            }}
          >
            <Typography sx={{ fontSize: '1.5rem', color: '#b91c1c', fontWeight: 800, mb: 2 }}>
              Error
            </Typography>
            <Typography sx={{ fontSize: '1rem', color: '#333', mb: 3 }}>
              Selected rows have different statuses. Please select rows with the same status to proceed.
            </Typography>
            <Button
              variant="contained"
              sx={{
                backgroundColor: '#b91c1c',
                borderRadius: '999px',
                padding: '10px 24px',
                fontSize: '1rem',
                fontWeight: 'bold',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#991b1b',
                },
              }}
              onClick={() => setShowStatusErrorModal(false)}
            >
              OK
            </Button>
          </Paper>
        </Overlay>
      )}
      {showBulkReviseModal && (
        <Overlay onClose={() => setShowBulkReviseModal(false)}>
          <Paper sx={{
            p: 4,
            width: '400px',
            borderRadius: '16px',
            bgcolor: 'white',
            outline: 'none',
            textAlign: 'center'
          }}>
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 3
            }}>
              <Box sx={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: '#182959',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2
              }}>
                <Typography sx={{ 
                  color: 'white', 
                  fontSize: '2rem',
                  fontWeight: 'bold'
                }}>
                  ✓
                </Typography>
              </Box>
              <Typography sx={{ 
                fontSize: '1.5rem', 
                fontWeight: 800,
                color: '#182959',
                mb: 2
              }}>
                Revision Requested!
              </Typography>
              <Typography sx={{ 
                fontSize: '1rem',
                color: '#666',
                mb: 3
              }}>
                The selected record(s) have been sent for revision.
              </Typography>
            </Box>
            <Box sx={{
              display: 'flex',
              justifyContent: 'center',
              mt: 3
            }}>
              <Button
                variant="contained"
                sx={{ 
                  backgroundColor: '#182959',
                  borderRadius: '999px',
                  padding: '10px 24px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  '&:hover': {
                    backgroundColor: '#0f1a3c',
                  },
                }}
                onClick={() => setShowBulkReviseModal(false)}
              >
                OK
              </Button>
            </Box>
          </Paper>
        </Overlay>
      )}
      {showRemarksRequiredModal && (
        <Overlay onClose={() => setShowRemarksRequiredModal(false)}>
          <Paper sx={{
            p: 4,
            width: '400px',
            borderRadius: '16px',
            bgcolor: 'white',
            outline: 'none',
            textAlign: 'center'
          }}>
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 3
            }}>
              <Box sx={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: '#f44336',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2
              }}>
                <Typography sx={{ 
                  color: 'white', 
                  fontSize: '2rem',
                  fontWeight: 'bold'
                }}>
                  !
                </Typography>
              </Box>
              <Typography sx={{ 
                fontSize: '1.5rem', 
                fontWeight: 800,
                color: '#182959',
                mb: 2
              }}>
                Remarks Required
              </Typography>
              <Typography sx={{ 
                fontSize: '1rem',
                color: '#666',
                mb: 3
              }}>
                Remarks is required for the status update.
              </Typography>
            </Box>
            <Box sx={{
              display: 'flex',
              justifyContent: 'center',
              mt: 3
            }}>
              <Button
                variant="contained"
                sx={{ 
                  backgroundColor: '#f44336',
                  borderRadius: '999px',
                  padding: '10px 24px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  '&:hover': {
                    backgroundColor: '#d32f2f',
                  },
                }}
                onClick={() => setShowRemarksRequiredModal(false)}
              >
                OK
              </Button>
            </Box>
          </Paper>
        </Overlay>
      )}
      {open && selectedRecord && (
        <Overlay onClose={handleClose}>
        <ViewEditEnergyModal
          title="Daily Power Generation"
          energyId={selectedRecord.energyId}
          powerplantId={selectedRecord.powerPlant}
          companyName={selectedRecord.companyName}  
          status={selectedRecord.status_name}
          remarks={selectedRecord.remarks}
          updatePath="/energy/edit"
          onClose={handleClose}
          updateStatus={(updated) => {
            if (updated) fetchEnergyData();
          }}
          canEdit={
            role === 'R05'
              ? ['FRS', 'URS'].includes(selectedRecord.status)
              : role === 'R04'
                ? ['URH', 'FRH'].includes(selectedRecord.status)
                : role === 'R03'
                  ? false
                  : canEdit
          }
          canApprove={
            role === 'R04'
              ? ['URS'].includes(selectedRecord.status)
              : role === 'R03'
                ? ['URH'].includes(selectedRecord.status)
                : canApprove
          }
          role={role}
          power_plant_id={powerPlantId}
          company_id={companyId}
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
              companyId={companyId}
              powerPlantId={powerPlantId}
            />
          </Overlay>
        )}
        {isImportEnergyModalOpen && (
          <Overlay onClose={() => setIsImportEnergyModalOpen(false)}>
            <ImportPowerModal
                  title="Daily Generation"
                  downloadPath="/energy/download_template"
                  uploadPath="/energy/upload_energy_file"
                  onClose={() => {
                            setIsImportEnergyModalOpen(false);
                            fetchEnergyData();
                          }} 
                  companyId={companyId}
                  powerPlantId={powerPlantId}
                />
          </Overlay>
        )}
      </Box>
    </Box>
  );
}

export default Energy;
