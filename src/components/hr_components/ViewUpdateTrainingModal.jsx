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

const ViewUpdateTrainingModal = ({
  title,
  record,
  onClose,
  status,
  onSuccess,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const permanentlyReadOnlyFields = ["training_title", "company_id", "status"];

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
    {
      label: "Training Name",
      value: String(editedRecord.training_title || "N/A"),
    },
    {
      label: "Date",
      value: editedRecord.date
        ? dayjs(editedRecord.date).format("MM/DD/YYYY")
        : "N/A",
    },
    {
      label: "Training Hours",
      value: String(editedRecord.training_hours || "N/A"),
    },
    {
      label: "Number of Participants",
      value: String(editedRecord.number_of_participants || "N/A"),
    },
  ];

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
    const isoDate = newValue ? dayjs(newValue).format("YYYY-MM-DD") : null;

    setEditedRecord((prev) => ({
      ...prev,
      [field]: isoDate,
    }));
  };

  const handleSave = async () => {
    /* VALIDATIONS */
    const MIN_DATE = dayjs("1994-09-29");

    const { trainingName, date, training_hours, number_of_participants } =
      editedRecord;

    const isValidDate = date && dayjs(date).isSameOrAfter(MIN_DATE);

    const isValidTrainingHours =
      training_hours !== "" &&
      !isNaN(training_hours) &&
      Number(training_hours) > 0;

    const isValidParticipants =
      number_of_participants !== "" &&
      !isNaN(number_of_participants) &&
      Number(number_of_participants) > 0;

    if (!isValidDate) {
      setErrorMessage("Please select a valid Date.");
      setIsErrorModalOpen(true);
      return;
    }

    if (!isValidTrainingHours) {
      setErrorMessage("Training Hours must be a number greater than 0.");
      setIsErrorModalOpen(true);
      return;
    }

    if (!isValidParticipants) {
      setErrorMessage(
        "Number of Participants must be a number greater than 0."
      );
      setIsErrorModalOpen(true);
      return;
    }

    try {
      const response = await api.post("hr/edit_training", editedRecord);
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
        if (newStatus === "FRS") {
          setSuccessMessage("Revision (Site) Requested!");
          setSuccessTitle("The record has been sent for revision (site).");
          setSuccessColor("#FFA000");
          setIsSuccessModalOpen(true);
        } else if (newStatus === "FRH") {
          setSuccessMessage("Revision (Head) Requested!");
          setSuccessTitle("The record has been sent for revision (head).");
          setSuccessColor("#182959");
          setIsSuccessModalOpen(true);
        }

        if (onSuccess) {
          onSuccess();
        }
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

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      alert(error?.response?.data?.detail || "Update Status Failed.");
    }
  };

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
        <Box />

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
          inputProps={{ min: 1 }}
          InputProps={{
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
          inputProps={{ min: 1 }}
          InputProps={{
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
              message={"Are you sure you want to approve this training record?"}
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

export default ViewUpdateTrainingModal;
