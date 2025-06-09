import { Paper, Box, Typography, Button, TextField, MenuItem, Select } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { useState } from 'react';

// Only show these keys (same as table columns)
const DISPLAY_KEYS = [
  'projectYear',
  'companyId',
  'programName',
  'projectName',
  'csrReport',
  'projectExpenses',
  'statusId'
];

const LABELS = {
  projectYear: 'Year',
  companyId: 'Company',
  programName: 'Program',
  projectName: 'Project',
  csrReport: 'Beneficiaries',
  projectExpenses: 'Investments (₱)',
  statusId: 'Status'
};

const FIELD_TYPES = {
  projectYear: 'select',
  companyId: 'select',
  programName: 'select',
  projectName: 'select',
  statusId: 'select',
  csrReport: 'number',
  projectExpenses: 'number'
};

const ViewRecordModal = ({
  title,
  record,
  onClose,
  onSave,
  yearOptions = [],
  companyOptions = [],
  programOptions = [],
  projectOptions = {},
  statusOptions = []
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedRecord, setEditedRecord] = useState(record || {});

  if (!record) return null;

  // Get options for each field
  const getOptions = (key) => {
    switch (key) {
      case 'projectYear':
        return yearOptions;
      case 'companyId':
        return companyOptions;
      case 'programName':
        return programOptions;
      case 'projectName':
        // Only show projects for selected program
        return projectOptions[editedRecord.programName] || [];
      case 'statusId':
        return statusOptions;
      default:
        return [];
    }
  };

  const handleChange = (key, value) => {
    setEditedRecord(prev => ({
      ...prev,
      [key]: value,
      ...(key === 'programName' ? { projectName: '' } : {})
    }));
  };

  const handleSave = () => {
    onSave(editedRecord);
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
          {DISPLAY_KEYS.map((key) => {
            const type = FIELD_TYPES[key] || 'text';
            const options = getOptions(key);
            const value = editedRecord[key] ?? '';
            if (isEditing && type === 'select') {
              return (
                <Box key={key} sx={{ marginBottom: '0.5rem' }}>
                  <Select
                    label={LABELS[key] || key}
                    value={value}
                    onChange={e => handleChange(key, e.target.value)}
                    fullWidth
                    displayEmpty
                    variant="outlined"
                    sx={{ background: 'white' }}
                  >
                    <MenuItem value="">
                      <em>Select {LABELS[key] || key}</em>
                    </MenuItem>
                    {options.map(opt =>
                      <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                    )}
                  </Select>
                </Box>
              );
            }
            return (
              <Box key={key} sx={{ marginBottom: '0.5rem' }}>
                <TextField
                  label={LABELS[key] || key}
                  variant="outlined"
                  fullWidth
                  value={value}
                  onChange={e => handleChange(key, e.target.value)}
                  InputProps={{
                    readOnly: !isEditing,
                    type: type === 'number' ? 'number' : 'text',
                    sx: {
                      color: isEditing ? 'black' : '#182959',
                    },
                  }}
                  InputLabelProps={{
                    sx: {
                      color: isEditing ? '#182959' : 'grey',
                    },
                  }}
                />
              </Box>
            );
          })}
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
