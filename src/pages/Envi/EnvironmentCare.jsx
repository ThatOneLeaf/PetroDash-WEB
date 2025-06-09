import { useState, useEffect } from 'react';
import {
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
import AddEnvironmentEnergyModal from '../../components/envi_components/AddEnergyElectricityModal';
import Table from '../../components/Table/Table';
import Pagination from '../../components/Pagination/pagination';
import Filter from '../../components/Filter/Filter';
import Search from '../../components/Filter/Search';

function EnvironmentCare() {
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
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start'}}>
              <h1 style={{ 
                fontSize: '1rem', 
                fontWeight: 'bold',
              }}>
                REPOSITORY
              </h1>
              <h2 style={{ fontSize: '3.2rem', color: '#182959', fontWeight: 900, textShadow: '0px 0px 0 #182959'}}>
                Environment - C.A.R.E.
              </h2>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Button
                variant="contained"
                startIcon={<FileUploadIcon />}
                sx={{
                  backgroundColor: '#182959',
                  borderRadius: '999px',
                  padding: '9px 18px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  '&:hover': {
                    backgroundColor: '#0f1a3c', // darker shade on hover
                  },
                }}
              >
                EXPORT DATA
              </Button>
              <Button
                variant="contained"
                sx={{ 
                  backgroundColor: '#182959',
                  borderRadius: '999px', // Fully rounded (pill-style)
                  padding: '9px 18px',    // Optional: adjust padding for better look
                  fontSize: '1rem', // Optional: adjust font size
                  fontWeight: 'bold',
                  '&:hover': {
                    backgroundColor: '#0f1a3c', // darker shade on hover
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
                  borderRadius: '999px', // Fully rounded (pill-style)
                  padding: '9px 18px',    // Optional: adjust padding for better look 
                  fontSize: '1rem', // Optional: adjust font size
                  fontWeight: 'bold',
                  '&:hover': {
                    backgroundColor: '#256d2f', // darker shade of #2B8C37
                  },
                }}
                onClick={() => setIsAddModalOpen(true)}
              >
                ADD RECORD
              </Button>
            </div>
          </div>





          {isAddModalOpen && (
            <Overlay onClose={() => setIsAddModalOpen(false)}>
              <AddEnvironmentEnergyModal 
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

export default EnvironmentCare;