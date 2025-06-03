import { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar,
  Line,
  LineChart,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ResponsiveContainer,
  ComposedChart
} from 'recharts';
import Sidebar from '../../components/Sidebar'

function FundsAlloc() {
    return (
        <div style={{ 
      display: 'flex',
      flexDirection: 'row',
      minHeight: '200dvh',
      width: '100%',
      margin: 0,
      padding: 0,
      overflowX: 'hidden'
    }}>
        <Sidebar />
    </div>
    )
}

export default FundsAlloc;