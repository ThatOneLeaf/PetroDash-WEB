import { useState } from "react";
import {
  Paper,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  Box,
} from "@mui/material";

import api from "../../services/api";

function AddParentalLeaveModal({ onClose }) {
  const [formData, setFormData] = useState({
    companyId: "", // get current  company of emp
    employeeId: "",
    dateAvailed: "",
    daysAvailed: "",
    typeOfLeave: "",
  });

  const handleChange = (field) => (event) => {
    const newFormData = {
      ...formData,
      [field]: event.target.value,
    };
    setFormData(newFormData);
  };

  const handleSubmit = () => {
    console.log("Submit clicked", formData);
    onClose();
  };

  /* API FOR SUBMIT OF ADD RECORD
  const handleSubmit = async () => {
    try {
      await api.post('/economic/value-generated', formData);
      onClose();
      // You might want to refresh the data after adding
    } catch (error) {
      console.error('Error adding record:', error);
    }
  };*/

  return (
    <Paper
      sx={{
        p: 4,
        width: "450px",
        borderRadius: "16px",
        bgcolor: "white",
      }}
    >
      <Typography
        variant="h5"
        sx={{
          color: "#1a237e",
          mb: 3,
          fontWeight: "bold",
        }}
      >
        Add New Record
      </Typography>

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
          placeholder="Employee ID*"
          value={formData.employeeId}
          onChange={handleChange("employeeId")}
          type="text"
        />

        <Select
          value={formData.typeOfLeave}
          onChange={handleChange("typeOfLeave")}
          displayEmpty
          renderValue={(selected) => {
            if (!selected) {
              return (
                <span style={{ color: "#999" }}>Select Type of Leave*</span>
              );
            }
            const getLeave = (selected) => {
              const map = {
                SP: "Solo Parent",
                MATERNITY: "Maternity",
                PATERNITY: "Paternity",
              };

              return map[selected] || "Unknown";
            };

            return getLeave(selected);
          }}
        >
          <MenuItem value="SP">Solo Parent </MenuItem>
          <MenuItem value="MATERNITY">Maternity</MenuItem>
          <MenuItem value="PATERNITY">Paternity</MenuItem>
        </Select>

        <TextField
          placeholder="Days Availed*"
          value={formData.daysAvailed}
          onChange={handleChange("daysAvailed")}
          type="number"
        />

        <TextField
          placeholder="Date Avaled*"
          value={formData.dateAvailed}
          onChange={handleChange("dateAvailed")}
          type="date"
        />
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          mt: 2,
        }}
      >
        <Button
          variant="contained"
          onClick={handleSubmit}
          sx={{
            bgcolor: "#2E7D32",
            "&:hover": { bgcolor: "#1b5e20" },
          }}
        >
          ADD
        </Button>
      </Box>
    </Paper>
  );
}

export default AddParentalLeaveModal;
