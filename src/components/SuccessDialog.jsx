import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function SuccessDialog({ open, onClose, title, message }) {
  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: '16px',
          minWidth: '400px',
        }
      }}
    >
      <DialogTitle sx={{ 
        textAlign: 'center', 
        pt: 4,
        pb: 2,
      }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <CheckCircleIcon sx={{ 
            color: '#2B8C37', 
            fontSize: '64px'
          }} />
          <Typography variant="h5" sx={{ 
            color: '#182959',
            fontWeight: 'bold'
          }}>
            {title || 'Success!'}
          </Typography>
        </Box>
      </DialogTitle>
      
      <DialogContent sx={{ 
        textAlign: 'center',
        px: 4,
        pb: 3
      }}>
        <Typography variant="body1" sx={{ color: '#666' }}>
          {message}
        </Typography>
      </DialogContent>
      
      <DialogActions sx={{ 
        justifyContent: 'center',
        pb: 4,
        px: 4
      }}>
        <Button 
          onClick={onClose}
          variant="contained"
          sx={{
            backgroundColor: '#2B8C37',
            borderRadius: '999px',
            padding: '10px 24px',
            fontSize: '0.9rem',
            fontWeight: 'bold',
            '&:hover': {
              backgroundColor: '#256d2f',
            },
          }}
        >
          CONTINUE
        </Button>
      </DialogActions>
    </Dialog>
  );
} 