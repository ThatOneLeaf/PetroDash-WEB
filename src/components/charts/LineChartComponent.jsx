import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label
} from 'recharts';

// Format Y-axis like 1.5K, 2M
const formatYAxis = (num, unit) => {
  let formatted;
  if (num >= 1_000_000) formatted = `${(num / 1_000_000).toFixed(1)}M`;
  else if (num >= 1_000) formatted = `${(num / 1_000).toFixed(1)}K`;
  else formatted = num.toString();

  return unit ? `${formatted} ${unit}` : formatted;
};

const LineChartComponent = ({
  title,
  data,
  unit,
  legendMap = {},
  xAxisLabel = 'Period',
  yAxisLabel = 'Value',
}) => {
  const periods = [...new Set(data.flatMap(item => item.data.map(d => d.x)))];

  const formattedData = periods.map(period => {
    const entry = { name: period };
    data.forEach(source => {
      const match = source.data.find(d => d.x === period);
      entry[source.name] = match ? match.y : 0;
    });
    return entry;
  });

  return (
    <>
      <h3 style={{ fontSize: '14px', marginBottom: '10px' }}>{title}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
        data={formattedData}
        margin={{ top: 20, right: 10, left: 30, bottom: 60 }} // enough space for Y label
      >
        <CartesianGrid strokeDasharray="3 3" />

        <XAxis dataKey="name">
          <Label value={xAxisLabel} offset={-20} position="insideBottom" />
        </XAxis>

        <YAxis tickFormatter={(value) => formatYAxis(value)}>
          <Label
            value={yAxisLabel}
            angle={-90}
            position="insideLeft"
            offset={-10}
            dy={20}
            style={{ textAnchor: 'middle' }}
          />
        </YAxis>


          <Tooltip
            formatter={(value, name) => [
              `${value.toLocaleString()}${unit ? ` ${unit}` : ''}`,
              legendMap[name] || name
            ]}
          />

          <Legend
            verticalAlign="bottom"
            height={2}
            wrapperStyle={{
              marginTop: 20, // optional fine-tuning
              textAlign: 'center',
            }}
          />

          {data.map((source, idx) => (
            <Line
              key={source.name}
              type="monotone"
              dataKey={source.name}
              name={legendMap[source.name] || source.name}
              stroke={`hsl(${(idx * 40) % 360}, 70%, 50%)`}
              strokeWidth={2}
              dot={{ r: 2 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </>
  );
};

export default LineChartComponent;
