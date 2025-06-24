import React from 'react';

const DashboardHeader = ({ title, lastUpdated, formatDateTime }) => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '15px',
        flexShrink: 0,
      }}
    >
      <div>
        <h1
          style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#1e293b',
            margin: 0,
          }}
        >
          {title}
        </h1>

        <div
          style={{
            color: '#64748b',
            fontSize: '10px',
            fontWeight: 400,
            marginTop: '4px',
          }}
        >
          The data presented in this dashboard is accurate as of: {formatDateTime(lastUpdated)}
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
