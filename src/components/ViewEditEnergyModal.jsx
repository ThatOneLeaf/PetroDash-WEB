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
import Overlay from "./modal";
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
  canEdit = true, // <-- new prop, default true
  canApprove = true, // <-- new prop, default true
  role, // <-- new prop
  company_id, // <-- new prop
  power_plant_id, // <-- new prop
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [record, setRecord] = useState(null);
  const [editedRecord, setEditedRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [powerPlants, setPowerPlants] = useState([]);

  // modals
  const [modalType, setModalType] = useState(''); // 'approve' or 'revise'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmResolver, setConfirmResolver] = useState(null);
  const [showNoChanges, setShowNoChanges] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Reject Dialog state
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectRemarks, setRejectRemarks] = useState('');

  // Approve Confirm state
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showApproveSuccess, setShowApproveSuccess] = useState(false);
  const [approveSuccessMessage, setApproveSuccessMessage] = useState('');

  // Reject Confirm state
  const [showRejectSuccess, setShowRejectSuccess] = useState(false);
  const [rejectSuccessMessage, setRejectSuccessMessage] = useState('');

  // Unsaved Changes Confirm state
  const [showUnsavedConfirm, setShowUnsavedConfirm] = useState(false);
  const [pendingClose, setPendingClose] = useState(false);

  const isReadOnly = status === 'Approved';
  const isUnchanged = JSON.stringify(record) === JSON.stringify(editedRecord);

  useEffect(() => {
  const fetchPowerPlants = async () => {
    try {
      let url = '/reference/power_plants';
      if (role === 'R04' && company_id) {
        url += `?p_company_id=${encodeURIComponent(company_id)}`;
      }
      const response = await api.get(url);
      setPowerPlants(response.data);
    } catch (error) {
      setErrorMessage('Failed to load power plants');
      setShowErrorModal(true);
    }
  };
  fetchPowerPlants();
}, [role, company_id]);


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
        setErrorMessage('Failed to load energy record from API.');
        setShowErrorModal(true);
      } finally {
        setLoading(false);
      }
    };

    fetchRecord();
  }, [energyId, powerplantId]);

  const handleChange = (key, value) => {
    let newValue = value;
    if (key === 'energy_generated') {
      // Only allow numbers and a single dot, no negative, no letters, allow 0
      // Accept empty string for controlled input
      if (typeof value === 'string') {
        // Remove all except digits and one dot
        newValue = value.replace(/[^\d.]/g, '');
        // Prevent multiple dots
        const parts = newValue.split('.');
        if (parts.length > 2) {
          newValue = parts[0] + '.' + parts.slice(1).join('');
        }
        // Prevent leading zeros unless it's '0' or '0.xxx'
        if (newValue.length > 1 && newValue[0] === '0' && newValue[1] !== '.') {
          newValue = newValue.replace(/^0+/, '');
          if (newValue === '') newValue = '0';
        }
        // Prevent negative sign
        if (value.includes('-')) {
          newValue = newValue.replace(/-/g, '');
        }
        // Prevent input like '.'
        if (newValue === '.') newValue = '';
      }
      setEditedRecord((prev) => ({ ...prev, [key]: newValue }));
      return;
    }
    setEditedRecord((prev) => ({ ...prev, [key]: newValue }));
  };

const handleSave = async () => {
  if (isUnchanged) {
    // alert('No changes to save.');
    setshowNoChanges(true);
    setIsEditing(false);
    return;
  }
  const confirmed = await waitForConfirmation();
  console.log("Confirmed:", confirmed);

  if (!confirmed) return; // user canceled

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

    //alert(response.data.message);
    setSuccessMessage(response.data.message || 'Record saved successfully.');
    setShowSuccessModal(true);
  } catch (error) {
    const detail = error.response?.data?.detail;

    if (Array.isArray(detail)) {
      const messages = detail.map((d) => d.msg || JSON.stringify(d)).join('\n');
      setErrorMessage(`Failed to save:\n${messages}`);
    } else {
      const msg = detail || error.message;
      setErrorMessage(`Failed to save: ${msg}`);
    }

    setShowErrorModal(true);
  }
};



const handleApprove = async () => {
  setShowApproveConfirm(true);
};

const handleApproveConfirm = async () => {
  setShowApproveConfirm(false);
  try {
    const formData = new FormData();
    formData.append('energy_id', energyId);
    formData.append('checker_id', '01JW5F4N9M7E9RG9MW3VX49ES5');
    formData.append('remarks', ''); // Required by backend
    formData.append('action', 'approve');

    const response = await api.post('/energy/update_status', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    setApproveSuccessMessage('Record status updated successfully.');
    setShowApproveSuccess(true);

  } catch (error) {
    const msg = error.response?.data?.detail || error.message;
    setErrorMessage(`Failed to approve: ${msg}`);
    setShowErrorModal(true);
  }
};


const handleRejectConfirm = async () => {
  if (!rejectRemarks.trim()) {
    setErrorMessage('Please enter remarks before rejecting.');
    setShowErrorModal(true);
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

    setRejectSuccessMessage('Record status updated successfully.');
    setShowRejectSuccess(true);
    setRejectDialogOpen(false);
    setRejectRemarks(''); // Clear remarks after successful rejection
    
  } catch (error) {
    const msg = error.response?.data?.detail || error.message;
    setErrorMessage(`Failed to reject: ${msg}`);
    setShowErrorModal(true);
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
      setShowUnsavedConfirm(true);
      setPendingClose(true);
      return;
    }
    if (updateStatus) updateStatus(isUnchanged);
    onClose();
  };

  const waitForConfirmation = () => {
  return new Promise((resolve) => {
    setModalType('approve');
    setIsModalOpen(true);
    setConfirmResolver(() => resolve);
  });
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
                role === 'R05' && power_plant_id
                  ? power_plant_id
                  : powerPlants.some(p => p.id === editedRecord.power_plant_id)
                    ? editedRecord.power_plant_id
                    : ''
              }
              onChange={(e) => handleChange('power_plant_id', e.target.value)}
              disabled={!isEditing || isReadOnly || (role === 'R05')}
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
            type="text"
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
    {canEdit && (
      <Button
        startIcon={isEditing ? <SaveIcon /> : <EditIcon />}
        onClick={async () => {
          if (isReadOnly) return;
          if (isEditing) {
            if (!isUnchanged) {
              await handleSave();  // await the async save to complete
            } else {
              // alert('No changes made.');
              setShowNoChanges(true);
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
    )}
  </Box>

  {/* Right: Approve/Reject */}
  {canApprove && !isReadOnly  && !isEditing && (
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
      {showNoChanges && (
        <Overlay onClose={() => setShowNoChanges(false)}>
          <Paper
            sx={{
              p: 4,
              width: "400px",
              borderRadius: "16px",
              bgcolor: "white",
              outline: "none",
              textAlign: "center"
            }}
          >
            <Typography sx={{ fontSize: '1.5rem', color: '#e4a728', fontWeight: 800, mb: 2 }}>
              Warning
            </Typography>
            <Typography sx={{ fontSize: '1rem', color: '#333', mb: 3 }}>
              No changes to save.
            </Typography>
            <Button
              variant="contained"
              sx={{
                backgroundColor: '#e4a728',
                borderRadius: '999px',
                padding: '10px 24px',
                fontSize: '1rem',
                fontWeight: 'bold',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#bd8a21',
                },
              }}
              onClick={() => setShowNoChanges(false)}
            >
              OK
            </Button>
          </Paper>
        </Overlay>
      )}
      {isModalOpen && modalType === 'approve' && (
        <Overlay onClose={() => setIsModalOpen(false)}>
          <Paper
            sx={{
              p: 4,
              width: "500px",
              borderRadius: "16px",
              bgcolor: "white",
            }}
          >
            <Typography sx={{ fontSize: '2rem', color: '#182959', fontWeight: 800}}>
              Edit Confirmation
            </Typography>
            <Box sx={{
              bgcolor: '#f5f5f5',
              p: 2,
              borderRadius: '8px',
              width: '100%',
              mb: 3
            }}>
              <Typography sx={{ fontSize: '0.9rem', mb: 1 }}>
                Are you sure you want to save this changes?
              </Typography>
            </Box>
            <Box sx={{
              display: 'flex',
              justifyContent: 'flex-end'
            }}>
              <Button 
                sx={{ 
                  color: '#182959',
                  borderRadius: '999px',
                  padding: '9px 18px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  '&:hover': {
                    color: '#0f1a3c',
                  },
                }}
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                variant='contained'
                sx={{ 
                  marginLeft: 1,
                  backgroundColor: '#2B8C37',
                  borderRadius: '999px',
                  padding: '9px 18px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  '&:hover': {
                    backgroundColor: '#256d2f',
                  },
                }}
                onClick={() => {
                  if (confirmResolver) {
                    confirmResolver(true);
                    setIsModalOpen(false);
                  }
                }}
              >
                Confirm
              </Button>
            </Box>
          </Paper>
        </Overlay>
      )}
      {showSuccessModal && (
        <Overlay onClose={() => setShowSuccessModal(false)}>
          <Paper sx={{
            p: 4,
            width: '400px',
            borderRadius: '16px',
            bgcolor: 'white',
            textAlign: 'center'
          }}>
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: '#182959', mb: 2 }}>
              Success!
            </Typography>
            <Typography sx={{ fontSize: '1rem', color: '#666', mb: 3 }}>
              {successMessage}
            </Typography>
            <Button
              variant="contained"
              sx={{
                backgroundColor: '#2B8C37',
                borderRadius: '999px',
                padding: '10px 24px',
                fontSize: '1rem',
                fontWeight: 'bold',
                '&:hover': {
                  backgroundColor: '#256d2f',
                },
              }}
              onClick={() => {
                setShowSuccessModal(false);   
                setIsEditing(false);          
                if (updateStatus) updateStatus(true); 
                setRecord(editedRecord);      
                onClose();                   
              }}
            >
              OK
            </Button>
          </Paper>
        </Overlay>
      )}
      {showErrorModal && (
        <Overlay onClose={() => setShowErrorModal(false)}>
          <Paper sx={{
            p: 4,
            width: '400px',
            borderRadius: '16px',
            bgcolor: 'white',
            textAlign: 'center'
          }}>
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: '#b00020', mb: 2 }}>
              Error
            </Typography>
            <Typography
              sx={{ fontSize: '1rem', color: '#444', whiteSpace: 'pre-wrap', mb: 3 }}
            >
              {errorMessage}
            </Typography>
            <Button
              variant="contained"
              sx={{
                backgroundColor: '#b00020',
                borderRadius: '999px',
                padding: '10px 24px',
                fontSize: '1rem',
                fontWeight: 'bold',
                '&:hover': {
                  backgroundColor: '#8c001a',
                },
              }}
              onClick={() => setShowErrorModal(false)}
            >
              OK
            </Button>
          </Paper>
        </Overlay>
      )}
      {showApproveConfirm && (
        <Overlay onClose={() => setShowApproveConfirm(false)}>
          <Paper sx={{
            p: 4,
            width: '400px',
            borderRadius: '16px',
            bgcolor: 'white',
            outline: 'none',
            textAlign: 'center'
          }}>
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 3
            }}>
              <Typography sx={{
                fontSize: '1.5rem',
                fontWeight: 800,
                color: '#182959',
                mb: 2
              }}>
                Confirm Record Approval
              </Typography>
              <Typography sx={{
                fontSize: '1rem',
                color: '#666',
                mb: 3
              }}>
                Are you sure you want to approve this power generation record?
              </Typography>
            </Box>
            <Box sx={{
              display: 'flex',
              justifyContent: 'center',
              mt: 3
            }}>
              <Button
                variant="outlined"
                sx={{
                  borderRadius: '999px',
                  px: 3,
                  py: 1,
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  mr: 2
                }}
                onClick={() => setShowApproveConfirm(false)}
              >
                CANCEL
              </Button>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: '#2B8C37',
                  borderRadius: '999px',
                  px: 3,
                  py: 1,
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  '&:hover': { backgroundColor: '#256d2f' },
                }}
                onClick={handleApproveConfirm}
              >
                CONFIRM
              </Button>
            </Box>
          </Paper>
        </Overlay>
      )}
      {showUnsavedConfirm && (
        <Overlay onClose={() => { setShowUnsavedConfirm(false); setPendingClose(false); }}>
          <Paper sx={{
            p: 4,
            width: '400px',
            borderRadius: '16px',
            bgcolor: 'white',
            outline: 'none',
            textAlign: 'center'
          }}>
            <Box sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 3
            }}>
              <Typography sx={{
                fontSize: '1.5rem',
                fontWeight: 800,
                color: '#e4a728',
                mb: 2
              }}>
                Unsaved Changes
              </Typography>
              <Typography sx={{
                fontSize: '1rem',
                color: '#666',
                mb: 3
              }}>
                You have unsaved changes. Close anyway?
              </Typography>
            </Box>
            <Box sx={{
              display: 'flex',
              justifyContent: 'center',
              mt: 3
            }}>
              <Button
                variant="outlined"
                sx={{
                  borderRadius: '999px',
                  px: 3,
                  py: 1,
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  mr: 2
                }}
                onClick={() => { setShowUnsavedConfirm(false); setPendingClose(false); }}
              >
                CANCEL
              </Button>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: '#e4a728',
                  borderRadius: '999px',
                  px: 3,
                  py: 1,
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  color: 'white',
                  '&:hover': { backgroundColor: '#bd8a21' },
                }}
                onClick={() => {
                  setShowUnsavedConfirm(false);
                  setPendingClose(false);
                  if (updateStatus) updateStatus(isUnchanged);
                  onClose();
                }}
              >
                CLOSE ANYWAY
              </Button>
            </Box>
          </Paper>
        </Overlay>
      )}
      {showApproveSuccess && (
        <Overlay onClose={() => setShowApproveSuccess(false)}>
          <Paper sx={{
            p: 4,
            width: '400px',
            borderRadius: '16px',
            bgcolor: 'white',
            textAlign: 'center'
          }}>
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: '#2B8C37', mb: 2 }}>
              Success
            </Typography>
            <Typography sx={{ fontSize: '1rem', color: '#444', mb: 3 }}>
              {approveSuccessMessage}
            </Typography>
            <Button
              variant="contained"
              sx={{
                backgroundColor: '#2B8C37',
                borderRadius: '999px',
                padding: '10px 24px',
                fontSize: '1rem',
                fontWeight: 'bold',
                '&:hover': {
                  backgroundColor: '#256d2f',
                },
              }}
              onClick={() => {
                setShowApproveSuccess(false);
                if (updateStatus) updateStatus('APP');
                onClose(); // <- Now close the modal AFTER the success message is shown
              }}
            >
              OK
            </Button>
          </Paper>
        </Overlay>
      )}
      {showRejectSuccess && (
        <Overlay onClose={() => setShowRejectSuccess(false)}>
          <Paper sx={{
            p: 4,
            width: '400px',
            borderRadius: '16px',
            bgcolor: 'white',
            textAlign: 'center'
          }}>
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 800, color: '#2B8C37', mb: 2 }}>
              Success
            </Typography>
            <Typography sx={{ fontSize: '1rem', color: '#444', mb: 3 }}>
              {rejectSuccessMessage}
            </Typography>
            <Button
              variant="contained"
              sx={{
                backgroundColor: '#2B8C37',
                borderRadius: '999px',
                padding: '10px 24px',
                fontSize: '1rem',
                fontWeight: 'bold',
                '&:hover': {
                  backgroundColor: '#256d2f',
                },
              }}
              onClick={() => {
                setShowRejectSuccess(false);
                if (updateStatus) updateStatus('REJ');
                onClose();
              }}
            >
              OK
            </Button>
          </Paper>
        </Overlay>
      )}
    </>
  );
};

export default ViewEditEnergyModal;
