import React from 'react';

const TabButtons = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div
      style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '15px',
        flexShrink: 0,
      }}
    >
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          style={{
            padding: '8px 16px',
            backgroundColor: activeTab === tab.key ? '#10B981' : '#9CA3AF',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            minWidth: '80px',
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default TabButtons;
