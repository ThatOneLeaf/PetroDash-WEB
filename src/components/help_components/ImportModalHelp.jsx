import React, { useRef, useState } from 'react';
import {
  Typography,
  Button,
  Box,
  CircularProgress
} from '@mui/material';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import FormModal from '../FormModal';
import api from '../../services/api';

function ImportModalHelp({ open, onClose, onImportSuccess }) {
  const fileInputRef = useRef();
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
    setError(null);
    setSuccess(null);
  };

  const handleDownloadTemplate = async () => {
  try {
      const response = await api.get('/help/help-activity-template', {
        responseType: 'blob', // Important for file downloads
      });
      
      // Create blob link to download the file
      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'help_activity_template.xlsx';
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
    if (!selectedFile) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      await api.post('/help/activities/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess('Import successful!');
      if (onImportSuccess) await onImportSuccess();
    } catch (err) {
      setError('Import failed. Please check your file.');
    } finally {
      setLoading(false);
    }
  };

  

  // Reset file input and messages when modal closes
  React.useEffect(() => {
    if (!open) {
      setSelectedFile(null);
      setError(null);
      setSuccess(null);
    }
  }, [open]);

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title="Import Data"
      subtitle="Social - H.E.L.P"
      width="450px"
      actions={
        <Button
          variant="contained"
          onClick={handleSubmit}
          sx={{
            bgcolor: "#2B8C37",
            "&:hover": { bgcolor: "#1b5e20" },
            fontWeight: "bold",
            borderRadius: "999px",
            color: "#fff",
            px: 4,
            boxShadow: 2,
            minWidth: "unset",
            width: "fit-content",
            fontSize: "1.15rem"
          }}
        >
          IMPORT
        </Button>
      }
      hideCancel={true}
    >
      <Typography
        variant="body2"
        sx={{
          color: "#256d2f",
          mb: 1,
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
        accept=".xlsx,.xls,.csv"
        style={{ display: "none" }}
        id="csr-file-input"
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      <label htmlFor="csr-file-input">
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
            mb: 2,
          }}
        >
          <UploadFileIcon sx={{ mr: 1 }} />
          <Typography variant="body1" color="textSecondary">
            {selectedFile ? selectedFile.name : "Click to Upload Excel/CSV File"}
          </Typography>
        </Box>
      </label>

      {selectedFile && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            color: "#182959",
            fontWeight: "bold",
            justifyContent: "center",
            mb: 1,
          }}
        >
          <InsertDriveFileIcon sx={{ mr: 1 }} />
          <Typography variant="body2" noWrap maxWidth="300px">
            {selectedFile.name}
          </Typography>
        </Box>
      )}

      {loading && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center', mb: 1 }}>
          <CircularProgress size={20} />
          <Typography>Importing...</Typography>
        </Box>
      )}
      {error && <Typography color="error" sx={{ textAlign: "center" }}>{error}</Typography>}
      {success && <Typography color="success.main" sx={{ textAlign: "center" }}>{success}</Typography>}
    </FormModal>
  );
}

export default ImportModalHelp;

// Add handleSubmit to match the new button handler
function handleSubmit() {
  handleImportClick();
}
