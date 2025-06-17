import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

// Format Y-axis with shorthand + optional unit
const formatYAxis = (num, unit) => {
  let formatted;
  if (num >= 1_000_000) formatted = `${(num / 1_000_000).toFixed(1)}M`;
  else if (num >= 1_000) formatted = `${(num / 1_000).toFixed(1)}K`;
  else formatted = num.toString();

  return unit ? `${formatted} ${unit}` : formatted;
};

const BarChartComponent = ({ title, data, legendName, unit }) => (
  <>
    <h3 style={{ fontSize: '14px', marginBottom: '10px' }}>{title}</h3>
    <ResponsiveContainer width="100%" height="95%">
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis tickFormatter={(value) => formatYAxis(value)} />
        <Tooltip formatter={(value) => `${value.toLocaleString()}${unit ? ` ${unit}` : ''}`} />
        <Legend />
        <Bar dataKey="value" name={legendName} fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
  </>
);

export default BarChartComponent;
