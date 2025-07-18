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
import StatusChip from "../../components/StatusChip";

import { useAuth } from "../../contexts/AuthContext";

//added
import Overlay from "../../components/modal";

import ConfirmModal from "./ConfirmModal";
import SuccessModal from "../../components/hr_components/SuccessModal";
import ErrorModal from "../../components/hr_components/ErrorModal";

const ViewUpdateEmployeeModal = ({
  title,
  record,
  onClose,
  status,
  onSuccess,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const permanentlyReadOnlyFields = ["employee_id", "company_id", "status"];

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  //added
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [successTitle, setSuccessTitle] = useState("");
  const [successColor, setSuccessColor] = useState("#2B8C37");
  const [modalType, setModalType] = useState("");
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorTitle, setErrorTitle] = useState("");
  const statuses = ["URH", "FRH", "APP"];
  const [nextStatus, setNextStatus] = useState("");
  const [remarks, setRemarks] = useState("");
  const recordIdKey = Object.keys(record)[0];
  const [shouldReset, setShouldReset] = useState(false);
  const [pendingSuccessCallback, setPendingSuccessCallback] = useState(null);

  const statusIdToName = {
    URH: "Under review (head level)",
    FRH: "For Revision (Head)",
    APP: "Approved",
  };

  if (!record) return null;

  const getRecordWithStatus = (record) => ({
    ...record,
    status: statusIdToName[record?.status_id] || record?.status || "",
  });

  const [editedRecord, setEditedRecord] = useState(getRecordWithStatus(record));

  const { user } = useAuth();
  const canApproveOrRevise =
    Array.isArray(user?.roles) &&
    user.roles.some((role) => ["R03", "R04"].includes(role));
  const isSiteApprover =
    ["Under review (site)", "For Revision (Site)"].includes(
      editedRecord.status
    ) && user.roles.includes("R04");

  const isHeadApprover =
    ["Under review (head level)", "For Revision (Head)"].includes(
      editedRecord.status
    ) && user.roles.includes("R03");

  const summaryData = [
    { label: "Company ID", value: String(editedRecord.company_id || "N/A") },
    { label: "Employee ID", value: String(editedRecord.employee_id || "N/A") },
    {
      label: "Gender",
      value: String(
        editedRecord.gender === "F"
          ? "Female"
          : editedRecord.gender === "M"
          ? "Male"
          : "N/A"
      ),
    },
    {
      label: "Position",
      value: String(
        editedRecord.position_id === "RF"
          ? "Rank-and-File"
          : editedRecord.position_id === "MM"
          ? "Middle Management"
          : editedRecord.position_id === "SM"
          ? "Senior Management"
          : "N/A"
      ),
    },
    {
      label: "Birthdate",
      value: editedRecord.birthdate
        ? dayjs(editedRecord.birthdate).format("MM/DD/YYYY")
        : "N/A",
    },

    {
      label: "Category",
      value: String(
        editedRecord.p_np === "P"
          ? "Professional"
          : editedRecord.p_np === "NP"
          ? "Non-Professional"
          : "N/A"
      ),
    },
    { label: "Status", value: String(editedRecord.employment_status || "N/A") },
    {
      label: "Tenure Start",
      value: editedRecord.start_date
        ? dayjs(editedRecord.start_date).format("MM/DD/YYYY")
        : "N/A",
    },
    {
      label: "Tenure End",
      value: editedRecord.end_date
        ? dayjs(editedRecord.end_date).format("MM/DD/YYYY")
        : "N/A",
    },
  ];

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

  const genderOptions = [
    { label: "Male", value: "M" },
    { label: "Female", value: "F" },
  ];

  const positionOptions = [
    {
      label: "Rank-and-File",
      value: "RF",
    },
    {
      label: "Middle Management",
      value: "MM",
    },
    {
      label: "Senior Management",
      value: "SM",
    },
  ];

  const employementCategoryOptions = [
    {
      label: "Professional",
      value: "P",
    },
    {
      label: "Non-Professional",
      value: "NP",
    },
  ];

  const employementStatusOptions = [
    {
      label: "Permanent",
      value: "Permanent",
    },
    {
      label: "Temporary",
      value: "Temporary",
    },
  ];

  const handleChange = (field) => (event) => {
    setEditedRecord((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleDateChange = (field) => (newValue) => {
    const isoDate = newValue ? dayjs(newValue).format("YYYY-MM-DD") : null;

    setEditedRecord((prev) => ({
      ...prev,
      [field]: isoDate,
    }));
  };

  const handleSave = async () => {
    console.log(editedRecord);
    /* VALIDATION */
    const MIN_DATE = dayjs("1994-09-29");
    const MIN_BIRTHDATE = dayjs("1900-01-01");
    const today = dayjs();

    const {
      employee_id,
      gender,
      position_id,
      birthdate,
      p_np,
      employment_status,
      start_date,
      end_date,
    } = editedRecord;
    console.log("start_date");
    console.log(start_date);

    const isInOptions = (value, key) =>
      uniqueOptions(key).some((option) => option.value === value);

    const isValidGender = genderOptions.some((opt) => opt.value === gender);
    const isValidPosition = positionOptions.some(
      (opt) => opt.value === position_id
    );

    const isValidBirthdate =
      birthdate &&
      dayjs(birthdate).isValid() &&
      dayjs(birthdate).isBefore(today) &&
      dayjs(birthdate).isAfter(MIN_BIRTHDATE);

    const isValidCategory = employementCategoryOptions.some(
      (opt) => opt.value === p_np
    );
    const isValidStatus = employementStatusOptions.some(
      (opt) => opt.value === employment_status
    );

    const isValidTenureStart =
      start_date &&
      dayjs(start_date).isValid() &&
      dayjs(start_date).isAfter(MIN_DATE);
    const isValidTenureEnded =
      !end_date ||
      (dayjs(end_date).isValid() && dayjs(end_date).isSameOrAfter(start_date));

    if (!isValidGender) {
      setErrorMessage("Please select a valid Gender.");
      setIsErrorModalOpen(true);
      return;
    }

    if (!isValidPosition) {
      setErrorMessage("Please select a valid Position.");
      setIsErrorModalOpen(true);
      return;
    }

    if (!isValidBirthdate) {
      setErrorMessage("Please enter a valid Birthdate");
      setIsErrorModalOpen(true);
      return;
    }

    if (!isValidCategory) {
      setErrorMessage("Please select a valid Employee Category.");
      setIsErrorModalOpen(true);
      return;
    }

    if (!isValidStatus) {
      setErrorMessage("Please select a valid Employee Status.");
      setIsErrorModalOpen(true);
      return;
    }

    if (!isValidTenureStart) {
      setErrorMessage("Tenure Start must be a valid date.");
      setIsErrorModalOpen(true);
      return;
    }

    if (!isValidTenureEnded) {
      setErrorMessage(
        "Tenure Ended must be the same as or after Tenure Start."
      );
      setIsErrorModalOpen(true);
      return;
    }

    try {
      const response = await api.post("hr/edit_employability", editedRecord);

      return true;
    } catch (error) {
      const errorMessage =
        error.response?.data?.detail ||
        error.message ||
        "Unknown error occurred";
      return false;
      //alert(`Failed to save record: ${errorMessage}`);
    }
  };

  //remove added status field for comparison
  const stripStatus = (obj) => {
    const { status, ...rest } = obj;
    return rest;
  };
  const isRecordUnchanged = () =>
    JSON.stringify(stripStatus(record)) ===
    JSON.stringify(stripStatus(editedRecord));
  {
    /* ADDED */
  }

  const fetchNextStatus = (action) => {
    let newStatus = "";
    if (action === "approve") {
      switch (editedRecord.status) {
        case "For Revision (Head)":
          newStatus = statuses[0]; // "URH"
          break;
        case "Under review (head level)":
          newStatus = statuses[2]; // "APP"
          break;
      }
    } else if (action === "revise") {
      switch (editedRecord.status) {
        case "Under review (head level)":
          newStatus = statuses[1]; // "FRH"
          break;
      }
    }
    return newStatus;
  };

  //statuses = ["URS","FRS","URH","FRH","APP"]

  const handleStatusUpdate = async (action) => {
    const newStatus = fetchNextStatus(action);

    if (newStatus) {
      setNextStatus(newStatus);
      console.log("Updated status to:", newStatus);
    } else {
      console.warn("No matching status transition found.");
    }

    try {
      if (action === "revise") {
        if (!remarks) {
          setErrorTitle("Remarks Required");
          setErrorMessage("Remarks is required for the status update");
          setIsErrorModalOpen(true);
          return;
        }
      } else {
        const confirm = window.confirm(
          "Are you sure you want to approve this record?"
        );
        if (!confirm) return; // Fixed: changed 'confirmed' to 'confirm'
      }

      const payload = {
        record_id: record[recordIdKey]?.toString().trim(),
        new_status: newStatus.trim(),
        remarks: remarks.trim(),
      };

      const response = await api.post("/usable_apis/update_status", payload);

      // alert(response.data.message);
      // status(false);

      // Show appropriate modal for revision
      if (action === "revise") {
        setSuccessMessage("Revision (Head) Requested!");
        setSuccessTitle("The record has been sent for revision (head).");
        setSuccessColor("#182959");
        setIsSuccessModalOpen(true);
        setShouldReset(true);
      } else {
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      console.error("Error updating record status:", error);
      alert(error?.response?.data?.detail || "Update Status Failed.");
    }
  };

  const handleApproveConfirm = async () => {
    setIsModalOpen(false);
    const newStatus = fetchNextStatus("approve");
    try {
      const payload = {
        record_id: record[recordIdKey]?.toString().trim(),
        new_status: newStatus.trim(),
        remarks: remarks.trim(),
      };
      const response = await api.post("/usable_apis/update_status", payload);
      console.log(payload);

      setSuccessMessage("Record Approved Successfully!");
      setSuccessTitle("The record has been successfully approved.");
      setIsSuccessModalOpen(true);
      setShouldReset(true);
    } catch (error) {
      alert(error?.response?.data?.detail || "Update Status Failed.");
    }
  };

  return (
    <Paper
      sx={{
        p: 4,
        width: "90vh", //added
        borderRadius: "16px",
        bgcolor: "white",
        maxHeight: "100vh", //added
        overflowY: "auto", //added
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
              {genderOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
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
              {positionOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
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
              onChange={handleDateChange("birthdate")}
              minDate={dayjs("1900-01-01")}
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
              editedRecord.birthdate
                ? dayjs(editedRecord.birthdate).format("MM/DD/YYYY")
                : ""
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
              {employementCategoryOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
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
              {employementStatusOptions.map((option) => (
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
              minDate={dayjs("1994-09-29")}
              onChange={handleDateChange("start_date")}
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
                ? dayjs(editedRecord.start_date).format("MM/DD/YYYY")
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
              onChange={handleDateChange("end_date")}
              minDate={dayjs("1994-09-29")}
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
                ? dayjs(editedRecord.end_date).format("MM/DD/YYYY")
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

        {editedRecord.status === "For Revision (Head)" ? (
          <TextField
            label="Remarks"
            variant="outlined"
            fullWidth
            multiline
            maxRows={4}
            rows={4}
            value={editedRecord.remarks}
            type="text"
            InputProps={{
              readOnly: true,
              sx: {
                color: isEditing ? "black" : "#182959",
              },
            }}
            InputLabelProps={{
              sx: {
                color: isEditing ? "#182959" : "grey",
              },
            }}
            sx={{
              gridColumn: "1 / -1",
            }}
          />
        ) : null}

        {/*added */}
        <Box
          sx={{
            p: 0.5,
          }}
        >
          <Typography
            sx={{
              fontSize: "0.85rem",
              color: "grey",
            }}
          >
            Status:
          </Typography>
          <StatusChip status={record.status_id} />
        </Box>

        <Box />
      </Box>

      {/*added */}

      <Box sx={{ display: "flex", flexDirection: "column", mt: 3 }}>
        {editedRecord.status !== "Approved" && (
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            {/* EDIT/SAVE button - Hidden if Under Review */}
            {editedRecord.status !== "Under review (site)" &&
              editedRecord.status !== "Under review (head level)" && (
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
                  onClick={async () => {
                    if (isEditing) {
                      if (!isRecordUnchanged()) {
                        const saveSuccess = await handleSave();

                        if (
                          saveSuccess &&
                          (editedRecord.status === "For Revision (Site)" ||
                            editedRecord.status === "For Revision (Head)")
                        ) {
                          setSuccessMessage("");
                          setSuccessTitle(
                            "The record has been successfully updated."
                          );
                          setShouldReset(true);
                          setIsSuccessModalOpen(true);
                        }
                      } else {
                        setIsEditing(false);

                        if (
                          editedRecord.status === "For Revision (Site)" ||
                          editedRecord.status === "For Revision (Head)"
                        ) {
                          setSuccessMessage("");
                          setSuccessTitle(
                            "No changes were made to the record."
                          );
                          setIsSuccessModalOpen(true);
                        }
                      }
                    } else {
                      setIsEditing(true);
                    }
                  }}
                >
                  {isEditing ? "SAVE" : "EDIT"}
                </Button>
              )}

            {/* APPROVE & REVISE buttons */}

            {((canApproveOrRevise && isSiteApprover) ||
              (canApproveOrRevise && isHeadApprover)) && (
              <Box>
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
                    setModalType("approve");
                    setIsModalOpen(true);
                  }}
                >
                  Approve
                </Button>

                {editedRecord.status !== "For Revision (Site)" &&
                  editedRecord.status !== "For Revision (Head)" && (
                    <Button
                      variant="contained"
                      sx={{
                        marginLeft: 1,
                        backgroundColor: "#182959",
                        borderRadius: "999px",
                        padding: "9px 18px",
                        fontSize: "1rem",
                        fontWeight: "bold",
                        "&:hover": {
                          backgroundColor: "#0f1a3c",
                        },
                      }}
                      onClick={() => {
                        setModalType("revise");
                        setIsModalOpen(true);
                      }}
                    >
                      Revise
                    </Button>
                  )}
              </Box>
            )}
          </Box>
        )}

        {/* Approved message */}
        {editedRecord.status === "Approved" && (
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
            <Typography
              sx={{
                fontSize: "0.9rem",
                color: "#FF0000",
                fontStyle: "italic",
              }}
            >
              This record has been approved and cannot be edited.
            </Typography>
          </Box>
        )}

        {isModalOpen && modalType === "revise" && (
          <Overlay onClose={() => setIsModalOpen(false)}>
            <Paper
              sx={{
                p: 4,
                width: "500px",
                borderRadius: "16px",
                bgcolor: "white",
              }}
            >
              <Typography
                sx={{ fontSize: "2rem", color: "#182959", fontWeight: 800 }}
              >
                Revision Request
              </Typography>
              <TextField
                sx={{
                  mt: 2,
                  mb: 2,
                }}
                label={
                  <>
                    {" "}
                    Remarks <span style={{ color: "red" }}>*</span>{" "}
                  </>
                }
                variant="outlined"
                fullWidth
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                multiline
                maxRows={4}
              />
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <Button
                  sx={{
                    color: "#182959",
                    borderRadius: "999px",
                    padding: "9px 18px",
                    fontSize: "1rem",
                    fontWeight: "bold",
                    "&:hover": {
                      color: "#0f1a3c",
                    },
                  }}
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  sx={{
                    marginLeft: 1,
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
                    setIsModalOpen(false);
                    handleStatusUpdate("revise");
                  }}
                >
                  Confirm
                </Button>
              </Box>
            </Paper>
          </Overlay>
        )}

        {isModalOpen && modalType === "approve" && (
          <Overlay onClose={() => setIsModalOpen(false)}>
            <ConfirmModal
              open={isModalOpen}
              title={"Approval Confirmation"}
              message={"Are you sure you want to approve this employee record?"}
              onConfirm={handleApproveConfirm}
              onCancel={() => setIsModalOpen(false)}
              summaryData={summaryData}
            />
          </Overlay>
        )}

        {isErrorModalOpen && (
          <Overlay onClose={() => setIsErrorModalOpen(false)}>
            <ErrorModal
              open={isErrorModalOpen}
              title={errorTitle}
              errorMessage={errorMessage}
              onClose={() => setIsErrorModalOpen(false)}
            />
          </Overlay>
        )}

        {isSuccessModalOpen && (
          <Overlay onClose={() => setIsSuccessModalOpen(false)}>
            <SuccessModal
              open={isSuccessModalOpen}
              title={successTitle}
              successMessage={successMessage}
              color={successColor}
              onClose={() => {
                setIsSuccessModalOpen(false);
                onClose();
                if (shouldReset && onSuccess) {
                  onSuccess();
                  setShouldReset(false);
                }
              }}
            />
          </Overlay>
        )}
      </Box>
    </Paper>
  );
};

export default ViewUpdateEmployeeModal;
