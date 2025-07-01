import { useState, useEffect } from 'react';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Button,
  Select,
  TextField,
  Box,
  Paper,
  Typography
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import api from '../services/api';
import FormModal from './FormModal';
import Overlay from "./modal";
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

function AddEnergyGenerationModal({ onClose, companyId, powerPlantId }) {
  const [powerPlants, setPowerPlants] = useState([]);
  const [loadingPlants, setLoadingPlants] = useState(true);
  const [formData, setFormData] = useState({
    powerPlant: '',
    date: dayjs(),
    energyGenerated: '',
    metric: 'kWh',
    remarks: '' 
  });
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showInvalid, setShowInvalid] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorDetailText, setErrorDetailText] = useState("");

  

  useEffect(() => {
    async function fetchPowerPlants() {
      setLoadingPlants(true);
      try {
        const response = await api.get(`/reference/power_plants`, {
          params: { p_company_id: companyId },
        });
        setPowerPlants(response.data || []);
        // Set dropdown value: prefer prop, else first in list
        if (response.data && response.data.length > 0) {
          setFormData((prev) => ({
            ...prev,
            powerPlant: powerPlantId && response.data.some(p => p.id === powerPlantId)
              ? powerPlantId
              : response.data[0].id
          }));
        }
      } catch (err) {
        setPowerPlants([]);
      } finally {
        setLoadingPlants(false);
      }
    }
    if (companyId) fetchPowerPlants();
  }, [companyId, powerPlantId]);

  const handleChange = (field) => (event) => {
    let value = event.target.value;
    if (field === 'energyGenerated') {
      // Only allow positive numbers, no alphabets, no negative, no e/E
      value = value.replace(/[^0-9.]/g, '');
      // Prevent multiple dots
      const parts = value.split('.');
      if (parts.length > 2) value = parts[0] + '.' + parts.slice(1).join('');
      // Prevent negative
      if (value.startsWith('-')) value = value.replace('-', '');
      // Prevent leading zeros (except for "0." case)
      if (/^0[0-9]+/.test(value)) value = value.replace(/^0+/, '');
    }
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDateChange = (newDate) => {
    setFormData((prev) => ({
      ...prev,
      date: newDate
    }));
  };

  const handleShowConfirm = () => {
    // Validate energyGenerated before showing confirmation
    const val = formData.energyGenerated;
    if (
      !val ||
      isNaN(val) ||
      Number(val) <= 0 ||
      /[a-zA-Z]/.test(val)
    ) {
      setShowInvalid(true);
      return;
    }
    setShowConfirm(true);
  };

  const handleHideConfirm = () => {
    setShowConfirm(false);
  };

  const handleSubmit = async () => {
    // Format data
    const submissionData = {
      ...formData,
      date: formData.date.format('YYYY-MM-DD'),
    };

    try {
      // Prepare multipart/form-data
      const form = new FormData();
      form.append('powerPlant', submissionData.powerPlant);
      form.append('date', submissionData.date);
      form.append('energyGenerated', submissionData.energyGenerated);
      form.append('metric', submissionData.metric);
      form.append('remarks', submissionData.remarks);
      form.append('checker', '01JW5F4N9M7E9RG9MW3VX49ES5'); // You might want to replace this with dynamic user ID

      // API call
      const response = await api.post('/energy/add', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      //alert(response.data.message || 'Submission successful.');
      setShowSuccess(true);
      //onClose(); // Close the modal or form
    } catch (error) {
      const rawDetail = error.response?.data?.detail;
      if (typeof rawDetail === "string") {
        const match = rawDetail.match(/'message':\s*'([^']+)'/);
        if (match) {
          setErrorDetailText(match[1]); // extracted 'message' value
        } else {
          setErrorDetailText(rawDetail); // fallback: use full string
        }
      } else {
        setErrorDetailText("An unexpected error occurred.");
      }

      if (typeof rawDetail === 'string') {
        // e.g., "Date parsing error: invalid format"
        //alert(errorDetail);
        setShowError(true);
      } else if (typeof errorDetail === 'object') {
        // e.g., { type: "duplicate_error", message: "..." }
        //alert(errorDetail.message || 'An error occurred while submitting.');
        setShowError(true);
      } else {
        // Fallback
        //alert('An unexpected error occurred. Please try again later.');
        setShowError(true);
      }

      console.error('Submission error:', error);
    }
  };

  const metricUnits = ['kWh', 'MWh', 'GWh'];

  return (
    <>
      <FormModal
        title="ADD NEW RECORD"
        subtitle="Daily Power Generation"
        actions={
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={onClose}
              sx={{
                borderRadius: '999px',
                px: 3,
                py: 1,
                fontSize: '1rem',
                fontWeight: 'bold',
              }}
            >
              CANCEL
            </Button>
            <Button
              variant="contained"
              onClick={handleShowConfirm}
              sx={{
                backgroundColor: '#2B8C37',
                borderRadius: '999px',
                px: 3,
                py: 1,
                fontSize: '1rem',
                fontWeight: 'bold',
                '&:hover': { backgroundColor: '#256d2f' },
              }}
            >
              ADD RECORD
            </Button>
          </Box>
        }
      >
        {/* Power Plant Selector */}
        <FormControl fullWidth>
          <InputLabel id="power-plant-label">Power Project</InputLabel>
          <Select
            labelId="power-plant-label"
            value={formData.powerPlant}
            onChange={handleChange('powerPlant')}
            label="Power Project"
            size="medium"
            disabled={loadingPlants || !!powerPlantId}
          >
            {loadingPlants ? (
              <MenuItem value="" disabled>Loading...</MenuItem>
            ) : powerPlantId ? (
              // Only show the selected power plant if powerPlantId is provided
              (() => {
                const selectedPlant = powerPlants.find(p => p.id === powerPlantId);
                return selectedPlant ? (
                  <MenuItem key={selectedPlant.id} value={selectedPlant.id}>{selectedPlant.name}</MenuItem>
                ) : null;
              })()
            ) : powerPlants.length === 0 ? (
              <MenuItem value="" disabled>No power plants available</MenuItem>
            ) : (
              powerPlants.map((plant) => (
                <MenuItem key={plant.id} value={plant.id}>{plant.name}</MenuItem>
              ))
            )}
          </Select>
        </FormControl>

        {/* Date Picker */}
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Date"
            value={formData.date}
            onChange={handleDateChange}
            slotProps={{
              textField: { fullWidth: true, size: 'medium' },
            }}
            disableFuture={true}
          />
        </LocalizationProvider>

        {/* Energy Generated and Metric */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="Energy Generated"
            value={formData.energyGenerated}
            onChange={handleChange('energyGenerated')}
            type="text"
            size="medium"
            fullWidth
            required
            inputProps={{
              inputMode: 'decimal',
              pattern: '[0-9.]*',
              min: 0,
            }}
            helperText={!formData.energyGenerated ? 'Required field' : ''}
          />
          <FormControl fullWidth>
            <InputLabel id="metric-label">Metric Unit</InputLabel>
            <Select
              labelId="metric-label"
              value={formData.metric}
              onChange={handleChange('metric')}
              label="Metric Unit"
              size="medium"
            >
              {metricUnits.map((unit) => (
                <MenuItem key={unit} value={unit}>
                  {unit}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* Remarks Field */}
        <TextField
          label="Remarks (optional)"
          value={formData.remarks}
          onChange={handleChange('remarks')}
          multiline
          rows={3}
          fullWidth
          margin="normal"
          size="medium"
        />
      </FormModal>
      {/* Confirmation Modal */}
      <Dialog open={showConfirm} onClose={handleHideConfirm} maxWidth="sm" fullWidth>
        <DialogTitle sx={{
          fontWeight: 'bold',
          fontSize: '1.5rem',
          textAlign: 'center',
          letterSpacing: 1,
          color: '#222',
          pt: 3
        }}>
          Confirm Record Submission
        </DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" sx={{ textAlign: 'center', mt: 1, mb: 2 }}>
            Are you sure you want to add this power generation record?
          </Typography>
          <Box sx={{
            background: '#f5f5f5',
            borderRadius: 2,
            p: 3,
            mb: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            boxShadow: 0
          }}>
            <Typography variant="body1"><b>Power Project:</b> {powerPlants.find(p => p.id === formData.powerPlant)?.name || ''}</Typography>
            <Typography variant="body1"><b>Date:</b> {formData.date ? dayjs(formData.date).format('YYYY-MM-DD') : ''}</Typography>
            <Typography variant="body1"><b>Energy Generated:</b> {formData.energyGenerated} {formData.metric}</Typography>
            <Typography variant="body1"><b>Remarks:</b> {formData.remarks || '—'}</Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ display: 'flex', gap: 2, justifyContent: 'center', pb: 3 }}>
          <Button
            variant="outlined"
            onClick={handleHideConfirm}
            sx={{
              borderRadius: '999px',
              px: 3,
              py: 1,
              fontSize: '1rem',
              fontWeight: 'bold',
            }}
          >
            CANCEL
          </Button>
          <Button
            variant="contained"
            onClick={() => { handleHideConfirm(); handleSubmit(); }}
            sx={{
              backgroundColor: '#2B8C37',
              borderRadius: '999px',
              px: 3,
              py: 1,
              fontSize: '1rem',
              fontWeight: 'bold',
              '&:hover': { backgroundColor: '#256d2f' },
            }}
          >
            CONFIRM
          </Button>
        </DialogActions>
      </Dialog>

      {/* modal */}
      {showSuccess && (
        <Overlay onClose={() => setShowSuccess(false)}>
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
              <Box sx={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                backgroundColor: '#2B8C37',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2
              }}>
                <Typography sx={{ 
                  color: 'white', 
                  fontSize: '2rem',
                  fontWeight: 'bold'
                }}>
                  ✓
                </Typography>
              </Box>
              <Typography sx={{ 
                fontSize: '1.5rem', 
                fontWeight: 800,
                color: '#182959',
                mb: 2
              }}>
                Successfully Added Record!
              </Typography>
              <Typography sx={{ 
                fontSize: '1rem',
                color: '#666',
                mb: 3
              }}>
                The record have been successfully added.
              </Typography>
            </Box>
            <Box sx={{
              display: 'flex',
              justifyContent: 'center',
              mt: 3
            }}>
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
                  setShowSuccess(false);
                  onClose();
                }}
              >
                OK
              </Button>
            </Box>
          </Paper>
        </Overlay>
      )}
      

      {showInvalid && (
        <Overlay onClose={() => setShowInvalid(false)}>
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
            <Typography sx={{ fontSize: '1.5rem', color: '#b91c1c', fontWeight: 800, mb: 2 }}>
              Error
            </Typography>
            <Typography sx={{ fontSize: '1rem', color: '#333', mb: 3 }}>
              Please enter a valid energy generated value..
            </Typography>
            <Button
              variant="contained"
              sx={{
                backgroundColor: '#b91c1c',
                borderRadius: '999px',
                padding: '10px 24px',
                fontSize: '1rem',
                fontWeight: 'bold',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#991b1b',
                },
              }}
              onClick={() => setShowInvalid(false)}
            >
              OK
            </Button>
          </Paper>
        </Overlay>
      )}
      {showError && (
        <Overlay onClose={() => setShowError(false)}>
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
            <Typography sx={{ fontSize: '1.5rem', color: '#b91c1c', fontWeight: 800, mb: 2 }}>
              Error
            </Typography>
            <Typography sx={{ fontSize: '1rem', color: '#333', mb: 3 }}>
              {errorDetailText}
            </Typography>
            <Button
              variant="contained"
              sx={{
                backgroundColor: '#b91c1c',
                borderRadius: '999px',
                padding: '10px 24px',
                fontSize: '1rem',
                fontWeight: 'bold',
                color: 'white',
                '&:hover': {
                  backgroundColor: '#991b1b',
                },
              }}
              onClick={() => setShowError(false)}
            >
              OK
            </Button>
          </Paper>
        </Overlay>
      )}
    </>
  );
}

export default AddEnergyGenerationModal;
