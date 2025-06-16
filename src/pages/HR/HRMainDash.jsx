import { useState } from "react";
import { Box, Button } from "@mui/material";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import AddIcon from "@mui/icons-material/Add";
import Sidebar from "../../components/Sidebar";

import api from "../../services/api";

import PageButtons from "../../components/hr_components/page_button";

import HREmployability from "./HREmployabilityDash";
import HRSafetyTraining from "./HRSafetyTrainingDash";

import Overlay from "../../components/modal";

function HRMainDash() {
  const [selected, setSelected] = useState("Employability");

  const [filteredExportData, setFilteredExportData] = useState(null);

  const pages = ["Employability", "Safety & Training Overview"];

  const handleFilteredDataFromChild = (data) => {
    setFilteredExportData(data);
  };

  const renderPage = () => {
    switch (selected) {
      case "Employability":
        return <HREmployability />;

      case "Safety & Training Overview":
        return <HRSafetyTraining />;
      default:
        return <div>Page Not Found</div>;
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  //create api for export
  const exportToExcel = async () => {};

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
                DASHBOARD
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
        
                onClick={handleRefresh}
              >
                REFRESH
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
      </Box>
    </Box>
  );
}

export default HRMainDash;
