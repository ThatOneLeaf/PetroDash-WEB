import { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  Autocomplete,
  Box,
} from "@mui/material";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import api from "../../services/api";

import isSameOrAfter from "dayjs/plugin/isSameOrAfter";

dayjs.extend(isSameOrAfter);

function AddSafetyWorkDataModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    companyId: "", // get current  company of emp
    contractor: "",
    date: null,
    safetyManpower: "",
    safetyManhours: "",
  });

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(false);
  }, []);

  // DATA -- CHANGE PER PAGE
  const fetchSafetyWorkData = async () => {
    try {
      setLoading(true);
      const response = await api.get("hr/safety_workdata_records_by_status");
      console.log("Safety Work Data from API:", response.data);
      setData(response.data);
    } catch (error) {
      console.error("Error fetching Safety data:", error);
      setError("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSafetyWorkData();
  }, []);

  const uniqueOptions = (key) => {
    return Array.from(new Set(data.map((item) => item[key]))).map((val) => ({
      label: val,
      value: val,
    }));
  };

  const handleChange = (field) => (event) => {
    const newFormData = {
      ...formData,
      [field]: event.target.value,
    };
    setFormData(newFormData);
  };

  const handleDateChange = (field) => (newValue) => {
    setFormData((prev) => ({
      ...prev,
      [field]: newValue,
    }));
  };

  const handleSubmit = async () => {
    console.log(formData);

    /* VALIDATIONS */

    const MIN_DATE = dayjs("1994-09-29");

    const { contractor, date, safetyManpower, safetyManhours } = formData;

    const isValidContractor = contractor.trim() !== "";

    const isValidDate = date && dayjs(date).isSameOrAfter(MIN_DATE);

    const isValidManpower =
      safetyManpower !== "" &&
      !isNaN(safetyManpower) &&
      Number(safetyManpower) > 0;

    const isValidManhours =
      safetyManhours !== "" &&
      !isNaN(safetyManhours) &&
      Number(safetyManhours) > 0;

    if (!isValidContractor) {
      alert("Contractor is required.");
      return;
    }

    if (!isValidDate) {
      alert("Please select a valid Date.");
      return;
    }

    if (!isValidManpower) {
      alert("Safety Manpower must be a number greater than 0.");
      return;
    }

    if (!isValidManhours) {
      alert("Safety Manhours must be a number greater than 0.");
      return;
    }

    try {
      setLoading(true);

      await api.post("/hr/single_upload_safety_workdata_record", {
        company_id: "PSC", //ADD COMPANY TO ADD RECORD
        contractor: formData.contractor,
        date: formData.date ? dayjs(formData.date).format("YYYY-MM-DD") : null,
        manpower: formData.safetyManpower,
        manhours: formData.safetyManhours,
      });

      console.log("success  ");
      if (onSuccess) onSuccess();
      onClose();

      setFormData({
        companyId: "", // get current  company of emp
        contractor: "",
        date: null,
        safetyManpower: "",
        safetyManhours: "",
      });
    } catch (err) {
      console.error("Error submitting form:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Paper
      sx={{
        p: 4,
        width: "500px",
        borderRadius: "16px",
        bgcolor: "white",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          mb: 3,
        }}
      >
        <Typography
          sx={{
            fontSize: "1rem",
            fontWeight: 800,
          }}
        >
          ADD NEW RECORD
        </Typography>
        <Typography
          sx={{ fontSize: "2.2rem", color: "#182959", fontWeight: 800 }}
        >
          HR - Safety Work Data
        </Typography>
      </Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 2,
          mb: 3,
        }}
      >
        {/* 

        
        <Select
          value={formData.year}
          onChange={handleChange('year')}
          sx={{ height: '40px' }}
        >
          {[...Array(10)].map((_, i) => (
            <MenuItem key={currentYear - i} value={currentYear - i}>
              {currentYear - i}
            </MenuItem>
          ))}
        </Select>*/}

        <Autocomplete
          freeSolo
          options={uniqueOptions("contractor")}
          value={formData.contractor}
          onInputChange={(event, newInputValue) => {
            setFormData((prev) => ({
              ...prev,
              contractor: newInputValue,
            }));
          }}
          renderInput={(params) => (
            <TextField {...params} label="Contractor" fullWidth />
          )}
        />

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Date"
            value={formData.date}
            onChange={handleDateChange("date")}
            minDate={dayjs("1994-09-29")}
            disableFuture={true}
            slotProps={{
              textField: { fullWidth: true, size: "medium" },
            }}
          />
        </LocalizationProvider>

        <TextField
          label="Safety Manpower"
          value={formData.safetyManpower}
          onChange={handleChange("safetyManpower")}
          type="number"
          inputProps={{ min: 1 }}
        />

        <TextField
          label="Safety Manhours"
          value={formData.safetyManhours}
          onChange={handleChange("safetyManhours")}
          type="number"
          inputProps={{ min: 1 }}
        />
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          mt: 3,
        }}
      >
        <Button
          variant="contained"
          sx={{
            backgroundColor: "#2B8C37",
            borderRadius: "999px",
            padding: "9px 18px",
            fontSize: "1rem",
            fontWeight: "bold",
            "&:hover": {
              backgroundColor: "#256d2f",
            },
          }}
          onClick={handleSubmit}
        >
          ADD RECORD
        </Button>
      </Box>
    </Paper>
  );
}

export default AddSafetyWorkDataModal;
