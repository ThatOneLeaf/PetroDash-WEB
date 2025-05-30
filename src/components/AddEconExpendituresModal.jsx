import { useState, useEffect } from 'react';
import { 
  Paper, 
  Typography, 
  TextField, 
  Button,
  Select,
  MenuItem,
  Box
} from '@mui/material';
import api from '../services/api';

function AddExpendituresModal({ onClose }) {
  const currentYear = new Date().getFullYear();
  const [companies, setCompanies] = useState([]);
  const [types, setTypes] = useState([]);
  
  const [formData, setFormData] = useState({
    comp: '',
    year: currentYear,
    type: '',
    government: '',
    localSuppl: '',
    foreignSupplierSpending: '',
    employee: '',
    community: '',
    depreciation: '',
    depletion: '',
    others: ''
  });

  const [totalExpenditure, setTotalExpenditure] = useState(0);

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
        
        // Set initial values
        setFormData(prev => ({
          ...prev,
          comp: companiesRes.data[0]?.id || '',
          type: typesRes.data[0]?.id || ''
        }));
      } catch (error) {
        console.error('Error fetching options:', error);
      }
    };

    fetchOptions();
  }, []);

  const calculateTotal = (data) => {
    const excludeFields = ['comp', 'year', 'type'];
    const values = Object.entries(data)
      .filter(([key]) => !excludeFields.includes(key))
      .map(([_, value]) => Number(value) || 0);
    const total = values.reduce((sum, value) => sum + value, 0);
    setTotalExpenditure(total);
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
      await api.post('/economic/expenditures', formData);
      onClose();
    } catch (error) {
      console.error('Error adding expenditure record:', error);
    }
  };

  return (
    <Paper 
      sx={{
        p: 4,
        width: '900px',
        borderRadius: '16px',
        bgcolor: 'white'
      }}
    >
      <Typography variant="h5" sx={{ 
        color: '#182959',
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
          value={formData.comp}
          onChange={handleChange('comp')}
          sx={{ height: '40px' }}
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

        <Select
          value={formData.type}
          onChange={handleChange('type')}
          sx={{ height: '40px' }}
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
          {types.map((type) => (
            <MenuItem 
              key={type.id} 
              value={type.id}
              sx={{
                whiteSpace: 'normal',
                wordBreak: 'break-word'
              }}
            >
              {type.name}
            </MenuItem>
          ))}
        </Select>

        <Select
          value={formData.year}
          onChange={handleChange('year')}
          sx={{ height: '40px' }}
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

        <TextField
          placeholder="Government Payments"
          value={formData.government}
          onChange={handleChange('government')}
          type="number"
        />

        <TextField
          placeholder="Local Supplier Spending"
          value={formData.localSuppl}
          onChange={handleChange('localSuppl')}
          type="number"
        />

        <TextField
          placeholder="Foreign Supplier Spending"
          value={formData.foreignSupplierSpending}
          onChange={handleChange('foreignSupplierSpending')}
          type="number"
        />

        <TextField
          placeholder="Employee Wages/Benefits"
          value={formData.employee}
          onChange={handleChange('employee')}
          type="number"
        />

        <TextField
          placeholder="Community Investments"
          value={formData.community}
          onChange={handleChange('community')}
          type="number"
        />

        <TextField
          placeholder="Depreciation"
          value={formData.depreciation}
          onChange={handleChange('depreciation')}
          type="number"
        />

        <TextField
          placeholder="Depletion"
          value={formData.depletion}
          onChange={handleChange('depletion')}
          type="number"
        />

        <TextField
          placeholder="Others"
          value={formData.others}
          onChange={handleChange('others')}
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
          Total Expenditures: {totalExpenditure.toLocaleString()}
        </Typography>
        <Button
          variant="contained"
          onClick={handleSubmit}
          sx={{ 
            bgcolor: '#2B8C37',
            '&:hover': { bgcolor: '#1b5e20' }
          }}
        >
          ADD
        </Button>
      </Box>
    </Paper>
  );
}

export default AddExpendituresModal;
