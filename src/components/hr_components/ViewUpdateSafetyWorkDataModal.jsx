import {
  Select,
  MenuItem,
  Paper,
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import { useState, useEffect } from "react";
import api from "../../services/api";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

const ViewUpdateSafetyWorkDataModal = ({ title, record, onClose, status }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedRecord, setEditedRecord] = useState(record || {});

  const [formData, setFormData] = useState({
    company_id: "",
    contractor: "",
    date: null,
    manpower: "",
    manhours: "",
    status_id: "",
  });

  const permanentlyReadOnlyFields = ["contractor", "company_id", "status"];

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  if (!record) return null;

  // Initialize Data Options
  const fetchSafetyWorkData = async () => {
    try {
      setLoading(true);
      const response = await api.get("hr/safety_workdata_records_by_status");
      console.log("Safety Work Data from API:", response.data);
      setData(response.data);
    } catch (error) {
      console.error("Error fetching Safety data:", error);
      setError("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSafetyWorkData();
  }, []);

  useEffect(() => {
    setFormData(record);
  }, [record]);

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

    setEditedRecord((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleDateChange = (field) => (newValue) => {
    setFormData((prev) => ({
      ...prev,
      [field]: newValue,
    }));

    setEditedRecord((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSave = async () => {
    console.log("Updated Data:", editedRecord);

    try {
      let response;

      // For EnvironmentEnergy, use POST
      //response = await api.post(`${source}${updatePath}`, editedRecord);

      alert(response.data.message || "Record saved successfully.");
      setIsEditing(false);
    } catch (error) {
      const errorMessage =
        error.response?.data?.detail ||
        error.message ||
        "Unknown error occurred";
      alert(`Failed to save record: ${errorMessage}`);
    }
  };

  const isRecordUnchanged =
    JSON.stringify(record) === JSON.stringify(editedRecord);

  return (
    <Paper
      sx={{
        p: 4,
        width: "600px",
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
            fontSize: "0.85rem",
            fontWeight: 800,
          }}
        >
          {isEditing ? "EDIT RECORD" : "VIEW RECORD"}
        </Typography>
        <Typography
          sx={{ fontSize: "1.75rem", color: "#182959", fontWeight: 800 }}
        >
          {title}
        </Typography>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 1,
          mb: 2,
        }}
      >
        <TextField
          label={
            isEditing && !permanentlyReadOnlyFields.includes("contractor") ? (
              <>
                Contractor <span style={{ color: "red" }}>*</span>
              </>
            ) : (
              "Contractor"
            )
          }
          variant="outlined"
          fullWidth
          value={formData.contractor ?? ""}
          onChange={(e) => handleChange("contractor", e.target.value)}
          type="text"
          InputProps={{
            readOnly:
              !isEditing || permanentlyReadOnlyFields.includes("contractor"),
            sx: {
              color: isEditing ? "black" : "#182959",
            },
          }}
          InputLabelProps={{
            sx: {
              color: isEditing ? "#182959" : "grey",
            },
          }}
        />

        <TextField
          label={
            isEditing && !permanentlyReadOnlyFields.includes("company_id") ? (
              <>
                Company <span style={{ color: "red" }}>*</span>
              </>
            ) : (
              "Company"
            )
          }
          variant="outlined"
          fullWidth
          value={formData.company_id ?? ""}
          onChange={(e) => handleChange("company_id", e.target.value)}
          type="text"
          InputProps={{
            readOnly:
              !isEditing || permanentlyReadOnlyFields.includes("company_id"),
            sx: {
              color: isEditing ? "black" : "#182959",
            },
          }}
          InputLabelProps={{
            sx: {
              color: isEditing ? "#182959" : "grey",
            },
          }}
        />

        {isEditing ? (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label={
                isEditing && !permanentlyReadOnlyFields.includes("date") ? (
                  <>
                    <span style={{ color: isEditing ? "#182959" : "grey" }}>
                      Date
                    </span>
                    <span style={{ color: "red" }}>*</span>
                  </>
                ) : (
                  "Date"
                )
              }
              value={formData.date ? dayjs(formData.date) : null}
              onChange={(newValue) =>
                handleChange("date", newValue?.toISOString())
              }
              slotProps={{
                textField: { fullWidth: true, size: "medium" },
              }}
            />
          </LocalizationProvider>
        ) : (
          <TextField
            label="Date"
            variant="outlined"
            fullWidth
            value={formData.date ? formData.date.split("T")[0] : ""}
            onChange={(e) => handleChange("date", e.target.value)}
            type="text"
            InputProps={{
              readOnly:
                !isEditing || permanentlyReadOnlyFields.includes("date"),
              sx: {
                color: isEditing ? "black" : "#182959",
              },
            }}
            InputLabelProps={{
              sx: {
                color: isEditing ? "#182959" : "grey",
              },
            }}
          />
        )}
        <box />

        <TextField
          label={
            isEditing && !permanentlyReadOnlyFields.includes("manpower") ? (
              <>
                Safety Manpower <span style={{ color: "red" }}>*</span>
              </>
            ) : (
              "Safety Manpower"
            )
          }
          variant="outlined"
          fullWidth
          value={formData.manpower ?? ""}
          onChange={handleChange("manpower")}
          type="number"
          InputProps={{
            min: 0,
            readOnly:
              !isEditing || permanentlyReadOnlyFields.includes("manpower"),
            sx: {
              color: isEditing ? "black" : "#182959",
            },
          }}
          InputLabelProps={{
            sx: {
              color: isEditing ? "#182959" : "grey",
            },
          }}
        />

        <TextField
          label={
            isEditing && !permanentlyReadOnlyFields.includes("manhours") ? (
              <>
                Safety Manhours <span style={{ color: "red" }}>*</span>
              </>
            ) : (
              "Safety Manhours"
            )
          }
          variant="outlined"
          fullWidth
          value={formData.manhours ?? ""}
          onChange={handleChange("manhours")}
          type="number"
          InputProps={{
            min: 0,
            readOnly:
              !isEditing || permanentlyReadOnlyFields.includes("manhours"),
            sx: {
              color: isEditing ? "black" : "#182959",
            },
          }}
          InputLabelProps={{
            sx: {
              color: isEditing ? "#182959" : "grey",
            },
          }}
        />

        <TextField
          label="Status"
          variant="outlined"
          fullWidth
          value={formData.status_id}
          onChange={(e) => handleChange("status_id", e.target.value)}
          type="text"
          InputProps={{
            readOnly:
              !isEditing || permanentlyReadOnlyFields.includes("status_id"),
            sx: {
              color: isEditing ? "black" : "#182959",
            },
          }}
          InputLabelProps={{
            sx: {
              color: isEditing ? "#182959" : "grey",
            },
          }}
        />

        <Box />
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mt: 3,
        }}
      >
        <Button
          startIcon={isEditing ? <SaveIcon /> : <EditIcon />}
          sx={{
            color: isEditing ? "#1976d2" : "#FFA000",
            borderRadius: "999px",
            padding: "9px 18px",
            fontSize: "1rem",
            fontWeight: "bold",
            "&:hover": {
              color: isEditing ? "#1565c0" : "#FB8C00",
            },
          }}
          onClick={() => {
            if (isEditing) {
              if (!isRecordUnchanged) {
                handleSave(); // only save if changed
              } else {
                alert("No changes were made");
                setIsEditing(false);
              }
            } else {
              setIsEditing(true);
            }
          }}
        >
          {isEditing ? "SAVE" : "EDIT"}
        </Button>

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
          onClick={() => {
            const isUnchanged =
              JSON.stringify(record) === JSON.stringify(editedRecord);
            if (isEditing && !isUnchanged) {
              const confirmClose = window.confirm(
                "You have unsaved changes. Are you sure you want to close without saving?"
              );
              if (!confirmClose) return; // do nothing if user cancels
            }
            status(isUnchanged);
            onClose();
          }}
        >
          CLOSE
        </Button>
      </Box>
    </Paper>
  );
};

export default ViewUpdateSafetyWorkDataModal;
