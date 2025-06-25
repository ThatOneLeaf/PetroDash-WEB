import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import api from '../../services/api';
import ForestIcon from '@mui/icons-material/Forest';
import ParkIcon from '@mui/icons-material/Park';
import RecyclingIcon from '@mui/icons-material/Recycling';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';

const EnviOverview = () => {
  const [enviData, setEnviData] = useState({
    treesPlanted: 0,
    reforestedArea: 0,
    recycledEcoBricks: 0,
    cleanupParticipants: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEnviData = async () => {
      try {
        // TODO: Replace '/environment/overview' with your actual API endpoint
        // const response = await api.get('/environment/overview');
        // setEnviData({
        //   treesPlanted: response.data.treesPlanted || 0,
        //   reforestedArea: response.data.reforestedArea || 0,
        //   recycledEcoBricks: response.data.recycledEcoBricks || 0,
        //   cleanupParticipants: response.data.cleanupParticipants || 0
        // });
        // setLoading(false);

        // Temporary: Using mock data until API is ready
        setTimeout(() => {
          setEnviData({
            treesPlanted: 125430,
            reforestedArea: 89250,
            recycledEcoBricks: 45680,
            cleanupParticipants: 78900
          });
          setLoading(false);
        }, 1000); // Simulate loading time

      } catch (err) {
        console.error('Error fetching environment data:', err);
        setError('Failed to load environment data');
        setLoading(false);
        // Set default values on error
        setEnviData({
          treesPlanted: 125430,
          reforestedArea: 89250,
          recycledEcoBricks: 45680,
          cleanupParticipants: 78900
        });
      }
    };
    fetchEnviData();
  }, []);

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  };

  const KPI_ICON_COLORS = {
    treesPlanted: '#14532d', // deep green
    reforestedArea: '#035c53', // deep teal
    recycledEcoBricks: '#1e3a8a', // deep blue
    cleanupParticipants: '#386641', // deep green
  };

  const MetricCard = ({ title, value, unit, color, icon }) => (
    <Paper
      elevation={0}
      sx={{
        backgroundColor: color,
        borderRadius: 3,
        p: 2,
        color: 'white',
        textAlign: 'center',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'stretch',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', width: '100%', justifyContent: 'flex-start', gap: 0, p: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 0, p: 0, m: 0 }}>
          {React.cloneElement(icon, { sx: { fontSize: 36, color: 'white', m: 0, p: 0 } })}
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', p: 0, m: 0 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 'bold',
              fontSize: '1.5rem',
              color: 'white',
              lineHeight: 1.1,
              textAlign: 'center',
              width: '100%',
            }}
          >
            {loading ? '######' : formatNumber(value)}
            {!loading && unit && (
              <Typography component="span" sx={{ fontSize: '0.8rem', ml: 0.5, color: 'white' }}>
                {unit}
              </Typography>
            )}
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontSize: '0.9rem', // increased from 0.75rem
              fontWeight: 'bold',
              mb: 0.5,
              letterSpacing: '0.5px',
              color: 'white',
              textAlign: 'center',
              width: '100%',
            }}
          >
            {title}
          </Typography>
        </Box>
      </Box>
    </Paper>
  );

  if (error && !loading) {
    console.warn('Using default environment data due to API error');
  }

  return (
    <Box sx={{ height: '100%', width: '100%', p: 0 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 1,
          height: '100%'
        }}
      >
        <MetricCard
          value={enviData.treesPlanted}
          title="Trees Planted"
          color="#2E4057"
          icon={<ForestIcon sx={{ fontSize: 36, color: KPI_ICON_COLORS.treesPlanted }} />}
        />
        <MetricCard
          value={enviData.reforestedArea}
          title="Reforested Area"
          unit="ha"
          color="#048A81"
          icon={<ParkIcon sx={{ fontSize: 36, color: KPI_ICON_COLORS.reforestedArea }} />}
        />
        <MetricCard
          value={enviData.recycledEcoBricks}
          title="Recycled Materials"
          unit="kg"
          color="#54C6EB"
          icon={<RecyclingIcon sx={{ fontSize: 36, color: KPI_ICON_COLORS.recycledEcoBricks }} />}
        />
        <MetricCard
          value={enviData.cleanupParticipants}
          title="Cleanup Drive Participants"
          color="#6A994E"
          icon={<VolunteerActivismIcon sx={{ fontSize: 36, color: KPI_ICON_COLORS.cleanupParticipants }} />}
        />
      </Box>
    </Box>
  );
};

export default EnviOverview;