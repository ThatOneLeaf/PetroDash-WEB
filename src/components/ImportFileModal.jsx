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

function ImportFileModal({
  onClose,
  title,
  downloadPath,
  uploadPath,
  fileType = "xlsx"
}) {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleDownloadTemplate = async () => {
    try {
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
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      alert("Please select a file before importing.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);  // 

    try {
      const response = await api.post(uploadPath, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      alert(response.data.message);
      onClose();
    } catch (error) {
      console.error("Error uploading file:", error);
      alert(error?.response?.data?.detail || "Upload failed.");
    }
  };


  return (
    <Paper sx={{
      p: 4,
      width: "450px",
      borderRadius: "16px",
      bgcolor: "white",
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
        }}
        onClick={handleDownloadTemplate}
      >
        DOWNLOAD {fileType.toUpperCase()} TEMPLATE
      </Typography>

      <input
        type="file"
        accept={`.${fileType}`}
        style={{ display: "none" }}
        id="file-input"
        onChange={handleFileChange}
      />

      <label htmlFor="file-input">
        <Box sx={{
          bgcolor: "#e0e0e0",
          borderRadius: 2,
          p: 3,
          textAlign: "center",
          mb: 3,
          border: "4px dotted #9e9e9e",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
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

      <Box sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        mt: 2,
      }}>
        <Button
          variant="contained"
          onClick={handleSubmit}
          sx={{
            backgroundColor: '#2B8C37',
            borderRadius: '999px',
            padding: '9px 18px',
            fontSize: '1rem',
            fontWeight: 'bold',
            '&:hover': { backgroundColor: '#256d2f' },
          }}
        >
          IMPORT
        </Button>
      </Box>
    </Paper>
  );
}

export default ImportFileModal;
