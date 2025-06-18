import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const formatYAxis = (num, unit) => {
  let formatted;
  if (num >= 1_000_000) formatted = `${(num / 1_000_000).toFixed(1)}M`;
  else if (num >= 1_000) formatted = `${(num / 1_000).toFixed(1)}K`;
  else formatted = num.toString();

  return unit ? `${formatted} ${unit}` : formatted;
};

const defaultColors = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff8042',
  '#a4de6c', '#d0ed57', '#8dd1e1', '#d888d8'
];

const StackedBarChartComponent = ({
  title,
  data,
  unit,
  colors = {},
  stackId = 'a',
}) => {
  if (!data || data.length === 0) return <p>No data available</p>;

  const keys = Object.keys(data[0]).filter(k => k !== 'period');

  return (
    <div style={{ width: '100%', height: '100%', paddingTop: title ? 24 : 0 }}>
      {title && <h3 style={{ fontSize: '14px', marginBottom: '4px' }}>{title}</h3>}
      <div style={{ width: '100%', height: 'calc(100% - 32px)' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis tickFormatter={(value) => formatYAxis(value, unit)} />
            <Tooltip
              formatter={(value, name) =>
                [`${Number(value).toLocaleString()}${unit ? ` ${unit}` : ''}`, name]
              }
            />
            <Legend />
            {keys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                stackId={stackId}
                fill={colors[key] || defaultColors[index % defaultColors.length]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StackedBarChartComponent;
