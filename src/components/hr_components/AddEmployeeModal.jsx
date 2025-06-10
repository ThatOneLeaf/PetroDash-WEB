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

function AddEmployeeModal({ onClose }) {
  const [formData, setFormData] = useState({
    companyId: "", // get current  company of emp
    employeeId: "",
    gender: "",
    birthdate: null,
    position: "",
    employeeCategory: "",
    employeeStatus: "",
    tenureStart: null,
    tenureEnded: null,
  });

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // DATA -- CHANGE PER PAGE
  const fetchEmployabilityData = async () => {
    try {
      setLoading(true);
      const response = await api.get("hr/employability_records_by_status");
      console.log("Employability Data from API:", response.data);
      setData(response.data);
    } catch (error) {
      console.error("Error fetching Employability data:", error);
      setError("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployabilityData();
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

    try {
      setLoading(true);

      await api.post("/hr/single_upload_employability_record", {
        company_id: "PSC",
        employee_id: formData.employeeId.toUpperCase(),
        gender: formData.gender.toUpperCase(),
        birthdate: formData.birthdate
          ? dayjs(formData.birthdate).format("YYYY-MM-DD")
          : null,
        position_id: formData.position.toUpperCase(),
        p_np: formData.employeeCategory.toUpperCase(),
        employment_status: formData.employeeStatus,
        start_date: formData.tenureStart
          ? dayjs(formData.tenureStart).format("YYYY-MM-DD")
          : null,
        end_date: formData.tenureEnded
          ? dayjs(formData.tenureEnded).format("YYYY-MM-DD")
          : null,
      });

      console.log("success  ");
      onClose();

      setFormData({
        companyId: "",
        employeeId: "",
        gender: "",
        birthdate: null,
        position: "",
        employeeCategory: "",
        employeeStatus: "",
        tenureStart: null,
        tenureEnded: null,
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
          HR - Employability
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
          label="Employee ID"
          value={formData.employeeId}
          onChange={handleChange("employeeId")}
          type="text"
        />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 2,
          }}
        >
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Gender</InputLabel>
            <Select
              value={formData.gender}
              onChange={handleChange("gender")}
              label="Gender"
              sx={{ height: "55px" }}
            >
              {uniqueOptions("gender").map((option) => {
                let label = option.label;
                if (option.value === "M") label = "Male";
                else if (option.value === "F") label = "Female";

                return (
                  <MenuItem key={option.value} value={option.value}>
                    {label}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Position</InputLabel>
            <Select
              value={formData.position}
              onChange={handleChange("position")}
              label="Position"
              sx={{ height: "55px" }}
            >
              {uniqueOptions("position_id").map((option) => {
                let label = option.label;
                if (option.value === "RF") label = "Rank-And-File";
                else if (option.value === "MM") label = "Middle Management";
                else if (option.value === "SM") label = "Senior Management";

                return (
                  <MenuItem key={option.value} value={option.value}>
                    {label}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </Box>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Birthdate"
            value={formData.birthdate}
            onChange={handleDateChange("birthdate")}
            slotProps={{
              textField: { fullWidth: true, size: "medium" },
            }}
          />
        </LocalizationProvider>

        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Employee Category</InputLabel>
          <Select
            value={formData.employeeCategory}
            onChange={handleChange("employeeCategory")}
            label="Employee Category"
            sx={{ height: "55px" }}
          >
            {uniqueOptions("p_np").map((option) => {
              let label = option.label;
              if (option.value === "P") label = "Professional";
              else if (option.value === "NP") label = "Non-Professional";

              return (
                <MenuItem key={option.value} value={option.value}>
                  {label}
                </MenuItem>
              );
            })}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Employee Status</InputLabel>
          <Select
            value={formData.employeeStatus}
            onChange={handleChange("employeeStatus")}
            label="Employee Status"
            sx={{ height: "55px" }}
          >
            {uniqueOptions("employment_status").map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Tenure Start"
            value={formData.tenureStart}
            onChange={handleDateChange("tenureStart")}
            slotProps={{
              textField: { fullWidth: true, size: "medium" },
            }}
          />
        </LocalizationProvider>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Tenure Ended"
            value={formData.tenureEnded}
            onChange={handleDateChange("tenureEnded")}
            slotProps={{
              textField: { fullWidth: true, size: "medium" },
            }}
          />
        </LocalizationProvider>
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

export default AddEmployeeModal;
