import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const LineChartComponent = ({ title, data }) => {
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
      <h3>{title}</h3>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={formattedData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis tickFormatter={(v) => v.toLocaleString()} />
          <Tooltip formatter={(value) => value.toLocaleString()} />
          <Legend />
          {data.map((source, idx) => (
            <Line
              key={source.name}
              type="monotone"
              dataKey={source.name}
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
