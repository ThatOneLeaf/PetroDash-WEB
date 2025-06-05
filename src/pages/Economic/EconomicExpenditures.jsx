import { useState, useEffect, useMemo } from 'react';
import {
  Paper,
  Button,
  IconButton,
  Box,
  Typography,
  Tooltip,
} from '@mui/material';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import api from '../../services/api';
import exportData from '../../services/export';
import Overlay from '../../components/modal';
import Sidebar from '../../components/Sidebar';
import AddEconExpendituresModal from './modals/AddEconExpendituresModal';
import ImportEconExpendituresModal from './modals/ImportEconExpendituresModal';
import EditEconExpendituresModal from './modals/EditEconExpendituresModal';
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
  const [isInternalModalOpen, setIsInternalModalOpen] = useState(false);
  const [selectedInternal, setSelectedInternal] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEditRecord, setSelectedEditRecord] = useState(null);
  
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

  // Handle CSV export
  const handleExport = () => {
    // Flatten the grouped data for export
    const flattenedData = [];
    
    processedData.forEach(row => {
      Object.keys(row.types).forEach(type => {
        const typeData = row.types[type];
        flattenedData.push({
          company: row.comp,
          year: row.year,
          type: type,
          government: typeData.government,
          localSupplierSpending: typeData.localSupplierSpending,
          foreignSupplierSpending: typeData.foreignSupplierSpending,
          employee: typeData.employee,
          community: typeData.community,
          depreciation: typeData.depreciation,
          depletion: typeData.depletion,
          others: typeData.others,
          totalDistributed: typeData.government + typeData.localSupplierSpending + 
                           typeData.foreignSupplierSpending + typeData.employee + typeData.community,
          totalExpenditures: typeData.government + typeData.localSupplierSpending + 
                           typeData.foreignSupplierSpending + typeData.employee + typeData.community +
                           typeData.depreciation + typeData.depletion + typeData.others
        });
      });
    });
    
    const exportColumns = [
      { key: 'company', label: 'Company ID' },
      { key: 'year', label: 'Year' },
      { key: 'type', label: 'Type' },
      { key: 'government', label: 'Government' },
      { key: 'localSupplierSpending', label: 'Local Supplier Spending' },
      { key: 'foreignSupplierSpending', label: 'Foreign Supplier Spending' },
      { key: 'employee', label: 'Employee' },
      { key: 'community', label: 'Community' },
      { key: 'depreciation', label: 'Depreciation' },
      { key: 'depletion', label: 'Depletion' },
      { key: 'others', label: 'Others' },
      { key: 'totalDistributed', label: 'Total Distributed' },
      { key: 'totalExpenditures', label: 'Total Expenditures' }
    ];
    
    const filename = `economic_expenditures_${new Date().toISOString().split('T')[0]}`;
    exportData(flattenedData, filename, exportColumns);
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
          'government', 'localSupplierSpending', 'foreignSupplierSpending', 
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

    // Group by company and year to create split-cell rows
    const grouped = {};
    
    filtered.forEach(row => {
      const key = `${row.comp}-${row.year}`;
      if (!grouped[key]) {
        grouped[key] = {
          comp: row.comp,
          year: row.year,
          types: {},
          totalDistributed: 0,
          totalExpenditures: 0
        };
      }
      
      // Store type data
      grouped[key].types[row.type] = {
        government: Number(row.government) || 0,
        localSupplierSpending: Number(row.localSupplierSpending) || 0,
        foreignSupplierSpending: Number(row.foreignSupplierSpending) || 0,
        employee: Number(row.employee) || 0,
        community: Number(row.community) || 0,
        depreciation: Number(row.depreciation) || 0,
        depletion: Number(row.depletion) || 0,
        others: Number(row.others) || 0
      };
      
      // Add to totals
      grouped[key].totalDistributed += Number(row.totalDistributed) || 0;
      grouped[key].totalExpenditures += Number(row.totalExpenditures) || 0;
    });

    // Convert to array and sort
    return Object.values(grouped).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return a.comp.localeCompare(b.comp);
    });
  }, [data, filters, searchTerm]);

  // Helper function to render split cell with both types
  const renderSplitCell = (row, field, labelMap = {}) => {
    const types = Object.keys(row.types).sort();
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, minHeight: '40px', justifyContent: 'center' }}>
        {types.map((type, index) => {
          const value = row.types[type]?.[field] || 0;
          const label = labelMap[type] || type;
          return (
            <Box key={type} sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              fontSize: '0.875rem',
              borderBottom: index < types.length - 1 ? '1px solid #f0f0f0' : 'none',
              pb: index < types.length - 1 ? 0.5 : 0
            }}>
              <Typography variant="caption" sx={{ color: '#666', fontSize: '0.75rem' }}>
                {label}:
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                {value.toLocaleString()}
              </Typography>
            </Box>
          );
        })}
      </Box>
    );
  };

  // Helper function to render clickable internal column
  const renderInternalCell = (row, labelMap = {}) => {
    const types = Object.keys(row.types).sort();
    
    const handleInternalClick = (e) => {
      e.stopPropagation(); // Prevent row click
      setSelectedInternal({ row, types });
      setIsInternalModalOpen(true);
    };

    return (
      <Box 
        onClick={handleInternalClick}
        sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 0.5, 
          minHeight: '40px', 
          justifyContent: 'center',
          cursor: 'pointer',
          '&:hover': {
            backgroundColor: '#f5f5f5',
            borderRadius: 1
          },
          p: 0.5,
          m: -0.5
        }}
      >
        {types.map((type, index) => {
          const depreciation = row.types[type]?.depreciation || 0;
          const depletion = row.types[type]?.depletion || 0;
          const others = row.types[type]?.others || 0;
          const total = depreciation + depletion + others;
          const label = labelMap[type] || type;
          
          return (
            <Box key={type} sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              fontSize: '0.875rem',
              borderBottom: index < types.length - 1 ? '1px solid #f0f0f0' : 'none',
              pb: index < types.length - 1 ? 0.5 : 0
            }}>
              <Typography variant="caption" sx={{ color: '#666', fontSize: '0.75rem' }}>
                {label}:
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.875rem', textDecoration: 'underline', color: '#1976d2' }}>
                {total.toLocaleString()}
              </Typography>
            </Box>
          );
        })}
      </Box>
    );
  };

  // Get unique types for abbreviations
  const uniqueTypes = useMemo(() => {
    const types = new Set();
    data.forEach(row => types.add(row.type));
    return Array.from(types).sort();
  }, [data]);

  // Create type abbreviation map
  const typeAbbrevMap = useMemo(() => {
    const map = {};
    uniqueTypes.forEach(type => {
      // Create abbreviations: "Cost of Sales" -> "CoS", "General and Administrative" -> "G&A"
      if (type.toLowerCase().includes('cost of sales') || type.toLowerCase().includes('cos')) {
        map[type] = 'CoS';
      } else if (type.toLowerCase().includes('general') && type.toLowerCase().includes('administrative')) {
        map[type] = 'G&A';
      } else {
        // Fallback: take first letter of each word
        map[type] = type.split(' ').map(word => word[0]).join('').toUpperCase();
      }
    });
    return map;
  }, [uniqueTypes]);

  // Table columns definition with split cells
  const columns = [
    { 
      key: 'comp', 
      label: 'Company ID'
    },
    { 
      key: 'year', 
      label: 'Year'
    },
    { 
      key: 'government', 
      label: 'Government',
      render: (val, row) => renderSplitCell(row, 'government', typeAbbrevMap)
    },
    { 
      key: 'localSupplierSpending', 
      label: 'Local Supplier Spending',
      render: (val, row) => renderSplitCell(row, 'localSupplierSpending', typeAbbrevMap)
    },
    { 
      key: 'foreignSupplierSpending', 
      label: 'Foreign Supplier Spending',
      render: (val, row) => renderSplitCell(row, 'foreignSupplierSpending', typeAbbrevMap)
    },
    { 
      key: 'employee', 
      label: 'Employee',
      render: (val, row) => renderSplitCell(row, 'employee', typeAbbrevMap)
    },
    { 
      key: 'community', 
      label: 'Community',
      render: (val, row) => renderSplitCell(row, 'community', typeAbbrevMap)
    },
    { 
      key: 'totalDistributed', 
      label: 'Total Distributed (₱)', 
      render: (val, row) => `₱ ${Number(row.totalDistributed || 0).toLocaleString()}`
    },
    { 
      key: 'internal', 
      label: 'Internal',
      render: (val, row) => renderInternalCell(row, typeAbbrevMap)
    },
    { 
      key: 'totalExpenditures', 
      label: 'Total Expenditures (₱)', 
      render: (val, row) => `₱ ${Number(row.totalExpenditures || 0).toLocaleString()}`
    },
  ];

  // Actions column for edit button
  const actions = (row) => (
    <IconButton 
      size="small" 
      onClick={(e) => {
        e.stopPropagation(); // Prevent row click
        setSelectedEditRecord(row);
        setIsEditModalOpen(true);
      }}
    >
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

          {/* Edit Modal */}
          {isEditModalOpen && selectedEditRecord && (
            <Overlay onClose={() => setIsEditModalOpen(false)}>
              <EditEconExpendituresModal
                selectedRecord={selectedEditRecord}
                onClose={() => {
                  setIsEditModalOpen(false);
                  setSelectedEditRecord(null);
                  fetchExpendituresData(); // Refresh data after editing
                }}
              />
            </Overlay>
          )}

          {/* Internal Breakdown Modal */}
          {isInternalModalOpen && selectedInternal && (
            <Overlay onClose={() => setIsInternalModalOpen(false)}>
              <Paper sx={{
                p: 4,
                width: { xs: '90vw', sm: '80vw', md: '70vw', lg: '60vw' },
                maxWidth: '800px',
                borderRadius: '16px',
                bgcolor: 'white'
              }}>
                <Typography variant="h5" sx={{ 
                  color: '#182959',
                  mb: 3,
                  fontWeight: 'bold' 
                }}>
                  Internal Accounting Breakdown
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ color: '#182959', mb: 2 }}>
                    {selectedInternal.row.comp} - {selectedInternal.row.year}
                  </Typography>
                </Box>

                {/* Show breakdown by type - Side by side layout */}
                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(auto-fit, minmax(300px, 1fr))' },
                  gap: 3,
                  mb: 3 
                }}>
                  {selectedInternal.types.map((type) => {
                    const typeData = selectedInternal.row.types[type];
                    const typeLabel = typeAbbrevMap[type] || type;
                    
                    return (
                      <Box key={type} sx={{ 
                        border: '1px solid #eee', 
                        borderRadius: 2, 
                        p: 3,
                        minHeight: 'fit-content'
                      }}>
                        <Typography variant="h6" sx={{ color: '#182959', mb: 2, fontWeight: 'bold' }}>
                          {type} ({typeLabel})
                        </Typography>
                        
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography>Depreciation:</Typography>
                            <Typography>₱ {(typeData?.depreciation || 0).toLocaleString()}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography>Depletion:</Typography>
                            <Typography>₱ {(typeData?.depletion || 0).toLocaleString()}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography>Others:</Typography>
                            <Typography>₱ {(typeData?.others || 0).toLocaleString()}</Typography>
                          </Box>
                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            borderTop: '1px solid #eee', 
                            pt: 1, 
                            fontWeight: 'bold',
                            mt: 1
                          }}>
                            <Typography>Type Total:</Typography>
                            <Typography sx={{ color: '#666', fontWeight: 'bold' }}>
                              ₱ {((typeData?.depreciation || 0) + (typeData?.depletion || 0) + (typeData?.others || 0)).toLocaleString()}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>

                {/* Company Total */}
                <Box sx={{ borderTop: '2px solid #182959', pt: 2, mt: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      Company Internal Total:
                    </Typography>
                    <Typography variant="h6" sx={{ color: '#182959', fontWeight: 'bold' }}>
                      ₱ {selectedInternal.types.reduce((total, type) => {
                        const typeData = selectedInternal.row.types[type];
                        return total + (typeData?.depreciation || 0) + (typeData?.depletion || 0) + (typeData?.others || 0);
                      }, 0).toLocaleString()}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'center',
                  mt: 3 
                }}>
                  <Button
                    variant="outlined"
                    onClick={() => setIsInternalModalOpen(false)}
                    sx={{ 
                      color: '#666',
                      borderColor: '#666',
                      '&:hover': { 
                        borderColor: '#333',
                        color: '#333'
                      }
                    }}
                  >
                    CLOSE
                  </Button>
                </Box>
              </Paper>
            </Overlay>
          )}
        </div>
      </Box>
    </Box>
  );
}

export default EconomicExpenditures;