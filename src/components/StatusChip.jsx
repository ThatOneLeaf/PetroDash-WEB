import { Chip } from "@mui/material";

function StatusChip({ status }) {
  const code = status?.toUpperCase() || "";

  const statusMap = {
    "UNDER REVIEW (SITE)": { label: "Under Review (Site)", color: "default" },
    "APPROVED": { label: "Approved", color: "success" },
    "UNDER REVIEW (HEAD)": { label: "Under Review (Head)", color: "info" },
    "FOR REVISION (SITE)": { label: "For Revision (Site)", color: "warning" },
    "FOR REVISION (HEAD)": { label: "For Revision (Head)", color: "error" },
  };

  const { label, color } = statusMap[code] || { label: status || "Unknown", color: "default" };

  return <Chip label={label} color={color} size="small" />;
}

export default StatusChip;
