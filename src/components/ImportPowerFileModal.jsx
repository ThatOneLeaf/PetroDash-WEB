import { useState } from "react";
import {
  Paper,
  Typography,
  Button,
  Box,
} from "@mui/material";

import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import api from "../services/api";
import FormModal from "./FormModal";

function ImportPowerFileModal({ onClose }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const templateURL = "energy_template.csv";

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleDownloadTemplate = () => {
    const link = document.createElement("a");
    link.href = `/templates/${templateURL}`;
    link.download = templateURL;
    link.click();
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      alert("Please select a file before importing.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      await api.post("/energy/import", formData);
      console.log("File uploaded successfully");
      onClose();
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };
  return (
    <FormModal
      title="Import Data"
      subtitle="Daily Generation"
      width="450px"
      actions={
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
      }
    >
      <Typography
        variant="body2"
        sx={{
          color: "#2B8C37",
          mb: 1,
          textAlign: "center",
          fontWeight: "bold",
          textDecoration: "underline",
          cursor: "pointer",
        }}
        onClick={handleDownloadTemplate}
      >
        DOWNLOAD CSV TEMPLATE
      </Typography>

      <input
        type="file"
        accept=".csv"
        style={{ display: "none" }}
        id="energy-file-input"
        onChange={handleFileChange}
      />

      <label htmlFor="energy-file-input">
        <Box
          sx={{
            bgcolor: "#e0e0e0",
            borderRadius: 2,
            p: 3,
            textAlign: "center",
            border: "4px dotted #9e9e9e",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
          }}
        >
          <UploadFileIcon sx={{ mr: 1 }} />
          <Typography variant="body1" color="textSecondary">
            {selectedFile ? selectedFile.name : "Click to Upload CSV File"}
          </Typography>
        </Box>
      </label>

      {selectedFile && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            color: "#1a237e",
            fontWeight: "bold",
            justifyContent: "center",
          }}
        >
          <InsertDriveFileIcon sx={{ mr: 1 }} />
          <Typography variant="body2" noWrap maxWidth="300px">
            {selectedFile.name}
          </Typography>
        </Box>
      )}
    </FormModal>
  );
}

export default ImportPowerFileModal;
