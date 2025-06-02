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
  InputLabel // ⬅️ Make sure this is imported
} from '@mui/material';
import api from '../services/api';

function AddEnvironmentEnergyModal({ onClose }) {
  const currentYear = new Date().getFullYear();
  const [formData, setFormData] = useState({
    year: currentYear, 
    quarter: '', // ⬅️ Initialize quarter
    consumption: '',
    unit: 'kWh' // Default unit
  });

  const [totalRevenue, setTotalRevenue] = useState(0);

  const calculateTotal = (data) => {
    const values = Object.values(data).filter((value, index) => index !== 0 && index !== 1); // Exclude year & quarter
    const total = values.reduce((sum, value) => sum + (Number(value) || 0), 0);
    setTotalRevenue(total);
  };

  const handleChange = (field) => (event) => {
    const newFormData = {
      ...formData,
      [field]: event.target.value
    };
    setFormData(newFormData);
    calculateTotal(newFormData);
  };

  const handleSubmit = async () => {

  };

  return (
    <Paper sx={{
      p: 4,
      width: '400px',
      borderRadius: '16px',
      bgcolor: 'white'
    }}>
      <Typography variant="h5" sx={{ 
        color: '#1a237e',
        mb: 3,
        fontWeight: 'bold' 
      }}>
        Add New Record
      </Typography>

      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr',
        gap: 2,
        mb: 2
      }}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Quarter</InputLabel>
          <Select
            value={formData.quarter}
            onChange={handleChange('quarter')}
            label="Quarter"
            sx={{ height: '55px' }}
          >
            {['Q1', 'Q2', 'Q3', 'Q4'].map((quarter) => (
              <MenuItem key={quarter} value={quarter}>
                {quarter}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 120 }}>
        <InputLabel>Year</InputLabel>
          <Select
            value={formData.year}
            onChange={handleChange('year')}
            label="Year"
            sx={{ height: '55px' }}
          >
            {[...Array(10)].map((_, i) => (
              <MenuItem 
                key={currentYear - i} 
                value={currentYear - i}
              >
                {currentYear - i}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Box sx={{
        display: 'grid', 
        gap: 2,
        mb: 3
      }}>
         <TextField
          placeholder="Electricity Consumption"
          value={formData.consumption}
          onChange={handleChange('consumption')}
          type="number"
        />

        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Unit of Measurement</InputLabel>
          <Select
            value={formData.unit}
            onChange={handleChange('unit')}
            label="Unit of Measurement"
            sx={{ height: '55px' }}
          >
            {['kWh', 'mWh', 'gWh'].map((unit) => (
              <MenuItem key={unit} value={unit}>
                {unit}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Button
        variant="contained"
        sx={{ 
          backgroundColor: '#2B8C37',
          borderRadius: '999px', // Fully rounded (pill-style)
          padding: '9px 18px',    // Optional: adjust padding for better look 
          fontSize: '1rem', // Optional: adjust font size
          fontWeight: 'bold',
          '&:hover': {
            backgroundColor: '#256d2f', // darker shade of #2B8C37
          },
        }}
        onClick={handleSubmit}
      >
        ADD RECORD
      </Button>
    </Paper>
  );
}

export default AddEnvironmentEnergyModal;
