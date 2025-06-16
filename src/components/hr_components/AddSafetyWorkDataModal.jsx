import { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  Box,
} from "@mui/material";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import api from "../../services/api";

function AddSafetyWorkDataModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    companyId: "", // get current  company of emp
    contractor: "",
    date: null,
    safetyManpower: "",
    safetyManhours: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(false);
  }, []);

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

        <TextField
          label="Contractor"
          value={formData.contractor}
          onChange={handleChange("contractor")}
          type="text"
        />

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Date"
            value={formData.date}
            onChange={handleDateChange("date")}
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
        />

        <TextField
          label="Safety Manhours"
          value={formData.safetyManhours}
          onChange={handleChange("safetyManhours")}
          type="number"
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
