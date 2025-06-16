import { useState } from "react";
import { Box, Button } from "@mui/material";
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

function HRMain() {
  const [selected, setSelected] = useState("Employability");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [shouldReload, setShouldReload] = useState(false);

  const [filteredExportData, setFilteredExportData] = useState(null);

  const pages = [
    "Employability",
    "Parental Leave",
    "Safety Work Data",
    "Training",
    "OSH",
  ];

  const handleFilteredDataFromChild = (data) => {
    setFilteredExportData(data);
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
                  //uploadPath=
                  onClose={() => setIsImportModalOpen(false)}
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
                  //uploadPath=
                  onClose={() => setIsImportModalOpen(false)}
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
                  //uploadPath=
                  onClose={() => setIsImportModalOpen(false)}
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
                  //uploadPath=
                  onClose={() => setIsImportModalOpen(false)}
                />
              </Overlay>
            )}
          </>
        );

      case "OSH":
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
                  title="HR - OSH"
                  downloadPath="hr/template-osh"
                  //uploadPath=
                  onClose={() => setIsImportModalOpen(false)}
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
          />
        );
      case "Parental Leave":
        return (
          <HRParental
            {...commonProps}
            onFilterChange={handleFilteredDataFromChild}
          />
        );
      case "Safety Work Data":
        return (
          <HRSafetyWorkData
            {...commonProps}
            onFilterChange={handleFilteredDataFromChild}
          />
        );
      case "Training":
        return (
          <HRTraining
            {...commonProps}
            onFilterChange={handleFilteredDataFromChild}
          />
        );
      case "OSH":
        return (
          <HROSH
            {...commonProps}
            onFilterChange={handleFilteredDataFromChild}
          />
        );
      default:
        return <div>Page Not Found</div>;
    }
  };

  //create api for export
  const exportToExcel = async () => {
    try {
      const response = await api.post("hr/export_excel", filteredExportData, {
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

  return (
    <Box sx={{ display: "flex" }}>
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
      </Box>
    </Box>
  );
}

export default HRMain;
