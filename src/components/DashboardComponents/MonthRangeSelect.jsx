import React, { useState, useRef } from "react";
import {
  Box,
  OutlinedInput,
  InputAdornment,
  Popper,
  Paper,
  ClickAwayListener,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import dayjs from "dayjs";

const MonthRangeSelect = ({
  label = "Month Range",
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);

  const handleToggle = () => !disabled && setOpen((prev) => !prev);
  const handleClose = () => setOpen(false);
  const hasDate = Boolean(startDate || endDate);

  let displayLabel = label;
  if (hasDate) {
    const startLabel = startDate
      ? typeof startDate.format === "function"
        ? startDate.format("MMM YYYY")
        : dayjs(startDate).format("MMM YYYY")
      : "";
    const endLabel = endDate
      ? typeof endDate.format === "function"
        ? endDate.format("MMM YYYY")
        : dayjs(endDate).format("MMM YYYY")
      : "Present";
    displayLabel = `${startLabel} – ${endLabel}`;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ minWidth: 100, maxWidth: 200, width: "75%" }}>
        <OutlinedInput
          ref={anchorRef}
          onClick={handleToggle}
          value={displayLabel}
          readOnly
          disabled={disabled}
          notched={false}
          endAdornment={
            <InputAdornment position="end" sx={{ ml: 0.5 }}>
              {open ? (
                <ArrowDropUpIcon
                  sx={{ fontSize: 24, color: hasDate ? "#5B5B5B" : "#94a3b8" }}
                />
              ) : (
                <ArrowDropDownIcon
                  sx={{
                    fontSize: 24,
                    color: "#64748b",
                    marginRight: "4px",
                  }}
                />
              )}
            </InputAdornment>
          }
          sx={{
            borderRadius: "20px",
            backgroundColor: "#fff",
            fontSize: "12px",
            fontWeight: 500,
            height: "32px",
            padding: "0 12px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            "& .MuiOutlinedInput-notchedOutline": {
              border: "1px solid #b3b7bd",
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#94a3b8",
            },
            "& input": {
              padding: 0,
              fontSize: "12px",
              fontWeight: 300,
              color: "#000",
            },
          }}
        />

        <Popper
          open={open}
          anchorEl={anchorRef.current}
          placement="bottom-start"
          style={{ zIndex: 1300 }}
        >
          <ClickAwayListener onClickAway={handleClose}>
            <Paper
              elevation={6}
              sx={{
                mt: 1,
                borderRadius: 2,
                p: 2,
                display: "flex",
                gap: 2,
                background: "#fff",
                boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
                border: "1px solid #1A1818",
              }}
            >
              <DatePicker
                label="Start Month"
                views={["year", "month"]}
                format="MMM YYYY"
                allowKeyboardControl
                disableMaskedInput={false}
                value={startDate ? dayjs(startDate) : null}
                onChange={(newValue) => setStartDate(newValue)}
                minDate={dayjs("2000-01-01")}
                maxDate={
                  endDate
                    ? dayjs(endDate).isBefore(dayjs(), "month")
                      ? dayjs(endDate)
                      : dayjs()
                    : dayjs()
                }
                slotProps={{
                  textField: {
                    size: "small",
                    placeholder: "e.g. Jan 2023",
                    sx: {
                      width: 150,
                      "& .MuiInputBase-root": {
                        height: 36,
                        fontSize: "0.8rem",
                      },
                      "& .MuiInputLabel-root": {
                        fontSize: "0.75rem",
                      },
                    },
                  },
                }}
              />

              <DatePicker
                label="End Month"
                views={["year", "month"]}
                format="MMM YYYY"
                allowKeyboardControl
                disableMaskedInput={false}
                value={endDate ? dayjs(endDate) : null}
                onChange={(newValue) => setEndDate(newValue)}
                minDate={startDate ? dayjs(startDate) : dayjs("2000-01-01")}
                maxDate={dayjs()}
                slotProps={{
                  textField: {
                    size: "small",
                    placeholder: "e.g. Jun 2024",
                    sx: {
                      width: 150,
                      "& .MuiInputBase-root": {
                        height: 36,
                        fontSize: "0.8rem",
                      },
                      "& .MuiInputLabel-root": {
                        fontSize: "0.75rem",
                      },
                    },
                  },
                }}
              />
            </Paper>
          </ClickAwayListener>
        </Popper>
      </Box>
    </LocalizationProvider>
  );
};

export default MonthRangeSelect;
