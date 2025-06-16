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

const ViewUpdateTrainingModal = ({ title, record, onClose, status }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedRecord, setEditedRecord] = useState(record || {});

  const permanentlyReadOnlyFields = ["training_title", "company_id", "status"];

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  if (!record) return null;

  // Initialize Data Options
  const fetchTrainingData = async () => {
    try {
      setLoading(true);
      const response = await api.get("hr/training_records_by_status");
      console.log("Training Data from API:", response.data);
      setData(response.data);
    } catch (error) {
      console.error("Error fetching Training data:", error);
      setError("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainingData();
  }, []);

  const uniqueOptions = (key) => {
    return Array.from(new Set(data.map((item) => item[key]))).map((val) => ({
      label: val,
      value: val,
    }));
  };

  const handleChange = (field) => (event) => {
    setEditedRecord((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleDateChange = (field) => (newValue) => {
    setEditedRecord((prev) => ({
      ...prev,
      [field]: newValue ? newValue : null,
    }));
  };

  const handleSave = async () => {
    console.log("Old Data:", record);
    console.log("Updated Data:", editedRecord);

    try {
      const response = await api.post("hr/edit_training", editedRecord);
      console.log(response);
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
            isEditing &&
            !permanentlyReadOnlyFields.includes("training_title") ? (
              <>
                Training Title <span style={{ color: "red" }}>*</span>
              </>
            ) : (
              "Training Title"
            )
          }
          variant="outlined"
          fullWidth
          value={editedRecord.training_title ?? ""}
          onChange={(e) => handleChange("training_title", e.target.value)}
          type="text"
          InputProps={{
            readOnly:
              !isEditing ||
              permanentlyReadOnlyFields.includes("training_title"),
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
          value={editedRecord.company_id ?? ""}
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
              value={editedRecord.date ? dayjs(editedRecord.date) : null}
              onChange={handleDateChange("date")}
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
            value={
              editedRecord.date
                ? dayjs(editedRecord.date).format("MM-DD-YYYY")
                : ""
            }
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
            isEditing &&
            !permanentlyReadOnlyFields.includes("training_hours") ? (
              <>
                Training Hours <span style={{ color: "red" }}>*</span>
              </>
            ) : (
              "Training Hours"
            )
          }
          variant="outlined"
          fullWidth
          value={editedRecord.training_hours ?? ""}
          onChange={handleChange("training_hours")}
          type="number"
          InputProps={{
            min: 0,
            readOnly:
              !isEditing ||
              permanentlyReadOnlyFields.includes("training_hours"),
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
            isEditing &&
            !permanentlyReadOnlyFields.includes("number_of_participants") ? (
              <>
                Number of Participants <span style={{ color: "red" }}>*</span>
              </>
            ) : (
              "Number of Participants"
            )
          }
          variant="outlined"
          fullWidth
          value={editedRecord.number_of_participants ?? ""}
          onChange={handleChange("number_of_participants")}
          type="number"
          InputProps={{
            min: 0,
            readOnly:
              !isEditing ||
              permanentlyReadOnlyFields.includes("number_of_participants"),
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
          value={editedRecord.status_id}
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

export default ViewUpdateTrainingModal;
