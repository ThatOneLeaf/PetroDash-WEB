import { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  Box
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';

function AddEnergyGenerationModal({ onClose }) {
  const dummyPowerPlants = [
    { id: 'plant1', name: 'Plant Alpha' },
    { id: 'plant2', name: 'Plant Beta' },
    { id: 'plant3', name: 'Plant Gamma' }
  ];

  const [powerPlants, setPowerPlants] = useState([]);
  const [formData, setFormData] = useState({
    powerPlant: '',
    date: dayjs(),
    energyGenerated: '',
    metric: 'MWh'
  });

  useEffect(() => {
    // Simulate fetching power plants
    setPowerPlants(dummyPowerPlants);
    setFormData((prev) => ({
      ...prev,
      powerPlant: dummyPowerPlants[0]?.id || ''
    }));
  }, []);

  const handleChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
  };

  const handleDateChange = (newDate) => {
    setFormData({
      ...formData,
      date: newDate
    });
  };

  const handleSubmit = () => {
    // Log form data to console instead of sending to API
    console.log('Submitted data:', {
      ...formData,
      date: formData.date.format('YYYY-MM-DD')
    });
    onClose();
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
      <Typography variant="h5" sx={{ color: '#182959', mb: 3, fontWeight: 'bold' }}>
        Add Energy Generation Record
      </Typography>

      <Box sx={{ display: 'grid', gap: 2, mb: 3 }}>
        <Select
          value={formData.powerPlant}
          onChange={handleChange('powerPlant')}
          sx={{ height: '40px' }}
        >
          {powerPlants.map((plant) => (
            <MenuItem key={plant.id} value={plant.id}>
              {plant.name}
            </MenuItem>
          ))}
        </Select>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Date"
            value={formData.date}
            onChange={handleDateChange}
            slotProps={{
              textField: { fullWidth: true, size: 'small' }
            }}
          />
        </LocalizationProvider>

        <TextField
          placeholder="Energy Generated"
          value={formData.energyGenerated}
          onChange={handleChange('energyGenerated')}
          type="number"
        />

        <Select
          value={formData.metric}
          onChange={handleChange('metric')}
          sx={{ height: '40px' }}
        >
          {['MWh', 'kWh', 'GWh'].map((unit) => (
            <MenuItem key={unit} value={unit}>
              {unit}
            </MenuItem>
          ))}
        </Select>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        <Button
          variant="contained"
          onClick={handleSubmit}
          sx={{
            bgcolor: '#2B8C37',
            '&:hover': { bgcolor: '#1b5e20' }
          }}
        >
          ADD
        </Button>
      </Box>
    </Paper>
  );
}

export default AddEnergyGenerationModal;
