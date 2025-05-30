import { useEffect, useRef } from 'react';
import Container from '@mui/material/Container'

function Overlay({ children, onClose }) {
  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      onClick={handleBackgroundClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000
      }}
    >
      <div onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

export default Overlay;
