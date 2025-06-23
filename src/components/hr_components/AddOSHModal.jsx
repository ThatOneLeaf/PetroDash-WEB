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
  Autocomplete,
  Box,
} from "@mui/material";
import Overlay from "../../components/modal";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import api from "../../services/api";

import { useAuth } from "../../contexts/AuthContext";

import SuccessModal from "../../components/hr_components/SuccessModal";
import ErrorModal from "../../components/hr_components/ErrorModal";
import ConfirmModal from "./ConfirmModal";

function AddOSHModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    companyId: "", // get current  company of emp
    workforce_type: "",
    lost_time: "",
    date: null,
    incident_type: "",
    incident_title: "",
    incident_count: "",
  });

  const { getUserCompanyId } = useAuth();
  const userCompany = getUserCompanyId();

  const summaryData = [
    { label: "Company ID", value: String(userCompany || "N/A") },
    {
      label: "Workforce Type",
      value: String(formData.workforce_type || "N/A"),
    },
    {
      label: "Lost Time",
      value: String(
        formData.lost_time === "true"
          ? "Yes"
          : formData.lost_time === "false"
          ? "No"
          : "N/A"
      ),
    },
    {
      label: "Date",
      value: formData.date ? dayjs(formData.date).format("MM/DD/YYYY") : "N/A",
    },
    { label: "Incident Type", value: String(formData.incident_type || "N/A") },
    {
      label: "Incident Title",
      value: String(formData.incident_title || "N/A"),
    },
    {
      label: "Incident Count",
      value: String(formData.incident_count || "N/A"),
    },
  ];

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    const isoDate = newValue ? dayjs(newValue).format("YYYY-MM-DD") : null;

    setFormData((prev) => ({
      ...prev,
      [field]: isoDate,
    }));
  };

  const handleSubmit = async () => {
    console.log(formData);

    /* VALIDATION */
    const MIN_DATE = dayjs("1994-09-28");
    const {
      companyId,
      workforce_type,
      lost_time,
      date,
      incident_type,
      incident_title,
      incident_count,
    } = formData;

    const isInOptions = (value, key) =>
      uniqueOptions(key).some((option) => option.value === value);

    const isValidWorkforceType = workforce_type.trim() !== "";

    const parseBoolean = (val) => {
      if (val === "true") return true;
      if (val === "false") return false;
      return val;
    };

    const isValidLostTime = isInOptions(parseBoolean(lost_time), "lost_time");

    const isValidDate =
      date && dayjs(date).isValid() && dayjs(date).isAfter(MIN_DATE);
    const isValidIncidentType = incident_type.trim() !== "";
    const isValidIncidentTitle = incident_title.trim() !== "";
    const isValidIncidentCount =
      incident_count !== "" &&
      !isNaN(incident_count) &&
      Number(incident_count) > 0;

    if (!isValidWorkforceType) {
      setErrorMessage("Workforce Type is required");
      setIsConfirmModalOpen(false);
      setIsErrorModalOpen(true);
      return;
    }

    if (!isValidLostTime) {
      setErrorMessage("Please select a valid Lost Time.");
      setIsConfirmModalOpen(false);
      setIsErrorModalOpen(true);
      return;
    }

    if (!isValidDate) {
      setErrorMessage("Please enter a valid Date.");
      setIsConfirmModalOpen(false);
      setIsErrorModalOpen(true);
      return;
    }

    if (!isValidIncidentType) {
      setErrorMessage("Incident Type is required.");
      setIsConfirmModalOpen(false);
      setIsErrorModalOpen(true);
      return;
    }
    if (!isValidIncidentTitle) {
      setErrorMessage("Incident Title is required.");
      setIsConfirmModalOpen(false);
      setIsErrorModalOpen(true);
      return;
    }
    if (!isValidIncidentCount) {
      setErrorMessage("Incident Count must be a number greater than 0.");
      setIsConfirmModalOpen(false);
      setIsErrorModalOpen(true);
      return;
    }

    try {
      setLoading(true);

      await api.post("/hr/single_upload_occupational_safety_health_record", {
        company_id: userCompany,
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

      setIsConfirmModalOpen(false);
      setIsSuccessModalOpen(true);
      if (onSuccess) onSuccess();

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

        <Autocomplete
          freeSolo
          options={uniqueOptions("workforce_type").map(
            (option) => option.value
          )}
          value={formData.workforce_type}
          onInputChange={(event, newInputValue) => {
            setFormData((prev) => ({
              ...prev,
              workforce_type: newInputValue,
            }));
          }}
          renderInput={(params) => (
            <TextField {...params} label="Workforce Type" fullWidth />
          )}
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
            value={formData.date ? dayjs(formData.date) : null}
            onChange={handleDateChange("date")}
            minDate={dayjs("1994-09-29")}
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
          <Autocomplete
            freeSolo
            options={uniqueOptions("incident_type").map(
              (option) => option.value
            )}
            value={formData.incident_type}
            onInputChange={(event, newInputValue) => {
              setFormData((prev) => ({
                ...prev,
                incident_type: newInputValue,
              }));
            }}
            renderInput={(params) => (
              <TextField {...params} label="Incident Type" fullWidth />
            )}
          />

          <Autocomplete
            freeSolo
            options={uniqueOptions("incident_title").map(
              (option) => option.value
            )}
            value={formData.incident_title}
            onInputChange={(event, newInputValue) => {
              setFormData((prev) => ({
                ...prev,
                incident_title: newInputValue,
              }));
            }}
            renderInput={(params) => (
              <TextField {...params} label="Incident Title" fullWidth />
            )}
          />
        </Box>

        <TextField
          label="Incident Count"
          value={formData.incident_count}
          onChange={handleChange("incident_count")}
          inputProps={{ min: 1 }}
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
          onClick={() => setIsConfirmModalOpen(true)}
        >
          ADD RECORD
        </Button>

        {isConfirmModalOpen && (
          <Overlay onClose={() => setIsConfirmModalOpen(false)}>
            <ConfirmModal
              open={isConfirmModalOpen}
              title={"Confirm Record Addition"}
              message={"Are you sure you want to add this OSH record?"}
              onConfirm={handleSubmit}
              onCancel={() => setIsConfirmModalOpen(false)}
              summaryData={summaryData}
            />
          </Overlay>
        )}

        {isErrorModalOpen && (
          <Overlay onClose={() => setIsErrorModalOpen(false)}>
            <ErrorModal
              open={isErrorModalOpen}
              errorMessage={errorMessage}
              onClose={() => setIsErrorModalOpen(false)}
            />
          </Overlay>
        )}

        {isSuccessModalOpen && (
          <Overlay onClose={() => setIsSuccessModalOpen(false)}>
            <SuccessModal
              open={isSuccessModalOpen}
              successMessage={
                "Your OSH record has been successfully added to the repository."
              }
              onClose={() => {
                setIsSuccessModalOpen(false);
                onClose();
              }}
            />
          </Overlay>
        )}
      </Box>
    </Paper>
  );
}

export default AddOSHModal;
