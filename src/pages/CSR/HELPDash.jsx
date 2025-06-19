import { useEffect, useState, useMemo } from 'react';
import Sidebar from '../../components/Sidebar';
import { Box, Typography, Grid, Paper, CircularProgress, Button } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SchoolIcon from '@mui/icons-material/School';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GroupsIcon from '@mui/icons-material/Groups';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import WorkIcon from '@mui/icons-material/Work';
import RefreshIcon from '@mui/icons-material/Refresh';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus'; // Add import for Mobile Clinics icon
import api from '../../services/api';
import InvestmentPerProjectChart from '../CSR/Charts/InvestmentPerProject';
import InvestmentPerProgramChart from '../CSR/Charts/InvestmentPerProgram';
import InvestmentPerCompanyChart from '../CSR/Charts/InvestmentPerCompany';
import ZoomModal from '../../components/DashboardComponents/ZoomModal'; // Add this import
import InvestmentKPI from '../CSR/Charts/InvestmentKPI'; // Add this import

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
  },
  // Livelihood
  {
    category: 'LIVELIHOOD',
    items: [
      {
        label: 'Participants of Livelihood Training',
        icon: <WorkIcon sx={{ color: '#fbbf24', fontSize: 40 }} />, // bigger icon
        key: 'livelihoodParticipants',
        bgColor: '#fff3b0', // slightly darker than #fffbe6
      },
    ],
  },
];

// Aggregates KPI values from API data
function aggregateKPI(data) {
  // The backend returns: csrReport (number), projectName (string), projectId (string), programName (string)
  const result = {
    // Health
    medicalMissionBeneficiaries: 0,
    healthCenterBeneficiaries: 0,
    nutritionPrograms: 0,
    ambulanceDonated: 0,
    mobileClinics: 0, // Add mobileClinics KPI
    // Education
    adoptedSchools: 0,
    collegeScholars: 0,
    educationalMobileDevices: 0,
    teachersTraining: 0,
    // Livelihood
    livelihoodParticipants: 0,
  };

  data.forEach(row => {
    // Use lowercase for matching, and fallback to empty string if undefined
    const projectName = String(row.projectName || '').toLowerCase();
    const programName = String(row.programName || '').toLowerCase();
    const projectId = String(row.projectId || '').toLowerCase();
    const csrReport = Number(row.csrReport) || 0;

    // Health
    if (projectName.includes('medical mission')) {
      result.medicalMissionBeneficiaries += csrReport;
    }
    if (projectName.includes('health center')) {
      result.healthCenterBeneficiaries += csrReport;
    }
    // Nutrition Programs: combine feeding and supplements
    if (
      projectName.includes('feeding') ||
      projectName.includes('supplement') ||
      projectName.includes('nutrition')
    ) {
      result.nutritionPrograms += csrReport;
    }
    if (projectName.includes('ambulance')) {
      // If each row is a donation, count as 1 if csrReport is falsy
      result.ambulanceDonated += csrReport > 0 ? csrReport : 1;
    }
    if (projectName.includes('mobile clinic')) {
      // If each row is a donation, count as 1 if csrReport is falsy
      result.mobileClinics += csrReport > 0 ? csrReport : 1;
    }

    // Education
    if (projectName.includes('adopted school')) {
      result.adoptedSchools += csrReport > 0 ? csrReport : 1;
    }
    if (projectName.includes('scholar')) {
      result.collegeScholars += csrReport;
    }
    // Educational Mobile Devices: match "mobile device", "tablet", or "educational device"
    if (
      projectName.includes('mobile device') ||
      projectName.includes('tablet') ||
      projectName.includes('educational device')
    ) {
      result.educationalMobileDevices += csrReport;
    }
    if (projectName.includes('teacher')) {
      result.teachersTraining += csrReport;
    }

    // Livelihood
    if (projectName.includes('livelihood')) {
      result.livelihoodParticipants += csrReport;
    }
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
function KPIBox({ icon, label, value, lastUpdated, bgColor }) {
  // Dynamically adjust font size based on label length to avoid wrapping
  let labelFontSize = 15;
  if (label.length > 35) labelFontSize = 11;
  else if (label.length > 28) labelFontSize = 12;
  else if (label.length > 22) labelFontSize = 13;
  else if (label.length > 16) labelFontSize = 14;

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
        minHeight: 120,
        height: '100%',
        padding: '18px 18px 14px 18px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',   
        textAlign: 'center',
      }}
    >
      <Box sx={{ fontSize: 48, mr: 0.5 }}>{icon}</Box>
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
        {/*KPIS */}
        <Typography
          sx={{
            fontSize: 28,
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
            wordBreak: 'keep-all',
            whiteSpace: 'nowrap',
            width: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
          title={label}
        >
          {label}
        </Typography>
        <Typography
          sx={{
            fontSize: 10,
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

  // Fetch HELP activities data from API
  const fetchData = () => {
    setLoading(true);
    api.get('help/activities')
      .then(res => {
        setData(res.data);
        setLastUpdated(new Date());
        // console.log('HELPDash API data:', res.data); // For debugging
      })
      .catch(() => {
        setData([]);
        setLastUpdated(new Date());
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Memoized filter options for dropdowns
  const yearOptions = useMemo(
    () => [...new Set(data.map(d => d.projectYear).filter(Boolean))].sort((a, b) => b - a),
    [data]
  );
  // Company options now include both id and name
  const companyOptions = useMemo(
    () =>
      [
        ...new Map(
          data
            .filter(d => d.companyId && d.companyName)
            .map(d => [d.companyId, { id: d.companyId, name: d.companyName }])
        ).values(),
      ].sort((a, b) => a.name.localeCompare(b.name)),
    [data]
  );

  // Filter data based on selected filters
  const filteredData = useMemo(() => {
    return data.filter(row => {
      if (filters.year && String(row.projectYear) !== String(filters.year)) return false;
      if (filters.company && row.companyId !== filters.company) return false;
      return true;
    });
  }, [data, filters]);

  // Memoized KPI and investment values
  const kpi = useMemo(() => aggregateKPI(filteredData), [filteredData]);
  const investments = useMemo(() => aggregateInvestments(filteredData), [filteredData]);

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
      // Set most recent year as default
      setFilters(f => ({
        ...f,
        year: yearOptions.length > 0 ? yearOptions[0] : '',
        company: ''
      }));
    } else {
      // Investments: clear filters (all years)
      setFilters({ year: '', company: '' });
    }
  };

  // Helper to open modal with chart content
  const openZoomModal = (title, fileName, content) => {
    setZoomModal({ open: true, title, fileName, content });
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', background: '#f4f6fb' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, p: { xs: 1, sm: 2, md: 4 } }}>
        {/* Header Row */}
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2
        }}>
          <Box>
            <Typography sx={{ fontSize: 11, fontWeight: 800, color: '#64748b', mb: 0.5 }}>
              DASHBOARD
            </Typography>
            <Typography sx={{ fontSize: 18, fontWeight: 800, color: '#182959', letterSpacing: 0.5 }}>
              Social - H.E.L.P
            </Typography>
            {/* Metadata: Last updated */}
            <Typography sx={{
              color: '#64748b',
              fontSize: 10,
              fontWeight: 400,
              mt: 0.5
            }}>
              The data presented in this dashboard is accurate as of: {formatDateTime(lastUpdated)}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<RefreshIcon sx={{ fontSize: 16 }} />}
            sx={{
              backgroundColor: '#1976d2',
              borderRadius: '7px',
              fontWeight: 600,
              fontSize: 11,
              px: 1.5,
              py: 0.5,
              minHeight: '28px',
              minWidth: '80px',
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
          mb: 1.5,
          flexShrink: 0
        }}>
          <Button
            onClick={() => handleTabSwitch('HELP')}
            sx={{
              padding: '5px 10px',
              backgroundColor: activeTab === 'HELP' ? '#10B981' : '#9CA3AF',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              fontSize: '11px',
              fontWeight: '600',
              cursor: 'pointer',
              minWidth: '60px',
              minHeight: '26px',
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
              padding: '5px 10px',
              backgroundColor: activeTab === 'Investments' ? '#10B981' : '#9CA3AF',
              color: 'white',
              border: 'none',
              borderRadius: '16px',
              fontSize: '11px',
              fontWeight: '600',
              cursor: 'pointer',
              minWidth: '60px',
              minHeight: '26px',
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
          <>
            {/* Filters Row */}
            <Box
              sx={{
                display: 'flex',
                gap: '7px',
                mb: 2,
                flexWrap: 'wrap',
                alignItems: 'center',
                flexShrink: 0,
              }}
            >
              {/* Year Filter */}
              <select
                value={filters.year}
                onChange={e => handleFilter('year', e.target.value)}
                style={{
                  padding: '5px 8px',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '14px',
                  backgroundColor: 'white',
                  fontSize: '11px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  minWidth: '70px',
                  height: '28px'
                }}
              >
                {/* No "All Years" option for HELP */}
                {yearOptions.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>

              {/* Company Filter */}
              <select
                value={filters.company}
                onChange={e => handleFilter('company', e.target.value)}
                style={{
                  padding: '5px 8px',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '14px',
                  backgroundColor: 'white',
                  fontSize: '11px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  minWidth: '70px',
                  height: '28px'
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
                    padding: '5px 8px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '14px',
                    fontSize: '10px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    height: '28px'
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
                >
                  <Typography
                    sx={{
                      fontSize: 28, 
                      fontWeight: 900,
                      color: '#182959',
                      mb: 1.2,
                      letterSpacing: 1,
                      textAlign: 'left',
                      textTransform: 'uppercase',
                      pl: { xs: 1, sm: 2 },
                    }}
                  >
                    {section.category}
                  </Typography>
                  <Grid
                    container
                    spacing={1.5}
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
                        md={Math.max(12 / section.items.length, 3)}
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
                          value={loading ? <CircularProgress size={22} /> : kpi[item.key]}
                          lastUpdated={lastUpdated}
                          bgColor={item.bgColor}
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
          <>
            {/* Filters Row (reuse HELP filters) */}
            <Box
              sx={{
                display: 'flex',
                gap: '7px',
                mb: 2,
                flexWrap: 'wrap',
                alignItems: 'center',
                flexShrink: 0,
              }}
            >
              {/* Year Filter */}
              <select
                value={filters.year}
                onChange={e => handleFilter('year', e.target.value)}
                style={{
                  padding: '5px 8px',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '14px',
                  backgroundColor: 'white',
                  fontSize: '11px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  minWidth: '70px',
                  height: '28px'
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
                  padding: '5px 8px',
                  border: '1.5px solid #e2e8f0',
                  borderRadius: '14px',
                  backgroundColor: 'white',
                  fontSize: '11px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  minWidth: '70px',
                  height: '28px'
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
                    padding: '5px 8px',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '14px',
                    fontSize: '10px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    height: '28px'
                  }}
                  onClick={clearFilters}
                >
                  Clear Filters
                </button>
              )}
            </Box>

            {/* KPI Row - 3 columns */}
            <InvestmentKPI
              year={filters.year}
              companyId={filters.company}
            />

            {/* Graph Containers Layout */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                gap: 2,
                width: '100%',
                alignItems: 'stretch',
                minHeight: 0,
                height: `calc(100vh - 64px - 48px - 32px - 120px - 48px)`, // subtract header, tabs, filters, KPI, margins
                // 64px header, 48px tabs/filters, 120px KPI, 48px margins (adjust as needed)
              }}
            >
              {/* Investments per Projects */}
              <Paper
                elevation={0}
                sx={{
                  flex: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  background: '#fff',
                  borderRadius: '10px',
                  border: '1.5px solid #e2e8f0',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                  minWidth: '50%',
                  maxWidth: '55%',
                  height: '100%',
                  minHeight: 0,
                  padding: '10px 10px 8px 10px',
                  justifyContent: 'flex-start',
                  cursor: 'pointer',
                  transition: 'box-shadow 0.2s, border-color 0.2s, transform 0.15s',
                  '&:hover': {
                    boxShadow: '0 4px 16px rgba(16,185,129,0.12)',
                    borderColor: '#10B981',
                    transform: 'translateY(-2px) scale(1.01)'
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
                    />
                  )
                }
              >
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#1e293b',
                    mb: 0.5,
                    flexShrink: 0
                  }}
                >
                  Investments per Project
                </Typography>
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
              </Paper>
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  minWidth: 0,
                  height: '100%',
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
                    height: '50%',
                    minHeight: 0,
                    padding: '10px 10px 8px 10px',
                    justifyContent: 'flex-start',
                    cursor: 'pointer',
                    transition: 'box-shadow 0.2s, border-color 0.2s, transform 0.15s',
                    '&:hover': {
                      boxShadow: '0 4px 16px rgba(16,185,129,0.12)',
                      borderColor: '#10B981',
                      transform: 'translateY(-2px) scale(1.01)'
                    }
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
                      />
                    )
                  }
                >
                  <Typography
                    sx={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#1e293b',
                      mb: 0.5,
                      flexShrink: 0
                    }}
                  >
                    Investments per Program
                  </Typography>
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
                {/* Investments per Company */}
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
                    '&:hover': {
                      boxShadow: '0 4px 16px rgba(16,185,129,0.12)',
                      borderColor: '#10B981',
                      transform: 'translateY(-2px) scale(1.01)'
                    }
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
                      />
                    )
                  }
                >
                  <Typography
                    sx={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#1e293b',
                      mb: 0.5,
                      flexShrink: 0
                    }}
                  >
                    Investments per Company
                  </Typography>
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
                padding: '20px',
                margin: '0 auto',
                width: 'calc(100% - 40px)',
                height: 'calc(100% - 40px)',
                overflow: 'hidden',
                '& .recharts-wrapper': {
                  margin: '0 auto',
                },
                '& .recharts-surface': {
                  overflow: 'visible',
                }
              }}>
                {zoomModal.content}
              </Box>
            </ZoomModal>
          </>
        )}
      </Box>
    </Box>
  );
}