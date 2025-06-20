import { useState } from "react";
import { Box, Button, Container, IconButton, Typography } from "@mui/material";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import AddIcon from "@mui/icons-material/Add";
import Sidebar from "../../components/Sidebar";
import { format } from "date-fns";

import api from "../../services/api";

import PageButtons from "../../components/hr_components/page_button";

import HREmployability from "./HREmployabilityDash";
import HRSafetyTraining from "./HRSafetyTrainingDash";

import RefreshIcon from "@mui/icons-material/Refresh";
import Overlay from "../../components/modal";
import DashboardHeader from "../../components/DashboardComponents/DashboardHeader";
import RefreshButton from "../../components/DashboardComponents/RefreshButton";
import TabButtons from "../../components/DashboardComponents/TabButtons";
import MultiSelectWithChips from "../../components/DashboardComponents/MultiSelectDropdown";
import MonthRangeSelect from "../../components/DashboardComponents/MonthRangeSelect";
import dayjs from "dayjs";

const formatDateTime = (date) => format(date, "PPPpp");

const tabs = [
  { key: "employability", label: "Employability" },
  { key: "safetyandtraining", label: "Safety & Training Overview" },
];

function HRMainDash() {
  const lastUpdated = new Date();
  const [activeTab, setActiveTab] = useState("employability");
  const [shouldReload, setShouldReload] = useState(false);

  const renderPage = () => {
    const commonProps = {
      shouldReload,
      setShouldReload,
    };
    switch (activeTab) {
      case "employability":
        return <HREmployability {...commonProps} />;

      case "safetyandtraining":
        return <HRSafetyTraining {...commonProps} />;
      default:
        return <div>Page Not Found</div>;
    }
  };

  const handleRefresh = () => {
    setShouldReload((prev) => !prev);
  };

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <Sidebar />
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          height: "100vh",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            px: 2,
            pt: 2,
            flexShrink: 0,
          }}
        >
          <DashboardHeader
            title="Human Resources"
            lastUpdated={lastUpdated}
            formatDateTime={formatDateTime}
          />
          <Box sx={{ mt: "15px" }}>
            <button
              onClick={handleRefresh}
              style={{
                backgroundColor: "#1976d2",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                fontSize: "13px",
                fontWeight: "700",
                transition: "background-color 0.2s ease",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = "#115293")}
              onMouseOut={(e) => (e.target.style.backgroundColor = "#1976d2")}
            >
              <RefreshIcon style={{ fontSize: "16px" }} />
              Refresh
            </button>
          </Box>
        </Box>

        {/* Tabs */}
        <Box sx={{ px: 2, flexShrink: 0 }}>
          <TabButtons
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </Box>

        {/* Page-specific content with controls inside */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "stretch",
            width: "100%",
            overflow: "auto",
          }}
        >
          <Box
            mt={0}
            sx={{
              width: "98%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {renderPage()}
          </Box>
        </Box>
      </Box>
    </Box>
  );

  // return (
  //   <Box sx={{ display: "flex" }}>
  //     <Sidebar />
  //     <Box sx={{ flexGrow: 1, height: "100vh", overflow: "auto" }}>
  //       <Box sx={{ p: 4 }}>
  //         {/* Common title only */}
  //         <div
  //           style={{
  //             display: "flex",
  //             justifyContent: "space-between",
  //             alignItems: "center",
  //             marginBottom: "1rem",
  //           }}
  //         >
  //           <div>
  //             <h1
  //               style={{
  //                 fontSize: "1.5rem",
  //                 fontWeight: "bold",
  //                 marginBottom: "0.5rem",
  //               }}
  //             >
  //               DASHBOARD
  //             </h1>
  //             <h2 style={{ fontSize: "2rem", color: "#182959" }}>
  //               Social - Human Resources
  //             </h2>
  //           </div>

  //           <div style={{ display: "flex", gap: "0.5rem" }}>
  //             <Button
  //               variant="contained"
  //               sx={{
  //                 backgroundColor: "#182959",
  //                 borderRadius: "999px",
  //                 padding: "9px 18px",
  //                 fontSize: "0.85rem",
  //                 fontWeight: "bold",
  //                 "&:hover": {
  //                   backgroundColor: "#0f1a3c",
  //                 },
  //               }}

  //               onClick={handleRefresh}
  //             >
  //               REFRESH
  //             </Button>
  //           </div>
  //         </div>

  //         {/* Common navigation buttons */}
  //         <PageButtons
  //           pages={pages}
  //           selected={selected}
  //           setSelected={setSelected}
  //         />

  //         {/* Page-specific content with controls inside */}
  //         <Box mt={3}>{renderPage()}</Box>
  //       </Box>
  //     </Box>
  //   </Box>
  // );
}

export default HRMainDash;
