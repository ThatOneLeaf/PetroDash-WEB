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
import { Box, Button, Typography, Paper, Card, CardContent, Grid, CircularProgress } from "@mui/material";
import Sidebar from '../components/Sidebar';
import { useAuth } from '../contexts/AuthContext';
import EnviOverview from '../components/DashboardComponents/EnviOverview';
import DashboardHeader from '../components/DashboardComponents/DashboardHeader';
import { format } from 'date-fns';
import HELPINvestments from './CSR/Charts/InvestmentKPI'

function Dashboard() {
  const { logout } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Economic data state
  const [economicData, setEconomicData] = useState([]);
  const [economicLoading, setEconomicLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Utils
  const formatDateTime = (date) => format(date, "PPPpp");

  // Calculate growth percentage
  const calculateGrowth = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  // Fetch economic data
  useEffect(() => {
    const fetchEconomicData = async () => {
      try {
        setEconomicLoading(true);
        const response = await api.get('/economic/dashboard/summary');
        setEconomicData(response.data);
        setEconomicLoading(false);
        setLastUpdated(new Date());
      } catch (err) {
        console.error('Error fetching economic data:', err);
        setEconomicLoading(false);
      }
    };
    fetchEconomicData();
  }, []);

  // Calculate current and previous year metrics for economic data
  const currentYearMetrics = economicData.length > 0 ? economicData[economicData.length - 1] : null;
  const previousYearMetrics = economicData.length > 1 ? economicData[economicData.length - 2] : null;

  // Prepare chart data for Economic Analysis chart
  const flowData = economicData.map(item => ({
    year: item.year,
    economic_value_generated: item.totalGenerated,
    economic_value_distributed: item.totalDistributed,
    economic_value_retained: item.valueRetained
  }));

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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1}}>
          <DashboardHeader
            title="Overview"
            lastUpdated={lastUpdated}
            formatDateTime={formatDateTime}
          />
          <Button
            variant="outlined"
            onClick={logout}
            sx={{ color: '#666', borderColor: '#666', mt: "15px" }}
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
                    ECONOMIC
                  </Typography>
                  <Box sx={{ pt: 0, height: '100%' }}>
                {economicLoading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                        <Typography variant="body2" color="text.secondary">
                          Loading economic data...
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    {/* KPI Cards Row - Compact fit-content height */}
                    <Box sx={{ height: 'fit-content', mb: 1, flexShrink: 0 }}>
                      <Grid container spacing={1}>
                        {/* Value Generated Card */}
                        <Grid size={4}>
                          <Card sx={{ borderRadius: 2, boxShadow: 1, height: 'fit-content' }}>
                            <CardContent sx={{ 
                              textAlign: 'center', 
                              py: 0.5, 
                              px: 1, 
                              '&:last-child': { pb: 0.5 },
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              minHeight: 'unset'
                            }}>
                              <Typography variant="h5" sx={{ color: '#182959', fontWeight: 'bold', fontSize: '1.1rem', mb: 0.2, lineHeight: 1.2 }}>
                                {currentYearMetrics ? currentYearMetrics.totalGenerated.toLocaleString() : '0'}
                              </Typography>
                              <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.7rem', mb: 0.2, lineHeight: 1.1 }}>
                                Value Generated
                              </Typography>
                              {previousYearMetrics && (
                                <Typography variant="caption" sx={{ color: '#2B8C37', fontSize: '0.6rem', lineHeight: 1 }}>
                                  ▲{calculateGrowth(currentYearMetrics?.totalGenerated, previousYearMetrics?.totalGenerated)}% from last year
                                </Typography>
                              )}
                            </CardContent>
                          </Card>
                        </Grid>
                        
                        {/* Value Distributed Card */}
                        <Grid size={4}>
                          <Card sx={{ borderRadius: 2, boxShadow: 1, bgcolor: '#182959', height: 'fit-content' }}>
                            <CardContent sx={{ 
                              textAlign: 'center', 
                              py: 0.5, 
                              px: 1, 
                              '&:last-child': { pb: 0.5 },
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              minHeight: 'unset'
                            }}>
                              <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold', fontSize: '1.1rem', mb: 0.2, lineHeight: 1.2 }}>
                                {currentYearMetrics ? currentYearMetrics.totalDistributed.toLocaleString() : '0'}
                              </Typography>
                              <Typography variant="body2" sx={{ color: 'white', fontSize: '0.7rem', mb: 0.2, lineHeight: 1.1 }}>
                                Value Distributed
                              </Typography>
                              {previousYearMetrics && (
                                <Typography variant="caption" sx={{ color: 'white', fontSize: '0.6rem', lineHeight: 1 }}>
                                  ▲{calculateGrowth(currentYearMetrics?.totalDistributed, previousYearMetrics?.totalDistributed)}% from last year
                                </Typography>
                              )}
                            </CardContent>
                          </Card>
                        </Grid>
                        
                        {/* Value Retained Card */}
                        <Grid size={4}>
                          <Card sx={{ borderRadius: 2, boxShadow: 1, height: 'fit-content' }}>
                            <CardContent sx={{ 
                              textAlign: 'center', 
                              py: 0.5, 
                              px: 1, 
                              '&:last-child': { pb: 0.5 },
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              minHeight: 'unset'
                            }}>
                              <Typography variant="h5" sx={{ color: '#182959', fontWeight: 'bold', fontSize: '1.1rem', mb: 0.2, lineHeight: 1.2 }}>
                                {currentYearMetrics ? currentYearMetrics.valueRetained.toLocaleString() : '0'}
                              </Typography>
                              <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.7rem', mb: 0.2, lineHeight: 1.1 }}>
                                Value Retained
                              </Typography>
                              {previousYearMetrics && (
                                <Typography variant="caption" sx={{ 
                                  color: previousYearMetrics.valueRetained > currentYearMetrics?.valueRetained ? '#ff5722' : '#2B8C37', 
                                  fontSize: '0.6rem',
                                  lineHeight: 1
                                }}>
                                  {previousYearMetrics.valueRetained > currentYearMetrics?.valueRetained ? '▼' : '▲'}
                                  {Math.abs(calculateGrowth(currentYearMetrics?.valueRetained, previousYearMetrics?.valueRetained))}% from last year
                                </Typography>
                              )}
                            </CardContent>
                          </Card>
                        </Grid>
                      </Grid>
                    </Box>
                    
                    {/* Chart Area - 2/3 of height */}
                    <Box sx={{ flex: 1, minHeight: 0 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Box sx={{ width: 4, height: 20, bgcolor: '#2B8C37', mr: 1 }} />
                        <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                          Annual Economic Value Analysis
                            </Typography>
                          </Box>
                      <Box sx={{ height: 'calc(100% - 40px)' }}>
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={flowData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="year" tick={{ fontSize: 9 }} />
                            <YAxis tick={{ fontSize: 9 }} />
                            <Tooltip formatter={(value) => [value.toLocaleString(), '']} />
                            <Legend wrapperStyle={{ fontSize: '10px' }} />
                            <Bar dataKey="economic_value_generated" fill="#182959" name="Value Generated" />
                            <Bar dataKey="economic_value_distributed" fill="#2B8C37" name="Value Distributed" />
                            <Bar dataKey="economic_value_retained" fill="#FF8042" name="Value Retained" />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </Box>
                    </Box>
                  </Box>
                )}
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
                    <Box sx={{ pt: 2, height: '100%', width: '100%', px: 2, pb: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                      {/* <Typography variant="body2" color="text.secondary">
                        Social component will be inserted here
                        <HELPINvestments />
                      </Typography> */}
                      <HELPINvestments />
                    </Box>
                  </Paper>

                </Box>

              </Box>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}

export default Dashboard;