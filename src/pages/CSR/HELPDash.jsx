import { useEffect, useState, useMemo } from 'react';
import Sidebar from '../../components/Sidebar';
import { Box, Typography, Grid, Paper, CircularProgress, Button, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import LocalPharmacyIcon from '@mui/icons-material/LocalPharmacy';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import SchoolIcon from '@mui/icons-material/School';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GroupsIcon from '@mui/icons-material/Groups';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import WorkIcon from '@mui/icons-material/Work';
import RefreshIcon from '@mui/icons-material/Refresh';
import api from '../../services/api';

const kpiConfig = [
  // Health
  {
    category: 'HEALTH',
    items: [
      {
        label: 'Beneficiaries of annual medical mission',
        icon: <FavoriteIcon sx={{ color: '#ef4444', fontSize: 40 }} />, 
        key: 'medicalMissionBeneficiaries',
        bgColor: '#fdeaea', // subtle red
      },
      {
        label: 'Beneficiaries of health center',
        icon: <LocalHospitalIcon sx={{ color: '#ef4444', fontSize: 40 }} />,
        key: 'healthCenterBeneficiaries',
        bgColor: '#fdeaea',
      },
      {
        label: 'Nutrition Programs',
        icon: <RestaurantIcon sx={{ color: '#ef4444', fontSize: 40 }} />, // bigger icon
        key: 'nutritionPrograms',
        bgColor: '#fdeaea',
      },
      {
        label: 'Ambulance Donated',
        icon: <LocalShippingIcon sx={{ color: '#ef4444', fontSize: 40 }} />, // bigger icon
        key: 'ambulanceDonated',
        bgColor: '#fdeaea',
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
        bgColor: '#e3f0fc', // subtle blue
      },
      {
        label: 'College Scholars',
        icon: <EmojiEventsIcon sx={{ color: '#1976d2', fontSize: 40 }} />, // bigger icon
        key: 'collegeScholars',
        bgColor: '#e3f0fc',
      },
      {
        label: 'Project BEST',
        icon: <GroupsIcon sx={{ color: '#1976d2', fontSize: 40 }} />, // bigger icon
        key: 'projectBest',
        bgColor: '#e3f0fc',
      },
      {
        label: 'Teachers Training',
        icon: <PersonAddIcon sx={{ color: '#1976d2', fontSize: 40 }} />, // bigger icon
        key: 'teachersTraining',
        bgColor: '#e3f0fc',
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
        bgColor: '#fffbe6', // subtle yellow
      },
    ],
  },
];

function aggregateKPI(data) {
  // The backend returns: csrReport (number), projectName (string), projectId (string), programName (string)
  const result = {
    // Health
    medicalMissionBeneficiaries: 0,
    healthCenterBeneficiaries: 0,
    nutritionPrograms: 0,
    ambulanceDonated: 0,
    // Education
    adoptedSchools: 0,
    collegeScholars: 0,
    projectBest: 0,
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

    // Education
    if (projectName.includes('adopted school')) {
      result.adoptedSchools += csrReport > 0 ? csrReport : 1;
    }
    if (projectName.includes('scholar')) {
      result.collegeScholars += csrReport;
    }
    if (projectName.includes('best')) {
      result.projectBest += csrReport;
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

function KPIBox({ icon, label, value, lastUpdated, bgColor }) {
  // Wrap label if more than 3 words
  const words = label.split(' ');
  let displayLabel;
  if (words.length > 3) {
    displayLabel = (
      <>
        {words.slice(0, 3).join(' ')}
        <br />
        {words.slice(3).join(' ')}
      </>
    );
  } else {
    displayLabel = label;
  }

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
        minHeight: 0,
        padding: '18px 18px 14px 18px',
        display: 'flex',
        flexDirection: 'row', // icon at the side
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        textAlign: 'center',
      }}
    >
      <Box sx={{ fontSize: 48, mr: 2 }}>{icon}</Box>
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
        {/*KPIS */}
        <Typography
          sx={{
            fontSize: 34, 
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
        {/* KPIs LABELS */}
        <Typography
          sx={{
            fontSize: 15, 
            fontWeight: 700,
            color: '#64748b',
            textAlign: 'center',
            lineHeight: 1.2,
            wordBreak: 'break-word',
            whiteSpace: 'pre-line',
            width: '100%',
          }}
        >
          {displayLabel}
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

export default function HELPDash() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    year: '',
    company: '',
    program: '',
    project: ''
  });
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch data from the same API as CSRActivity
  const fetchData = () => {
    setLoading(true);
    api.get('help/activities')
      .then(res => {
        setData(res.data);
        setLastUpdated(new Date());
        console.log('HELPDash API data:', res.data); // <-- Add this line
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

  // Filter options
  const yearOptions = useMemo(() => [
    ...new Set(data.map(d => d.projectYear).filter(Boolean))
  ].sort((a, b) => b - a), [data]);
  const companyOptions = useMemo(() => [
    ...new Set(data.map(d => d.companyName).filter(Boolean))
  ].sort(), [data]);
  const programOptions = useMemo(() => [
    ...new Set(data.map(d => d.programName).filter(Boolean))
  ].sort(), [data]);
  const projectOptions = useMemo(() => {
    let filtered = data;
    if (filters.program) filtered = filtered.filter(d => d.programName === filters.program);
    return [...new Set(filtered.map(d => d.projectName).filter(Boolean))].sort();
  }, [data, filters.program]);

  // Filtered data for KPIs
  const filteredData = useMemo(() => {
    return data.filter(row => {
      if (filters.year && String(row.projectYear) !== String(filters.year)) return false;
      if (filters.company && row.companyName !== filters.company) return false;
      if (filters.program && row.programName !== filters.program) return false;
      if (filters.project && row.projectName !== filters.project) return false;
      return true;
    });
  }, [data, filters]);

  const kpi = useMemo(() => aggregateKPI(filteredData), [filteredData]);

  // Handle filter change
  const handleFilter = (key, value) => {
    setFilters(f => ({
      ...f,
      [key]: value,
      ...(key === 'program' ? { project: '' } : {}) // Reset project if program changes
    }));
  };

  // Clear all filters
  const clearFilters = () => setFilters({ year: '', company: '', program: '', project: '' });

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
            <Typography sx={{ fontSize: 13, fontWeight: 800, color: '#64748b', mb: 0.5 }}>
              DASHBOARD
            </Typography>
            <Typography sx={{ fontSize: 24, fontWeight: 800, color: '#182959', letterSpacing: 1 }}>
              Social - H.E.L.P
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            sx={{
              backgroundColor: '#1976d2',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: 13,
              px: 2,
              py: 1,
              '&:hover': { backgroundColor: '#115293' }
            }}
            onClick={fetchData}
          >
            Refresh
          </Button>
        </Box>

        {/* Filters Row - styled like EnvironmentEnergyDash */}
        <Box
          sx={{
            display: 'flex',
            gap: '10px',
            mb: 3,
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
              padding: '8px 12px',
              border: '2px solid #e2e8f0',
              borderRadius: '20px',
              backgroundColor: 'white',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              minWidth: '100px'
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
              padding: '8px 12px',
              border: '2px solid #e2e8f0',
              borderRadius: '20px',
              backgroundColor: 'white',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              minWidth: '100px'
            }}
          >
            <option value="">All Companies</option>
            {companyOptions.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Program Filter */}
          <select
            value={filters.program}
            onChange={e => handleFilter('program', e.target.value)}
            style={{
              padding: '8px 12px',
              border: '2px solid #e2e8f0',
              borderRadius: '20px',
              backgroundColor: 'white',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              minWidth: '100px'
            }}
          >
            <option value="">All Programs</option>
            {programOptions.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          {/* Project Filter */}
          <select
            value={filters.project}
            onChange={e => handleFilter('project', e.target.value)}
            disabled={!filters.program && projectOptions.length === 0}
            style={{
              padding: '8px 12px',
              border: '2px solid #e2e8f0',
              borderRadius: '20px',
              backgroundColor: 'white',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              minWidth: '100px'
            }}
          >
            <option value="">All Projects</option>
            {projectOptions.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          {(filters.year || filters.company || filters.program || filters.project) && (
            <button
              style={{
                padding: '8px 12px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                fontSize: '11px',
                cursor: 'pointer',
                fontWeight: '600'
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
                {section.category === 'HEALTH' && "HEALTH"}
                {section.category === 'EDUCATION' && "EDUCATION"}
                {section.category === 'LIVELIHOOD' && "LIVELIHOOD"}
              </Typography>
              <Grid
                container
                spacing={1.5}
                sx={{
                  width: '100%',
                  margin: 0,
                  px: { xs: 0, sm: 1 },
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
                      justifyContent: 'stretch',
                      alignItems: 'stretch',
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
      </Box>
    </Box>
  );
}
