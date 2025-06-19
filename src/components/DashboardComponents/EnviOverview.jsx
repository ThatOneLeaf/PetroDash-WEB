import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper } from '@mui/material';
import api from '../../services/api';

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

  const MetricCard = ({ title, value, unit, color }) => (
    <Paper
      elevation={0}
      sx={{
        backgroundColor: color,
        borderRadius: 3,
        p: 2,
        color: 'white',
        textAlign: 'center',
        minHeight: '80px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Typography
        variant="body2"
        sx={{
          fontSize: '0.75rem',
          fontWeight: 'bold',
          mb: 0.5,
          // textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}
      >
        {title}
      </Typography>
      <Typography
        variant="h5"
        sx={{
          fontWeight: 'bold',
          fontSize: '1.5rem',
          // fontFamily: 'monospace'
        }}
      >
        {loading ? '######' : formatNumber(value)}
        {!loading && unit && (
          <Typography component="span" sx={{ fontSize: '0.8rem', ml: 0.5 }}>
            {unit}
          </Typography>
        )}
      </Typography>
    </Paper>
  );

  if (error && !loading) {
    console.warn('Using default environment data due to API error');
  }

  return (
    <Box sx={{ height: '100%', width: '100%', p: 1 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 1.5,
          height: '100%'
        }}
      >
        <MetricCard
          title="Trees Planted"
          value={enviData.treesPlanted}
          color="#2E4057"
        />
        <MetricCard
          title="Reforested Area"
          value={enviData.reforestedArea}
          unit="ha"
          color="#048A81"
        />
        <MetricCard
          title="Recycled Eco Bricks"
          value={enviData.recycledEcoBricks}
          unit="kg"
          color="#54C6EB"
        />
        <MetricCard
          title="Cleanup Participants"
          value={enviData.cleanupParticipants}
          color="#6A994E"
        />
      </Box>
    </Box>
  );
};

export default EnviOverview;