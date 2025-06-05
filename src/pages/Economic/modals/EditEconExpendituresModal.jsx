import { useState, useEffect } from 'react';
import { 
  Paper, 
  Typography, 
  TextField, 
  Button,
  Box,
  Alert,
  Divider,
  CircularProgress
} from '@mui/material';
import api from '../../../services/api';

function EditEconExpendituresModal({ onClose, selectedRecord }) {
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [recordData, setRecordData] = useState(null);

  // Form data for both types - will be populated from API
  const [formData, setFormData] = useState({});
  const [totalExpenditures, setTotalExpenditures] = useState({});

  useEffect(() => {
    // Fetch the actual record data from the API
    const fetchRecordData = async () => {
      try {
        setLoading(true);
        console.log('Fetching record for:', selectedRecord.comp, selectedRecord.year);
        
        const response = await api.get(`/economic/expenditures/${selectedRecord.comp}/${selectedRecord.year}`);
        const data = response.data;
        
        console.log('Fetched record data:', data);
        setRecordData(data);
        
        // Initialize form data with fetched data
        const initialFormData = {};
        Object.keys(data.types).forEach(typeName => {
          const typeData = data.types[typeName];
          initialFormData[typeName] = {
            type_id: typeData.type_id,
            government: typeData.government || 0,
            localSupplierSpending: typeData.localSupplierSpending || 0,
            foreignSupplierSpending: typeData.foreignSupplierSpending || 0,
            employee: typeData.employee || 0,
            community: typeData.community || 0,
            depreciation: typeData.depreciation || 0,
            depletion: typeData.depletion || 0,
            others: typeData.others || 0
          };
        });
        
        setFormData(initialFormData);
        
      } catch (error) {
        console.error('Error fetching record data:', error);
        setError('Failed to load expenditure record data');
      } finally {
        setLoading(false);
      }
    };

    if (selectedRecord) {
      fetchRecordData();
    }
  }, [selectedRecord]);

  // Calculate totals for each type
  useEffect(() => {
    const newTotals = {};
    Object.keys(formData).forEach(typeName => {
      const data = formData[typeName];
      if (data) {
        const values = [
          'government', 'localSupplierSpending', 'foreignSupplierSpending', 
          'employee', 'community', 'depreciation', 'depletion', 'others'
        ].map(field => Number(data[field]) || 0);
        newTotals[typeName] = values.reduce((sum, value) => sum + value, 0);
      }
    });
    setTotalExpenditures(newTotals);
  }, [formData]);

  const handleChange = (typeName, field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [typeName]: {
        ...prev[typeName],
        [field]: event.target.value
      }
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
      
      console.log('Updating expenditure data:', formData);
      
      // Update each type separately
      const updatePromises = Object.keys(formData).map(typeName => {
        const data = formData[typeName];
        return api.put(`/economic/expenditures/${recordData.comp}/${recordData.year}/${data.type_id}`, {
          comp: recordData.comp,
          year: recordData.year,
          type: data.type_id,
          government: data.government,
          localSupplierSpending: data.localSupplierSpending,
          foreignSupplierSpending: data.foreignSupplierSpending,
          employee: data.employee,
          community: data.community,
          depreciation: data.depreciation,
          depletion: data.depletion,
          others: data.others
        });
      });
      
      await Promise.all(updatePromises);
      
      setSuccess('Expenditure records updated successfully!');
      
      // Close modal after a short delay to show success message
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (error) {
      console.error('Error updating expenditure records:', error);
      setError(
        error.response?.data?.detail || 
        error.message || 
        'An error occurred while updating the expenditure records'
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  const isFormValid = () => {
    return Object.keys(formData).every(typeName => {
      const data = formData[typeName];
      return data && Object.entries(data)
        .filter(([key]) => key !== 'type_id')
        .some(([_, value]) => value !== '' && Number(value) > 0);
    });
  };

  // Get type abbreviations
  const getTypeAbbreviation = (typeName) => {
    if (typeName.toLowerCase().includes('cost of sales') || typeName.toLowerCase().includes('cos')) {
      return 'CoS';
    } else if (typeName.toLowerCase().includes('general') && typeName.toLowerCase().includes('administrative')) {
      return 'G&A';
    } else {
      return typeName.split(' ').map(word => word[0]).join('').toUpperCase();
    }
  };

  if (loading) {
    return (
      <Paper sx={{
        p: 4,
        width: { xs: '95vw', sm: '90vw', md: '80vw' },
        maxWidth: '1200px',
        borderRadius: '16px',
        bgcolor: 'white',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '200px'
      }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <CircularProgress size={40} />
          <Typography>Loading expenditure data...</Typography>
        </Box>
      </Paper>
    );
  }

  if (!recordData) {
    return (
      <Paper sx={{
        p: 4,
        width: { xs: '95vw', sm: '90vw', md: '80vw' },
        maxWidth: '1200px',
        borderRadius: '16px',
        bgcolor: 'white'
      }}>
        <Alert severity="error">
          Failed to load expenditure record data
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
      width: { xs: '95vw', sm: '90vw', md: '80vw' },
      maxWidth: '1200px',
      borderRadius: '16px',
      bgcolor: 'white'
    }}>
      <Typography variant="h5" sx={{ 
        color: '#182959',
        mb: 3,
        fontWeight: 'bold',
        textAlign: 'center'
      }}>
        Edit Expenditure Records
      </Typography>

      <Typography variant="h6" sx={{ 
        color: '#182959',
        mb: 3,
        textAlign: 'center'
      }}>
        {recordData.companyName} - {recordData.year}
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

      {/* Side-by-side type editing */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', md: 'repeat(auto-fit, minmax(400px, 1fr))' },
        gap: 3,
        mb: 2
      }}>
        {Object.keys(formData).map((typeName) => (
          <Box key={typeName} sx={{
            border: '2px solid #e0e0e0',
            borderRadius: 2,
            p: 3,
            backgroundColor: '#fafafa'
          }}>
            <Typography variant="h6" sx={{ 
              color: '#182959',
              mb: 2,
              fontWeight: 'bold',
              textAlign: 'center'
            }}>
              {typeName} ({getTypeAbbreviation(typeName)})
            </Typography>

            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr',
              gap: 2,
              mb: 2
            }}>
              <TextField
                label="Government Payments"
                value={formData[typeName]?.government || ''}
                onChange={handleChange(typeName, 'government')}
                type="number"
                size="medium"
                disabled={submitLoading}
                fullWidth
              />

              <TextField
                label="Local Supplier Spending"
                value={formData[typeName]?.localSupplierSpending || ''}
                onChange={handleChange(typeName, 'localSupplierSpending')}
                type="number"
                size="medium"
                disabled={submitLoading}
                fullWidth
              />

              <TextField
                label="Foreign Supplier Spending"
                value={formData[typeName]?.foreignSupplierSpending || ''}
                onChange={handleChange(typeName, 'foreignSupplierSpending')}
                type="number"
                size="medium"
                disabled={submitLoading}
                fullWidth
              />

              <TextField
                label="Employee Wages/Benefits"
                value={formData[typeName]?.employee || ''}
                onChange={handleChange(typeName, 'employee')}
                type="number"
                size="medium"
                disabled={submitLoading}
                fullWidth
              />

              <TextField
                label="Community Investments"
                value={formData[typeName]?.community || ''}
                onChange={handleChange(typeName, 'community')}
                type="number"
                size="medium"
                disabled={submitLoading}
                fullWidth
              />

              <TextField
                label="Depreciation"
                value={formData[typeName]?.depreciation || ''}
                onChange={handleChange(typeName, 'depreciation')}
                type="number"
                size="medium"
                disabled={submitLoading}
                fullWidth
              />

              <TextField
                label="Depletion"
                value={formData[typeName]?.depletion || ''}
                onChange={handleChange(typeName, 'depletion')}
                type="number"
                size="medium"
                disabled={submitLoading}
                fullWidth
              />

              <TextField
                label="Others"
                value={formData[typeName]?.others || ''}
                onChange={handleChange(typeName, 'others')}
                type="number"
                size="medium"
                disabled={submitLoading}
                fullWidth
              />
            </Box>

            <Divider sx={{ mb: 2 }} />
            
            <Typography variant="h6" sx={{ textAlign: 'center', color: '#2B8C37' }}>
              Total: ₱{(totalExpenditures[typeName] || 0).toLocaleString()}
            </Typography>
          </Box>
        ))}
      </Box>

      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center',
        gap: 2,
        mt: 2
      }}>
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
    </Paper>
  );
}

export default EditEconExpendituresModal;