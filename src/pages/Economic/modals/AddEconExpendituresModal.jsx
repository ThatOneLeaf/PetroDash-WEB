import { useState, useEffect } from 'react';
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

function AddExpendituresModal({ onClose }) {
  const currentYear = new Date().getFullYear();
  const [companies, setCompanies] = useState([]);
  const [types, setTypes] = useState([]);
  
  const [formData, setFormData] = useState({
    comp: '',
    year: currentYear,
    type: '',
    government: '',
    localSuppl: '',
    foreignSupplierSpending: '',
    employee: '',
    community: '',
    depreciation: '',
    depletion: '',
    others: ''
  });

  const [totalExpenditure, setTotalExpenditure] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Fetch companies and types when component mounts
    const fetchOptions = async () => {
      try {
        const [companiesRes, typesRes] = await Promise.all([
          api.get('/reference/companies'),
          api.get('/reference/expenditure-types')
        ]);
        
        setCompanies(companiesRes.data);
        setTypes(typesRes.data);
        
        // Set initial values
        setFormData(prev => ({
          ...prev,
          comp: companiesRes.data[0]?.id || '',
          type: typesRes.data[0]?.id || ''
        }));
      } catch (error) {
        console.error('Error fetching options:', error);
        setError('Failed to load companies and expenditure types');
      }
    };

    fetchOptions();
  }, []);

  const calculateTotal = (data) => {
    const excludeFields = ['comp', 'year', 'type'];
    const values = Object.entries(data)
      .filter(([key]) => !excludeFields.includes(key))
      .map(([_, value]) => Number(value) || 0);
    const total = values.reduce((sum, value) => sum + value, 0);
    setTotalExpenditure(total);
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
      
      console.log('Submitting expenditure data:', formData);
      
      const response = await api.post('/economic/expenditures', formData);
      
      console.log('API Response:', response.data);
      setSuccess('Expenditure record created successfully!');
      
      // Close modal after a short delay to show success message
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (error) {
      console.error('Error adding expenditure record:', error);
      setError(
        error.response?.data?.detail || 
        error.message || 
        'An error occurred while creating the expenditure record'
      );
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = () => {
    return formData.comp && formData.type && formData.year && 
           Object.entries(formData)
             .filter(([key]) => !['comp', 'year', 'type'].includes(key))
             .some(([_, value]) => value !== '' && Number(value) > 0);
  };

  return (
    <Paper 
      sx={{
        p: 4,
        width: '900px',
        borderRadius: '16px',
        bgcolor: 'white'
      }}
    >
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
          <InputLabel id="company-label">Company</InputLabel>
          <Select
            labelId="company-label"
            value={formData.comp}
            onChange={handleChange('comp')}
            label="Company"
            size="medium"
            disabled={loading}
            MenuProps={{
              PaperProps: {
                sx: {
                  maxHeight: 300,
                  '& .MuiMenuItem-root': {
                    whiteSpace: 'normal',
                    wordBreak: 'break-word'
                  }
                }
              }
            }}
          >
            <MenuItem value="" disabled>
              Select Company
            </MenuItem>
            {companies.map((company) => (
              <MenuItem 
                key={company.id} 
                value={company.id}
                sx={{
                  whiteSpace: 'normal',
                  wordBreak: 'break-word'
                }}
              >
                {company.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel id="type-label">Type</InputLabel>
          <Select
            labelId="type-label"
            value={formData.type}
            onChange={handleChange('type')}
            label="Type"
            size="medium"
            disabled={loading}
            MenuProps={{
              PaperProps: {
                sx: {
                  maxHeight: 300,
                  '& .MuiMenuItem-root': {
                    whiteSpace: 'normal',
                    wordBreak: 'break-word'
                  }
                }
              }
            }}
          >
            <MenuItem value="" disabled>
              Select Type
            </MenuItem>
            {types.map((type) => (
              <MenuItem 
                key={type.id} 
                value={type.id}
                sx={{
                  whiteSpace: 'normal',
                  wordBreak: 'break-word'
                }}
              >
                {type.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

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

        <TextField
          label="Government Payments"
          value={formData.government}
          onChange={handleChange('government')}
          type="number"
          size="medium"
          disabled={loading}
          fullWidth
        />

        <TextField
          label="Local Supplier Spending"
          value={formData.localSuppl}
          onChange={handleChange('localSuppl')}
          type="number"
          size="medium"
          disabled={loading}
          fullWidth
        />

        <TextField
          label="Foreign Supplier Spending"
          value={formData.foreignSupplierSpending}
          onChange={handleChange('foreignSupplierSpending')}
          type="number"
          size="medium"
          disabled={loading}
          fullWidth
        />

        <TextField
          label="Employee Wages/Benefits"
          value={formData.employee}
          onChange={handleChange('employee')}
          type="number"
          size="medium"
          disabled={loading}
          fullWidth
        />

        <TextField
          label="Community Investments"
          value={formData.community}
          onChange={handleChange('community')}
          type="number"
          size="medium"
          disabled={loading}
          fullWidth
        />

        <TextField
          label="Depreciation"
          value={formData.depreciation}
          onChange={handleChange('depreciation')}
          type="number"
          size="medium"
          disabled={loading}
          fullWidth
        />

        <TextField
          label="Depletion"
          value={formData.depletion}
          onChange={handleChange('depletion')}
          type="number"
          size="medium"
          disabled={loading}
          fullWidth
        />

        <TextField
          label="Others"
          value={formData.others}
          onChange={handleChange('others')}
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
        <Typography variant="h6">
          Total Expenditures: ₱{totalExpenditure.toLocaleString()}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={loading}
            sx={{ 
              color: '#666',
              borderColor: '#666',
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
              '&:hover': { bgcolor: '#1b5e20' },
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

export default AddExpendituresModal; 