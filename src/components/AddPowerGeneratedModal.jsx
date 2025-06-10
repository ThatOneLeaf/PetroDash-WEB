import { useState } from 'react';
import {
  FormControl,
  InputLabel,
  MenuItem,
  Button,
  Select,
  TextField,
  Box
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import api from '../services/api';
import FormModal from './FormModal';

function AddEnergyGenerationModal({ onClose, powerPlants }) {
  const [formData, setFormData] = useState({
    powerPlant: powerPlants?.[0]?.power_plant_id || '',
    date: dayjs(),
    energyGenerated: '',
    metric: 'kWh',
    remarks: '' 
  });

  const handleChange = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleDateChange = (newDate) => {
    setFormData((prev) => ({
      ...prev,
      date: newDate
    }));
  };

const handleSubmit = async () => {

  // Validate energyGenerated
  if (!formData.energyGenerated || isNaN(formData.energyGenerated)) {
    alert('Please enter a valid energy generated value.');
    return;
  }

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

    alert(response.data.message || 'Submission successful.');
    onClose(); // Close the modal or form
  } catch (error) {
    const errorDetail = error.response?.data?.detail;

    if (typeof errorDetail === 'string') {
      // e.g., "Date parsing error: invalid format"
      alert(errorDetail);
    } else if (typeof errorDetail === 'object') {
      // e.g., { type: "duplicate_error", message: "..." }
      alert(errorDetail.message || 'An error occurred while submitting.');
    } else {
      // Fallback
      alert('An unexpected error occurred. Please try again later.');
    }

    console.error('Submission error:', error);
  }
};



  const metricUnits = ['kWh', 'MWh', 'GWh'];

  return (
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
            onClick={handleSubmit}
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
        >
          {powerPlants.map((plant) => (
            <MenuItem key={plant.power_plant_id} value={plant.power_plant_id}>
              {plant.site_name}
            </MenuItem>
          ))}
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
          type="number"
          size="medium"
          fullWidth
          required
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
  );
}

export default AddEnergyGenerationModal;
