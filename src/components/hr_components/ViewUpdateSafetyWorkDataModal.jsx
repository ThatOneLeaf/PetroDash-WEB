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

const ViewUpdateSafetyWorkDataModal = ({
  title,
  record,
  onClose,
  status,
  onSuccess,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const permanentlyReadOnlyFields = ["contractor", "company_id", "status"];

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
    { label: "Company ID", value: String(editedRecord.company_id || "N/A") },
    { label: "Contractor", value: String(editedRecord.contractor || "N/A") },
    {
      label: "Date",
      value: editedRecord.date
        ? dayjs(editedRecord.date).format("MM/DD/YYYY")
        : "N/A",
    },
    {
      label: "Safety Manpower",
      value: String(editedRecord.manpower || "N/A"),
    },
    {
      label: "Safety Manhours",
      value: String(editedRecord.manhours || "N/A"),
    },
  ];

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
    const isoDate = newValue ? dayjs(newValue).format("YYYY-MM-DD") : null;

    setEditedRecord((prev) => ({
      ...prev,
      [field]: isoDate,
    }));
  };

  const handleSave = async () => {
    /* VALIDATIONS */

    const MIN_DATE = dayjs("1994-09-29");

    const { contractor, date, manpower, manhours } = editedRecord;

    const isValidDate = date && dayjs(date).isSameOrAfter(MIN_DATE);

    const isValidManpower =
      manpower !== "" && !isNaN(manpower) && Number(manpower) > 0;

    const isValidManhours =
      manhours !== "" && !isNaN(manhours) && Number(manhours) > 0;

    if (!isValidDate) {
      setErrorMessage("Please select a valid Date.");
      setIsErrorModalOpen(true);
      return;
    }

    if (!isValidManpower) {
      setErrorMessage("Safety Manpower must be a number greater than 0.");
      setIsErrorModalOpen(true);
      return;
    }

    if (!isValidManhours) {
      setErrorMessage("Safety Manhours must be a number greater than 0.");
      setIsErrorModalOpen(true);
      return;
    }

    try {
      const response = await api.post("hr/edit_safety_workdata", editedRecord);
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
          value={editedRecord.contractor ?? ""}
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
              views={["year", "month"]}
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
            label="Date"
            variant="outlined"
            fullWidth
            value={
              editedRecord.date
                ? dayjs(editedRecord.date).format("MMMM YYYY")
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
          value={editedRecord.manpower ?? ""}
          onChange={handleChange("manpower")}
          type="number"
          inputProps={{ min: 1 }}
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
          value={editedRecord.manhours ?? ""}
          onChange={handleChange("manhours")}
          inputProps={{ min: 1 }}
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
                "Are you sure you want to approve this safety work data record?"
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

export default ViewUpdateSafetyWorkDataModal;
