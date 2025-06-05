// components/EnergyDetailModal.jsx
import React from 'react';
import { Modal, Box, Typography } from '@mui/material';

const EnergyDetailModal = ({ open, onClose, energyId }) => {
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper',
          boxShadow: 24,
          p: 4,
          borderRadius: 2,
          minWidth: 300,
        }}
      >
        <Typography variant="h6" gutterBottom>
          Energy Details
        </Typography>
        <Typography variant="body1">
          Energy ID: {energyId}
        </Typography>
      </Box>
    </Modal>
  );
};

export default EnergyDetailModal;
