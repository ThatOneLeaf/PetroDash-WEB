import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label,
  Legend
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
      position: 'relative',
      top: '-30px',
    }}>
      <p style={{ marginBottom: 4, fontWeight: 'bold' }}>{formatPeriod(label)}</p>
      {payload.map((entry, index) => (
        <p key={`item-${index}`} style={{ color: entry.color, margin: 0 }}>
          {entry.name}: {Number(entry.value * (unit === 'kWh' ? 1000 : 1)).toLocaleString()} {unit}
        </p>
      ))}
    </div>
  );
};




const formatYAxis = (num, unit) => {
  if (unit === 'kWh' && num >= 1_000_000) {
    num = num / 1_000_000; // Convert to GWh
    unit = 'GWh';
  } else if (unit === 'kWh' && num >= 1_000) {
    num = num / 1_000; // Convert to MWh
    unit = 'MWh';
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

  return period; // fallback
};


const LineChartComponent = ({
  title,
  data,
  unit,
  legendMap = {},
  yAxisLabel,
  colorMap = {} // ✅ Accept colorMap as a prop
}) => {
  const periods = [...new Set(
  data.flatMap(item => item.data.map(d => d.x))
)].sort((a, b) => new Date(a) - new Date(b));


  const formattedData = periods.map(period => {
    const entry = { name: period };
    data.forEach(source => {
      const match = source.data.find(d => d.x === period);
      let value = match ? match.y : 0;
      if (unit === 'kWh') value = value / 1000; // Convert to MWh
      entry[source.name] = value;
    });
    return entry;
  });

  // Get max value from data to determine proper Y-axis unit
const maxValue = Math.max(...data.flatMap(source => source.data.map(d => d.y || 0)));

  const autoUnit =
    unit === 'kWh' && maxValue >= 1_000_000 ? 'GWh' :
    unit === 'kWh' && maxValue >= 1_000 ? 'MWh' :
    unit === 'kWh'? 'kWh': yAxisLabel;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      <div style={{ padding: '0' }}>
        <h3 style={{ fontSize: '14px', margin: 0 }}>{title}</h3>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, width: '100%' }}>
        <div style={{ flex: 1, minHeight: 0, padding: '0 8px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">            <LineChart
              data={formattedData}
              margin={{ top: 15, right: 40, left: 30, bottom: 15 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tickFormatter={formatPeriod}>
              </XAxis>
              <YAxis
                tickFormatter={(num) => formatYAxis(num, unit)}
                label={{
                  value: unit ? autoUnit : yAxisLabel,
                  position: 'insideLeft',
                  offset: 0,
                  angle: -90,
                  style: { textAnchor: 'middle' }
                }}
              />

              <Tooltip content={<CustomTooltip unit={unit} />} />
              <Legend content={renderGenericLegend()} />
              {data.map((source, idx) => (
                <Line
                  key={source.name}
                  type="linear"
                  dataKey={source.name}
                  name={legendMap[source.name] || source.name}
                  stroke={colorMap[source.name] || `hsl(${(idx * 40) % 360}, 70%, 50%)`} // ✅ Use colorMap if available
                  strokeWidth={2}
                  dot={{ r: 2 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default LineChartComponent;
