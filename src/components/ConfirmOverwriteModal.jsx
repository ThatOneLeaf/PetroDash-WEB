import { 
  Paper, 
  Typography, 
  Button,
  Box,
  Alert
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';

function ConfirmOverwriteModal({ 
  isOpen, 
  onConfirm, 
  onCancel, 
  recordType, 
  recordDetails,
  title = "Record Already Exists"
}) {
  if (!isOpen) return null;

  return (
    <Paper sx={{
      p: 4,
      width: '500px',
      borderRadius: '16px',
      bgcolor: 'white',
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 9999,
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
    }}>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        mb: 2,
        color: '#f57c00'
      }}>
        <WarningIcon sx={{ fontSize: '2rem', mr: 1 }} />
        <Typography variant="h5" sx={{ 
          color: '#f57c00',
          fontWeight: 'bold' 
        }}>
          {title}
        </Typography>
      </Box>

      <Alert severity="warning" sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: '1rem' }}>
          A {recordType} record already exists for <strong>{recordDetails}</strong>.
        </Typography>
      </Alert>

      <Typography sx={{ 
        fontSize: '1rem', 
        color: '#666',
        mb: 3,
        lineHeight: 1.5
      }}>
        Proceeding will <strong>overwrite</strong> the existing record with the new data. 
        This action cannot be undone.
      </Typography>

      <Typography sx={{ 
        fontSize: '0.95rem', 
        color: '#333',
        mb: 3,
        fontWeight: 500
      }}>
        Do you want to continue and overwrite the existing record?
      </Typography>

      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'flex-end',
        gap: 2
      }}>
        <Button
          variant="outlined"
          onClick={onCancel}
          sx={{ 
            color: '#666',
            borderColor: '#666',
            borderRadius: '999px',
            padding: '9px 18px',
            fontSize: '0.85rem',
            fontWeight: 'bold',
            '&:hover': { 
              borderColor: '#333',
              color: '#333'
            }
          }}
        >
          CANCEL
        </Button>
        <Button
          variant="contained"
          onClick={onConfirm}
          sx={{ 
            bgcolor: '#f57c00',
            borderRadius: '999px',
            padding: '9px 18px',
            fontSize: '0.85rem',
            fontWeight: 'bold',
            '&:hover': { 
              bgcolor: '#ef6c00'
            }
          }}
        >
          OVERWRITE
        </Button>
      </Box>
    </Paper>
  );
}

export default ConfirmOverwriteModal; 