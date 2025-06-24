import React from 'react';
import { format } from 'date-fns';
import { useCO2 } from '../contexts/CO2Context';

const CO2Widget = () => {
  const { totalCO2Avoided, lastUpdated } = useCO2();

  // Simple, guaranteed to work version
  return (    <div style={{
      backgroundColor: '#182959', // Website blue color
      borderRadius: '8px',
      padding: '6px 12px',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: '100px',
      width: 'auto',
      textAlign: 'center',
      marginRight: '12px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      fontSize: '11px',
      height: 'fit-content',
      whiteSpace: 'nowrap'
    }}>
      <div style={{ fontWeight: 'bold' }}>
        {totalCO2Avoided > 0 && lastUpdated 
          ? `${Math.round(totalCO2Avoided).toLocaleString()} tons of CO2 Avoided As of: ${format(new Date(lastUpdated), 'MMM dd, yyyy')}`
          : 'Loading...'
        }
      </div>
    </div>
  );
};

export default CO2Widget;
