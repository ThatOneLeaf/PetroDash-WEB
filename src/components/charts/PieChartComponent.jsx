import React from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AA00FF', '#FF4081', '#4CAF50', '#F44336'];

const PieChartComponent = ({ title, data }) => (
  <>
    <h3>{title}</h3>
    <ResponsiveContainer width="100%" height={400}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={130}
          label={({ payload }) => `${payload.percent.toFixed(1)}%`} // 👈 use percent from data
        >
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, name, props) =>
            [`${value.toLocaleString()} (${props.payload.percent.toFixed(1)}%)`, name]
          }
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  </>
);

export default PieChartComponent;
