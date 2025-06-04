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
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

function AddEnvironmentDieselModal({ onClose }) {
  const currentYear = new Date().getFullYear();
  const [formData, setFormData] = useState({
    company_id: '', // ⬅️ Initialize company
    cp_id: '',
    consumption: '',
    unit_of_measurement: 'Liter', // Default unit
    date: '',
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
        cp_id: formData.cp_id?.trim(),
        unit_of_measurement: formData.unit_of_measurement?.trim(),
        consumption: parseFloat(formData.consumption),
        date: formData.date,
      };

      const response = await api.post(
        "/environment/single_upload_diesel_consumption",
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
          Energy - Diesel
        </Typography>
      </Box>

      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr',
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
        <FormControl fullWidth>
          <InputLabel>Company Property</InputLabel>
          <Select
            value={formData.cp_id}
            onChange={handleChange('cp_id')}
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
            ].map((cp_id) => (
              <MenuItem key={cp_id} value={cp_id}>
                {cp_id}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{
        display: 'grid', 
        gap: 2,
        mb: 2
      }}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <DatePicker
            label="Date"
            value={formData.date ? new Date(formData.date) : null}
            onChange={(newValue) => {
              setFormData((prev) => ({
                ...prev,
                date: newValue?.toISOString().split('T')[0] || '',
              }));
            }}
            renderInput={(params) => <TextField {...params} fullWidth />}
          />
        </LocalizationProvider>
      </Box>


      <Box sx={{
        display: 'grid', 
        gap: 2,
        mb: 3
      }}>
         <TextField
          placeholder="Diesel Consumption"
          value={formData.consumption}
          onChange={handleChange('consumption')}
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
            {['Liter'].map((unit_of_measurement) => (
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

export default AddEnvironmentDieselModal;
