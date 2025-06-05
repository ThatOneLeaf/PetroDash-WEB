import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Btn from '../../components/ButtonComp';
import {
  Box,
  Typography,
  Button,
  Paper
} from '@mui/material';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import api from '../../services/api';
import Overlay from '../../components/modal';
import Table from '../../components/Table/Table';
import Filter from '../../components/Filter/Filter';
import Search from '../../components/Filter/Search';
import Pagination from '../../components/Pagination/pagination';
import AddRecordModalHelp from '../../components/help_components/AddRecordModalHelp';
import IconButton from '@mui/material/IconButton';
import VisibilityIcon from '@mui/icons-material/Visibility'; // Add this import


function CSR() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalKey, setModalKey] = useState(0); // Add this line
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  // Table state
  const [sortConfig, setSortConfig] = useState({
    key: 'projectYear', // Use a valid column key for default sort
    direction: 'desc'
  });
  const [filters, setFilters] = useState({ year: "", companyId: "", statusId: "", program: "", projectAbbr: "" });
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCSRData();
  }, []);

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

  // Table columns config
  const columns = [
    { key: 'projectYear', label: 'Year', width: 80, align: 'center',
      render: (val) => val
    },
    { key: 'companyId', label: 'Company', width: 120,
      render: (val) => val
    },
    { key: 'projectId', label: 'Project', width: 140,
      render: (val) => val
    },
    { key: 'csrReport', label: 'Beneficiaries', width: 120, align: 'right',
      render: (val) => val != null ? Number(val).toLocaleString() : '-'
    },
    { key: 'projectExpenses', label: 'Investments (₱)', width: 140, align: 'right',
      render: (val) => val != null ? `₱${Number(val).toLocaleString()}` : '-'
    },
    { key: 'statusId', label: 'Status', width: 110,
      render: (val) => val
    },
    { key: 'action', label: 'Action', width: 100, align: 'center',
      render: (row) => (
        <IconButton size="small">
          <EditIcon /> {/* Use EditIcon for consistency with EnvironmentEnergy */}
        </IconButton>
      )
    }
  ];

  // Sorting logic
  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Extract project abbreviations from projectId (after the underscore)
  const projectAbbrSet = new Set(
    data
      .map(d => {
        const parts = String(d.projectId || '').split('_');
        return parts.length > 1 ? parts[1] : '';
      })
      .filter(Boolean)
  );
  const projectAbbrOptions = [
    { label: "All Projects", value: "" },
    ...Array.from(projectAbbrSet).sort().map(abbr => ({ label: abbr, value: abbr }))
  ];

  // Filtering and searching logic
  const filteredData = data
    .filter(row => {
      // Year filter
      if (filters.year && String(row.projectYear) !== String(filters.year)) return false;
      // Company ID filter
      if (filters.companyId && String(row.companyId) !== String(filters.companyId)) return false;
      // Approval Status filter
      if (filters.statusId && String(row.statusId) !== String(filters.statusId)) return false;
      // Program filter (first two letters of ProgramID)
      if (filters.program) {
        const prog = (row.ProgramID || row.programId || "").toString().substring(0, 2).toUpperCase();
        if (prog !== filters.program) return false;
      }
      // Project Abbreviation filter (after _ in projectId)
      if (filters.projectAbbr) {
        const parts = String(row.projectId || '').split('_');
        const abbr = parts.length > 1 ? parts[1] : '';
        if (abbr !== filters.projectAbbr) return false;
      }
      return true;
    })
    .filter(row => {
      // Search (searches all fields as string)
      if (!search) return true;
      const searchStr = search.toLowerCase();
      return Object.values(row).some(val =>
        String(val).toLowerCase().includes(searchStr)
      );
    });

  // Sorting
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

  // Pagination logic
  const totalPages = Math.max(1, Math.ceil(sortedData.length / rowsPerPage));
  const pagedData = sortedData.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  // Reset to page 1 if filters/search change and page is out of range
  useEffect(() => {
    setPage(1);
    // eslint-disable-next-line
  }, [filters, search, rowsPerPage]);

  // Year filter options (add "All Years" option at the top)
  const yearOptions = [
    { label: "All Years", value: "" },
    ...data
      .map(d => ({ label: d.projectYear, value: d.projectYear }))
      .filter((v, i, a) => a.findIndex(t => t.value === v.value) === i)
      .sort((a, b) => b.value - a.value)
  ];

  // Company ID filter options
  const companyIdOptions = [
    { label: "All Companies", value: "" },
    ...data
      .map(d => ({ label: d.companyId, value: d.companyId }))
      .filter((v, i, a) => a.findIndex(t => t.value === v.value) === i)
      .sort((a, b) => String(a.value).localeCompare(String(b.value)))
  ];

  // Approval Status filter options
  const statusIdOptions = [
    { label: "All Statuses", value: "" },
    ...data
      .map(d => ({ label: d.statusId, value: d.statusId }))
      .filter((v, i, a) => a.findIndex(t => t.value === v.value) === i)
      .sort((a, b) => String(a.value).localeCompare(String(b.value)))
  ];

  // Program filter options (only HE, ED, LI if present in data)
  const programSet = new Set(
    data
      .map(d => (d.ProgramID || d.programId || "").toString().substring(0, 2).toUpperCase())
      .filter(p => ["HE", "ED", "LI"].includes(p))
  );
  const programOptions = [
    { label: "All Programs", value: "" },
    ...["HE", "ED", "LI"].filter(p => programSet.has(p)).map(p => ({ label: p, value: p }))
  ];

  // For search suggestions, you can use project names or any relevant field
  const searchSuggestions = [
    ...new Set(data.map(d => d.projectId).filter(Boolean))
  ];

  // Modal options (can be generated from data or static as needed)
  const modalProgramOptions = [
    { label: 'Health', value: 'health' },
    { label: 'Education', value: 'education' },
    { label: 'Livelihood', value: 'livelihood' }
  ];
  const modalProjectOptions = {
    health: [
      { label: 'Medical Mission', value: 'medical_mission' },
      { label: 'Vaccination Drive', value: 'vaccination_drive' }
    ],
    education: [
      { label: 'Scholarship', value: 'scholarship' },
      { label: 'School Supplies', value: 'school_supplies' }
    ],
    livelihood: [
      { label: 'Skills Training', value: 'skills_training' },
      { label: 'Microfinance', value: 'microfinance' }
    ]
  };

  // Optionally, generate year options from data for the modal
  const modalYearOptions = [
    ...new Set(data.map(d => d.projectYear).filter(Boolean))
  ].sort((a, b) => b - a).map(y => ({ label: y, value: y }));

  // Optionally, generate company options from data for the modal
  const modalCompanyOptions = [
    ...new Set(data.map(d => d.companyId).filter(Boolean))
  ].sort().map(c => ({ label: c, value: c }));

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <Box sx={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', p: 5 }}>
        {/* Title and Buttons aligned horizontally */}
        <Box sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3
        }}>
          <Box>
            <Typography sx={{ 
              fontSize: '0.9rem', 
              fontWeight: 800,
              mb: 0.5
            }}>
              REPOSITORY
            </Typography>
            <Typography sx={{ fontSize: '2.75rem', color: '#182959', fontWeight: 800 }}>
              Social - H.E.L.P
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
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
                setModalKey(k => k + 1); // Increment key to force remount
                setIsAddModalOpen(true);
              }}
            >
              ADD RECORD
            </Button>
          </Box>
        </Box>
        {/* Filter/Search/Buttons row styled like screenshot */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 3,
            px: 2,
            py: 2,
            bgcolor: '#fff',
            borderRadius: 3,
            boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)',
            flexWrap: 'wrap',
          }}
          component={Paper}
          elevation={0}
        >
          {/* Search bar at left */}
          <Box sx={{ flex: '1 1 250px', minWidth: 220, maxWidth: 320 }}>
            <Search
              onSearch={val => setSearch(val)}
              suggestions={searchSuggestions}
              placeholder="Search..."
            />
          </Box>
          {/* Year Filter */}
          <Box sx={{ flex: '0 0 auto', display: 'flex', gap: 1 }}>
            <Filter
              label="Year"
              options={yearOptions}
              value={filters.year}
              onChange={val => setFilters(f => ({ ...f, year: val }))}
              placeholder="Year"
            />
          </Box>
          {/* Company ID Filter */}
          <Box sx={{ flex: '0 0 auto', display: 'flex', gap: 1 }}>
            <Filter
              label="Company ID"
              options={companyIdOptions}
              value={filters.companyId}
              onChange={val => setFilters(f => ({ ...f, companyId: val }))}
              placeholder="Company ID"
            />
          </Box>
          {/* Approval Status Filter */}
          <Box sx={{ flex: '0 0 auto', display: 'flex', gap: 1 }}>
            <Filter
              label="Approval Status"
              options={statusIdOptions}
              value={filters.statusId}
              onChange={val => setFilters(f => ({ ...f, statusId: val }))}
              placeholder="Approval Status"
            />
          </Box>
          {/* Program Filter */}
          <Box sx={{ flex: '0 0 auto', display: 'flex', gap: 1 }}>
            <Filter
              label="Program"
              options={programOptions}
              value={filters.program}
              onChange={val => setFilters(f => ({ ...f, program: val }))}
              placeholder="Program"
            />
          </Box>
          {/* Project Abbreviation Filter */}
          <Box sx={{ flex: '0 0 auto', display: 'flex', gap: 1 }}>
            <Filter
              label="Project"
              options={projectAbbrOptions}
              value={filters.projectAbbr}
              onChange={val => setFilters(f => ({ ...f, projectAbbr: val }))}
              placeholder="Project"
            />
          </Box>
          {/* Spacer to push buttons to right */}
          <Box sx={{ flex: 1 }} />
        </Box>
        {/* Table */}
        <Box sx={{ mt: 0, mb: 0, p: 0 }}>
          <Table
            columns={columns}
            rows={pagedData}
            onSort={handleSort}
            sortConfig={sortConfig}
            emptyMessage="No data available."
            sx={{
              mt: 0,
              mb: 0,
              p: 0,
            }}
          />
        </Box>
        {/* Record Count */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
          <Typography sx={{ fontSize: '1rem' }}>
            Showing {filteredData.length} {filteredData.length === 1 ? 'record' : 'records'}
          </Typography>
          <Box />
          <Typography sx={{ fontSize: '1rem' }}>
            Showing {Math.min((page - 1) * rowsPerPage + 1, filteredData.length)}–
            {Math.min(page * rowsPerPage, filteredData.length)} records
          </Typography>
        </Box>
        {/* Centered Pagination */}
        <Box sx={{ mt: 2, mb: 0, p: 0, display: 'flex', justifyContent: 'center' }}>
          <Pagination
            page={page}
            count={totalPages}
            onChange={setPage}
          />
        </Box>
        {/* Add Record Modal */}
        <AddRecordModalHelp
          key={modalKey} // Add this line
          open={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={fetchCSRData}
          programOptions={modalProgramOptions}
          projectOptions={modalProjectOptions}
          yearOptions={modalYearOptions}
          companyOptions={modalCompanyOptions}
        />
      </Box>
    </Box>
  )
}

export default CSR;