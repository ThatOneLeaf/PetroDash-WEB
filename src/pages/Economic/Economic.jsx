import { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Grid,
  Card,
  CardContent,
  CircularProgress
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import api from '../../services/api';
import Sidebar from '../../components/Sidebar';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useNavigate } from "react-router-dom";
import DashboardHeader from '../../components/DashboardComponents/DashboardHeader';
import RefreshIcon from '@mui/icons-material/Refresh';
import { format } from 'date-fns';
import ZoomModal from '../../components/DashboardComponents/ZoomModal';
import {
  ChartContainer,
  EconomicAnalysisChart,
  EconomicLineChart,
  GeneratedPieChart,
  CompanyBarChart,
  DistributionPieChart,
  generateModalContent
} from './EconCharts';

// Utils
const formatDateTime = (date) => format(date, "PPPpp");

function Economic() {
  const [sidebarMode, setSidebarMode] = useState("dashboard");
  const navigate = useNavigate();
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    if (sidebarMode !== "dashboard") {
      navigate("/economic/repository");
    }
  }, [sidebarMode, navigate]);

  // State for data
  const [summaryData, setSummaryData] = useState([]);
  const [generatedDetails, setGeneratedDetails] = useState([]);
  const [distributedDetails, setDistributedDetails] = useState([]);
  const [companyDistribution, setCompanyDistribution] = useState([]);
  const [expenditureData, setExpenditureData] = useState([]);
  const [retentionData, setRetentionData] = useState([]);
  
  // State for chart tab management (only for first chart)
  const [firstChartTab, setFirstChartTab] = useState(0);
  const [modalTab, setModalTab] = useState(0);
  
  // State for zoom modal
  const [zoomModal, setZoomModal] = useState({ 
    open: false, 
    content: null, 
    title: '', 
    fileName: '' 
  });
  
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

  // Fetch retention data
  const fetchRetentionData = async () => {
      try {
        const response = await api.get('/economic/retention');
        setRetentionData(response.data);
    } catch (err) {
      console.error('Error fetching retention data:', err);
    }
  };

  // Fetch all dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        const queryParams = new URLSearchParams();
        if (filters.years) queryParams.append('years', filters.years);
        if (filters.companies) queryParams.append('companies', filters.companies);
        if (filters.types) queryParams.append('types', filters.types);
        
        // Create query params without year filter for charts that should show all years
        const queryParamsNoYear = new URLSearchParams();
        if (filters.companies) queryParamsNoYear.append('companies', filters.companies);
        if (filters.types) queryParamsNoYear.append('types', filters.types);
        
        // Fetch all data in parallel
        const [
          summaryResponse,
          generatedResponse, 
          distributedResponse,
          companyResponse,
          expenditureResponse
        ] = await Promise.all([
          // Summary and retention data should not be affected by year filters (for chart 1 & 2)
          api.get(`/economic/dashboard/summary?${queryParamsNoYear}`),
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
        
        // Fetch retention data (should not be affected by year filters)
        await fetchRetentionData();
        
        setLastUpdated(new Date());
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

  // Refs for PDF export
  const kpiRef = useRef();
  const chart1Ref = useRef();
  const chart2Ref = useRef();
  const chart3Ref = useRef();
  const chart4Ref = useRef();
  const chart5Ref = useRef();

  const handleExportData = async () => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      let y = 20;

      // Title and date on the same line
      pdf.setFontSize(20);
      pdf.text('Economic Dashboard Report', 15, y);
      pdf.setFontSize(12);
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 200, y, { align: 'right' });
      y += 12;

      // --- KPI Cards ---
      const kpiCanvas = await html2canvas(kpiRef.current, { scale: 2 });
      const kpiImg = kpiCanvas.toDataURL('image/png');
      const kpiWidth = 180;
      const kpiHeight = (kpiCanvas.height * kpiWidth) / kpiCanvas.width;
      pdf.addImage(kpiImg, 'PNG', 15, y, kpiWidth, kpiHeight);
      y += kpiHeight + 10;

      // --- Chart 1: Economic Value Analysis ---
      const chart1Canvas = await html2canvas(chart1Ref.current, { scale: 2 });
      const chart1Width = 180;
      const chart1Height = (chart1Canvas.height * chart1Width) / chart1Canvas.width;
      pdf.addImage(chart1Canvas.toDataURL('image/png'), 'PNG', 15, y, chart1Width, chart1Height);
      y += chart1Height + 10;

      // --- Chart 2: Economic Value Generated and Retained ---
      const chart2Canvas = await html2canvas(chart2Ref.current, { scale: 2 });
      const chart2Width = 180;
      const chart2Height = (chart2Canvas.height * chart2Width) / chart2Canvas.width;
      pdf.addImage(chart2Canvas.toDataURL('image/png'), 'PNG', 15, y, chart2Width, chart2Height);
      y += chart2Height + 10;

      // --- Chart 3: Economic Value Generated Pie Chart ---
      const chart3Canvas = await html2canvas(chart3Ref.current, { scale: 2 });
      const chart3Width = 180;
      const chart3Height = (chart3Canvas.height * chart3Width) / chart3Canvas.width;
      pdf.addImage(chart3Canvas.toDataURL('image/png'), 'PNG', 15, y, chart3Width, chart3Height);
      y += chart3Height + 10;

      // --- Chart 4: Top 5 Companies - Economic Value Distribution (Bar Chart) ---
      // Estimate chart height before rendering
      const chart4Canvas = await html2canvas(chart4Ref.current, { scale: 2 });
      const chart4Width = 180;
      const chart4Height = (chart4Canvas.height * chart4Width) / chart4Canvas.width;
      // If not enough space, add a new page
      if (y + chart4Height + 20 > 297) {
        pdf.addPage();
        y = 20;
      }
      pdf.addImage(chart4Canvas.toDataURL('image/png'), 'PNG', 15, y, chart4Width, chart4Height);
      y += chart4Height + 10;

      // --- Chart 5: Economic Value Distribution Pie Chart ---
      // If not enough space, add a new page
      if (y + 60 > 297) {
        pdf.addPage();
        y = 20;
      }
      const chart5Canvas = await html2canvas(chart5Ref.current, { scale: 2 });
      const chart5Width = 180;
      const chart5Height = (chart5Canvas.height * chart5Width) / chart5Canvas.width;
      pdf.addImage(chart5Canvas.toDataURL('image/png'), 'PNG', 15, y, chart5Width, chart5Height);
      y += chart5Height + 10;

      pdf.save('Economic_Dashboard_Report.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  // Prepare chart data
  const flowData = summaryData.map(item => ({
    year: item.year,
    economic_value_generated: Math.round(item.totalGenerated),
    economic_value_distributed: Math.round(item.totalDistributed),
    economic_value_retained: Math.round(item.valueRetained)
  }));

  const pieChartData = distributedDetails
    .filter(item => item.year === Math.max(...distributedDetails.map(d => d.year)))
    .map(item => {
      const total = item.totalDistributed || 0;
      return [
        { name: 'Government Payments', value: item.governmentPayments },
        { name: 'Local Supplier Spending', value: item.localSupplierSpending },
        { name: 'Foreign Supplier Spending', value: item.foreignSupplierSpending },
        { name: 'Employee Wages & Benefits', value: item.employeeWagesBenefits },
        { name: 'Community Investments', value: item.communityInvestments },
        { name: 'Capital Provider Payments', value: item.capitalProviderPayments }
      ].filter(entry => entry.value > 0 && (entry.value / total) >= 0.01); // Filter out values less than 1%
    })[0] || [];

  const retentionRatioData = summaryData.map(item => ({
    year: item.year,
    retentionRatio: item.totalGenerated > 0 ? 
      ((item.valueRetained / item.totalGenerated) * 100).toFixed(1) : 0
  }));

  const topCompanies = companyDistribution
    .filter(item => item.year === Math.max(...companyDistribution.map(d => d.year)))
    .slice(0, 5);

  const handleFirstChartTabChange = (event, newValue) => {
    setFirstChartTab(newValue);
  };

  const handleModalTabChange = (event, newValue) => {
    setModalTab(newValue);
    // Update modal content immediately with new tab value
    const newContent = generateModalContent.economicAnalysis(
      flowData, 
      retentionData, 
      summaryData, 
      newValue, 
      handleModalTabChange
    );
    setZoomModal(prev => ({
      ...prev,
      content: newContent
    }));
  };

  const openZoomModal = (title, fileName, content) => {
    setModalTab(firstChartTab); // Reset modal tab to match main chart
    setZoomModal({ 
      open: true, 
      title, 
      fileName, 
      content: generateModalContent.economicAnalysis(
        flowData, 
        retentionData, 
        summaryData, 
        firstChartTab, 
        handleModalTabChange
      )
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex' }}>
        <Sidebar />
        <Box sx={{ flexGrow: 1, p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', bgcolor: '#f5f7fa' }}>
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress size={64} thickness={5} sx={{ color: '#182959' }} />
            <Typography sx={{ mt: 2, color: '#182959', fontWeight: 700, fontSize: 20 }}>
              Loading Economic Dashboard...
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex' }}>
        <Sidebar />
        <Box sx={{ flexGrow: 1, p: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', bgcolor: '#f5f7fa' }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography color="error" sx={{ fontWeight: 700, fontSize: 20 }}>
              {error}
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <Box sx={{ flexGrow: 1, height: '100vh', overflow: 'hidden', bgcolor: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 2, pt: 2, flexShrink: 0 }}>
          <DashboardHeader
            title="Economic"
            lastUpdated={lastUpdated}
            formatDateTime={formatDateTime}
          />
          <Box sx={{ display: 'flex', gap: 1, mt: "15px" }}>
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={() => window.location.reload()}
                sx={{
                  backgroundColor: '#1976d2',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: 13,
                  px: 2,
                  py: 0.5,
                  minHeight: '32px',
                  height: '32px',
                  '&:hover': { backgroundColor: '#115293' }
                }}
              >
                Refresh
              </Button>
              <Button
                variant="contained"
                startIcon={<FileDownloadIcon />}
                onClick={handleExportData}
                sx={{
                  backgroundColor: '#182959',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: 13,
                  px: 2,
                  py: 0.5,
                  minHeight: '32px',
                  height: '32px',
                  '&:hover': { backgroundColor: '#0f1a3c' }
                }}
              >
                Export Data
              </Button>
            </Box>
        </Box>

        <Box sx={{ flex: 1, p: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>

          {/* Filters */}
          <Box sx={{ mb: 1.5, flexShrink: 0, display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              value={filters.years}
              onChange={(e) => handleFilterChange('years', e.target.value)}
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
              {filterOptions.years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            
            {filters.years && (
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
                onClick={() => handleFilterChange('years', '')}
              >
                Clear Filters
              </button>
            )}
          </Box>

          {/* Metrics Cards */}
          <div ref={kpiRef}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'nowrap', pb: 0, flexShrink: 0 }}>
                              <Card sx={{ borderRadius: 2, boxShadow: 2, bgcolor: '#2B8C37', flex: 1, minHeight: 60 }}>
                  <CardContent sx={{ textAlign: 'center', py: 1, px: 1, '&:last-child': { pb: 0.25 } }}>
                    <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>
                      {currentYearMetrics ? `₱${Math.round(currentYearMetrics.totalGenerated).toLocaleString()}` : '₱0'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'white', fontSize: '0.6rem' }}>
                      Value Generated
                    </Typography>
                    {previousYearMetrics && (
                      <Typography variant="caption" sx={{ 
                        color: 'white', 
                        fontSize: '0.5rem' 
                      }}>
                        <span style={{ color: calculateGrowth(currentYearMetrics?.totalGenerated, previousYearMetrics?.totalGenerated) >= 0 ? '#4CAF50' : '#F44336' }}>
                          {calculateGrowth(currentYearMetrics?.totalGenerated, previousYearMetrics?.totalGenerated) >= 0 ? '▲' : '▼'}
                        </span>
                        {Math.abs(calculateGrowth(currentYearMetrics?.totalGenerated, previousYearMetrics?.totalGenerated))}% from last year
                      </Typography>
                    )}
                  </CardContent>
                </Card>
                              <Card sx={{ borderRadius: 2, boxShadow: 2, bgcolor: '#FF8042', flex: 1, minHeight: 60 }}>
                  <CardContent sx={{ textAlign: 'center', py: 1, px: 1, '&:last-child': { pb: 0.25 } }}>
                    <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>
                      {currentYearMetrics ? `₱${Math.round(currentYearMetrics.totalDistributed).toLocaleString()}` : '₱0'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'white', fontSize: '0.6rem' }}>
                      Value Distributed
                    </Typography>
                    {previousYearMetrics && (
                      <Typography variant="caption" sx={{ color: 'white', fontSize: '0.5rem' }}>
                        ▲{calculateGrowth(currentYearMetrics?.totalDistributed, previousYearMetrics?.totalDistributed)}% from last year
                      </Typography>
                    )}
                  </CardContent>
                </Card>
                              <Card sx={{ borderRadius: 2, boxShadow: 2, bgcolor: '#182959', flex: 1, minHeight: 60 }}>
                  <CardContent sx={{ textAlign: 'center', py: 1, px: 1, '&:last-child': { pb: 0.25 } }}>
                    <Typography variant="h5" sx={{ color: 'white', fontWeight: 'bold', fontSize: '1rem' }}>
                      {currentYearMetrics ? `₱${Math.round(currentYearMetrics.valueRetained).toLocaleString()}` : '₱0'}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'white', fontSize: '0.6rem' }}>
                      Value Retained
                    </Typography>
                    {previousYearMetrics && (() => {
                      const currentValue = currentYearMetrics?.valueRetained || 0;
                      const previousValue = previousYearMetrics?.valueRetained || 0;
                      const growthRate = calculateGrowth(currentValue, previousValue);
                      
                      // For Value Retained, we need to consider the context:
                      // - If current is better than previous (higher retention), show green up
                      // - If current is worse than previous (lower retention), show red down
                      const isImprovement = currentValue > previousValue;
                      
                      return (
                        <Typography variant="caption" sx={{ 
                          color: 'white', 
                          fontSize: '0.5rem' 
                        }}>
                          <span style={{ color: isImprovement ? '#4CAF50' : '#F44336' }}>
                            {isImprovement ? '▲' : '▼'}
                          </span>
                          {Math.abs(growthRate)}% from last year
                        </Typography>
                      );
                    })()}
                  </CardContent>
                </Card>
            </Box>
          </div>

          {/* Charts Row 1 */}
          <Grid container spacing={1} sx={{ mb: 0.5, flex: 1, minHeight: 0, mt: 1, height: '45%' }}>
            {/* First Chart with Tabs - Economic Value Analysis/Retention */}
            <Grid size={{ xs: 12, lg: 6 }} sx={{ display: 'flex' }}>
              <ChartContainer 
                chartRef={chart1Ref}
                title="Annual Economic Value Analysis"
                fileName="economic_value_analysis"
                modalContent={generateModalContent.economicAnalysis(flowData, retentionData, summaryData, modalTab, handleModalTabChange)}
                openZoomModal={openZoomModal}
              >
                <EconomicAnalysisChart 
                  flowData={flowData}
                  retentionData={retentionData}
                  summaryData={summaryData}
                  firstChartTab={firstChartTab}
                  handleFirstChartTabChange={handleFirstChartTabChange}
                />
              </ChartContainer>
            </Grid>
            {/* Economic Value Generated and Retained Line Chart */}
            <Grid size={{ xs: 12, lg: 6 }} sx={{ display: 'flex' }}>
              <ChartContainer 
                chartRef={chart2Ref}
                title="Annual Economic Value Generated and Retained"
                fileName="economic_value_line_chart"
                modalContent={generateModalContent.lineChart(flowData)}
                openZoomModal={openZoomModal}
              >
                <EconomicLineChart flowData={flowData} />
              </ChartContainer>
            </Grid>
          </Grid>

          {/* Charts Row 2 */}
          <Grid container spacing={1} sx={{ flex: 1, minHeight: 0, mt: 1, mb: 1 }}>
            {/* Economic Value Generated Pie Chart */}
            <Grid size={{ xs: 12, lg: 4 }} sx={{ display: 'flex' }}>
              <ChartContainer 
                chartRef={chart3Ref}
                title={`Economic Value Generated ${Math.max(...generatedDetails.map(d => d.year)) || 'Current Year'}`}
                fileName="economic_value_generated_pie"
                modalContent={generateModalContent.generatedPie(generatedDetails)}
                openZoomModal={openZoomModal}
              >
                <GeneratedPieChart generatedDetails={generatedDetails} />
              </ChartContainer>
            </Grid>
            {/* Economic Value Distributed by Companies Bar Chart */}
            <Grid size={{ xs: 12, lg: 4 }} sx={{ display: 'flex' }}>
              <ChartContainer 
                chartRef={chart4Ref}
                title="Top 5 Companies - Economic Value Distribution"
                fileName="top_companies_distribution"
                modalContent={generateModalContent.companyBar(companyDistribution)}
                openZoomModal={openZoomModal}
              >
                <CompanyBarChart companyDistribution={companyDistribution} />
              </ChartContainer>
            </Grid>
            {/* Economic Value Distribution Pie Chart */}
            <Grid size={{ xs: 12, lg: 4 }} sx={{ display: 'flex' }}>
              <ChartContainer 
                chartRef={chart5Ref}
                title={`Economic Value Distribution ${Math.max(...distributedDetails.map(d => d.year)) || 'Current Year'}`}
                fileName="economic_value_distribution_pie"
                modalContent={generateModalContent.distributionPie(distributedDetails, pieChartData)}
                openZoomModal={openZoomModal}
              >
                <DistributionPieChart distributedDetails={distributedDetails} pieChartData={pieChartData} />
              </ChartContainer>
            </Grid>
          </Grid>
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
    </Box>
  );
}

export default Economic;