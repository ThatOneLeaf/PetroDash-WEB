import { useState, useEffect, useMemo, useCallback } from 'react';
import Sidebar from '../../components/Sidebar';
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  TextField,
  IconButton
} from '@mui/material';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import AddIcon from '@mui/icons-material/Add';
import ClearIcon from '@mui/icons-material/Clear';
import LaunchIcon from '@mui/icons-material/Launch';
import Table from '../../components/Table/Table';
import Filter from '../../components/Filter/Filter';
import Search from '../../components/Filter/Search';
import Pagination from '../../components/Pagination/pagination';
import AddRecordModalHelp from '../../components/help_components/AddRecordModalHelp';
import ImportModalHelp from '../../components/help_components/ImportModalHelp';
import Overlay from '../../components/modal'; 
import api from '../../services/api';
import ViewHelpRecordModal from '../../components/help_components/ViewHelpRecordModal'; 
import exportData from '../../services/export';
import ImportFileModal from '../../components/ImportFileModal'
import StatusChip from '../../components/StatusChip';

function CSR() {  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isReviseModalOpen, setIsReviseModalOpen] = useState(false)
  const [modalKey, setModalKey] = useState(0);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const [remarks, setRemarks] = useState('');
  const statuses = ["URS","FRS","URH","FRH","APP"];

  const [sortConfig, setSortConfig] = useState({
    key: 'projectYear',
    direction: 'desc'
  });
  const [filters, setFilters] = useState({ year: "", companyId: "", statusId: "", programId: "", programName: "", projectAbbr: "" });
  const [search, setSearch] = useState('');
  const [programOptions, setProgramOptions] = useState([
    { label: "All Programs", value: "" }
  ]);
  const [projectOptions, setProjectOptions] = useState([
    { label: "All Projects", value: "" }
  ]);

  useEffect(() => {
    fetchCSRData();
  }, []);

  const refreshPage = () => {
    fetchCSRData();
  };

  const toggleAddModal = () => {
    setIsAddModalOpen(!isAddModalOpen)
  }

  const fetchCSRData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('help/activities');
      // Defensive: check if response.data is an array
      if (!Array.isArray(response.data)) {
        throw new Error('Malformed API response: expected an array');
      }
      setData(response.data);
    } catch (error) {
      // Debugging notes for API error
      let errorMsg = 'Error fetching data';
      if (error.response) {
        // The request was made and the server responded with a status code
        errorMsg = error.response.data?.message || error.response.statusText || errorMsg;
        console.error('API Response Error:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers,
        });
      } else if (error.request) {
        errorMsg = 'No response from server';
        console.error('API No Response:', error.request);
      } else {
        errorMsg = error.message || errorMsg;
        console.error('API Setup Error:', error.message);
      }
      setError({ message: errorMsg, raw: error });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleExport = () => {
    const exportColumns = [
      { key: 'companyName', label: 'Company Name' },
      { key: 'projectName', label: 'Project Name' },
      { key: 'projectYear', label: 'Year' },
      { key: 'csrReport', label: 'Report (in numbers)' },
      { key: 'projectExpenses', label: 'Project Investment (₱)' },
      { key: 'projectRemarks', label: 'Remarks' }
    ];
    
    const filename = `help_activity_as_of_${new Date().toISOString().split('T')[0]}`;
    exportData(filteredData, filename, exportColumns);
  };

  const areSelectedStatusesSame = () => {
    if (!selectedRowIds.length) return false;
    const selectedStatuses = selectedRowIds
      .map(id => filteredData.find(row => row[idKey] === id))
      .filter(Boolean)
      .map(row => row.statusId);
    
    return selectedStatuses.every(status => status === selectedStatuses[0]);
  };

  const fetchNextStatus = (action, currentStatus) => {
    // console.log("here at fectnextstatus: current status: ", currentStatus)
    let newStatus = '';
    if (action === 'approve') {
      switch (currentStatus){
        case 'For Revision (Site)':
          newStatus = statuses[0]; // "URS"
          break;
        case 'Under Review (Site)':
        case 'For Revision (Head)':
          newStatus = statuses[2]; // "URH"
          break;
        case 'Under Review (Head)':
          newStatus = statuses[4]; // "APP"
          break;
      }
    } else if (action === 'revise') {
      switch (currentStatus) {
        case 'Under Review (Site)':
          newStatus = statuses[1]; // "FRS"
          break;
        case 'Under Review (Head)': 
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
      currentStatus = firstRow?.statusId || null;
      if (currentStatus === "Approved"){
        alert("This record is already Approved.");
        return;
        }
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

      const response = await api.post(
        "/usable_apis/bulk_update_status",
        payload
      );

      alert(response.data.message);

      // Use the helper function to refresh data
      refreshPage();

      // setIsModalOpen(false);
      setSelectedRowIds([]);
      setRemarks("");
    } catch (error) {
      console.error("Error updating record status:", error);
      alert(error?.response?.data?.detail || "Update Status Failed.");
    }  
  };

  // Fetch program options from API
  useEffect(() => {
    const fetchProgramOptions = async () => {
      try {
        const response = await api.get('/help/programs');
        if (Array.isArray(response.data)) {
          const options = [
            { label: "All Programs", value: "" },
            ...response.data.map(p => ({
              label: p.programName,
              value: p.programId
            }))
          ];
          setProgramOptions(options);
        }
      } catch (err) {
        setProgramOptions([{ label: "All Programs", value: "" }]);
      }
    };
    fetchProgramOptions();
  }, []);

  // Fetch project options from API, filtered by selected programId
  useEffect(() => {
    const fetchProjectOptions = async () => {
      try {
        let url = '/help/projects';
        if (filters.programId) {
          url += `?program_id=${encodeURIComponent(filters.programId)}`;
        }
        const response = await api.get(url);
        if (Array.isArray(response.data)) {
          const options = [
            { label: "All Projects", value: "" },
            ...response.data.map(p => ({
              label: p.projectName,
              value: p.projectName // Use projectName for filtering
            }))
          ];
          setProjectOptions(options);
        }
      } catch (err) {
        setProjectOptions([{ label: "All Projects", value: "" }]);
      }
    };
    fetchProjectOptions();
  }, [filters.programId]);

  const refreshPage2 = () => {
    // Reset filters and fetch data
    setFilters({ year: "", companyId: "", statusId: "", programId: "", programName: "", projectAbbr: "" });
    fetchCSRData();
  };

  const handleSearch = (val) => {
    setSearch(val);
    // Optional: add debounce or throttle here for performance
  };

  const yearOptions = useMemo(() => [
    { label: "All Years", value: "" },
    ...Array.from(new Set(data.map(d => d.projectYear).filter(Boolean)))
      .sort((a, b) => b - a)
      .map(y => ({ label: y, value: y }))
  ], [data]);

  const companyIdOptions = useMemo(() => [
    { label: "All Companies", value: "" },
    ...Array.from(new Set(data.map(d => d.companyId).filter(Boolean)))
      .sort((a, b) => String(a).localeCompare(String(b)))
      .map(c => ({ label: c, value: c }))
  ], [data]);

  const statusIdOptions = useMemo(() => [
    { label: "All Statuses", value: "" },
    ...Array.from(new Set(data.map(d => d.statusId).filter(Boolean)))
      .sort((a, b) => String(a).localeCompare(String(b)))
      .map(s => ({ label: s, value: s }))
  ], [data]);

  const searchSuggestions = useMemo(() =>
    [...new Set(data.map(d => d.projectId).filter(Boolean))]
  , [data]);

  // Memoize filtered, searched, and sorted data
  const filteredData = useMemo(() => data
    .filter(row => {
      if (filters.year && String(row.projectYear) !== String(filters.year)) return false;
      if (filters.companyId && String(row.companyId) !== String(filters.companyId)) return false;
      if (filters.statusId && String(row.statusId) !== String(filters.statusId)) return false;
      if (filters.programId && filters.programName && row.programName !== filters.programName) return false;
      if (filters.projectAbbr && row.projectName !== filters.projectAbbr) return false;
      return true;
    })
    .filter(row => {
      if (!search) return true;
      const searchStr = search.toLowerCase();
      return Object.values(row).some(val =>
        String(val).toLowerCase().includes(searchStr)
      );
    })
  , [data, filters, search]);

  const sortedData = useMemo(() => {
    const arr = [...filteredData];
    const { key, direction } = sortConfig;
    arr.sort((a, b) => {
      const aVal = a[key];
      const bVal = b[key];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return direction === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return direction === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
    return arr;
  }, [filteredData, sortConfig]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(sortedData.length / rowsPerPage)), [sortedData.length, rowsPerPage]);
  const pagedData = useMemo(() => sortedData.slice((page - 1) * rowsPerPage, page * rowsPerPage), [sortedData, page, rowsPerPage]);

  useEffect(() => {
    setPage(1);
    // eslint-disable-next-line
  }, [filters, search, rowsPerPage]);

  // Disable body scroll when any modal is open
  useEffect(() => {
    const modalOpen = isAddModalOpen || isImportModalOpen || !!selectedRecord;
    if (modalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isAddModalOpen, isImportModalOpen, selectedRecord]);

  const handleSort = useCallback((key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  // Memoize columns to avoid hook order issues
  const columns = useMemo(() => [
    { key: 'projectYear', label: 'Year', width: 80, align: 'center', render: val => val },
    { key: 'companyName', label: 'Company', width: 120, render: val => val },
    { key: 'programName', label: 'Program', width: 140, render: val => val },
    { key: 'projectName', label: 'Project', width: 140, render: val => val },
    { key: 'csrReport', label: 'Beneficiaries', width: 120, align: 'right', render: val => val != null ? Number(val).toLocaleString() : '-' },
    { key: 'projectExpenses', label: 'Investments (₱)', width: 140, align: 'right', render: val => val != null ? `₱${Number(val).toLocaleString()}` : '-' },
    { key: 'projectRemarks', label: 'Remarks', width: 140, render: val => val },
    { 
      key: 'statusId', 
      label: 'Status', 
      width: 110, 
      render: val => <StatusChip status={val} /> // <-- Use StatusChip here
    },
    {
      key: 'actions',
      label: 'Actions',
      width: 80,
      align: 'center',
      render: (val, row) => (
        <IconButton size="small" onClick={() => setSelectedRecord(row)}>
          <LaunchIcon />
        </IconButton>
      )
    }
  ], [setSelectedRecord]);

  // Compute idKey for Table checkboxes
  const idKey = useMemo(() => {
    if (filteredData.length > 0) {
      if (filteredData[0].csrId !== undefined) return 'csrId';
    }
    return 'id';
  }, [filteredData]);

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <Typography variant="h6">Loading...</Typography>
    </Box>
  );
  if (error) return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h6" color="error"><b>Error:</b> {error.message || String(error)}</Typography>
      {error.raw?.response?.data && (
        <pre style={{color: 'red', fontSize: '0.9em', background: '#f8d7da', padding: '1em', borderRadius: 4, marginTop: 8}}>
          {JSON.stringify(error.raw.response.data, null, 2)}
        </pre>
      )}
      <Button
        variant="contained"
        sx={{ mt: 2, backgroundColor: '#182959', borderRadius: '999px' }}
        onClick={fetchCSRData}
      >
        Retry
      </Button>
      <Typography sx={{ mt: 2, color: '#888', fontSize: '0.95em' }}>
        Please check your backend logs for more details.
      </Typography>
    </Box>
  );

  const isApprove = selectedRowIds
    .map(id => filteredData.find(row => row[idKey] === id))
    .filter(Boolean)
    .every(row => row.status === 'Approved');

  const allowedStatuses = ['For Revision (Site)', 'For Revision (Head)'];
  const isForRevision = selectedRowIds
    .map(id => filteredData.find(row => row[idKey] === id))
    .filter(Boolean)
    .every(row => allowedStatuses.includes(row.status));

  // Filter only selected rows for export
  const selectedRows = filteredData.filter(row => selectedRowIds.includes(row[idKey]));

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Container maxWidth={false} disableGutters sx={{ flexGrow: 1, padding: '2rem' }}>
        {/* Title and Buttons */}
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
              Social - H.E.L.P
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: '0.5rem' }}>
            {/* Only show Approve button if first selected row is NOT For Revision (Site/Head) */}
            {selectedRowIds.length > 0 && !isApprove ? (
              <>
                {(() => {
                  const firstSelectedRow = filteredData.find(row => row[idKey] === selectedRowIds[0]);
                  const hideApprove =
                    firstSelectedRow &&
                    (firstSelectedRow.statusId === 'For Revision (Site)' ||
                     firstSelectedRow.statusId === 'For Revision (Head)');
                  return !hideApprove ? (
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
                  ) : null;
                })()}
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
                    onClick={() => {
                      // Get the selected row from pagedData
                      const selectedRowsForModal = pagedData.filter(row => selectedRowIds.includes(row[idKey]));
                      const allStatuses = selectedRowsForModal.map(row => row.statusId);
                      const isForRevisionSite = allStatuses.every(status => status === 'For Revision (Site)');
                      const isForRevisionHeadLevel = allStatuses.every(status => status === 'For Revision (Head)');
                      const isOnlyApprove = isForRevisionSite || isForRevisionHeadLevel;
                      if (isOnlyApprove && selectedRowsForModal.length === 1) {
                        setRemarks(selectedRowsForModal[0].statusRemarks || '');
                      } else {
                        setRemarks('');
                      }
                      setIsReviseModalOpen(true);
                    }}
                  >
                    Revise
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button
                  variant="contained"
                  onClick={handleExport}
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
                  onClick={toggleAddModal}
                >
                  ADD RECORD
                </Button>
              </>
            )}
          </Box>
        </Box>

        {/* Filter/Search Row */}
        <Box sx={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          <Search
            onSearch={val => setSearch(val)}
            suggestions={searchSuggestions}
          />
          <Filter
            label="Year"
            options={yearOptions}
            value={filters.year}
            onChange={val => setFilters(f => ({ ...f, year: val }))}
            placeholder="Year"
          />
          <Filter
            label="Company ID"
            options={companyIdOptions}
            value={filters.companyId}
            onChange={val => setFilters(f => ({ ...f, companyId: val }))}
            placeholder="Company ID"
          />
          <Filter
            label="Approval Status"
            options={statusIdOptions}
            value={filters.statusId}
            onChange={val => setFilters(f => ({ ...f, statusId: val }))}
            placeholder="Approval Status"
          />
          <Filter
            label="Program"
            options={programOptions}
            value={filters.programId}
            onChange={val => {
              const selectedOption = programOptions.find(opt => opt.value === val);
              setFilters(f => ({
                ...f,
                programId: val,
                programName: selectedOption ? selectedOption.label : "",
                projectAbbr: "" // Reset project filter when program changes
              }));
              // Fix: When switching to "All Programs", reset project options to all projects
              if (!val) {
                setProjectOptions([{ label: "All Projects", value: "" }, ...data
                  .map(d => d.projectName)
                  .filter(Boolean)
                  .filter((v, i, arr) => arr.indexOf(v) === i)
                  .map(name => ({ label: name, value: name }))
                ]);
              }
            }}
            placeholder="Program"
          />
          <Filter
            label="Project"
            options={projectOptions}
            value={filters.projectAbbr}
            onChange={val => setFilters(f => ({ ...f, projectAbbr: val }))}
            placeholder="Project"
          />
          {(
            filters.year !== "" ||
            filters.companyId !== "" ||
            filters.statusId !== "" ||
            filters.programId !== "" ||
            filters.projectAbbr !== ""
          ) && (
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
                year: "",
                companyId: "",
                statusId: "",
                programId: "",
                programName: "",
                projectAbbr: ""
              })}
            >
              Clear
            </Button>
          )}
        </Box>
        
        {console.log(pagedData)}
        {/* Table */}
        <Table
          columns={columns}
          rows={pagedData}
          idKey={idKey}
          filteredData={filteredData}
          onSelectionChange={(selectedRows) => setSelectedRowIds(selectedRows)}
          onSort={handleSort}
          sortConfig={sortConfig}
          emptyMessage={loading ? "Loading..." : error ? "Error loading data." : "No data available."}
          maxHeight="69vh"
          minHeight="300px"
        />

        {/* Record Count and Pagination */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
          <Typography sx={{ fontSize: '1rem'}}>
            Showing {filteredData.length} {filteredData.length === 1 ? 'record' : 'records'}
          </Typography>
          <Pagination
            page={page}
            count={totalPages}
            onChange={setPage}
          />
          <Typography sx={{ fontSize: '1rem'}}>
            Showing {Math.min((page - 1) * rowsPerPage + 1, filteredData.length)}–
            {Math.min(page * rowsPerPage, filteredData.length)} records
          </Typography>
        </Box>

        {/* Add Record Modal */}
        {isAddModalOpen && (
          <Overlay onClose={() => setIsAddModalOpen(false)}>
            <AddRecordModalHelp
              open={isAddModalOpen}
              onClose={() => setIsAddModalOpen(false)}
            />
          </Overlay>
          )
        }
        {/* Import Modal */}
        {isImportModalOpen && (
          <Overlay onClose={() => setIsImportModalOpen(false)}>
            <ImportFileModal
              title="Social - H.E.L.P"
              downloadPath="/help/help-activity-template"
              uploadPath="help/help-activity-bulk"
              onClose={() => setIsImportModalOpen(false)}
            />
          </Overlay>
        )}
        {/* View/Edit Record Modal */}
        {selectedRecord && (
          <Overlay onClose={() => setSelectedRecord(null)}>
            <ViewHelpRecordModal
              title="CSR Activity Details"
              onClose={() => setIsViewModalOpen(false)}
              record={{ ...selectedRecord, statusId: selectedRecord.statusId }}
              status={(data, error) => {
                if (error) {
                  // Debug message for update API error
                  console.error('Error updating CSR activity:', error);
                  if (error.response) {
                    console.error('Update API Response Error:', {
                      status: error.response.status,
                      data: error.response.data,
                      headers: error.response.headers,
                    });
                  } else if (error.request) {
                    console.error('Update API No Response:', error.request);
                  } else {
                    console.error('Update API Setup Error:', error.message);
                  }
                }
                if (!data) {
                  fetchCSRData();
                }
                setSelectedRecord(null);
              }}
            />
          </Overlay>
        )}

        {/* Inline ReviseModalHelp component */}
        {isReviseModalOpen && (
          <Overlay
            onClose={() => {
              setIsReviseModalOpen(false);
              setRemarks("");
            }}
          >
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
              {(() => {
                // Determine if remarks should be disabled and show message
                const selectedRowsForModal = filteredData.filter(row => selectedRowIds.includes(row[idKey]));
                const allStatuses = selectedRowsForModal.map(row => row.statusId);
                const isForRevisionSite = allStatuses.every(status => status === 'For Revision (Site)');
                const isForRevisionHeadLevel = allStatuses.every(status => status === 'For Revision (Head)');
                const isOnlyApprove = isForRevisionSite || isForRevisionHeadLevel;
                return (
                  <>
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
                      disabled={isOnlyApprove}
                      placeholder={isOnlyApprove ? "This record can only be approved." : undefined}
                      InputProps={{
                        style: isOnlyApprove
                          ? { backgroundColor: '#f5f5f5', color: '#888' }
                          : undefined
                      }}
                    />
                    {isOnlyApprove && (
                      <Typography sx={{ color: 'red', fontSize: '0.95em', mb: 1 }}>
                        This record can only be approved.
                      </Typography>
                    )}
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
                        onClick={() => {
                          setRemarks("");
                          setIsReviseModalOpen(false);
                        }}
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
                        onClick={() => {
                          if (isOnlyApprove) {
                            handleBulkStatusUpdate("approve");
                          } else {
                            handleBulkStatusUpdate("revise");
                          }
                          setIsReviseModalOpen(false);
                        }}
                      >
                        {isOnlyApprove ? "Approve" : "Confirm"}
                      </Button>
                    </Box>
                  </>
                );
              })()}
            </Paper>
          </Overlay>
        )}
      </Container>
    </Box>
  );
}

export default CSR;