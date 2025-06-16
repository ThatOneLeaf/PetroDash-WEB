import { useState, useEffect, useMemo, useCallback } from 'react';
import Sidebar from '../../components/Sidebar';
import {
  Box,
  Typography,
  Button,
  Container,
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

function CSR() {  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [modalKey, setModalKey] = useState(0);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const [selectedRecord, setSelectedRecord] = useState(null);

  const [sortConfig, setSortConfig] = useState({
    key: 'projectYear',
    direction: 'desc'
  });
  const [filters, setFilters] = useState({ year: "", companyId: "", statusId: "", program: "", projectAbbr: "" });
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCSRData();
  }, []);

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

  // Memoize filter options for efficiency
  const programOptions = useMemo(() => {
    const programSet = new Set(data.map(d => d.programName).filter(Boolean));
    return [
      { label: "All Programs", value: "" },
      ...Array.from(programSet).sort((a, b) => String(a).localeCompare(String(b))).map(name => ({ label: name, value: name }))
    ];
  }, [data]);

  const projectOptions = useMemo(() => {
    const filteredProjects = data.filter(d => !filters.program || d.programName === filters.program);
    const projectSet = new Set(filteredProjects.map(d => d.projectName).filter(Boolean));
    return [
      { label: "All Projects", value: "" },
      ...Array.from(projectSet).sort((a, b) => String(a).localeCompare(String(b))).map(name => ({ label: name, value: name }))
    ];
  }, [data, filters.program]);

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
      if (filters.program && row.programName !== filters.program) return false;
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

  // Modal options for AddRecordModalHelp
  const modalYearOptions = useMemo(() => yearOptions.slice(1), [yearOptions]);
  const modalCompanyOptions = useMemo(() => companyIdOptions.slice(1), [companyIdOptions]);
  const modalProgramOptions = useMemo(() => {
    const programSetModal = new Set(data.map(d => d.programName).filter(Boolean));
    return Array.from(programSetModal)
      .sort((a, b) => String(a).localeCompare(String(b)))
      .map(name => ({ label: name, value: name }));
  }, [data]);
  const modalProjectOptions = useMemo(() => {
    const result = {};
    data.forEach(d => {
      if (d.programName && d.projectName && d.projectId) {
        if (!result[d.programName]) result[d.programName] = [];
        if (!result[d.programName].some(opt => opt.value === d.projectId)) {
          result[d.programName].push({
            label: d.projectName,
            value: d.projectId,
            projectId: d.projectId
          });
        }
      }
    });
    return result;
  }, [data]);

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
    { key: 'statusId', label: 'Status', width: 110, render: val => val },
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

//const getUpdatePath = useCallback((record) => `${'/activities-update'}/${record.projectId}`, []); // <-- use variable

  // Compute idKey for Table checkboxes (like EnvironmentEnergy)
  const idKey = useMemo(() => {
    if (filteredData.length > 0) {
      if (filteredData[0].csrId !== undefined) return 'csrId';
      // if (filteredData[0].projectId !== undefined) return 'projectId';
      // add more fallbacks if needed
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
            {/* EXPORT DATA BUTTON */}
            <Button
              variant="contained"
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
              onClick={handleExport}
            >
              EXPORT DATA
            </Button>

            {/* IMPORT DATA BUTTON */}
            <Button
              variant="contained"
              // startIcon={<FileUploadIcon />}
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

            {/* SINGLE UPLOAD DATA BUTTON */}
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
              onClick={() => {
                setModalKey(k => k + 1);
                setIsAddModalOpen(true);
              }}
            >
              ADD RECORD
            </Button>
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
            value={filters.program}
            onChange={val => {
              setFilters(f => ({
                ...f,
                program: val,
                projectAbbr: ""
              }));
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
          {Object.values(filters).some(v => v !== null && v !== '') && (
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
                program: "",
                projectAbbr: ""
              })}
            >
              Clear
            </Button>
          )}
        </Box>

        {/* Table */}
        <Table
          columns={columns}
          rows={pagedData}
          idKey={idKey}
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
              yearOptions={modalYearOptions}
              companyOptions={modalCompanyOptions}
              programOptions={modalProgramOptions}
              projectOptions={modalProjectOptions}
            />
          </Overlay>
        )}
        {/* Import Modal */}
        {isImportModalOpen && (
          <Overlay onClose={() => setIsImportModalOpen(false)}>
            {/* <ImportModalHelp
              open={isImportModalOpen}
              onClose={() => setIsImportModalOpen(false)}
              onImportSuccess={fetchCSRData}
            /> */}
            <ImportFileModal
              title="Social - H.E.L.P"
              downloadPath="/help/help-activity-template"
              uploadPath="help/help-activity-bulk"
              onClose={() => setIsImportModalOpen(false)} // or any close handler
            />
          </Overlay>
        )}
        {/* View/Edit Record Modal */}
        {selectedRecord && (
          <Overlay onClose={() => setSelectedRecord(null)}>
            <ViewHelpRecordModal
              title="CSR Activity Details"
              record={{ ...selectedRecord, statusId: selectedRecord.statusId }}
              companyOptions={modalCompanyOptions}
              programOptions={modalProgramOptions}
              projectOptions={modalProjectOptions}
              // updatePath={getUpdatePath(selectedRecord)}
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
      </Container>
    </Box>
  );
}

export default CSR;