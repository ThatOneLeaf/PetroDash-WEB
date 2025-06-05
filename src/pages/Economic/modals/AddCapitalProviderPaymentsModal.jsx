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
import api from '../../../services/api';

function AddCapitalProviderModal({ onClose }) {
  const currentYear = new Date().getFullYear();
  const [formData, setFormData] = useState({
    year: currentYear,
    interest: '',
    dividendsToNci: '',
    dividendsToParent: ''
  });

  const [totalDividendsInterest, setTotalDividendsInterest] = useState(0);

  // Calculate total whenever form data changes
  const calculateTotal = (data) => {
    const total = (Number(data.interest) || 0) + 
                  (Number(data.dividendsToNci) || 0) + 
                  (Number(data.dividendsToParent) || 0);
    setTotalDividendsInterest(total);
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
    try {
      await api.post('/economic/capital-provider-payments', formData);
      onClose();
    } catch (error) {
      console.error('Error adding capital provider payment:', error);
    }
  };

  return (
    <Paper sx={{
      p: 4,
      width: '600px',
      borderRadius: '16px',
      bgcolor: 'white'
    }}>
      <Typography variant="h5" sx={{ 
        color: '#182959',
        mb: 3,
        fontWeight: 'bold' 
      }}>
        Add New Record
      </Typography>

      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr',
        gap: 2,
        mb: 3
      }}>
        <FormControl fullWidth>
          <InputLabel id="year-label">Year</InputLabel>
          <Select
            labelId="year-label"
            value={formData.year}
            onChange={handleChange('year')}
            label="Year"
            size="medium"
          >
            <MenuItem value="" disabled>
              Year
            </MenuItem>
            {[...Array(10)].map((_, i) => (
              <MenuItem key={currentYear - i} value={currentYear - i}>
                {currentYear - i}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Interest"
          value={formData.interest}
          onChange={handleChange('interest')}
          type="number"
          size="medium"
          fullWidth
        />

        <TextField
          label="Dividends to NCI"
          value={formData.dividendsToNci}
          onChange={handleChange('dividendsToNci')}
          type="number"
          size="medium"
          fullWidth
        />

        <TextField
          label="Dividends to Parent"
          value={formData.dividendsToParent}
          onChange={handleChange('dividendsToParent')}
          type="number"
          size="medium"
          fullWidth
        />
      </Box>

      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        mt: 2 
      }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Total Dividends/Interest: {totalDividendsInterest.toLocaleString()}
        </Typography>
        <Button
          variant="contained"
          onClick={handleSubmit}
          sx={{ 
            bgcolor: '#2B8C37',
            '&:hover': { bgcolor: '#1b5e20' },
            fontWeight: 'bold',
            px: 4
          }}
        >
          ADD
        </Button>
      </Box>
    </Paper>
  );
}

export default AddCapitalProviderModal;
