import { useState } from 'react';
import Overlay from '../modal';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  IconButton,
  Divider,
  InputAdornment
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import BusinessIcon from '@mui/icons-material/Business';
import CategoryIcon from '@mui/icons-material/Category';
import AssignmentIcon from '@mui/icons-material/Assignment';
import GroupIcon from '@mui/icons-material/Group';
import PaidIcon from '@mui/icons-material/Paid';
import api from '../../services/api';

function AddRecordModalHelp({
  open,
  onClose,
  onAdd,
  programOptions = [],
  projectOptions = {},
  yearOptions = [],
  companyOptions = [],
}) {
  const [year, setYear] = useState('');
  const [company, setCompany] = useState('');
  const [program, setProgram] = useState('');
  const [project, setProject] = useState('');
  const [beneficiaries, setBeneficiaries] = useState('');
  const [amountInvested, setAmountInvested] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/help/activities', {
        // Map to API/database fields
        company_id: company,
        project_id: project,
        project_year: year,
        csr_report: beneficiaries,
        project_expenses: amountInvested,
      });
      if (onAdd) onAdd();
      onClose();
      setYear('');
      setCompany('');
      setProgram('');
      setProject('');
      setBeneficiaries('');
      setAmountInvested('');
    } catch (err) {
      // handle error (show message, etc.)
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <Overlay onClose={onClose}>
      <Box
        sx={{
          bgcolor: '#f7f9fb',
          borderRadius: '20px',
          boxShadow: 6,
          p: 0,
          width: '520px',
          position: 'relative',
        }}
      >
        {/* Close Button */}
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 2,
            color: '#182959',
            background: '#e3e6f0',
            '&:hover': { background: '#d1d6e6' }
          }}
          aria-label="Close"
        >
          <CloseIcon />
        </IconButton>
        {/* Header */}
        <Box sx={{ px: 4, pt: 3, pb: 1 }}>
          <Typography sx={{fontSize: '1rem',fontWeight: 800, letterSpacing: 1}}>
            ADD NEW RECORD
          </Typography>
          <Typography
            sx={{
              fontSize: '2.2rem',
              color: '#182959',
              fontWeight: 800,
              mb: 1,
              lineHeight: 1,
              letterSpacing: 1
            }}
          >
            Social - H.E.L.P
          </Typography>
        </Box>
        <Divider sx={{ mb: 0.5 }} />
        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Box
            sx={{
              px: 4,
              pb: 4,
              pt: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              background: '#fff',
              borderRadius: '0 0 20px 20px'
            }}
          >
            {/* Row 1: Year & Company */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                select
                label="Year"
                value={year}
                onChange={e => setYear(e.target.value)}
                fullWidth
                required
                placeholder="Year"
                helperText="Select the project year"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarMonthIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  background: '#f7f9fb',
                  borderRadius: 2,
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': { borderColor: '#2B8C37' },
                    '&.Mui-focused fieldset': { borderColor: '#2B8C37' }
                  }
                }}
              >
                {yearOptions.map(opt => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Company"
                value={company}
                onChange={e => setCompany(e.target.value)}
                fullWidth
                required
                placeholder="Company"
                helperText="Select the company"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <BusinessIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  background: '#f7f9fb',
                  borderRadius: 2,
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': { borderColor: '#2B8C37' },
                    '&.Mui-focused fieldset': { borderColor: '#2B8C37' }
                  }
                }}
              >
                {companyOptions.map(opt => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </TextField>
            </Box>
            {/* Row 2: Program & Project */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                select
                label="Program"
                value={program}
                onChange={e => {
                  setProgram(e.target.value);
                  setProject('');
                }}
                fullWidth
                required
                placeholder="Program"
                helperText="Select the program"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CategoryIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  background: '#f7f9fb',
                  borderRadius: 2,
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': { borderColor: '#2B8C37' },
                    '&.Mui-focused fieldset': { borderColor: '#2B8C37' }
                  }
                }}
              >
                {programOptions.map(opt => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label="Project"
                value={project}
                onChange={e => setProject(e.target.value)}
                fullWidth
                required
                disabled={!program}
                placeholder="Project"
                helperText={program ? "Select the project" : "Select a program first"}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <AssignmentIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  background: program ? '#f7f9fb' : '#f0f0f0',
                  borderRadius: 2,
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': { borderColor: '#2B8C37' },
                    '&.Mui-focused fieldset': { borderColor: '#2B8C37' }
                  }
                }}
              >
                {(projectOptions[program] || []).map(opt => (
                  <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                ))}
              </TextField>
            </Box>
            {/* Row 3: Beneficiaries */}
            <TextField
              label="Beneficiaries"
              type="text"
              value={beneficiaries}
              onChange={e => setBeneficiaries(e.target.value.replace(/[^0-9]/g, ''))}
              fullWidth
              required
              inputProps={{ inputMode: 'numeric', pattern: '[0-9]*' }}
              placeholder="Beneficiaries"
              helperText="Enter the number of beneficiaries"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <GroupIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{
                background: '#f7f9fb',
                borderRadius: 2,
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': { borderColor: '#2B8C37' },
                  '&.Mui-focused fieldset': { borderColor: '#2B8C37' }
                }
              }}
            />
            {/* Row 4: Amount Invested */}
            <TextField
              label="Amount Invested"
              type="text"
              value={amountInvested}
              onChange={e => setAmountInvested(e.target.value.replace(/[^0-9.]/g, ''))}
              fullWidth
              required
              inputProps={{ inputMode: 'decimal', pattern: '[0-9.]*' }}
              placeholder="Amount Invested"
              helperText="Enter the total investment (₱)"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PaidIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{
                background: '#f7f9fb',
                borderRadius: 2,
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': { borderColor: '#2B8C37' },
                  '&.Mui-focused fieldset': { borderColor: '#2B8C37' }
                }
              }}
            />
            {/* Submit Button */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
              <Button
                type="submit"
                variant="contained"
                sx={{
                  width: '60%',
                  backgroundColor: '#2B8C37',
                  borderRadius: '50px',
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  py: 1.2,
                  boxShadow: 3,
                  letterSpacing: 1,
                  transition: 'background 0.2s, box-shadow 0.2s',
                  '&:hover': { backgroundColor: '#256e2e', boxShadow: 6 }
                }}
                disabled={loading}
              >
                {loading ? "ADDING..." : "ADD RECORD"}
              </Button>
            </Box>
          </Box>
        </form>
      </Box>
    </Overlay>
  );
}

export default AddRecordModalHelp;
