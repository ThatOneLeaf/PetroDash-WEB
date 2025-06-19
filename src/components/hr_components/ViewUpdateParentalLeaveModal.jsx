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

  const permanentlyReadOnlyFields = ["employee_id", "company_id", "status"];

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectRemarks, setRejectRemarks] = useState("");

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

  const handleApprove = async () => {
    const confirm = window.confirm(
      "Are you sure you want to approve this record?"
    );
    if (!confirm) return;

    try {
      onClose(); // CLOSE MODAL HERE
    } catch (error) {
      const msg = error.response?.data?.detail || error.message;
      alert(`Failed to approve: ${msg}`);
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectRemarks.trim()) {
      alert("Please enter remarks before rejecting.");
      return;
    }

    try {
      if (updateStatus) updateStatus("REJ");
      setRejectDialogOpen(false);
      onClose(); // CLOSE MODAL HERE
    } catch (error) {
      const msg = error.response?.data?.detail || error.message;
      alert(`Failed to reject: ${msg}`);
    }
  };

  const handleCloseClick = () => {
    if (isEditing && !isUnchanged) {
      const confirmClose = window.confirm(
        "You have unsaved changes. Close anyway?"
      );
      if (!confirmClose) return;
    }
    if (updateStatus) updateStatus(isUnchanged);
    onClose();
  };
  return (
    <Paper sx={{ p: 4, width: 600, borderRadius: 2, position: "relative" }}>
      {/* Close Button */}
      <Button
        onClick={handleCloseClick}
        sx={{
          position: "absolute",
          top: 16,
          right: 16,
          minWidth: "auto",
          padding: 0,
          color: "grey.600",
        }}
      >
        ✕
      </Button>

      {/* Title */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          mb: 3,
        }}
      >
        <Typography sx={{ fontSize: "0.85rem", fontWeight: 800 }}>
          {isEditing ? "EDIT RECORD" : "VIEW RECORD"}
        </Typography>
        <Typography
          sx={{ fontSize: "1.75rem", color: "#182959", fontWeight: 800 }}
        >
          Leave Record
        </Typography>
      </Box>

      {/* Status and Remarks */}
      <Box mb={2} width="100%">
        <Typography variant="body2" fontWeight={600}>
          Status:{" "}
          <span
            style={{
              color:
                status === "APP" ? "green" : status === "REJ" ? "red" : "#555",
            }}
          >
            {status || "PENDING"}
          </span>
        </Typography>
        {remarks && (
          <Box mt={1} p={1} bgcolor="grey.100" borderRadius={1}>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              Remarks:
            </Typography>
            <Typography variant="body2" color="text.primary">
              {remarks}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Form Fields */}
      <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
        <TextField
          label={getLabel("Employee ID", "employee_id")}
          variant="outlined"
          fullWidth
          value={editedRecord.employee_id ?? ""}
          onChange={(e) => handleChange("employee_id", e.target.value)}
          type="text"
          InputProps={getInputProps("employee_id")}
          InputLabelProps={getLabelProps()}
        />

        <TextField
          label={getLabel("Company", "company_id")}
          variant="outlined"
          fullWidth
          value={editedRecord.company_id ?? ""}
          onChange={(e) => handleChange("company_id", e.target.value)}
          type="text"
          InputProps={getInputProps("company_id")}
          InputLabelProps={getLabelProps()}
        />

        {isEditable("type_of_leave") ? (
          <FormControl fullWidth sx={{ gridColumn: "1 / -1" }}>
            <InputLabel>
              {getLabel("Type of Leave", "type_of_leave")}
            </InputLabel>
            <Select
              label="Type of Leave"
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
            value={editedRecord.type_of_leave ?? ""}
            onChange={(e) => handleChange("type_of_leave", e.target.value)}
            type="text"
            InputProps={getInputProps("type_of_leave")}
            InputLabelProps={getLabelProps()}
          />
        )}

        <TextField
          label={getLabel("Days Availed", "days")}
          variant="outlined"
          fullWidth
          value={editedRecord.days ?? ""}
          onChange={handleChange("days")}
          type="number"
          InputProps={{ ...getInputProps("days"), min: 0 }}
          InputLabelProps={getLabelProps()}
        />

        {isEditable("date") ? (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label={getLabel("Date Availed", "date")}
              value={editedRecord.date ? dayjs(editedRecord.date) : null}
              onChange={handleDateChange("date")}
              slotProps={{ textField: { fullWidth: true, size: "medium" } }}
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
            InputProps={getInputProps("date")}
            InputLabelProps={getLabelProps()}
          />
        )}

        <TextField
          label="Status"
          variant="outlined"
          fullWidth
          value={editedRecord.status_id ?? ""}
          onChange={(e) => handleChange("status_id", e.target.value)}
          type="text"
          InputProps={getInputProps("status_id")}
          InputLabelProps={getLabelProps()}
        />
      </Box>

      {/* Footer Actions */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mt={4}
      >
        {/* Left Button: Save or Edit */}
        <Box display="flex" gap={1}>
          <Button
            startIcon={isEditing ? <SaveIcon /> : <EditIcon />}
            onClick={async () => {
              if (isReadOnly) return;
              if (isEditing) {
                if (!isUnchanged) {
                  await handleSave();
                } else {
                  alert("No changes made.");
                  setIsEditing(false);
                }
              } else {
                setIsEditing(true);
              }
            }}
            disabled={isReadOnly}
          >
            {isEditing ? "Save" : "Edit"}
          </Button>
        </Box>

        {/* Right Buttons: Approve / Revise */}
        {!isReadOnly && !isEditing && (
          <Box display="flex" gap={1}>
            <Button variant="outlined" color="success" onClick={handleApprove}>
              Approve
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={() => setRejectDialogOpen(true)}
            >
              Revise
            </Button>
          </Box>
        )}

        {isReadOnly && (
          <Typography variant="caption" color="error">
            This record has been approved and cannot be edited.
          </Typography>
        )}
      </Box>

      {/* Reject Remarks Dialog */}
      <Dialog
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Request to Revise Record</DialogTitle>
        <DialogContent>
          <TextField
            label="Remarks"
            multiline
            fullWidth
            rows={4}
            value={rejectRemarks}
            onChange={(e) => setRejectRemarks(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleRejectConfirm}
            variant="contained"
            color="error"
          >
            Confirm Revision Request
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default ViewUpdateParentalLeaveModal;
