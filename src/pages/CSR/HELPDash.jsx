import React, { useEffect, useState, useMemo } from 'react';
import Sidebar from '../../components/Sidebar';
import { Box, Typography, Grid, Paper, CircularProgress, Button, useTheme, useMediaQuery } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SchoolIcon from '@mui/icons-material/School';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GroupsIcon from '@mui/icons-material/Groups';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import WorkIcon from '@mui/icons-material/Work';
import PersonIcon from '@mui/icons-material/Person'; // Add import for Individual Recipients icon
import RefreshIcon from '@mui/icons-material/Refresh';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus'; // Add import for Mobile Clinics icon
import api from '../../services/api';
import InvestmentPerProjectChart from '../CSR/Charts/InvestmentPerProject';
import InvestmentPerProgramChart from '../CSR/Charts/InvestmentPerProgram';
import InvestmentPerCompanyChart from '../CSR/Charts/InvestmentPerCompany';
import ZoomModal from '../../components/DashboardComponents/ZoomModal'; // Add this import
import InvestmentKPI from '../CSR/Charts/InvestmentKPI'; // Add this import
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import IconButton from '@mui/material/IconButton';
import DashboardHeader from '../../components/DashboardComponents/DashboardHeader';

// KPI configuration for HELP dashboard
const kpiConfig = [
  // Health
  {
    category: 'HEALTH',
    items: [
      { 
        label: 'Beneficiaries of annual medical mission',
        icon: <FavoriteIcon sx={{ color: '#ef4444', fontSize: 40 }} />, 
        key: 'medicalMissionBeneficiaries',
        bgColor: '#f8bcbc', // slightly darker than #fdeaea
      },
      {
        label: 'Beneficiaries of health center',
        icon: <LocalHospitalIcon sx={{ color: '#ef4444', fontSize: 40 }} />,
        key: 'healthCenterBeneficiaries',
        bgColor: '#f8bcbc',
      },
      {
        label: 'Nutrition Programs',
        icon: <RestaurantIcon sx={{ color: '#ef4444', fontSize: 40 }} />,
        key: 'nutritionPrograms',
        bgColor: '#f8bcbc',
      },
      {
        label: 'Ambulance Donated',
        icon: <LocalShippingIcon sx={{ color: '#ef4444', fontSize: 40 }} />, 
        key: 'ambulanceDonated',
        bgColor: '#f8bcbc',
      },
      {
        label: 'Mobile Clinics',
        icon: <DirectionsBusIcon sx={{ color: '#ef4444', fontSize: 40 }} />, // icon for mobile clinics
        key: 'mobileClinics',
        bgColor: '#f8bcbc',
      },
    ],
  },
  // Education
  {
    category: 'EDUCATION',
    items: [
      {
        label: 'Adopted Schools',
        icon: <SchoolIcon sx={{ color: '#1976d2', fontSize: 40 }} />, // bigger icon
        key: 'adoptedSchools',
        bgColor: '#b6d4f7', // slightly darker than #e3f0fc
      },
      {
        label: 'College Scholars',
        icon: <EmojiEventsIcon sx={{ color: '#1976d2', fontSize: 40 }} />, // bigger icon
        key: 'collegeScholars',
        bgColor: '#b6d4f7',
      },
      {
        label: 'Educational Mobile Devices',
        icon: <GroupsIcon sx={{ color: '#1976d2', fontSize: 40 }} />, // bigger icon
        key: 'educationalMobileDevices',
        bgColor: '#b6d4f7',
      },
      {
        label: 'Teachers Training',
        icon: <PersonAddIcon sx={{ color: '#1976d2', fontSize: 40 }} />, // bigger icon
        key: 'teachersTraining',
        bgColor: '#b6d4f7',
      },
    ],
  },  // Livelihood
  {
    category: 'LIVELIHOOD',
    items: [
      {
        label: 'Participants of Livelihood Training',
        icon: <WorkIcon sx={{ color: '#fbbf24', fontSize: 40 }} />, // bigger icon
        key: 'livelihoodParticipants',
        bgColor: '#fff3b0', // slightly darker than #fffbe6
      },
      {
        label: 'Individual Recipients',
        icon: <PersonIcon sx={{ color: '#fbbf24', fontSize: 40 }} />, // bigger icon
        key: 'livelihoodIndividualRecipients',
        bgColor: '#fff3b0', // slightly darker than #fffbe6
      },
    ],
  },
];

// Aggregates KPI values from API data
function aggregateKPI(data) {
  // Map KPI keys to project IDs
  const kpiProjectIds = {
    // Health
    medicalMissionBeneficiaries: ['HE_AMM'],
    healthCenterBeneficiaries: ['HE_CHC'],
    nutritionPrograms: ['HE_NP'],
    ambulanceDonated: ['HE_SA'],
    mobileClinics: ['HE_MC'],
    // Education
    adoptedSchools: ['ED_AS'],
    collegeScholars: ['ED_SP'],
    educationalMobileDevices: ['ED_EMD'],
    teachersTraining: ['ED_TT'],
    // Livelihood
    livelihoodParticipants: ['LI_LT_T'],
    livelihoodIndividualRecipients: ['LI_LT_IND'],
    // You can add more mappings as needed
  };

  const result = {
    medicalMissionBeneficiaries: 0,
    healthCenterBeneficiaries: 0,
    nutritionPrograms: 0,
    ambulanceDonated: 0,
    mobileClinics: 0,
    adoptedSchools: 0,
    collegeScholars: 0,
    educationalMobileDevices: 0,
    teachersTraining: 0,
    livelihoodParticipants: 0,
    livelihoodIndividualRecipients: 0,
  };

  data.forEach(row => {
    const projectId = String(row.projectId || '').toUpperCase();
    const csrReport = Number(row.csrReport) || 0;
    Object.entries(kpiProjectIds).forEach(([kpiKey, ids]) => {
      if (ids.includes(projectId)) {
        // For ambulanceDonated, mobileClinics, adoptedSchools, count as 1 if csrReport is falsy
        if (["ambulanceDonated", "mobileClinics", "adoptedSchools"].includes(kpiKey)) {
          result[kpiKey] += csrReport > 0 ? csrReport : 1;
        } else {
          result[kpiKey] += csrReport;
        }
      }
    });
  });

  return result;
}

// Aggregates investment amounts per program
function aggregateInvestments(data) {
  // Assume each row has: investmentAmount, projectName, programName
  const result = {
    health: 0,
    education: 0,
    livelihood: 0,
  };
  data.forEach(row => {
    const program = String(row.programName || '').toLowerCase();
    const amount = Number(row.investmentAmount) || 0;
    if (program.includes('health')) result.health += amount;
    else if (program.includes('education')) result.education += amount;
    else if (program.includes('livelihood')) result.livelihood += amount;
  });
  return result;
}

// KPIBox: Displays a single KPI with icon, value, label, and last updated
function KPIBox({ icon, label, value, lastUpdated, bgColor, isMobile = false, isSmallScreen = false }) {
  // Dynamically adjust font size and icon size based on screen size and label length
  let labelFontSize = isMobile ? 11 : 15;
  let iconSize = isSmallScreen ? 32 : isMobile ? 36 : 40;
  let valueFontSize = isSmallScreen ? 20 : isMobile ? 24 : 28;
  
  if (label.length > 35) labelFontSize = isMobile ? 9 : 11;
  else if (label.length > 28) labelFontSize = isMobile ? 10 : 12;
  else if (label.length > 22) labelFontSize = isMobile ? 11 : 13;
  else if (label.length > 16) labelFontSize = isMobile ? 12 : 14;

  // Format last updated as "Month, Year"
  let asOfText = '';
  if (lastUpdated) {
    const date = new Date(lastUpdated);
    asOfText = `As of: ${date.toLocaleString('default', { month: 'long' })}, ${date.getFullYear()}`;
  }
  return (
    <Paper
      elevation={0}
      sx={{
        background: bgColor || '#f8fafd',
        border: '1.5px solid #e2e8f0',
        borderRadius: '14px',
        boxShadow: 'none',
        width: '100%',
        minWidth: 0,
        minHeight: isSmallScreen ? 100 : isMobile ? 110 : 120,
        height: '100%',
        padding: isSmallScreen ? '12px' : isMobile ? '14px' : '18px 18px 14px 18px',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: 'center',
        justifyContent: 'center',   
        textAlign: 'center',
      }}
    >
      <Box sx={{ 
        fontSize: iconSize, 
        mr: isMobile ? 0 : 0.5,
        mb: isMobile ? 0.5 : 0 
      }}>
        {/* Clone icon with responsive size */}
        {icon && typeof icon === 'object' ? 
          React.cloneElement(icon, { sx: { ...icon.props.sx, fontSize: iconSize } }) : 
          icon
        }
      </Box>
      <Box sx={{ 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        width: '100%' 
      }}>
        {/*KPIS */}
        <Typography
          sx={{
            fontSize: valueFontSize,
            fontWeight: 900,
            color: '#182959',
            textAlign: 'center',
            wordBreak: 'break-word',
            mb: 0.5,
            width: '100%',
          }}
        >
          {value?.toLocaleString?.() ?? value}
        </Typography>
        {/* KPIS LABELS */}
        <Typography
          sx={{
            fontSize: labelFontSize,
            fontWeight: 700,
            color: '#64748b',
            textAlign: 'center',
            lineHeight: 1.2,
            wordBreak: isMobile ? 'break-word' : 'keep-all',
            whiteSpace: isMobile ? 'normal' : 'nowrap',
            width: '100%',
            overflow: isMobile ? 'visible' : 'hidden',
            textOverflow: isMobile ? 'unset' : 'ellipsis',
          }}
          title={label}
        >
          {label}
        </Typography>
        <Typography
          sx={{
            fontSize: isSmallScreen ? 8 : 10,
            color: '#94a3b8',
            textAlign: 'center',
            mt: 0.5,
            width: '100%',
            fontStyle: 'italic',
            letterSpacing: 0.2,
            fontWeight: 400,
          }}
        >
          {asOfText}
        </Typography>
      </Box>
    </Paper>
  );
}

function chunkArray(array, size) {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

// Helper to format date/time as "Month Day, Year at HH:MM:SS AM/PM"
function formatDateTime(date) {
  if (!date) return '';
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  };
  return date.toLocaleString('en-US', options);
}

// Main HELP Dashboard component
export default function HELPDash() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ year: '', company: '' });
  const [lastUpdated, setLastUpdated] = useState(null);
  const [activeTab, setActiveTab] = useState('HELP'); // 'HELP' or 'Investments'
  const [zoomModal, setZoomModal] = useState({
    open: false,
    content: null,
    title: '',
    fileName: ''
  });
  const [yearOptions, setYearOptions] = useState([]);
  const [companyOptions, setCompanyOptions] = useState([]);

  // Fetch HELP activities data from API, with optional filters
  const fetchData = (year = '', company = '') => {
    setLoading(true);
    // Build query string for filters
    let query = [];
    if (year) query.push(`year=${encodeURIComponent(year)}`);
    if (company) query.push(`company_id=${encodeURIComponent(company)}`);
    const queryString = query.length ? `?${query.join('&')}` : '';
    api.get(`help/help-report${queryString}`)
      .then(res => {
        setData(res.data);
        setLastUpdated(new Date());
      })
      .catch(() => {
        setData([]);
        setLastUpdated(new Date());
      })
      .finally(() => setLoading(false));
  };

  // Fetch available years and company names from /help/activities (unfiltered)
  useEffect(() => {
    api.get('help/activities')
      .then(res => {
        const activities = res.data || [];
        const years = [...new Set(activities.map(d => d.projectYear).filter(Boolean))].sort((a, b) => b - a);
        // Use companyId for filter values, but display companyName in dropdown
        const companies = [];
        const seen = new Set();
        activities.forEach(d => {
          if (d.companyId && d.companyName && !seen.has(d.companyId)) {
            companies.push({ id: d.companyId, name: d.companyName });
            seen.add(d.companyId);
          }
        });
        setYearOptions(years);
        setCompanyOptions(companies);
      })
      .catch(() => {
        setYearOptions([]);
        setCompanyOptions([]);
      });
  }, []);

  // Fetch data on mount and whenever filters or activeTab changes
  useEffect(() => {
    fetchData(filters.year, filters.company);
    // eslint-disable-next-line
  }, [filters.year, filters.company, activeTab]);

  // Handle filter change
  const handleFilter = (key, value) => {
    setFilters(f => ({
      ...f,
      [key]: value,
    }));
  };

  // Clear all filters
  const clearFilters = () => setFilters({ year: '', company: '' });

  // Handle tab switch and clear filters
  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    if (tab === 'HELP') {
      // No filter applied by default, but display most recent year data
      setFilters(f => ({ year: '', company: '' }));
    } else {
      // Investments: clear filters (all years)
      setFilters({ year: '', company: '' });
    }
  };

  // Memoized filtered data for HELP and Investments tabs
  const filteredData = useMemo(() => {
    if (activeTab === 'HELP' || activeTab === 'Investments') {
      return data.filter(row => {
        // Use loose equality to handle number/string mismatch for year
        if (filters.year && row.projectYear != filters.year) return false;
        if (filters.company && row.companyId !== filters.company) return false;
        return true;
      });
    }
    return data;
  }, [data, filters, activeTab]);

  // Memoized KPI and investment values
  const kpi = useMemo(() => aggregateKPI(filteredData), [filteredData]);
  const investments = useMemo(() => aggregateInvestments(filteredData), [filteredData]);

  console.log(filteredData)

  // Helper to open modal with chart content
  const openZoomModal = (title, fileName, content) => {
    setZoomModal({ open: true, title, fileName, content });
  };
  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        height: '100vh',
        width: '100vw',
        background: '#f4f6fb',
        flexDirection: { xs: 'column', md: 'row' },
        overflow: 'hidden',
        boxSizing: 'border-box',
      }}
    >
      <Sidebar />
      <Box
        sx={{
          flexGrow: 1,
          p: { xs: 0.5, sm: 1, md: 2 },
          width: {
            xs: '100%',
            md: '100%', // 110% width (1/0.9 = 111.11%)
            lg: '100%'
          },
          minWidth: 0,
          height: '100%',
          maxWidth: 'none',
          maxHeight: '100%',
          overflow: 'visible',
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          marginRight: { xs: 0, md: '-11vw' },
          marginLeft: 0, // ensure no space between sidebar and main content
          '@media (max-width: 900px)': {
            p: 0.5,
            width: '100%',
            marginRight: 0,
            marginLeft: 0,
          },
          '@media (max-width: 600px)': {
            p: 0.2,
            width: '100%',
            marginRight: 0,
            marginLeft: 0,
          },
          transform: { xs: 'none', md: 'scale(0.9)' },
          transformOrigin: { xs: 'unset', md: 'top left' },
        }}
      >
        {/* Dashboard Header replacement */}
        <Box sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          mb: 1,
          gap: { xs: 1, sm: 0 },
          flexShrink: 0
        }}>
          <DashboardHeader
            title="Social - H.E.L.P"
            lastUpdated={lastUpdated}
            formatDateTime={formatDateTime}
          />
          <Button
            variant="contained"
            startIcon={<RefreshIcon sx={{ fontSize: isSmallScreen ? 14 : 16 }} />}
            sx={{
              backgroundColor: '#1976d2',
              borderRadius: '7px',
              fontWeight: 600,
              fontSize: isSmallScreen ? 10 : 11,
              px: isSmallScreen ? 1 : 1.5,
              py: 0.5,
              minHeight: isSmallScreen ? '24px' : '28px',
              minWidth: isSmallScreen ? '70px' : '80px',
              '&:hover': { backgroundColor: '#115293' }
            }}
            onClick={fetchData}
          >
            Refresh
          </Button>
        </Box>

        {/* Tab Buttons */}
        <Box sx={{
          display: 'flex',
          gap: '6px',
          mb: 1,
          flexShrink: 0,
          flexWrap: 'wrap'
        }}>
          <Button
            onClick={() => handleTabSwitch('HELP')}
            sx={{
              padding: isSmallScreen ? '4px 8px' : '5px 10px',
              backgroundColor: activeTab === 'HELP' ? '#10B981' : '#9CA3AF',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              fontSize: isSmallScreen ? '10px' : '11px',
              fontWeight: '600',
              cursor: 'pointer',
              minWidth: isSmallScreen ? '50px' : '60px',
              minHeight: isSmallScreen ? '22px' : '26px',
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: activeTab === 'HELP' ? '#059669' : '#6B7280'
              }
            }}
          >
            HELP
          </Button>
          <Button
            onClick={() => handleTabSwitch('Investments')}
            sx={{
              padding: isSmallScreen ? '4px 8px' : '5px 10px',
              backgroundColor: activeTab === 'Investments' ? '#10B981' : '#9CA3AF',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              fontSize: isSmallScreen ? '10px' : '11px',
              fontWeight: '600',
              cursor: 'pointer',
              minWidth: isSmallScreen ? '50px' : '60px',
              minHeight: isSmallScreen ? '22px' : '26px',
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: activeTab === 'Investments' ? '#059669' : '#6B7280'
              }
            }}
          >
            Investments
          </Button>
        </Box>

        {/* HELP Tab */}
        {activeTab === 'HELP' && (
          <>            {/* Filters Row */}
            <Box
              sx={{
                display: 'flex',
                gap: isSmallScreen ? '5px' : '7px',
                mb: 2,
                flexWrap: 'wrap',
                alignItems: 'center',
                flexShrink: 0,
                flexDirection: { xs: 'column', sm: 'row' }
              }}
            >
              {/* Year Filter */}
              <select
                value={filters.year}
                onChange={e => handleFilter('year', e.target.value)}
                style={{
                  padding: isSmallScreen ? '4px 6px' : '5px 8px',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '14px',
                  backgroundColor: 'white',
                  fontSize: isSmallScreen ? '10px' : '11px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  minWidth: isSmallScreen ? '60px' : '70px',
                  width: isSmallScreen ? '100%' : 'auto',
                  height: isSmallScreen ? '24px' : '28px'
                }}
              >
                <option value="">All Years</option>
                {yearOptions.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>

              {/* Company Filter */}
              <select
                value={filters.company}
                onChange={e => handleFilter('company', e.target.value)}
                style={{
                  padding: isSmallScreen ? '4px 6px' : '5px 8px',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '14px',
                  backgroundColor: 'white',
                  fontSize: isSmallScreen ? '10px' : '11px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  minWidth: isSmallScreen ? '60px' : '70px',
                  width: isSmallScreen ? '100%' : 'auto',
                  height: isSmallScreen ? '24px' : '28px'
                }}
              >
                <option value="">All Companies</option>
                {companyOptions.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              {(filters.year || filters.company) && (
                <button
                  style={{
                    padding: isSmallScreen ? '4px 6px' : '5px 8px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '14px',
                    fontSize: isSmallScreen ? '9px' : '10px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    width: isSmallScreen ? '100%' : 'auto',
                    height: isSmallScreen ? '24px' : '28px'
                  }}
                  onClick={clearFilters}
                >
                  Clear Filters
                </button>
              )}
            </Box>

            {/* KPI Grid */}
            <Box sx={{ width: '100%' }}>
              {kpiConfig.map(section => (
                <Box
                  key={section.category}
                  sx={{
                    mb: 3,
                    width: '100%',
                    maxWidth: '100%',
                  }}
                >                  <Typography
                    sx={{
                      fontSize: isSmallScreen ? 22 : isMobile ? 24 : 28, 
                      fontWeight: 900,
                      color: '#182959',
                      mb: 1.2,
                      letterSpacing: 1,
                      textAlign: { xs: 'center', sm: 'left' },
                      textTransform: 'uppercase',
                      px: { xs: 1, sm: 2 },
                    }}
                  >
                    {section.category}
                  </Typography>
                  <Grid
                    container
                    spacing={isSmallScreen ? 1 : 1.5}
                    sx={{
                      width: '100%',
                      margin: 0,
                      px: { xs: 0, sm: 1 },
                      justifyContent: 'center',
                      alignItems: 'center',
                      textAlign: 'center',
                    }}
                  >
                    {section.items.map(item => (
                      <Grid
                        item
                        xs={12}
                        sm={6}
                        md={section.items.length <= 2 ? 6 : 4}
                        lg={Math.max(12 / section.items.length, 3)}
                        key={item.key}
                        sx={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          width: '100%',
                          flexGrow: 1,
                          flexBasis: 0,
                        }}
                      >
                        <KPIBox
                          icon={item.icon}
                          label={item.label}
                          value={loading ? <CircularProgress size={isSmallScreen ? 16 : 22} /> : kpi[item.key]}
                          lastUpdated={lastUpdated}
                          bgColor={item.bgColor}
                          isMobile={isMobile}
                          isSmallScreen={isSmallScreen}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              ))}
            </Box>
          </>
        )}

        {/* Investments Tab */}
        {activeTab === 'Investments' && (
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            flex: 1, 
            minHeight: 0,
            overflow: 'hidden'
          }}>
            {/* Filters Row */}
            <Box
              sx={{
                display: 'flex',
                gap: isSmallScreen ? '5px' : '7px',
                mb: 1,
                flexWrap: 'wrap',
                alignItems: 'center',
                flexShrink: 0,
                flexDirection: { xs: 'column', sm: 'row' }
              }}
            >
              {/* Year Filter */}
              <select
                value={filters.year}
                onChange={e => handleFilter('year', e.target.value)}
                style={{
                  padding: isSmallScreen ? '4px 6px' : '5px 8px',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '14px',
                  backgroundColor: 'white',
                  fontSize: isSmallScreen ? '10px' : '11px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  minWidth: isSmallScreen ? '60px' : '70px',
                  width: isSmallScreen ? '100%' : 'auto',
                  height: isSmallScreen ? '24px' : '28px'
                }}
              >
                <option value="">All Years</option>
                {yearOptions.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>

              {/* Company Filter */}
              <select
                value={filters.company}
                onChange={e => handleFilter('company', e.target.value)}
                style={{
                  padding: isSmallScreen ? '4px 6px' : '5px 8px',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '14px',
                  backgroundColor: 'white',
                  fontSize: isSmallScreen ? '10px' : '11px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  minWidth: isSmallScreen ? '60px' : '70px',
                  width: isSmallScreen ? '100%' : 'auto',
                  height: isSmallScreen ? '24px' : '28px'
                }}
              >
                <option value="">All Companies</option>
                {companyOptions.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              {(filters.year || filters.company) && (
                <button
                  style={{
                    padding: isSmallScreen ? '4px 6px' : '5px 8px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '14px',
                    fontSize: isSmallScreen ? '9px' : '10px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    width: isSmallScreen ? '100%' : 'auto',
                    height: isSmallScreen ? '24px' : '28px'
                  }}
                  onClick={clearFilters}
                >
                  Clear Filters
                </button>
              )}
            </Box>

            {/* KPI Row - 3 columns */}
            <Box sx={{ mb: 1, flexShrink: 0 }}>
              <InvestmentKPI
                year={filters.year}
                companyId={filters.company}
              />
            </Box>
         
            {/* Graph Containers Layout */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                gap: { xs: 1, md: 1.5 },
                width: '100%',
                alignItems: 'stretch',
                flex: 1,
                minHeight: 0,
                overflow: 'hidden'
              }}
            >
              {/* Left: Large Chart Container (Investments per Projects) */}
              <Paper
                elevation={0}
                sx={{
                  flex: { xs: 1, md: 2 },
                  display: 'flex',
                  flexDirection: 'column',
                  background: '#fff',
                  borderRadius: '10px',
                  border: '1.5px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                  minWidth: { xs: '100%', md: '50%' },
                  maxWidth: { xs: '100%', md: '55%' },
                  height: { xs: '300px', sm: '400px', md: '100%' },
                  minHeight: { xs: '300px', md: 0 },
                  padding: isSmallScreen ? '8px 8px 6px 8px' : '10px 10px 8px 10px',
                  justifyContent: 'flex-start',
                  cursor: 'pointer',
                  transition: 'box-shadow 0.2s, border-color 0.2s, transform 0.15s',
                  '&:hover': {
                    boxShadow: '0 4px 16px rgba(16,185,129,0.12)',
                    transform: isMobile ? 'none' : 'translateY(-2px) scale(1.01)'
                  }
                }}
                onClick={() =>
                  openZoomModal(
                    'Investments per Project',
                    'investments_per_project',
                    <InvestmentPerProjectChart
                      height={500}
                      width={900}
                      year={filters.year}
                      companyId={filters.company}
                      showLegendAndLabels={true} // Pass prop to show legend and labels in modal
                    />  
                  )
                }
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography
                    sx={{
                      fontSize: isSmallScreen ? 10 : 12,
                      fontWeight: 700,
                      color: '#1e293b',
                      flexShrink: 0
                    }}
                  >
                    Investments per Project
                  </Typography>
                  <IconButton
                    aria-label="zoom"
                    size="small"
                    sx={{ ml: 1 }}
                    onClick={e => {
                      e.stopPropagation();
                      openZoomModal(
                        'Investments per Project',
                        'investments_per_project',
                        <InvestmentPerProjectChart
                          height={500}
                          width={900}
                          year={filters.year}
                          companyId={filters.company}
                          showLegendAndLabels={true} // Pass prop to show legend and labels in modal
                        />
                      );
                    }}
                  >
                    <ZoomInIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Box sx={{ flex: 1, minHeight: 0, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <Box sx={{ width: '100%', height: '100%' }}>
                    <InvestmentPerProjectChart
                      height="100%"
                      width="100%"
                      year={filters.year}
                      companyId={filters.company}
                    />
                  </Box>
                </Box>
              </Paper>              {/* Right: Stack of two charts */}
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: { xs: 1.5, md: 2 },
                  minWidth: 0,
                  height: { xs: 'auto', md: '100%' },
                  minHeight: 0,
                }}
              >
                {/* Investments per Programs */}
                <Paper
                  elevation={0}
                  sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    background: '#fff',
                    borderRadius: '10px',
                    border: '1.5px solid #e2e8f0',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                    minWidth: 0,
                    height: { xs: '250px', sm: '300px', md: '50%' },
                    minHeight: { xs: '250px', md: 0 },
                    padding: isSmallScreen ? '8px 8px 6px 8px' : '10px 10px 8px 10px',
                    justifyContent: 'flex-start',
                    cursor: 'pointer',
                    transition: 'box-shadow 0.2s, border-color 0.2s, transform 0.15s',
                  }}
                  onClick={() =>
                    openZoomModal(
                      'Investments per Program',
                      'investments_per_program',
                      <InvestmentPerProgramChart
                        height={400}
                        width={600}
                        year={filters.year}
                        companyId={filters.company}
                        showLegendAndLabels={true} // Pass prop to show legend and labels in modal
                      />
                    )
                  }
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography
                      sx={{
                        fontSize: isSmallScreen ? 10 : 12,
                        fontWeight: 700,
                        color: '#1e293b',
                        flexShrink: 0
                      }}
                    >
                      Investments per Program
                    </Typography>
                    <IconButton
                      aria-label="zoom"
                      size="small"
                      sx={{ ml: 1 }}
                      onClick={e => {
                        e.stopPropagation();
                        openZoomModal(
                          'Investments per Program',
                          'investments_per_program',
                          <InvestmentPerProgramChart
                            height={400}
                            width={600}
                            year={filters.year}
                            companyId={filters.company}
                            showLegendAndLabels={true} // Pass prop to show legend and labels in modal
                          />
                        );
                      }}
                    >
                      <ZoomInIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Box sx={{ flex: 1, minHeight: 0, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Box sx={{ width: '100%', height: '100%' }}>
                      <InvestmentPerProgramChart
                        height="100%"
                        width="100%"
                        year={filters.year}
                        companyId={filters.company}
                      />
                    </Box>
                  </Box>
                </Paper>
                {/* Bottom Right Chart */}
                <Paper
                  elevation={0}
                  sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    background: '#fff',
                    borderRadius: '10px',
                    border: '1.5px solid #e2e8f0',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                    minWidth: 0,
                    height: '50%',
                    minHeight: 0,
                    padding: '10px 10px 8px 10px',
                    justifyContent: 'flex-start',
                    cursor: 'pointer',
                    transition: 'box-shadow 0.2s, border-color 0.2s, transform 0.15s',
                    // Removed green outline on hover
                    // '&:hover': {
                    //   boxShadow: '0 4px 16px rgba(16,185,129,0.12)',
                    //   borderColor: '#10B981',
                    //   transform: 'translateY(-2px) scale(1.01)'
                    // }
                  }}
                  onClick={() =>
                    openZoomModal(
                      'Investments per Company',
                      'investments_per_company',
                      <InvestmentPerCompanyChart
                        height={400}
                        width={600}
                        year={filters.year}
                        companyId={filters.company}
                        showLegendAndLabels={true} // Pass prop to show legend and labels in modal
                      />
                    )
                  }
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography
                      sx={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: '#1e293b',
                        flexShrink: 0
                      }}
                    >
                      Investments per Company
                    </Typography>
                    <IconButton
                      aria-label="zoom"
                      size="small"
                      sx={{ ml: 1 }}
                      onClick={e => {
                        e.stopPropagation();
                        openZoomModal(
                          'Investments per Company',
                          'investments_per_company',
                          <InvestmentPerCompanyChart
                            height={400}
                            width={600}
                            year={filters.year}
                            companyId={filters.company}
                            showLegendAndLabels={true} 
                          />
                        );
                      }}
                    >
                      <ZoomInIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Box sx={{ flex: 1, minHeight: 0, width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Box sx={{ width: '100%', height: '100%' }}>
                      <InvestmentPerCompanyChart
                        height="100%"
                        width="100%"
                        year={filters.year}
                        companyId={filters.company}
                      />
                    </Box>
                  </Box>
                </Paper>
              </Box>
            </Box>
            {/* Zoom Modal */}
            <ZoomModal
              open={zoomModal.open}
              onClose={() => setZoomModal({ ...zoomModal, open: false })}
              title={zoomModal.title}
              downloadFileName={zoomModal.fileName}
              enableDownload={true}
              maxWidth="xl"
              height={600}
            >
              <Box sx={{
                p: 0,
                m: 0,
                width: '100%',
                height: 540, // leave space for title/date/download
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#fff',
                overflow: 'auto',
                minHeight: 400,
                minWidth: 400,
                '& .recharts-wrapper': {
                  width: '100% !important',
                  height: '100% !important',
                  minWidth: 400,
                  minHeight: 400,
                  margin: '0 auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                },
                '& .recharts-surface': {
                  overflow: 'visible',
                }
              }}>
                <Box sx={{ width: '100%', height: '100%', minHeight: 400, minWidth: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {zoomModal.content}
                </Box>
              </Box>
            </ZoomModal>
          </Box>
        )}
      </Box>
    </Box>
  );
}