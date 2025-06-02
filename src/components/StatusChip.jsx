import { Chip} from "@mui/material";

function StatusChip({ status }) {
  const code = status?.toUpperCase() || "";
  let label = "";
  let color = "default";

  switch (code) {
    case "PND":
      label = "Pending";
      break;
    case "HAP":
      label = "Head Approved";
      color = "success";
      break;
    case "SAP":
      label = "Site Approved";
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
    default:
      label = code;
  }

  return <Chip label={label} color={color} size="small" />;
}

export default StatusChip;