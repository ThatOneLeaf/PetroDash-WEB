import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { renderGenericLegend } from '../../utils/smallLegend';

const CustomTooltip = ({ active, payload, label, unit }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div style={{
      background: 'white',
      border: '1px solid #ccc',
      padding: 10,
      fontSize: 12,
    }}>
      <p style={{ marginBottom: 4, fontWeight: 'bold' }}>{formatPeriod(label)}</p>
      {payload.map((entry, index) => (
        <p key={`item-${index}`} style={{ color: entry.color, margin: 0 }}>
          {entry.name}: {Number(entry.value).toLocaleString()} {unit}
        </p>
      ))}
    </div>
  );
};

const formatYAxis = (num, unit) => {
  if (unit === 'kWh' && num >= 1_000_000) {
    num = num / 1_000_000;
  } else if (unit === 'kWh' && num >= 1_000) {
    num = num / 1_000;
  }

  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return `${num.toFixed(1)}`;
};

const formatPeriod = (period) => {
  if (/^\d{4}-Q[1-4]$/.test(period)) {
    const [year, quarter] = period.split('-');
    return `${quarter} ${year}`;
  }

  if (/^\d{4}-\d{2}$/.test(period)) {
    const [year, month] = period.split('-');
    const date = new Date(`${year}-${month}-01`);
    const monthName = date.toLocaleString('default', { month: 'short' });
    return `${monthName} ${year}`;
  }

  return period;
};

const defaultColors = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff8042',
  '#a4de6c', '#d0ed57', '#8dd1e1', '#d888d8'
];

const HorizontalGroupedBarChartComponent = ({
  title,
  data,
  unit,
  yAxisLabel,
  colorMap = {},
}) => {
  if (!data || data.length === 0) return <p>No data available</p>;

  const keys = Object.keys(data[0]).filter(k => k !== 'period');

  const maxValue = Math.max(...data.flatMap(d =>
    keys.map(key => d[key] ?? 0)
  ));

  const autoUnit =
    unit === 'kWh' && maxValue >= 1_000_000 ? 'GWh' :
    unit === 'kWh' && maxValue >= 1_000 ? 'MWh' :
    unit === 'kWh'? 'kWh': yAxisLabel;

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {title && (
        <div style={{ padding: '0' }}>
          <h3 style={{ fontSize: '14px', margin: 0 }}>{title}</h3>
        </div>
      )}
      <div style={{ flex: 1, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="horizontal"
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            barCategoryGap="20%"
            barGap={4}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="period"
              type="category"
              tickFormatter={formatPeriod}
            />
            <YAxis
              type="number"
              tickFormatter={(value) => formatYAxis(value, unit)}
              label={{
                  value: unit ? autoUnit : yAxisLabel,
                  position: 'insideLeft',
                  offset: 0,
                  angle: -90,
                  style: { textAnchor: 'middle' }
                }}
            />
            <Tooltip content={<CustomTooltip unit={autoUnit} />} />
            <Legend content={renderGenericLegend()} />
            {keys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={colorMap[key] || defaultColors[index % defaultColors.length]}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HorizontalGroupedBarChartComponent;
