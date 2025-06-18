import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { renderGenericLegend } from '../../utils/smallLegend';

const formatYAxis = (num, unit) => {
  let formatted;
  if (num >= 1_000_000) formatted = `${(num / 1_000_000).toFixed(1)}M`;
  else if (num >= 1_000) formatted = `${(num / 1_000).toFixed(1)}K`;
  else formatted = num.toString();

  return unit ? `${formatted} ${unit}` : formatted;
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

const BarChartComponent = ({ title, data, legendName, unit, colorMap = {} }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Title */}
      <div style={{ padding: '0 12px 4px 12px' }}>
        <h3 style={{ fontSize: '14px', margin: 0 }}>{title}</h3>
      </div>

      {/* Chart + Legend */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ flex: 1, minHeight: 0, padding: '0 12px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 20, right: 20, left: 20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => formatYAxis(value, unit)} />
              <Tooltip
                formatter={(value) => `${value.toLocaleString()}${unit ? ` ${unit}` : ''}`}
              />
              <Bar
                dataKey="value"
                name={legendName}
                barSize={data.length > 20 ? 10 : undefined}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colorMap?.[entry.name] || '#8884d8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Custom legend */}
        <div style={{ padding: '8px 12px 0 12px' }}>
          {renderGenericLegend({
            payload: [
              {
                value: legendName,
                color: '#8884d8'
              }
            ]
          })}
        </div>
      </div>
    </div>
  );
};

export default BarChartComponent;
