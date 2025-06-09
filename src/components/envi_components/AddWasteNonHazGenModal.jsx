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
  InputLabel
} from '@mui/material';
import api from '../services/api';

function AddWasteNonHazGenModal({ onClose }) {
  const currentYear = new Date().getFullYear();
  const [formData, setFormData] = useState({
    year: currentYear, 
    quarter: '',
    company_id: '',
    month: '',
    metrics: '',
    waste: '',
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
        api.get('environment/distinct_non_haz_waste_metrics')
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

      const unitsResponse = await api.get('environment/distinct_non_haz_waste_unit', {
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

  const handleSubmit = async (formData) => {
    console.log("Submitting form data:", formData);
    try {
      const payload = {
        company_id: formData.company_id?.trim(),
        metrics: formData.metrics?.trim(),
        waste: parseFloat(formData.waste),
        unit_of_measurement: formData.unit_of_measurement?.trim(),
        month: formData.month?.trim(),
        quarter: formData.quarter,
        year: parseInt(formData.year)
      };

      const response = await api.post(
        "/environment/single_upload_non_hazard_waste",
        payload
      );

      alert(response.data.message);
      onClose(); // Close modal if needed
    } catch (error) {
      console.error("Error uploading single record:", error);
      alert(error?.response?.data?.detail || "Add Record Failed.");
    }
  };

  return (
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
          Waste - Non-Hazard Generated
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
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: 2,
        mb: 2
      }}>
        <FormControl sx={{ minWidth: 120 }}>
        <InputLabel>Month</InputLabel>
          <Select
            value={formData.month}
            onChange={handleChange('month')}
            label="Month"
            sx={{ height: '55px' }}
          >
            {['January', 'February', 'March', 'April', 'May', 'June',
              'July', 'August', 'September', 'October', 'November', 'December'
            ].map((month) => (
              <MenuItem key={month} value={month}>
                {month}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
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
          value={formData.waste}
          onChange={handleChange('waste')}
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
          onClick={() => handleSubmit(formData)}
        >
          ADD RECORD
        </Button>
      </Box>
    </Paper>
  );
}

export default AddWasteNonHazGenModal;