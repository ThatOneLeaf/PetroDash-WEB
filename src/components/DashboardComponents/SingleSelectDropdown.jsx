import React from 'react';
import {
  Box,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  OutlinedInput,
} from '@mui/material';

const SingleSelectDropdown = ({
  label = '',
  options = [],
  selectedValue = '',
  onChange,
}) => {
  const handleChange = (event) => {
    onChange(event.target.value);
  };

  const labelId = `single-select-label-${label.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <FormControl
      variant="outlined"
      size="small"
      sx={{
        minWidth: 100,
        maxWidth: 150,
        width: '100%',
        '& .MuiOutlinedInput-root': {
          borderRadius: '20px',
          backgroundColor: 'white',
          fontSize: '12px',
          fontWeight: 500,
          height: '32px', // 🔧 Adjust height here
        },
        '& .MuiSelect-select': {
          padding: '8px 12px',
          display: 'flex',
          alignItems: 'center',
          height: '32px', // 🔧 Match height here
        },
        '& .MuiInputLabel-outlined': {
          fontSize: '12px',
          color: '#334155',
        },
      }}
    >
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select
        labelId={labelId}
        value={selectedValue}
        onChange={handleChange}
        input={<OutlinedInput label={label} />}
        renderValue={(selected) => {
        const found = options.find((opt) => String(opt.value) === String(selected));
        return (
            <span style={{ fontSize: '12px' }}>
            {found ? found.label : ''}
            </span>
        );
        }}

      >
        {options.map((opt) => (
          <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: '12px' }}>
            {opt.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default SingleSelectDropdown;
