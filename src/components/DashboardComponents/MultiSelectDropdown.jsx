import React from 'react';
import {
  Box,
  Chip,
  MenuItem,
  OutlinedInput,
  Select,
  FormControl,
  ListItemText,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';

const MultiSelectWithChips = ({
  label = 'Select',
  options = [],
  selectedValues = [],
  onChange,
  placeholder = 'All Companies',
}) => {
  const handleChange = (event) => {
    onChange(event.target.value);
  };

  const handleDelete = (valueToRemove) => {
    onChange(selectedValues.filter((val) => String(val) !== String(valueToRemove)));
  };

  const getLabel = (val) =>
    options.find((opt) => String(opt.value) === String(val))?.label || val;

  return (
    <>
      <FormControl sx={{ minWidth: 100, maxWidth: 230, width: '75%' }}>
        <Select
          multiple
          displayEmpty
          value={selectedValues}
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
                alignItems: 'flex-start', // allow vertical growth
                '& .MuiOutlinedInput-notchedOutline': {
                  border: 'none',
                },
              }}
            />
          }
          renderValue={(selected) =>
  selected.length === 0 ? (
    <Box
      sx={{
        height: '32px', // match Select height
        display: 'flex',
        alignItems: 'center', // center vertically
        pl: '8px',
      }}
    >
      <span style={{ color: '#000', fontSize: '12px' }}>{placeholder}</span>
    </Box>
  ) : (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 0.5,
        maxWidth: '100%',
        alignItems: 'center',
        minHeight: '32px', // ✅ ADD THIS LINE
      }}
    >
      {selected.map((val) => (
        <Chip
          key={val}
          label={getLabel(val)}
          onMouseDown={(e) => e.stopPropagation()}
          onDelete={(e) => {
            e.stopPropagation();
            handleDelete(val);
          }}
          size="small"
          sx={{
            fontSize: '11px',
            fontWeight: 500,
            borderRadius: '20px',
          }}
        />
      ))}
    </Box>
  )
}
          sx={{
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 300,
            width: 'auto',
            minWidth: '160px',
            maxWidth: '500px',
            alignItems: 'flex-start', // vertical layout
            '& .MuiSelect-select': {
              padding: 0,
              paddingLeft: '8px',
              display: 'flex',
              alignItems: 'flex-start',
              flexWrap: 'wrap', // multiple lines
              minHeight: '32px',
            },
          }}
        >
          {options.map((opt) => {
            const isSelected = selectedValues.includes(opt.value);
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
    </>
  );
};

export default MultiSelectWithChips;
