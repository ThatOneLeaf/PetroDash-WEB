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
} from '@mui/material';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import AddIcon from '@mui/icons-material/Add';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import api from '../../services/api';
import Overlay from '../../components/modal';
import AddValueGeneratedModal from '../../components/Economic/AddValueGeneratedModal';
import Sidebar from '../../components/Sidebar';

function EconomicGenerated() {
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

  useEffect(() => {
    fetchEconomicData();
  }, []); // Remove sortConfig dependency

  const fetchEconomicData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/economic/value-generated-data');
      console.log('Data from API:', response.data);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching economic data:', error);
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

  const renderSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />;
  };

  // Sort data locally
  const getSortedData = () => {
    const sortedData = [...data].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sortedData;
  };

  // Get current page data from sorted data
  const getCurrentPageData = () => {
    const sortedData = getSortedData();
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return sortedData.slice(start, end);
  };

  // Calculate total pages based on data length
  const totalPages = Math.ceil(data.length / rowsPerPage);

  // Handle page changes
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
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
                Economic - Generated
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

          {/* Table with updated colors */}
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow style={{ backgroundColor: '#182959' }}>
                  {[
                    { key: 'year', label: 'Year' },
                    { key: 'electricitySales', label: 'Electricity Sales' },
                    { key: 'oilRevenues', label: 'Oil Revenues' },
                    { key: 'otherRevenues', label: 'Other Revenues' },
                    { key: 'interestIncome', label: 'Interest Income' },
                    { key: 'shareInNetIncomeOfAssociate', label: 'Share in Net Income of Associate' },
                    { key: 'miscellaneousIncome', label: 'Miscellaneous Income' },
                    { key: 'totalRevenue', label: 'Total Revenue (₱)' }
                  ].map(({ key, label }) => (
                    <TableCell 
                      key={key}
                      onClick={() => handleSort(key)}
                      style={{ 
                        color: 'white',
                        cursor: 'pointer',
                        padding: '16px',
                        fontWeight: 'bold',
                        whiteSpace: 'nowrap',
                        userSelect: 'none'
                      }}
                    >
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        gap: '4px' 
                      }}>
                        {label}
                        {renderSortIcon(key)}
                      </div>
                    </TableCell>
                  ))}
                  <TableCell 
                    style={{ 
                      color: 'white',
                      padding: '16px',
                      fontWeight: 'bold',
                      width: '100px'
                    }}
                  >
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getCurrentPageData().map((row) => (
                  <TableRow 
                    key={row.year}
                    hover
                  >
                    <TableCell>{row.year}</TableCell>
                    <TableCell>{row.electricitySales.toLocaleString()}</TableCell>
                    <TableCell>{row.oilRevenues.toLocaleString()}</TableCell>
                    <TableCell>{row.otherRevenues.toLocaleString()}</TableCell>
                    <TableCell>{row.interestIncome.toLocaleString()}</TableCell>
                    <TableCell>{row.shareInNetIncomeOfAssociate.toLocaleString()}</TableCell>
                    <TableCell>{row.miscellaneousIncome.toLocaleString()}</TableCell>
                    <TableCell>{row.totalRevenue.toLocaleString()}</TableCell>
                    <TableCell style={{ textAlign: 'center' }}>
                      <IconButton size="small">
                        {/* Add your action icon here */}
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination with updated colors */}
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

          {/* Add Modal */}
          {isAddModalOpen && (
            <Overlay onClose={() => setIsAddModalOpen(false)}>
              <AddValueGeneratedModal 
                onClose={() => {
                  setIsAddModalOpen(false);
                  fetchEconomicData();
                }} 
              />
            </Overlay>
          )}
        </div>
      </Box>
    </Box>
  );
}

export default EconomicGenerated;
