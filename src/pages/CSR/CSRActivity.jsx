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
import CircularProgress from '@mui/material/CircularProgress';

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
      <Box sx={{ textAlign: 'center' }}>
        <CircularProgress size={64} thickness={5} sx={{ color: '#1976d2' }} />
        <Typography sx={{ mt: 2, color: '#1976d2', fontWeight: 700, fontSize: 20 }}>
          Loading Social H.E.L.P. Data...
        </Typography>
      </Box>
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
      <Container maxWidth={false} sx={{ flex: 1, p: 3, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Social H.E.L.P. Activities
          </Typography>
          <Button
            variant="contained"
            size="large"
            startIcon={<FileUploadIcon />}
            onClick={() => setIsImportModalOpen(true)}
            sx={{ borderRadius: '999px', backgroundColor: '#1976d2' }}
          >
            Import Data
          </Button>
        </Box>
        <Filter
          filters={filters}
          setFilters={setFilters}
          search={search}
          setSearch={setSearch}
          yearOptions={yearOptions}
          companyIdOptions={companyIdOptions}
          programOptions={programOptions}
          projectOptions={projectOptions}
          statusIdOptions={statusIdOptions}
          onAddFilter={() => setIsAddModalOpen(true)}
          onExport={handleExport}
          exportDisabled={filteredData.length === 0}
        />
        <Box sx={{ flex: 1, position: 'relative' }}>
          <Table
            data={Array.isArray(pagedData) ? pagedData : []}
            columns={columns}
            rowKey="projectId"
            loading={loading}
            onSort={handleSort}
            sortConfig={sortConfig}
            emptyText="No data found"
          />
          <Pagination
            count={totalPages}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={e => setRowsPerPage(parseInt(e.target.value, 10))}
            sx={{ position: 'absolute', bottom: 16, right: 16 }}
          />
        </Box>
        <AddRecordModalHelp
          open={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={fetchCSRData}
          yearOptions={modalYearOptions}
          companyOptions={modalCompanyOptions}
          programOptions={modalProgramOptions}
          projectOptions={modalProjectOptions}
        />
        <ImportModalHelp
          open={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onSuccess={fetchCSRData}
        />
        <Overlay
          open={!!selectedRecord}
          onClose={() => setSelectedRecord(null)}
          maxWidth="md"
          fullWidth
        >
          <ViewHelpRecordModal
            record={selectedRecord}
            onClose={() => setSelectedRecord(null)}
            onSuccess={fetchCSRData}
          />
        </Overlay>
      </Container>
    </Box>
  );
}

export default CSR;