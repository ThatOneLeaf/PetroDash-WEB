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

function AddEnvironmentEnergyModal({ onClose }) {
  const currentYear = new Date().getFullYear();
  const [formData, setFormData] = useState({
    company_id: '', // ⬅️ Initialize company
    source: '',
    year: currentYear, 
    quarter: '', // ⬅️ Initialize quarter
    consumption: '',
    unit_of_measurement: 'kWh' // Default unit
  });

  // State for dropdown options
  const [companies, setCompanies] = useState([]);
  const [sources, setSources] = useState([]);
  const [units, setUnits] = useState([]);
  
  // State for confirmation modal, success modal, and error modal
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch companies on component mount
  useEffect(() => {
    fetchCompanies();
    fetchSources();
    fetchUnits();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await api.get('/reference/companies');
      setCompanies(response.data);
    } catch (error) {
      console.error('Error fetching companies:', error);
      alert('Failed to load companies');
    } 
  };

  const fetchSources = async () => {
    try {
      const response = await api.get('environment/distinct_electric_source');
      setSources(response.data);
    } catch (error) {
      console.error("Error fetching source options:", error);
    }
  };

  const fetchUnits = async () => {
    try {
      const response = await api.get('environment/distinct_electric_consumption_unit');
      setUnits(response.data);
    } catch (error) {
      console.error("Error fetching unit options:", error);
    }
  };

  const handleChange = (field) => (event) => {
    const newFormData = {
      ...formData,
      [field]: event.target.value
    };
    setFormData(newFormData);
  };

  const handleSubmitClick = () => {
    // Show confirmation modal instead of directly submitting
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    console.log("Submitting form data:", formData);
    try {
      const selectedCompany = companies.find(company => company.id === formData.company_id);

      const payload = {
        company_id: selectedCompany?.company_id?.trim() || formData.company_id?.trim(),
        source: formData.source?.trim(),
        unit_of_measurement: formData.unit_of_measurement?.trim(),
        consumption: parseFloat(formData.consumption),
        quarter: formData.quarter,
        year: parseInt(formData.year)
      };

      const response = await api.post(
        "/environment/single_upload_electric_consumption",
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

  // Get selected company name for display
  const selectedCompanyName = companies.find(company => company.id === formData.company_id)?.name || '';

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
            Energy - Electricity
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
              {companies.map((company) => (
                <MenuItem key={company.id} value={company.id}>
                  {company.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Source</InputLabel>
            <Select
              value={formData.source}
              onChange={handleChange('source')}
              label="Source"
              sx={{ height: '55px' }}
            >
              {sources.map((option) => (
                <MenuItem key={option.source} value={option.source}>
                  {option.source}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr',
          gap: 2,
          mb: 2
        }}>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Quarter</InputLabel>
            <Select
              value={formData.quarter}
              onChange={handleChange('quarter')}
              label="Quarter"
              sx={{ height: '55px' }}
            >
              {['Q1', 'Q2', 'Q3', 'Q4'].map((quarter) => (
                <MenuItem key={quarter} value={quarter}>
                  {quarter}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Year</InputLabel>
            <Select
              value={formData.year}
              onChange={handleChange('year')}
              label="Year"
              sx={{ height: '55px' }}
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
        <Box sx={{
          display: 'grid', 
          gap: 2,
          mb: 3
        }}>
           <TextField
            placeholder="Electricity Consumption"
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
            >
              {units.map((option) => (
                <MenuItem key={option.unit} value={option.unit}>
                  {option.unit}
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
              Are you sure you want to add this electricity consumption record?
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
                <strong>Source:</strong> {formData.source}
              </Typography>
              <Typography sx={{ fontSize: '0.9rem', mb: 1 }}>
                <strong>Period:</strong> {formData.quarter} {formData.year}
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
              Your electricity consumption record has been successfully added to the repository.
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

export default AddEnvironmentEnergyModal;