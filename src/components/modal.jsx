import { useEffect, useRef } from 'react';
import Container from '@mui/material/Container'

function Overlay({ children, onClose }) {
  const overlayRef = useRef();

  const handleClickOutside = (event) => {
    if (overlayRef.current && !overlayRef.current.contains(event.target)) {
      onClose();
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <Container sx={{
        position: "fixed",
        top: '0px',
        left: '0px',
        width: "100vw",
        height: "100vh",
        bgcolor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 50,
        p: 0,
        m: 0
    }}
    disableGutters
    maxWidth={false}
    maxHeight={false}
    >
      <Container sx={{
        m: 'auto',
        bgcolor: '#FFFFFF',
        borderRadius: '8px',
        p: '6px',
        position: 'relative',
        overflow: 'auto'
      }}
      disableGutters
      maxWidth={false}
      maxHeight={false}>
        {children}
      </Container>
    </Container>
  );
}

export default Overlay;
