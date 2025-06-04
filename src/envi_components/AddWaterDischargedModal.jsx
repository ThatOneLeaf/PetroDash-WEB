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

function AddWaterAbstractionModal({ onClose }) {
  const currentYear = new Date().getFullYear();
  const [formData, setFormData] = useState({
    company_id: '', // ⬅️ Initialize company
    year: currentYear, 
    quarter: '', // ⬅️ Initialize quarter
    volume: '',
    unit_of_measurement: 'cubic meter' // Default unit
  });

  const handleChange = (field) => (event) => {
    const newFormData = {
      ...formData,
      [field]: event.target.value
    };
    setFormData(newFormData);
  };

  const handleSubmit = async (formData) => {
    console.log("Submitting form data:", formData);
    try {
      const payload = {
        company_id: formData.company_id?.trim(),
        quarter: formData.quarter,
        year: parseInt(formData.year),
        volume: parseFloat(formData.volume),
        unit_of_measurement: formData.unit_of_measurement?.trim(),
      };

      const response = await api.post(
        "/environment/single_upload_water_discharge",
        payload
      );

      alert(response.data.message);
      onClose(); // Close modal if needed
    } catch (error) {
      console.error("Error uploading single record:", error);
      alert(error?.response?.data?.detail || "Add Record Failed.");
    }
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
        gap: 2,
        mb: 2
      }}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Company</InputLabel>
          <Select
            value={formData.company_id}
            onChange={handleChange('company_id')}
            label="Company"
            sx={{ height: '55px' }}
          >
            {['MGI', 'PWEI', 'PSC'].map((company_id) => (
              <MenuItem key={company_id} value={company_id}>
                {company_id}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

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
          placeholder="Water Volume"
          value={formData.volume}
          onChange={handleChange('volume')}
          type="number"
        />

        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Unit of Measurement</InputLabel>
          <Select
            value={formData.unit_of_measurement}
            onChange={handleChange('unit_of_measurement')}
            label="Unit of Measurement"
            sx={{ height: '55px' }}
          >
            {['cubic meter'].map((unit_of_measurement) => (
              <MenuItem key={unit_of_measurement} value={unit_of_measurement}>
                {unit_of_measurement}
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
          onClick={() => handleSubmit(formData)}
        >
          ADD RECORD
        </Button>
      </Box>
    </Paper>
  );
}

export default AddWaterAbstractionModal;
