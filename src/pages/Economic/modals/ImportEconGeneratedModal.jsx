import { useState } from "react";
import {
  Paper,
  Typography,
  Button,
  Box,
  Tooltip,
} from "@mui/material";

import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import api from "../../../services/api";
import SuccessDialog from "../../../components/SuccessDialog";

function ImportEconGeneratedModal({ onClose }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const templateURL = "economic_generated_template.xlsx";

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await api.get('/economic/template-generated', {
        responseType: 'blob', // Important for file downloads
      });
      
      // Create blob link to download the file
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'economic_generated_template.xlsx';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading template:', error);
      alert('Error downloading template. Please try again.');
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      alert("Please select a file before importing.");
      return;
    }

    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
    ];
    
    if (!validTypes.includes(selectedFile.type)) {
      alert("Please select a valid Excel file (.xlsx or .xls).");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      setIsUploading(true);
      const response = await api.post("/economic/import-generated", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const result = response.data;
      
      // Check if there were validation errors
      if (result.errors > 0) {
        let errorMessage = `Import rejected due to validation errors:\n\n`;
        if (result.error_details) {
          errorMessage += result.error_details.join('\n');
          if (result.errors > result.error_details.length) {
            errorMessage += `\n... and ${result.errors - result.error_details.length} more errors`;
          }
        }
        alert(errorMessage);
        return;
      }
      
      // Success case
      console.log("Economic generated data file uploaded successfully");
      setSuccessMessage(`Import completed successfully! ${result.successful_imports} records imported.`);
      setShowSuccess(true);
      
    } catch (error) {
      console.error("Error uploading file:", error);
      alert(error.response?.data?.detail || "Error importing file. Please check the file format and try again.");
    } finally {
      setIsUploading(false);
    }
  };

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
          color: "#182959",
          mb: 3,
          fontWeight: "bold",
        }}
      >
        Import Economic Generated Data
      </Typography>

      <Typography
        variant="body2"
        sx={{
          color: "#2B8C37",
          mb: 3,
          textAlign: "center",
          fontWeight: "bold",
          textDecoration: "underline",
          cursor: "pointer",
        }}
        onClick={handleDownloadTemplate}
      >
        DOWNLOAD EXCEL TEMPLATE
      </Typography>

      <input
        type="file"
        accept=".xlsx,.xls"
        style={{ display: "none" }}
        id="econ-generated-file-input"
        onChange={handleFileChange}
      />

      <label htmlFor="econ-generated-file-input">
        <Box
          sx={{
            bgcolor: "#e0e0e0",
            borderRadius: 2,
            p: 3,
            textAlign: "center",
            mb: 2,
            border: "4px dotted #9e9e9e",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            "&:hover": {
              bgcolor: "#d5d5d5",
            },
          }}
        >
          <UploadFileIcon sx={{ mr: 1 }} />
          <Typography variant="body1" color="textSecondary">
            {selectedFile ? selectedFile.name : "Click to Upload Excel File"}
          </Typography>
        </Box>
      </label>

      <Typography
        variant="body2"
        sx={{
          color: "#666",
          mb: 3,
          textAlign: "center",
          fontSize: "0.8rem",
          fontStyle: "italic",
        }}
      >
        Expected columns: Year, Electricity Sales, Oil Revenues, Other Revenues, Interest Income, Share in Net Income of Associate, Miscellaneous Income
      </Typography>

      {selectedFile && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            color: "#182959",
            mb: 3,
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

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>
        <Button
          variant="outlined"
          onClick={onClose}
          sx={{
            color: "#666",
            borderColor: "#666",
            "&:hover": {
              borderColor: "#333",
              color: "#333",
            },
          }}
        >
          CANCEL
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!selectedFile || isUploading}
          sx={{
            backgroundColor: "#2B8C37",
            "&:hover": {
              backgroundColor: "#256d2f",
            },
          }}
        >
          {isUploading ? "IMPORTING..." : "IMPORT"}
        </Button>
      </Box>

      <SuccessDialog
        open={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          onClose();
        }}
        title="Import Successful!"
        message={successMessage}
      />
    </Paper>
  );
}

export default ImportEconGeneratedModal;
