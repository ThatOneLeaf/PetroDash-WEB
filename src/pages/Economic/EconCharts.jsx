import React from 'react';
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
  Cell,
  Area,
  AreaChart
} from 'recharts';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab
} from '@mui/material';

// Color schemes for charts
const COLORS = ['#3B82F6', '#06B6D4', '#10B981', '#8B5CF6', '#6366F1', '#0EA5E9', '#14B8A6'];

// Custom label function for pie charts with smart positioning
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, index }) => {
  const RADIAN = Math.PI / 180;
  
  // Calculate label position with more spacing
  const radius = innerRadius + (outerRadius - innerRadius) * 1.8;
  let x = cx + radius * Math.cos(-midAngle * RADIAN);
  let y = cy + radius * Math.sin(-midAngle * RADIAN);
  
  // Adjust position based on quadrant to avoid overlap
  const quadrant = Math.floor(((midAngle + 90) % 360) / 90);
  switch (quadrant) {
    case 0: // Top right
      y -= 5;
      break;
    case 1: // Bottom right
      y += 5;
      break;
    case 2: // Bottom left
      y += 5;
      break;
    case 3: // Top left
      y -= 5;
      break;
  }
  
  // Text wrapping with shorter lines for better spacing
  const words = name.split(' ');
  const lines = [];
  const maxCharsPerLine = 10; // Shorter lines to reduce overlap
  
  let currentLine = '';
  words.forEach(word => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (testLine.length <= maxCharsPerLine) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  });
  if (currentLine) lines.push(currentLine);
  
  // Limit to maximum 2 lines
  if (lines.length > 2) {
    lines[1] = lines.slice(1).join(' ');
    lines.splice(2);
  }
  
  const percentage = `${(percent * 100).toFixed(0)}%`;
  
  return (
    <text 
      x={x} 
      y={y} 
      fill="#1F2937" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      fontSize="10px"
      fontWeight="600"
    >
      {lines.map((line, lineIndex) => (
        <tspan key={lineIndex} x={x} dy={lineIndex === 0 ? -6 : 12}>
          {line}
        </tspan>
      ))}
      <tspan x={x} dy="12" fontWeight="bold" fontSize="11px">
        {percentage}
      </tspan>
    </text>
  );
};

const DISTRIBUTION_COLORS = {
  'Government Payments': '#3B82F6',
  'Local Supplier Spending': '#06B6D4',
  'Foreign Supplier Spending': '#10B981',
  'Employee Wages & Benefits': '#8B5CF6',
  'Community Investments': '#6366F1',
  'Capital Provider Payments': '#0EA5E9',
  'Depreciation': '#14B8A6',
  'Depletion': '#1D4ED8',
  'Other Expenditures': '#0891B2'
};

// Reusable chart container with hover effects and click handler
export const ChartContainer = ({ children, title, fileName, modalContent, chartRef, openZoomModal }) => (
  <div ref={chartRef} style={{ width: '100%' }}>
    <Paper sx={{ 
      p: 1, 
      borderRadius: 2, 
      boxShadow: 2, 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      cursor: 'pointer',
      '&:hover': {
        boxShadow: 4,
        transform: 'translateY(-2px)',
        transition: 'all 0.3s ease'
      }
    }}
    onClick={() => openZoomModal(title, fileName, modalContent)}
    >
      {children}
    </Paper>
  </div>
);

// Reusable modal content wrapper
export const ModalContent = ({ title, children }) => (
  <Box sx={{ width: '100%', height: '560px', padding: '10px' }}>
    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, fontSize: '1.1rem' }}>
      {title}
    </Typography>
    <Box sx={{ height: '500px' }}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </Box>
  </Box>
);

// Economic Analysis Chart Component
export const EconomicAnalysisChart = ({ 
  flowData, 
  retentionData, 
  summaryData, 
  firstChartTab, 
  handleFirstChartTabChange 
}) => (
  <>
    {/* Chart Tabs */}
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Box sx={{ width: 4, height: 20, bgcolor: '#2B8C37', mr: 1 }} />
        <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
          Annual Economic Value Analysis
        </Typography>
      </Box>
      <Box sx={{ 
        bgcolor: '#f5f5f5', 
        borderRadius: '8px', 
        p: 0.5,
        border: '1px solid #e0e0e0'
      }}>
        <Tabs 
          value={firstChartTab} 
          onChange={handleFirstChartTabChange}
          onClick={(e) => e.stopPropagation()}
          sx={{
            minHeight: 'auto',
            '& .MuiTabs-indicator': {
              backgroundColor: '#2B8C37',
              height: 3,
              borderRadius: '3px'
            },
            '& .MuiTabs-flexContainer': {
              gap: '4px'
            },
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 'bold',
              fontSize: '0.875rem',
              color: '#666',
              minHeight: '36px',
              minWidth: '80px',
              padding: '8px 16px',
              borderRadius: '6px',
              transition: 'all 0.2s ease',
              backgroundColor: 'transparent',
              '&:hover': {
                backgroundColor: '#e8f5e8',
                color: '#2B8C37'
              },
              '&.Mui-selected': {
                color: '#2B8C37',
                backgroundColor: 'white',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                fontWeight: 'bold'
              }
            }
          }}
        >
          <Tab label="Summary" />
          <Tab label="Retention Ratio" />
        </Tabs>
      </Box>
    </Box>

    {/* Chart Content */}
    <Box sx={{ flex: 1, minHeight: 0 }}>
      <ResponsiveContainer width="100%" height="100%">
      {firstChartTab === 0 ? (
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
      ) : (
        <AreaChart data={retentionData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" tick={{ fontSize: 9 }} />
          <YAxis 
            tick={{ fontSize: 9 }} 
            tickFormatter={(value) => `${value}%`}
            label={{ value: 'Retention Ratio (%)', angle: -90, position: 'insideLeft', style: { fontSize: '10px' } }}
          />
          <Tooltip 
            formatter={(value, name, props) => {
              const yearData = summaryData.find(item => item.year === props.payload.year);
              const actualValue = yearData ? yearData.valueRetained : 0;
              return [
                `${value}%`, 
                'Retention Ratio',
                `Value Retained: ${actualValue.toLocaleString()}`
              ];
            }}
            labelFormatter={(label) => `Year: ${label}`}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #ccc',
              borderRadius: '4px'
            }}
          />
          <Area 
            type="monotone" 
            dataKey="retention_ratio" 
            stroke="#182959" 
            fill="#182959" 
            fillOpacity={0.3}
            strokeWidth={3}
          />
        </AreaChart>
      )}
    </ResponsiveContainer>
    </Box>
  </>
);

// Line Chart Component
export const EconomicLineChart = ({ flowData }) => (
  <>
    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, fontSize: '0.9rem' }}>
      Annual Economic Value Generated and Retained
    </Typography>
    <Box sx={{ flex: 1, minHeight: 0 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={flowData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="year" tick={{ fontSize: 9 }} />
          <YAxis tick={{ fontSize: 9 }} />
          <Tooltip formatter={(value) => [value.toLocaleString(), '']} />
          <Legend wrapperStyle={{ fontSize: '10px' }} />
          <Line type="monotone" dataKey="economic_value_generated" stroke="#182959" strokeWidth={3} dot={{ r: 3 }} name="Value Generated" />
          <Line type="monotone" dataKey="economic_value_retained" stroke="#FF8042" strokeWidth={3} dot={{ r: 3 }} name="Value Retained" />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  </>
);

// Generated Pie Chart Component
export const GeneratedPieChart = ({ generatedDetails }) => {
  const currentYear = Math.max(...generatedDetails.map(d => d.year)) || 'Current Year';
  const pieData = generatedDetails
    .filter(item => item.year === Math.max(...generatedDetails.map(d => d.year)))
    .map(item => {
      const total = item.totalGenerated || 0;
      return [
        { name: 'Electricity Sales', value: item.electricitySales },
        { name: 'Oil Revenues', value: item.oilRevenues },
        { name: 'Other Revenues', value: item.otherRevenues },
        { name: 'Interest Income', value: item.interestIncome },
        { name: 'Share in Net Income', value: item.shareInNetIncomeOfAssociate },
        { name: 'Miscellaneous Income', value: item.miscellaneousIncome }
      ].filter(entry => entry.value > 0 && (entry.value / total) >= 0.01);
    })[0] || [];

  return (
    <>
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, fontSize: '0.85rem' }}>
        Economic Value Generated {currentYear}
      </Typography>
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              outerRadius={85}
              fill="#8884d8"
              dataKey="value"
              label={renderCustomLabel}
              labelLine={true}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [value.toLocaleString(), '']} />
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </>
  );
};

// Company Bar Chart Component
export const CompanyBarChart = ({ companyDistribution }) => {
  const currentYear = Math.max(...companyDistribution.map(d => d.year)) || 'Current Year';
  const renderChart = () => {
    if (!companyDistribution || companyDistribution.length === 0) {
      return (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%',
          color: '#666',
          fontSize: '14px'
        }}>
          No data available
        </div>
      );
    }
    
    const years = companyDistribution.map(d => d.year).filter(year => year !== undefined);
    if (years.length === 0) {
      return <div>No valid years found</div>;
    }
    
    const maxYear = Math.max(...years);
    const filteredData = companyDistribution.filter(item => item.year === maxYear);
    
    if (filteredData.length === 0) {
      return <div>No data for selected year</div>;
    }
    
    const sortedData = filteredData.sort((a, b) => (b.percentage || 0) - (a.percentage || 0));
    const chartData = sortedData.slice(0, 5);
    
    return (
      <BarChart 
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis 
          dataKey="companyId" 
          tick={{ fontSize: 10 }}
          angle={0}
          textAnchor="middle"
          height={40}
          interval={0}
        />
        <YAxis 
          tick={{ fontSize: 8 }} 
          tickFormatter={(value) => `${value}%`}
          label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft', style: { fontSize: '10px' } }}
        />
        <Tooltip 
          formatter={(value, name, props) => [
            `₱ ${props.payload.totalDistributed.toLocaleString()}`, 
            'Total Distributed Value'
          ]}
          labelFormatter={(label) => {
            const fullCompany = chartData.find(item => item.companyId === label);
            return `Company: ${fullCompany ? fullCompany.companyName : label}`;
          }}
        />
        <Bar 
          dataKey="percentage" 
          name="Percentage"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color || '#2B8C37'} />
          ))}
        </Bar>
      </BarChart>
    );
  };

  return (
    <>
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, fontSize: '0.85rem' }}>
        Top 5 Companies - Economic Value Distribution {currentYear}
      </Typography>
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </Box>
    </>
  );
};

// Distribution Pie Chart Component
export const DistributionPieChart = ({ distributedDetails, pieChartData }) => {
  const currentYear = Math.max(...distributedDetails.map(d => d.year)) || 'Current Year';

  return (
    <>
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, fontSize: '0.85rem' }}>
        Economic Value Distribution {currentYear}
      </Typography>
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieChartData}
              cx="50%"
              cy="50%"
              outerRadius={85}
              fill="#8884d8"
              dataKey="value"
              label={renderCustomLabel}
              labelLine={true}
            >
              {pieChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={DISTRIBUTION_COLORS[entry.name] || COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [value.toLocaleString(), '']} />
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </>
  );
};

// Modal content generators
export const generateModalContent = {
  economicAnalysis: (flowData, retentionData, summaryData, firstChartTab, handleFirstChartTabChange) => (
    <Box sx={{ width: '100%', height: '560px', padding: '10px' }}>
      {/* Chart Tabs */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ width: 4, height: 20, bgcolor: '#2B8C37', mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
            Economic Value Analysis
          </Typography>
        </Box>
        <Box sx={{ 
          bgcolor: '#f5f5f5', 
          borderRadius: '8px', 
          p: 0.5,
          border: '1px solid #e0e0e0'
        }}>
          <Tabs 
            value={firstChartTab} 
            onChange={handleFirstChartTabChange}
            onClick={(e) => e.stopPropagation()}
            sx={{
              minHeight: 'auto',
              '& .MuiTabs-indicator': {
                backgroundColor: '#2B8C37',
                height: 3,
                borderRadius: '3px'
              },
              '& .MuiTabs-flexContainer': {
                gap: '4px'
              },
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 'bold',
                fontSize: '0.875rem',
                color: '#666',
                minHeight: '36px',
                minWidth: '80px',
                padding: '8px 16px',
                borderRadius: '6px',
                transition: 'all 0.2s ease',
                backgroundColor: 'transparent',
                '&:hover': {
                  backgroundColor: '#e8f5e8',
                  color: '#2B8C37'
                },
                '&.Mui-selected': {
                  color: '#2B8C37',
                  backgroundColor: 'white',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  fontWeight: 'bold'
                }
              }
            }}
          >
            <Tab label="Summary" />
            <Tab label="Retention Ratio" />
          </Tabs>
        </Box>
      </Box>

      {/* Chart Content */}
      <Box sx={{ flex: 1, height: '500px' }}>
        <ResponsiveContainer width="100%" height="100%">
          {firstChartTab === 0 ? (
            <ComposedChart data={flowData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => [value.toLocaleString(), '']} />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="economic_value_generated" fill="#182959" name="Value Generated" />
              <Bar dataKey="economic_value_distributed" fill="#2B8C37" name="Value Distributed" />
              <Bar dataKey="economic_value_retained" fill="#FF8042" name="Value Retained" />
            </ComposedChart>
          ) : (
            <AreaChart data={retentionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" tick={{ fontSize: 12 }} />
              <YAxis 
                tick={{ fontSize: 12 }} 
                tickFormatter={(value) => `${value}%`}
                label={{ value: 'Retention Ratio (%)', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }}
              />
              <Tooltip 
                formatter={(value, name, props) => {
                  const yearData = summaryData.find(item => item.year === props.payload.year);
                  const actualValue = yearData ? yearData.valueRetained : 0;
                  return [
                    `${value}%`, 
                    'Retention Ratio',
                    `Value Retained: ${actualValue.toLocaleString()}`
                  ];
                }}
                labelFormatter={(label) => `Year: ${label}`}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
              <Area 
                type="monotone" 
                dataKey="retention_ratio" 
                stroke="#182959" 
                fill="#182959" 
                fillOpacity={0.3}
                strokeWidth={3}
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </Box>
    </Box>
  ),

  lineChart: (flowData) => (
    <ModalContent title="Economic Value Generated and Retained">
      <LineChart data={flowData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="year" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip formatter={(value) => [value.toLocaleString(), '']} />
        <Legend wrapperStyle={{ fontSize: '12px' }} />
        <Line type="monotone" dataKey="economic_value_generated" stroke="#182959" strokeWidth={3} dot={{ r: 4 }} name="Value Generated" />
        <Line type="monotone" dataKey="economic_value_retained" stroke="#FF8042" strokeWidth={3} dot={{ r: 4 }} name="Value Retained" />
      </LineChart>
    </ModalContent>
  ),

  generatedPie: (generatedDetails) => {
    const currentYear = Math.max(...generatedDetails.map(d => d.year)) || 'Current Year';
    const pieData = generatedDetails
      .filter(item => item.year === Math.max(...generatedDetails.map(d => d.year)))
      .map(item => {
        const total = item.totalGenerated || 0;
        return [
          { name: 'Electricity Sales', value: item.electricitySales },
          { name: 'Oil Revenues', value: item.oilRevenues },
          { name: 'Other Revenues', value: item.otherRevenues },
          { name: 'Interest Income', value: item.interestIncome },
          { name: 'Share in Net Income', value: item.shareInNetIncomeOfAssociate },
          { name: 'Miscellaneous Income', value: item.miscellaneousIncome }
        ].filter(entry => entry.value > 0 && (entry.value / total) >= 0.01);
      })[0] || [];

    return (
      <ModalContent title={`Economic Value Generated ${currentYear}`}>
        <PieChart>
          <Pie
            data={pieData}
            cx="50%"
            cy="50%"
            outerRadius={140}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
            labelLine={true}
          >
            {pieData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [value.toLocaleString(), '']} />
          <Legend />
        </PieChart>
      </ModalContent>
    );
  },

  companyBar: (companyDistribution) => (
    <ModalContent title="Top 5 Companies - Economic Value Distribution">
      {(() => {
        if (!companyDistribution || companyDistribution.length === 0) {
          return (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100%',
              color: '#666',
              fontSize: '16px'
            }}>
              No data available
            </div>
          );
        }
        
        const years = companyDistribution.map(d => d.year).filter(year => year !== undefined);
        if (years.length === 0) {
          return <div>No valid years found</div>;
        }
        
        const maxYear = Math.max(...years);
        const filteredData = companyDistribution.filter(item => item.year === maxYear);
        
        if (filteredData.length === 0) {
          return <div>No data for selected year</div>;
        }
        
        const sortedData = filteredData.sort((a, b) => (b.percentage || 0) - (a.percentage || 0));
        const chartData = sortedData.slice(0, 5);
        
        return (
          <BarChart 
            data={chartData}
            margin={{ top: 20, right: 30, left: 40, bottom: 100 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="companyId" 
              tick={{ fontSize: 12 }}
              angle={0}
              textAnchor="middle"
              height={60}
              interval={0}
            />
            <YAxis 
              tick={{ fontSize: 12 }} 
              tickFormatter={(value) => `${value}%`}
              label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft', style: { fontSize: '12px' } }}
            />
            <Tooltip 
              formatter={(value, name, props) => [
                `₱ ${props.payload.totalDistributed.toLocaleString()}`, 
                'Total Distributed Value'
              ]}
              labelFormatter={(label) => {
                const fullCompany = chartData.find(item => item.companyId === label);
                return `Company: ${fullCompany ? fullCompany.companyName : label}`;
              }}
            />
            <Bar 
              dataKey="percentage" 
              name="Percentage"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || '#2B8C37'} />
              ))}
            </Bar>
          </BarChart>
        );
      })()}
    </ModalContent>
  ),

  distributionPie: (distributedDetails, pieChartData) => {
    const currentYear = Math.max(...distributedDetails.map(d => d.year)) || 'Current Year';
    return (
      <ModalContent title={`Economic Value Distribution ${currentYear}`}>
        <PieChart>
          <Pie
            data={pieChartData}
            cx="50%"
            cy="50%"
            outerRadius={140}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
            labelLine={true}
          >
            {pieChartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={DISTRIBUTION_COLORS[entry.name] || COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [value.toLocaleString(), '']} />
          <Legend />
        </PieChart>
      </ModalContent>
    );
  }
}; 