import { styled } from "@mui/material/styles";
import { Select, MenuItem, FormControl, InputLabel } from "@mui/material";

export const FilterRow = styled("div")(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
}));

export const StyledFormControl = styled(FormControl)(({ theme }) => ({
  minWidth: 180,
}));

export const StyledMUISelect = styled(Select)(({ theme }) => ({
  borderRadius: 100,
  fontWeight: 500,
  fontSize: 14,
  color: "#5B5B5B",
  height: 40,
  textTransform: "uppercase", // <-- add this
  '& .MuiSelect-select': {
    padding: "6px 24px 6px 12px",
    display: "flex",
    alignItems: "center",
    textTransform: "uppercase", // <-- also here
  },
  '& fieldset': {
    border: "2px solid #5B5B5B",
  },
  '&:hover fieldset': {
    borderColor: "#A6A6A6",
  },
}));


export const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  fontSize: 13,
  fontWeight: 400,
  color: "#1A1818",
  textTransform: "uppercase", // <-- add this
  '&.Mui-selected': {
    backgroundColor: "#f0f0f0",
    fontWeight: 800,
    color: "#182959",
  },
  '&:hover': {
    backgroundColor: "#f0f0f0",
  },
}));
