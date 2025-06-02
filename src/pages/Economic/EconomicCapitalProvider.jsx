import { useState, useEffect, useMemo } from 'react';
import {
  Paper,
  Button,
  IconButton,
  Box,
} from '@mui/material';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import api from '../../services/api';
import Overlay from '../../components/modal';
import Sidebar from '../../components/Sidebar';
import Table from '../../components/Table/Table';
import Pagination from '../../components/Pagination/pagination';
import Filter from '../../components/Filter/Filter';
import Search from '../../components/Filter/Search';
import AddCapitalProviderModal from '../../components/AddCapitalProviderPaymentsModal';

function EconomicCapitalProvider() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: 'year',
    direction: 'desc'
  });
  
  const rowsPerPage = 10;

  const [filters, setFilters] = useState({
    year: ''
  });

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCapitalProviderData();
  }, []);

  const fetchCapitalProviderData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/economic/capital-provider-payments');
      console.log('Capital Provider Data from API:', response.data);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching capital provider data:', error);
      setError('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
    setPage(1);
  };

  // Filtering, searching, and sorting
  const processedData = useMemo(() => {
    let filtered = [...data];

    // Search
    if (searchTerm) {
      filtered = filtered.filter(row =>
        row.year?.toString().includes(searchTerm)
      );
    }

    // Filters
    if (filters.year) filtered = filtered.filter(row => row.year === filters.year);

    // Sorting
    if (sortConfig && sortConfig.key) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return 1;
        if (bValue == null) return -1;
        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
        }
        const cmp = String(aValue).localeCompare(String(bValue), undefined, { numeric: true });
        return sortConfig.direction === "asc" ? cmp : -cmp;
      });
    }

    return filtered;
  }, [data, filters, searchTerm, sortConfig]);

  // Reset to first page if filters/search/sort change and current page is out of range
  useEffect(() => {
    const totalPages = Math.ceil(processedData.length / rowsPerPage) || 1;
    if (page > totalPages) setPage(1);
  }, [processedData, page]);

  // Only slice for the current page
  const currentPageRows = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return processedData.slice(start, start + rowsPerPage);
  }, [processedData, page, rowsPerPage]);

  const totalPages = Math.ceil(processedData.length / rowsPerPage) || 1;

  // Table columns definition
  const columns = [
    { 
      key: 'year', 
      label: 'Year',
      render: (val) => val
    },
    { 
      key: 'interest', 
      label: 'Interest',
      render: (val) => val != null ? Number(val).toLocaleString() : '0'
    },
    { 
      key: 'dividendsToNci', 
      label: 'Dividends to NCI',
      render: (val) => val != null ? Number(val).toLocaleString() : '0'
    },
    { 
      key: 'dividendsToParent', 
      label: 'Dividends to Parent',
      render: (val) => val != null ? Number(val).toLocaleString() : '0'
    },
    { 
      key: 'total', 
      label: 'Total (₱)',
      render: (val) => val != null ? `₱ ${Number(val).toLocaleString()}` : '₱ 0'
    },
  ];

  // Actions column for edit button
  const actions = (row) => (
    <IconButton size="small">
      <EditIcon />
    </IconButton>
  );

  // Prepare options for Filter components
  const yearOptions = useMemo(
    () =>
      Array.from(new Set(data.map(row => row.year).filter(Boolean)))
        .sort((a, b) => b - a)
        .map(year => ({ label: String(year), value: year })),
    [data]
  );

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, height: '100vh', overflow: 'auto' }}>
        <div style={{ padding: '2rem' }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem'
          }}>
            <div>
              <h1 style={{ 
                fontSize: '1.5rem', 
                fontWeight: 'bold',
                marginBottom: '0.5rem'
              }}>
                REPOSITORY
              </h1>
              <h2 style={{ fontSize: '2rem', color: '#182959' }}>
                Economic - Capital Provider
              </h2>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Button
                variant="contained"
                startIcon={<FileUploadIcon />}
                style={{ backgroundColor: '#182959' }}
              >
                EXPORT DATA
              </Button>
              <Button
                variant="contained"
                style={{ backgroundColor: '#182959' }}
              >
                IMPORT
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                style={{ backgroundColor: '#2B8C37' }}
                onClick={() => setIsAddModalOpen(true)}
              >
                ADD RECORD
              </Button>
            </div>
          </div>

          {/* Search and Filter Section */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Search
              onSearch={val => {
                setSearchTerm(val);
                setPage(1);
              }}
              suggestions={[
                ...new Set([
                  ...data.map(row => String(row.year)).filter(Boolean)
                ])
              ]}
            />
            <Filter
              label="Year"
              options={[{ label: 'All Years', value: '' }, ...yearOptions]}
              value={filters.year}
              onChange={val => {
                setFilters(prev => ({ ...prev, year: val }));
                setPage(1);
              }}
              placeholder="Year"
            />
          </Box>

          {/* Table */}
          <Table
            columns={columns}
            rows={currentPageRows}
            onSort={handleSort}
            sortConfig={sortConfig}
            actions={actions}
            emptyMessage="No data available."
          />

          {/* Pagination */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              page={page}
              count={totalPages}
              onChange={(newPage) => setPage(newPage)}
            />
          </Box>

          {/* Add Modal */}
          {isAddModalOpen && (
            <Overlay onClose={() => setIsAddModalOpen(false)}>
              <AddCapitalProviderModal
                onClose={() => {
                  setIsAddModalOpen(false);
                  fetchCapitalProviderData();
                }}
              />
            </Overlay>
          )}
        </div>
      </Box>
    </Box>
  );
}

export default EconomicCapitalProvider;
