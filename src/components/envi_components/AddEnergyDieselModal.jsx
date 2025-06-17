import { useState, useEffect } from 'react';
import { 
  Paper, 
  Typography, 
  TextField, 
  Button,
  Select,
  MenuItem,
  Box,
  FormControl,
  InputLabel,
  Modal // ⬅️ Add Modal import
} from '@mui/material';
import api from '../../services/api';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

function AddEnvironmentDieselModal({ onClose }) {
  const currentYear = new Date().getFullYear();
  const [formData, setFormData] = useState({
    company_id: '',
    cp_id: '',
    consumption: '',
    unit_of_measurement: '',
    date: '',
  });

  // State for dropdown options
  const [companies, setCompanies] = useState([]);
  const [companyProperties, setCompanyProperties] = useState([]);
  const [units, setUnits] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [loadingUnits, setLoadingUnits] = useState(true);

  // State for modals
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch companies and units on component mount
  useEffect(() => {
    fetchCompanies();
    fetchUnits();
  }, []);

  // Fetch company properties when company changes
  useEffect(() => {
    if (formData.company_id) {
      // Find the selected company name
      const selectedCompany = companies.find(company => company.id === formData.company_id);
      if (selectedCompany) {
        fetchCompanyProperties(selectedCompany.name);
      }
    } else {
      // Clear company properties if no company selected
      setCompanyProperties([]);
      setFormData(prev => ({ ...prev, cp_id: '' })); // Reset company property selection
    }
  }, [formData.company_id, companies]);

  const fetchCompanies = async () => {
    try {
      setLoadingCompanies(true);
      const response = await api.get('/reference/companies');
      setCompanies(response.data);
    } catch (error) {
      console.error('Error fetching companies:', error);
      alert('Failed to load companies');
    } finally {
      setLoadingCompanies(false);
    }
  };

  const fetchCompanyProperties = async (companyName) => {
    try {
      setLoadingProperties(true);
      const response = await api.get(`/environment/distinct_cp_names/${encodeURIComponent(companyName)}`);
      setCompanyProperties(response.data);
    } catch (error) {
      console.error('Error fetching company properties:', error);
      alert('Failed to load company properties');
      setCompanyProperties([]);
    } finally {
      setLoadingProperties(false);
    }
  };

  const fetchUnits = async () => {
    try {
      setLoadingUnits(true);
      const response = await api.get('/environment/distinct_diesel_consumption_unit');
      setUnits(response.data);
      
      // Set default unit if available
      if (response.data.length > 0) {
        setFormData(prev => ({ 
          ...prev, 
          unit_of_measurement: response.data[0].unit 
        }));
      }
    } catch (error) {
      console.error('Error fetching units:', error);
      alert('Failed to load units of measurement');
    } finally {
      setLoadingUnits(false);
    }
  };

  const handleChange = (field) => (event) => {
    const newFormData = {
      ...formData,
      [field]: event.target.value
    };
    
    // If company changes, reset company property
    if (field === 'company_id') {
      newFormData.cp_id = '';
    }
    
    setFormData(newFormData);
  };

  const handleSubmitClick = () => {
    // Show confirmation modal instead of directly submitting
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    console.log("Submitting form data:", formData);
    try {
      // Find the selected company name for submission
      const selectedCompany = companies.find(company => company.id === formData.company_id);
      const selectedProperty = companyProperties.find(prop => prop.cp_id === formData.cp_id);
      
      const payload = {
        company_id: selectedCompany?.company_id?.trim() || formData.company_id?.trim(),
        cp_id: selectedProperty?.cp_id?.trim() || formData.cp_id?.trim(),
        unit_of_measurement: formData.unit_of_measurement?.trim(),
        consumption: parseFloat(formData.consumption),
        date: formData.date,
      };

      const response = await api.post(
        "/environment/single_upload_diesel_consumption",
        payload
      );

      setShowConfirmModal(false); // Close confirmation modal
      setShowSuccessModal(true); // Show success modal
    } catch (error) {
      console.error("Error uploading single record:", error);
      const errorMsg = error?.response?.data?.detail || "Add Record Failed. Please check your data and try again.";
      setErrorMessage(errorMsg);
      setShowConfirmModal(false); // Close confirmation modal
      setShowErrorModal(true); // Show error modal
    }
  };

  const handleCancelConfirm = () => {
    setShowConfirmModal(false);
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    onClose(); // Close main modal after success
  };

  const handleErrorClose = () => {
    setShowErrorModal(false);
    // Don't close main modal, allow user to fix the data
  };

  // Get selected company and property names for display
  const selectedCompanyName = companies.find(company => company.id === formData.company_id)?.name || '';
  const selectedPropertyName = companyProperties.find(prop => prop.cp_id === formData.cp_id)?.cp_name || '';

  return (
    <>
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
              disabled={loadingCompanies}
            >
              {companies.map((company) => (
                <MenuItem key={company.id} value={company.id}>
                  {company.name}
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
              disabled={!formData.company_id || loadingProperties}
            >
              {companyProperties.map((property) => (
                <MenuItem key={property.cp_id} value={property.cp_id}>
                  {property.cp_name}
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
            onChange={(event) => {
              const value = event.target.value;
              // Allow empty string for clearing the field
              if (value === '') {
                setFormData(prev => ({ ...prev, consumption: '' }));
                return;
              }
              
              // Check if value contains only numbers and decimal point
              const isValidInput = /^[0-9]*\.?[0-9]*$/.test(value);
              
              if (isValidInput) {
                const numValue = parseFloat(value);
                // Allow partial decimal input (like "0." or ".5") but prevent zero and negative
                if (value.includes('.') && (value.endsWith('.') || numValue > 0)) {
                  setFormData(prev => ({ ...prev, consumption: value }));
                } else if (!value.includes('.') && numValue > 0) {
                  setFormData(prev => ({ ...prev, consumption: value }));
                }
              }
            }}
            inputProps={{
              inputMode: 'decimal',
              pattern: '[0-9]*[.,]?[0-9]*'
            }}
          />

          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Unit of Measurement</InputLabel>
            <Select
              value={formData.unit_of_measurement}
              onChange={handleChange('unit_of_measurement')}
              label="Unit of Measurement"
              sx={{ height: '55px' }}
              disabled={loadingUnits}
            >
              {units.map((unitObj) => (
                <MenuItem key={unitObj.unit} value={unitObj.unit}>
                  {unitObj.unit}
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
              borderRadius: '999px',
              padding: '9px 18px',
              fontSize: '1rem',
              fontWeight: 'bold',
              '&:hover': {
                backgroundColor: '#256d2f',
              },
            }}
            onClick={handleSubmitClick}
          >
            ADD RECORD
          </Button>
        </Box>
      </Paper>

      {/* Confirmation Modal */}
      <Modal
        open={showConfirmModal}
        onClose={handleCancelConfirm}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper sx={{
          p: 4,
          width: '400px',
          borderRadius: '16px',
          bgcolor: 'white',
          outline: 'none'
        }}>
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: 3
          }}>
            <Typography sx={{ 
              fontSize: '1.5rem', 
              fontWeight: 800,
              color: '#182959',
              mb: 2,
              textAlign: 'center'
            }}>
              Confirm Record Addition
            </Typography>
            <Typography sx={{ 
              fontSize: '1rem',
              textAlign: 'center',
              mb: 2
            }}>
              Are you sure you want to add this diesel consumption record?
            </Typography>
            
            {/* Display form data summary */}
            <Box sx={{ 
              bgcolor: '#f5f5f5', 
              p: 2, 
              borderRadius: '8px',
              width: '100%',
              mb: 3
            }}>
              <Typography sx={{ fontSize: '0.9rem', mb: 1 }}>
                <strong>Company:</strong> {selectedCompanyName}
              </Typography>
              <Typography sx={{ fontSize: '0.9rem', mb: 1 }}>
                <strong>Property:</strong> {selectedPropertyName}
              </Typography>
              <Typography sx={{ fontSize: '0.9rem', mb: 1 }}>
                <strong>Date:</strong> {formData.date}
              </Typography>
              <Typography sx={{ fontSize: '0.9rem', mb: 1 }}>
                <strong>Consumption:</strong> {formData.consumption} {formData.unit_of_measurement}
              </Typography>
            </Box>
          </Box>

          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            gap: 2,
            mt: 3
          }}>
            <Button
              variant="outlined"
              sx={{ 
                borderColor: '#ccc',
                color: '#666',
                borderRadius: '999px',
                padding: '8px 16px',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                '&:hover': {
                  borderColor: '#999',
                  backgroundColor: '#f5f5f5',
                },
              }}
              onClick={handleCancelConfirm}
            >
              CANCEL
            </Button>
            <Button
              variant="contained"
              sx={{ 
                backgroundColor: '#2B8C37',
                borderRadius: '999px',
                padding: '8px 16px',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                '&:hover': {
                  backgroundColor: '#256d2f',
                },
              }}
              onClick={handleConfirmSubmit}
            >
              CONFIRM
            </Button>
          </Box>
        </Paper>
      </Modal>

      {/* Success Modal */}
      <Modal
        open={showSuccessModal}
        onClose={handleSuccessClose}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper sx={{
          p: 4,
          width: '400px',
          borderRadius: '16px',
          bgcolor: 'white',
          outline: 'none',
          textAlign: 'center'
        }}>
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: 3
          }}>
            {/* Success Icon */}
            <Box sx={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: '#2B8C37',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2
            }}>
              <Typography sx={{ 
                color: 'white', 
                fontSize: '2rem',
                fontWeight: 'bold'
              }}>
                ✓
              </Typography>
            </Box>

            <Typography sx={{ 
              fontSize: '1.5rem', 
              fontWeight: 800,
              color: '#182959',
              mb: 2
            }}>
              Record Added Successfully!
            </Typography>
            
            <Typography sx={{ 
              fontSize: '1rem',
              color: '#666',
              mb: 3
            }}>
              Your diesel consumption record has been successfully added to the repository.
            </Typography>
          </Box>

          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            mt: 3
          }}>
            <Button
              variant="contained"
              sx={{ 
                backgroundColor: '#2B8C37',
                borderRadius: '999px',
                padding: '10px 24px',
                fontSize: '1rem',
                fontWeight: 'bold',
                '&:hover': {
                  backgroundColor: '#256d2f',
                },
              }}
              onClick={handleSuccessClose}
            >
              OK
            </Button>
          </Box>
        </Paper>
      </Modal>

      {/* Error Modal */}
      <Modal
        open={showErrorModal}
        onClose={handleErrorClose}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper sx={{
          p: 4,
          width: '400px',
          borderRadius: '16px',
          bgcolor: 'white',
          outline: 'none',
          textAlign: 'center'
        }}>
          <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: 3
          }}>
            {/* Error Icon */}
            <Box sx={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: '#dc3545',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2
            }}>
              <Typography sx={{ 
                color: 'white', 
                fontSize: '2rem',
                fontWeight: 'bold'
              }}>
                ✕
              </Typography>
            </Box>

            <Typography sx={{ 
              fontSize: '1.5rem', 
              fontWeight: 800,
              color: '#182959',
              mb: 2
            }}>
              Error Adding Record
            </Typography>
            
            <Typography sx={{ 
              fontSize: '1rem',
              color: '#666',
              mb: 3,
              textAlign: 'center'
            }}>
              {errorMessage}
            </Typography>
          </Box>

          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            mt: 3
          }}>
            <Button
              variant="contained"
              sx={{ 
                backgroundColor: '#dc3545',
                borderRadius: '999px',
                padding: '10px 24px',
                fontSize: '1rem',
                fontWeight: 'bold',
                '&:hover': {
                  backgroundColor: '#c82333',
                },
              }}
              onClick={handleErrorClose}
            >
              OK
            </Button>
          </Box>
        </Paper>
      </Modal>
    </>
  );
}

export default AddEnvironmentDieselModal;