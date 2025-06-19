import React from 'react';
import RefreshIcon from '@mui/icons-material/Refresh'; // make sure MUI is installed

const RefreshButton = ({ onClick }) => {
  const baseStyle = {
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '700',
    transition: 'background-color 0.2s ease',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
  };

  const handleMouseOver = (e) => {
    e.target.style.backgroundColor = '#115293';
  };

  const handleMouseOut = (e) => {
    e.target.style.backgroundColor = '#1976d2';
  };

  return (
    <button
      onClick={onClick}
      style={baseStyle}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
    >
      <RefreshIcon style={{ fontSize: '16px' }} />
      Refresh
    </button>
  );
};

export default RefreshButton;
