import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Paper,
  Button,
  IconButton,
  Box,
  Typography,
  Tooltip,
  CircularProgress
} from '@mui/material';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import api from '../../services/api';
import exportData from '../../services/export';
import Overlay from '../../components/modal';
import Sidebar from '../../components/Sidebar';

// Generated modals
import AddValueGeneratedModal from './modals/AddValueGeneratedModal';
import ImportEconGeneratedModal from './modals/ImportEconGeneratedModal';
import EditValueGeneratedModal from './modals/EditValueGeneratedModal';

// Expenditures modals
import AddEconExpendituresModal from './modals/AddEconExpendituresModal';
import ImportEconExpendituresModal from './modals/ImportEconExpendituresModal';
import EditEconExpendituresModal from './modals/EditEconExpendituresModal';

// Capital Provider modals
import AddCapitalProviderModal from './modals/AddCapitalProviderPaymentsModal';
import ImportEconCapitalProviderModal from './modals/ImportEconCapitalProviderModal';
import EditCapitalProviderModal from './modals/EditCapitalProviderModal';

import Table from '../../components/Table/Table';
import Pagination from '../../components/Pagination/pagination';
import Filter from '../../components/Filter/Filter';
import Search from '../../components/Filter/Search';
import RepositoryHeader from '../../components/RepositoryHeader';
import MultiSelectWithChips from '../../components/DashboardComponents/MultiSelectDropdown';

const sections = [
  { key: 'generated', label: 'Generated' },
  { key: 'expenditures', label: 'Expenditures' },
  { key: 'capital', label: 'Capital Provider' },
];

export default function EconomicRepository() {
  const [selected, setSelected] = useState('generated');
  const [sidebarMode, setSidebarMode] = useState("repository");
  const navigate = useNavigate();
  
  // Common state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  // Data state for each section
  const [generatedData, setGeneratedData] = useState([]);
  const [expendituresData, setExpendituresData] = useState([]);
  const [capitalData, setCapitalData] = useState([]);

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEditRecord, setSelectedEditRecord] = useState(null);
  const [isInternalModalOpen, setIsInternalModalOpen] = useState(false);
  const [selectedInternal, setSelectedInternal] = useState(null);

  // Filter and search states
  const [filters, setFilters] = useState({
    year: [],
    type: '',
    company: []
  });
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch data functions
  const fetchGeneratedData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/economic/value-generated-data');
      setGeneratedData(response.data);
    } catch (error) {
      setError('Error fetching generated data');
    } finally {
      setLoading(false);
    }
  };

  const fetchExpendituresData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/economic/expenditures');
      console.log('🔵 Raw Expenditures Data from API:', response.data);
      setExpendituresData(response.data);
    } catch (error) {
      setError('Error fetching expenditures data');
    } finally {
      setLoading(false);
    }
  };

  const fetchCapitalData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/economic/capital-provider-payments');
      setCapitalData(response.data);
    } catch (error) {
      setError('Error fetching capital provider data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data based on selected section
  useEffect(() => {
    setPage(1);
    setFilters({ year: [], type: '', company: [] });
    setSearchTerm('');
    
    if (selected === 'generated') {
      fetchGeneratedData();
    } else if (selected === 'expenditures') {
      fetchExpendituresData();
    } else if (selected === 'capital') {
      fetchCapitalData();
    }
  }, [selected]);

  // Get current data based on selection
  const getCurrentData = () => {
    switch (selected) {
      case 'generated': return generatedData;
      case 'expenditures': return expendituresData;
      case 'capital': return capitalData;
      default: return [];
    }
  };

  // Get columns based on selection
  const getColumns = () => {
    switch (selected) {
      case 'generated':
        return [
          { key: 'year', label: 'Year', render: (val) => val },
          { key: 'electricitySales', label: 'Electricity Sales', render: (val) => val != null ? Number(val).toLocaleString() : '' },
          { key: 'oilRevenues', label: 'Oil Revenues', render: (val) => val != null ? Number(val).toLocaleString() : '' },
          { key: 'otherRevenues', label: 'Other Revenues', render: (val) => val != null ? Number(val).toLocaleString() : '' },
          { key: 'interestIncome', label: 'Interest Income', render: (val) => val != null ? Number(val).toLocaleString() : '' },
          { key: 'shareInNetIncomeOfAssociate', label: 'Share in Net Income of Associate', render: (val) => val != null ? Number(val).toLocaleString() : '' },
          { key: 'miscellaneousIncome', label: 'Miscellaneous Income', render: (val) => val != null ? Number(val).toLocaleString() : '' },
          { key: 'totalRevenue', label: 'Total Revenue (₱)', render: (val) => val != null ? `₱ ${Number(val).toLocaleString()}` : '' }
        ];
      
      case 'expenditures':
        return [
          { key: 'comp', label: 'Company ID' },
          { key: 'year', label: 'Year' },
          { key: 'government', label: 'Government', render: (val, row) => renderSplitCell(row, 'government') },
          { key: 'localSupplierSpending', label: 'Local Suppliers', render: (val, row) => renderSplitCell(row, 'localSupplierSpending') },
          { key: 'foreignSupplierSpending', label: 'Foreign Suppliers', render: (val, row) => renderSplitCell(row, 'foreignSupplierSpending') },
          { key: 'employee', label: 'Employee', render: (val, row) => renderSplitCell(row, 'employee') },
          { key: 'community', label: 'Community', render: (val, row) => renderSplitCell(row, 'community') },
          { key: 'totalDistributed', label: 'Total Distributed (₱)', render: (val, row) => `₱ ${Number(row.totalDistributed || 0).toLocaleString()}` },
          { key: 'internal', label: 'Internal', render: (val, row) => renderInternalCell(row) },
          { key: 'totalExpenditures', label: 'Total Expenditures (₱)', render: (val, row) => `₱ ${Number(row.totalExpenditures || 0).toLocaleString()}` },
        ];
      
      case 'capital':
        return [
          { key: 'year', label: 'Year', render: (val) => val },
          { key: 'interest', label: 'Interest', render: (val) => val != null ? Number(val).toLocaleString() : '0' },
          { key: 'dividendsToNci', label: 'Dividends NCI', render: (val) => val != null ? Number(val).toLocaleString() : '0' },
          { key: 'dividendsToParent', label: 'Dividends Parent', render: (val) => val != null ? Number(val).toLocaleString() : '0' },
          { key: 'total', label: 'Total (₱)', render: (val) => val != null ? `₱ ${Number(val).toLocaleString()}` : '₱ 0' },
        ];
      
      default: return [];
    }
  };

  // Process data based on selection
  const processedData = useMemo(() => {
    const currentData = getCurrentData();
    let filtered = [...currentData];

    // Search functionality
    if (searchTerm) {
      filtered = filtered.filter(row => {
        const searchStr = searchTerm.toLowerCase();
        return Object.values(row).some(val => 
          val?.toString().toLowerCase().includes(searchStr)
        );
      });
    }

    // Filters
    if (filters.year && filters.year.length > 0) filtered = filtered.filter(row => filters.year.includes(row.year));
    if (filters.type) filtered = filtered.filter(row => row.type === filters.type);
    if (filters.company && filters.company.length > 0) filtered = filtered.filter(row => filters.company.includes(row.comp));

    // Special processing for expenditures
    if (selected === 'expenditures') {
      console.log('🟡 Filtered Expenditure Data (before grouping):', filtered);
      
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
        
        grouped[key].totalDistributed += Number(row.totalDistributed) || 0;
        grouped[key].totalExpenditures += Number(row.totalExpenditures) || 0;
      });

      const finalGroupedData = Object.values(grouped).sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return a.comp.localeCompare(b.comp);
      });

      console.log('🟢 Final Grouped Expenditure Data (for table display):', finalGroupedData);
      console.log('🟢 Sample grouped row structure:', finalGroupedData[0]);
      
      return finalGroupedData;
    }

    return filtered;
  }, [getCurrentData(), filters, searchTerm, selected]);

  // Helper functions for expenditures
  const uniqueTypes = useMemo(() => {
    if (selected !== 'expenditures') return [];
    const types = new Set();
    expendituresData.forEach(row => types.add(row.type));
    return Array.from(types).sort();
  }, [expendituresData, selected]);

  const renderSplitCell = (row, field) => {
    const types = Object.keys(row.types).sort();
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, minHeight: '40px', justifyContent: 'center' }}>
        {types.map((type, index) => {
          const value = row.types[type]?.[field] || 0;
          return (
            <Box key={type} sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              fontSize: '0.875rem',
              borderBottom: index < types.length - 1 ? '1px solid #f0f0f0' : 'none',
              pb: index < types.length - 1 ? 0.5 : 0
            }}>
              <Typography variant="caption" sx={{ color: '#666', fontSize: '0.75rem' }}>
                {type}:
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

  const renderInternalCell = (row) => {
    const types = Object.keys(row.types).sort();
    
    const handleInternalClick = (e) => {
      e.stopPropagation();
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
          
          return (
            <Box key={type} sx={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              fontSize: '0.875rem',
              borderBottom: index < types.length - 1 ? '1px solid #f0f0f0' : 'none',
              pb: index < types.length - 1 ? 0.5 : 0
            }}>
              <Typography variant="caption" sx={{ color: '#666', fontSize: '0.75rem' }}>
                {type}:
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

  // Export function
  const handleExport = () => {
    let exportColumns = [];
    let filename = '';
    let dataToExport = processedData;

    switch (selected) {
      case 'generated':
        exportColumns = [
          { key: 'year', label: 'Year' },
          { key: 'electricitySales', label: 'Electricity Sales' },
          { key: 'oilRevenues', label: 'Oil Revenues' },
          { key: 'otherRevenues', label: 'Other Revenues' },
          { key: 'interestIncome', label: 'Interest Income' },
          { key: 'shareInNetIncomeOfAssociate', label: 'Share in Net Income of Associate' },
          { key: 'miscellaneousIncome', label: 'Miscellaneous Income' },
          { key: 'totalRevenue', label: 'Total Revenue' }
        ];
        filename = `economic_value_generated_${new Date().toISOString().split('T')[0]}`;
        break;

      case 'expenditures':
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
        exportColumns = [
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
        filename = `economic_expenditures_${new Date().toISOString().split('T')[0]}`;
        dataToExport = flattenedData;
        break;

      case 'capital':
        exportColumns = [
          { key: 'year', label: 'Year' },
          { key: 'interest', label: 'Interest' },
          { key: 'dividendsToNci', label: 'Dividends to NCI' },
          { key: 'dividendsToParent', label: 'Dividends to Parent' },
          { key: 'total', label: 'Total' }
        ];
        filename = `economic_capital_provider_${new Date().toISOString().split('T')[0]}`;
        break;
    }
    
    exportData(dataToExport, filename, exportColumns);
  };

  // Filter options
  const getFilterOptions = () => {
    const currentData = getCurrentData();
    const yearOptions = Array.from(new Set(currentData.map(row => row.year).filter(Boolean)))
      .sort((a, b) => b - a)
      .map(year => ({ label: String(year), value: year }));

    const typeOptions = Array.from(new Set(currentData.map(row => row.type).filter(Boolean)))
      .sort()
      .map(type => ({ label: type, value: type }));

    const companyOptions = Array.from(new Set(currentData.map(row => row.comp).filter(Boolean)))
      .sort()
      .map(comp => ({ label: comp, value: comp }));

    return { yearOptions, typeOptions, companyOptions };
  };

  const { yearOptions, typeOptions, companyOptions } = getFilterOptions();

  // Actions
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

  // Pagination
  const totalPages = Math.ceil(processedData.length / rowsPerPage);
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  // Refresh data function
  const refreshData = () => {
    setPage(1);
    if (selected === 'generated') {
      fetchGeneratedData();
    } else if (selected === 'expenditures') {
      fetchExpendituresData();
    } else if (selected === 'capital') {
      fetchCapitalData();
    }
  };

  useEffect(() => {
    if (sidebarMode !== "repository") {
      navigate("/economic");
    }
  }, [sidebarMode, navigate]);

  if (loading) return (
    <Box sx={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', height: '100vh', bgcolor: '#f5f7fa' }}>
      <Box sx={{ textAlign: 'center' }}>
        <CircularProgress size={64} thickness={5} sx={{ color: '#182959' }} />
        <Typography sx={{ mt: 2, color: '#182959', fontWeight: 700, fontSize: 20 }}>
          Loading Economic Data...
        </Typography>
      </Box>
    </Box>
  );
  if (error) return <div>{error}</div>;

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar mode={sidebarMode} onModeChange={setSidebarMode} />
      <Box sx={{ flexGrow: 1, height: '100vh', overflow: 'auto' }}>
        <div style={{ padding: '2rem' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '0.5rem'
          }}>
            <RepositoryHeader 
              label="REPOSITORY"
              title={`Economic - ${sections.find(s => s.key === selected)?.label}`}
            />
            
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

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            {sections.map((section) => (
              <Button
                key={section.key}
                onClick={() => setSelected(section.key)}
                variant="contained"
                sx={{
                  backgroundColor: selected === section.key ? '#2B8C37' : '#9ca3af',
                  borderRadius: '15px',
                  padding: '3px 6px',
                  height: '30px',
                  width: '25%',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  color: 'white',
                  '&:hover': {
                    backgroundColor: selected === section.key ? '#256d2f' : '#6b7280',
                  },
                }}
              >
                {section.label}
              </Button>
            ))}
          </Box>

          {/* Search and Filters */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <Search
              onSearch={val => {
                setSearchTerm(val);
                setPage(1);
              }}
              placeholder="Search..."
              suggestions={[]}
            />
            
            {yearOptions.length > 0 && (
              <Box sx={{ 
                minWidth: 120, 
                maxWidth: 300,
                position: 'relative',
                '& .MuiFormControl-root': {
                  width: '100%',
                },
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '14px',
                  fontWeight: 400,
                  minHeight: '40px',
                  '&:hover': {
                    borderColor: '#9ca3af',
                  },
                  '&.Mui-focused': {
                    borderColor: '#3b82f6',
                    boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
                  },
                  '& .MuiOutlinedInput-notchedOutline': {
                    border: 'none',
                  },
                },
                '& .MuiSelect-select': {
                  padding: '8px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  height: '24px',
                  minHeight: 'unset',
                  flexWrap: 'nowrap !important',
                  overflow: 'hidden',
                },
                '& .MuiChip-root': {
                  fontSize: '12px',
                  fontWeight: 400,
                  borderRadius: '4px',
                  height: '20px',
                  '&:nth-of-type(n+3)': {
                    display: 'none',
                  },
                },
                '& .MuiSelect-icon': {
                  color: '#6b7280',
                },
                // Override placeholder text styling
                '& span': {
                  color: '#6b7280 !important',
                  fontSize: '14px !important',
                },
              }}>
                <MultiSelectWithChips
                  label="Year"
                  options={yearOptions}
                  selectedValues={filters.year}
                  onChange={val => {
                    setFilters(prev => ({ ...prev, year: val }));
                    setPage(1);
                  }}
                  placeholder="All Years"
                />
                {filters.year.length > 2 && (
                  <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    right: '32px',
                    transform: 'translateY(-50%)',
                    fontSize: '12px',
                    fontWeight: 400,
                    backgroundColor: '#f3f4f6',
                    color: '#6b7280',
                    borderRadius: '4px',
                    padding: '2px 6px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    pointerEvents: 'none',
                  }}>
                    +{filters.year.length - 2}
                  </Box>
                )}
              </Box>
            )}
            
            {selected === 'expenditures' && (
              <>
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
                <Box sx={{ 
                  minWidth: 150, 
                  maxWidth: 400,
                  position: 'relative',
                  '& .MuiFormControl-root': {
                    width: '100%',
                  },
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                    border: '1px solid #d1d5db',
                    fontSize: '14px',
                    fontWeight: 400,
                    minHeight: '40px',
                    '&:hover': {
                      borderColor: '#9ca3af',
                    },
                    '&.Mui-focused': {
                      borderColor: '#3b82f6',
                      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1)',
                    },
                    '& .MuiOutlinedInput-notchedOutline': {
                      border: 'none',
                    },
                  },
                  '& .MuiSelect-select': {
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    height: '24px',
                    minHeight: 'unset',
                    flexWrap: 'nowrap !important',
                    overflow: 'hidden',
                  },
                  '& .MuiChip-root': {
                    fontSize: '12px',
                    fontWeight: 400,
                    borderRadius: '4px',
                    height: '20px',
                    '&:nth-of-type(n+3)': {
                      display: 'none',
                    },
                  },
                  '& .MuiSelect-icon': {
                    color: '#6b7280',
                  },
                  // Override placeholder text styling
                  '& span': {
                    color: '#6b7280 !important',
                    fontSize: '14px !important',
                  },
                }}>
                  <MultiSelectWithChips
                    label="Company"
                    options={companyOptions}
                    selectedValues={filters.company}
                    onChange={val => {
                      setFilters(prev => ({ ...prev, company: val }));
                      setPage(1);
                    }}
                    placeholder="All Companies"
                  />
                  {filters.company.length > 2 && (
                    <Box sx={{
                      position: 'absolute',
                      top: '50%',
                      right: '32px',
                      transform: 'translateY(-50%)',
                      fontSize: '12px',
                      fontWeight: 400,
                      backgroundColor: '#f3f4f6',
                      color: '#6b7280',
                      borderRadius: '4px',
                      padding: '2px 6px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      pointerEvents: 'none',
                    }}>
                      +{filters.company.length - 2}
                    </Box>
                  )}
                </Box>
              </>
            )}
          </Box>

          {/* Table */}
          <Table
            columns={getColumns()}
            rows={processedData}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={handlePageChange}
            initialSort={{ key: 'year', direction: 'desc' }}
            actions={renderActions}
            emptyMessage="No data available."
            selectable={false}
          />

          {/* Pagination */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            {/* Row Count Display */}
            <Typography sx={{ fontSize: '0.85rem'}}>
              Total of {getCurrentData().length} {getCurrentData().length === 1 ? 'record' : 'records'}
            </Typography>
            <Pagination
              page={page}
              count={totalPages}
              onChange={handlePageChange}
            />
            <Typography sx={{ fontSize: '0.85rem'}}>
              Showing {Math.min((page - 1) * rowsPerPage + 1, getCurrentData().length)}–
              {Math.min(page * rowsPerPage, getCurrentData().length)} records
            </Typography>
          </Box>

          {/* Modals */}
          {isAddModalOpen && (
            <Overlay onClose={() => setIsAddModalOpen(false)}>
              {selected === 'generated' && (
                <AddValueGeneratedModal
                  onClose={() => {
                    setIsAddModalOpen(false);
                    refreshData();
                  }}
                />
              )}
              {selected === 'expenditures' && (
                <AddEconExpendituresModal
                  onClose={() => {
                    setIsAddModalOpen(false);
                    refreshData();
                  }}
                />
              )}
              {selected === 'capital' && (
                <AddCapitalProviderModal
                  onClose={() => {
                    setIsAddModalOpen(false);
                    refreshData();
                  }}
                />
              )}
            </Overlay>
          )}

          {isImportModalOpen && (
            <Overlay onClose={() => setIsImportModalOpen(false)}>
              {selected === 'generated' && (
                <ImportEconGeneratedModal
                  onClose={() => {
                    setIsImportModalOpen(false);
                    refreshData();
                  }}
                />
              )}
              {selected === 'expenditures' && (
                <ImportEconExpendituresModal
                  onClose={() => {
                    setIsImportModalOpen(false);
                    refreshData();
                  }}
                />
              )}
              {selected === 'capital' && (
                <ImportEconCapitalProviderModal
                  onClose={() => {
                    setIsImportModalOpen(false);
                    refreshData();
                  }}
                />
              )}
            </Overlay>
          )}

          {isEditModalOpen && selectedEditRecord && (
            <Overlay onClose={() => setIsEditModalOpen(false)}>
              {selected === 'generated' && (
                <EditValueGeneratedModal
                  selectedRecord={selectedEditRecord}
                  onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedEditRecord(null);
                    refreshData();
                  }}
                />
              )}
              {selected === 'expenditures' && (
                <EditEconExpendituresModal
                  selectedRecord={selectedEditRecord}
                  onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedEditRecord(null);
                    refreshData();
                  }}
                />
              )}
              {selected === 'capital' && (
                <EditCapitalProviderModal
                  selectedRecord={selectedEditRecord}
                  onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedEditRecord(null);
                    refreshData();
                  }}
                />
              )}
            </Overlay>
          )}

          {/* Internal Breakdown Modal for Expenditures */}
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

                <Box sx={{ 
                  display: 'grid', 
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(auto-fit, minmax(300px, 1fr))' },
                  gap: 3,
                  mb: 3 
                }}>
                  {selectedInternal.types.map((type) => {
                    const typeData = selectedInternal.row.types[type];
                    
                    return (
                      <Box key={type} sx={{ 
                        border: '1px solid #eee', 
                        borderRadius: 2, 
                        p: 3,
                        minHeight: 'fit-content'
                      }}>
                        <Typography variant="h6" sx={{ color: '#182959', mb: 2, fontWeight: 'bold' }}>
                          {type}
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