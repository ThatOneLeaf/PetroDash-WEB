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
  InputLabel,
  Divider
} from '@mui/material';
import api from '../../../services/api';
import ConfirmOverwriteModal from '../../../components/ConfirmOverwriteModal';

function AddExpendituresModal({ onClose }) {
  const currentYear = new Date().getFullYear();
  const [companies, setCompanies] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showOverwriteModal, setShowOverwriteModal] = useState(false);
  const [existingRecords, setExistingRecords] = useState([]);

  // Form data for both types
  const [formData, setFormData] = useState({
    comp: '',
    year: currentYear,
    types: {} // Will be populated when types are loaded
  });

  const [totalExpenditures, setTotalExpenditures] = useState({});

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
        
        // Initialize form data for both types
        const initialTypes = {};
        typesRes.data.forEach(type => {
          initialTypes[type.name] = {
            government: '',
            localSupplierSpending: '',
            foreignSupplierSpending: '',
            employee: '',
            community: '',
            depreciation: '',
            depletion: '',
            others: ''
          };
        });
        
        setFormData(prev => ({
          ...prev,
          comp: companiesRes.data[0]?.id || '',
          types: initialTypes
        }));
      } catch (error) {
        console.error('Error fetching options:', error);
        setError('Failed to load companies and expenditure types');
      }
    };

    fetchOptions();
  }, []);

  // Calculate totals for each type
  useEffect(() => {
    const newTotals = {};
    Object.keys(formData.types || {}).forEach(typeName => {
      const data = formData.types[typeName];
      const values = Object.values(data).map(value => Number(value) || 0);
      newTotals[typeName] = values.reduce((sum, value) => sum + value, 0);
    });
    setTotalExpenditures(newTotals);
  }, [formData.types]);

  const handleBasicChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    
    // Clear any previous errors/success messages
    setError('');
    setSuccess('');
  };

  const handleTypeChange = (typeName, field) => (event) => {
    setFormData(prev => ({
      ...prev,
      types: {
        ...prev.types,
        [typeName]: {
          ...prev.types[typeName],
          [field]: event.target.value
        }
      }
    }));
    
    // Clear any previous errors/success messages
    setError('');
    setSuccess('');
  };

  const checkExistingRecords = async () => {
    try {
      const existingChecks = [];
      
      // Check each type for existing records
      for (const typeName of Object.keys(formData.types)) {
        const typeId = types.find(t => t.name === typeName)?.id;
        if (typeId) {
          try {
            const response = await api.get(`/economic/check-expenditure/${formData.comp}/${formData.year}/${typeId}`);
            if (response.data.exists) {
              existingChecks.push(typeName);
            }
          } catch (error) {
            console.error(`Error checking existing record for ${typeName}:`, error);
          }
        }
      }
      
      return existingChecks;
    } catch (error) {
      console.error('Error checking existing records:', error);
      return [];
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      // Check if any records already exist
      const existingRecordTypes = await checkExistingRecords();
      
      if (existingRecordTypes.length > 0) {
        setExistingRecords(existingRecordTypes);
        setLoading(false);
        setShowOverwriteModal(true);
        return;
      }
      
      // Proceed with creation if no existing records
      await createRecords();
      
    } catch (error) {
      setLoading(false);
      console.error('Error in handleSubmit:', error);
      setError(
        error.response?.data?.detail || 
        error.message || 
        'An error occurred while creating the expenditure records'
      );
    }
  };

  const createRecords = async () => {
    try {
      console.log('Submitting expenditure data:', formData);
      
      // Create both records simultaneously
      const createPromises = Object.keys(formData.types).map(typeName => {
        const typeId = types.find(t => t.name === typeName)?.id;
        const data = formData.types[typeName];
        
        return api.post('/economic/expenditures', {
          comp: formData.comp,
          year: formData.year,
          type: typeId,
          government: data.government || 0,
          localSupplierSpending: data.localSupplierSpending || 0,
          foreignSupplierSpending: data.foreignSupplierSpending || 0,
          employee: data.employee || 0,
          community: data.community || 0,
          depreciation: data.depreciation || 0,
          depletion: data.depletion || 0,
          others: data.others || 0
        });
      });
      
      await Promise.all(createPromises);
      
      setSuccess('Expenditure records created successfully!');
      
      // Close modal after a short delay to show success message
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (error) {
      console.error('Error adding expenditure records:', error);
      setError(
        error.response?.data?.detail || 
        error.message || 
        'An error occurred while creating the expenditure records'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOverwriteConfirm = async () => {
    setShowOverwriteModal(false);
    setLoading(true);
    await createRecords();
  };

  const handleOverwriteCancel = () => {
    setShowOverwriteModal(false);
    setExistingRecords([]);
    setLoading(false);
  };

  const isFormValid = () => {
    return formData.comp && formData.year && 
           Object.keys(formData.types || {}).some(typeName => {
             const data = formData.types[typeName];
             return Object.values(data).some(value => value !== '' && Number(value) > 0);
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

  return (
    <Paper sx={{
      p: 3,
      width: { xs: '95vw', sm: '90vw', md: '80vw' },
      maxWidth: '1200px',
      borderRadius: '16px',
      bgcolor: 'white',
      maxHeight: '90vh',
      overflow: 'auto'
    }}>
      <Typography variant="h5" sx={{ 
        color: '#182959',
        mb: 2,
        fontWeight: 'bold',
        textAlign: 'center'
      }}>
        Add New Expenditure Records
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

      {/* Company and Year Selection */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
        gap: 2,
        mb: 3,
        p: 2,
        border: '2px solid #e0e0e0',
        borderRadius: 2,
        backgroundColor: '#fafafa'
      }}>
        <FormControl fullWidth>
          <InputLabel id="company-label">Company</InputLabel>
          <Select
            labelId="company-label"
            value={formData.comp}
            onChange={handleBasicChange('comp')}
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
          <InputLabel id="year-label">Year</InputLabel>
          <Select
            labelId="year-label"
            value={formData.year}
            onChange={handleBasicChange('year')}
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
      </Box>

      {/* Side-by-side type editing */}
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: { xs: '1fr', md: 'repeat(auto-fit, minmax(400px, 1fr))' },
        gap: 2,
        mb: 1
      }}>
        {Object.keys(formData.types || {}).map((typeName) => (
          <Box key={typeName} sx={{
            border: '2px solid #e0e0e0',
            borderRadius: 2,
            p: 2,
            backgroundColor: '#fafafa'
          }}>
            <Typography variant="h6" sx={{ 
              color: '#182959',
              mb: 1.5,
              fontWeight: 'bold',
              textAlign: 'center'
            }}>
              {typeName} ({getTypeAbbreviation(typeName)})
            </Typography>

            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr',
              gap: 1.5,
              mb: 1.5
            }}>
              <TextField
                label="Government Payments"
                value={formData.types[typeName]?.government || ''}
                onChange={handleTypeChange(typeName, 'government')}
                type="number"
                size="medium"
                disabled={loading}
                fullWidth
                onKeyDown={(e) => {
                  if (e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-') {
                    e.preventDefault();
                  }
                }}
              />

              <TextField
                label="Local Supplier Spending"
                value={formData.types[typeName]?.localSupplierSpending || ''}
                onChange={handleTypeChange(typeName, 'localSupplierSpending')}
                type="number"
                size="medium"
                disabled={loading}
                fullWidth
                onKeyDown={(e) => {
                  if (e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-') {
                    e.preventDefault();
                  }
                }}
              />

              <TextField
                label="Foreign Supplier Spending"
                value={formData.types[typeName]?.foreignSupplierSpending || ''}
                onChange={handleTypeChange(typeName, 'foreignSupplierSpending')}
                type="number"
                size="medium"
                disabled={loading}
                fullWidth
                onKeyDown={(e) => {
                  if (e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-') {
                    e.preventDefault();
                  }
                }}
              />

              <TextField
                label="Employee Wages/Benefits"
                value={formData.types[typeName]?.employee || ''}
                onChange={handleTypeChange(typeName, 'employee')}
                type="number"
                size="medium"
                disabled={loading}
                fullWidth
                onKeyDown={(e) => {
                  if (e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-') {
                    e.preventDefault();
                  }
                }}
              />

              <TextField
                label="Community Investments"
                value={formData.types[typeName]?.community || ''}
                onChange={handleTypeChange(typeName, 'community')}
                type="number"
                size="medium"
                disabled={loading}
                fullWidth
                onKeyDown={(e) => {
                  if (e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-') {
                    e.preventDefault();
                  }
                }}
              />

              <TextField
                label="Depreciation"
                value={formData.types[typeName]?.depreciation || ''}
                onChange={handleTypeChange(typeName, 'depreciation')}
                type="number"
                size="medium"
                disabled={loading}
                fullWidth
                onKeyDown={(e) => {
                  if (e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-') {
                    e.preventDefault();
                  }
                }}
              />

              <TextField
                label="Depletion"
                value={formData.types[typeName]?.depletion || ''}
                onChange={handleTypeChange(typeName, 'depletion')}
                type="number"
                size="medium"
                disabled={loading}
                fullWidth
                onKeyDown={(e) => {
                  if (e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-') {
                    e.preventDefault();
                  }
                }}
              />

              <TextField
                label="Others"
                value={formData.types[typeName]?.others || ''}
                onChange={handleTypeChange(typeName, 'others')}
                type="number"
                size="medium"
                disabled={loading}
                fullWidth
                onKeyDown={(e) => {
                  if (e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '-') {
                    e.preventDefault();
                  }
                }}
              />
            </Box>

            <Divider sx={{ mb: 1 }} />
            
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
        mt: 1
      }}>
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

      {showOverwriteModal && (
        <ConfirmOverwriteModal
          isOpen={showOverwriteModal}
          onConfirm={handleOverwriteConfirm}
          onCancel={handleOverwriteCancel}
          recordType="Expenditure"
          recordDetails={`Company ${formData.comp}, Year ${formData.year} (${existingRecords.join(', ')})`}
          title={`${existingRecords.length > 1 ? 'Records' : 'Record'} Already Exist`}
        />
      )}
    </Paper>
  );
}

export default AddExpendituresModal; 