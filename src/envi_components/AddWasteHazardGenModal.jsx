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
  InputLabel // ⬅️ Make sure this is imported
} from '@mui/material';
import api from '../services/api';

function AddWasteHazardGenModal({ onClose }) {
  const currentYear = new Date().getFullYear();
  const [formData, setFormData] = useState({
    year: currentYear, 
    quarter: '', // ⬅️ Initialize quarter
    company_id: '', // ⬅️ Initialize company
    metrics: '',
    waste_generated: '',
    unit_of_measurement: '', // Default unit
  });

  // State for dropdown options
  const [companies, setCompanies] = useState([]);
  const [metrics, setMetrics] = useState([]);
  const [units, setUnits] = useState([]);

  // Fetch companies on component mount
  useEffect(() => {
    fetchCompanies();
    fetchMetrics();
    fetchUnits();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await api.get('/reference/companies');
      setCompanies(response.data);
    } catch (error) {
      console.error('Error fetching companies:', error);
      alert('Failed to load companies');
    } finally {
      setLoadingCompanies(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      const response = await api.get('environment/distinct_haz_waste_generated');
      setMetrics(response.data);
    } catch (error) {
      console.error("Error fetching metrics options:", error);
    }
  };

  const fetchUnits = async () => {
    try {
      const response = await api.get('environment/distinct_hazard_waste_gen_unit');
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

  const handleSubmit = async (formData) => {
    console.log("Submitting form data:", formData);
    try {
      const selectedCompany = companies.find(company => company.id === formData.company_id);

      const payload = {
        company_id: selectedCompany?.company_id?.trim() || formData.company_id?.trim(),
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
          >
            {companies.map((company) => (
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
            label="Metrics"
            sx={{ height: '55px' }}
          >
            {metrics.map((option) => (
              <MenuItem key={option.metrics} value={option.metrics}>
                {option.metrics}
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
        gridTemplateColumns: '1fr 1fr',
        gap: 2,
        mb: 2
      }}>
         <TextField
          label="Waste Generated"
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
          onClick={() => handleSubmit(formData)}
        >
          ADD RECORD
        </Button>
      </Box>
    </Paper>
  );
}

export default AddWasteHazardGenModal;
