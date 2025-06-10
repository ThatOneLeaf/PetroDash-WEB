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

function AddTrainingModal({ onClose }) {
  const [formData, setFormData] = useState({
    companyId: "", // get current  company of emp
    trainingName: "",
    date: null,
    trainingHours: "",
    numberOfParticipants: "",
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

      await api.post("/hr/single_upload_training_record", {
        company_id: "PSC", //ADD COMPANY TO ADD RECORD
        date: formData.date ? dayjs(formData.date).format("YYYY-MM-DD") : null,
        training_title: formData.trainingName,
        training_hours: formData.trainingHours,
        number_of_participants: formData.numberOfParticipants,
      });

      console.log("success  ");
      onClose();

      setFormData({
        companyId: "", // get current  company of emp
        trainingName: "",
        date: null,
        trainingHours: "",
        numberOfParticipants: "",
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
          HR - Training
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
          label="Training Name"
          value={formData.trainingName}
          onChange={handleChange("trainingName")}
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
          label="Training Hours"
          value={formData.trainingHours}
          onChange={handleChange("trainingHours")}
          type="number"
        />

        <TextField
          label="Number of Participants"
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

export default AddTrainingModal;
