import React, { useState, useEffect } from 'react';
import {
  Paper,
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import api from '../../services/api';

// Modal for viewing/editing a CSR Activity record
const ViewHelpRecordModal = ({
  title,
  record,
  onClose,
  onSave, // callback after save
}) => {
  // State for edit/view mode, record data, and loading
  const [isEditing, setIsEditing] = useState(false);
  const [fetchedRecord, setFetchedRecord] = useState(null);
  const [editedRecord, setEditedRecord] = useState(null);
  const [loading, setLoading] = useState(false);

  // Readonly if status is approved
  const isReadOnly = fetchedRecord?.statusId === 'APP';
  // Check if any changes were made
  const isUnchanged = JSON.stringify(fetchedRecord) === JSON.stringify(editedRecord);

  // Fetch the record details from API when modal opens or record changes
  useEffect(() => {
    if (!record?.projectId) return;
    setLoading(true);
    api.get(`help/activities-specific?projectId=${encodeURIComponent(record.projectId)}`)
      .then(res => {
        setFetchedRecord(res.data);
        setEditedRecord(res.data);
      })
      .catch(() => {
        setFetchedRecord(null);
        setEditedRecord(null);
      })
      .finally(() => setLoading(false));
  }, [record]);

  // Handle field changes in edit mode
  const handleChange = (key, value) => {
    setEditedRecord(prev => ({ ...prev, [key]: value }));
  };

  // Save changes to API
  const handleSave = async () => {
    try {
      await api.post('/activities-specific', editedRecord);
      if (onSave) onSave(editedRecord);
      setIsEditing(false);
      setFetchedRecord(editedRecord);
    } catch (error) {
      alert('Failed to save changes.');
    }
  };

  // Loading state
  if (loading) {
    return (
      <Paper sx={{ p: 4, width: 600, borderRadius: 2 }}>
        <Typography>Loading...</Typography>
      </Paper>
    );
  }

  // No data found state
  if (!fetchedRecord) {
    return (
      <Paper sx={{ p: 4, width: 600, borderRadius: 2 }}>
        <Typography>No data found for this record.</Typography>
      </Paper>
    );
  }

  // Main modal content
  return (
    <Paper sx={{ p: 4, width: 600, borderRadius: 2 }}>
      {/* Modal header */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mb: 3 }}>
        <Typography sx={{ fontSize: '0.85rem', fontWeight: 800 }}>
          {isEditing ? 'EDIT RECORD' : 'VIEW RECORD'}
        </Typography>
        <Typography sx={{ fontSize: '1.75rem', color: '#182959', fontWeight: 800 }}>
          {title}
        </Typography>
      </Box>
      {/* Show warning if record is approved */}
      {isReadOnly && (
        <Typography variant="caption" color="error" sx={{ mb: 2 }}>
          This record has been approved and cannot be edited.
        </Typography>
      )}
      {/* Record fields */}
      <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
        <TextField
          label="Year"
          value={editedRecord.projectYear || ''}
          onChange={e => handleChange('projectYear', e.target.value)}
          fullWidth
          disabled={!isEditing || isReadOnly}
        />
        <TextField
          label="Company"
          value={editedRecord.companyName || ''}
          onChange={e => handleChange('companyName', e.target.value)}
          fullWidth
          disabled={!isEditing || isReadOnly}
        />
        <TextField
          label="Program"
          value={editedRecord.programName || ''}
          onChange={e => handleChange('programName', e.target.value)}
          fullWidth
          disabled={!isEditing || isReadOnly}
        />
        <TextField
          label="Project"
          value={editedRecord.projectName || ''}
          onChange={e => handleChange('projectName', e.target.value)}
          fullWidth
          disabled={!isEditing || isReadOnly}
        />
        <TextField
          label="Beneficiaries"
          type="number"
          value={editedRecord.csrReport || ''}
          onChange={e => handleChange('csrReport', e.target.value)}
          fullWidth
          disabled={!isEditing || isReadOnly}
        />
        <TextField
          label="Investments (₱)"
          type="number"
          value={editedRecord.projectExpenses || ''}
          onChange={e => handleChange('projectExpenses', e.target.value)}
          fullWidth
          disabled={!isEditing || isReadOnly}
        />
        <FormControl fullWidth>
          <InputLabel>Status</InputLabel>
          <Select
            value={editedRecord.statusId || ''}
            onChange={e => handleChange('statusId', e.target.value)}
            disabled={!isEditing || isReadOnly}
            label="Status"
          >
            <MenuItem value="APP">APPROVED</MenuItem>
            <MenuItem value="PEN">PENDING</MenuItem>
            <MenuItem value="REJ">REJECTED</MenuItem>
            {/* Add more status options as needed */}
          </Select>
        </FormControl>
      </Box>
      {/* Action buttons */}
      <Box display="flex" justifyContent="space-between" mt={4}>
        <Button
          startIcon={isEditing ? <SaveIcon /> : <EditIcon />}
          onClick={() => {
            if (isReadOnly) return;
            if (isEditing) {
              if (!isUnchanged) {
                handleSave();
              } else {
                alert('No changes made.');
                setIsEditing(false);
              }
            } else {
              setIsEditing(true);
            }
          }}
          disabled={isReadOnly}
        >
          {isEditing ? 'Save' : 'Edit'}
        </Button>
        <Button
          variant="contained"
          color="success"
          onClick={() => {
            if (isEditing && !isUnchanged) {
              const confirmClose = window.confirm('You have unsaved changes. Close anyway?');
              if (!confirmClose) return;
            }
            onClose();
          }}
        >
          Close
        </Button>
      </Box>
    </Paper>
  );
};

export default ViewHelpRecordModal;
