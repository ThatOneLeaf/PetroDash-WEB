import { useState, useRef } from "react";
import {
  Paper,
  Typography,
  Button,
  Box,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";

import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import api from "../../../services/api";

function ImportEconGeneratedModal({ onClose }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState({ title: '', message: '', type: 'info' });
  const fileInputRef = useRef(null);
  const templateURL = "economic_generated_template.xlsx";

  const showDialog = (title, message, type = 'info') => {
    setDialogContent({ title, message, type });
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    if (dialogContent.type === 'success') {
      onClose(); // Close the main modal on success
    } else if (dialogContent.type === 'error') {
      // Clear the selected file on error so user can upload again
      setSelectedFile(null);
      // Reset the file input element
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

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
      const response = await api.post("/economic/import-generated", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const result = response.data;
      
      // Check if there were validation errors
      if (result.errors > 0) {
        let errorMessage = `Import rejected due to ${result.errors} validation error${result.errors > 1 ? 's' : ''}:\n\n`;
        errorMessage += `Total rows processed: ${result.total_processed}\n`;
        errorMessage += `Successful imports: ${result.successful_imports}\n`;
        errorMessage += `Failed rows: ${result.errors}\n\n`;
        errorMessage += "Detailed errors:\n";
        
        if (result.error_details) {
          errorMessage += result.error_details.join('\n');
          if (result.errors > result.error_details.length) {
            errorMessage += `\n... and ${result.errors - result.error_details.length} more error${result.errors - result.error_details.length > 1 ? 's' : ''}`;
          }
        }
        
        errorMessage += '\n\nCommon issues:\n';
        errorMessage += '• Year must be a 4-digit number (e.g., 2024)\n';
        errorMessage += '• Numerical fields cannot contain letters or special characters\n';
        errorMessage += '• All values should be numbers (decimals allowed)\n';
        errorMessage += '• Required fields cannot be empty';
        
        showDialog('Validation Errors', errorMessage, 'error');
        return;
      }
      
      // Success case
      console.log("Economic generated data file uploaded successfully");
      showDialog('Import Successful', `Import completed successfully! ${result.successful_imports} records imported.`, 'success');
      
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
          ref={fileInputRef}
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

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 2,
          }}
        >
          <Button
            variant="outlined"
            onClick={onClose}
            sx={{
              color: "#666",
              borderColor: "#666",
              borderRadius: "999px",
              padding: "9px 18px",
              fontSize: "0.85rem",
              fontWeight: "bold",
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
              bgcolor: "#2B8C37",
              borderRadius: "999px",
              padding: "9px 18px",
              fontSize: "0.85rem",
              fontWeight: "bold",
              "&:hover": { bgcolor: "#256d2f" },
              "&:disabled": { bgcolor: "#ccc" },
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
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            maxHeight: '80vh',
          }
        }}
      >
        <DialogTitle sx={{ 
          color: dialogContent.type === 'success' ? '#2E7D32' : 
                 dialogContent.type === 'error' ? '#d32f2f' : 
                 dialogContent.type === 'warning' ? '#f57c00' : '#1976d2',
          borderBottom: '1px solid #eee',
          pb: 2
        }}>
          {dialogContent.title}
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Box sx={{ 
            maxHeight: '60vh', 
            overflow: 'auto',
            '& pre': {
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              fontFamily: 'monospace',
              fontSize: '0.875rem',
              backgroundColor: dialogContent.type === 'error' ? '#fef2f2' : 'transparent',
              padding: dialogContent.type === 'error' ? 2 : 0,
              borderRadius: 1,
              border: dialogContent.type === 'error' ? '1px solid #fecaca' : 'none'
            }
          }}>
            <Typography 
              component="pre" 
              sx={{ 
                whiteSpace: 'pre-line',
                fontFamily: dialogContent.type === 'error' ? 'monospace' : 'inherit',
                fontSize: dialogContent.type === 'error' ? '0.875rem' : 'inherit'
              }}
            >
              {dialogContent.message}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid #eee', pt: 2 }}>
          <Button 
            onClick={handleDialogClose}
            variant="contained"
            sx={{ 
              bgcolor: dialogContent.type === 'success' ? '#2E7D32' : 
                      dialogContent.type === 'error' ? '#d32f2f' : 
                      dialogContent.type === 'warning' ? '#f57c00' : '#1976d2',
              '&:hover': {
                bgcolor: dialogContent.type === 'success' ? '#1b5e20' : 
                         dialogContent.type === 'error' ? '#b71c1c' : 
                         dialogContent.type === 'warning' ? '#e65100' : '#1565c0'
              }
            }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default ImportEconGeneratedModal;
