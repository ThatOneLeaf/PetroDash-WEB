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

const ViewUpdateEmployeeModal = ({ title, record, onClose, status }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedRecord, setEditedRecord] = useState(record || {});
  /*
  const [formData, setFormData] = useState({
    company_id: "", // get current  company of emp
    employee_id: "",
    gender: "",
    birthdate: null,
    position_id: "",
    p_np: "",
    employeeStatus: "",
    start_date: null,
    end_date: null,
    status_id: "",
  });*/

  const permanentlyReadOnlyFields = ["employee_id", "company_id", "status"];

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  if (!record) return null;

  // Initialize Data Options
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
    /*
    const newFormData = {
      ...formData,
      [field]: event.target.value,
    };
    setFormData(newFormData);*/

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
    console.log("Old Data:", record);
    console.log("Updated Data:", editedRecord);

    try {
      const response = await api.post("hr/edit_employability", editedRecord);
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
              {isEditing && !permanentlyReadOnlyFields.includes("gender") ? (
                <>
                  <span style={{ color: isEditing ? "#182959" : "grey" }}>
                    Gender
                  </span>
                  <span style={{ color: "red" }}>*</span>
                </>
              ) : (
                "Gender"
              )}
            </InputLabel>
            <Select
              label={
                isEditing && !permanentlyReadOnlyFields.includes("gender") ? (
                  <>
                    <span style={{ color: isEditing ? "#182959" : "grey" }}>
                      Gender
                    </span>
                    <span style={{ color: "red" }}>*</span>
                  </>
                ) : (
                  "Gender"
                )
              }
              value={editedRecord.gender ?? ""}
              onChange={(e) => handleChange("gender")(e)}
              sx={{ height: "55px" }}
              fullWidth
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
        ) : (
          <TextField
            label="Gender"
            variant="outlined"
            fullWidth
            value={
              editedRecord.gender.toUpperCase() === "M"
                ? "Male"
                : editedRecord.gender.toUpperCase() === "F"
                ? "Female"
                : editedRecord.gender.toUpperCase()
            }
            onChange={(e) => handleChange("gender", e.target.value)}
            type="text"
            InputProps={{
              readOnly:
                !isEditing || permanentlyReadOnlyFields.includes("gender"),
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

        {isEditing ? (
          <FormControl fullWidth sx={{ minWidth: 120 }}>
            <InputLabel>
              {isEditing &&
              !permanentlyReadOnlyFields.includes("position_id") ? (
                <>
                  <span style={{ color: isEditing ? "#182959" : "grey" }}>
                    Position
                  </span>
                  <span style={{ color: "red" }}>*</span>
                </>
              ) : (
                "Position"
              )}
            </InputLabel>
            <Select
              label={
                isEditing &&
                !permanentlyReadOnlyFields.includes("position_id") ? (
                  <>
                    <span style={{ color: isEditing ? "#182959" : "grey" }}>
                      Position
                    </span>
                    <span style={{ color: "red" }}>*</span>
                  </>
                ) : (
                  "Position"
                )
              }
              value={editedRecord.position_id ?? ""}
              onChange={(e) => handleChange("position_id")(e)}
              sx={{ height: "55px" }}
              fullWidth
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
        ) : (
          <TextField
            label="Position"
            variant="outlined"
            fullWidth
            value={
              editedRecord.position_id.toUpperCase() === "RF"
                ? "Rank-And-File"
                : editedRecord.position_id.toUpperCase() === "MM"
                ? "Middle Management"
                : editedRecord.position_id.toUpperCase() === "SM"
                ? "Senior Management"
                : editedRecord.position_id.toUpperCase()
            }
            onChange={(e) => handleChange("position_id", e.target.value)}
            type="text"
            InputProps={{
              readOnly:
                !isEditing || permanentlyReadOnlyFields.includes("position_id"),
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

        {isEditing ? (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label={
                isEditing &&
                !permanentlyReadOnlyFields.includes("birthdate") ? (
                  <>
                    <span style={{ color: isEditing ? "#182959" : "grey" }}>
                      Birthdate
                    </span>
                    <span style={{ color: "red" }}>*</span>
                  </>
                ) : (
                  "Birthdate"
                )
              }
              value={
                editedRecord.birthdate ? dayjs(editedRecord.birthdate) : null
              }
              onChange={(newValue) =>
                handleChange("birthdate", newValue?.toISOString())
              }
              slotProps={{
                textField: { fullWidth: true, size: "medium" },
              }}
            />
          </LocalizationProvider>
        ) : (
          <TextField
            label="Birthdate"
            variant="outlined"
            fullWidth
            value={
              editedRecord.birthdate ? editedRecord.birthdate.split("T")[0] : ""
            }
            onChange={(e) => handleChange("birthdate", e.target.value)}
            type="text"
            InputProps={{
              readOnly:
                !isEditing || permanentlyReadOnlyFields.includes("birthdate"),
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
        <Box />

        {isEditing ? (
          <FormControl fullWidth sx={{ minWidth: 120 }}>
            <InputLabel>
              {isEditing && !permanentlyReadOnlyFields.includes("p_np") ? (
                <>
                  <span style={{ color: isEditing ? "#182959" : "grey" }}>
                    Employment Category
                  </span>
                  <span style={{ color: "red" }}>*</span>
                </>
              ) : (
                "Employment Category"
              )}
            </InputLabel>
            <Select
              label={
                isEditing && !permanentlyReadOnlyFields.includes("p_np") ? (
                  <>
                    <span style={{ color: isEditing ? "#182959" : "grey" }}>
                      Employment Category
                    </span>
                    <span style={{ color: "red" }}>*</span>
                  </>
                ) : (
                  "Employment Category"
                )
              }
              value={editedRecord.p_np ?? ""}
              onChange={(e) => handleChange("p_np")(e)}
              sx={{ height: "55px" }}
              fullWidth
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
        ) : (
          <TextField
            label="Employment Category"
            variant="outlined"
            fullWidth
            value={
              editedRecord.p_np.toUpperCase() === "P"
                ? "Professional"
                : editedRecord.p_np.toUpperCase() === "NP"
                ? "Non-Professional"
                : editedRecord.p_np.toUpperCase()
            }
            onChange={(e) => handleChange("p_np", e.target.value)}
            type="text"
            InputProps={{
              readOnly:
                !isEditing || permanentlyReadOnlyFields.includes("p_np"),
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

        {isEditing ? (
          <FormControl fullWidth sx={{ minWidth: 120 }}>
            <InputLabel>
              {isEditing &&
              !permanentlyReadOnlyFields.includes("employment_status") ? (
                <>
                  <span style={{ color: isEditing ? "#182959" : "grey" }}>
                    Employment Status
                  </span>
                  <span style={{ color: "red" }}>*</span>
                </>
              ) : (
                "Employment Status"
              )}
            </InputLabel>
            <Select
              label={
                isEditing &&
                !permanentlyReadOnlyFields.includes("employment_status") ? (
                  <>
                    <span style={{ color: isEditing ? "#182959" : "grey" }}>
                      Employment Status
                    </span>
                    <span style={{ color: "red" }}>*</span>
                  </>
                ) : (
                  "Employment Status"
                )
              }
              value={editedRecord.employment_status ?? ""}
              onChange={(e) => handleChange("employment_status")(e)}
              sx={{ height: "55px" }}
              fullWidth
            >
              {uniqueOptions("employment_status").map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : (
          <TextField
            label="Employment Status"
            variant="outlined"
            fullWidth
            value={editedRecord.employment_status}
            onChange={(e) => handleChange("employment_status", e.target.value)}
            type="text"
            InputProps={{
              readOnly:
                !isEditing ||
                permanentlyReadOnlyFields.includes("employment_status"),
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

        {isEditing ? (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label={
                isEditing &&
                !permanentlyReadOnlyFields.includes("start_date") ? (
                  <>
                    <span style={{ color: isEditing ? "#182959" : "grey" }}>
                      Start Date
                    </span>
                    <span style={{ color: "red" }}>*</span>
                  </>
                ) : (
                  "Start Date"
                )
              }
              value={
                editedRecord.start_date ? dayjs(editedRecord.start_date) : null
              }
              onChange={(newValue) =>
                handleChange("start_date", newValue?.toISOString())
              }
              slotProps={{
                textField: { fullWidth: true, size: "medium" },
              }}
            />
          </LocalizationProvider>
        ) : (
          <TextField
            label="Start Date"
            variant="outlined"
            fullWidth
            value={
              editedRecord.start_date
                ? editedRecord.start_date.split("T")[0]
                : ""
            }
            onChange={(e) => handleChange("start_date", e.target.value)}
            type="text"
            InputProps={{
              readOnly:
                !isEditing || permanentlyReadOnlyFields.includes("start_date"),
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

        {isEditing ? (
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label={
                isEditing && !permanentlyReadOnlyFields.includes("end_date") ? (
                  <>
                    <span style={{ color: isEditing ? "#182959" : "grey" }}>
                      End Date
                    </span>
                    <span style={{ color: "red" }}>*</span>
                  </>
                ) : (
                  "End Date"
                )
              }
              value={
                editedRecord.end_date ? dayjs(editedRecord.end_date) : null
              }
              onChange={(newValue) =>
                handleChange("end_date", newValue?.toISOString())
              }
              slotProps={{
                textField: { fullWidth: true, size: "medium" },
              }}
            />
          </LocalizationProvider>
        ) : (
          <TextField
            label="End Date"
            variant="outlined"
            fullWidth
            value={
              editedRecord.end_date
                ? editedRecord.end_date.split("T")[0]
                : "N/A"
            }
            onChange={(e) => handleChange("end_date", e.target.value)}
            type="text"
            InputProps={{
              readOnly:
                !isEditing || permanentlyReadOnlyFields.includes("end_date"),
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

export default ViewUpdateEmployeeModal;
