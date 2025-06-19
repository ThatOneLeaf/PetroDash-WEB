import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart
} from 'recharts';
import api from '../services/api';
import { Box, Button, Typography, Paper, CircularProgress } from "@mui/material";
import Sidebar from '../components/Sidebar';
import { logout } from '../services/auth';
import EnviOverview from '../components/DashboardComponents/EnviOverview'; // Import the EnviOverview component

function Dashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get current date and time
  const getCurrentDateTime = () => {
    const now = new Date();
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    };
    return now.toLocaleString('en-US', options).replace(',', '');
  };

  useEffect(() => {
    // Simulate loading for demonstration; replace with real API call
    const timer = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  // Show header/sidebar, and loading spinner in content area (like HELPDash)
  return (
    <Box sx={{ display: "flex" }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, height: "100vh", overflow: "hidden", p: 3, backgroundColor: '#ffff' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }}>
              OVERVIEW
            </Typography>
            <Typography variant="body1" sx={{ color: '#666', mt: 0.5 }}>
              AS OF {getCurrentDateTime().toUpperCase()}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            onClick={logout}
            sx={{ color: '#666', borderColor: '#666' }}
          >
            Logout
          </Button>
        </Box>

        {/* Main Content */}
        {loading ? (
          <Box sx={{
            width: '100%',
            height: 'calc(100vh - 150px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'transparent'
          }}>
            <CircularProgress size={48} thickness={5} />
            <Typography sx={{ mt: 2, fontWeight: 600, color: '#666', fontSize: 18 }}>
              Loading The Overview Dashboard
            </Typography>
          </Box>
        ) : (
          <>
            {/* Dashboard Grid Layout - 2 Rows */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: 'calc(100vh - 150px)' }}>
              
              {/* First Row - Energy Section (Full Width) */}
              <Paper 
                elevation={1} 
                sx={{ 
                  p: 2, 
                  border: '2px solid #333',
                  borderRadius: 2,
                  backgroundColor: 'white',
                  position: 'relative',
                  flex: '1 1 25%'
                }}
              >
                <Typography 
                  variant="h6" 
                  sx={{ 
                    position: 'absolute',
                    top: -12,
                    left: 16,
                    backgroundColor: 'white',
                    px: 1,
                    fontWeight: 'bold',
                    color: '#333'
                  }}
                >
                  ENERGY
                </Typography>
                <Box sx={{ pt: 2, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Energy component will be inserted here
                  </Typography>
                </Box>
              </Paper>

              {/* Second Row - 2 Columns */}
              <Box sx={{ display: 'flex', gap: 2, flex: '1 1 60%' }}>
                
                {/* Left Column - Economics */}
                <Paper 
                  elevation={1} 
                  sx={{ 
                    flex: '1 1 50%',
                    p: 2, 
                    border: '2px solid #333',
                    borderRadius: 2,
                    backgroundColor: 'white',
                    position: 'relative'
                  }}
                >
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      position: 'absolute',
                      top: -12,
                      left: 16,
                      backgroundColor: 'white',
                      px: 1,
                      fontWeight: 'bold',
                      color: '#333'
                    }}
                  >
                    ECONOMICS
                  </Typography>
                  <Box sx={{ pt: 2, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Economics component will be inserted here
                    </Typography>
                  </Box>
                </Paper>

                {/* Right Column - Environment and Social stacked */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: '1 1 50%' }}>
                  
                  {/* Environment Section */}
                  <Paper 
                    elevation={1} 
                    sx={{ 
                      flex: '1 1 20%',
                      p: 0,
                      border: '2px solid #333',
                      borderRadius: 2,
                      backgroundColor: 'white',
                      position: 'relative'
                    }}
                  >
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        position: 'absolute',
                        top: -12,
                        left: 16,
                        backgroundColor: 'white',
                        px: 1,
                        fontWeight: 'bold',
                        color: '#333',
                        zIndex: 1
                      }}
                    >
                      ENVIRONMENT
                    </Typography>
                    <Box sx={{ pt: 2, height: '100%', px: 2, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <EnviOverview />
                    </Box>
                  </Paper>

                  {/* Social Section */}
                  <Paper 
                    elevation={1} 
                    sx={{ 
                      flex: '1 1 80%',
                      p: 2, 
                      border: '2px solid #333',
                      borderRadius: 2,
                      backgroundColor: 'white',
                      position: 'relative'
                    }}
                  >
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        position: 'absolute',
                        top: -12,
                        left: 16,
                        backgroundColor: 'white',
                        px: 1,
                        fontWeight: 'bold',
                        color: '#333'
                      }}
                    >
                      SOCIAL
                    </Typography>
                    <Box sx={{ pt: 2, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Social component will be inserted here
                      </Typography>
                    </Box>
                  </Paper>

                </Box>

              </Box>

            </Box>

            {/* Token expiry notice */}
            <Typography variant="body2" sx={{ mt: 1, color: '#666' }}>
              Token will expire in 30 seconds and automatically redirect you to home page.
            </Typography>
          </>
        )}
      </Box>
    </Box>
  );
}

export default Dashboard;