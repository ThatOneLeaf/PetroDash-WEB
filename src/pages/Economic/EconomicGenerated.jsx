import { useState, useEffect } from 'react';
import { Button, Box, IconButton, Typography } from '@mui/material';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import api from '../../services/api';
import exportData from '../../services/export';
import Overlay from '../../components/modal';
import AddValueGeneratedModal from './modals/AddValueGeneratedModal';
import ImportEconGeneratedModal from './modals/ImportEconGeneratedModal';
import EditValueGeneratedModal from './modals/EditValueGeneratedModal';
import Sidebar from '../../components/Sidebar';
import Table from '../../components/Table/Table';
import Filter from '../../components/Filter/Filter';
import Search from '../../components/Filter/Search';
import Pagination from '../../components/Pagination/pagination';

function EconomicGenerated() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEditRecord, setSelectedEditRecord] = useState(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  // Table state - simplified
  const [filters, setFilters] = useState({});
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchEconomicData();
  }, []);

  const fetchEconomicData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/economic/value-generated-data');
      setData(response.data);
    } catch (error) {
      setError('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  // Handle CSV export
  const handleExport = () => {
    const exportColumns = [
      { key: 'year', label: 'Year' },
      { key: 'electricitySales', label: 'Electricity Sales' },
      { key: 'oilRevenues', label: 'Oil Revenues' },
      { key: 'otherRevenues', label: 'Other Revenues' },
      { key: 'interestIncome', label: 'Interest Income' },
      { key: 'shareInNetIncomeOfAssociate', label: 'Share in Net Income of Associate' },
      { key: 'miscellaneousIncome', label: 'Miscellaneous Income' },
      { key: 'totalRevenue', label: 'Total Revenue' }
    ];
    
    const filename = `economic_value_generated_${new Date().toISOString().split('T')[0]}`;
    exportData(processedData, filename, exportColumns);
  };

  // Table columns config
  const columns = [
    { key: 'year', label: 'Year',
      render: (val) => val
    },
    { key: 'electricitySales', label: 'Electricity Sales',
      render: (val) => val != null ? Number(val).toLocaleString() : ''
    },
    { key: 'oilRevenues', label: 'Oil Revenues',
      render: (val) => val != null ? Number(val).toLocaleString() : ''
    },
    { key: 'otherRevenues', label: 'Other Revenues',
      render: (val) => val != null ? Number(val).toLocaleString() : ''
    },
    { key: 'interestIncome', label: 'Interest Income',
      render: (val) => val != null ? Number(val).toLocaleString() : ''
    },
    { key: 'shareInNetIncomeOfAssociate', label: 'Share in Net Income of Associate',
      render: (val) => val != null ? Number(val).toLocaleString() : ''
    },
    { key: 'miscellaneousIncome', label: 'Miscellaneous Income',
      render: (val) => val != null ? Number(val).toLocaleString() : ''
    },
    { key: 'totalRevenue', label: 'Total Revenue (₱)',
      render: (val) => val != null ? `₱ ${Number(val).toLocaleString()}` : ''
    }
  ];

  // Filtering and searching logic
  const processedData = data
    .filter(row => {
      // Filter
      return Object.entries(filters).every(([key, value]) => {
        if (value == null || value.length === 0) return true;
        if (Array.isArray(value)) return value.includes(row[key]);
        return row[key] === value;
      });
    })
    .filter(row => {
      // Enhanced Search - searches year and all monetary values
      if (!search) return true;
      const searchStr = search.toLowerCase();
      
      // Search in year
      if (row.year && String(row.year).toLowerCase().includes(searchStr)) return true;
      
      // Search in monetary values (formatted and raw)
      const monetaryFields = [
        'electricitySales', 'oilRevenues', 'otherRevenues', 
        'interestIncome', 'shareInNetIncomeOfAssociate', 
        'miscellaneousIncome', 'totalRevenue'
      ];
      
      return monetaryFields.some(field => {
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

  // Year filter options (add "All Years" option at the top)
  const yearOptions = [
    { label: "All Years", value: "" },
    ...data
      .map(d => ({ label: d.year, value: d.year }))
      .filter((v, i, a) => a.findIndex(t => t.value === v.value) === i)
  ];

  // Table actions
  const renderActions = (row) => (
    <IconButton 
      size="small" 
      onClick={(e) => {
        e.stopPropagation();
        setSelectedEditRecord(row);
        setIsEditModalOpen(true);
      }}
    >
      <EditIcon />
    </IconButton>
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
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start'
            }}>
              <Typography sx={{ 
                fontSize: '0.75rem', 
                fontWeight: 800,
              }}>
                REPOSITORY
              </Typography>
              <Typography sx={{ 
                fontSize: '2.25rem', 
                color: '#182959', 
                fontWeight: 800
              }}>
                Economic - Generated
              </Typography>
            </Box>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button
                variant="contained"
                startIcon={<FileUploadIcon />}
                onClick={handleExport}
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
                onClick={() => setIsImportModalOpen(true)}
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
                onClick={() => setIsAddModalOpen(true)}
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
              >
                ADD RECORD
              </Button>
            </div>
          </div>

          {/* Search and Year Filter controls side by side */}
          <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
            <Search
              onSearch={setSearch}
              placeholder="Search by year or values..."
              suggestions={data.map(d => d.year.toString()).filter(Boolean).slice(0, 10)}
            />
            <Filter
              label="Year"
              options={yearOptions}
              value={filters.year ?? ''}
              onChange={val => setFilters(f => ({ ...f, year: val }))}
              multi={false}
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
            actions={renderActions}
            emptyMessage="No data available."
            selectable={false}
          />

          {/* Pagination */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Pagination
              page={page}
              count={totalPages}
              onChange={handlePageChange}
            />
          </Box>

          {/* Add Modal */}
          {isAddModalOpen && (
            <Overlay onClose={() => setIsAddModalOpen(false)}>
              <AddValueGeneratedModal
                onClose={() => {
                  setIsAddModalOpen(false);
                  // Reset page to 1 to show new data at top
                  setPage(1);
                  fetchEconomicData();
                }}
              />
            </Overlay>
          )}

          {/* Import Modal */}
          {isImportModalOpen && (
            <Overlay onClose={() => setIsImportModalOpen(false)}>
              <ImportEconGeneratedModal
                onClose={() => {
                  setIsImportModalOpen(false);
                  // Reset page to 1 to show new data at top
                  setPage(1);
                  fetchEconomicData(); // Refresh data after import
                }}
              />
            </Overlay>
          )}

          {/* Edit Modal */}
          {isEditModalOpen && selectedEditRecord && (
            <Overlay onClose={() => setIsEditModalOpen(false)}>
              <EditValueGeneratedModal
                selectedRecord={selectedEditRecord}
                onClose={() => {
                  setIsEditModalOpen(false);
                  setSelectedEditRecord(null);
                  fetchEconomicData(); // Refresh data after editing
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
