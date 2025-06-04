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
import ClearIcon from '@mui/icons-material/Clear';
import api from '../../services/api';
import Overlay from '../../components/modal';
import Sidebar from '../../components/Sidebar';
import AddEnergyElectricityModal from '../../envi_components/AddEnergyElectricityModal';
import AddEnergyDieselModal from '../../envi_components/AddEnergyDieselModal';
import ImportFileModal from '../../components/ImportFileModal';
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
  const [isImportdModalOpen, setIsImportModalOpen] = useState(false);
  const [selected, setSelected] = useState('Electricity'); // Default selection
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: 'year',
    direction: 'desc'
  });
  
  const rowsPerPage = 10;

  const [filters, setFilters] = useState({
    year: '',
    quarter: '',
    company: '',
    source: '',
    property: '',
    type: '',
    status: '',
    month: '',
  });

  const isFiltering = useMemo(() => {
    return Object.values(filters).some(v => v !== null && v !== '');
  }, [filters]);

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

  // Prepare options for Filter components (ensure no undefined/empty, sorted, and unique)
  const generateOptions = (data, field, sortFn = (a, b) => a.localeCompare(b)) => {
    const set = new Set(data.map(row => row[field]).filter(Boolean));
    const array = Array.from(set);
    if (field === 'year') {
      return array
        .map(year => parseInt(year, 10))
        .filter(year => !isNaN(year))
        .sort((a, b) => a - b)
        .map(year => ({ label: year, value: year }));
    }
    if (field === 'month') {
      const monthOrder = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      return array
        .sort((a, b) => monthOrder.indexOf(a) - monthOrder.indexOf(b))
        .map(month => ({ label: month, value: month }));
    }
    return array.sort(sortFn).map(item => ({ label: item, value: item }));
  };

  const companyOptions = useMemo(() => generateOptions(data, 'company'), [data]);
  const yearOptions = useMemo(() => generateOptions(data, 'year'), [data]);
  const quarterOptions = useMemo(() => generateOptions(data, 'quarter'), [data]);
  const sourceOptions = useMemo(() => generateOptions(data, 'source'), [data]);
  const properyOptions = useMemo(() => generateOptions(data, 'property'), [data]);
  const typeOptions = useMemo(() => generateOptions(data, 'type'), [data]);
  const statusOptions = useMemo(() => generateOptions(data, 'status'), [data]);
  const monthOptions = useMemo(() => generateOptions(data, 'month'), [data]);

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
    return data.filter((item) => {
      const matchesSearch =
        !searchQuery ||
        Object.values(item).some((val) =>
          val?.toString().toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesCompany = !filters.company || item.company === filters.company;
      const matchesYear = !filters.year || Number(item.year) === Number(filters.year);
      const matchesQuarter = !filters.quarter || item.quarter === filters.quarter;
      const matchesSource = !filters.source || item.source === filters.source;
      const matchesProperty = !filters.property || item.property === filters.property;
      const matchesType = !filters.type || item.type === filters.type;
      const matchesStatus = !filters.status || item.status === filters.status;
      const matchesMonth = !filters.month || item.month === filters.month;

      return matchesSearch && matchesCompany && matchesYear && matchesQuarter && 
      matchesSource && matchesProperty && matchesType && matchesStatus && matchesMonth;
    });
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

  const filteredData = useMemo(() => getFilteredData(), [data, filters, searchQuery]);
  console.log(filteredData);

  const sortedData = useMemo(() => getSortedData(filteredData), [filteredData, sortConfig]);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return sortedData.slice(start, start + rowsPerPage);
  }, [sortedData, page]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const exportToExcel = async (filteredData) => {
    try {
      const response = await api.post(
        'environment/export_excel',
        filteredData,
        {
          responseType: 'blob', // ensures the response is treated as binary
        }
      );
  
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
  
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'exported_energy_data.xlsx';
      a.click();
  
      // Clean up
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export Excel:', error);
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
              onClick={() => exportToExcel(filteredData)}
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
        <Box sx={{ display: 'flex', gap: '0.5rem', mb: 1 }}>
          <Search 
            onSearch={setSearchQuery} 
            suggestions={suggestions} 
          />
          <Filter
            label="Company"
            options={[{ label: 'All Company', value: '' }, ...companyOptions]}
            value={filters.company}
            onChange={val => {
              setFilters(prev => ({ ...prev, company: val }));
              setPage(1);
            }}
            placeholder="Company"
          />
          
          {selected === 'Electricity' && (
            <Filter
              label="Source"
              options={[{ label: 'All Source', value: '' }, ...sourceOptions]}
              value={filters.source}
              onChange={val => {
                setFilters(prev => ({ ...prev, source: val }));
                setPage(1);
              }}
              placeholder="Source"
            />
          )}

          {selected === 'Diesel' && (
            <>
            {/*
              <Filter
                label="Property"
                options={[{ label: 'All Property', value: '' }, ...properyOptions]}
                value={filters.property}
                onChange={val => {
                  setFilters(prev => ({ ...prev, property: val }));
                  setPage(1);
                }}
                placeholder="Property"
              />
              */}
              <Filter
                label="Type"
                options={[{ label: 'All Type', value: '' }, ...typeOptions]}
                value={filters.type}
                onChange={val => {
                  setFilters(prev => ({ ...prev, type: val }));
                  setPage(1);
                }}
                placeholder="Type"
              />
              <Filter
                label="Month"
                options={[{ label: 'All Month', value: '' }, ...monthOptions]}
                value={filters.month}
                onChange={val => {
                  setFilters(prev => ({ ...prev, month: val }));
                  setPage(1);
                }}
                placeholder="Month" 
              />
            </>
          )}
          <Filter
            label="Quarter"
            options={[{ label: 'All Quarter', value: '' }, ...quarterOptions]}
            value={filters.quarter}
            onChange={val => {
              setFilters(prev => ({ ...prev, quarter: val }));
              setPage(1);
            }}
            placeholder="Quarter"
          />
          <Filter
            label="Year"
            options={[{ label: 'All Year', value: '' }, ...yearOptions]}
            value={filters.year}
            onChange={val => {
              setFilters(prev => ({ ...prev, year: val }));
              setPage(1);
            }}
            placeholder="Year"
          />
          <Filter
            label="Status"
            options={[{ label: 'All Status', value: '' }, ...statusOptions]}
            value={filters.status}
            onChange={val => {
              setFilters(prev => ({ ...prev, status: val }));
              setPage(1);
            }}
            placeholder="Status"  
          />

          {isFiltering && (
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
                company: '',
                year: '',
                quarter: '',
                source: '',
                property: '',
                type: '',
                status: '',
                month: '',
              })}
            >
              Clear
            </Button>
          )}

        </Box>

        {/* Custom Table Component */}
        <CustomTable
          columns={columns}
          rows={paginatedData}
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
        { isAddModalOpen && (
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
        { isImportdModalOpen && (
          <Overlay onClose={() => setIsImportModalOpen(false)}>
            {selected === 'Electricity' ? (
                <ImportFileModal
                  title="Energy - Electricity"
                  downloadPath="environment/create_template/envi_electric_consumption"
                  uploadPath="environment/bulk_upload_electric_consumption"
                  onClose={() => setIsImportModalOpen(false)} // or any close handler
                />
            ) : (
                <ImportFileModal
                  title="Energy - Diesel"
                  downloadPath="environment/create_template/envi_diesel_consumption"
                  uploadPath="environment/bulk_upload_diesel_consumption"
                  onClose={() => setIsImportModalOpen(false)} // or any close handler
                />       
            )}
          </Overlay>
        )}
      </Container>
    </Box>
  );
}

export default EnvironmentEnergy;