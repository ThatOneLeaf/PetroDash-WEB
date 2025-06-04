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

import { DatePicker } from "@mui/x-date-pickers/DatePicker";

import api from "../../services/api";

function UpdateEmployeeModal({ onClose, row }) {
  const [formData, setFormData] = useState({
    companyId: "", // get current  company of emp
    employeeId: "",
    gender: "",
    position: "",
    employeeCategory: "",
    employeeStatus: "",
    tenureStart: "",
    tenureEnded: "",
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

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 2,
          }}
        >
          <Select
            value={formData.gender}
            onChange={handleChange("gender")}
            displayEmpty
            renderValue={(selected) => {
              if (!selected) {
                return (
                  <span style={{ color: "#999" }}>
                    {row.gender?.toLowerCase() === "f"
                      ? "Female"
                      : row.gender?.toLowerCase() === "m"
                      ? "Male"
                      : row.gender}
                  </span>
                );
              }
              return selected === "male" ? "Male" : "Female";
            }}
          >
            <MenuItem value="male">Male</MenuItem>
            <MenuItem value="female">Female</MenuItem>
          </Select>

          <Select
            value={formData.position}
            onChange={handleChange("position")}
            displayEmpty
            renderValue={(selected) => {
              if (!selected) {
                return (
                  <span style={{ color: "#999" }}>
                    {row.position_id?.toLowerCase() === "rf"
                      ? "Rank-and-File"
                      : row.position_id?.toLowerCase() === "mm"
                      ? "Middle Management"
                      : row.position_id?.toLowerCase() === "sm"
                      ? "Senior Management"
                      : row.position_id}
                  </span>
                );
              }
              const getPositionName = (selected) => {
                const map = {
                  RNF: "Rank-And-File",
                  MM: "Middle Management",
                  SM: "Senior Management",
                };

                return map[selected] || "Unknown";
              };

              return getPositionName(selected);
            }}
          >
            <MenuItem value="RNF">Rank-And-File</MenuItem>
            <MenuItem value="MM">Middle Management</MenuItem>
            <MenuItem value="SM">Senior Management</MenuItem>
          </Select>
        </Box>

        <Select
          value={formData.employeeCategory}
          onChange={handleChange("employeeCategory")}
          displayEmpty
          renderValue={(selected) => {
            if (!selected) {
              return (
                <span style={{ color: "#999" }}>
                  {row.p_np?.toLowerCase() === "p"
                    ? "Profesional"
                    : row.p_np?.toLowerCase() === "np"
                    ? "Non-Professional"
                    : row.p_np}
                </span>
              );
            }
            return selected === "prof" ? "Professional" : "Non-Professional";
          }}
        >
          <MenuItem value="prof">Professional</MenuItem>
          <MenuItem value="nonprof">Non-Professional</MenuItem>
        </Select>

        <Select
          value={formData.employeeStatus}
          onChange={handleChange("employeeStatus")}
          displayEmpty
          renderValue={(selected) => {
            if (!selected) {
              return (
                <span style={{ color: "#999" }}>{row.employment_status}</span>
              );
            }
            return selected === "perm" ? "Permanent" : "Temporary";
          }}
        >
          <MenuItem value="perm">Permanent</MenuItem>
          <MenuItem value="temp">Temporary</MenuItem>
        </Select>

        <TextField
          placeholder={row.start_date}
          value={formData.tenureStart}
          onChange={handleChange("tenureStart")}
          type="date"
        />

        <TextField
          placeholder={row.end_date}
          value={formData.tenureEnded}
          onChange={handleChange("tenureEnded")}
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
          onClick={handleSubmit}
        >
          UPDATE
        </Button>
      </Box>
    </Paper>
  );
}

export default UpdateEmployeeModal;
