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
  ComposedChart,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Box, 
  Typography, 
  Button, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel,
  Grid,
  Card,
  CardContent,
  IconButton,
  Paper
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import api from '../../services/api';
import Sidebar from '../../components/Sidebar';
import * as XLSX from 'xlsx';

// Color schemes for charts
const COLORS = ['#182959', '#2B8C37', '#FF8042', '#FFBB28', '#8884D8', '#82CA9D', '#FFC658'];

const DISTRIBUTION_COLORS = {
  'Government Payments': '#182959',
  'Local Supplier Spending': '#2B8C37', 
  'Foreign Supplier Spending': '#FF8042',
  'Employee Wages & Benefits': '#FFBB28',
  'Community Investments': '#8884D8',
  'Capital Provider Payments': '#82CA9D',
  'Depreciation': '#FFC658',
  'Depletion': '#FF6699',
  'Other Expenditures': '#999999'
};

function Economic() {
  // State for data
  const [summaryData, setSummaryData] = useState([]);
  const [generatedDetails, setGeneratedDetails] = useState([]);
  const [distributedDetails, setDistributedDetails] = useState([]);
  const [companyDistribution, setCompanyDistribution] = useState([]);
  const [expenditureData, setExpenditureData] = useState([]);
  
  // State for filters
  const [filters, setFilters] = useState({
    years: '',
    companies: '',
    types: '',
    orderBy: 'year'
  });
  const [filterOptions, setFilterOptions] = useState({
    years: [],
    companies: [],
    expenditureTypes: []
  });
  
  // State for UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Calculate current year metrics
  const currentYearMetrics = summaryData.length > 0 ? summaryData[summaryData.length - 1] : null;
  const previousYearMetrics = summaryData.length > 1 ? summaryData[summaryData.length - 2] : null;

  const calculateGrowth = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  // Fetch filter options
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const response = await api.get('/economic/dashboard/filter-options');
        setFilterOptions(response.data);
      } catch (err) {
        console.error('Error fetching filter options:', err);
      }
    };
    fetchFilterOptions();
  }, []);

  // Fetch all dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        const queryParams = new URLSearchParams();
        if (filters.years) queryParams.append('years', filters.years);
        if (filters.companies) queryParams.append('companies', filters.companies);
        if (filters.types) queryParams.append('types', filters.types);
        
        // Fetch all data in parallel
        const [
          summaryResponse,
          generatedResponse, 
          distributedResponse,
          companyResponse,
          expenditureResponse
        ] = await Promise.all([
          api.get(`/economic/dashboard/summary?${queryParams}`),
          api.get(`/economic/dashboard/generated-details?${queryParams}`),
          api.get(`/economic/dashboard/distributed-details?${queryParams}`),
          api.get(`/economic/dashboard/company-distribution?${queryParams}`),
          api.get(`/economic/dashboard/expenditure-by-company?${queryParams}`)
        ]);

        setSummaryData(summaryResponse.data);
        setGeneratedDetails(generatedResponse.data);
        setDistributedDetails(distributedResponse.data);
        setCompanyDistribution(companyResponse.data);
        setExpenditureData(expenditureResponse.data);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Error loading dashboard data');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [filters]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleExportData = () => {
    
  };

  // Prepare chart data
  const flowData = summaryData.map(item => ({
    year: item.year,
    economic_value_generated: item.totalGenerated,
    economic_value_distributed: item.totalDistributed,
    economic_value_retained: item.valueRetained
  }));

  const pieChartData = distributedDetails
    .filter(item => item.year === Math.max(...distributedDetails.map(d => d.year)))
    .map(item => [
      { name: 'Government Payments', value: item.governmentPayments },
      { name: 'Local Supplier Spending', value: item.localSupplierSpending },
      { name: 'Foreign Supplier Spending', value: item.foreignSupplierSpending },
      { name: 'Employee Wages & Benefits', value: item.employeeWagesBenefits },
      { name: 'Community Investments', value: item.communityInvestments },
      { name: 'Capital Provider Payments', value: item.capitalProviderPayments },
      { name: 'Depreciation', value: item.depreciation },
      { name: 'Depletion', value: item.depletion },
      { name: 'Other Expenditures', value: item.otherExpenditures }
    ].filter(entry => entry.value > 0))[0] || [];

  const retentionData = summaryData.map(item => ({
    year: item.year,
    retentionRatio: item.totalGenerated > 0 ? 
      ((item.valueRetained / item.totalGenerated) * 100).toFixed(1) : 0
  }));

  const topCompanies = companyDistribution
    .filter(item => item.year === Math.max(...companyDistribution.map(d => d.year)))
    .slice(0, 5);

  if (loading) {
    return (
      <Box sx={{ display: 'flex' }}>
        <Sidebar />
        <Box sx={{ flexGrow: 1, p: 3 }}>
          <Typography>Loading dashboard...</Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex' }}>
      <Sidebar />
        <Box sx={{ flexGrow: 1, p: 3 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, height: '100vh', overflow: 'auto', bgcolor: '#f5f5f5' }}>
        <Box sx={{ p: 2 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography sx={{ fontSize: '0.75rem', fontWeight: 800, color: '#666' }}>
                DASHBOARD
              </Typography>
              <Typography sx={{ fontSize: '2.25rem', color: '#182959', fontWeight: 800 }}>
                Economics
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<FileDownloadIcon />}
              onClick={handleExportData}
              sx={{
                bgcolor: '#182959',
                borderRadius: '999px',
                padding: '9px 18px',
                fontSize: '0.85rem',
                fontWeight: 'bold',
                '&:hover': { bgcolor: '#0f1a3c' }
              }}
            >
              EXPORT DATA
            </Button>
          </Box>

          {/* Filters */}
          <Grid container spacing={1} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Year Filter</InputLabel>
                <Select
                  value={filters.years}
                  label="Year Filter"
                  onChange={(e) => handleFilterChange('years', e.target.value)}
                  sx={{ bgcolor: 'white', minWidth: 120 }}
                >
                  <MenuItem value="">All Years</MenuItem>
                  {filterOptions.years.map(year => (
                    <MenuItem key={year} value={year}>{year}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Company Filter</InputLabel>
                <Select
                  value={filters.companies}
                  label="Company Filter"
                  onChange={(e) => handleFilterChange('companies', e.target.value)}
                  sx={{ bgcolor: 'white', minWidth: 120 }}
                >
                  <MenuItem value="">All Companies</MenuItem>
                  {filterOptions.companies.map(company => (
                    <MenuItem key={company.id} value={company.id}>{company.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Type Filter</InputLabel>
                <Select
                  value={filters.types}
                  label="Type Filter"
                  onChange={(e) => handleFilterChange('types', e.target.value)}
                  sx={{ bgcolor: 'white', minWidth: 120 }}
                >
                  <MenuItem value="">All Types</MenuItem>
                  {filterOptions.expenditureTypes.map(type => (
                    <MenuItem key={type.id} value={type.id}>{type.description}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Order By</InputLabel>
                <Select
                  value={filters.orderBy}
                  label="Order By"
                  onChange={(e) => handleFilterChange('orderBy', e.target.value)}
                  sx={{ bgcolor: 'white', minWidth: 120 }}
                >
                  <MenuItem value="year">Year</MenuItem>
                  <MenuItem value="total_economic_value_generated">Value Generated</MenuItem>
                  <MenuItem value="economic_value_retained">Value Retained</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Metrics Cards */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ borderRadius: 2, boxShadow: 2, height: 120 }}>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h3" sx={{ color: '#182959', fontWeight: 'bold', fontSize: '2rem' }}>
                    {currentYearMetrics ? currentYearMetrics.totalGenerated.toLocaleString() : '0'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.85rem' }}>
                    Value Generated
                  </Typography>
                  {previousYearMetrics && (
                    <Typography variant="caption" sx={{ color: '#2B8C37', fontSize: '0.75rem' }}>
                      ▲{calculateGrowth(currentYearMetrics?.totalGenerated, previousYearMetrics?.totalGenerated)}% from last year
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ borderRadius: 2, boxShadow: 2, bgcolor: '#182959', height: 120 }}>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h3" sx={{ color: 'white', fontWeight: 'bold', fontSize: '2rem' }}>
                    {currentYearMetrics ? currentYearMetrics.totalDistributed.toLocaleString() : '0'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'white', fontSize: '0.85rem' }}>
                    Value Distributed
                  </Typography>
                  {previousYearMetrics && (
                    <Typography variant="caption" sx={{ color: '#2B8C37', fontSize: '0.75rem' }}>
                      ▲{calculateGrowth(currentYearMetrics?.totalDistributed, previousYearMetrics?.totalDistributed)}% from last year
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ borderRadius: 2, boxShadow: 2, height: 120 }}>
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h3" sx={{ color: '#182959', fontWeight: 'bold', fontSize: '2rem' }}>
                    {currentYearMetrics ? currentYearMetrics.valueRetained.toLocaleString() : '0'}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ fontSize: '0.85rem' }}>
                    Value Retained
                  </Typography>
                  {previousYearMetrics && (
                    <Typography variant="caption" sx={{ color: previousYearMetrics.valueRetained > currentYearMetrics?.valueRetained ? '#ff5722' : '#2B8C37', fontSize: '0.75rem' }}>
                      {previousYearMetrics.valueRetained > currentYearMetrics?.valueRetained ? '▼' : '▲'}
                      {Math.abs(calculateGrowth(currentYearMetrics?.valueRetained, previousYearMetrics?.valueRetained))}% from last year
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Charts Row 1 */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            {/* Economic Value Summary */}
            <Grid size={{ xs: 12, lg: 6 }}>
              <Paper sx={{ p: 2, borderRadius: 2, boxShadow: 2, height: 400 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ width: 4, height: 20, bgcolor: '#2B8C37', mr: 1 }} />
                  <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
                    Economic Value Summary
                  </Typography>
                </Box>
                <ResponsiveContainer width="100%" height={340}>
                  <ComposedChart data={flowData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(value) => [value.toLocaleString(), '']} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Bar dataKey="economic_value_generated" fill="#182959" name="Value Generated" />
                    <Bar dataKey="economic_value_distributed" fill="#2B8C37" name="Value Distributed" />
                    <Bar dataKey="economic_value_retained" fill="#FF8042" name="Value Retained" />
                  </ComposedChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Economic Value Generated and Retained Line Chart */}
            <Grid size={{ xs: 12, lg: 6 }}>
              <Paper sx={{ p: 2, borderRadius: 2, boxShadow: 2, height: 400 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, fontSize: '1rem' }}>
                  Economic Value Generated and Retained
                </Typography>
                <ResponsiveContainer width="100%" height={340}>
                  <LineChart data={flowData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(value) => [value.toLocaleString(), '']} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Line type="monotone" dataKey="economic_value_generated" stroke="#182959" strokeWidth={3} dot={{ r: 4 }} name="Value Generated" />
                    <Line type="monotone" dataKey="economic_value_retained" stroke="#FF8042" strokeWidth={3} dot={{ r: 4 }} name="Value Retained" />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>

          {/* Charts Row 2 */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            {/* Economic Value Generated Pie Chart */}
            <Grid size={{ xs: 12, lg: 4 }}>
              <Paper sx={{ p: 2, borderRadius: 2, boxShadow: 2, height: 400 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, fontSize: '1rem' }}>
                  Economic Value Generated {Math.max(...generatedDetails.map(d => d.year)) || 'Current Year'}
                </Typography>
                <ResponsiveContainer width="100%" height={340}>
                  <PieChart>
                    <Pie
                      data={generatedDetails
                        .filter(item => item.year === Math.max(...generatedDetails.map(d => d.year)))
                        .map(item => [
                          { name: 'Electricity Sales', value: item.electricitySales },
                          { name: 'Oil Revenues', value: item.oilRevenues },
                          { name: 'Other Revenues', value: item.otherRevenues },
                          { name: 'Interest Income', value: item.interestIncome },
                          { name: 'Share in Net Income', value: item.shareInNetIncomeOfAssociate },
                          { name: 'Miscellaneous Income', value: item.miscellaneousIncome }
                        ].filter(entry => entry.value > 0))[0] || []}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name.split(' ')[0]}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {generatedDetails
                        .filter(item => item.year === Math.max(...generatedDetails.map(d => d.year)))
                        .map(item => [
                          { name: 'Electricity Sales', value: item.electricitySales },
                          { name: 'Oil Revenues', value: item.oilRevenues },
                          { name: 'Other Revenues', value: item.otherRevenues },
                          { name: 'Interest Income', value: item.interestIncome },
                          { name: 'Share in Net Income', value: item.shareInNetIncomeOfAssociate },
                          { name: 'Miscellaneous Income', value: item.miscellaneousIncome }
                        ].filter(entry => entry.value > 0))[0]?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        )) || []}
                    </Pie>
                    <Tooltip formatter={(value) => [value.toLocaleString(), '']} />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Economic Value Distributed by Companies Line Chart */}
            <Grid size={{ xs: 12, lg: 4 }}>
              <Paper sx={{ p: 2, borderRadius: 2, boxShadow: 2, height: 400 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, fontSize: '1rem' }}>
                  Economic Value Distributed by Companies
                </Typography>
                <ResponsiveContainer width="100%" height={340}>
                  <LineChart data={companyDistribution.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip formatter={(value) => [value.toLocaleString(), '']} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                    <Line type="monotone" dataKey="totalDistributed" stroke="#2B8C37" strokeWidth={2} name="Total Distributed" />
                    <Line type="monotone" dataKey="percentage" stroke="#FF8042" strokeWidth={2} name="Percentage %" />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Economic Value Distribution Pie Chart */}
            <Grid size={{ xs: 12, lg: 4 }}>
              <Paper sx={{ p: 2, borderRadius: 2, boxShadow: 2, height: 400 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, fontSize: '1rem' }}>
                  Economic Value Distribution {Math.max(...distributedDetails.map(d => d.year)) || 'Current Year'}
                </Typography>
                <ResponsiveContainer width="100%" height={340}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name.split(' ')[0]}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={DISTRIBUTION_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value.toLocaleString(), '']} />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
}

export default Economic; 