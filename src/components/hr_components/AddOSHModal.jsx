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

import api from "../../services/api";

function AddOSHModal({ onClose }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    companyId: "", // get current  company of emp
    workforce_type: "",
    lost_time: "",
    date: "",
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
          placeholder="Worforce Type*"
          value={formData.employeeId}
          onChange={handleChange("workforce_type")}
          type="text"
        />

        <Select
          value={formData.lost_time}
          onChange={handleChange("lost_time")}
          displayEmpty
          renderValue={(selected) => {
            if (!selected) {
              return <span style={{ color: "#999" }}>Lost Time*</span>;
            }
            return selected === "yes" ? "Yes" : "No";
          }}
        >
          <MenuItem value="yes">Yes</MenuItem>
          <MenuItem value="no">No</MenuItem>
        </Select>

        <TextField
          placeholder="Date*"
          value={formData.tenureEnded}
          onChange={handleChange("date")}
          type="date"
        />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 2,
          }}
        >
          <Select
            fullWidth
            value={formData.incident_type}
            onChange={handleChange("incident_type")}
            displayEmpty
            renderValue={(selected) =>
              selected ? (
                selected
              ) : (
                <span style={{ color: "#aaa" }}>Select Incident Type*</span>
              )
            }
          >
            {uniqueOptions("incident_type").map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>

          <Select
            fullWidth
            value={formData.incident_title}
            onChange={handleChange("incident_title")}
            displayEmpty
            renderValue={(selected) =>
              selected ? (
                selected
              ) : (
                <span style={{ color: "#aaa" }}>Select Incident Title*</span>
              )
            }
          >
            {uniqueOptions("incident_title").map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </Box>

        <TextField
          placeholder="Incident Count*"
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
          ADD
        </Button>
      </Box>
    </Paper>
  );
}

export default AddOSHModal;
