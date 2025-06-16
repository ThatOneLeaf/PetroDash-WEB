import { useState } from "react";
import {
  Paper,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";

import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import api from "../services/api";

function ImportFileModal({
  onClose,
  title,
  downloadPath,
  uploadPath,
  fileType = "xlsx"
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    // Reset upload result when new file is selected
    setUploadResult(null);
    setUploadSuccess(false);
  };

  const handleDownloadTemplate = async () => {
    try {
      setDownloadingTemplate(true);
      const response = await api.get(downloadPath, {
        params: { include_examples: true },
        responseType: "blob"
      });

      const blob = new Blob([response.data], { type: response.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const file = downloadPath.split("/").pop();

      const disposition = response.headers["content-disposition"];
      const filenameMatch = disposition?.match(/filename="?(.+)"?/);
      const filename = filenameMatch ? filenameMatch[1] : `${file}_template.${fileType}`;

      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert("Failed to download template.");
      console.error(error);
    } finally {
      setDownloadingTemplate(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      alert("Please select a file before importing.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      setUploading(true);
      setUploadResult(null);

      const response = await api.post(uploadPath, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Handle successful upload
      setUploadSuccess(true);
      setUploadResult({
        type: 'success',
        message: response.data.message || 'File uploaded successfully!',
        details: response.data.details || null,
        summary: response.data.summary || null,
      });

    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadSuccess(false);
      
      let errorMessage = 'Upload failed. Please try again.';
      let errorDetails = null;

      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
          errorDetails = error.response.data.errors || null;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
          errorDetails = error.response.data.details || null;
        }
      }

      setUploadResult({
        type: 'error',
        message: errorMessage,
        details: errorDetails,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    // Pass true if upload was successful to trigger refresh
    onClose(uploadSuccess);
  };

  const renderUploadResult = () => {
    if (!uploadResult) return null;

    const isSuccess = uploadResult.type === 'success';
    
    return (
      <Alert 
        severity={isSuccess ? 'success' : 'error'}
        icon={isSuccess ? <CheckCircleIcon /> : <ErrorIcon />}
        sx={{ mt: 2, mb: 2 }}
      >
        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
          {uploadResult.message}
        </Typography>
        
        {uploadResult.summary && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" display="block">
              Records processed: {uploadResult.summary.total_processed || 0}
            </Typography>
            <Typography variant="caption" display="block">
              Successfully imported: {uploadResult.summary.successful || 0}
            </Typography>
            {uploadResult.summary.failed > 0 && (
              <Typography variant="caption" display="block" color="error">
                Failed: {uploadResult.summary.failed}
              </Typography>
            )}
          </Box>
        )}

        {uploadResult.details && Array.isArray(uploadResult.details) && uploadResult.details.length > 0 && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="caption" sx={{ fontWeight: 'bold' }}>
              Issues found:
            </Typography>
            {uploadResult.details.slice(0, 3).map((detail, index) => (
              <Typography key={index} variant="caption" display="block" sx={{ ml: 1 }}>
                • {detail.message || detail}
              </Typography>
            ))}
            {uploadResult.details.length > 3 && (
              <Typography variant="caption" display="block" sx={{ ml: 1 }}>
                ... and {uploadResult.details.length - 3} more issues
              </Typography>
            )}
          </Box>
        )}
      </Alert>
    );
  };

  return (
    <Paper sx={{
      p: 4,
      width: "450px",
      borderRadius: "16px",
      bgcolor: "white",
      maxHeight: "80vh",
      overflow: "auto",
    }}>
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        mb: 3
      }}>
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 800 }}>
          IMPORT DATA
        </Typography>
        <Typography sx={{ fontSize: '2rem', color: '#182959', fontWeight: 800 }}>
          {title}
        </Typography>
      </Box>

      <Typography
        variant="body2"
        sx={{
          color: "#2B8C37",
          mb: 3,
          textAlign: "center",
          fontWeight: "bold",
          textDecoration: "underline",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 1,
        }}
        onClick={handleDownloadTemplate}
      >
        {downloadingTemplate ? (
          <>
            <CircularProgress size={16} color="inherit" />
            DOWNLOADING...
          </>
        ) : (
          `DOWNLOAD ${fileType.toUpperCase()} TEMPLATE`
        )}
      </Typography>

      <input
        type="file"
        accept={`.${fileType}`}
        style={{ display: "none" }}
        id="file-input"
        onChange={handleFileChange}
        disabled={uploading}
      />

      <label htmlFor="file-input">
        <Box sx={{
          bgcolor: uploading ? "#f5f5f5" : "#e0e0e0",
          borderRadius: 2,
          p: 3,
          textAlign: "center",
          mb: 3,
          border: "4px dotted #9e9e9e",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: uploading ? "not-allowed" : "pointer",
          opacity: uploading ? 0.6 : 1,
        }}>
          <UploadFileIcon sx={{ mr: 1 }} />
          <Typography variant="body1" color="textSecondary">
            {selectedFile ? selectedFile.name : `Click to Upload .${fileType.toUpperCase()} File`}
          </Typography>
        </Box>
      </label>

      {selectedFile && (
        <Box sx={{
          display: "flex",
          alignItems: "center",
          color: "#1a237e",
          mb: 3,
          fontWeight: "bold",
          justifyContent: "center",
        }}>
          <InsertDriveFileIcon sx={{ mr: 1 }} />
          <Typography variant="body2" noWrap maxWidth="300px">
            {selectedFile.name}
          </Typography>
        </Box>
      )}

      {/* Upload Result */}
      {renderUploadResult()}

      <Box sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 2,
        mt: 2,
      }}>
        {uploadSuccess ? (
          <Button
            variant="contained"
            onClick={handleClose}
            sx={{
              backgroundColor: '#182959',
              borderRadius: '999px',
              padding: '9px 18px',
              fontSize: '1rem',
              fontWeight: 'bold',
              '&:hover': { backgroundColor: '#0f1a3c' },
            }}
          >
            DONE
          </Button>
        ) : (
          <>
            <Button
              variant="outlined"
              onClick={handleClose}
              disabled={uploading}
              sx={{
                borderColor: '#182959',
                color: '#182959',
                borderRadius: '999px',
                padding: '9px 18px',
                fontSize: '1rem',
                fontWeight: 'bold',
                '&:hover': { 
                  borderColor: '#0f1a3c',
                  backgroundColor: 'rgba(24, 41, 89, 0.04)',
                },
              }}
            >
              CANCEL
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={!selectedFile || uploading}
              sx={{
                backgroundColor: '#2B8C37',
                borderRadius: '999px',
                padding: '9px 18px',
                fontSize: '1rem',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                '&:hover': { backgroundColor: '#256d2f' },
                '&:disabled': { backgroundColor: '#ccc' },
              }}
            >
              {uploading ? (
                <>
                  <CircularProgress size={16} color="inherit" />
                  UPLOADING...
                </>
              ) : (
                'IMPORT'
              )}
            </Button>
          </>
        )}
      </Box>
    </Paper>
  );
}

export default ImportFileModal;