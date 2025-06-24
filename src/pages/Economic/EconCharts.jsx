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
  Tab,
  IconButton
} from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';

// Color schemes for charts
const COLORS = ['#3B82F6', '#06B6D4', '#10B981', '#8B5CF6', '#6366F1', '#0EA5E9', '#14B8A6'];

// Store label positions to prevent overlap
let usedLabelPositions = [];

// Custom label function with smart positioning, clipping prevention, and overlap avoidance
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name, index, data }) => {
  const RADIAN = Math.PI / 180;
  
  // Reset positions array for first label
  if (index === 0) {
    usedLabelPositions = [];
  }
  
  // Calculate original pie edge position for line start
  const pieEdgeRadius = outerRadius;
  const pieEdgeX = cx + pieEdgeRadius * Math.cos(-midAngle * RADIAN);
  const pieEdgeY = cy + pieEdgeRadius * Math.sin(-midAngle * RADIAN);
  
  // Calculate base position
  const baseRadius = innerRadius + (outerRadius - innerRadius) * 1.6;
  let x = cx + baseRadius * Math.cos(-midAngle * RADIAN);
  let y = cy + baseRadius * Math.sin(-midAngle * RADIAN);
  
  // Chart boundaries with margin
  const margin = 15;
  const chartWidth = cx * 2;
  const chartHeight = cy * 2;
  
  // Text processing
  const words = name.split(' ');
  const lines = [];
  const maxCharsPerLine = 11;
  
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
  
  // Limit to 2 lines
  if (lines.length > 2) {
    lines[1] = lines.slice(1).join(' ');
    lines.splice(2);
  }
  
  // Calculate text dimensions
  const charWidth = 6;
  const lineHeight = 12;
  const textWidth = Math.max(...lines.map(line => line.length)) * charWidth;
  const textHeight = lines.length * lineHeight + 12; // +12 for percentage
  
  // Store original position for comparison
  const originalX = x;
  const originalY = y;
  
  // Determine initial text anchor
  let textAnchor = x > cx ? 'start' : 'end';
  
  // Adjust for boundary clipping
  if (textAnchor === 'start' && x + textWidth > chartWidth - margin) {
    x = chartWidth - textWidth - margin;
  } else if (textAnchor === 'end' && x - textWidth < margin) {
    x = margin + textWidth;
    textAnchor = 'start';
  }
  
  // Vertical boundary adjustment
  if (y - textHeight/2 < margin) {
    y = margin + textHeight/2;
  } else if (y + textHeight/2 > chartHeight - margin) {
    y = chartHeight - margin - textHeight/2;
  }
  
  // Check for overlaps with existing labels
  const currentBounds = {
    left: textAnchor === 'end' ? x - textWidth : x,
    right: textAnchor === 'end' ? x : x + textWidth,
    top: y - textHeight/2,
    bottom: y + textHeight/2
  };
  
  // Find overlapping positions and adjust
  let attempts = 0;
  const maxAttempts = 8;
  
  while (attempts < maxAttempts) {
    let hasOverlap = false;
    
    for (const usedPos of usedLabelPositions) {
      if (!(currentBounds.right < usedPos.left || 
            currentBounds.left > usedPos.right || 
            currentBounds.bottom < usedPos.top || 
            currentBounds.top > usedPos.bottom)) {
        hasOverlap = true;
        break;
      }
    }
    
    if (!hasOverlap) break;
    
    // Adjust position to avoid overlap
    const angleStep = 15; // degrees
    const newAngle = midAngle + (attempts % 2 === 0 ? angleStep * Math.ceil(attempts/2) : -angleStep * Math.ceil(attempts/2));
    const adjustedRadius = baseRadius + (attempts * 8); // Move further out if needed
    
    x = cx + adjustedRadius * Math.cos(-newAngle * RADIAN);
    y = cy + adjustedRadius * Math.sin(-newAngle * RADIAN);
    
    // Re-apply boundary checks
    textAnchor = x > cx ? 'start' : 'end';
    
    if (textAnchor === 'start' && x + textWidth > chartWidth - margin) {
      x = chartWidth - textWidth - margin;
    } else if (textAnchor === 'end' && x - textWidth < margin) {
      x = margin + textWidth;
      textAnchor = 'start';
    }
    
    if (y - textHeight/2 < margin) {
      y = margin + textHeight/2;
    } else if (y + textHeight/2 > chartHeight - margin) {
      y = chartHeight - margin - textHeight/2;
    }
    
    // Update bounds for next check
    currentBounds.left = textAnchor === 'end' ? x - textWidth : x;
    currentBounds.right = textAnchor === 'end' ? x : x + textWidth;
    currentBounds.top = y - textHeight/2;
    currentBounds.bottom = y + textHeight/2;
    
    attempts++;
  }
  
  // Store this label's position
  usedLabelPositions.push(currentBounds);
  
  // For very small slices, use abbreviated text
  let displayLines = lines;
  let displayPercent = `${(percent * 100).toFixed(0)}%`;
  
  if (percent < 0.03) {
    // Very small slice - show only percentage
    displayLines = [name.split(' ')[0]]; // First word only
  }
  
  const percentage = `${(percent * 100).toFixed(0)}%`;
  
  // Calculate line connection point (closer to text)
  let lineEndX = x;
  let lineEndY = y;
  
  // Adjust line end point based on text anchor
  if (textAnchor === 'start') {
    lineEndX = x - 5; // Line ends slightly before text starts
  } else if (textAnchor === 'end') {
    lineEndX = x + 5; // Line ends slightly after text ends
  }
  
  // Determine if we should show a connecting line
  // Show line if position was adjusted OR if label is far from pie edge
  const distanceFromCenter = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
  const positionChanged = Math.abs(x - originalX) > 5 || Math.abs(y - originalY) > 5;
  const isFarFromPie = distanceFromCenter > outerRadius + 15;
  const shouldShowLine = positionChanged || isFarFromPie;
  
  // Get the appropriate color for this slice
  let sliceColor = '#999'; // fallback color
  
  // Try to determine color based on slice data
  if (data && data[index]) {
    // For distribution pie chart, use DISTRIBUTION_COLORS
    if (DISTRIBUTION_COLORS[name]) {
      sliceColor = DISTRIBUTION_COLORS[name];
    } else {
      // For other pie charts, use COLORS array
      sliceColor = COLORS[index % COLORS.length];
    }
  } else {
    // Fallback to COLORS array
    sliceColor = COLORS[index % COLORS.length];
  }
  
  return (
    <g>
      {/* Custom label line */}
      {shouldShowLine && (
        <line
          x1={pieEdgeX}
          y1={pieEdgeY}
          x2={lineEndX}
          y2={lineEndY}
          stroke={sliceColor}
          strokeWidth={1.5}
          opacity={0.8}
        />
      )}
      
      {/* Label text */}
      <text 
        x={x} 
        y={y} 
        fill="#1F2937" 
        textAnchor={textAnchor} 
        dominantBaseline="central"
        fontSize="9px"
        fontWeight="600"
      >
        {displayLines.map((line, lineIndex) => (
          <tspan key={lineIndex} x={x} dy={lineIndex === 0 ? -displayLines.length * 5 : 10}>
            {line}
          </tspan>
        ))}
        <tspan x={x} dy="10" fontWeight="bold" fontSize="10px">
          {percentage}
        </tspan>
      </text>
    </g>
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

// Reusable chart container with zoom icon
export const ChartContainer = ({ children, title, fileName, modalContent, chartRef, openZoomModal }) => (
  <div ref={chartRef} style={{ width: '100%' }}>
    <Paper sx={{ 
      p: 1, 
      borderRadius: 2, 
      boxShadow: 2, 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      position: 'relative'
    }}>
      {/* Zoom Icon Button */}
      <IconButton
        onClick={() => openZoomModal(title, fileName, modalContent)}
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 10,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          '&:hover': { 
            backgroundColor: 'rgba(255, 255, 255, 1)',
            boxShadow: 2
          }
        }}
        size="small"
      >
        <ZoomInIcon fontSize="small" />
      </IconButton>
      
      {children}
    </Paper>
  </div>
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
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, pr: 5 }}>
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
              outerRadius={75}
              fill="#8884d8"
              dataKey="value"
              label={renderCustomLabel}
              labelLine={false}
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
              outerRadius={75}
              fill="#8884d8"
              dataKey="value"
              label={renderCustomLabel}
              labelLine={false}
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
    <Box sx={{ width: '100%', height: '480px', padding: '10px', display: 'flex', flexDirection: 'column' }}>
      {/* Chart Tabs */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1, flexShrink: 0 }}>
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
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          {firstChartTab === 0 ? (
            <ComposedChart data={flowData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
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
            <AreaChart data={retentionData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
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
    <Box sx={{ width: '100%', height: '480px', padding: '10px', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, fontSize: '1.1rem', flexShrink: 0 }}>
        Economic Value Generated and Retained
      </Typography>
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={flowData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(value) => [value.toLocaleString(), '']} />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Line type="monotone" dataKey="economic_value_generated" stroke="#182959" strokeWidth={3} dot={{ r: 4 }} name="Value Generated" />
            <Line type="monotone" dataKey="economic_value_retained" stroke="#FF8042" strokeWidth={3} dot={{ r: 4 }} name="Value Retained" />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
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
      <Box sx={{ width: '100%', height: '480px', padding: '10px', display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, fontSize: '1.1rem', flexShrink: 0 }}>
          Economic Value Generated {currentYear}
        </Typography>
        <Box sx={{ flex: 1, minHeight: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 20, right: 30, left: 30, bottom: 80 }}>
              <Pie
                data={pieData}
                cx="50%"
                cy="45%"
                outerRadius={110}
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
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </Box>
    );
  },

  companyBar: (companyDistribution) => (
    <Box sx={{ width: '100%', height: '480px', padding: '10px', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, fontSize: '1.1rem', flexShrink: 0 }}>
        Top 5 Companies - Economic Value Distribution
      </Typography>
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
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
                margin={{ top: 20, right: 30, left: 40, bottom: 80 }}
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
        </ResponsiveContainer>
      </Box>
    </Box>
  ),

  distributionPie: (distributedDetails, pieChartData) => {
    const currentYear = Math.max(...distributedDetails.map(d => d.year)) || 'Current Year';
    return (
      <Box sx={{ width: '100%', height: '480px', padding: '10px', display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, fontSize: '1.1rem', flexShrink: 0 }}>
          Economic Value Distribution {currentYear}
        </Typography>
        <Box sx={{ flex: 1, minHeight: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 20, right: 30, left: 30, bottom: 80 }}>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="45%"
                outerRadius={110}
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
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </Box>
    );
  }
}; 