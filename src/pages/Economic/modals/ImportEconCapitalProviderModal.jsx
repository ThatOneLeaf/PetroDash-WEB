import { useState } from "react";
import {
  Paper,
  Typography,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from "@mui/material";

import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import api from "../../../services/api";
import SuccessDialog from "../../../components/SuccessDialog";

function ImportEconCapitalProviderModal({ onClose }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState({ title: '', message: '', type: 'info' });
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const showDialog = (title, message, type = 'info') => {
    setDialogContent({ title, message, type });
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    if (dialogContent.type === 'success') {
      onClose(); // Close the main modal on success
    }
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await api.get('/economic/template-capital-provider', {
        responseType: 'blob', // Important for file downloads
      });
      
      // Create blob link to download the file
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'economic_capital_provider_template.xlsx';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading template:', error);
      showDialog('Download Error', 'Error downloading template. Please try again.', 'error');
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      showDialog('File Required', 'Please select a file before importing.', 'warning');
      return;
    }

    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
    ];
    
    if (!validTypes.includes(selectedFile.type)) {
      showDialog('Invalid File Type', 'Please select a valid Excel file (.xlsx or .xls).', 'warning');
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      setIsUploading(true);
      const response = await api.post("/economic/import-capital-provider", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const result = response.data;
      
      // Check if there were validation errors
      if (result.errors > 0) {
        let errorMessage = 'Import rejected due to validation errors:\n\n';
        if (result.error_details) {
          errorMessage += result.error_details.join('\n');
          if (result.errors > result.error_details.length) {
            errorMessage += `\n... and ${result.errors - result.error_details.length} more errors`;
          }
        }
        showDialog('Validation Errors', errorMessage, 'error');
        return;
      }
      
      // Success case
      console.log("Economic capital provider data file uploaded successfully");
      setSuccessMessage(`Import completed successfully! ${result.successful_imports} records imported.`);
      setShowSuccess(true);
      
    } catch (error) {
      console.error("Error uploading file:", error);
      showDialog('Import Error', error.response?.data?.detail || 'Error importing file. Please check the file format and try again.', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
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
          Import Capital Provider Payments Data
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
          id="econ-capital-provider-file-input"
          onChange={handleFileChange}
        />

        <label htmlFor="econ-capital-provider-file-input">
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
          Expected columns: Year, Interest, Dividends to NCI, Dividends to Parent Company, Total Payments
        </Typography>

        {selectedFile && (
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
      </Paper>

      {/* Dialog for messages */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          color: dialogContent.type === 'success' ? '#2E7D32' : 
                 dialogContent.type === 'error' ? '#d32f2f' : 
                 dialogContent.type === 'warning' ? '#f57c00' : '#1976d2'
        }}>
          {dialogContent.title}
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ whiteSpace: 'pre-line' }}>
            {dialogContent.message}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleDialogClose}
            sx={{ 
              color: dialogContent.type === 'success' ? '#2E7D32' : 
                     dialogContent.type === 'error' ? '#d32f2f' : 
                     dialogContent.type === 'warning' ? '#f57c00' : '#1976d2'
            }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>

      <SuccessDialog
        open={showSuccess}
        onClose={() => {
          setShowSuccess(false);
          onClose();
        }}
        title="Import Successful!"
        message={successMessage}
      />
    </>
  );
}

export default ImportEconCapitalProviderModal; 