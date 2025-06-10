import { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
} from "@mui/material";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import api from "../../services/api";

function AddOSHModal({ onClose }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    companyId: "", // get current  company of emp
    workforce_type: "",
    lost_time: "",
    date: null,
    incident_type: "",
    incident_title: "",
    incident_count: "",
  });

  const fetchOSHData = async () => {
    try {
      setLoading(true);
      const response = await api.get(
        "hr/occupational_safety_health_records_by_status"
      );
      console.log("OSH Data from API:", response.data);
      setData(response.data);
    } catch (error) {
      console.error("Error fetching OSH data:", error);
      setError("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOSHData();
  }, []);

  const uniqueOptions = (key) => {
    return Array.from(new Set(data.map((item) => item[key]))).map((val) => ({
      label: val,
      value: val,
    }));
  };

  const uniqueBoolOptions = (key) => {
    return Array.from(new Set(data.map((item) => item[key]))).map((val) => ({
      label: typeof val === "boolean" ? (val ? "Yes" : "No") : val,
      value: String(val), // convert all to string for consistency in <Select />
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

    try {
      setLoading(true);

      await api.post("/hr/single_upload_occupational_safety_health_record", {
        company_id: "PSC",
        workforce_type: formData.workforce_type,
        lost_time:
          formData.lost_time === "true" || formData.lost_time === true
            ? "TRUE"
            : "FALSE",
        date: formData.date ? dayjs(formData.date).format("YYYY-MM-DD") : null,
        incident_type: formData.incident_type,
        incident_title: formData.incident_title,
        incident_count: formData.incident_count,
      });

      console.log("success  ");
      onClose();

      setFormData({
        companyId: "", // get current  company of emp
        workforce_type: "",
        lost_time: "",
        date: null,
        incident_type: "",
        incident_title: "",
        incident_count: "",
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
          HR - OSH
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
          label="Worforce Type"
          value={formData.employeeId}
          onChange={handleChange("workforce_type")}
          type="text"
        />

        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Lost Time</InputLabel>
          <Select
            value={formData.lost_time}
            onChange={handleChange("lost_time")}
            label="Lost Time"
            sx={{ height: "55px" }}
          >
            {uniqueBoolOptions("lost_time").map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

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

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 2,
          }}
        >
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Incident Type</InputLabel>
            <Select
              value={formData.incident_type}
              onChange={handleChange("incident_type")}
              label="Incident Type"
              sx={{ height: "55px" }}
            >
              {uniqueOptions("incident_type").map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Incident Title</InputLabel>
            <Select
              value={formData.incident_title}
              onChange={handleChange("incident_title")}
              label="Incident Title"
              sx={{ height: "55px" }}
            >
              {uniqueOptions("incident_title").map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <TextField
          label="Incident Count"
          value={formData.incident_count}
          onChange={handleChange("incident_count")}
          type="Number"
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

export default AddOSHModal;
