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

function AddEnvironmentDieselModal({ onClose }) {
  const currentYear = new Date().getFullYear();
  const [formData, setFormData] = useState({
    year: currentYear, 
    month: '', // ⬅️ Initialize quarter
    consumption: '',
    unit: 'Liter' // Default unit
  });

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
      width: '500px',
      borderRadius: '16px',
      bgcolor: 'white'
    }}>
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        mb: 3}}>
        <Typography sx={{ 
          fontSize: '1rem', 
          fontWeight: 800,
        }}>
          ADD NEW RECORD
        </Typography>
        <Typography sx={{ fontSize: '2.2rem', color: '#182959', fontWeight: 800}}>
          Water - Discharged
        </Typography>
      </Box>

      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr',
        gap: 2,
        mb: 2
      }}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Month</InputLabel>
          <Select
            value={formData.month}
            onChange={handleChange('month')}
            label="Month"
            sx={{ height: '55px' }}
          >
            {[
              'January', 'February', 'March', 'April', 'May', 'June',
              'July', 'August', 'September', 'October', 'November', 'December'
            ].map((month) => (
              <MenuItem key={month} value={month}>
                {month}
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
        <FormControl fullWidth>
          <InputLabel>Company Property</InputLabel>
          <Select
            value={formData.property}
            onChange={handleChange('property')}
            label="Company Property"
            sx={{ height: '55px' }}
          >
            {[
              'Grass Cutter',
              'Generator Sets',
              'DMAX',
              'MUX',
              'MULTICAB',
              'ELF TRUCK',
              'WATER TRUCK (4l)',
              'WATER TRUCK (6l)',
            ].map((item) => (
              <MenuItem key={item} value={item}>
                {item}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          placeholder="Diesel Consumption"
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
            {['Liter'].map((unit) => (
              <MenuItem key={unit} value={unit}>
                {unit}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        mt: 3
      }}>
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
      </Box>
    </Paper>
  );
}

export default AddEnvironmentDieselModal;
