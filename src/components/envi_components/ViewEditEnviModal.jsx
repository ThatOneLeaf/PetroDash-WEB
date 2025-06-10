import { 
  Select, 
  MenuItem,
  Paper, 
  Box, 
  Typography, 
  Button, 
  TextField,
  FormControl,
  InputLabel
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { useState, useEffect } from 'react';
import api from '../../services/api';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import StatusChip from "../../components/StatusChip";

const ViewEditRecordModal = ({ source, table, title, record, updatePath, onClose, status }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedRecord, setEditedRecord] = useState(record || {});
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
          const response = await api.get('environment/distinct_cp_names');
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
    if (["consumption", "volume"].includes(key)) {
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

  const isRecordUnchanged = JSON.stringify(record) === JSON.stringify(editedRecord);

  return (
    <Paper sx={{
        p: 4,
        width: "600px",
        borderRadius: "16px",
        bgcolor: "white",
    }}>
        <Box sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          mb: 3}}>
          <Typography sx={{ 
            fontSize: '0.85rem', 
            fontWeight: 800,
          }}>
            {isEditing ? 'EDIT RECORD' : 'VIEW RECORD'}
          </Typography>
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
                      p: 1
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

          <Button
            variant="contained"
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
            onClick={() => {
              const isUnchanged = JSON.stringify(record) === JSON.stringify(editedRecord);
              if (isEditing && !isUnchanged) {
                const confirmClose = window.confirm("You have unsaved changes. Are you sure you want to close without saving?");
                if (!confirmClose) return; // do nothing if user cancels
              }
              status(isUnchanged)
              onClose();
            }}
          >
            CLOSE
          </Button>
        </Box>
    </Paper>
  );
};

export default ViewEditRecordModal;
