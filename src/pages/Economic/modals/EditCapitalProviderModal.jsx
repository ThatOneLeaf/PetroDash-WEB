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

function EditCapitalProviderModal({ onClose, selectedRecord }) {
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [recordData, setRecordData] = useState(null);

  const [formData, setFormData] = useState({
    year: '',
    interest: '',
    dividendsToNci: '',
    dividendsToParent: ''
  });

  const [totalDividendsInterest, setTotalDividendsInterest] = useState(0);

  useEffect(() => {
    // Fetch the actual record data from the API
    const fetchRecordData = async () => {
      try {
        setLoading(true);
        console.log('Fetching record for year:', selectedRecord.year);
        
        const response = await api.get(`/economic/capital-provider-payments/${selectedRecord.year}`);
        const data = response.data;
        
        console.log('Fetched record data:', data);
        setRecordData(data);
        setFormData(data);
        
      } catch (error) {
        console.error('Error fetching record data:', error);
        setError('Failed to load capital provider payment record data');
      } finally {
        setLoading(false);
      }
    };

    if (selectedRecord) {
      fetchRecordData();
    }
  }, [selectedRecord]);

  // Calculate total whenever form data changes
  useEffect(() => {
    const total = (Number(formData.interest) || 0) + 
                  (Number(formData.dividendsToNci) || 0) + 
                  (Number(formData.dividendsToParent) || 0);
    setTotalDividendsInterest(total);
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
      
      console.log('Updating capital provider payment data:', formData);
      
      await api.put(`/economic/capital-provider-payments/${recordData.year}`, formData);
      
      setSuccess('Capital provider payment record updated successfully!');
      
      // Close modal after a short delay to show success message
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (error) {
      console.error('Error updating capital provider payment record:', error);
      setError(
        error.response?.data?.detail || 
        error.message || 
        'An error occurred while updating the capital provider payment record'
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
          <Typography>Loading capital provider payment data...</Typography>
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
          Failed to load capital provider payment record data
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
        Edit Capital Provider Payment Record
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
          label="Interest"
          value={formData.interest}
          onChange={handleChange('interest')}
          type="number"
          size="medium"
          disabled={submitLoading}
          fullWidth
        />

        <TextField
          label="Dividends to NCI"
          value={formData.dividendsToNci}
          onChange={handleChange('dividendsToNci')}
          type="number"
          size="medium"
          disabled={submitLoading}
          fullWidth
        />

        <TextField
          label="Dividends to Parent"
          value={formData.dividendsToParent}
          onChange={handleChange('dividendsToParent')}
          type="number"
          size="medium"
          disabled={submitLoading}
          fullWidth
          sx={{ gridColumn: 'span 2' }}
        />
      </Box>

      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        mt: 2 
      }}>
        <Typography variant="h6" sx={{ color: '#2B8C37', fontWeight: 'bold' }}>
          Total Dividends/Interest: ₱{totalDividendsInterest.toLocaleString()}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={submitLoading}
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
            disabled={submitLoading || !isFormValid()}
            sx={{ 
              bgcolor: '#2B8C37',
              '&:hover': { bgcolor: '#1b5e20' },
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

export default EditCapitalProviderModal; 