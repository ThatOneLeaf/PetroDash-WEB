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

//added
import Overlay from "../../components/modal";

import ConfirmModal from "./ConfirmModal";
import SuccessModal from "../../components/hr_components/SuccessModal";
import ErrorModal from "../../components/hr_components/ErrorModal";

import { useAuth } from "../../contexts/AuthContext";

const ViewUpdateParentalLeaveModal = ({
  title,
  record,
  onClose,
  status,
  onSuccess,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const permanentlyReadOnlyFields = ["employee_id", "company_id", "status"];

  //const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  //const [rejectRemarks, setRejectRemarks] = useState("");

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
    { label: "Employee ID", value: String(editedRecord.employee_id || "N/A") },
    {
      label: "Type of Leave",
      value: String(editedRecord.type_of_leave || "N/A"),
    },
    { label: "Days Availed", value: String(editedRecord.days || "N/A") },
    {
      label: "Date Availed",
      value: editedRecord.date
        ? dayjs(editedRecord.date).format("MM/DD/YYYY")
        : "N/A",
    },
  ];

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

  const typeOfLeaveOptions = [
    { label: "Maternity", value: "Maternity" },
    { label: "Paternity", value: "Paternity" },
    { label: "SPL", value: "SPL" },
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
    /* VALIDATIONS*/

    console.log(editedRecord);

    const MIN_DATE = dayjs("1994-09-29");

    const { employeeId, date, days, type_of_leave } = editedRecord;

    const isValidLeaveType = typeOfLeaveOptions.some(
      (opt) => opt.value === type_of_leave
    );
    const isValidDate = date && dayjs(date).isSameOrAfter(MIN_DATE);

    const isValidDays = days !== "" && !isNaN(days) && Number(days) > 0;

    if (!type_of_leave || !isValidLeaveType) {
      setErrorMessage("Please select a valid Type of Leave.");
      setIsErrorModalOpen(true);
      return;
    }

    if (!isValidDays) {
      setErrorMessage("Days Availed must be a number greater than 0.");
      setIsErrorModalOpen(true);
      return;
    }
    if (!isValidDate) {
      setErrorMessage("Please select a valid Date Availed.");
      setIsErrorModalOpen(true);
      return;
    }

    try {
      const response = await api.post("hr/edit_parental_leave", editedRecord);
      setIsEditing(false);

      return true;
    } catch (error) {
      const errorMessage =
        error.response?.data?.detail ||
        error.message ||
        "Unknown error occurred";
      return false;
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
        width: "90vh",
        borderRadius: "16px",
        bgcolor: "white",
        maxHeight: "100vh", //added
        overflowY: "auto",
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
              {typeOfLeaveOptions.map((option) => (
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
          inputProps={{ min: 1 }}
          InputProps={{
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
              minDate={dayjs("1994-09-29")}
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
                ? dayjs(editedRecord.date).format("MM/DD/YYYY")
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
                      console.log("🟡 isRecordUnchanged:", isRecordUnchanged());
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
              message={
                "Are you sure you want to approve this parental leave record?"
              }
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

export default ViewUpdateParentalLeaveModal;
