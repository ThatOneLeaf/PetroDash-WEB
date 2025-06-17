import { 
  Select, 
  MenuItem,
  Paper, 
  Box, 
  Typography, 
  Button, 
  TextField,
  FormControl,
  InputLabel,
  Modal
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { useState, useEffect } from 'react';
import api from '../../services/api';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import StatusChip from "../../components/StatusChip";
import ClearIcon from '@mui/icons-material/Clear';
import Overlay from '../../components/modal';

const ViewEditRecordModal = ({ source, table, title, record, updatePath, onClose, status }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editedRecord, setEditedRecord] = useState(record || {});
  const [modalType, setModalType] = useState(''); // 'approve' or 'revise'
  const statuses = ["URS","FRS","URH","FRH","APP"];
  const [nextStatus, setNextStatus] = useState("");
  const [remarks, setRemarks] = useState("");
  const recordIdKey = Object.keys(record)[0];
  const permanentlyReadOnlyFields = [Object.keys(record)[0],"company", "status"];
  const withOptionFields = ["source", "unit", "quarter", "year", "month", "property", "type", "metrics"];

  const [sourceOptions, setSourceOptions] = useState([]);
  const [propertyOptions, setPropertyOptions] = useState([]);
  const [propertyTypeOptions, setPropertyTypeOptions] = useState([]);
  const [hazGenMetricsOptions, setHazGenMetricsOptions] = useState([]);
  const [hazDisMetricsOptions, setHazDisMetricsOptions] = useState([]);
  const [nonHazsMetricsOptions, setNonHazMetricsOptions] = useState([]);

  const [electricityUnitOptions, setElectricityUnitOptions] = useState([]);
  const [dieselUnitOptions, setDieselUnitOptions] = useState([]);
  const [waterUnitOptions, setWaterUnitOptions] = useState([]);
  const [hazGenUnitOptions, setHazGenUnitOptions] = useState([]);
  const [hazDisUnitOptions, setHazDisUnitOptions] = useState([]);
  const [nonHazUnitOptions, setNonHazUnitOptions] = useState([]);

  const [showApproveSuccessModal, setShowApproveSuccessModal] = useState(false);

  if (!record) return null;

  // Initialize Data Options
  useEffect(() => {
    if (source === "environment") {
      const fetchSourceOptions = async () => {
        try {
          const response = await api.get('environment/distinct_electric_source');
          setSourceOptions(response.data);
        } catch (error) {
          console.error("Error fetching source options:", error);
        }
      };

      const fetchPropertyOptions = async () => {
        try {
          const response = await api.get(`environment/distinct_cp_names/${editedRecord.company}`);
          setPropertyOptions(response.data);
        } catch (error) {
          console.error("Error fetching property options:", error);
        }
      };

      const fetchPropertyTypeOptions = async () => {
        try {
          const response = await api.get('environment/distinct_cp_type');
          setPropertyTypeOptions(response.data);
        } catch (error) {
          console.error("Error fetching type options:", error);
        }
      };

      const fetchHazGenMetricsOptions = async () => {
        try {
          const response = await api.get('environment/distinct_haz_waste_generated');
          setHazGenMetricsOptions(response.data);
        } catch (error) {
          console.error("Error fetching metrics options:", error);
        }
      };

      const fetchHazDisMetricsOptions = async () => {
        try {
          const response = await api.get('environment/distinct_haz_waste_disposed');
          setHazDisMetricsOptions(response.data);
        } catch (error) {
          console.error("Error fetching metrics options:", error);
        }
      };

      const fetchNonHazMetricsOptions = async () => {
        try {
          const response = await api.get('environment/distinct_non_haz_waste_metrics');
          setNonHazMetricsOptions(response.data);
        } catch (error) {
          console.error("Error fetching metrics options:", error);
        }
      };


      // Units
      const fetchElectricityUnitOptions = async () => {
        try {
          const response = await api.get('environment/distinct_electric_consumption_unit');
          setElectricityUnitOptions(response.data);
        } catch (error) {
          console.error("Error fetching unit options:", error);
        }
      };

      const fetchDieselUnitOptions = async () => {
        try {
          const response = await api.get('environment/distinct_diesel_consumption_unit');
          setDieselUnitOptions(response.data);
        } catch (error) {
          console.error("Error fetching unit options:", error);
        }
      };

      const fetchWaterUnitOptions = async () => {
        try {
          const response = await api.get('environment/distinct_water_unit');
          setWaterUnitOptions(response.data);
        } catch (error) {
          console.error("Error fetching unit options:", error);
        }
      };

      const fetchHazGenUnitOptions = async () => {
        try {
          const response = await api.get('environment/distinct_hazard_waste_gen_unit');
          setHazGenUnitOptions(response.data);
        } catch (error) {
          console.error("Error fetching unit options:", error);
        }
      };

      const fetchHazDisUnitOptions = async () => {
        try {
          const response = await api.get('environment/distinct_hazard_waste_dis_unit');
          setHazDisUnitOptions(response.data);
        } catch (error) {
          console.error("Error fetching unit options:", error);
        }
      };

      const fetchNonHazUnitOptions = async () => {
        try {
          const response = await api.get('environment/distinct_non_haz_waste_unit');
          setNonHazUnitOptions(response.data);
        } catch (error) {
          console.error("Error fetching unit options:", error);
        }
      };

      if (table === 'Electricity') {
        fetchSourceOptions();
        fetchElectricityUnitOptions();
      } else if (table === 'Diesel') {
        fetchDieselUnitOptions();
        fetchPropertyOptions();
        fetchPropertyTypeOptions();
      } else if (table === 'Water'){
        fetchWaterUnitOptions();
      } else {
        fetchHazGenMetricsOptions();
        fetchHazDisMetricsOptions();
        fetchNonHazMetricsOptions();
        fetchHazGenUnitOptions();
        fetchHazDisUnitOptions();
        fetchNonHazUnitOptions();
      }
    }
  }, [source]);

  const handleChange = (key, value) => {
    let newValue = value;

    // Convert to number if key is a numeric field
    if (["consumption", "volume", "waste_generated", "waste_disposed", "waste"].includes(key)) {
      newValue = parseFloat(value);
      // Handle invalid number input (e.g., empty string becomes NaN)
      if (isNaN(newValue)) newValue = '';
    }

    setEditedRecord(prev => ({
        ...prev,
        [key]: newValue
      }));
    };

  const handleSave = async () => {
    console.log("Updated Data:", editedRecord);
    console.log("Field names:", Object.keys(editedRecord));

    try {
      let response;
      if (!source) {
        // For CSR, use PATCH
        response = await api.patch(updatePath, editedRecord);
      } else {
        // For EnvironmentEnergy, use POST
        response = await api.post(`${source}${updatePath}`, editedRecord);
      }
      alert(response.data.message || "Record saved successfully.");
      setIsEditing(false);

    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.message || "Unknown error occurred";
      alert(`Failed to save record: ${errorMessage}`);
    } 
  };

  const fetchNextStatus = (action) => {
    let newStatus = '';
    if (action === 'approve') {
      switch (editedRecord.status){
        case 'For Revision (Site)':
          newStatus = statuses[0]; // "URS"
          break;
        case 'Under review (site)':
        case 'For Revision (Head)':
          newStatus = statuses[2]; // "URH"
          break;
        case 'Under review (head level)':
          newStatus = statuses[4]; // "APP"
          break;
      }
    } else if (action === 'revise') {
      switch (editedRecord.status) {
        case 'Under review (site)':
          newStatus = statuses[1]; // "FRS"
          break;
        case 'Under review (head level)':
          newStatus = statuses[3]; // "FRH"
          break;
      }
    }
    return newStatus;
  }

  //statuses = ["URS","FRS","URH","FRH","APP"]
  
const handleStatusUpdate = async (action) => {
  const newStatus = fetchNextStatus(action);

    if (newStatus) {
      setNextStatus(newStatus);
      console.log("Updated status to:", newStatus); // Changed from nextStatus to newStatus
    } else {
      console.warn("No matching status transition found.");
    }

    try {
      if (action === 'revise') {
        if (!remarks){
          alert('Remarks is required for the status update')
          return;
        }
      } else {
        const confirm = window.confirm('Are you sure you want to approve this record?');
        if (!confirm) return; // Fixed: changed 'confirmed' to 'confirm'
      }
      
      const payload = {
        record_id: record[recordIdKey]?.toString().trim(),
        new_status: newStatus.trim(),
        remarks: remarks.trim(),
      };

      console.log(payload);

      const response = await api.post(
        "/usable_apis/update_status",
        payload
      );

      alert(response.data.message);
      status(false);
    } catch (error) {
      console.error("Error updating record status:", error);
      alert(error?.response?.data?.detail || "Update Status Failed.");
    }
  };

  const handleApproveConfirm = async () => {
    setIsModalOpen(false);
    const newStatus = fetchNextStatus('approve');
    try {
      const payload = {
        record_id: record[recordIdKey]?.toString().trim(),
        new_status: newStatus.trim(),
        remarks: remarks.trim(),
      };
      const response = await api.post(
        "/usable_apis/update_status",
        payload
      );
      setShowApproveSuccessModal(true);
    } catch (error) {
      alert(error?.response?.data?.detail || "Update Status Failed.");
    }
  };
  const handleApproveSuccessClose = () => {
    setShowApproveSuccessModal(false);
    status(false);
  };

  const isRecordUnchanged = JSON.stringify(record) === JSON.stringify(editedRecord);

  // Helper to open modal for approve or revise
  const openModal = (type) => {
    setModalType(type);
    setIsModalOpen(true);
  };

  return (
    <Paper sx={{
        p: 4,
        width: "600px",
        borderRadius: "16px",
        bgcolor: "white",
    }}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <Typography sx={{ 
            fontSize: '0.85rem', 
            fontWeight: 800,
          }}>
            {isEditing ? 'EDIT RECORD' : 'VIEW RECORD'}
          </Typography>
          <ClearIcon
            sx={{ 
              color: 'grey',
              borderRadius: '999px',
              '&:hover': {
                color: '#256d2f',
              },
            }}
            onClick={() => {
              const isUnchanged = JSON.stringify(record) === JSON.stringify(editedRecord);
              if (isEditing && !isUnchanged) {
                const confirmClose = window.confirm("You have unsaved changes. Are you sure you want to close without saving?");
                if (!confirmClose) return; // do nothing if user cancels
              }
              status(isUnchanged)
              onClose();
            }}
          ></ClearIcon>
        </Box>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          mb: 3
        }}>
          
          
          <Typography sx={{ fontSize: '1.75rem', color: '#182959', fontWeight: 800}}>
            {title}
          </Typography>
        </Box>

        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr',
          gap: 1,
          mb: 2
        }}>
          {Object.entries(editedRecord).map(([key, value]) => (
            <Box key={key} sx={{ marginBottom: '0.5rem' }}>
              
              {isEditing && key === "date" ? (
                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <DatePicker
                    label={isEditing && !permanentlyReadOnlyFields.includes(key) ? (
                      <> {key} <span style={{ color: 'red' }}>*</span> </>
                    ) : key}
                    value={value ? new Date(value) : null}
                    onChange={(newValue) => {
                      const formattedDate = newValue ? newValue.toISOString().split('T')[0] : '';
                      handleChange(key, formattedDate);
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        InputProps={{
                          readOnly: !isEditing || permanentlyReadOnlyFields.includes(key),
                          sx: {
                            color: isEditing ? 'black' : '#182959',
                          },
                        }}
                        InputLabelProps={{
                          sx: {
                            color: isEditing ? '#182959' : 'grey',
                          },
                        }}
                      />
                    )}
                  />
                </LocalizationProvider>

              ) :
       
                isEditing && withOptionFields.includes(key) ? (
                  <FormControl fullWidth>
                    <InputLabel>
                      {isEditing && !permanentlyReadOnlyFields.includes(key) ? (
                        <> 
                          <span style={{color: isEditing ? '#182959' : 'grey',}}>{key}</span> 
                          <span style={{ color: 'red' }}>*</span> 
                        </>
                      ) : key}
                    </InputLabel>
                    <Select
                      label={isEditing && !permanentlyReadOnlyFields.includes(key) ? (
                        <> 
                          <span style={{color: isEditing ? '#182959' : 'grey',}}>{key}</span> 
                          <span style={{ color: 'red' }}>*</span> 
                        </>
                      ) : key}
                      value={value ?? ''}
                      onChange={(e) => handleChange(key, e.target.value)}
                      fullWidth
                    >
                      {key === "source" && (
                        sourceOptions.map((option) => (
                          <MenuItem key={option.source} value={option.source}>
                            {option.source}
                          </MenuItem>
                        ))
                      )}
                      {key === "property" && (
                        propertyOptions.map((option) => (
                          <MenuItem key={option.cp_name} value={option.cp_name}>
                            {option.cp_name}
                          </MenuItem>
                        ))
                      )}
                      {key === "type" && (
                        propertyTypeOptions.map((option) => (
                          <MenuItem key={option.cp_type} value={option.cp_type}>
                            {option.cp_type}
                          </MenuItem>
                        ))
                      )}

                      {key === "metrics" && (
                        table === 'Hazard Generated' ? 
                        hazGenMetricsOptions.map((option) => (
                          <MenuItem key={option.metrics} value={option.metrics}>
                            {option.metrics}
                          </MenuItem>
                        )) :
                        table === 'Hazard Disposed' ? 
                        hazDisMetricsOptions.map((option) => (
                          <MenuItem key={option.metrics} value={option.metrics}>
                            {option.metrics}
                          </MenuItem>
                        )) :
                        table === 'Non-Hazard Generated' ? 
                        nonHazsMetricsOptions.map((option) => (
                          <MenuItem key={option.metrics} value={option.metrics}>
                            {option.metrics}
                          </MenuItem>
                        )) :
                        <MenuItem value="N/A">N/A</MenuItem>
                      )}

                      {key === "unit" && (
                        table === 'Diesel' ?
                        dieselUnitOptions.map((option) => (
                          <MenuItem key={option.unit} value={option.unit}>
                            {option.unit}
                          </MenuItem>
                        )) :
                        table === 'Electricity' ?
                        electricityUnitOptions.map((option) => (
                          <MenuItem key={option.unit} value={option.unit}>
                            {option.unit}
                          </MenuItem>
                        )) :
                        table === 'Water' ?
                        waterUnitOptions.map((option) => (
                          <MenuItem key={option.unit} value={option.unit}>
                            {option.unit}
                          </MenuItem>
                        )) :
                        table === 'Hazard Generated' ?
                        hazGenUnitOptions.map((option) => (
                          <MenuItem key={option.unit} value={option.unit}>
                            {option.unit}
                          </MenuItem>
                        )) :
                        table === 'Hazard Disposed' ?
                        hazDisUnitOptions.map((option) => (
                          <MenuItem key={option.unit} value={option.unit}>
                            {option.unit}
                          </MenuItem>
                        )) :
                        table === 'Non-Hazard Generated' ?
                        nonHazUnitOptions.map((option) => (
                          <MenuItem key={option.unit} value={option.unit}>
                            {option.unit}
                          </MenuItem>
                        )) :
                        <MenuItem value="N/A">N/A</MenuItem>
                      )}
                      {key === "month" && (
                        ['January', 'February', 'March', 'April', 'May', 'June',
                          'July', 'August', 'September', 'October', 'November', 'December'
                        ].map((month) => (
                          <MenuItem key={month} value={month}>
                            {month}
                          </MenuItem>
                        ))
                      )}
                      {key === "quarter" && (
                        ["Q1", "Q2", "Q3", "Q4", "N/A"].map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))
                      )}
                      {key === "year" && (
                        Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))
                      )}
                    </Select>
                  </FormControl>
              ) : 
                key === 'status' ? (
                  <Box
                    sx={{
                      p: 0.5
                    }}>
                    <Typography sx={{ 
                      fontSize: '0.85rem', 
                      color: 'grey'
                    }}>
                      Status:
                    </Typography>
                    <StatusChip status={value} />              
                  </Box>       
              ) :         
                <TextField
                  label={isEditing && !permanentlyReadOnlyFields.includes(key) ? (
                    <> {key} <span style={{ color: 'red' }}>*</span> </>
                  ) : key}
                  variant="outlined"
                  fullWidth
                  value={value ?? ''}
                  onChange={(e) => handleChange(key, e.target.value)}
                  InputProps={{
                    readOnly: !isEditing || permanentlyReadOnlyFields.includes(key),
                    sx: {
                      color: isEditing ? 'black' : '#182959',
                    },
                  }}
                  InputLabelProps={{
                    sx: {
                      color: isEditing ? '#182959' : 'grey',
                    },
                  }}
                />
              }
            </Box>
          ))}
        </Box>

        {editedRecord.status !== 'Approved' && (
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            mt: 3
          }}>
            <Button
              startIcon={isEditing ? <SaveIcon /> : <EditIcon />}
              sx={{ 
                color: isEditing ? '#1976d2' : '#FFA000',
                borderRadius: '999px',
                padding: '9px 18px',
                fontSize: '1rem',
                fontWeight: 'bold',
                '&:hover': {
                  color: isEditing ? '#1565c0' : '#FB8C00',
                },
              }}
              onClick={() => {
                if (isEditing) {
                  if (!isRecordUnchanged) {
                    handleSave(); // only save if changed
                  } else {
                    alert('No changes were made')
                    setIsEditing(false);
                  }
                } else {
                  setIsEditing(true);
                }
              }}
            >
              {isEditing ? 'SAVE' : 'EDIT'}
            </Button>
            <Box>
              <Button 
                variant='contained'
                sx={{ 
                  backgroundColor: '#2B8C37',
                  borderRadius: '999px',
                  padding: '9px 18px',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  '&:hover': {
                    backgroundColor: '#256d2f',
                  },
                }}
                onClick={() => { setModalType('approve'); setIsModalOpen(true); }}
              >
                Approve
              </Button>
              {(editedRecord.status !== 'For Revisions (Site)' || editedRecord.status !== 'For Revisions (Head)') && (
                <Button 
                  variant='contained'
                  sx={{ 
                    marginLeft: 1,
                    backgroundColor: '#182959',
                    borderRadius: '999px',
                    padding: '9px 18px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    '&:hover': {
                      backgroundColor: '#0f1a3c',
                    },
                  }}
                  onClick={() => openModal('revise')}
                >
                  Revise
                </Button>
              )}    
            </Box>
          </Box>
        )}
        {isModalOpen && modalType === 'revise' && (
          <Overlay onClose={() => setIsModalOpen(false)}>
            <Paper
              sx={{
                p: 4,
                width: "500px",
                borderRadius: "16px",
                bgcolor: "white",
              }}
            >
              <Typography sx={{ fontSize: '2rem', color: '#182959', fontWeight: 800}}>
                Revision Request
              </Typography>
              <TextField
                sx={{
                  mt: 2,
                  mb: 2
                }}
                label={<> Remarks <span style={{ color: 'red' }}>*</span> </>}
                variant="outlined"
                fullWidth
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                multiline
              />
              <Box sx={{
                display: 'flex',
                justifyContent: 'flex-end'
              }}>
                <Button 
                  sx={{ 
                    color: '#182959',
                    borderRadius: '999px',
                    padding: '9px 18px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    '&:hover': {
                      color: '#0f1a3c',
                    },
                  }}
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant='contained'
                  sx={{ 
                    marginLeft: 1,
                    backgroundColor: '#2B8C37',
                    borderRadius: '999px',
                    padding: '9px 18px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    '&:hover': {
                      backgroundColor: '#256d2f',
                    },
                  }}
                  onClick={() => { setIsModalOpen(false); handleStatusUpdate("revise"); }}
                >
                  Confirm
                </Button>
              </Box>
            </Paper>
          </Overlay>          
        )}  
        {isModalOpen && modalType === 'approve' && (
          <Overlay onClose={() => setIsModalOpen(false)}>
            <Paper
              sx={{
                p: 4,
                width: "500px",
                borderRadius: "16px",
                bgcolor: "white",
              }}
            >
              <Typography sx={{ fontSize: '2rem', color: '#182959', fontWeight: 800}}>
                Approval Confirmation
              </Typography>
              <Box sx={{
                bgcolor: '#f5f5f5',
                p: 2,
                borderRadius: '8px',
                width: '100%',
                mb: 3
              }}>
                {Object.entries(record).map(([key, value]) => (
                  <Typography key={key} sx={{ fontSize: '0.9rem', mb: 1 }}>
                    <strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {String(value)}
                  </Typography>
                ))}
              </Box>
              <Box sx={{
                display: 'flex',
                justifyContent: 'flex-end'
              }}>
                <Button 
                  sx={{ 
                    color: '#182959',
                    borderRadius: '999px',
                    padding: '9px 18px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    '&:hover': {
                      color: '#0f1a3c',
                    },
                  }}
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  variant='contained'
                  sx={{ 
                    marginLeft: 1,
                    backgroundColor: '#2B8C37',
                    borderRadius: '999px',
                    padding: '9px 18px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    '&:hover': {
                      backgroundColor: '#256d2f',
                    },
                  }}
                  onClick={handleApproveConfirm}
                >
                  Confirm
                </Button>
              </Box>
            </Paper>
          </Overlay>
        )}      
        {showApproveSuccessModal && (
          <Overlay onClose={handleApproveSuccessClose}>
            <Paper sx={{
              p: 4,
              width: '400px',
              borderRadius: '16px',
              bgcolor: 'white',
              outline: 'none',
              textAlign: 'center'
            }}>
              <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                mb: 3
              }}>
                <Box sx={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  backgroundColor: '#2B8C37',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 2
                }}>
                  <Typography sx={{ 
                    color: 'white', 
                    fontSize: '2rem',
                    fontWeight: 'bold'
                  }}>
                    ✓
                  </Typography>
                </Box>
                <Typography sx={{ 
                  fontSize: '1.5rem', 
                  fontWeight: 800,
                  color: '#182959',
                  mb: 2
                }}>
                  Record Approved Successfully!
                </Typography>
                <Typography sx={{ 
                  fontSize: '1rem',
                  color: '#666',
                  mb: 3
                }}>
                  The record has been successfully approved.
                </Typography>
              </Box>
              <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                mt: 3
              }}>
                <Button
                  variant="contained"
                  sx={{ 
                    backgroundColor: '#2B8C37',
                    borderRadius: '999px',
                    padding: '10px 24px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    '&:hover': {
                      backgroundColor: '#256d2f',
                    },
                  }}
                  onClick={handleApproveSuccessClose}
                >
                  OK
                </Button>
              </Box>
            </Paper>
          </Overlay>
        )}
    </Paper>
  );
};

export default ViewEditRecordModal;
