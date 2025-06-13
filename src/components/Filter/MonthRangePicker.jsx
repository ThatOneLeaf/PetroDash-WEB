import React, { useState, useRef } from "react";
import {
  Button,
  Popper,
  Paper,
  ClickAwayListener,
  Box,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ArrowDropUpIcon from "@mui/icons-material/ArrowDropUp";
import dayjs from "dayjs";

const MonthRangePicker = ({
  label = "Date Range",
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);

  const handleToggle = () => setOpen((prev) => !prev);
  const handleClose = () => setOpen(false);

  const hasDateSelected = Boolean(startDate || endDate);

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box display="inline-block" position="relative">
        <Button
          ref={anchorRef}
          variant="outlined"
          color="inherit"
          onClick={handleToggle}
          endIcon={
            open ? (
              <ArrowDropUpIcon
                sx={{ color: hasDateSelected ? "#fff" : "#5B5B5B", fontSize: 18 }}
              />
            ) : (
              <ArrowDropDownIcon
                sx={{ color: hasDateSelected ? "#fff" : "#5B5B5B", fontSize: 18 }}
              />
            )
          }
          sx={{
            borderRadius: 100,
            fontWeight: 500,
            fontSize: 14,
            px: 1.5,
            py: 0,
            color: "#5B5B5B",
            border: "2px solid #5B5B5B",
            boxShadow: "0 2px 8px 0 rgba(0,0,0,0.03)",
            height: 40,
            minHeight: 40,
            justifyContent: "flex-start",
            backgroundColor: hasDateSelected ? "#5B5B5B" : "#fff",
            "&:hover, &:focus": {
              borderColor: "#A6A6A6",
              color: "#ffffff",
              backgroundColor: hasDateSelected ? "#A6A6A6" : "#ffffff",
            },
          }}
          aria-expanded={open}
          aria-haspopup="true"
          disabled={disabled}
        >
          {hasDateSelected ? (
            <span style={{ color: "#fff", fontSize: 14 }}>
              {startDate?.format("MMM YYYY")} – {endDate?.format("MMM YYYY") || "Present"}
            </span>
          ) : (
            <span style={{ color: "#5B5B5B", fontSize: 14 }}>{label}</span>
          )}
        </Button>

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
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                maxDate={endDate || undefined}
                slotProps={{
                    textField: {
                    size: "small",
                    sx: {
                        width: 150,
                        "& .MuiInputBase-root": { height: 36, fontSize: "0.8rem" },
                        "& .MuiInputLabel-root": { fontSize: "0.75rem" },
                    },
                    },
                }}
                />

                <DatePicker
                label="End Month"
                views={["year", "month"]}
                format="MMM YYYY"
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                minDate={startDate || undefined}
                slotProps={{
                    textField: {
                    size: "small",
                    sx: {
                        width: 150,
                        "& .MuiInputBase-root": { height: 36, fontSize: "0.8rem" },
                        "& .MuiInputLabel-root": { fontSize: "0.75rem" },
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

export default MonthRangePicker;
