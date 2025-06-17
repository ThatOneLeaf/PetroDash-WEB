import React from 'react';
import {
  MenuItem,
  OutlinedInput,
  Select,
  FormControl,
  ListItemText,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';

const StyledSelect = ({ value, onChange, options, placeholder, style = {} }) => {
  const handleChange = (event) => {
    onChange(event.target.value);
  };

  const getLabel = (val) =>
    options.find((opt) => String(opt.value) === String(val))?.label || val;

  return (
    <FormControl sx={{ minWidth: 80, maxWidth: 120, width: 'auto', ...style }}>
      <Select
        displayEmpty
        value={value || ''}
        onChange={handleChange}
        input={
          <OutlinedInput
            notched={false}
            sx={{
              padding: '8px 12px',
              borderRadius: '20px',
              border: '3px solid #e2e8f0',
              backgroundColor: 'white',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
              height: '32px',
              '& .MuiOutlinedInput-notchedOutline': {
                border: 'none',
              },
            }}
          />
        }
        renderValue={(selected) =>
          !selected ? (
            <span style={{ color: '#000', fontSize: '12px' }}>{placeholder}</span>
          ) : (
            <span style={{ color: '#000', fontSize: '12px' }}>{getLabel(selected)}</span>
          )
        }
        sx={{
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: 300,
          width: 'auto',
          minWidth: '80px',
          maxWidth: '120px',
          '& .MuiSelect-select': {
            padding: 0,
            paddingLeft: '8px',
            display: 'flex',
            alignItems: 'center',
            minHeight: '32px',
          },
        }}
      >
        {options.map((opt) => {
          const isSelected = String(value) === String(opt.value);
          return (
            <MenuItem
              key={opt.value}
              value={opt.value}
              sx={{
                fontSize: '12px',
                fontWeight: 300,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: isSelected ? '#f0fdfa' : 'transparent',
                '&:hover': {
                  backgroundColor: '#e0f7fa',
                },
              }}
            >
              <ListItemText
                primary={opt.label}
                primaryTypographyProps={{ fontSize: '12px' }}
              />
              {isSelected && <CheckIcon fontSize="small" sx={{ color: '#10B981' }} />}
            </MenuItem>
          );
        })}
      </Select>
    </FormControl>
  );
};

export default StyledSelect;