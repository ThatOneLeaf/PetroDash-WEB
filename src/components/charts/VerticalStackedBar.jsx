import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { renderGenericLegend } from '../../utils/smallLegend';

const formatTooltipValue = (value, unit) => {
  const formatted = Number(value).toLocaleString();
  const normalizedUnit = (unit || '').toLowerCase();
  if (normalizedUnit === 'pesos') return `₱${formatted}`;
  return `${formatted} ${unit || ''}`.trim();
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

const CustomTooltip = ({ active, payload, label, unit }) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div style={{
      background: 'white',
      border: '1px solid #ccc',
      padding: 10,
      fontSize: 12,
      position: 'relative',
      top: '-30px',
    }}>
      <p style={{ marginBottom: 4, fontWeight: 'bold' }}>{formatPeriod(label)}</p>
      {payload.map((entry, index) => (
        <p key={`item-${index}`} style={{ color: entry.color, margin: 0 }}>
          {entry.name}: {formatTooltipValue(entry.value, unit)}
        </p>
      ))}
    </div>
  );
};

const formatXAxis = (num, unit) => {
  unit = unit || '';
  if (unit === 'kWh' && num >= 1_000_000) {
    num = num / 1_000_000;
  } else if (unit === 'kWh' && num >= 1_000) {
    num = num / 1_000;
  }

  const formatted =
    num >= 1_000_000 ? `${(num / 1_000_000).toFixed(1)}M` :
    num >= 1_000 ? `${(num / 1_000).toFixed(1)}K` :
    `${num.toFixed(1)}`;

  if (unit.toLowerCase() === 'pesos') {
    return `₱${formatted}`;
  }

  return formatted;
};

const renderCustomYAxisTick = ({ x, y, payload }) => {
  const rawValue = payload.value;
  const value = /^\d{4}-/.test(rawValue) ? formatPeriod(rawValue) : rawValue;
  const words = value.match(/.{1,15}/g) || [];

  return (
    <g transform={`translate(${x},${y})`}>
      <text x={0} y={0} dy={4} textAnchor="end" fill="#666" style={{ fontSize: 12 }}>
        {words.map((line, i) => (
          <tspan key={i} x={0} dy={i === 0 ? 0 : 12}>{line}</tspan>
        ))}
      </text>
    </g>
  );
};

const renderSmartBarLabel = (props) => {
  const {
    x, y, width, height, value, unit, fill, name, index, payload
  } = props;

  // ❌ Skip if value is zero or invalid
  if (!value || value === 0) return null;

  // ❌ Skip if payload isn't valid
  if (!payload || typeof payload !== 'object') return null;

  // ✅ Check if this is the only non-zero bar in the stack
  const keys = Object.keys(payload).filter(k =>
    k !== 'period' && typeof payload[k] === 'number'
  );

  const otherKeys = keys.filter(k => k !== name);
  const othersHaveData = otherKeys.some(k => payload[k] && payload[k] !== 0);

  if (othersHaveData) return null;

  // ✅ Format and position
  const padding = 4;
  const fontSize = 11;

  const formattedValue = formatTooltipValue(value, unit);
  const labelText = `${name}: ${formattedValue}`;

  const estimatedTextWidth = labelText.length * fontSize * 0.6;
  const isInside = width > estimatedTextWidth + padding * 2;

  const labelX = isInside ? x + width - padding : x + width + padding;
  const labelY = y + height / 2 + (isInside ? 0 : (index % 2 === 0 ? -6 : 6));

  return (
    <text
      x={labelX}
      y={labelY}
      textAnchor={isInside ? 'end' : 'start'}
      dominantBaseline="middle"
      fill={fill || '#000'}
      fontSize={fontSize}
    >
      {labelText}
    </text>
  );
};


const defaultColors = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff8042',
  '#a4de6c', '#d0ed57', '#8dd1e1', '#d888d8'
];

const VerticalStackedBarChartComponent = ({
  title,
  data,
  unit,
  colorMap = {},
  stackId = 'a',
  yAxisLabel,
  yAxisKey = 'period',
  zoom = false,
}) => {
  if (!data || data.length === 0) return <p>No data available</p>;
  unit = unit || '';

  const keys = Object.keys(data[0]).filter(k => k !== yAxisKey);

  const maxValue = Math.max(...data.flatMap(d =>
    keys.map(key => d[key] ?? 0)
  ));

  const autoUnit =
    unit === 'kWh' && maxValue >= 1_000_000 ? 'GWh' :
    unit === 'kWh' && maxValue >= 1_000 ? 'MWh' :
    unit === 'kWh' ? 'kWh' :
    yAxisLabel;

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
            layout="vertical"
            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              tickFormatter={(value) => formatXAxis(value, unit)}
              label={{
                value: autoUnit,
                position: 'middle',
                offset: -25,
                angle: 0,
                dy: 10,
                style: { textAnchor: 'middle', fontSize: 12 }
              }}
            />
            <YAxis
              type="category"
              dataKey={yAxisKey}
              tick={renderCustomYAxisTick}
              width={120}
            />
            <Tooltip content={<CustomTooltip unit={unit} />} />
            <Legend content={renderGenericLegend()} />
            {keys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                stackId={stackId}
                fill={colorMap[key] || defaultColors[index % defaultColors.length]}
                label={zoom ? (props => renderSmartBarLabel({ ...props, unit, name: key })) : false}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default VerticalStackedBarChartComponent;
