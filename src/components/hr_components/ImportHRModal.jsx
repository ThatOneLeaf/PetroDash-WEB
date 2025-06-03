import { useState } from "react";
import {
  Paper,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  Box,
} from "@mui/material";

import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import UploadFileIcon from "@mui/icons-material/UploadFile";

import api from "../../services/api";

function ImportHRModal({ onClose, context = "employability" }) {
  const templateConfig = {
    employability: {
      templateURL: "employability_template.csv",
      filename: "HR_Employability_2025.csv",
    },
    parentalleave: {
      templateURL: "parental_template.csv",
      filename: "HR_Parental_Leave_2025.csv",
    },
    safetyworkdata: {
      templateURL: "safetyworkdata_template.csv",
      filename: "HR_Safety_Work_Data_2025.csv",
    },
    training: {
      templateURL: "training_template.csv",
      filename: "HR_Training_2025.csv",
    },
  };

  const config = templateConfig[context] || templateConfig["employability"];

  const handleSubmit = () => {
    console.log("Submit clicked", formData);
    onClose();
  };

  /* API FOR SUBMIT OF ADD RECORD
  const handleSubmit = async () => {
    try {
      await api.post('/economic/value-generated', formData);
      onClose();
      // You might want to refresh the data after adding
    } catch (error) {
      console.error('Error adding record:', error);
    }
  };*/

  return (
    <Paper
      sx={{
        p: 4,
        width: "450px",
        borderRadius: "16px",
        bgcolor: "white",
      }}
    >
      <Typography
        variant="h5"
        sx={{
          color: "#1a237e",
          mb: 3,
          fontWeight: "bold",
        }}
      >
        Import Record
      </Typography>

      <Typography
        variant="body2"
        sx={{
          color: "#2B8C37",
          mb: 3,
          textAlign: "center",
          fontWeight: "bold",
          textDecoration: "underline",
        }}
      >
        DOWNLOAD CSV TEMPLATE
      </Typography>

      <input
        type="file"
        style={{ display: "none" }}
        multiple // remove if you want only 1 file
      />

      <Box
        sx={{
          bgcolor: "#e0e0e0",
          borderRadius: 2,
          p: 3,
          textAlign: "center",
          mb: 3,
          border: "4px dotted #9e9e9e",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <UploadFileIcon sx={{ mr: 1 }} />

        <Typography variant="body1" color="textSecondary">
          File Upload
        </Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          color: "#1a237e",
          mb: 3,
          fontWeight: "bold",
          justifyContent: "center",
        }}
      >
        <InsertDriveFileIcon sx={{ mr: 1 }} />
        <Typography variant="body2">{config.filename}</Typography>
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          mt: 2,
        }}
      >
        <Button
          variant="contained"
          onClick={handleSubmit}
          sx={{
            bgcolor: "#2E7D32",
            "&:hover": { bgcolor: "#1b5e20" },
          }}
        >
          IMPORT
        </Button>
      </Box>
    </Paper>
  );
}

export default ImportHRModal;
