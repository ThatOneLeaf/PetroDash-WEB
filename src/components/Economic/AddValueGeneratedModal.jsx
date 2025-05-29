import { useState } from 'react';
import { 
  Paper, 
  Typography, 
  TextField, 
  Button,
  Select,
  MenuItem,
  Box
} from '@mui/material';
import api from '../../services/api';

function AddValueGeneratedModal({ onClose }) {
  const currentYear = new Date().getFullYear();
  const [formData, setFormData] = useState({
    year: currentYear,
    electricitySales: '',
    oilRevenues: '',
    otherRevenues: '',
    interestIncome: '',
    shareInNetIncomeOfAssociate: '',
    miscellaneousIncome: ''
  });

  const [totalRevenue, setTotalRevenue] = useState(0);

  // Calculate total revenue whenever form data changes
  const calculateTotal = (data) => {
    const values = Object.values(data).filter((value, index) => index !== 0); // Exclude year
    const total = values.reduce((sum, value) => sum + (Number(value) || 0), 0);
    setTotalRevenue(total);
  };

  const handleChange = (field) => (event) => {
    const newFormData = {
      ...formData,
      [field]: event.target.value
    };
    setFormData(newFormData);
    calculateTotal(newFormData);
  };

  const handleSubmit = async () => {
    try {
      await api.post('/economic/value-generated', formData);
      onClose();
      // You might want to refresh the data after adding
    } catch (error) {
      console.error('Error adding record:', error);
    }
  };

  return (
    <Paper sx={{
      p: 4,
      width: '600px',
      borderRadius: '16px',
      bgcolor: 'white'
    }}>
      <Typography variant="h5" sx={{ 
        color: '#1a237e',
        mb: 3,
        fontWeight: 'bold' 
      }}>
        Add New Record
      </Typography>

      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 1fr',
        gap: 2,
        mb: 3
      }}>
        <Select
          value={formData.year}
          onChange={handleChange('year')}
          sx={{ height: '40px' }}
        >
          {[...Array(10)].map((_, i) => (
            <MenuItem key={currentYear - i} value={currentYear - i}>
              {currentYear - i}
            </MenuItem>
          ))}
        </Select>

        <TextField
          placeholder="Electricity Sales"
          value={formData.electricitySales}
          onChange={handleChange('electricitySales')}
          type="number"
        />

        <TextField
          placeholder="Oil Revenues"
          value={formData.oilRevenues}
          onChange={handleChange('oilRevenues')}
          type="number"
        />

        <TextField
          placeholder="Other Revenues"
          value={formData.otherRevenues}
          onChange={handleChange('otherRevenues')}
          type="number"
        />

        <TextField
          placeholder="Interest Income"
          value={formData.interestIncome}
          onChange={handleChange('interestIncome')}
          type="number"
        />

        <TextField
          placeholder="Share in Net Income of Associate"
          value={formData.shareInNetIncomeOfAssociate}
          onChange={handleChange('shareInNetIncomeOfAssociate')}
          type="number"
        />

        <TextField
          placeholder="Miscellaneous Income"
          value={formData.miscellaneousIncome}
          onChange={handleChange('miscellaneousIncome')}
          type="number"
        />
      </Box>

      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        mt: 2 
      }}>
        <Typography variant="h6">
          Total Revenue: {totalRevenue.toLocaleString()}
        </Typography>
        <Button
          variant="contained"
          onClick={handleSubmit}
          sx={{ 
            bgcolor: '#2E7D32',
            '&:hover': { bgcolor: '#1b5e20' }
          }}
        >
          ADD
        </Button>
      </Box>
    </Paper>
  );
}

export default AddValueGeneratedModal; 