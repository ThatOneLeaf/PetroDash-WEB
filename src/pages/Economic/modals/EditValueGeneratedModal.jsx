import { useState, useEffect } from 'react';
import { 
  Paper, 
  Typography, 
  TextField, 
  Button,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import api from '../../../services/api';

function EditValueGeneratedModal({ onClose, selectedRecord }) {
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [recordData, setRecordData] = useState(null);

  const [formData, setFormData] = useState({
    year: '',
    electricitySales: '',
    oilRevenues: '',
    otherRevenues: '',
    interestIncome: '',
    shareInNetIncomeOfAssociate: '',
    miscellaneousIncome: ''
  });

  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    // Fetch the actual record data from the API
    const fetchRecordData = async () => {
      try {
        setLoading(true);
        console.log('Fetching record for year:', selectedRecord.year);
        
        const response = await api.get(`/economic/value-generated/${selectedRecord.year}`);
        const data = response.data;
        
        console.log('Fetched record data:', data);
        setRecordData(data);
        setFormData(data);
        
      } catch (error) {
        console.error('Error fetching record data:', error);
        setError('Failed to load value generated record data');
      } finally {
        setLoading(false);
      }
    };

    if (selectedRecord) {
      fetchRecordData();
    }
  }, [selectedRecord]);

  // Calculate total revenue whenever form data changes
  useEffect(() => {
    const values = [
      'electricitySales', 'oilRevenues', 'otherRevenues', 
      'interestIncome', 'shareInNetIncomeOfAssociate', 'miscellaneousIncome'
    ].map(field => Number(formData[field]) || 0);
    const total = values.reduce((sum, value) => sum + value, 0);
    setTotalRevenue(total);
  }, [formData]);

  const handleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    
    // Clear any previous errors/success messages
    setError('');
    setSuccess('');
  };

  const handleSubmit = async () => {
    try {
      setSubmitLoading(true);
      setError('');
      setSuccess('');
      
      console.log('Updating value generated data:', formData);
      
      await api.put(`/economic/value-generated/${recordData.year}`, formData);
      
      setSuccess('Value generated record updated successfully!');
      
      // Close modal after a short delay to show success message
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (error) {
      console.error('Error updating value generated record:', error);
      setError(
        error.response?.data?.detail || 
        error.message || 
        'An error occurred while updating the value generated record'
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  const isFormValid = () => {
    return formData.year && Object.entries(formData)
      .filter(([key]) => key !== 'year')
      .some(([_, value]) => value !== '' && Number(value) > 0);
  };

  if (loading) {
    return (
      <Paper sx={{
        p: 4,
        width: '600px',
        borderRadius: '16px',
        bgcolor: 'white',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '200px'
      }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <CircularProgress size={40} />
          <Typography>Loading value generated data...</Typography>
        </Box>
      </Paper>
    );
  }

  if (!recordData) {
    return (
      <Paper sx={{
        p: 4,
        width: '600px',
        borderRadius: '16px',
        bgcolor: 'white'
      }}>
        <Alert severity="error">
          Failed to load value generated record data
        </Alert>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Button variant="outlined" onClick={onClose}>
            CLOSE
          </Button>
        </Box>
      </Paper>
    );
  }

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
        fontWeight: 'bold',
        textAlign: 'center'
      }}>
        Edit Value Generated Record
      </Typography>

      <Typography variant="h6" sx={{ 
        color: '#182959',
        mb: 3,
        textAlign: 'center'
      }}>
        Year {recordData.year}
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
        <TextField
          label="Electricity Sales"
          value={formData.electricitySales}
          onChange={handleChange('electricitySales')}
          type="number"
          size="medium"
          disabled={submitLoading}
          fullWidth
          onKeyDown={(e) => {
            if (e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-') {
              e.preventDefault();
            }
          }}
        />

        <TextField
          label="Oil Revenues"
          value={formData.oilRevenues}
          onChange={handleChange('oilRevenues')}
          type="number"
          size="medium"
          disabled={submitLoading}
          fullWidth
          onKeyDown={(e) => {
            if (e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-') {
              e.preventDefault();
            }
          }}
        />

        <TextField
          label="Other Revenues"
          value={formData.otherRevenues}
          onChange={handleChange('otherRevenues')}
          type="number"
          size="medium"
          disabled={submitLoading}
          fullWidth
          onKeyDown={(e) => {
            if (e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-') {
              e.preventDefault();
            }
          }}
        />

        <TextField
          label="Interest Income"
          value={formData.interestIncome}
          onChange={handleChange('interestIncome')}
          type="number"
          size="medium"
          disabled={submitLoading}
          fullWidth
          onKeyDown={(e) => {
            if (e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-') {
              e.preventDefault();
            }
          }}
        />

        <TextField
          label="Share in Net Income of Associate"
          value={formData.shareInNetIncomeOfAssociate}
          onChange={handleChange('shareInNetIncomeOfAssociate')}
          type="number"
          size="medium"
          disabled={submitLoading}
          fullWidth
          sx={{ gridColumn: 'span 2' }}
          onKeyDown={(e) => {
            if (e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-') {
              e.preventDefault();
            }
          }}
        />

        <TextField
          label="Miscellaneous Income"
          value={formData.miscellaneousIncome}
          onChange={handleChange('miscellaneousIncome')}
          type="number"
          size="medium"
          disabled={submitLoading}
          fullWidth
          sx={{ gridColumn: 'span 2' }}
          onKeyDown={(e) => {
            if (e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-') {
              e.preventDefault();
            }
          }}
        />
      </Box>

      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        mt: 2 
      }}>
        <Typography variant="h6" sx={{ color: '#2B8C37' }}>
          Total Revenue: ₱{totalRevenue.toLocaleString()}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={submitLoading}
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
            disabled={submitLoading || !isFormValid()}
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
            {submitLoading ? 'UPDATING...' : 'UPDATE'}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}

export default EditValueGeneratedModal; 