import { Chip} from "@mui/material";

function StatusChip({ status }) {
  const getStatusConfig = (status) => {
    const statusStr = status?.toUpperCase() || "";
    
    if (statusStr.includes("UNDER REVIEW") && statusStr.includes("SITE") || statusStr === "URS") {
      return { label: "Under Review (Site)", color: "default" };
    }
    if (statusStr.includes("APPROVED") || statusStr === "APP") {
      return { label: "Approved", color: "success" };
    }
    if (statusStr.includes("UNDER REVIEW") && statusStr.includes("HEAD") || statusStr === "URH") {
      return { label: "Under Review (Head)", color: "info" };
    }
    if (statusStr.includes("FOR REVISION") && statusStr.includes("SITE") || statusStr === "FRS") {
      return { label: "For Revision (Site)", color: "warning" };
    }
    if (statusStr.includes("FOR REVISION") && statusStr.includes("HEAD") || statusStr === "FRH") {
      return { label: "For Revision (Head)", color: "error" };
    }
    
    return { label: status || "Unknown", color: "default" };
  };

  const { label, color } = getStatusConfig(status);
  return <Chip label={label} color={color} size="small" />;
}

export default StatusChip;