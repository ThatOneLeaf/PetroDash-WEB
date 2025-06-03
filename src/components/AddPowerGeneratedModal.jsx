import { useState } from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  Box,
  FormControl,
  InputLabel
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import api from '../services/api';

function AddEnergyGenerationModal({ onClose, powerPlants }) {
  const [formData, setFormData] = useState({
    powerPlant: powerPlants?.[0]?.power_plant_id || '',
    date: dayjs(),
    energyGenerated: '',
    metric: 'kWh'
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
  const submissionData = {
    ...formData,
    date: formData.date.format('YYYY-MM-DD')
  };

  const form = new FormData();
  form.append('powerPlant', submissionData.powerPlant);
  form.append('date', submissionData.date);
  form.append('energyGenerated', submissionData.energyGenerated);
  form.append('metric', submissionData.metric);

  try {
    const response = await api.post('/energy/add_energy_record', form, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    onClose();
  } catch (error) {
    console.error('Submission error:', error.response?.data || error.message);
  }
};


  return (
    <Paper
      sx={{
        p: 4,
        width: '600px',
        borderRadius: '16px',
        bgcolor: 'white'
      }}
    >
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: '1rem', fontWeight: 800 }}>
          ADD NEW RECORD
        </Typography>
        <Typography sx={{ fontSize: '2.2rem', color: '#182959', fontWeight: 800 }}>
          Daily Power Generation
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gap: 2, mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel id="power-plant-label">Power Plant</InputLabel>
          <Select
            labelId="power-plant-label"
            value={formData.powerPlant}
            onChange={handleChange('powerPlant')}
            label="Power Plant"
            size="medium"
          >
            {powerPlants.map((plant) => (
              <MenuItem key={plant.power_plant_id} value={plant.power_plant_id}>
                {plant.site_name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Date"
            value={formData.date}
            onChange={handleDateChange}
            slotProps={{
              textField: { fullWidth: true, size: 'medium' }
            }}
          />
        </LocalizationProvider>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="Energy Generated"
            value={formData.energyGenerated}
            onChange={handleChange('energyGenerated')}
            type="number"
            size="medium"
            fullWidth
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
              {['kWh', 'MWh', 'GWh'].map((unit) => (
                <MenuItem key={unit} value={unit}>
                  {unit}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
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
            '&:hover': {
              backgroundColor: '#256d2f'
            }
          }}
        >
          ADD RECORD
        </Button>
      </Box>
    </Paper>
  );
}

export default AddEnergyGenerationModal;
