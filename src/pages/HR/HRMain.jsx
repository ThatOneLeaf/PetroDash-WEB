import { useState, useEffect } from "react";
import { Box, Button, Typography, Paper, TextField } from "@mui/material";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import AddIcon from "@mui/icons-material/Add";
import Sidebar from "../../components/Sidebar";

import api from "../../services/api";

import PageButtons from "../../components/hr_components/page_button";

import Overlay from "../../components/modal";

import AddEmployeeModal from "../../components/hr_components/AddEmployeeModal";
import AddOSHModal from "../../components/hr_components/AddOSHModal";
import AddTrainingModal from "../../components/hr_components/AddTrainingModal";
import AddParentalLeaveModal from "../../components/hr_components/AddParentalLeaveModal";
import AddSafetyWorkDataModal from "../../components/hr_components/AddSafetyWorkDataModal";

import ImportFileModal from "../../components/ImportFileModal";

import HREmployability from "./HR";
import HRParental from "./HRParentalLeave";
import HRSafetyWorkData from "./HRSafetyWorkData";
import HRTraining from "./HRTraining";
import HROSH from "./HROSH";

import ConfirmModal from "../../components/hr_components/ConfirmModal";
import SuccessModal from "../../components/hr_components/SuccessModal";
import ErrorModal from "../../components/hr_components/ErrorModal";

function HRMain() {
  const [selected, setSelected] = useState("Employability");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [shouldReload, setShouldReload] = useState(false);

  const [filteredExportData, setFilteredExportData] = useState(null);

  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

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
  const [remarks, setRemarks] = useState("");

  const statusIdToName = {
    URH: "Under review (head level)",
    FRH: "For Revision (Head)",
    APP: "Approved",
  };

  const pages = [
    "Employability",
    "Parental Leave",
    "Safety Work Data",
    "Training",
    "Occupational Safety Health",
  ];

  const handleFilteredDataFromChild = (data) => {
    setFilteredExportData(data); // Set data for EXPORT
  };

  const handleSelectedRowIdsChange = (ids) => {
    setSelectedRowIds(ids); // Set selected rows for buttons (approve/revise)
  };

  const renderModals = () => {
    switch (selected) {
      case "Employability":
        return (
          <>
            {isAddModalOpen && (
              <Overlay onClose={() => setIsAddModalOpen(false)}>
                <AddEmployeeModal
                  onClose={() => setIsAddModalOpen(false)}
                  onSuccess={() => setShouldReload(true)}
                />
              </Overlay>
            )}
            {isImportModalOpen && (
              <Overlay onClose={() => setIsImportModalOpen(false)}>
                <ImportFileModal
                  title="HR - Employability"
                  downloadPath="hr/template-employability"
                  uploadPath="hr/bulk_upload_employability"
                  onClose={() => setIsImportModalOpen(false)}
                  onSuccess={() => setShouldReload(true)}
                />
              </Overlay>
            )}
          </>
        );

      case "Parental Leave":
        return (
          <>
            {isAddModalOpen && (
              <Overlay onClose={() => setIsAddModalOpen(false)}>
                <AddParentalLeaveModal
                  onClose={() => setIsAddModalOpen(false)}
                  onSuccess={() => setShouldReload(true)}
                />
              </Overlay>
            )}
            {isImportModalOpen && (
              <Overlay onClose={() => setIsImportModalOpen(false)}>
                <ImportFileModal
                  title="HR - Parental Leave"
                  downloadPath="hr/template-parental-leave"
                  uploadPath="hr/bulk_upload_parental_leave"
                  onClose={() => setIsImportModalOpen(false)}
                  onSuccess={() => setShouldReload(true)}
                />
              </Overlay>
            )}
          </>
        );
      case "Safety Work Data":
        return (
          <>
            {isAddModalOpen && (
              <Overlay onClose={() => setIsAddModalOpen(false)}>
                <AddSafetyWorkDataModal
                  onClose={() => setIsAddModalOpen(false)}
                  onSuccess={() => setShouldReload(true)}
                />
              </Overlay>
            )}
            {isImportModalOpen && (
              <Overlay onClose={() => setIsImportModalOpen(false)}>
                <ImportFileModal
                  title="HR - Safety Work Data"
                  downloadPath="hr/template-safety-workdata"
                  uploadPath="hr/bulk_upload_safety_workdata"
                  onClose={() => setIsImportModalOpen(false)}
                  onSuccess={() => setShouldReload(true)}
                />
              </Overlay>
            )}
          </>
        );
      case "Training":
        return (
          <>
            {isAddModalOpen && (
              <Overlay onClose={() => setIsAddModalOpen(false)}>
                <AddTrainingModal
                  onClose={() => setIsAddModalOpen(false)}
                  onSuccess={() => setShouldReload(true)}
                />
              </Overlay>
            )}
            {isImportModalOpen && (
              <Overlay onClose={() => setIsImportModalOpen(false)}>
                <ImportFileModal
                  title="HR - Training"
                  downloadPath="hr/template-training"
                  uploadPath="hr/bulk_upload_training"
                  onClose={() => setIsImportModalOpen(false)}
                  onSuccess={() => setShouldReload(true)}
                />
              </Overlay>
            )}
          </>
        );

      case "Occupational Safety Health":
        return (
          <>
            {isAddModalOpen && (
              <Overlay onClose={() => setIsAddModalOpen(false)}>
                <AddOSHModal
                  onClose={() => setIsAddModalOpen(false)}
                  onSuccess={() => setShouldReload(true)}
                />
              </Overlay>
            )}
            {isImportModalOpen && (
              <Overlay onClose={() => setIsImportModalOpen(false)}>
                <ImportFileModal
                  title="HR - Occupational Safety Health"
                  downloadPath="hr/template-osh"
                  uploadPath="hr/bulk_occupational_safety_health"
                  onClose={() => setIsImportModalOpen(false)}
                  onSuccess={() => setShouldReload(true)}
                />
              </Overlay>
            )}
          </>
        );

      // Add other cases for Training, Parental Leave, etc.
      default:
        return null;
    }
  };

  const renderPage = () => {
    const commonProps = {
      openAddModal: () => setIsAddModalOpen(true),
      openImportModal: () => setIsImportModalOpen(true),
      shouldReload,
      setShouldReload,
    };

    switch (selected) {
      case "Employability":
        return (
          <HREmployability
            {...commonProps}
            onFilterChange={handleFilteredDataFromChild}
            parentSelectedRowIds={selectedRowIds}
            onSelectedRowIdsChange={handleSelectedRowIdsChange}
            setFilteredData={setFilteredData}
          />
        );
      case "Parental Leave":
        return (
          <HRParental
            {...commonProps}
            onFilterChange={handleFilteredDataFromChild}
            parentSelectedRowIds={selectedRowIds}
            onSelectedRowIdsChange={handleSelectedRowIdsChange}
            setFilteredData={setFilteredData}
          />
        );
      case "Safety Work Data":
        return (
          <HRSafetyWorkData
            {...commonProps}
            onFilterChange={handleFilteredDataFromChild}
            parentSelectedRowIds={selectedRowIds}
            onSelectedRowIdsChange={handleSelectedRowIdsChange}
            setFilteredData={setFilteredData}
          />
        );
      case "Training":
        return (
          <HRTraining
            {...commonProps}
            onFilterChange={handleFilteredDataFromChild}
            parentSelectedRowIds={selectedRowIds}
            onSelectedRowIdsChange={handleSelectedRowIdsChange}
            setFilteredData={setFilteredData}
          />
        );
      case "Occupational Safety Health":
        return (
          <HROSH
            {...commonProps}
            onFilterChange={handleFilteredDataFromChild}
            parentSelectedRowIds={selectedRowIds}
            onSelectedRowIdsChange={handleSelectedRowIdsChange}
            setFilteredData={setFilteredData}
          />
        );
      default:
        return <div>Page Not Found</div>;
    }
  };

  useEffect(() => {
    setSelectedRowIds([]);
  }, [selected]);

  //create api for export
  const exportToExcel = async () => {
    try {
      const dataToExport =
        selectedRowIds.length > 0
          ? filteredExportData.filter((row) =>
              selectedRowIds.includes(row[idKey])
            )
          : filteredExportData;

      const response = await api.post("hr/export_excel", dataToExport, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "exported_hr_data.xlsx";
      a.click();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export Excel:", error);
    }
  };

  // BULK UPDATE
  const getRecordID = (record) => {
    if (record && typeof record === "object") {
      const firstKey = Object.keys(record)[0];

      return record[firstKey];
    }
    return null;
  };

  const fetchNextStatus = (action, currentStatus) => {
    const currentStatusId = statusIdToName[currentStatus];

    let newStatus = "";
    if (action === "approve") {
      switch (currentStatusId) {
        case "For Revision (Head)":
          newStatus = statuses[0]; // "URH"
          break;
        case "Under review (head level)":
          newStatus = statuses[2]; // "APP"
          break;
      }
    } else if (action === "revise") {
      switch (currentStatusId) {
        case "Under review (head level)":
          newStatus = statuses[1]; // "FRH"
          break;
      }
    }

    return newStatus;
  };

  const handleBulkStatusUpdate = async (action) => {
    //Check if the selected row ids status are the same
    const isSame = areSelectedStatusesSame();

    let currentStatus = null;
    if (isSame && selectedRowIds.length > 0) {
      // Get the status from the first selected row

      const firstRow = filteredData.find(
        (row) => String(row[idKey]) === String(selectedRowIds[0])
      );
      selectedRowIds.length > 0;
      currentStatus = firstRow?.status_id || null;
    } else {
      setErrorTitle("Error");
      setErrorMessage(
        "Selected rows have different statuses. Please select rows with the same status to proceed."
      );
      setIsErrorModalOpen(true);
      return; // Optionally stop if not the same
    }

    const newStatus = fetchNextStatus(action, currentStatus);

    if (newStatus) {
      console.log("Updated status to:", newStatus);
    } else {
      console.warn("No matching status transition found.");
    }

    try {
      if (action === "revise") {
        if (!remarks) {
          setErrorTitle("Remarks Required");
          setErrorMessage("Remarks is required for the status update.");
          setIsErrorModalOpen(true);

          return;
        }
      } else {
        const confirm = window.confirm(
          "Are you sure you want to approve this record?"
        );
        if (!confirm) return;
      }

      const payload = {
        record_ids: Array.isArray(selectedRowIds)
          ? selectedRowIds
          : [selectedRowIds],
        new_status: newStatus.trim(),
        remarks: remarks.trim(),
      };

      console.log(payload);

      const response = await api.post(
        "/usable_apis/bulk_update_status",
        payload
      );

      // alert(response.data.message);

      // Use the helper function to refresh data
      setSelectedRowIds([]);
      setShouldReload((prev) => !prev);

      setIsModalOpen(false);

      setRemarks("");

      // Show bulk revise modal if action is revise
      if (action === "revise") {
        setSuccessColor("#182959");
        setSuccessMessage(
          "The selected record(s) have been sent for revision."
        );
        setSuccessTitle("Revision Requested!");
        setIsSuccessModalOpen(true);
      }
    } catch (error) {
      console.error("Error updating record status:", error);
      alert(error?.response?.data?.detail || "Update Status Failed.");
    }
  };

  // Approve confirmation for bulk
  const handleApproveConfirm = async () => {
    setIsModalOpen(false);
    const isSame = areSelectedStatusesSame();
    let currentStatus = null;

    if (isSame && selectedRowIds.length > 0) {
      const firstRow = filteredData.find(
        (row) => String(row[idKey]) === String(selectedRowIds[0])
      );
      selectedRowIds.length > 0;
      currentStatus = firstRow?.status_id || null;
    } else {
      setErrorTitle("Error");
      setErrorMessage(
        "Selected rows have different statuses. Please select rows with the same status to proceed."
      );
      setIsErrorModalOpen(true);
      return;
    }

    const newStatus = fetchNextStatus("approve", currentStatus);

    if (!newStatus) {
      alert("No matching status transition found.");
      return;
    }
    try {
      const payload = {
        record_ids: Array.isArray(selectedRowIds)
          ? selectedRowIds
          : [selectedRowIds],
        new_status: newStatus.trim(),
        remarks: remarks.trim(),
      };
      await api.post("/usable_apis/bulk_update_status", payload);
      setSelectedRowIds([]);
      setShouldReload((prev) => !prev);

      setRemarks("");

      setSuccessMessage(
        "The selected record(s) have been successfully approved."
      );
      setSuccessTitle("Record(s) Approved Successfully!");
      setIsSuccessModalOpen(true);
    } catch (error) {
      alert(error?.response?.data?.detail || "Update Status Failed.");
    }
  };

  const areSelectedStatusesSame = () => {
    if (!selectedRowIds.length) return false;

    const selectedStatuses = selectedRowIds
      .map((id) =>
        filteredData.find((row) => String(row[idKey]) === String(id))
      )
      .filter(Boolean)
      .map((row) => row.status_id);

    return (
      selectedStatuses.length > 0 &&
      selectedStatuses.every((status) => status === selectedStatuses[0])
    );
  };
  const idKey =
    selected === "Employability"
      ? "employee_id"
      : selected === "Parental Leave"
      ? "parental_leave_id"
      : selected === "Safety Work Data"
      ? "safety_workdata_id"
      : selected === "Training"
      ? "training_id"
      : selected === "Occupational Safety Health"
      ? "osh_id"
      : "id";

  const isApprove = selectedRowIds
    .map((id) => filteredData.find((row) => row[idKey] === id))
    .filter(Boolean)
    .every((row) => row.status_id === "APP");

  const allowedStatuses = ["FRS", "FRH"];
  console.log(selectedRowIds);
  const isForRevision = selectedRowIds
    .map((id) => filteredData.find((row) => String(row[idKey]) === String(id)))
    .filter(Boolean)
    .every((row) => allowedStatuses.includes(row.status_id));

  // Filter only selected rows for export
  const selectedRows = filteredData
    .filter((row) => selectedRowIds.includes(row[idKey]))
    .map((row) => ({
      ...row,
      statusIdName: statusIdToName[row.status_id] || row.status_id,
    }));
  console.log("Render Check", selectedRowIds.length, isApprove);
  return (
    <Box
      sx={{
        display: "flex",
      }}
    >
      <Sidebar />
      <Box sx={{ flexGrow: 1, height: "100vh", overflow: "auto" }}>
        <Box sx={{ p: 4 }}>
          {/* Common title only */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
            }}
          >
            <div>
              <h1
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "bold",
                  marginBottom: "0.5rem",
                }}
              >
                REPOSITORY
              </h1>
              <h2 style={{ fontSize: "2rem", color: "#182959" }}>
                Social - Human Resources
              </h2>
            </div>

            <div style={{ display: "flex", gap: "0.5rem" }}>
              {selectedRowIds.length > 0 && !isApprove ? (
                <>
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
                  {selectedRowIds.length > 0 && !isForRevision && (
                    <Button
                      variant="contained"
                      sx={{
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
                </>
              ) : (
                <>
                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor: "#182959",
                      borderRadius: "999px",
                      padding: "9px 18px",
                      fontSize: "0.85rem",
                      fontWeight: "bold",
                      "&:hover": {
                        backgroundColor: "#0f1a3c",
                      },
                    }}
                    startIcon={<FileUploadIcon />}
                    onClick={() => exportToExcel(filteredExportData)}
                  >
                    EXPORT DATA
                  </Button>
                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor: "#182959",
                      borderRadius: "999px",
                      padding: "9px 18px",
                      fontSize: "0.85rem",
                      fontWeight: "bold",
                      "&:hover": {
                        backgroundColor: "#0f1a3c",
                      },
                    }}
                    onClick={() => setIsImportModalOpen(true)}
                  >
                    IMPORT
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    sx={{
                      backgroundColor: "#2B8C37",
                      borderRadius: "999px",
                      padding: "9px 18px",
                      fontSize: "0.85rem",
                      fontWeight: "bold",
                      "&:hover": {
                        backgroundColor: "#256d2f",
                      },
                    }}
                    onClick={() => setIsAddModalOpen(true)}
                  >
                    ADD RECORD
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Common navigation buttons */}
          <PageButtons
            pages={pages}
            selected={selected}
            setSelected={setSelected}
          />

          {/* Page-specific content with controls inside */}
          <Box mt={3}>{renderPage()}</Box>
        </Box>
        {renderModals()}

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
                  onClick={() => {
                    setIsModalOpen(false);
                    setRemarks("");
                  }}
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
                    handleBulkStatusUpdate("revise");
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
              message={""}
              onConfirm={handleApproveConfirm}
              onCancel={() => setIsModalOpen(false)}
              summaryData={selectedRows.flatMap((row) => [
                { label: "ID", value: getRecordID(row) },
                { label: "Status", value: row.statusIdName },
              ])}
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
              }}
            />
          </Overlay>
        )}
      </Box>
    </Box>
  );
}

export default HRMain;
