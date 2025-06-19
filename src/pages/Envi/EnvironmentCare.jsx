import { Box, Typography } from '@mui/material';
import ConstructionIcon from '@mui/icons-material/Construction';
import Sidebar from '../../components/Sidebar';

function EnvironmentCare() {
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
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start'}}>
              <h1 style={{ 
                fontSize: '1rem', 
                fontWeight: 'bold',
              }}>
                REPOSITORY
              </h1>
              <h2 style={{ fontSize: '3.2rem', color: '#182959', fontWeight: 900, textShadow: '0px 0px 0 #182959'}}>
                Environment - Care
              </h2>
            </div>
          </div>

          {/* Coming Soon Message */}
          <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            textAlign: 'center',
            gap: 2
          }}>
            <ConstructionIcon sx={{ fontSize: 80, color: '#182959', opacity: 0.7 }} />
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#182959', mb: 1 }}>
              Coming Soon
            </Typography>
            <Typography variant="body1" sx={{ color: '#666', maxWidth: '500px', lineHeight: 1.6 }}>
              Data for this section is not yet available. This page will be updated once the necessary information has been provided.
            </Typography>
          </Box>
        </div>
      </Box>
    </Box>
  );
}

export default EnvironmentCare;