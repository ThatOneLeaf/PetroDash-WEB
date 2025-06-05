import { Paper, Box, Typography, Button, TextField } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { useState } from 'react';

const ViewRecordModal = ({ title, record, onClose, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedRecord, setEditedRecord] = useState(record || {});

  if (!record) return null;

  const handleChange = (key, value) => {
    setEditedRecord(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    // You can send `editedRecord` to your backend
    onSave(editedRecord); // parent should handle API call
    setIsEditing(false);
  };

  return (
    <Paper sx={{
        p: 4,
        width: "600px",
        borderRadius: "16px",
        bgcolor: "white",
    }}>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          mb: 3}}>
          <Typography sx={{ 
            fontSize: '0.85rem', 
            fontWeight: 800,
          }}>
            {isEditing ? 'EDIT RECORD' : 'VIEW RECORD'}
          </Typography>
          <Typography sx={{ fontSize: '1.75rem', color: '#182959', fontWeight: 800}}>
            {title}
          </Typography>
        </Box>

        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr',
          gap: 1,
          mb: 2
        }}>
          {Object.entries(editedRecord).map(([key, value]) => (
            <Box key={key} sx={{ marginBottom: '0.5rem' }}>
              <TextField
                label={key}
                variant="outlined"
                fullWidth
                value={value ?? ''}
                onChange={(e) => handleChange(key, e.target.value)}
                InputProps={{
                  readOnly: !isEditing,
                  sx: {
                    color: isEditing ? 'black' : '#182959', // input text color
                  },
                }}
                InputLabelProps={{
                  sx: {
                    color: isEditing ? '#182959' : 'grey', // label color (optional)
                  },
                }}
              />
            </Box>
          ))}
        </Box>
        
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          mt: 3
        }}>
          <Button
            startIcon={isEditing ? <SaveIcon /> : <EditIcon />}
            sx={{ 
              color: isEditing ? '#1976d2' : '#FFA000',
              borderRadius: '999px',
              padding: '9px 18px',
              fontSize: '1rem',
              fontWeight: 'bold',
              '&:hover': {
                color: isEditing ? '#1565c0' : '#FB8C00',
              },
            }}
            onClick={() => {
              if (isEditing) {
                handleSave();
              } else {
                setIsEditing(true);
              }
            }}
          >
            {isEditing ? 'SAVE' : 'EDIT'}
          </Button>

          <Button
            variant="contained"
            sx={{ 
              backgroundColor: '#2B8C37',
              borderRadius: '999px',
              padding: '9px 18px',
              fontSize: '1rem',
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: '#256d2f',
              },
            }}
            onClick={onClose}
          >
            CLOSE
          </Button>
        </Box>
    </Paper>
  );
};

export default ViewRecordModal;
