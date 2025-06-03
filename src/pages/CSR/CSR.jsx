import { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import Btn from '../../components/ButtonComp';
import { 
  Box,
  Typography
 } from '@mui/material'

function CSR() {
    return (
      <Box style={{ display: 'flex', flexDirection: 'row', height: '200dvh', width: '100%', margin: 0, padding: 0, overflowX: 'hidden' }}>
        <Box style={{}}>
          <Sidebar />
        </Box>
        <Box sx={{ width: '100%', height: 'full', display: 'flex', flexDirection: 'column', padding: '40px' }}>
          {/* Title */}
          <Typography variant="h6" sx={{  }}>Repository</Typography>
          <Typography variant="h3" sx={{ color: '#182959' }}>Social - H.E.L.P</Typography>
          
          {/* Filter and buttons */}
          <Box sx={{ display: 'flex', flexDirection: 'row-reverse' }}>
            <Btn label="ADD RECORD" color="green"></Btn>
            <Btn label="IMPORT" color="green"></Btn>
          </Box>
        </Box>
      </Box>
    )
}

export default CSR;