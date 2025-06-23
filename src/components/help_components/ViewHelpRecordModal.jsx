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
  onSave,
}) => {
  // State for edit/view mode, record data, and loading
  const [isEditing, setIsEditing] = useState(false);
  const [fetchedRecord, setFetchedRecord] = useState(null);
  const [editedRecord, setEditedRecord] = useState(null);
  const [loading, setLoading] = useState(false);

  // Program and project options state
  const [programOptions, setProgramOptions] = useState([]);
  const [projectOptions, setProjectOptions] = useState({}); // { [programId]: [{label, value}] }

  // Readonly if status is approved
  const isReadOnly = (fetchedRecord?.statusId || '').toUpperCase() === 'APPROVED';
  console.log(isReadOnly)
  // Check if any changes were made
  const isUnchanged = JSON.stringify(fetchedRecord) === JSON.stringify(editedRecord);

  // Fetch the record details from API when modal opens or record changes
  useEffect(() => {
    if (!record?.csrId) return;
    setLoading(true);
    api.get(`help/activities-specific?csrId=${encodeURIComponent(record.csrId)}`)
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

  // Fetch program options on mount
  useEffect(() => {
    api.get('/help/programs')
      .then(res => {
        setProgramOptions(
          [{ label: "Select Program", value: "" }]
            .concat((res.data || []).map(p => ({
              label: p.programName,
              value: p.programId
            })))
        );
      })
      .catch(() => setProgramOptions([{ label: "Select Program", value: "" }]));
  }, []);

  // Fetch project options when program changes
  useEffect(() => {
    const programId = editedRecord?.programId;
    if (!programId) return;
    // Only fetch if not already loaded
    if (projectOptions[programId]) return;
    api.get('/help/projects', { params: { program_id: programId } })
      .then(res => {
        setProjectOptions(prev => ({
          ...prev,
          [programId]: [{ label: "Select Project", value: "" }]
            .concat((res.data || []).map(p => ({
              label: p.projectName,
              value: p.projectId
            })))
        }));
      })
      .catch(() => {
        setProjectOptions(prev => ({
          ...prev,
          [programId]: [{ label: "Select Project", value: "" }]
        }));
      });
  }, [editedRecord?.programId]);

  // Handle field changes in edit mode
  const handleChange = (key, value) => {
    setEditedRecord(prev => ({ ...prev, [key]: value }));
  };

  // Save changes to API
  const handleSave = async () => {
    try {
      // Only send the required fields
      const payload = {
        csr_id: editedRecord.csrId,
        project_year: Number(editedRecord.projectYear),
        project_id: editedRecord.projectId,
        csr_report: Number(editedRecord.csrReport),
        project_expenses: Number(editedRecord.projectExpenses),
        project_remarks: editedRecord.projectRemarks
      };
      await api.post('/help/activities-update', payload);
      if (onSave) onSave({ ...editedRecord, statusId: editedRecord.statusId });
      setIsEditing(false);
      setFetchedRecord({ ...editedRecord, statusId: editedRecord.statusId });
      alert("Successfully updated.")
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
      <Paper sx={{ p: 4, width: 600, borderRadius: 2, mb: 4 }}>
        <Typography>No data found for this record.</Typography>
      </Paper>
    );
  }

  // Main modal content
  return (
    <Paper sx={{ p: 4, width: 600, borderRadius: 2 }}>
      {/* Modal header */}
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mb: 1 }}>
        <Typography sx={{ fontSize: '0.85rem', fontWeight: 800 }}>
          {isEditing ? 'EDIT RECORD' : 'VIEW RECORD'}
        </Typography>
        <Typography sx={{ fontSize: '1.75rem', color: '#182959', fontWeight: 800 }}>
          {title}
        </Typography>
      </Box>
      {/* Show warning if record is approved */}
      {isReadOnly && (
        <Typography variant="caption" color="error">
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
        {console.log(editedRecord)}
        <FormControl fullWidth>
          <InputLabel>Program</InputLabel>
            <Select
              value={editedRecord.programId || ''}
              onChange={e => {
                handleChange('programId', e.target.value);
                handleChange('projectId', '');
              }}
              disabled={!isEditing || isReadOnly}
              label="Program"
            >
            {programOptions.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
        {/* Project dropdown */}
        <FormControl fullWidth>
          <InputLabel>Project</InputLabel>
            <Select
              value={editedRecord.projectId || ''}
              onChange={e => handleChange('projectId', e.target.value)}
              disabled={!isEditing || isReadOnly || !editedRecord.programId}
              label="Project"
            >
            {(projectOptions[editedRecord.programId] || [{ label: "Select Project", value: "" }]).map(opt => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </Select>
        </FormControl>
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
        <TextField
          label="Status"
          value={editedRecord.statusId || ''}
          fullWidth
          disabled
        />
      </Box>
      <TextField
          label="Project Remarks"
          value={editedRecord.projectRemarks || ''}
          onChange={e => handleChange('projectRemarks', e.target.value)}
          fullWidth
          disabled={!isEditing || isReadOnly}
          sx={{ mt: 2 }}
        />
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
      </Box>
    </Paper>
  );
};

export default ViewHelpRecordModal;
