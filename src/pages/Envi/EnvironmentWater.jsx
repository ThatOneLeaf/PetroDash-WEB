import { useMemo, useState, useEffect } from 'react';
import {
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Box,
  TextField,
  Select,
  MenuItem,
  Container,
  Typography,
} from '@mui/material';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import AddIcon from '@mui/icons-material/Add';
import LaunchIcon from '@mui/icons-material/Launch';
import ClearIcon from '@mui/icons-material/Clear';
import api from '../../services/api';
import Overlay from '../../components/modal';
import Sidebar from '../../components/Sidebar';
import AddAbstractionModal from '../../components/envi_components/AddWaterAbstractionModal';
import AddDischargedModal from '../../components/envi_components/AddWaterDischargedModal';
import AddConsumptionModal from '../../components/envi_components/AddWaterConsumptionModal';
import ImportFileModal from '../../components/ImportFileModal';
import CustomTable from '../../components/Table/Table';
import StatusChip from "../../components/StatusChip";
import Pagination from '../../components/Pagination/pagination';
import Filter from '../../components/Filter/Filter';
import Search from '../../components/Filter/Search';
import ViewEditRecordModal from '../../components/envi_components/ViewEditEnviModal';
import CircularProgress from '@mui/material/CircularProgress';

function EnvironmentWater() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selected, setSelected] = useState('Abstraction'); // Default selection
  const [isImportdModalOpen, setIsImportModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null); // New
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const [updatePath, setUpdatePath] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [remarks, setRemarks] = useState("");
  const statuses = ["URS","FRS","URH","FRH","APP"];
  const [sortConfig, setSortConfig] = useState({
    key: 'year',
    direction: 'desc'
  });
  
  const rowsPerPage = 10;

  const [filters, setFilters] = useState({
    year: '',
    quarter: '',
    company: '',
    status: '',
    month: '',
  });

  const resetFiltersToNull = () => {
    const nullFilters = Object.keys(filters).reduce((acc, key) => {
      acc[key] = null;
      return acc;
    }, {});
    setFilters(nullFilters);
  };

  const isFiltering = useMemo(() => {
    return Object.values(filters).some(v => v !== null && v !== '');
  }, [filters]);

  useEffect(() => {
    if (selected === 'Abstraction') {
      setUpdatePath('/edit_water_abstraction');
      fetchAbstractionData();
    }
    if (selected === 'Discharged') {
      setUpdatePath('/edit_water_discharge')
      fetchDischargedData();
    }
    if (selected === 'Consumption') {
      setUpdatePath('/edit_water_consumption')
      fetchConsumptionData();
    }
  }, [selected]);

  const fetchAbstractionData = async () => {
    try {
      setLoading(true);
      const response = await api.get('environment/water_abstraction_records'); 
      console.log('Water Abstraction data from API:', response.data);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching water abstraction data:', error);
      setError('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  const fetchDischargedData = async () => {
    try {
      setLoading(true);
      const response = await api.get('environment/water_discharge'); 
      console.log('Water Discharge data from API:', response.data);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching water discharge data:', error);
      setError('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  const fetchConsumptionData = async () => {
    try {
      setLoading(true);
      const response = await api.get('environment/water_consumption'); 
      console.log('Water Consumption data from API:', response.data);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching water consumption data:', error);
      setError('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to refresh data based on selected tab
  const refreshCurrentData = () => {
    if (selected === 'Abstraction') {
      fetchAbstractionData();
    } else if (selected === 'Discharged') {
      fetchDischargedData();
    } else if (selected === 'Consumption') {
      fetchConsumptionData();
    }
  };

  // Handler for closing import modal with refresh
  const handleImportModalClose = (shouldRefresh = false) => {
    setIsImportModalOpen(false);
    if (shouldRefresh) {
      refreshCurrentData();
    }
  };

  const columns = useMemo(() => {
    if (!Array.isArray(data) || data.length === 0 || typeof data[0] !== 'object') return [];

    return Object.keys(data[0])
      .slice(1) // Exclude the first column (e.g., ID)
      .map((key) => {
        if (key === 'status') {
          return {
            key,
            label: 'Status',
            render: (row) => {
            return <StatusChip status={row} />;
          }

          };
        }

        return {
          key,
          label: key.charAt(0).toUpperCase() + key.slice(1),
        };
      });
  }, [data]);

  const generateOptions = (data, field, sortFn = (a, b) => a.localeCompare(b)) => {
    const set = new Set(
      data
        .map(row => row[field])
        .filter(value => value && value !== 'N/A') // Remove falsy values and "N/A"
    );
    const array = Array.from(set);
    
    if (field === 'year') {
      return array
        .map(year => parseInt(year, 10))
        .filter(year => !isNaN(year))
        .sort((a, b) => a - b)
        .map(year => ({ label: year, value: year }));
    }

    if (field === 'month') {
      const monthOrder = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      return array
        .sort((a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b))
        .map(month => ({ label: month, value: month }));
    }

    return array.sort(sortFn).map(item => ({ label: item, value: item }));
  };


  const companyOptions = useMemo(() => generateOptions(data, 'company'), [data]);
  const yearOptions = useMemo(() => generateOptions(data, 'year'), [data]);
  const quarterOptions = useMemo(() => generateOptions(data, 'quarter'), [data]);
  const statusOptions = useMemo(() => generateOptions(data, 'status'), [data]);
  const monthOptions = useMemo(() => generateOptions(data, 'month'), [data]);

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortedData = (dataToSort = data) => {
    const sortedData = [...dataToSort].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sortedData;
  };

  const getFilteredData = () => {
    return data.filter((item) => {
      const matchesSearch =
        !searchQuery ||
        Object.values(item).some((val) =>
          val?.toString().toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesCompany = !filters.company || item.company === filters.company;
      const matchesYear = !filters.year || Number(item.year) === Number(filters.year);
      const matchesQuarter = !filters.quarter || item.quarter === filters.quarter;
      const matchesStatus = !filters.status || item.status === filters.status;
      const matchesMonth = !filters.month || item.month === filters.month;

      return matchesSearch && matchesCompany && matchesYear && 
      matchesQuarter && matchesStatus && matchesMonth;
    });
  };

  const suggestions = useMemo(() => {
    const uniqueValues = new Set();
    data.forEach((item) => {
      Object.values(item).forEach((val) => {
        if (val) uniqueValues.add(val.toString());
      });
    });
    return Array.from(uniqueValues);
  }, [data]);

  const filteredData = useMemo(() => getFilteredData(), [data, filters, searchQuery]);

  const sortedData = useMemo(() => getSortedData(filteredData), [filteredData, sortConfig]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return sortedData.slice(start, start + rowsPerPage);
  }, [sortedData, page]);

  const totalPages = Math.ceil(getFilteredData().length / rowsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const exportToExcel = async (filteredData) => {
    try {
      const response = await api.post(
        'environment/export_excel',
        filteredData,
        {
          responseType: 'blob', // ensures the response is treated as binary
        }
      );
  
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
  
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'exported_water_data.xlsx';
      a.click();
  
      // Clean up
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export Excel:', error);
    }
  };

  const getRecordID = (record) => {
    if (record && typeof record === 'object') {
      const firstKey = Object.keys(record)[0];
      return record[firstKey];
    }
    return null;
  };

  const fetchNextStatus = (action, currentStatus) => {
    let newStatus = '';
    if (action === 'approve') {
      switch (currentStatus){
        case 'For Revision (Site)':
          newStatus = statuses[0]; // "URS"
          break;
        case 'Under review (site)':
        case 'For Revision (Head)':
          newStatus = statuses[2]; // "URH"
          break;
        case 'Under review (head level)':
          newStatus = statuses[4]; // "APP"
          break;
      }
    } else if (action === 'revise') {
      switch (currentStatus) {
        case 'Under review (site)':
          newStatus = statuses[1]; // "FRS"
          break;
        case 'Under review (head level)':
          newStatus = statuses[3]; // "FRH"
          break;
      }
    }
    return newStatus;
  }

  //statuses = ["URS","FRS","URH","FRH","APP"]
  const handleBulkStatusUpdate = async (action) => {

    //Check if the selected row ids status are the same
    const isSame = areSelectedStatusesSame();
    let currentStatus = null;
    if (isSame && selectedRowIds.length > 0) {
      // Get the status from the first selected row
      const firstRow = filteredData.find(row => row[idKey] === selectedRowIds[0]);
      currentStatus = firstRow?.status || null;
      } else {
      alert("Selected rows have different statuses.");
      return; // Optionally stop if not the same
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
          alert('Remarks is required for the status update')
          return;
        }
      } else {
        const confirm = window.confirm('Are you sure you want to approve this record?');
          if (!confirm) return;
      }

      const payload = {
        record_ids: Array.isArray(selectedRowIds) ? selectedRowIds : [selectedRowIds],
        new_status: newStatus.trim(),
        remarks: remarks.trim(),
      };

      console.log(payload);

      const response = await api.post(
        "/usable_apis/bulk_update_status",
        payload
      );

      alert(response.data.message);

      // Use the helper function to refresh data
      refreshCurrentData();

      setIsModalOpen(false);
      setSelectedRowIds([]);
      setRemarks("");
    } catch (error) {
      console.error("Error updating record status:", error);
      alert(error?.response?.data?.detail || "Update Status Failed.");
    }  
  };

  if (loading) return (
    <Box sx={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', height: '100vh', bgcolor: '#f5f7fa' }}>
      <Box sx={{ textAlign: 'center' }}>
        <CircularProgress size={64} thickness={5} sx={{ color: '#2B8C37' }} />
        <Typography sx={{ mt: 2, color: '#2B8C37', fontWeight: 700, fontSize: 20 }}>
          Loading Water Data...
        </Typography>
      </Box>
    </Box>
  );
  if (error) return <div>{error}</div>;

  const idKey = filteredData.length > 0
  ? filteredData[0].wa_id !== undefined
    ? 'wa_id'
    : filteredData[0].wd_id !== undefined
      ? 'wd_id'
      : filteredData[0].wc_id !== undefined
        ? 'wc_id'
        : 'id'
  : 'id';

  const areSelectedStatusesSame = () => {
    if (!selectedRowIds.length) return false;
    const selectedStatuses = selectedRowIds
      .map(id => filteredData.find(row => row[idKey] === id))
      .filter(Boolean)
      .map(row => row.status);

    return selectedStatuses.every(status => status === selectedStatuses[0]);
  };

  const isApprove = selectedRowIds
    .map(id => filteredData.find(row => row[idKey] === id))
    .filter(Boolean)
    .every(row => row.status === 'Approved');

  const allowedStatuses = ['For Revision (Site)', 'For Revision (Head)'];
  const isForRevision = selectedRowIds
    .map(id => filteredData.find(row => row[idKey] === id))
    .filter(Boolean)
    .every(row => allowedStatuses.includes(row.status));

  const selectedRows = filteredData.filter(row => selectedRowIds.includes(row[idKey]));

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Container maxWidth={false} disableGutters sx={{ height: '100vh', overflow: 'auto', padding: '2rem', flexGrow: 1 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.5rem',
        }}>
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start'}}>
            <Typography sx={{ 
              fontSize: '0.75rem', 
              fontWeight: 800,
            }}>
              REPOSITORY
            </Typography>
            <Typography sx={{ fontSize: '2.25rem', color: '#182959', fontWeight: 800}}>
              Environment - Water
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: '0.5rem' }}>
            {selectedRowIds.length > 0 && !isApprove ? (
              <>
                <Button 
                  variant='contained'
                  sx={{ 
                    backgroundColor: '#2B8C37',
                    borderRadius: '999px',
                    padding: '9px 18px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    '&:hover': {
                      backgroundColor: '#256d2f',
                    },
                  }}
                  onClick={() => handleBulkStatusUpdate("approve")}
                >
                  Approve
                </Button>
                {(selectedRowIds.length > 0 && !isForRevision) && (
                  <Button 
                    variant='contained'
                    sx={{ 
                      backgroundColor: '#182959',
                      borderRadius: '999px',
                      padding: '9px 18px',
                      fontSize: '1rem',
                      fontWeight: 'bold',
                      '&:hover': {
                        backgroundColor: '#0f1a3c',
                      },
                    }}
                    onClick={() => setIsModalOpen(true)}
                  >
                    Revise
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button
                  variant="contained"
                  onClick={() => selectedRowIds.length > 0 ? exportToExcel(selectedRows) : exportToExcel(filteredData)}
                  startIcon={<FileUploadIcon />}
                  sx={{
                    backgroundColor: '#182959',
                    borderRadius: '999px',
                    padding: '9px 18px',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    '&:hover': {
                      backgroundColor: '#0f1a3c',
                    },
                  }}
                >
                  EXPORT DATA
                </Button>
                <Button
                  variant="contained"
                  sx={{ 
                    backgroundColor: '#182959',
                    borderRadius: '999px',
                    padding: '9px 18px',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    '&:hover': {
                      backgroundColor: '#0f1a3c',
                    },
                  }}
                  onClick={() => setIsImportModalOpen(true)}
                >
                  IMPORT
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  sx={{ 
                    backgroundColor: '#2B8C37',
                    borderRadius: '999px',
                    padding: '9px 18px',
                    fontSize: '0.85rem',
                    fontWeight: 'bold',
                    '&:hover': {
                      backgroundColor: '#256d2f',
                    },
                  }}
                  onClick={() => setIsAddModalOpen(true)}
                >
                  ADD RECORD
                </Button>
              </>
            )}
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          {['Abstraction','Discharged', 'Consumption'].map((type) => (
            <Button
              key={type}
              onClick={() => {
                setSelected(type);
                setSearchQuery("");
                resetFiltersToNull();
              }}
              variant="contained"
              sx={{
                backgroundColor: selected === type ? '#2B8C37' : '#9ca3af',
                borderRadius: '15px',
                padding: '3px 6px',
                height: '30px',
                width: '20%',
                fontSize: '0.85rem',
                fontWeight: 700,
                color: 'white',
                '&:hover': {
                  backgroundColor: selected === type ? '#256d2f' : '#6b7280',
                },
              }}
            >
              {type}
            </Button>
          ))}
        </Box>

        {/* Search Input */}
        <Box sx={{ display: 'flex', gap: '0.5rem', mb: 1 }}>
          <Search 
            onSearch={setSearchQuery} 
            suggestions={suggestions} 
          />
          <Filter
            label="Company"
            options={[{ label: 'All Company', value: '' }, ...companyOptions]}
            value={filters.company}
            onChange={val => {
              setFilters(prev => ({ ...prev, company: val }));
              setPage(1);
            }}
            placeholder="Company"
          />

          {selected === 'Abstraction' && (
            <>
              <Filter
                label="Month"
                options={[{ label: 'All Month', value: '' }, ...monthOptions]}
                value={filters.month}
                onChange={val => {
                  setFilters(prev => ({ ...prev, month: val }));
                  setPage(1);
                }}
                placeholder="Month" 
              />
            </>
          )}
          <Filter
            label="Quarter"
            options={[{ label: 'All Quarter', value: '' }, ...quarterOptions]}
            value={filters.quarter}
            onChange={val => {
              setFilters(prev => ({ ...prev, quarter: val }));
              setPage(1);
            }}
            placeholder="Quarter"
          />
          <Filter
            label="Year"
            options={[{ label: 'All Year', value: '' }, ...yearOptions]}
            value={filters.year}
            onChange={val => {
              setFilters(prev => ({ ...prev, year: val }));
              setPage(1);
            }}
            placeholder="Year"
          />
          <Filter
            label="Status"
            options={[{ label: 'All Status', value: '' }, ...statusOptions]}
            value={filters.status}
            onChange={val => {
              setFilters(prev => ({ ...prev, status: val }));
              setPage(1);
            }}
            placeholder="Status"  
          />

          {isFiltering && (
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
              onClick={() => setFilters({
                company: '',
                year: '',
                quarter: '',
                source: '',
                property: '',
                type: '',
                status: '',
                month: '',
              })}
            >
              Clear
            </Button>
          )}

        </Box>

        {/* Custom Table Component */}
        <CustomTable
          columns={columns}
          rows={paginatedData}
          filteredData={filteredData}
          idKey={idKey} // or "id", "recordId", etc. depending on the page
          onSelectionChange={(selectedRows) => setSelectedRowIds(selectedRows)}
          onSort={handleSort}
          sortConfig={sortConfig}
          emptyMessage="No water data found."
          maxHeight="60vh"
          minHeight="300px"
          actions={(row) => (
            <IconButton size="small" onClick={() => setSelectedRecord(row)}>
              <LaunchIcon />
            </IconButton>
          )}
        />

        {/* Custom Pagination Component */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
          {/* Row Count Display */}
          <Typography sx={{ fontSize: '0.85rem'}}>
            Showing {filteredData.length} {filteredData.length === 1 ? 'record' : 'records'}
          </Typography>
          <Pagination 
            page={page}
            count={totalPages}
            onChange={handlePageChange}
          />
          <Typography sx={{ fontSize: '0.85rem'}}>
            Showing {Math.min((page - 1) * rowsPerPage + 1, filteredData.length)}–
            {Math.min(page * rowsPerPage, filteredData.length)} records
          </Typography>
        </Box>

      {/* Conditional rendering for modals */}
      {isAddModalOpen && (
        <Overlay onClose={() => setIsAddModalOpen(false)}>
          {selected === 'Abstraction' && (
            <AddAbstractionModal 
              onClose={() => {
                setIsAddModalOpen(false);
                fetchAbstractionData(); 
              }} 
            />
          )}
          {selected === 'Discharged' && (
            <AddDischargedModal 
              onClose={() => {
                setIsAddModalOpen(false);
                fetchDischargedData();
              }} 
            />
          )}
          {selected === 'Consumption' && (
            <AddConsumptionModal 
              onClose={() => {
                setIsAddModalOpen(false);
                fetchConsumptionData(); 
              }} 
            />
          )}
        </Overlay>
        )}

        {isImportdModalOpen && (
          <Overlay onClose={() => handleImportModalClose(false)}>
            {selected === 'Abstraction' && (
                <ImportFileModal
                  title="Water - Abstraction"
                  downloadPath="environment/create_template/envi_water_abstraction"
                  uploadPath="environment/bulk_upload_water_abstraction"
                  onClose={(shouldRefresh) => handleImportModalClose(shouldRefresh)}
                />     
            )}
            {selected === 'Discharged' && (
                <ImportFileModal
                  title="Water - Discharged"
                  downloadPath="environment/create_template/envi_water_discharge"
                  uploadPath="environment/bulk_upload_water_discharge"
                  onClose={(shouldRefresh) => handleImportModalClose(shouldRefresh)}
                />
            )}
            {selected === 'Consumption' && (
                <ImportFileModal
                  title="Water - Consumption"
                  downloadPath="environment/create_template/envi_water_consumption"
                  uploadPath="environment/bulk_upload_water_consumption"
                  onClose={(shouldRefresh) => handleImportModalClose(shouldRefresh)}
                />
            )}
          </Overlay>
        )}
        {selectedRecord != null && (
          console.log('Selected Record:', selectedRecord),
          <Overlay onClose={() => setSelectedRecord(null)}>
            <ViewEditRecordModal
              source={'environment'}
              table={'Water'}
              title={`Water ${selected} Details`}
              record={selectedRecord}
              updatePath={updatePath}
              status={(data) => {
                if (!data){
                  refreshCurrentData(); // Use helper function
                };
                setSelectedRecord(null);
              }}
              onClose={() => setSelectedRecord(null)}
            />
          </Overlay>
        )}
        {isModalOpen && (
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
      </Container>
    </Box>
  );
}

export default EnvironmentWater;