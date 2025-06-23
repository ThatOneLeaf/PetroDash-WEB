import { useState, useEffect } from 'react';
import Overlay from '../modal';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  Button,
  Divider,
} from '@mui/material';
// import CloseIcon from '@mui/icons-material/Close';
import api from '../../services/api';

function AddRecordModalHelp({
  open,
  onClose
}) {
  const [year, setYear] = useState('');
  const [company, setCompany] = useState('');
  const [program, setProgram] = useState('');
  const [project, setProject] = useState('');
  const [beneficiaries, setBeneficiaries] = useState('');
  const [amountInvested, setAmountInvested] = useState('');
  const [projectRemarks, setProjectRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [yearError, setYearError] = useState('');
  const [companyOptions, setCompanyOptions] = useState([]);
  const [programOptions, setProgramOptions] = useState([]);
  const [projectOptions, setProjectOptions] = useState([]);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  // Fetch company options
  useEffect(() => {
    if (!open) return;
    api.get('/reference/companies')
      .then(res => {
        setCompanyOptions(
          [{ label: "Select Company", value: "" }]
            .concat((res.data || []).map(c => ({
              label: c.name,
              value: c.id
            })))
        );
      })
      .catch(() => setCompanyOptions([{ label: "Select Company", value: "" }]));
  }, [open]);

  // Fetch program options
  useEffect(() => {
    if (!open) return;
    api.get('/help/programs')
      .then(res => {
        setProgramOptions(
          [{ label: "Select Program", value: "" }]
            .concat((res.data || []).map(p => ({
              label: p.programName,
              value: p.programId
            })))
        );
      })
      .catch(() => setProgramOptions([{ label: "Select Program", value: "" }]));
  }, [open]);

  // Fetch project options based on selected program
  useEffect(() => {
    if (!open || !program) {
      setProjectOptions([{ label: "Select Project", value: "" }]);
      return;
    }
    api.get('/help/projects', { params: { program_id: program } })
      .then(res => {
        setProjectOptions(
          [{ label: "Select Project", value: "" }]
            .concat((res.data || []).map(p => ({
              label: p.projectName,
              value: p.projectId
            })))
        );
      })
      .catch(() => setProjectOptions([{ label: "Select Project", value: "" }]));
  }, [open, program]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate year: must be 4 digits and reasonable (e.g., 1900-2099)
    if (!/^\d{4}$/.test(year) || Number(year) < 1900 || Number(year) > 2099) {
      setYearError('Enter a valid 4-digit year');
      return;
    } else {
      setYearError('');
    }
    setLoading(true);
    
    try {
      const response = await api.post('/help/activities-single', {
        company_id: company,
        project_id: project,
        project_year: Number(year),
        csr_report: Number(beneficiaries),
        project_expenses: Number(amountInvested),
        project_remarks: projectRemarks,
      });

      if (response.data.success) {
        alert("Data successfully uploaded.")
        onClose();
        setYear('');
        setCompany('');
        setProgram('');
        setProject('');
        setBeneficiaries('');
        setAmountInvested('');
        setYearError('');
      } else {
        alert(response.data.message)
      }
    } 
    finally {
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
        }}>
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
                label="Year"
                type="text"
                value={year}
                onChange={e => {
                  // Only allow numbers, max 4 digits
                  const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
                  setYear(val);
                  if (yearError) setYearError('');
                }}
                fullWidth
                required
                placeholder="Year"
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 4 }}
                error={!!yearError}
                helperText={yearError || ''}
                sx={{
                  background: '#f7f9fb',
                  borderRadius: 2,
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': { borderColor: '#2B8C37' },
                    '&.Mui-focused fieldset': { borderColor: '#2B8C37' }
                  }
                }}
              />
              <TextField
                select
                label="Company"
                value={company}
                onChange={e => setCompany(e.target.value)}
                fullWidth
                required
                placeholder="Company"
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
                sx={{
                  background: program ? '#f7f9fb' : '#f0f0f0',
                  borderRadius: 2,
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': { borderColor: '#2B8C37' },
                    '&.Mui-focused fieldset': { borderColor: '#2B8C37' }
                  }
                }}
              >
                {projectOptions.map(opt => (
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
              sx={{
                background: '#f7f9fb',
                borderRadius: 2,
                '& .MuiOutlinedInput-root': {
                  '&:hover fieldset': { borderColor: '#2B8C37' },
                  '&.Mui-focused fieldset': { borderColor: '#2B8C37' }
                }
              }}
            />

            {/* Row 5: Project Remarks */}
            <TextField
              label="Project Remarks (Optional)"
              type="text"
              value={projectRemarks}
              onChange={e => setProjectRemarks(e.target.value)}
              fullWidth
              required
              placeholder="Project Remarks"
              sx={{
                height: '50px',
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