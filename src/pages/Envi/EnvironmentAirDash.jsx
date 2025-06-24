import { useState } from 'react';
import { Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import ConstructionIcon from '@mui/icons-material/Construction';
import RefreshIcon from '@mui/icons-material/Refresh';
import Sidebar from '../../components/Sidebar';

function EnvironmentAirDash() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [lastUpdated] = useState(new Date());

  // Function to format the current date and time
  const formatDateTime = (date) => {
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
  };

  // Function to refresh the entire page
  const handleRefresh = () => {
    window.location.reload();
  };
  return (
    <div style={{ 
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      height: isMobile ? 'auto' : '100vh',
      minHeight: isMobile ? '100vh' : 'auto',
      width: '100%',
      margin: 0,
      padding: 0,
      overflow: isMobile ? 'visible' : 'hidden',
      backgroundColor: '#f8fafc'
    }}>
      <Sidebar />

      {/* Main Content */}
      <div style={{ 
        flex: 1,
        padding: isSmallScreen ? '8px' : '15px',
        backgroundColor: '#f4f6fb',
        overflow: isMobile ? 'visible' : 'hidden',
        display: 'flex',
        flexDirection: 'column',
        zoom: isSmallScreen ? '0.7' : '0.8'
      }}>        {/* Header - Responsive */}
        <div style={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between', 
          alignItems: isMobile ? 'flex-start' : 'center',
          gap: isMobile ? '10px' : '0',
          marginBottom: '15px',
          flexShrink: 0
        }}>
          <div>
            <div style={{ 
              color: '#64748b', 
              fontSize: isSmallScreen ? '10px' : '12px',
              fontWeight: '500',
              marginBottom: '3px'
            }}>
              DASHBOARD
            </div>
            <h1 style={{ 
              fontSize: isSmallScreen ? '18px' : isMobile ? '20px' : '24px',
              fontWeight: 'bold', 
              color: '#1e293b',
              margin: 0 
            }}>
              Environment - Air
            </h1>
          </div>
          <button 
            onClick={handleRefresh}
            style={{
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              padding: isSmallScreen ? '6px 12px' : '8px 16px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: isSmallScreen ? '6px' : '8px',
              cursor: 'pointer',
              fontSize: isSmallScreen ? '11px' : '13px',
              fontWeight: '700',
              transition: 'background-color 0.2s ease',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
              alignSelf: isMobile ? 'flex-start' : 'auto'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#115293'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#1976d2'}
          >
            <RefreshIcon style={{ fontSize: isSmallScreen ? '14px' : '16px' }} />
            Refresh
          </button>
        </div>

        {/* Coming Soon Content */}
        <div style={{ 
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          margin: '20px 0'
        }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            gap: 3,
            padding: '40px'
          }}>            <ConstructionIcon sx={{ 
              fontSize: isSmallScreen ? 80 : isMobile ? 100 : 120, 
              color: '#1e293b', 
              opacity: 0.6,
              marginBottom: 1
            }} />
            <Typography variant="h3" sx={{ 
              fontWeight: 'bold', 
              color: '#1e293b', 
              marginBottom: 2,
              fontSize: isSmallScreen ? '1.8rem' : isMobile ? '2.2rem' : '2.5rem'
            }}>
              Coming Soon
            </Typography>
            <Typography variant="h6" sx={{ 
              color: '#64748b', 
              maxWidth: '600px', 
              lineHeight: 1.6,
              fontSize: isSmallScreen ? '0.9rem' : isMobile ? '1rem' : '1.1rem',
              fontWeight: '400',
              textAlign: 'center',
              px: { xs: 2, sm: 0 }
            }}>
              Data for this section is not yet available. This page will be updated once the necessary information has been provided.
            </Typography>
            
            {/* Additional info box */}
            <Box sx={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: isSmallScreen ? '15px' : '20px',
              marginTop: '20px',
              maxWidth: isSmallScreen ? '100%' : '500px',
              mx: { xs: 2, sm: 0 }
            }}>
              <Typography variant="body2" sx={{ 
                color: '#475569',
                fontSize: isSmallScreen ? '0.8rem' : '0.9rem',
                textAlign: 'center'
              }}>
                This dashboard will feature air quality metrics, emission data, and environmental monitoring information once the data collection systems are implemented.
              </Typography>
            </Box>
          </Box>
        </div>
      </div>
    </div>
  );
}

export default EnvironmentAirDash;