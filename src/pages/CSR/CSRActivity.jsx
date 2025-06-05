import { useState, useEffect, useMemo } from 'react';
import Sidebar from '../../components/Sidebar';
import {
  Box,
  Typography,
  Button,
  Container,
  Paper,
  IconButton
} from '@mui/material';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import ClearIcon from '@mui/icons-material/Clear';
import LaunchIcon from '@mui/icons-material/Launch';
import Table from '../../components/Table/Table';
import Filter from '../../components/Filter/Filter';
import Search from '../../components/Filter/Search';
import Pagination from '../../components/Pagination/pagination';
import AddRecordModalHelp from '../../components/help_components/AddRecordModalHelp';
import ImportModalHelp from '../../components/help_components/ImportModalHelp'; // Restored
import Overlay from '../../components/modal'; // Add this import if not present
import api from '../../services/api';

function CSR() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [modalKey, setModalKey] = useState(0);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  // Table and filter state
  const [sortConfig, setSortConfig] = useState({
    key: 'projectYear',
    direction: 'desc'
  });
  const [filters, setFilters] = useState({ year: "", companyId: "", statusId: "", program: "", projectAbbr: "" });
  const [search, setSearch] = useState('');

  // Fetch data on mount
  useEffect(() => {
    fetchCSRData();
  }, []);

  // Fetch CSR activities from API
  const fetchCSRData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/help/activities');
      setData(response.data);
    } catch (error) {
      setError('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  // Table columns configuration
  const columns = [
    { key: 'projectYear', label: 'Year', width: 80, align: 'center', render: val => val },
    { key: 'companyId', label: 'Company', width: 120, render: val => val },
    { key: 'programName', label: 'Program', width: 140, render: val => val },
    { key: 'projectName', label: 'Project', width: 140, render: val => val },
    { key: 'csrReport', label: 'Beneficiaries', width: 120, align: 'right', render: val => val != null ? Number(val).toLocaleString() : '-' },
    { key: 'projectExpenses', label: 'Investments (₱)', width: 140, align: 'right', render: val => val != null ? `₱${Number(val).toLocaleString()}` : '-' },
    { key: 'statusId', label: 'Status', width: 110, render: val => val },
    {
      key: 'actions',
      label: 'Actions',
      width: 80,
      align: 'center',
      render: (val, row) => (
        <IconButton size="small" /* onClick={() => ...} */>
          <LaunchIcon />
        </IconButton>
      )
    }
  ];

  // Handle table sorting
  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // --- Filter Option Extraction ---

  // Get unique program names for filter
  const programSet = new Set(data.map(d => d.programName).filter(Boolean));
  const programOptions = [
    { label: "All Programs", value: "" },
    ...Array.from(programSet).sort((a, b) => String(a).localeCompare(String(b))).map(name => ({ label: name, value: name }))
  ];

  // Get unique project names for filter, filtered by selected program
  const filteredProjects = data.filter(d => {
    if (!filters.program) return true;
    return d.programName === filters.program;
  });
  const projectSet = new Set(filteredProjects.map(d => d.projectName).filter(Boolean));
  const projectOptions = [
    { label: "All Projects", value: "" },
    ...Array.from(projectSet).sort((a, b) => String(a).localeCompare(String(b))).map(name => ({ label: name, value: name }))
  ];

  // Year filter options
  const yearOptions = [
    { label: "All Years", value: "" },
    ...Array.from(new Set(data.map(d => d.projectYear).filter(Boolean)))
      .sort((a, b) => b - a)
      .map(y => ({ label: y, value: y }))
  ];

  // Company filter options
  const companyIdOptions = [
    { label: "All Companies", value: "" },
    ...Array.from(new Set(data.map(d => d.companyId).filter(Boolean)))
      .sort((a, b) => String(a).localeCompare(String(b)))
      .map(c => ({ label: c, value: c }))
  ];

  // Status filter options
  const statusIdOptions = [
    { label: "All Statuses", value: "" },
    ...Array.from(new Set(data.map(d => d.statusId).filter(Boolean)))
      .sort((a, b) => String(a).localeCompare(String(b)))
      .map(s => ({ label: s, value: s }))
  ];

  // Search suggestions (projectId)
  const searchSuggestions = [
    ...new Set(data.map(d => d.projectId).filter(Boolean))
  ];

  // --- Filtering, Searching, Sorting, Pagination ---

  // Filter data based on all filters and search
  const filteredData = data
    .filter(row => {
      // Year filter
      if (filters.year && String(row.projectYear) !== String(filters.year)) return false;
      // Company filter
      if (filters.companyId && String(row.companyId) !== String(filters.companyId)) return false;
      // Status filter
      if (filters.statusId && String(row.statusId) !== String(filters.statusId)) return false;
      // Program filter (programName)
      if (filters.program && row.programName !== filters.program) return false;
      // Project filter (projectName)
      if (filters.projectAbbr && row.projectName !== filters.projectAbbr) return false;
      return true;
    })
    .filter(row => {
      // Search filter (searches all fields as string)
      if (!search) return true;
      const searchStr = search.toLowerCase();
      return Object.values(row).some(val =>
        String(val).toLowerCase().includes(searchStr)
      );
    });

  // Sort filtered data
  const sortedData = [...filteredData].sort((a, b) => {
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return 1;
    if (bVal == null) return -1;
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
    }
    return sortConfig.direction === 'asc'
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedData.length / rowsPerPage));
  const pagedData = sortedData.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  // Reset to page 1 if filters/search change
  useEffect(() => {
    setPage(1);
    // eslint-disable-next-line
  }, [filters, search, rowsPerPage]);

  // Modal options for AddRecordModalHelp
  const modalYearOptions = yearOptions.slice(1); // Remove "All Years"
  const modalCompanyOptions = companyIdOptions.slice(1); // Remove "All Companies"
  // For modal, use programName/projectName/projectId from API, grouped by programName
  const programSetModal = new Set(data.map(d => d.programName).filter(Boolean));
  const modalProgramOptions = Array.from(programSetModal)
    .sort((a, b) => String(a).localeCompare(String(b)))
    .map(name => ({ label: name, value: name }));

  // Group project options by program, include projectId
  const modalProjectOptions = {};
  data.forEach(d => {
    if (d.programName && d.projectName && d.projectId) {
      if (!modalProjectOptions[d.programName]) {
        modalProjectOptions[d.programName] = [];
      }
      // Only push if not already present (by projectId)
      if (!modalProjectOptions[d.programName].some(opt => opt.value === d.projectId)) {
        modalProjectOptions[d.programName].push({
          label: d.projectName,
          value: d.projectId, 
          projectId: d.projectId
        });
      }
    }
  });

  // Log modalProjectOptions to verify structure
  console.log("modalProjectOptions:", modalProjectOptions);

  // --- Render ---

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

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
          onSort={handleSort}
          sortConfig={sortConfig}
          emptyMessage="No data available."
          maxHeight="69vh"
          minHeight="300px"
          // actions column is now handled in columns definition
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
        <AddRecordModalHelp
          key={modalKey}
          open={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={() => {
            fetchCSRData();
            // Log the modal options used for adding
            console.log("AddRecordModalHelp used with options:", {
              yearOptions: modalYearOptions,
              companyOptions: modalCompanyOptions,
              programOptions: modalProgramOptions,
              projectOptions: modalProjectOptions
            });
          }}
          yearOptions={modalYearOptions}
          companyOptions={modalCompanyOptions}
          programOptions={modalProgramOptions}
          projectOptions={modalProjectOptions}
        />
        {/* Import Modal */}
        {isImportModalOpen && (
          <Overlay onClose={() => setIsImportModalOpen(false)}>
            <ImportModalHelp
              open={isImportModalOpen}
              onClose={() => setIsImportModalOpen(false)}
              onImportSuccess={fetchCSRData}
            />
          </Overlay>
        )}
      </Container>
    </Box>
  );
}

export default CSR;