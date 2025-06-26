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
  Modal,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import { useState, useEffect } from "react";
import api from "../../services/api";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import StatusChip from "../../components/StatusChip";
import ClearIcon from "@mui/icons-material/Clear";
import Overlay from "../../components/modal";
import { useAuth } from '../../contexts/AuthContext';
import { is } from "date-fns/locale";

const ViewEditRecordModal = ({
  source,
  table,
  title,
  record,
  updatePath,
  onClose,
  status,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editedRecord, setEditedRecord] = useState(record || {});
  const [modalType, setModalType] = useState(""); // 'approve' or 'revise'
  const statuses = ["URS", "FRS", "URH", "FRH", "APP"];
  const [nextStatus, setNextStatus] = useState("");
  const [remarks, setRemarks] = useState("");
  const recordIdKey = Object.keys(record)[0];
  const [updatedStatusMessage, setUpdatedStatusMessage] = useState("");

  // Updated permanentlyReadOnlyFields to include metrics and unit for hazard tables
  // Also include property and type for Diesel table
  const permanentlyReadOnlyFields = (() => {
    const baseFields = [Object.keys(record)[0], "company", "status"];

    // Add metrics and unit as read-only for hazard-related tables
    if (
      table === "Hazard Generated" ||
      table === "Hazard Disposed" ||
      table === "Non-Hazard Generated"
    ) {
      return [...baseFields, "metrics", "unit"];
    }

    // Add property and type as read-only for Diesel table
    if (table === "Diesel") {
      return [...baseFields, "property", "type"];
    }

    return baseFields;
  })();

  const withOptionFields = [
    "source",
    "unit",
    "quarter",
    "year",
    "month",
    "property",
    "type",
    "metrics",
  ];

  const [sourceOptions, setSourceOptions] = useState([]);
  const [propertyOptions, setPropertyOptions] = useState([]);
  const [propertyTypeOptions, setPropertyTypeOptions] = useState([]);
  const [hazGenMetricsOptions, setHazGenMetricsOptions] = useState([]);
  const [hazDisMetricsOptions, setHazDisMetricsOptions] = useState([]);
  const [nonHazsMetricsOptions, setNonHazMetricsOptions] = useState([]);

  const [electricityUnitOptions, setElectricityUnitOptions] = useState([]);
  const [dieselUnitOptions, setDieselUnitOptions] = useState([]);
  const [waterUnitOptions, setWaterUnitOptions] = useState([]);
  const [hazGenUnitOptions, setHazGenUnitOptions] = useState([]);
  const [hazDisUnitOptions, setHazDisUnitOptions] = useState([]);
  const [nonHazUnitOptions, setNonHazUnitOptions] = useState([]);

  const { user } = useAuth();
  const canApproveOrRevise = Array.isArray(user?.roles) && user.roles.some(role => ['R03', 'R04'].includes(role));
  const isSiteApprover = ["Under review (site)", "For Revision (Site)"].includes(
    editedRecord.status) && user.roles.includes("R04");

  const isHeadApprover = ["Under review (head level)", "For Revision (Head)"].includes(
    editedRecord.status) && user.roles.includes("R03");

  console.log((canApproveOrRevise && isSiteApprover) || (canApproveOrRevise && isHeadApprover));
  
  const [showApproveSuccessModal, setShowApproveSuccessModal] = useState(false);
  // Add new modals for revision and edit success
  const [showReviseSiteSuccessModal, setShowReviseSiteSuccessModal] =
    useState(false);
  const [showReviseHeadSuccessModal, setShowReviseHeadSuccessModal] =
    useState(false);
  const [showEditSaveSuccessModal, setShowEditSaveSuccessModal] =
    useState(false);
  const [editSaveSuccessMessage, setEditSaveSuccessMessage] = useState("");
  const [showRemarksRequiredModal, setShowRemarksRequiredModal] =
    useState(false);
  const [showSaveErrorModal, setShowSaveErrorModal] = useState(false);
  const [saveErrorMessage, setSaveErrorMessage] = useState("");
  const [showUnsavedChangesModal, setShowUnsavedChangesModal] = useState(false);

  if (!record) return null;

  // Initialize Data Options
  useEffect(() => {
    if (source === "environment") {
      const fetchSourceOptions = async () => {
        try {
          const response = await api.get(
            "environment/distinct_electric_source"
          );
          setSourceOptions(response.data);
        } catch (error) {
          console.error("Error fetching source options:", error);
        }
      };

      const fetchPropertyOptions = async () => {
        try {
          const response = await api.get(
            `environment/distinct_cp_names/${editedRecord.company}`
          );
          setPropertyOptions(response.data);
        } catch (error) {
          console.error("Error fetching property options:", error);
        }
      };

      const fetchPropertyTypeOptions = async () => {
        try {
          const response = await api.get("environment/distinct_cp_type");
          setPropertyTypeOptions(response.data);
        } catch (error) {
          console.error("Error fetching type options:", error);
        }
      };

      const fetchHazGenMetricsOptions = async () => {
        try {
          const response = await api.get(
            "environment/distinct_haz_waste_generated"
          );
          setHazGenMetricsOptions(response.data);
        } catch (error) {
          console.error("Error fetching metrics options:", error);
        }
      };

      const fetchHazDisMetricsOptions = async () => {
        try {
          const response = await api.get(
            "environment/distinct_haz_waste_disposed"
          );
          setHazDisMetricsOptions(response.data);
        } catch (error) {
          console.error("Error fetching metrics options:", error);
        }
      };

      const fetchNonHazMetricsOptions = async () => {
        try {
          const response = await api.get(
            "environment/distinct_non_haz_waste_metrics"
          );
          setNonHazMetricsOptions(response.data);
        } catch (error) {
          console.error("Error fetching metrics options:", error);
        }
      };

      // Units
      const fetchElectricityUnitOptions = async () => {
        try {
          const response = await api.get(
            "environment/distinct_electric_consumption_unit"
          );
          setElectricityUnitOptions(response.data);
        } catch (error) {
          console.error("Error fetching unit options:", error);
        }
      };

      const fetchDieselUnitOptions = async () => {
        try {
          const response = await api.get(
            "environment/distinct_diesel_consumption_unit"
          );
          setDieselUnitOptions(response.data);
        } catch (error) {
          console.error("Error fetching unit options:", error);
        }
      };

      const fetchWaterUnitOptions = async () => {
        try {
          const response = await api.get("environment/distinct_water_unit");
          setWaterUnitOptions(response.data);
        } catch (error) {
          console.error("Error fetching unit options:", error);
        }
      };

      const fetchHazGenUnitOptions = async () => {
        try {
          const response = await api.get(
            "environment/distinct_hazard_waste_gen_unit"
          );
          setHazGenUnitOptions(response.data);
        } catch (error) {
          console.error("Error fetching unit options:", error);
        }
      };

      const fetchHazDisUnitOptions = async () => {
        try {
          const response = await api.get(
            "environment/distinct_hazard_waste_dis_unit"
          );
          setHazDisUnitOptions(response.data);
        } catch (error) {
          console.error("Error fetching unit options:", error);
        }
      };

      const fetchNonHazUnitOptions = async () => {
        try {
          const response = await api.get(
            "environment/distinct_non_haz_waste_unit"
          );
          setNonHazUnitOptions(response.data);
        } catch (error) {
          console.error("Error fetching unit options:", error);
        }
      };

      if (table === "Electricity") {
        fetchSourceOptions();
        fetchElectricityUnitOptions();
      } else if (table === "Diesel") {
        fetchDieselUnitOptions();
        fetchPropertyOptions();
        fetchPropertyTypeOptions();
      } else if (table === "Water") {
        fetchWaterUnitOptions();
      } else {
        fetchHazGenMetricsOptions();
        fetchHazDisMetricsOptions();
        fetchNonHazMetricsOptions();
        fetchHazGenUnitOptions();
        fetchHazDisUnitOptions();
        fetchNonHazUnitOptions();
      }
    }
  }, [source]);

  const getStatusDisplayText = (statusCode) => {
    const statusMap = {
      "URS": "submitted for review (site)",
      "FRS": "sent for revision (site)", 
      "URH": "submitted for review (head level)",
      "FRH": "sent for revision (head level)",
      "APP": "approved"
    };
    return statusMap[statusCode] || statusCode;
  };

  const handleChange = (key, value) => {
    let newValue = value;

    // Convert to number if key is a numeric field
    if (
      [
        "consumption",
        "volume",
        "waste_generated",
        "waste_disposed",
        "waste",
      ].includes(key)
    ) {
      // Allow empty string
      if (value === "") {
        newValue = "";
      } else {
        // For Non-Hazard Generated waste with "Pieces" unit, only allow whole numbers
        if (
          key === "waste" &&
          table === "Non-Hazard Generated" &&
          editedRecord.unit === "Pieces"
        ) {
          // Remove any non-numeric characters and decimal points
          const cleanedValue = value.toString().replace(/[^0-9]/g, "");

          // Prevent entering "0" or numbers starting with 0
          if (
            cleanedValue === "0" ||
            (cleanedValue.startsWith("0") && cleanedValue.length > 1)
          ) {
            return;
          }

          newValue = cleanedValue;
        } else {
          // Regular decimal handling for other cases
          const cleanedValue = value.toString().replace(/[^0-9.]/g, "");

          // Handle multiple decimal points - keep only the first one
          const parts = cleanedValue.split(".");
          if (parts.length > 2) {
            newValue = parts[0] + "." + parts.slice(1).join("");
          } else {
            newValue = cleanedValue;
          }

          // Allow temporary invalid states (like just "." or "0.") while typing
          // but prevent clearly invalid final values
          if (
            newValue &&
            newValue !== "." &&
            newValue !== "0" &&
            newValue !== "0."
          ) {
            const numericValue = parseFloat(newValue);
            // Only reject if it's a complete number that's <= 0
            if (
              !isNaN(numericValue) &&
              numericValue <= 0 &&
              !newValue.endsWith(".")
            ) {
              return; // Don't update if it's a complete non-positive number
            }
          } else if (
            newValue === "0" ||
            (newValue.startsWith("0") && !newValue.includes("."))
          ) {
            // Prevent entering just "0" or numbers starting with 0 (except decimals like "0.5")
            return;
          }
        }
      }
    }

    setEditedRecord((prev) => ({
      ...prev,
      [key]: newValue,
    }));
  };

  const handleConfirmClose = () => {
    setShowUnsavedChangesModal(false);
    const isUnchanged = JSON.stringify(record) === JSON.stringify(editedRecord);
    status(isUnchanged);
    onClose();
  };

  const handleCancelClose = () => {
    setShowUnsavedChangesModal(false);
  };

  const handleSave = async () => {
    console.log("Updated Data before processing:", editedRecord);

    // Create a copy of editedRecord and convert string numbers to actual numbers
    const processedRecord = { ...editedRecord };

    // Convert numeric fields from strings to numbers before sending to API
    [
      "consumption",
      "volume",
      "waste_generated",
      "waste_disposed",
      "waste",
    ].forEach((key) => {
      if (processedRecord[key] !== undefined && processedRecord[key] !== "") {
        const numericValue = parseFloat(processedRecord[key]);
        if (!isNaN(numericValue) && numericValue > 0) {
          processedRecord[key] = numericValue;
        } else if (processedRecord[key] === "") {
          // Handle empty strings - you might want to set to null or remove the field
          // depending on your backend requirements
          processedRecord[key] = null; // or delete processedRecord[key];
        }
      }
    });

    console.log("Processed Data for API:", processedRecord);
    console.log("Field names:", Object.keys(processedRecord));

    try {
      let response;
      if (!source) {
        // For CSR, use PATCH
        response = await api.patch(updatePath, processedRecord);
      } else {
        // For EnvironmentEnergy, use POST
        response = await api.post(`${source}${updatePath}`, processedRecord);
      }

      setIsEditing(false);
      return true; // Return true on success
    } catch (error) {
      const errorMessage =
        error.response?.data?.detail ||
        error.message ||
        "Unknown error occurred";
      setSaveErrorMessage(errorMessage);
      setShowSaveErrorModal(true);
      console.error("Save error:", error.response?.data);
      return false; // Return false on error
    }
  };

  const fetchNextStatus = (action) => {
    let newStatus = "";
    if (action === "approve") {
      switch (editedRecord.status) {
        case "For Revision (Site)":
          newStatus = statuses[0]; // "URS"
          break;
        case "Under review (site)":
        case "For Revision (Head)":
          newStatus = statuses[2]; // "URH"
          break;
        case "Under review (head level)":
          newStatus = statuses[4]; // "APP"
          break;
      }
    } else if (action === "revise") {
      switch (editedRecord.status) {
        case "Under review (site)":
          newStatus = statuses[1]; // "FRS"
          break;
        case "Under review (head level)":
          newStatus = statuses[3]; // "FRH"
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
      console.log("Updated status to:", newStatus); // Changed from nextStatus to newStatus
    } else {
      console.warn("No matching status transition found.");
    }

    try {
      if (action === "revise") {
        if (!remarks) {
          setShowRemarksRequiredModal(true);
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

      console.log(payload);

      const response = await api.post("/usable_apis/update_status", payload);

      // alert(response.data.message);
      // status(false);

      // Show appropriate modal for revision
      if (action === "revise") {
        if (newStatus === "FRS") {
          setShowReviseSiteSuccessModal(true);
        } else if (newStatus === "FRH") {
          setShowReviseHeadSuccessModal(true);
        }
      } else {
        status(false);
      }
    } catch (error) {
      console.error("Error updating record status:", error?.response);
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
      
      // Set the dynamic message based on the new status
      setUpdatedStatusMessage(getStatusDisplayText(newStatus));
      setShowApproveSuccessModal(true);
    } catch (error) {
      alert(error?.response?.data?.detail || "Update Status Failed.");
    }
  };
  const handleApproveSuccessClose = () => {
    setShowApproveSuccessModal(false);
    status(false);
  };

  const isRecordUnchanged =
    JSON.stringify(record) === JSON.stringify(editedRecord);

  // Helper to open modal for approve or revise
  const openModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const handleEditSaveSuccess = (message) => {
    setEditSaveSuccessMessage(message);
    setShowEditSaveSuccessModal(true);
    // Do NOT close the main modal or trigger status/onClose here
  };

  // Only close the main modal and trigger status/onClose after OK is clicked
  const handleEditSaveSuccessOk = () => {
    setShowEditSaveSuccessModal(false);
    status(false); // or any follow-up logic
    onClose();
  };

  // Function to check if field should be hidden for Diesel table
  const shouldHideField = (key) => {
    if (table === "Diesel") {
      return ["month", "quarter", "year"].includes(key);
    }
    return false;
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
          justifyContent: "space-between",
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
        <ClearIcon
          sx={{
            color: "grey",
            borderRadius: "999px",
            "&:hover": {
              color: "#256d2f",
            },
          }}
          onClick={() => {
            const isUnchanged =
              JSON.stringify(record) === JSON.stringify(editedRecord);
            if (isEditing && !isUnchanged) {
              setShowUnsavedChangesModal(true);
              return;
            }
            status(isUnchanged);
            onClose();
          }}
        ></ClearIcon>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          mb: 3,
        }}
      >
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
        {Object.entries(editedRecord)
          .filter(([key, value]) => !shouldHideField(key)) // Filter out hidden fields
          .map(([key, value]) => (
            <Box key={key} sx={{ marginBottom: "0.5rem" }}>
              {isEditing && key === "date" ? (
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label={
                      isEditing && !permanentlyReadOnlyFields.includes(key) ? (
                        <>
                          {" "}
                          {key} <span style={{ color: "red" }}>*</span>{" "}
                        </>
                      ) : (
                        key
                      )
                    }
                    value={value ? new Date(value) : null}
                    onChange={(newValue) => {
                      const formattedDate = newValue
                        ? newValue.toISOString().split("T")[0]
                        : "";
                      handleChange(key, formattedDate);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        InputProps={{
                          readOnly:
                            !isEditing ||
                            permanentlyReadOnlyFields.includes(key),
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
                  />
                </LocalizationProvider>
              ) : isEditing &&
                withOptionFields.includes(key) &&
                !permanentlyReadOnlyFields.includes(key) ? (
                <FormControl fullWidth>
                  <InputLabel>
                    {isEditing && !permanentlyReadOnlyFields.includes(key) ? (
                      <>
                        <span style={{ color: isEditing ? "#182959" : "grey" }}>
                          {key}
                        </span>
                        <span style={{ color: "red" }}>*</span>
                      </>
                    ) : (
                      key
                    )}
                  </InputLabel>
                  <Select
                    label={
                      isEditing && !permanentlyReadOnlyFields.includes(key) ? (
                        <>
                          <span
                            style={{ color: isEditing ? "#182959" : "grey" }}
                          >
                            {key}
                          </span>
                          <span style={{ color: "red" }}>*</span>
                        </>
                      ) : (
                        key
                      )
                    }
                    value={value ?? ""}
                    onChange={(e) => handleChange(key, e.target.value)}
                    fullWidth
                  >
                    {key === "source" &&
                      sourceOptions.map((option) => (
                        <MenuItem key={option.source} value={option.source}>
                          {option.source}
                        </MenuItem>
                      ))}
                    {key === "property" &&
                      propertyOptions.map((option) => (
                        <MenuItem key={option.cp_name} value={option.cp_name}>
                          {option.cp_name}
                        </MenuItem>
                      ))}
                    {key === "type" &&
                      propertyTypeOptions.map((option) => (
                        <MenuItem key={option.cp_type} value={option.cp_type}>
                          {option.cp_type}
                        </MenuItem>
                      ))}

                    {key === "metrics" &&
                      (table === "Hazard Generated" ? (
                        hazGenMetricsOptions.map((option) => (
                          <MenuItem key={option.metrics} value={option.metrics}>
                            {option.metrics}
                          </MenuItem>
                        ))
                      ) : table === "Hazard Disposed" ? (
                        hazDisMetricsOptions.map((option) => (
                          <MenuItem key={option.metrics} value={option.metrics}>
                            {option.metrics}
                          </MenuItem>
                        ))
                      ) : table === "Non-Hazard Generated" ? (
                        nonHazsMetricsOptions.map((option) => (
                          <MenuItem key={option.metrics} value={option.metrics}>
                            {option.metrics}
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem value="N/A">N/A</MenuItem>
                      ))}

                    {key === "unit" &&
                      (table === "Diesel" ? (
                        dieselUnitOptions.map((option) => (
                          <MenuItem key={option.unit} value={option.unit}>
                            {option.unit}
                          </MenuItem>
                        ))
                      ) : table === "Electricity" ? (
                        electricityUnitOptions.map((option) => (
                          <MenuItem key={option.unit} value={option.unit}>
                            {option.unit}
                          </MenuItem>
                        ))
                      ) : table === "Water" ? (
                        waterUnitOptions.map((option) => (
                          <MenuItem key={option.unit} value={option.unit}>
                            {option.unit}
                          </MenuItem>
                        ))
                      ) : table === "Hazard Generated" ? (
                        hazGenUnitOptions.map((option) => (
                          <MenuItem key={option.unit} value={option.unit}>
                            {option.unit}
                          </MenuItem>
                        ))
                      ) : table === "Hazard Disposed" ? (
                        hazDisUnitOptions.map((option) => (
                          <MenuItem key={option.unit} value={option.unit}>
                            {option.unit}
                          </MenuItem>
                        ))
                      ) : table === "Non-Hazard Generated" ? (
                        nonHazUnitOptions.map((option) => (
                          <MenuItem key={option.unit} value={option.unit}>
                            {option.unit}
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem value="N/A">N/A</MenuItem>
                      ))}
                    {key === "month" &&
                      [
                        "January",
                        "February",
                        "March",
                        "April",
                        "May",
                        "June",
                        "July",
                        "August",
                        "September",
                        "October",
                        "November",
                        "December",
                      ].map((month) => (
                        <MenuItem key={month} value={month}>
                          {month}
                        </MenuItem>
                      ))}
                    {key === "quarter" &&
                      ["Q1", "Q2", "Q3", "Q4"].map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    {key === "year" &&
                      Array.from(
                        { length: 10 },
                        (_, i) => new Date().getFullYear() - i
                      ).map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              ) : key === "status" ? (
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
                  <StatusChip status={value} />
                </Box>
              ) : (
                <TextField
                  label={
                    isEditing && !permanentlyReadOnlyFields.includes(key) ? (
                      <>
                        {" "}
                        {key} <span style={{ color: "red" }}>*</span>{" "}
                      </>
                    ) : (
                      key
                    )
                  }
                  variant="outlined"
                  fullWidth
                  value={value ?? ""}
                  onChange={(e) => handleChange(key, e.target.value)}
                  InputProps={{
                    readOnly:
                      !isEditing || permanentlyReadOnlyFields.includes(key),
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
            </Box>
          ))}
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", mt: 3 }}>
        {editedRecord.status !== "Approved" && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            {/* Hide EDIT/SAVE if status is under review (site) or under review (head) */}
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
                      if (!isRecordUnchanged) {
                        const saveSuccess = await handleSave(); // Get the result
                        if (
                          saveSuccess && // Only show success modal if save was successful
                          (editedRecord.status === "For Revision (Site)" ||
                            editedRecord.status === "For Revision (Head)")
                        ) {
                          handleEditSaveSuccess(
                            "The record has been successfully updated."
                          );
                        }
                      } else {
                        setIsEditing(false);
                        if (
                          editedRecord.status === "For Revision (Site)" ||
                          editedRecord.status === "For Revision (Head)"
                        ) {
                          handleEditSaveSuccess(
                            "No changes were made to the record."
                          );
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
            {((canApproveOrRevise && isSiteApprover) || (canApproveOrRevise && isHeadApprover))  && !isEditing && (
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
                      onClick={() => openModal("revise")}
                    >
                      Revise
                    </Button>
                  )}
              </Box>
            )}
            
          </Box>
        )}
      </Box>

      {editedRecord.status === "Approved" && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            mt: 3,
          }}
        >
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
              Approval Confirmation
            </Typography>
            <Box
              sx={{
                bgcolor: "#f5f5f5",
                p: 2,
                borderRadius: "8px",
                width: "100%",
                mb: 3,
              }}
            >
              {Object.entries(record).map(([key, value]) => (
                <Typography key={key} sx={{ fontSize: "0.9rem", mb: 1 }}>
                  <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong>{" "}
                  {String(value)}
                </Typography>
              ))}
            </Box>
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
                onClick={handleApproveConfirm}
              >
                Confirm
              </Button>
            </Box>
          </Paper>
        </Overlay>
      )}

      {showApproveSuccessModal && (
        <Overlay onClose={handleApproveSuccessClose}>
          <Paper
            sx={{
              p: 4,
              width: "400px",
              borderRadius: "16px",
              bgcolor: "white",
              outline: "none",
              textAlign: "center",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Box
                sx={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  backgroundColor: "#2B8C37",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 2,
                }}
              >
                <Typography
                  sx={{
                    color: "white",
                    fontSize: "2rem",
                    fontWeight: "bold",
                  }}
                >
                  ✓
                </Typography>
              </Box>
              <Typography
                sx={{
                  fontSize: "1.5rem",
                  fontWeight: 800,
                  color: "#182959",
                  mb: 2,
                }}
              >
                Record Status Updated Successfully!
              </Typography>
              <Typography
                sx={{
                  fontSize: "1rem",
                  color: "#666",
                  mb: 3,
                }}
              >
                The record has been successfully {updatedStatusMessage}.
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mt: 3,
              }}
            >
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#2B8C37",
                  borderRadius: "999px",
                  padding: "10px 24px",
                  fontSize: "1rem",
                  fontWeight: "bold",
                  "&:hover": {
                    backgroundColor: "#256d2f",
                  },
                }}
                onClick={handleApproveSuccessClose}
              >
                OK
              </Button>
            </Box>
          </Paper>
        </Overlay>
      )}

      {showReviseSiteSuccessModal && (
        <Overlay
          onClose={() => {
            setShowReviseSiteSuccessModal(false);
            status(false);
          }}
        >
          <Paper
            sx={{
              p: 4,
              width: "400px",
              borderRadius: "16px",
              bgcolor: "white",
              outline: "none",
              textAlign: "center",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Box
                sx={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  backgroundColor: "#FFA000",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 2,
                }}
              >
                <Typography
                  sx={{
                    color: "white",
                    fontSize: "2rem",
                    fontWeight: "bold",
                  }}
                >
                  ✓
                </Typography>
              </Box>
              <Typography
                sx={{
                  fontSize: "1.5rem",
                  fontWeight: 800,
                  color: "#182959",
                  mb: 2,
                }}
              >
                Revision (Site) Requested!
              </Typography>
              <Typography
                sx={{
                  fontSize: "1rem",
                  color: "#666",
                  mb: 3,
                }}
              >
                The record has been sent for revision (site).
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mt: 3,
              }}
            >
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#FFA000",
                  borderRadius: "999px",
                  padding: "10px 24px",
                  fontSize: "1rem",
                  fontWeight: "bold",
                  "&:hover": {
                    backgroundColor: "#FB8C00",
                  },
                }}
                onClick={() => {
                  setShowReviseSiteSuccessModal(false);
                  status(false);
                }}
              >
                OK
              </Button>
            </Box>
          </Paper>
        </Overlay>
      )}

      {showReviseHeadSuccessModal && (
        <Overlay
          onClose={() => {
            setShowReviseHeadSuccessModal(false);
            status(false);
          }}
        >
          <Paper
            sx={{
              p: 4,
              width: "400px",
              borderRadius: "16px",
              bgcolor: "white",
              outline: "none",
              textAlign: "center",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Box
                sx={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  backgroundColor: "#182959",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 2,
                }}
              >
                <Typography
                  sx={{
                    color: "white",
                    fontSize: "2rem",
                    fontWeight: "bold",
                  }}
                >
                  ✓
                </Typography>
              </Box>
              <Typography
                sx={{
                  fontSize: "1.5rem",
                  fontWeight: 800,
                  color: "#182959",
                  mb: 2,
                }}
              >
                Revision (Head) Requested!
              </Typography>
              <Typography
                sx={{
                  fontSize: "1rem",
                  color: "#666",
                  mb: 3,
                }}
              >
                The record has been sent for revision (head).
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mt: 3,
              }}
            >
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#182959",
                  borderRadius: "999px",
                  padding: "10px 24px",
                  fontSize: "1rem",
                  fontWeight: "bold",
                  "&:hover": {
                    backgroundColor: "#0f1a3c",
                  },
                }}
                onClick={() => {
                  setShowReviseHeadSuccessModal(false);
                  status(false);
                }}
              >
                OK
              </Button>
            </Box>
          </Paper>
        </Overlay>
      )}

      {showEditSaveSuccessModal && (
        <Overlay onClose={handleEditSaveSuccessOk}>
          <Paper
            sx={{
              p: 4,
              width: "400px",
              borderRadius: "16px",
              bgcolor: "white",
              outline: "none",
              textAlign: "center",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Box
                sx={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  backgroundColor: "#2B8C37",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 2,
                }}
              >
                <Typography
                  sx={{
                    color: "white",
                    fontSize: "2rem",
                    fontWeight: "bold",
                  }}
                >
                  ✓
                </Typography>
              </Box>
              <Typography
                sx={{
                  fontSize: "1.5rem",
                  fontWeight: 800,
                  color: "#182959",
                  mb: 2,
                }}
              >
                {editSaveSuccessMessage}
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mt: 3,
              }}
            >
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#2B8C37",
                  borderRadius: "999px",
                  padding: "10px 24px",
                  fontSize: "1rem",
                  fontWeight: "bold",
                  "&:hover": {
                    backgroundColor: "#256d2f",
                  },
                }}
                onClick={handleEditSaveSuccessOk}
              >
                OK
              </Button>
            </Box>
          </Paper>
        </Overlay>
      )}
      {showRemarksRequiredModal && (
        <Overlay onClose={() => setShowRemarksRequiredModal(false)}>
          <Paper
            sx={{
              p: 4,
              width: "400px",
              borderRadius: "16px",
              bgcolor: "white",
              outline: "none",
              textAlign: "center",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Box
                sx={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  backgroundColor: "#f44336",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 2,
                }}
              >
                <Typography
                  sx={{
                    color: "white",
                    fontSize: "2rem",
                    fontWeight: "bold",
                  }}
                >
                  !
                </Typography>
              </Box>
              <Typography
                sx={{
                  fontSize: "1.5rem",
                  fontWeight: 800,
                  color: "#182959",
                  mb: 2,
                }}
              >
                Remarks Required
              </Typography>
              <Typography
                sx={{
                  fontSize: "1rem",
                  color: "#666",
                  mb: 3,
                }}
              >
                Remarks is required for the status update.
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mt: 3,
              }}
            >
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#f44336",
                  borderRadius: "999px",
                  padding: "10px 24px",
                  fontSize: "1rem",
                  fontWeight: "bold",
                  "&:hover": {
                    backgroundColor: "#d32f2f",
                  },
                }}
                onClick={() => setShowRemarksRequiredModal(false)}
              >
                OK
              </Button>
            </Box>
          </Paper>
        </Overlay>
      )}

      {showSaveErrorModal && (
        <Overlay onClose={() => setShowSaveErrorModal(false)}>
          <Paper
            sx={{
              p: 4,
              width: "400px",
              borderRadius: "16px",
              bgcolor: "white",
              outline: "none",
              textAlign: "center",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Box
                sx={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  backgroundColor: "#f44336",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 2,
                }}
              >
                <Typography
                  sx={{
                    color: "white",
                    fontSize: "2rem",
                    fontWeight: "bold",
                  }}
                >
                  ✗
                </Typography>
              </Box>
              <Typography
                sx={{
                  fontSize: "1.5rem",
                  fontWeight: 800,
                  color: "#182959",
                  mb: 2,
                }}
              >
                Save Failed
              </Typography>
              <Typography
                sx={{
                  fontSize: "1rem",
                  color: "#666",
                  mb: 3,
                }}
              >
                {saveErrorMessage}
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                mt: 3,
              }}
            >
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#f44336",
                  borderRadius: "999px",
                  padding: "10px 24px",
                  fontSize: "1rem",
                  fontWeight: "bold",
                  "&:hover": {
                    backgroundColor: "#d32f2f",
                  },
                }}
                onClick={() => setShowSaveErrorModal(false)}
              >
                OK
              </Button>
            </Box>
          </Paper>
        </Overlay>
      )}

      {showUnsavedChangesModal && (
        <Overlay onClose={handleCancelClose}>
          <Paper
            sx={{
              p: 4,
              width: "400px",
              borderRadius: "16px",
              bgcolor: "white",
              outline: "none",
              textAlign: "center",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                mb: 3,
              }}
            >
              <Box
                sx={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  backgroundColor: "#FF9800",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 2,
                }}
              >
                <Typography
                  sx={{
                    color: "white",
                    fontSize: "2rem",
                    fontWeight: "bold",
                  }}
                >
                  !
                </Typography>
              </Box>
              <Typography
                sx={{
                  fontSize: "1.5rem",
                  fontWeight: 800,
                  color: "#182959",
                  mb: 2,
                }}
              >
                Unsaved Changes
              </Typography>
              <Typography
                sx={{
                  fontSize: "1rem",
                  color: "#666",
                  mb: 3,
                }}
              >
                You have unsaved changes. Are you sure you want to close without
                saving?
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                gap: 1,
                mt: 3,
              }}
            >
              <Button
                variant="outlined"
                sx={{
                  borderColor: "#182959",
                  color: "#182959",
                  borderRadius: "999px",
                  padding: "6px 16px",
                  fontSize: "0.9rem",
                  fontWeight: "bold",
                  "&:hover": {
                    borderColor: "#0f1a3c",
                    color: "#0f1a3c",
                  },
                }}
                onClick={handleCancelClose}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: "#FF9800",
                  borderRadius: "999px",
                  padding: "6px 16px",
                  fontSize: "0.9rem",
                  fontWeight: "bold",
                  "&:hover": {
                    backgroundColor: "#F57C00",
                  },
                }}
                onClick={handleConfirmClose}
              >
                Close Without Saving
              </Button>
            </Box>
          </Paper>
        </Overlay>
      )}
    </Paper>
  );
};

export default ViewEditRecordModal;
