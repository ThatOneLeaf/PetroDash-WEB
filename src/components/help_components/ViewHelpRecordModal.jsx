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
import StatusChip from '../../components/StatusChip';

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

  // Company, Program and Project options state
  const [companyOptions, setCompanyOptions] = useState([]);
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

  useEffect(() => {
    api.get('/reference/companies')
      .then(res => {
        setCompanyOptions(
          [{ label: "Select Company", value: "" }]
            .concat((res.data || []).map(p => ({
              label: p.name,
              value: p.id
            })))
        );
      })
      .catch(() => setCompanyOptions([{ label: "Select Company", value: "" }]));
  }, []);

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

  // Add field error state
  const [fieldErrors, setFieldErrors] = useState({});

  // Save changes to API
  const handleSave = async () => {
    // Validate required fields
    const errors = {};
    if (!editedRecord.projectYear) errors.projectYear = "Please fill out this field";
    if (!editedRecord.companyId) errors.companyId = "Please fill out this field";
    if (!editedRecord.programId) errors.programId = "Please fill out this field";
    if (!editedRecord.projectId) errors.projectId = "Please fill out this field";
    if (!editedRecord.csrReport) errors.csrReport = "Please fill out this field";
    if (!editedRecord.projectExpenses) errors.projectExpenses = "Please fill out this field";
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      alert("Please fill out all required fields.");
      return;
    }

    try {
      // Only send the required fields
      const payload = {
        csr_id: editedRecord.csrId,
        company_id: editedRecord.companyId,
        project_year: Number(editedRecord.projectYear),
        project_id: editedRecord.projectId,
        csr_report: Number(editedRecord.csrReport),
        project_expenses: Number(editedRecord.projectExpenses),
        project_remarks: editedRecord.projectRemarks
      };
      const response = await api.post('/help/activities-update', payload);

      const message = response.data.message

      if (response.data.success) {
          if (onSave) onSave({ ...editedRecord, statusId: editedRecord.statusId });
        setIsEditing(false);
        setFetchedRecord({ ...editedRecord, statusId: editedRecord.statusId });
        alert("Successfully updated.")
      }
      else {
        alert(message)
      }
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

  // Add this custom close handler
  const handleClose = () => {
    if (isEditing && JSON.stringify(fetchedRecord) !== JSON.stringify(editedRecord)) {
      if (window.confirm("You have unsaved changes. Discard them?")) {
        setIsEditing(false);
        setEditedRecord(fetchedRecord); // reset changes
        onClose();
      }
      // If user cancels, do nothing (stay open)
    } else {
      setIsEditing(false);
      setEditedRecord(fetchedRecord); // always reset edit state
      onClose();
    }
  };

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
          type="text"
          inputProps={{
            maxLength: 4,
            inputMode: 'numeric',
            pattern: '[0-9]*'
          }}
          value={editedRecord.projectYear || ''}
          onChange={e => {
            // Only allow up to 4 digits, no letters
            const val = e.target.value.replace(/\D/g, '').slice(0, 4);
            handleChange('projectYear', val);
            setFieldErrors(prev => ({ ...prev, projectYear: undefined }));
          }}
          fullWidth
          required
          placeholder="Year"
          error={!!fieldErrors.projectYear}
          helperText={fieldErrors.projectYear || ''}
          disabled={!isEditing || isReadOnly}
        />
        {/* COMPANY DROPDOWN */}
        <FormControl fullWidth required error={!!fieldErrors.companyId}>
          <InputLabel>Company</InputLabel>
            <Select
              value={editedRecord.companyId || ''}
              onChange={e => {
                handleChange('companyId', e.target.value);
                setFieldErrors(prev => ({ ...prev, companyId: undefined }));
                // Optionally update companyName as well:
                const selected = companyOptions.find(opt => opt.value === e.target.value);
                handleChange('companyName', selected ? selected.label : '');
              }}
              disabled={!isEditing || isReadOnly}
              label="Company"
            >
            {companyOptions.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </Select>
          {fieldErrors.companyId && (
            <Typography variant="caption" color="error">{fieldErrors.companyId}</Typography>
          )}
        </FormControl>

        {/* PROGRAM DROPDOWN */}
        <FormControl fullWidth required error={!!fieldErrors.programId}>
          <InputLabel>Program</InputLabel>
            <Select
              value={editedRecord.programId || ''}
              onChange={e => {
                handleChange('programId', e.target.value);
                handleChange('projectId', '');
                setFieldErrors(prev => ({ ...prev, programId: undefined, projectId: undefined }));
              }}
              disabled={!isEditing || isReadOnly}
              label="Program"
            >
            {programOptions.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </Select>
          {fieldErrors.programId && (
            <Typography variant="caption" color="error">{fieldErrors.programId}</Typography>
          )}
        </FormControl>

        {/* PROJECT DROPDOWN */}
        <FormControl fullWidth required error={!!fieldErrors.projectId}>
          <InputLabel>Project</InputLabel>
            <Select
              value={editedRecord.projectId || ''}
              onChange={e => {
                handleChange('projectId', e.target.value);
                setFieldErrors(prev => ({ ...prev, projectId: undefined }));
              }}
              disabled={!isEditing || isReadOnly || !editedRecord.programId}
              label="Project"
            >
            {(projectOptions[editedRecord.programId] || [{ label: "Select Project", value: "" }]).map(opt => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </Select>
          {fieldErrors.projectId && (
            <Typography variant="caption" color="error">{fieldErrors.projectId}</Typography>
          )}
        </FormControl>

        {/* BENEFICIARIES TEXT FIELD */}
        <TextField
          label="Beneficiaries"
          type="number"
          value={editedRecord.csrReport || ''}
          onChange={e => {
            handleChange('csrReport', e.target.value);
            setFieldErrors(prev => ({ ...prev, csrReport: undefined }));
          }}
          fullWidth
          required
          placeholder="Beneficiaries"
          error={!!fieldErrors.csrReport}
          helperText={fieldErrors.csrReport || ''}
          disabled={!isEditing || isReadOnly}
        />

        {/* PROJECT INVESTMENTS TEXT FIELD */}
        <TextField
          label="Investments (₱)"
          type="number"
          value={editedRecord.projectExpenses || ''}
          onChange={e => {
            // Only allow digits and optional decimal point
            const val = e.target.value.replace(/[^0-9.]/g, '');
            handleChange('projectExpenses', val);
            setFieldErrors(prev => ({ ...prev, projectExpenses: undefined }));
          }}
          onInput={e => {
            // Prevent entering 'e', '+', '-'
            e.target.value = e.target.value.replace(/[^0-9.]/g, '');
          }}
          fullWidth
          required
          placeholder="Investments (₱)"
          error={!!fieldErrors.projectExpenses}
          helperText={fieldErrors.projectExpenses || ''}
          disabled={!isEditing || isReadOnly}
        />
      </Box>

      {/* PROJECT REMARKS TEXT FIELD */}
      <TextField
          label="Project Remarks"
          value={editedRecord.projectRemarks || ''}
          onChange={e => handleChange('projectRemarks', e.target.value)}
          fullWidth
          placeholder="Project Remarks"
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

        {/* Put status chip here */}
        <StatusChip status={editedRecord.statusId} />
      </Box>
    </Paper>
  );
};

export default ViewHelpRecordModal;

// Make sure to use the handleClose function as the onClose prop from the parent
