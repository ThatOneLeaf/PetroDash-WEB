import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Btn from '../../components/ButtonComp';
import { 
  Box,
  Typography
 } from '@mui/material'
import FileUploadIcon from '@mui/icons-material/FileUpload';
import AddIcon from '@mui/icons-material/Add';
import api from '../../services/api';
import Overlay from '../../components/modal';
import AddValueGeneratedModal from '../../components/AddValueGeneratedModal';
import Table from '../../components/Table/Table';
import Filter from '../../components/Filter/Filter';
import Search from '../../components/Filter/Search';
import Pagination from '../../components/Pagination/pagination';
import Paper from '@mui/material/Paper';

function CSR() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  // Table state
  const [sortConfig, setSortConfig] = useState({
    key: 'year',
    direction: 'desc'
  });
  // Only filter by year for now, can add more filters as needed
  const [filters, setFilters] = useState({ year: "", companyId: "", statusId: "", program: "" });
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
    { key: 'companyId', label: 'Company ID',
      render: (val) => val
    },
    { key: 'projectId', label: 'Project ID',
      render: (val) => val
    },
    { key: 'projectYear', label: 'Year',
      render: (val) => val
    },
    { key: 'csrReport', label: 'Beneficiaries',
      render: (val) => val != null ? Number(val).toLocaleString() : ''
    },
    { key: 'projectExpenses', label: 'Investments (₱)',
      render: (val) => val != null ? Number(val).toLocaleString() : ''
    },
    { key: 'statusId', label: 'Approval Status',
      render: (val) => val
    },
    { key: 'action', label: 'Action',
      render: (val) => val != null ? Number(val).toLocaleString() : ''
    }
  ];

  // Sorting logic
  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

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
    if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
    if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
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
            <Btn label="IMPORT" color="green" />
            <Btn label="ADD RECORD" color="green" />
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
          {/* Spacer to push buttons to right */}
          <Box sx={{ flex: 1 }} />
          {/* Action buttons at right */}
          {/* Removed duplicate buttons here */}
        </Box>
        {/* Table */}
        <Box sx={{ mt: 0, mb: 0, p: 0 }}>
          <Table
            columns={columns}
            rows={pagedData}
            onSort={handleSort}
            sortConfig={sortConfig}
            // actions={actions}
            emptyMessage="No data available."
            sx={{
              mt: 0,
              mb: 0,
              p: 0,
              // Remove extra gaps/padding if your Table component supports sx prop
            }}
          />
        </Box>
        {/* Centered Pagination */}
        <Box sx={{ mt: 2, mb: 0, p: 0, display: 'flex', justifyContent: 'center' }}>
          <Pagination
            page={page}
            count={totalPages}
            onChange={setPage}
          />
        </Box>
      </Box>
    </Box>
  )
}

export default CSR;