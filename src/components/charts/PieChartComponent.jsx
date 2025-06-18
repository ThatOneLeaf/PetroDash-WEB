import React from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { renderGenericLegend } from '../../utils/smallLegend';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AA00FF', '#FF4081', '#4CAF50', '#F44336'];

// Custom label positioned slightly inside the arc
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.8;
  const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
  const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

  return (
    <text
      x={x}
      y={y}
      fill="#fff"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={11}
      fontWeight={'bold'}
    >
      {(percent).toFixed(1)}%
    </text>
  );
};

const PieChartComponent = ({ title, data, colorMap = {} }) => {
  // Sort data by value (ascending) so small segments are grouped
  const sortedData = [...data].sort((a, b) => a.value - b.value);

  return (
    <>
      {/* Title */}
      <div style={{ padding: '0', marginBottom: 4 }}>
        <h3 style={{ fontSize: '14px' }}>{title}</h3>
      </div>

      <div style={{ width: '100%', height: '100%', marginTop: 5 }}>
        <ResponsiveContainer width="100%" height="95%">
          <PieChart>
            <Pie
              data={sortedData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius="100%"
              labelLine={false}
              label={renderCustomLabel}
            >
              {sortedData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colorMap?.[entry.name] || COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name, props) =>
                [`${value.toLocaleString()} (${(props.payload.percent).toFixed(1)}%)`, name]
              }
            />
            <Legend content={renderGenericLegend()} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </>
  );
};

export default PieChartComponent;
