import { useMemo, useState, useEffect } from 'react';
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
  Container,
  Typography,
} from '@mui/material';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import AddIcon from '@mui/icons-material/Add';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import EditIcon from '@mui/icons-material/Edit';
import api from '../../services/api';
import Overlay from '../../components/modal';
import Sidebar from '../../components/Sidebar';
import AddEnergyElectricityModal from '../../envi_components/AddEnergyElectricityModal';
import AddEnergyDieselModal from '../../envi_components/AddEnergyDieselModal';
import Filter from '../../components/Filter/Filter';
import Search from '../../components/Filter/Search';
import CustomTable from '../../components/Table/Table'; // Adjust path as needed
import Pagination from '../../components/Pagination/pagination'; // Adjust path as needed

function EnvironmentEnergy() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selected, setSelected] = useState('Electricity'); // Default selection
  const [searchQuery, setSearchQuery] = useState("");
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
    if (selected === 'Electricity') {
      fetchElectricityData();
    }
    if (selected === 'Diesel') {
      fetchDieselData();
    }
  }, [selected]);

  const fetchElectricityData = async () => {
    try {
      setLoading(true);
      const response = await api.get('environment/electric_consumption'); 
      console.log('Electricity data from API:', response.data);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching electric consumption data:', error);
      setError('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  const fetchDieselData = async () => {
    try {
      setLoading(true);
      const response = await api.get('environment/diesel_consumption'); 
      console.log('Diesel data from API:', response.data);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching diesel consumption data:', error);
      setError('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  const columns = useMemo(() => {
     if (!Array.isArray(data) || data.length === 0 || typeof data[0] !== 'object') return [];
     return Object.keys(data[0])
        .slice(1) // This will exclude the first column
        .map((key) => ({
       key,
        label: key.charAt(0).toUpperCase() + key.slice(1),
      }));
  }, [data]);

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

  const getFilteredData = () => {
    let filteredData = [...data];

    if (searchQuery) {
      const lower = searchQuery.toLowerCase();
      filteredData = filteredData.filter((item) =>
        Object.values(item).some(
          (val) =>
            val &&
            val.toString().toLowerCase().includes(lower)
        )
      );
    }

    return filteredData;
  };

  const suggestions = useMemo(() => {
    const uniqueValues = new Set();
    data.forEach((item) => {
      Object.values(item).forEach((val) => {
        if (val) uniqueValues.add(val.toString());
      });
    });
    return Array.from(uniqueValues);
  }, [data]);

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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Container maxWidth={false} disableGutters sx={{ flexGrow: 1, padding: '2rem' }}>
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
              Environment - Energy
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
            >
              EXPORT DATA
            </Button>
            <Button
              variant="contained"
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
              onClick={() => setIsAddModalOpen(true)}
            >
              ADD RECORD
            </Button>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
          {['Electricity', 'Diesel'].map((type) => (
            <Button
              key={type}
              onClick={() => setSelected(type)}
              variant="contained"
              sx={{
                backgroundColor: selected === type ? '#2B8C37' : '#9ca3af',
                borderRadius: '15px',
                padding: '3px 6px',
                width: '25%',
                fontSize: '0.85rem',
                fontWeight: selected === type ? 800 : 700,
                color: 'white',
                '&:hover': {
                  backgroundColor: selected === type ? '#256d2f' : '#6b7280',
                },
              }}
            >
              {type}
            </Button>
          ))}
        </Box>

        {/* Search Input */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: '0.5rem'}}>
          <Search 
            onSearch={setSearchQuery} 
            suggestions={suggestions} 
          />

        </Box>

        {/* Custom Table Component */}
         <CustomTable
          columns={columns}
          rows={getCurrentPageData()}
          onSort={handleSort}
          sortConfig={sortConfig}
          emptyMessage="No energy data found."
          maxHeight="69vh"
          minHeight="300px"
          actions={(row) => (
            <IconButton size="small">
              <EditIcon />
            </IconButton>
          )}
        />
        
        {/* Custom Pagination Component */}
        <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
          <Pagination 
            page={page}
            count={totalPages}
            onChange={handlePageChange}
          />
        </Box>

        {/* Conditional rendering for modals */}
        {isAddModalOpen && (
          <Overlay onClose={() => setIsAddModalOpen(false)}>
            {selected === 'Electricity' ? (
              <AddEnergyElectricityModal 
                onClose={() => {
                  setIsAddModalOpen(false);
                  fetchElectricityData(); // Refresh data after adding
                }} 
              />
            ) : (
              <AddEnergyDieselModal 
                onClose={() => {
                  setIsAddModalOpen(false);
                  fetchDieselData(); // Refresh data after adding
                }} 
              />
            )}
          </Overlay>
        )}
      </Container>
    </Box>
  );
}

export default EnvironmentEnergy;