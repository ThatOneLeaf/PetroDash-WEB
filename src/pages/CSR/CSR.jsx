import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Btn from '../../components/ButtonComp';
import { 
  Box,
  Typography
 } from '@mui/material'

function CSR() {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'row', minHeight: '100vh', width: '100%', m: 0, p: 0, overflowX: 'hidden' }}>
        <Sidebar />
        <Box sx={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', p: 5 }}>
          {/* Title */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '0.9rem', mb: 0.5 }}>Repository</Typography>
            <Typography variant="h3" sx={{ color: '#182959', fontWeight: 800, fontSize: '2.75rem' }}>Social - H.E.L.P</Typography>
          </Box>
          
          {/* Filter and buttons */}
          <Box sx={{ display: 'flex', flexDirection: 'row-reverse', gap: 2, mb: 2 }}>
            <Btn label="ADD RECORD" color="green" />
            <Btn label="IMPORT" color="green" />
          </Box>
          {/* Add content here if needed */}
        </Box>
      </Box>
    )
}

export default CSR;