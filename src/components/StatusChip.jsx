import { Chip} from "@mui/material";

function StatusChip({ status }) {
  const code = status?.toUpperCase() || "";
  let label = "";
  let color = "default";

  switch (code) {
    case "URS":
      label = "Under Review (Site)";
      break;
    case "APP":
      label = "Approved";
      color = "success";
      break;
    case "URH":
      label = "Under Review (Head)";
      color = "info";
      break;
    case "FRS":
      label = "For Revision (Site)";
      color = "warning";
      break;
    case "FRH":
      label = "For Revision (Head)";
      color = "error";
      break;
    case "APPROVED":
      label = "Approved";
      color = "success";
      break;
    case "UNDER REVIEW (SITE)":
      label = "Under Review (Site)";
      break;
    case "UNDER REVIEW (HEAD)":
      label = "Under Review (Head)";
      color = "info";
      break;
    case "FOR REVISION (SITE)":
      label = "For Revision (Site)";
      color = "warning";
      break;
    case "FOR REVISION (HEAD)":
      label = "For Revision (Head)";
      color = "error";
      break;
    default:
      label = code;
  }

  return <Chip label={label} color={color} size="small" />;
}

export default StatusChip;