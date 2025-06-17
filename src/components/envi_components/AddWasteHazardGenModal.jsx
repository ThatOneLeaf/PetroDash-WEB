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

function AddWasteHazardGenModal({ onClose }) {
  const currentYear = new Date().getFullYear();
  const [formData, setFormData] = useState({
    year: currentYear, 
    quarter: '',
    company_id: '',
    metrics: '',
    waste_generated: '',
    unit_of_measurement: '',
  });

  // State for dropdown options
  const [dropdownOptions, setDropdownOptions] = useState({
    companies: [],
    metrics: [],
    units: []
  });

  // State for loading states
  const [loading, setLoading] = useState({
    companies: false,
    metrics: false,
    units: false
  });

  // State for modals
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch dropdown data on component mount
  useEffect(() => {
    fetchInitialDropdownData();
  }, []);

  // Fetch units when metrics changes
  useEffect(() => {
    if (formData.metrics) {
      fetchUnitsForMetrics(formData.metrics);
      // Reset unit selection when metrics changes
      setFormData(prev => ({
        ...prev,
        unit_of_measurement: ''
      }));
    } else {
      // Clear units when no metrics selected
      setDropdownOptions(prev => ({
        ...prev,
        units: []
      }));
    }
  }, [formData.metrics]);

  const fetchInitialDropdownData = async () => {
    try {
      // Set loading states
      setLoading({
        companies: true,
        metrics: true,
        units: false
      });

      // Fetch companies and metrics data
      const [companiesResponse, metricsResponse] = await Promise.all([
        api.get('reference/companies'),
        api.get('environment/distinct_haz_waste_generated')
      ]);

      setDropdownOptions({
        companies: companiesResponse.data || [],
        metrics: metricsResponse.data || [],
        units: []
      });

    } catch (error) {
      console.error('Error fetching dropdown data:', error);
      alert('Failed to load dropdown options. Please refresh the page.');
    } finally {
      // Reset loading states
      setLoading({
        companies: false,
        metrics: false,
        units: false
      });
    }
  };

  const fetchUnitsForMetrics = async (selectedMetrics) => {
    try {
      setLoading(prev => ({ ...prev, units: true }));

      const unitsResponse = await api.get('environment/distinct_hazard_waste_gen_unit', {
        params: { metrics: selectedMetrics }
      });

      setDropdownOptions(prev => ({
        ...prev,
        units: unitsResponse.data || []
      }));

    } catch (error) {
      console.error('Error fetching units for metrics:', error);
      alert('Failed to load unit options for selected metrics.');
    } finally {
      setLoading(prev => ({ ...prev, units: false }));
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
      const payload = {
        company_id: formData.company_id?.trim(),
        metrics: formData.metrics?.trim(),
        waste_generated: parseFloat(formData.waste_generated),
        unit_of_measurement: formData.unit_of_measurement?.trim(),
        quarter: formData.quarter,
        year: parseInt(formData.year)
      };

      const response = await api.post(
        "/environment/single_upload_hazard_waste_generated",
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
  const selectedCompanyName = dropdownOptions.companies.find(company => company.id === formData.company_id)?.name || '';

  return (
    <>
      <Paper sx={{
        p: 4,
        width: '600px',
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
            Waste - Hazard Generated
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
              disabled={loading.companies}
            >
              {dropdownOptions.companies.map((company) => (
                <MenuItem key={company.id} value={company.id}>
                  {company.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Metrics</InputLabel>
            <Select
              value={formData.metrics}
              onChange={handleChange('metrics')}
              label="Waste metrics"
              sx={{ height: '55px' }}
              disabled={loading.metrics}
            >
              {dropdownOptions.metrics.map((metric) => (
                <MenuItem key={metric.metrics} value={metric.metrics}>
                  {metric.metrics}
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
            placeholder="Waste Generated"
            value={formData.waste_generated}
            onChange={handleChange('waste_generated')}
            type="number"
          />

          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Unit of Measurement</InputLabel>
            <Select
              value={formData.unit_of_measurement}
              onChange={handleChange('unit_of_measurement')}
              label="Unit of Measurement"
              sx={{ height: '55px' }}
              disabled={loading.units || !formData.metrics}
            >
              {dropdownOptions.units.map((unitObj) => (
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
              Are you sure you want to add this hazard waste generation record?
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
                <strong>Metrics:</strong> {formData.metrics}
              </Typography>
              <Typography sx={{ fontSize: '0.9rem', mb: 1 }}>
                <strong>Period:</strong> {formData.quarter} {formData.year}
              </Typography>
              <Typography sx={{ fontSize: '0.9rem', mb: 1 }}>
                <strong>Waste Generated:</strong> {formData.waste_generated} {formData.unit_of_measurement}
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
              Your hazard waste generation record has been successfully added to the repository.
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

export default AddWasteHazardGenModal;