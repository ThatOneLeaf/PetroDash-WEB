import { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import api from "../services/api";
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';

function ImportPowerModal({
  onClose,
  title = "Import Power Data",
  downloadPath = "/api/power/template",
  uploadPath = "/api/power/import",
  fileType = "xlsx",
  companyId,
  powerPlantId
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [downloadingTemplate, setDownloadingTemplate] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [powerPlants, setPowerPlants] = useState([]);
  const [loadingPlants, setLoadingPlants] = useState(false);
  const [selectedPowerPlant, setSelectedPowerPlant] = useState(powerPlantId || "");
  const [selectedMetric, setSelectedMetric] = useState("kWh");
  const [previewData, setPreviewData] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingImport, setPendingImport] = useState(false);

  useEffect(() => {
    async function fetchPowerPlants() {
      if (!companyId) return;
      setLoadingPlants(true);
      try {
        const response = await api.get(`/reference/power_plants`, {
          params: { p_company_id: companyId },
        });
        setPowerPlants(response.data || []);
        if (response.data && response.data.length > 0) {
          setSelectedPowerPlant(
            powerPlantId && response.data.some(p => p.id === powerPlantId)
              ? powerPlantId
              : response.data[0].id
          );
        }
      } catch (err) {
        setPowerPlants([]);
      } finally {
        setLoadingPlants(false);
      }
    }
    fetchPowerPlants();
  }, [companyId, powerPlantId]);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setUploadResult(null);
    setUploadSuccess(false);
    setPreviewData(null);
    setPreviewError(null);
    if (file) {
      setPreviewLoading(true);
      try {
        const formData = new FormData();
        formData.append("file", file);
        const response = await api.post("/energy/read_template", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        console.log("Preview API response:", response.data);
        if (
          response.data &&
          Array.isArray(response.data.rows) &&
          Array.isArray(response.data.columns)
        ) {
          if (response.data.rows.length === 0) {
            setPreviewError("No data found in the file. Please check your template and try again.");
            setPreviewData(null);
          } else {
            setPreviewData({ columns: response.data.columns, rows: response.data.rows });
          }
        } else {
          setPreviewError("No preview data found in the file. Please check your template.");
          setPreviewData(null);
        }
      } catch (err) {
        setPreviewError("Failed to preview file. Please check the template format.");
        setPreviewData(null);
      } finally {
        setPreviewLoading(false);
      }
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      setDownloadingTemplate(true);
      const response = await api.get(downloadPath, {
        params: {
          include_examples: true,
          company_id: companyId,
          powerplant_id: selectedPowerPlant,
          metric: selectedMetric
        },
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

  const handleMetricChange = (event) => {
    setSelectedMetric(event.target.value);
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      alert("Please select a file before importing.");
      return;
    }
    if (!selectedPowerPlant) {
      alert("Please select a power plant.");
      return;
    }
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("company_id", companyId);
    formData.append("powerplant_id", selectedPowerPlant);
    formData.append("metric", selectedMetric); // Add metric to form data

    try {
      setUploading(true);
      setUploadResult(null);

      const response = await api.post(uploadPath, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

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

  // Table preview rendering
  const renderPreviewTable = () => {
    if (previewLoading) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', my: 2 }}>
          <CircularProgress size={20} />
          <Typography sx={{ ml: 2 }}>Loading preview...</Typography>
        </Box>
      );
    }
    if (previewError) {
      return (
        <Box sx={{ my: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Alert severity="error" sx={{ mb: 2 }}>{previewError}</Alert>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => {
              setSelectedFile(null);
              setPreviewError(null);
              setPreviewData(null);
              document.getElementById('file-input').value = '';
            }}
          >
            Try Again
          </Button>
        </Box>
      );
    }
    if (!previewData || !Array.isArray(previewData.rows) || !Array.isArray(previewData.columns) || previewData.rows.length === 0) {
      return (
        <Box sx={{ my: 2, p: 2, bgcolor: '#f8d7da', borderRadius: 1, border: '1px solid #f5c6cb', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <ErrorIcon sx={{ fontSize: 40, color: '#721c24', mb: 1 }} />
          <Typography variant="body2" color="#721c24" textAlign="center" sx={{ mb: 1 }}>
            No data available for preview.
          </Typography>
          <Typography variant="caption" color="#721c24" textAlign="center">
            Please ensure the uploaded file contains data and try again.
          </Typography>
        </Box>
      );
    }
    const rows = previewData.rows;
    const columns = previewData.columns;
    return (
      <Box sx={{ my: 2 }}>
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>File Preview</Typography>
        <TableContainer component={Paper} sx={{ maxHeight: 6 * 42 + 56, minHeight: 0, overflowY: 'auto' }}>
          <Table size="small" stickyHeader>
            <TableHead>
              <TableRow>
                {columns.map((col) => (
                  <TableCell key={col} sx={{ fontWeight: 'bold', background: '#f5f5f5' }}>{col}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, idx) => (
                <TableRow key={idx}>
                  {columns.map((col) => (
                    <TableCell key={col}>{row[col]}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  };

  const handleImportClick = () => {
    setConfirmOpen(true);
  };

  const handleConfirmClose = () => {
    setConfirmOpen(false);
  };

  const handleConfirmImport = async () => {
    setConfirmOpen(false);
    setPendingImport(true);
    await handleSubmit();
    setPendingImport(false);
  };

  return (
    <Paper sx={{
      p: 4,
      width: previewData && previewData.rows && previewData.rows.length > 0 ? "1100px" : "600px", // Expand only if preview
      borderRadius: "16px",
      bgcolor: "white",
      maxHeight: "95vh",
      overflow: "auto",
      transition: 'width 0.3s',
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
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        {/* Left: Form Section */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {/* Power Plant Dropdown */}
          {powerPlantId ? (
            <FormControl fullWidth sx={{ mb: 3 }} disabled>
              <InputLabel id="powerplant-label">Power Plant</InputLabel>
              <Select
                labelId="powerplant-label"
                id="powerplant-select"
                value={selectedPowerPlant}
                label="Power Plant"
                disabled
              >
                {powerPlants
                  .filter((plant) => plant.id === powerPlantId)
                  .map((plant) => (
                    <MenuItem key={plant.id} value={plant.id}>
                      {plant.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          ) : (
            <FormControl fullWidth sx={{ mb: 3 }} disabled={loadingPlants}>
              <InputLabel id="powerplant-label">Power Plant</InputLabel>
              <Select
                labelId="powerplant-label"
                id="powerplant-select"
                value={selectedPowerPlant}
                label="Power Plant"
                onChange={e => setSelectedPowerPlant(e.target.value)}
              >
                {powerPlants.map((plant) => (
                  <MenuItem key={plant.id} value={plant.id}>
                    {plant.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          {/* Metric Dropdown */}
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="metric-label">Metric</InputLabel>
            <Select
              labelId="metric-label"
              id="metric-select"
              value={selectedMetric}
              label="Metric"
              onChange={handleMetricChange}
            >
              <MenuItem value="kWh">kWh</MenuItem>
              <MenuItem value="MWh">MWh</MenuItem>
              <MenuItem value="GWh">GWh</MenuItem>
            </Select>
          </FormControl>
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
          {renderUploadResult()}
        </Box>
        {/* Right: Preview Section (only show if preview or error) */}
        {(previewLoading || previewError || (previewData && previewData.rows && previewData.rows.length > 0)) && (
          <Box sx={{ flex: 1, minWidth: 0, maxWidth: 500, maxHeight: 600, overflow: 'auto', borderLeft: '1px solid #eee', pl: 3 }}>
            {renderPreviewTable()}
          </Box>
        )}
      </Box>
      {/* Centered Buttons at the bottom of the modal */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 2,
        mt: 4,
        mb: 2,
        width: '100%',
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
              disabled={uploading || pendingImport}
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
              onClick={handleImportClick}
              disabled={!selectedFile || uploading || pendingImport || !!previewError}
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
              {(uploading || pendingImport) ? (
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
      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={handleConfirmClose} maxWidth="xs" fullWidth>
        <DialogTitle>Confirm Import</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to import this file? This action will upload and process the selected file.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 2 }}>
          <Button onClick={handleConfirmClose} color="primary" disabled={pendingImport}>Cancel</Button>
          <Button onClick={handleConfirmImport} color="primary" variant="contained" disabled={pendingImport} autoFocus>
            Yes, Import
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

export default ImportPowerModal;
