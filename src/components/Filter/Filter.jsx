import React, { useState, useRef, useEffect } from "react";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Checkbox from "@mui/material/Checkbox";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";

/**
 * Filter component for selecting one or multiple options from a dropdown.
 *
 * Props:
 * - label: string (button label)
 * - options: array of { label, value }
 * - value: selected value(s) (string | array)
 * - onChange: function(newValue)
 * - multi: boolean (enable multi-select)
 * - placeholder: string (optional)
 * - disabled: boolean (optional)
 */
const Filter = ({
  label,
  options = [],
  value,
  onChange,
  multi = false,
  placeholder = "Select...",
  disabled = false,
}) => {
  // State to control dropdown open/close
  const [open, setOpen] = useState(false);
  // Ref for the button (anchor for Popper)
  const anchorRef = useRef(null);
  // Ref for the list (for keyboard navigation)
  const listRef = useRef(null);

  // Focus the first list item when dropdown opens
  useEffect(() => {
    if (open && listRef.current) {
      const first = listRef.current.querySelector('[tabindex="0"]');
      if (first) first.focus();
    }
  }, [open]);

  // Toggle dropdown open/close
  const handleToggle = () => setOpen((prev) => !prev);

  // Close dropdown
  const handleClose = () => setOpen(false);

  // Handle option selection (single or multi)
  const handleSelect = (optionValue) => {
    if (multi) {
      // For multi-select, add or remove value from array
      let newValue = Array.isArray(value) ? [...value] : [];
      if (newValue.includes(optionValue)) {
        newValue = newValue.filter((v) => v !== optionValue);
      } else {
        newValue.push(optionValue);
      }
      onChange && onChange(newValue);
    } else {
      // For single select, deselect if already selected, else select
      if (value === optionValue) {
        onChange && onChange(undefined); // or null, depending on your app's convention
      } else {
        onChange && onChange(optionValue);
      }
      setOpen(false);
    }
  };

  // Remove keyboard navigation for list items

  // Check if an option is selected
  const isSelected = (optionValue) =>
    multi
      ? Array.isArray(value) && value.includes(optionValue)
      : value === optionValue;

  // Get display label(s) for selected value(s)
  const selectedLabels = multi
    ? options
        .filter((opt) => value?.includes(opt.value))
        .map((opt) => opt.label)
        .join(", ")
    : options.find((opt) => opt.value === value)?.label;

  return (
    // Main container for filter dropdown
    <Box display="inline-block" position="relative">
      {/* Button to open dropdown */}
      <Button
        ref={anchorRef}
        variant="outlined"
        color="inherit"
        onClick={handleToggle}
        endIcon={open ? <ArrowDropUpIcon sx={{ color: "#000", fontSize: 18 }} /> : <ArrowDropDownIcon sx={{ color: "#000", fontSize: 18 }} />}
        sx={{
          borderRadius: 100,
          fontWeight: 500,
          fontSize: 14,
          px: 1.5,
          py: 0,
          color: "#000",
          border: "1.5px solid #182959",
          boxShadow: "0 2px 8px 0 rgba(0,0,0,0.03)",
          height: 40,
          minHeight: 40,
          textAlign: "left",
          justifyContent: "flex-start",
          alignItems: "center",
          transition: "all 0.18s",
          "&:hover, &:focus": {
            borderColor: "#000",
            background: "#ededed",
            color: "#000",
          },
        }}
        aria-expanded={open}
        aria-haspopup="listbox"
        disabled={disabled}
      >
        {/* Show selected label(s) or fallback to label/placeholder */}
        {selectedLabels
          ? <span style={{ color: "#000", fontWeight: 500, fontSize: 14 }}>{selectedLabels}</span>
          : <span style={{ fontWeight: 400, color: "#888", fontSize: 13 }}>{placeholder || label}</span>
        }
      </Button>
      {/* Dropdown popper for options */}
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        placement="bottom-start"
        style={{ zIndex: 1300, minWidth: 180 }}
      >
        <ClickAwayListener onClickAway={handleClose}>
          <Paper
            elevation={6}
            sx={{
              mt: 1,
              borderRadius: 2,
              p: 0,
              minWidth: 180,
              background: "#fff",
              boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
              border: "1px solid #e0e0e0",
            }}
          >
            {/* List of options */}
            <List
              ref={listRef}
              role="listbox"
              sx={{
                py: 0.5,
                maxHeight: 240,
                overflowY: "auto",
                "& .MuiListItemButton-root": {
                  borderRadius: 1.5,
                  mx: 0.5,
                  my: 0.25,
                  color: "#000",
                  fontWeight: 400,
                  fontSize: 13,
                  minHeight: 28,
                  transition: "background 0.15s",
                  "&.Mui-selected, &:hover": {
                    background: "#f0f0f0",
                    color: "#000",
                  },
                },
                "& .MuiCheckbox-root": {
                  color: "#000",
                  p: 0.5,
                  mr: 1,
                  '& .MuiSvgIcon-root': { fontSize: 16 }
                },
                "& .MuiListItemText-root": {
                  color: "#000",
                  fontWeight: 400,
                  fontSize: 13,
                },
              }}
            >
              {/* Show message if no options */}
              {options.length === 0 && (
                <ListItem>
                  <ListItemText primary="No options" sx={{ color: "#888", textAlign: "center", fontSize: 13 }} />
                </ListItem>
              )}
              {/* Render each option */}
              {options.map((opt) => (
                <ListItem disablePadding key={opt.value}>
                  <ListItemButton
                    selected={isSelected(opt.value)}
                    onClick={() => handleSelect(opt.value)}
                    tabIndex={0}
                    role="option"
                    aria-selected={isSelected(opt.value)}
                  >
                    {/* Checkbox for multi-select */}
                    {multi && (
                      <Checkbox
                        edge="start"
                        checked={isSelected(opt.value)}
                        tabIndex={-1}
                        disableRipple
                        size="small"
                        sx={{ mr: 1, color: "#000", p: 0.5 }}
                      />
                    )}
                    <ListItemText primary={opt.label} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Paper>
        </ClickAwayListener>
      </Popper>
    </Box>
  );
};

export default Filter;


