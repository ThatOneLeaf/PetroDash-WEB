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

const ViewUpdateParentalLeaveModal = ({ title, record, onClose, status }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedRecord, setEditedRecord] = useState(record || {});

  const permanentlyReadOnlyFields = ["employee_id", "company_name", "status"];

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  if (!record) return null;

  // Initialize Data Options
  const fetchParentalData = async () => {
    try {
      setLoading(true);
      const response = await api.get("hr/parental_leave_records_by_status");
      console.log("Parental Data from API:", response.data);
      setData(response.data);
    } catch (error) {
      console.error("Error fetching Parental data:", error);
      setError("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParentalData();
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
      const response = await api.post("hr/edit_parental_leave", editedRecord);
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
            isEditing && !permanentlyReadOnlyFields.includes("employee_id") ? (
              <>
                Employee ID <span style={{ color: "red" }}>*</span>
              </>
            ) : (
              "Employee ID"
            )
          }
          variant="outlined"
          fullWidth
          value={editedRecord.employee_id ?? ""}
          onChange={(e) => handleChange("employee_id", e.target.value)}
          type="text"
          InputProps={{
            readOnly:
              !isEditing || permanentlyReadOnlyFields.includes("employee_id"),
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
          <FormControl fullWidth sx={{ minWidth: 120 }}>
            <InputLabel>
              {isEditing &&
              !permanentlyReadOnlyFields.includes("type_of_leave") ? (
                <>
                  <span style={{ color: isEditing ? "#182959" : "grey" }}>
                    Type of Leave
                  </span>
                  <span style={{ color: "red" }}>*</span>
                </>
              ) : (
                "Type of Leave"
              )}
            </InputLabel>
            <Select
              label={
                isEditing &&
                !permanentlyReadOnlyFields.includes("type_of_leave") ? (
                  <>
                    <span style={{ color: isEditing ? "#182959" : "grey" }}>
                      Type of Leave
                    </span>
                    <span style={{ color: "red" }}>*</span>
                  </>
                ) : (
                  "Type of Leave"
                )
              }
              value={editedRecord.type_of_leave ?? ""}
              onChange={(e) => handleChange("type_of_leave")(e)}
              sx={{ height: "55px" }}
              fullWidth
            >
              {uniqueOptions("type_of_leave").map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : (
          <TextField
            label="Type of Leave"
            variant="outlined"
            fullWidth
            value={editedRecord.type_of_leave}
            onChange={(e) => handleChange("type_of_leave", e.target.value)}
            type="text"
            InputProps={{
              readOnly:
                !isEditing ||
                permanentlyReadOnlyFields.includes("type_of_leave"),
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
            isEditing && !permanentlyReadOnlyFields.includes("days") ? (
              <>
                Days Availed <span style={{ color: "red" }}>*</span>
              </>
            ) : (
              "Days Availed"
            )
          }
          variant="outlined"
          fullWidth
          value={editedRecord.days ?? ""}
          onChange={handleChange("days")}
          type="number"
          InputProps={{
            min: 0,
            readOnly: !isEditing || permanentlyReadOnlyFields.includes("days"),
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
                      Date Availed
                    </span>
                    <span style={{ color: "red" }}>*</span>
                  </>
                ) : (
                  "Date Availed"
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
            label="Date Availed"
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

export default ViewUpdateParentalLeaveModal;
