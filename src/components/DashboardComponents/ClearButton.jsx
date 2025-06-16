import React from 'react';
import Button from '@mui/material/Button';
import ClearIcon from '@mui/icons-material/Clear';

const ClearButton = ({ onClick }) => (
  <Button
    onClick={onClick}
    variant="contained"
    startIcon={<ClearIcon />}
    sx={{
      backgroundColor: '#ef4444',
      color: '#fff',
      borderRadius: '20px',
      fontSize: '11px',
      fontWeight: 600,
      textTransform: 'none',
      padding: '6px 12px',
      '&:hover': {
        backgroundColor: '#dc2626',
      },
    }}
  >
    Clear All
  </Button>
);

export default ClearButton;
