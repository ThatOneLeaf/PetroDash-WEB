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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import BusinessIcon from '@mui/icons-material/Business';
import api from '../services/api';

const ViewEditEnergyModal = ({
  title,
  energyId,
  powerplantId,
  companyName,
  onClose,
  updatePath,
  status,
  remarks,
  updateStatus,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [record, setRecord] = useState(null);
  const [editedRecord, setEditedRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [powerPlants, setPowerPlants] = useState([]);

  // Reject Dialog state
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectRemarks, setRejectRemarks] = useState('');

  const isReadOnly = status === 'Approved';
  const isUnchanged = JSON.stringify(record) === JSON.stringify(editedRecord);

  useEffect(() => {
  const fetchPowerPlants = async () => {
    try {
      const response = await api.get('/reference/power_plants');
      console.log('Loaded power plants:', response.data); // 👈 LOG HERE
      setPowerPlants(response.data);
    } catch (error) {
      alert('Failed to load power plants');
    }
  };
  fetchPowerPlants();
}, []);


  useEffect(() => {
    if (!energyId || !powerplantId) return;

    const fetchRecord = async () => {
      setLoading(true);
      try {
        const response = await api.get(
          `/energy/energy_record?energy_id=${encodeURIComponent(
            energyId
          )}&powerplant_id=${encodeURIComponent(powerplantId)}`
        );
        setRecord(response.data);
        setEditedRecord(response.data);
      } catch (error) {
        alert('Failed to load energy record from API.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecord();
  }, [energyId, powerplantId]);

  const handleChange = (key, value) => {
    let newValue = value;
    if (key === 'energy_generated') {
      newValue = parseFloat(value);
      if (isNaN(newValue)) newValue = '';
    }
    setEditedRecord((prev) => ({ ...prev, [key]: newValue }));
  };

const handleSave = async () => {
  if (isUnchanged) {
    alert('No changes to save.');
    setIsEditing(false);
    return;
  }

  const confirmed = window.confirm('Are you sure you want to save the changes?');
  if (!confirmed) return;

  try {
    const formData = new FormData();

    // Map frontend fields to backend field names
    formData.append('energy_id', editedRecord.energy_id); // or energyId prop
    formData.append('powerPlant', editedRecord.power_plant_id); // backend expects powerPlant
    formData.append('date', editedRecord.datetime); // format should be YYYY-MM-DD
    formData.append('energyGenerated', editedRecord.energy_generated);
    formData.append('checker', '01JW5F4N9M7E9RG9MW3VX49ES5'); // static or dynamic
    formData.append('metric', editedRecord.unit_of_measurement);
    formData.append('remarks', remarks || ''); // fallback if remarks is optional

    const response = await api.post(updatePath, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    alert(response.data.message);
    setIsEditing(false);
    if (updateStatus) updateStatus(true);
    setRecord(editedRecord);
    onClose(); 
  } catch (error) {
    const detail = error.response?.data?.detail;

    if (Array.isArray(detail)) {
      const messages = detail.map((d) => d.msg || JSON.stringify(d)).join('\n');
      alert(`Failed to save:\n${messages}`);
    } else {
      const msg = detail || error.message;
      alert(`Failed to save: ${msg}`);
    }
    console.error('Save error:', error.response?.data || error);
  }
};



const handleApprove = async () => {
  const confirm = window.confirm('Are you sure you want to approve this record?');
  if (!confirm) return;

  try {
    const formData = new FormData();
    formData.append('energy_id', energyId);
    formData.append('checker_id', '01JW5F4N9M7E9RG9MW3VX49ES5');
    formData.append('remarks', '');  // Required by backend
    formData.append('action', 'approve');

    const response = await api.post('/energy/update_status', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    alert(response.data.message || 'Record approved successfully.');
    if (updateStatus) updateStatus('APP');
    onClose();  // CLOSE MODAL HERE
  } catch (error) {
    const msg = error.response?.data?.detail || error.message;
    alert(`Failed to approve: ${msg}`);
  }
};

const handleRejectConfirm = async () => {
  if (!rejectRemarks.trim()) {
    alert('Please enter remarks before rejecting.');
    return;
  }

  try {
    const formData = new FormData();
    formData.append('energy_id', energyId);
    formData.append('checker_id', '01JW5F4N9M7E9RG9MW3VX49ES5');
    formData.append('remarks', rejectRemarks);
    formData.append('action', 'revise');

    const response = await api.post('/energy/update_status', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    alert(response.data.message || 'Record rejected successfully.');
    if (updateStatus) updateStatus('REJ');
    setRejectDialogOpen(false);
    onClose();  // CLOSE MODAL HERE
  } catch (error) {
    const msg = error.response?.data?.detail || error.message;
    alert(`Failed to reject: ${msg}`);
  }
};



  if (loading) {
    return (
      <Paper sx={{ p: 4, width: 600, borderRadius: 2 }}>
        <Typography>Loading...</Typography>
      </Paper>
    );
  }

  if (!record) {
    return (
      <Paper sx={{ p: 4, width: 600, borderRadius: 2 }}>
        <Typography>No data found for this record.</Typography>
      </Paper>
    );
  }

  const normalizedUnit = (() => {
    const val = editedRecord?.unit_of_measurement || '';
    if (['kWh', 'GWh', 'mWh'].includes(val)) return val;
    if (val.toLowerCase() === 'mwh') return 'mWh';
    if (val.toLowerCase() === 'kwh') return 'kWh';
    if (val.toLowerCase() === 'gwh') return 'GWh';
    return '';
  })();

  const handleCloseClick = () => {
  if (isEditing && !isUnchanged) {
    const confirmClose = window.confirm('You have unsaved changes. Close anyway?');
    if (!confirmClose) return;
  }
  if (updateStatus) updateStatus(isUnchanged);
  onClose();
};


  return (
    <>
      <Paper sx={{ p: 4, width: 600, borderRadius: 2, position: 'relative' }}>
        {/* Close Button - Top Right */}
        <Button
          onClick={() => {handleCloseClick()}}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            minWidth: 'auto',
            padding: 0,
            color: 'grey.600',
          }}
        >
          ✕
        </Button>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mb: 3 }}>
          <Typography sx={{ fontSize: '0.85rem', fontWeight: 800 }}>
            {isEditing ? 'EDIT RECORD' : 'VIEW RECORD'}
          </Typography>
          <Typography sx={{ fontSize: '1.75rem', color: '#182959', fontWeight: 800 }}>
            {title}
          </Typography>
        </Box>


        {companyName && (
          <Box display="flex" alignItems="center" mb={3} p={1} borderRadius={1} bgcolor="grey.100" sx={{ maxWidth: 400 }}>
            <BusinessIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="body1" color="text.secondary" fontWeight={500} noWrap title={companyName}>
              {companyName}
            </Typography>
          </Box>
        )}
        {/* Status and Remarks Display */}
        <Box mb={2} width="100%">
          <Typography variant="body2" fontWeight={600}>
            Status: <span style={{ color: status === 'APP' ? 'green' : status === 'REJ' ? 'red' : '#555' }}>{status || 'PENDING'}</span>
          </Typography>
          {remarks && (
            <Box mt={1} p={1} bgcolor="grey.100" borderRadius={1}>
              <Typography variant="body2" color="text.secondary" fontWeight={500}>
                Remarks:
              </Typography>
              <Typography variant="body2" color="text.primary">
                {remarks}
              </Typography>
            </Box>
          )}
        </Box>

        <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
          <FormControl fullWidth sx={{ gridColumn: '1 / -1' }}>
          <InputLabel>Power Project</InputLabel>
          <Select
            label="Power Plant"
            value={
              powerPlants.some(p => p.id === editedRecord.power_plant_id)
                ? editedRecord.power_plant_id
                : ''
            }
            onChange={(e) => handleChange('power_plant_id', e.target.value)}
            disabled={!isEditing || isReadOnly}
          >
            {powerPlants.map((pp) => (
              <MenuItem key={pp.id} value={pp.id}>
                {pp.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>




          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="Date"
              value={editedRecord.datetime ? new Date(editedRecord.datetime) : null}
              onChange={(newDate) => {
                const dateStr = newDate?.toISOString().split('T')[0];
                handleChange('datetime', dateStr);
              }}
              disabled={!isEditing || isReadOnly}
              enableAccessibleFieldDOMStructure={false}
              sx={{ gridColumn: '1 / -1' }}
              slots={{ textField: TextField }}
              slotProps={{
                textField: {
                  fullWidth: true,
                },
              }}
            />

          </LocalizationProvider>


          <TextField
            label="Energy Generated"
            type="number"
            value={editedRecord.energy_generated !== undefined ? editedRecord.energy_generated : ''}
            onChange={(e) => handleChange('energy_generated', e.target.value)}
            fullWidth
            disabled={!isEditing || isReadOnly}
          />

          <FormControl fullWidth>
            <InputLabel>Unit</InputLabel>
            <Select
              value={normalizedUnit}
              onChange={(e) => handleChange('unit_of_measurement', e.target.value)}
              disabled={!isEditing || isReadOnly}
              label="Unit"
            >
              <MenuItem value="kWh">kWh</MenuItem>
              <MenuItem value="GWh">GWh</MenuItem>
              <MenuItem value="mWh">mWh</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box display="flex" justifyContent="space-between" alignItems="center" mt={4}>
  {/* Left: Save/Edit */}
  <Box display="flex" gap={1}>
    <Button
      startIcon={isEditing ? <SaveIcon /> : <EditIcon />}
      onClick={async () => {
        if (isReadOnly) return;
        if (isEditing) {
          if (!isUnchanged) {
            await handleSave();  // await the async save to complete
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

  {/* Right: Approve/Reject */}
  {!isReadOnly  && !isEditing && (
    <Box display="flex" gap={1}>
      <Button variant="outlined" color="success" onClick={handleApprove}>
        Approve
      </Button>
      <Button variant="outlined" color="error" onClick={() => setRejectDialogOpen(true)}>
        Revise
      </Button>
    </Box>
  )}
  
        {isReadOnly && (
          <Typography variant="caption" color="error" >
            This record has been approved and cannot be edited.
          </Typography>
        )}
</Box>

      </Paper>

      {/* Reject Remarks Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Request to Revise Record</DialogTitle>
        <DialogContent>
          <TextField
            label="Remarks"
            multiline
            fullWidth
            rows={4}
            value={rejectRemarks}
            onChange={(e) => setRejectRemarks(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleRejectConfirm} variant="contained" color="error">
            Confirm Revision Request
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ViewEditEnergyModal;
