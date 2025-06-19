import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import ConstructionIcon from '@mui/icons-material/Construction';
import RefreshIcon from '@mui/icons-material/Refresh';
import Sidebar from '../../components/Sidebar';

function EnvironmentCareDash() {
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
      flexDirection: 'row',
      height: '100vh',
      width: '100%',
      margin: 0,
      padding: 0,
      overflow: 'hidden',
      backgroundColor: '#f8fafc'
    }}>
      <Sidebar />

      {/* Main Content */}
      <div style={{ 
        flex: 1,
        padding: '15px',
        backgroundColor: '#f4f6fb',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        zoom: '0.8'
      }}>
        {/* Header - Compact */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '15px',
          flexShrink: 0
        }}>
          <div>
            <div style={{ 
              color: '#64748b', 
              fontSize: '12px',
              fontWeight: '500',
              marginBottom: '3px'
            }}>
              DASHBOARD
            </div>
            <h1 style={{ 
              fontSize: '24px',
              fontWeight: 'bold', 
              color: '#1e293b',
              margin: 0 
            }}>
              Environment - C.A.R.E.
            </h1>
          </div>
          <button 
            onClick={handleRefresh}
            style={{
              backgroundColor: '#1976d2',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '700',
              transition: 'background-color 0.2s ease',
              boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
            }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#115293'}
            onMouseOut={(e) => e.target.style.backgroundColor = '#1976d2'}
          >
            <RefreshIcon style={{ fontSize: '16px' }} />
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
          }}>
            <ConstructionIcon sx={{ 
              fontSize: 120, 
              color: '#1e293b', 
              opacity: 0.6,
              marginBottom: 1
            }} />
            <Typography variant="h3" sx={{ 
              fontWeight: 'bold', 
              color: '#1e293b', 
              marginBottom: 2,
              fontSize: '2.5rem'
            }}>
              Coming Soon
            </Typography>
            <Typography variant="h6" sx={{ 
              color: '#64748b', 
              maxWidth: '600px', 
              lineHeight: 1.6,
              fontSize: '1.1rem',
              fontWeight: '400'
            }}>
              Data for this section is not yet available. This page will be updated once the necessary information has been provided.
            </Typography>
            
            {/* Additional info box */}
            <Box sx={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '20px',
              marginTop: '20px',
              maxWidth: '500px'
            }}>
              <Typography variant="body2" sx={{ 
                color: '#475569',
                fontSize: '0.9rem',
                textAlign: 'center'
              }}>
                This dashboard is intended to support the CARE program, which focuses on protecting and preserving the ecological balance and value of the area. It aligns with the goals of sustainable ecotourism by helping prevent environmental threats and promoting responsible tourism practices.
              </Typography>
            </Box>
          </Box>
        </div>
      </div>
    </div>
  );
}

export default EnvironmentCareDash;