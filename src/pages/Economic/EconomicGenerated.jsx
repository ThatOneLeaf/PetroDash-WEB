import { useState, useEffect } from 'react';
import { Button, Box } from '@mui/material';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import AddIcon from '@mui/icons-material/Add';
import api from '../../services/api';
import exportData from '../../services/export';
import Overlay from '../../components/modal';
import AddValueGeneratedModal from './modals/AddValueGeneratedModal';
import ImportEconGeneratedModal from './modals/ImportEconGeneratedModal';
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

  // Table actions (optional)
  const renderActions = (row) => (
    <></>
    // Add action buttons here if needed
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
                Economic - Generated
              </h2>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Button
                variant="contained"
                startIcon={<FileUploadIcon />}
                style={{ backgroundColor: '#182959' }}
                onClick={handleExport}
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
        </div>
      </Box>
    </Box>
  );
}

export default EconomicGenerated;
