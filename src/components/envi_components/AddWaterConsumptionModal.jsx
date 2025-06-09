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
  CircularProgress
} from '@mui/material';
import api from '../../services/api';

function AddWaterConsumptionModal({ onClose }) {
  const currentYear = new Date().getFullYear();
  const [formData, setFormData] = useState({
    company_id: '',
    year: currentYear, 
    quarter: '',
    volume: '',
    unit_of_measurement: ''
  });

  const [companies, setCompanies] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch companies and units on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [companiesResponse, unitsResponse] = await Promise.all([
          api.get('/reference/companies'),
          api.get('/environment/distinct_water_unit')
        ]);
        
        setCompanies(companiesResponse.data);
        setUnits(unitsResponse.data);
        
        // Set default unit if available
        if (unitsResponse.data.length > 0) {
          setFormData(prev => ({
            ...prev,
            unit_of_measurement: unitsResponse.data[0].unit
          }));
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        alert('Error loading form data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
        quarter: formData.quarter,
        year: parseInt(formData.year),
        volume: parseFloat(formData.volume),
        unit_of_measurement: formData.unit_of_measurement?.trim(),
      };

      const response = await api.post(
        "/environment/single_upload_water_consumption",
        payload
      );

      alert(response.data.message);
      onClose();
    } catch (error) {
      console.error("Error uploading single record:", error);
      alert(error?.response?.data?.detail || "Add Record Failed.");
    }
  };

  if (loading) {
    return (
      <Paper sx={{ p: 4, width: '500px', borderRadius: '16px', bgcolor: 'white', display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <CircularProgress />
      </Paper>
    );
  }

  return (
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
          Water - Consumption
        </Typography>
      </Box>

      <Box sx={{
        display: 'grid', 
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
          placeholder="Water Volume"
          value={formData.volume}
          onChange={handleChange('volume')}
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
            {units.map((unitItem) => (
              <MenuItem key={unitItem.unit} value={unitItem.unit}>
                {unitItem.unit}
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

export default AddWaterConsumptionModal;