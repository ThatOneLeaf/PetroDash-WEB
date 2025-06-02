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
        endIcon={open ? <ArrowDropUpIcon /> : <ArrowDropDownIcon />}
        sx={{
          borderRadius: 3,
          fontWeight: "bold",
          fontSize: 20,
          px: 3,
          py: 0,
          color: "#555",
          background: "#fff",
          borderColor: "#bdbdbd",
          boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
          height: 40,
          minHeight: 40,
          textAlign: "left",
          justifyContent: "flex-start",
          alignItems: "center",
          "&:hover, &:focus": {
            borderColor: "#888",
            background: "#fafbfc",
          },
        }}
        aria-expanded={open}
        aria-haspopup="listbox"
        disabled={disabled}
      >
        {/* Show selected label(s) or fallback to label/placeholder */}
        {selectedLabels
          ? <span style={{ color: "#1976d2", fontWeight: 500 }}>{selectedLabels}</span>
          : <span style={{ fontWeight: 600, color: "#888" }}>{placeholder || label}</span>
        }
      </Button>
      {/* Dropdown popper for options */}
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        placement="bottom-start"
        style={{ zIndex: 1300, minWidth: 220 }}
      >
        <ClickAwayListener onClickAway={handleClose}>
          <Paper
            elevation={4}
            sx={{
              mt: 1,
              borderRadius: 2,
              p: 0,
              minWidth: 220,
              boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
            }}
          >
            {/* List of options */}
            <List
              ref={listRef}
              role="listbox"
              sx={{ py: 1, maxHeight: 320, overflowY: "auto" }}
            >
              {/* Show message if no options */}
              {options.length === 0 && (
                <ListItem>
                  <ListItemText primary="No options" sx={{ color: "#aaa" }} />
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
                        sx={{ mr: 1 }}
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


