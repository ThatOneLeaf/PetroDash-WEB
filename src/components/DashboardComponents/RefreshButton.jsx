import React from 'react';

const RefreshButton = ({ onClick }) => {
  const baseStyle = {
    backgroundColor: '#3B82F6',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
    transition: 'background-color 0.2s ease',
  };

  const handleMouseOver = (e) => {
    e.target.style.backgroundColor = '#2563EB';
  };

  const handleMouseOut = (e) => {
    e.target.style.backgroundColor = '#3B82F6';
  };

  return (
    <button
      onClick={onClick}
      style={baseStyle}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
    >
      🔄 REFRESH
    </button>
  );
};

export default RefreshButton;
