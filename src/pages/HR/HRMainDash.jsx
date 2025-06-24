import { useState } from "react";
import { Box, Button, Container, IconButton, Typography, useTheme, useMediaQuery } from "@mui/material";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import AddIcon from "@mui/icons-material/Add";
import Sidebar from "../../components/Sidebar";
import { format } from "date-fns";

import api from "../../services/api";

import PageButtons from "../../components/hr_components/page_button";

import HREmployability from "./HREmployabilityDash";

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
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

      default:
        return <div>Page Not Found</div>;
    }
  };

  const handleRefresh = () => {
    setShouldReload((prev) => !prev);
  };
  return (
    <Box sx={{ display: "flex", flexDirection: { xs: 'column', md: 'row' }, height: { xs: 'auto', md: "100vh" }, minHeight: { xs: '100vh', md: 'auto' } }}>
      <Sidebar />
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: { xs: 'visible', md: "hidden" },
          height: { xs: 'auto', md: "100vh" },
        }}
      >        {/* Header */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: "space-between",
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: { xs: 2, sm: 0 },
            px: { xs: 1, sm: 2 },
            pt: 2,
            flexShrink: 0,
          }}
        >
          <DashboardHeader
            title="Human Resources"
            lastUpdated={lastUpdated}
            formatDateTime={formatDateTime}
          />
          <Box sx={{ mt: { xs: 0, sm: "15px" } }}>
            <button
              onClick={handleRefresh}
              style={{
                backgroundColor: "#1976d2",
                color: "white",
                border: "none",
                padding: isSmallScreen ? "6px 12px" : "8px 16px",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                gap: isSmallScreen ? "6px" : "8px",
                cursor: "pointer",
                fontSize: isSmallScreen ? "11px" : "13px",
                fontWeight: "700",
                transition: "background-color 0.2s ease",
                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = "#115293")}
              onMouseOut={(e) => (e.target.style.backgroundColor = "#1976d2")}
            >
              <RefreshIcon style={{ fontSize: isSmallScreen ? "14px" : "16px" }} />
              Refresh
            </button>
          </Box>
        </Box>

        {/* Tabs */}
        {/* <Box sx={{ px: 2, flexShrink: 0 }}>
          <TabButtons
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </Box> */}        {/* Page-specific content with controls inside */}
        <Box
          sx={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "stretch",
            width: "100%",
            overflow: { xs: 'visible', md: "auto" },
            px: { xs: 1, sm: 0 },
          }}
        >
          <Box
            mt={0}
            sx={{
              width: { xs: "100%", sm: "98%" },
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
