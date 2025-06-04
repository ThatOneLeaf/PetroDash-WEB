import React from 'react';
import { Box, Typography } from '@mui/material';

const RepositoryHeader = ({ label, title }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
      }}
    >
      <Typography
        sx={{
          fontSize: '0.75rem',
          fontWeight: 800,
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontSize: '2.25rem',
          color: '#182959',
          fontWeight: 800,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {title}
      </Typography>
    </Box>
  );
};

export default RepositoryHeader;
