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

function AddValueGeneratedModal({ onClose }) {
  const currentYear = new Date().getFullYear();
  const [formData, setFormData] = useState({
    year: currentYear,
    electricitySales: '',
    oilRevenues: '',
    otherRevenues: '',
    interestIncome: '',
    shareInNetIncomeOfAssociate: '',
    miscellaneousIncome: ''
  });

  const [totalRevenue, setTotalRevenue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Calculate total revenue whenever form data changes
  const calculateTotal = (data) => {
    const values = Object.values(data).filter((value, index) => index !== 0); // Exclude year
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
    
    // Clear any previous errors/success messages
    setError('');
    setSuccess('');
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      console.log('Submitting value generated data:', formData);
      
      const response = await api.post('/economic/value-generated', formData);
      
      console.log('API Response:', response.data);
      setSuccess('Record created successfully!');
      
      // Close modal after a short delay to show success message
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (error) {
      console.error('Error adding record:', error);
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
          label="Electricity Sales"
          value={formData.electricitySales}
          onChange={handleChange('electricitySales')}
          type="number"
          size="medium"
          disabled={loading}
          fullWidth
        />

        <TextField
          label="Oil Revenues"
          value={formData.oilRevenues}
          onChange={handleChange('oilRevenues')}
          type="number"
          size="medium"
          disabled={loading}
          fullWidth
        />

        <TextField
          label="Other Revenues"
          value={formData.otherRevenues}
          onChange={handleChange('otherRevenues')}
          type="number"
          size="medium"
          disabled={loading}
          fullWidth
        />

        <TextField
          label="Interest Income"
          value={formData.interestIncome}
          onChange={handleChange('interestIncome')}
          type="number"
          size="medium"
          disabled={loading}
          fullWidth
        />

        <TextField
          label="Share in Net Income of Associate"
          value={formData.shareInNetIncomeOfAssociate}
          onChange={handleChange('shareInNetIncomeOfAssociate')}
          type="number"
          size="medium"
          disabled={loading}
          fullWidth
        />

        <TextField
          label="Miscellaneous Income"
          value={formData.miscellaneousIncome}
          onChange={handleChange('miscellaneousIncome')}
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
          Total Revenue: ₱{totalRevenue.toLocaleString()}
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

export default AddValueGeneratedModal; 