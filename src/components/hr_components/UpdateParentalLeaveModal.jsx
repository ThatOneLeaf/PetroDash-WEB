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

function UpdateParentalLeaveModal({ onClose, row }) {
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
        Update Record
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
          defaultValue={row.employee_id}
          slotProps={{
            input: {
              readOnly: true,
            },
          }}
          sx={{
            "& .MuiInputBase-input": {
              fontWeight: "bold",
            },
          }}
        />

        <Select
          value={formData.typeOfLeave}
          onChange={handleChange("typeOfLeave")}
          displayEmpty
          renderValue={(selected) => {
            if (!selected) {
              return <span style={{ color: "#999" }}>{row.type_of_leave}</span>;
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
          placeholder={row.days}
          value={formData.daysAvailed}
          onChange={handleChange("daysAvailed")}
          type="number"
        />

        <TextField
          placeholder={row.date?.split("T")[0]}
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
          onClick={handleSubmit}
          variant="contained"
          sx={{
            width: "100px",
            backgroundColor: "#2B8C37",
            borderRadius: "999px",
            padding: "9px 18px",
            fontSize: "0.85rem",
            fontWeight: "bold",
            "&:hover": {
              backgroundColor: "#256d2f",
            },
          }}
        >
          UPDATE
        </Button>
      </Box>
    </Paper>
  );
}

export default UpdateParentalLeaveModal;
