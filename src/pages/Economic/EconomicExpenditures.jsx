import { useState, useEffect } from 'react';
import {
  Table,
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
} from '@mui/material';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import AddIcon from '@mui/icons-material/Add';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import EditIcon from '@mui/icons-material/Edit';
import api from '../../services/api';
import Overlay from '../../components/modal';
import Sidebar from '../../components/Sidebar';
import AddEconExpendituresModal from '../../components/AddEconExpendituresModal';

function EconomicExpenditures() {
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

  const [searchTerm, setSearchTerm] = useState('');

  const getFilteredData = () => {
    let filteredData = [...data];
    
    // Apply search filter
    if (searchTerm) {
      filteredData = filteredData.filter(row => 
        row.comp.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        row.year.toString().includes(searchTerm)
      );
    }

    // Apply filters
    if (filters.year) {
      filteredData = filteredData.filter(row => row.year === filters.year);
    }
    if (filters.type) {
      filteredData = filteredData.filter(row => row.type === filters.type);
    }
    if (filters.company) {
      filteredData = filteredData.filter(row => row.comp === filters.company);
    }
    
    return filteredData;
  };

  // Update getCurrentPageData to use filtered data
  const getCurrentPageData = () => {
    const filteredData = getFilteredData();
    const sortedData = getSortedData(filteredData);
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return sortedData.slice(start, end);
  };

  const totalPages = Math.ceil(getFilteredData().length / rowsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />;
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
            <TextField 
                placeholder="Search"
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ width: 200 }}
            />
            
            {/* Year Filter */}
            <Select
                value={filters.year}
                onChange={(e) => setFilters(prev => ({ ...prev, year: e.target.value }))}
                displayEmpty
                size="small"
                sx={{ width: 120 }}
            >
                <MenuItem value="">All Years</MenuItem>
                {[...new Set(data.map(row => row.year))].sort().reverse().map(year => (
                <MenuItem key={year} value={year}>{year}</MenuItem>
                ))}
            </Select>

            {/* Type Filter */}
            <Select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                displayEmpty
                size="small"
                sx={{ width: 200 }}
            >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="Cost of Sales">Cost of Sales</MenuItem>
                <MenuItem value="General and Administrative">General and Administrative</MenuItem>
            </Select>

            {/* Company Filter */}
            <Select
                value={filters.company}
                onChange={(e) => setFilters(prev => ({ ...prev, company: e.target.value }))}
                displayEmpty
                size="small"
                sx={{ width: 200 }}
            >
                <MenuItem value="">All Companies</MenuItem>
                {[...new Set(data.map(row => row.comp))].sort().map(comp => (
                <MenuItem key={comp} value={comp}>{comp}</MenuItem>
                ))}
            </Select>
          </Box>

          {/* Table */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow style={{ backgroundColor: '#182959' }}>
                  <TableCell style={{ color: 'white', fontWeight: 'bold' }}>Comp</TableCell>
                  <TableCell style={{ color: 'white', fontWeight: 'bold' }}>Year</TableCell>
                  <TableCell style={{ color: 'white', fontWeight: 'bold' }}>Type</TableCell>
                  <TableCell style={{ color: 'white', fontWeight: 'bold' }}>Government</TableCell>
                  <TableCell style={{ color: 'white', fontWeight: 'bold' }}>Local Suppl</TableCell>
                  <TableCell style={{ color: 'white', fontWeight: 'bold' }}>Foreign Supplier Spending</TableCell>
                  <TableCell style={{ color: 'white', fontWeight: 'bold' }}>Employee</TableCell>
                  <TableCell style={{ color: 'white', fontWeight: 'bold' }}>Community</TableCell>
                  <TableCell style={{ color: 'white', fontWeight: 'bold' }}>Depreciation</TableCell>
                  <TableCell style={{ color: 'white', fontWeight: 'bold' }}>Depletion</TableCell>
                  <TableCell style={{ color: 'white', fontWeight: 'bold' }}>Others</TableCell>
                  <TableCell style={{ color: 'white', fontWeight: 'bold' }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getCurrentPageData().map((row, index) => (
                  <TableRow key={index} hover>
                    <TableCell>{row.comp}</TableCell>
                    <TableCell>{row.year}</TableCell>
                    <TableCell>{row.type}</TableCell>
                    <TableCell>{row.government}</TableCell>
                    <TableCell>{row.localSuppl}</TableCell>
                    <TableCell>{row.foreignSupplierSpending}</TableCell>
                    <TableCell>{row.employee}</TableCell>
                    <TableCell>{row.community}</TableCell>
                    <TableCell>{row.depreciation}</TableCell>
                    <TableCell>{row.depletion}</TableCell>
                    <TableCell>{row.others}</TableCell>
                    <TableCell>
                      <IconButton size="small">
                        <EditIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center',
            marginTop: '2rem',
            gap: '0.5rem'
          }}>
            <Button
              onClick={() => handlePageChange(1)}
              variant="outlined"
              size="small"
              disabled={page === 1}
            >
              {'<<'}
            </Button>
            <Button
              onClick={() => handlePageChange(page - 1)}
              variant="outlined"
              size="small"
              disabled={page === 1}
            >
              {'<'}
            </Button>
            
            {[...Array(totalPages)].map((_, index) => (
              <Button
                key={index + 1}
                variant={page === index + 1 ? 'contained' : 'outlined'}
                size="small"
                onClick={() => handlePageChange(index + 1)}
                style={{
                  minWidth: '40px',
                  backgroundColor: page === index + 1 ? '#182959' : 'transparent'
                }}
              >
                {index + 1}
              </Button>
            ))}

            <Button
              onClick={() => handlePageChange(page + 1)}
              variant="outlined"
              size="small"
              disabled={page === totalPages}
            >
              {'>'}
            </Button>
            <Button
              onClick={() => handlePageChange(totalPages)}
              variant="outlined"
              size="small"
              disabled={page === totalPages}
            >
              {'>>'}
            </Button>
          </div>
          {isAddModalOpen && (
            <Overlay onClose={() => setIsAddModalOpen(false)}>
              <AddEconExpendituresModal 
                onClose={() => {
                  setIsAddModalOpen(false);
                  fetchExpendituresData(); // Refresh data after adding
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