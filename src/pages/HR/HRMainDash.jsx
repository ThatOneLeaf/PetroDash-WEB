import { useState } from "react";
import { 
  Box,
  Button,
  Container,
  IconButton,
  Typography
} from "@mui/material";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import AddIcon from "@mui/icons-material/Add";
import Sidebar from "../../components/Sidebar";
import { format } from "date-fns";

import api from "../../services/api";

import PageButtons from "../../components/hr_components/page_button";

import HREmployability from "./HREmployabilityDash";
import HRSafetyTraining from "./HRSafetyTrainingDash";

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
  const [selected, setSelected] = useState("Employability");
  const [activeTab, setActiveTab] = useState("employability");
  
  const [filteredExportData, setFilteredExportData] = useState(null);

  const pages = ["Employability", "Safety & Training Overview"];

  const handleFilteredDataFromChild = (data) => {
    setFilteredExportData(data);
  };

  const renderPage = () => {
    switch (activeTab) {
      case "employability":
        return <HREmployability />;

      case "safetyandtraining":
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
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 2, pt: 2, flexShrink: 0 }}>
          <DashboardHeader
            title="Human Resources"
            lastUpdated={lastUpdated}
            formatDateTime={formatDateTime}
          />
          <Box sx={{ mt: "15px" }}>
            <RefreshButton onClick={handleRefresh} />
          </Box>
        </Box>


        {/* Tabs */}
        <Box sx={{ px: 2, flexShrink: 0 }}>
          <TabButtons tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
        </Box>
        
          {/* Page-specific content with controls inside */}
          <Box mt={3}>{renderPage()}</Box>
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
