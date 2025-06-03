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

function AddTrainingModal({ onClose }) {
  const [formData, setFormData] = useState({
    companyId: "", // get current  company of emp
    trainingName: "",
    date: "",
    trainingHours: "",
    numberOfParticipants: "",
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
          placeholder="Training Name*"
          value={formData.trainingName}
          onChange={handleChange("trainingName")}
          type="text"
        />

        <TextField
          placeholder="Date*"
          value={formData.date}
          onChange={handleChange("date")}
          type="date"
        />

        <TextField
          placeholder="Training Hours*"
          value={formData.trainingHours}
          onChange={handleChange("trainingHours")}
          type="number"
        />

        <TextField
          placeholder="Number of Participants   *"
          value={formData.numberOfParticipants}
          onChange={handleChange("numberOfParticipants")}
          type="number"
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

export default AddTrainingModal;
