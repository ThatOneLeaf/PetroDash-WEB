import { useState } from 'react';
import { 
  Paper, 
  Typography, 
  TextField, 
  Button,
  Select,
  MenuItem,
  Box,
  Alert,
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    
    // Clear any previous errors/success messages
    setError('');
    setSuccess('');
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      console.log('Submitting capital provider payment data:', formData);
      
      await api.post('/economic/capital-provider-payments', formData);
      
      setSuccess('Record created successfully!');
      
      // Close modal after a short delay to show success message
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (error) {
      console.error('Error adding capital provider payment:', error);
      setError(
        error.response?.data?.detail || 
        error.message || 
        'An error occurred while creating the record'
      );
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return formData.year && Object.values(formData).some(value => 
      value !== formData.year && value !== '' && Number(value) > 0
    );
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

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

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
            disabled={loading}
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
          disabled={loading}
          fullWidth
        />

        <TextField
          label="Dividends to NCI"
          value={formData.dividendsToNci}
          onChange={handleChange('dividendsToNci')}
          type="number"
          size="medium"
          disabled={loading}
          fullWidth
        />

        <TextField
          label="Dividends to Parent"
          value={formData.dividendsToParent}
          onChange={handleChange('dividendsToParent')}
          type="number"
          size="medium"
          disabled={loading}
          fullWidth
        />
      </Box>

      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        mt: 2 
      }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#182959' }}>
          Total Dividends/Interest: ₱{totalDividendsInterest.toLocaleString()}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={loading}
            sx={{ 
              color: '#666',
              borderColor: '#666',
              borderRadius: '999px',
              padding: '9px 18px',
              fontSize: '0.85rem',
              fontWeight: 'bold',
              '&:hover': { 
                borderColor: '#333',
                color: '#333'
              }
            }}
          >
            CANCEL
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={loading || !isFormValid()}
            sx={{ 
              bgcolor: '#2B8C37',
              borderRadius: '999px',
              padding: '9px 18px',
              fontSize: '0.85rem',
              fontWeight: 'bold',
              '&:hover': { bgcolor: '#256d2f' },
              '&:disabled': { bgcolor: '#ccc' }
            }}
          >
            {loading ? 'ADDING...' : 'ADD'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}

export default AddCapitalProviderModal;
