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
import AddEconExpendituresModal from '../../components/AddEconExpendituresModal';
import ImportEconExpendituresModal from '../../components/ImportEconExpendituresModal';
import Table from '../../components/Table/Table';
import Pagination from '../../components/Pagination/pagination';
import Filter from '../../components/Filter/Filter';
import Search from '../../components/Filter/Search';

function EconomicExpenditures() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  
  const rowsPerPage = 10;

  const [filters, setFilters] = useState({
    year: '',
    type: '',
    company: ''
  });

  useEffect(() => {
    fetchExpendituresData();
  }, []);

  const fetchExpendituresData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/economic/expenditures');
      console.log('Data from API:', response.data);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching expenditures data:', error);
      setError('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  const [searchTerm, setSearchTerm] = useState('');

  // Filtering and searching are applied to the full dataset (no more manual sorting)
  const processedData = useMemo(() => {
    let filtered = [...data];

    // Enhanced Search - searches year, company, and all expenditure values
    if (searchTerm) {
      filtered = filtered.filter(row => {
        const searchStr = searchTerm.toLowerCase();
        
        // Search in year
        if (row.year && String(row.year).toLowerCase().includes(searchStr)) return true;
        
        // Search in company
        if (row.comp && row.comp.toLowerCase().includes(searchStr)) return true;
        
        // Search in type
        if (row.type && row.type.toLowerCase().includes(searchStr)) return true;
        
        // Search in expenditure values (formatted and raw)
        const expenditureFields = [
          'government', 'localSuppl', 'foreignSupplierSpending', 
          'employee', 'community', 'depreciation', 'depletion', 'others'
        ];
        
        return expenditureFields.some(field => {
          const value = row[field];
          if (value == null) return false;
          
          // Search in raw number
          if (String(value).toLowerCase().includes(searchStr)) return true;
          
          // Search in formatted number (with commas)
          const formatted = Number(value).toLocaleString();
          if (formatted.toLowerCase().includes(searchStr)) return true;
          
          return false;
        });
      });
    }

    // Filters
    if (filters.year) filtered = filtered.filter(row => row.year === filters.year);
    if (filters.type) filtered = filtered.filter(row => row.type === filters.type);
    if (filters.company) filtered = filtered.filter(row => row.comp === filters.company);

    return filtered;
  }, [data, filters, searchTerm]);

  // Table columns definition for reusable Table
  const columns = [
    { key: 'comp', label: 'Comp' },
    { key: 'year', label: 'Year' },
    { key: 'type', label: 'Type' },
    { key: 'government', label: 'Government' },
    { key: 'localSuppl', label: 'Local Supply' },
    { key: 'foreignSupplierSpending', label: 'Foreign Supplier Spending' },
    { key: 'employee', label: 'Employee' },
    { key: 'community', label: 'Community' },
    { key: 'depreciation', label: 'Depreciation' },
    { key: 'depletion', label: 'Depletion' },
    { key: 'others', label: 'Others' },
  ];

  // Actions column for edit button
  const actions = (row) => (
    <IconButton size="small">
      <EditIcon />
    </IconButton>
  );

  // Prepare options for Filter components (ensure no undefined/empty, sorted, and unique)
  const yearOptions = useMemo(
    () =>
      Array.from(new Set(data.map(row => row.year).filter(Boolean)))
        .sort((a, b) => b - a)
        .map(year => ({ label: String(year), value: year })),
    [data]
  );
  const typeOptions = useMemo(
    () =>
      Array.from(new Set(data.map(row => row.type).filter(Boolean)))
        .sort()
        .map(type => ({ label: type, value: type })),
    [data]
  );
  const companyOptions = useMemo(
    () =>
      Array.from(new Set(data.map(row => row.comp).filter(Boolean)))
        .sort()
        .map(comp => ({ label: comp, value: comp })),
    [data]
  );

  // Calculate total pages for external pagination
  const totalPages = Math.ceil(processedData.length / rowsPerPage);

  // Handle page change
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

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
                Economic - Expenditures
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
                onClick={() => setIsImportModalOpen(true)}
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

          {/* Search and Filter Section (replaced with custom components) */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Search
              onSearch={val => {
                setSearchTerm(val);
                setPage(1);
              }}
              placeholder="Search by year, company, or values..."
              suggestions={[
                ...new Set([
                  ...data.map(row => row.comp).filter(Boolean),
                  ...data.map(row => row.type).filter(Boolean),
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
            <Filter
              label="Type"
              options={[{ label: 'All Types', value: '' }, ...typeOptions]}
              value={filters.type}
              onChange={val => {
                setFilters(prev => ({ ...prev, type: val }));
                setPage(1);
              }}
              placeholder="Type"
            />
            <Filter
              label="Company"
              options={[{ label: 'All Companies', value: '' }, ...companyOptions]}
              value={filters.company}
              onChange={val => {
                setFilters(prev => ({ ...prev, company: val }));
                setPage(1);
              }}
              placeholder="Company"
            />
          </Box>

          {/* Unified Table with internal sorting and pagination */}
          <Table
            columns={columns}
            rows={processedData} // Pass ALL processed data
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={handlePageChange}
            initialSort={{ key: 'year', direction: 'desc' }} // Default sort by year desc
            actions={actions}
            emptyMessage="No data available."
          />

          {/* Pagination */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              page={page}
              count={totalPages}
              onChange={handlePageChange}
            />
          </Box>
          {isAddModalOpen && (
            <Overlay onClose={() => setIsAddModalOpen(false)}>
              <AddEconExpendituresModal 
                onClose={() => {
                  setIsAddModalOpen(false);
                  // Reset page to 1 to show new data at top
                  setPage(1);
                  fetchExpendituresData(); // Refresh data after adding
                }} 
              />
            </Overlay>
          )}
          {isImportModalOpen && (
            <Overlay onClose={() => setIsImportModalOpen(false)}>
              <ImportEconExpendituresModal
                onClose={() => {
                  setIsImportModalOpen(false);
                  // Reset page to 1 to show new data at top
                  setPage(1);
                  fetchExpendituresData(); // Refresh data after import
                }}
              />
            </Overlay>
          )}
        </div>
      </Box>
    </Box>
  );
}

export default EconomicExpenditures;