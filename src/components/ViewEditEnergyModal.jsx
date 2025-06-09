import React, { useState, useEffect } from 'react';
import {
  Paper,
  Box,
  Typography,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import BusinessIcon from '@mui/icons-material/Business';
import api from '../services/api';

const ViewEditEnergyModal = ({
    title,
  energyId,
  powerplantId,
  companyName, // New prop for displaying company name
  onClose,
  updatePath,
  status,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [record, setRecord] = useState(null);
  const [editedRecord, setEditedRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [powerPlants, setPowerPlants] = useState([]);

  // Fetch power plants for dropdown
  useEffect(() => {
    const fetchPowerPlants = async () => {
      try {
        const response = await api.get('/reference/power_plants');
        setPowerPlants(response.data);
      } catch (error) {
        alert('Failed to load power plants');
      }
    };
    fetchPowerPlants();
  }, []);

  // Fetch energy record data
  useEffect(() => {
    if (!energyId || !powerplantId) return;

    const fetchRecord = async () => {
      setLoading(true);
      try {
        const response = await api.get(
          `/energy/energy_record?energy_id=${encodeURIComponent(
            energyId
          )}&powerplant_id=${encodeURIComponent(powerplantId)}`
        );
        setRecord(response.data);
        setEditedRecord(response.data);
      } catch (error) {
        alert('Failed to load energy record from API.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecord();
  }, [energyId, powerplantId]);

  const isUnchanged = JSON.stringify(record) === JSON.stringify(editedRecord);

  const handleChange = (key, value) => {
    let newValue = value;
    if (key === 'energy_generated') {
      newValue = parseFloat(value);
      if (isNaN(newValue)) newValue = '';
    }
    setEditedRecord((prev) => ({ ...prev, [key]: newValue }));
  };

  const handleSave = async () => {
    try {
      const response = await api.post(`energy${updatePath}`, editedRecord);
      alert(response.data.message);
      setIsEditing(false);
      status(true);
      setRecord(editedRecord);
    } catch (error) {
      const msg = error.response?.data?.detail || error.message;
      alert(`Failed to save: ${msg}`);
    }
  };

  if (loading) {
    return (
      <Paper sx={{ p: 4, width: 600, borderRadius: 2 }}>
        <Typography>Loading...</Typography>
      </Paper>
    );
  }

  if (!record) {
    return (
      <Paper sx={{ p: 4, width: 600, borderRadius: 2 }}>
        <Typography>No data found for this record.</Typography>
      </Paper>
    );
  }

    const normalizedUnit = (() => {
    const val = editedRecord?.unit_of_measurement || '';
    if (['kWh', 'GWh', 'mWh'].includes(val)) return val;
    if (val.toLowerCase() === 'mwh') return 'mWh';
    if (val.toLowerCase() === 'kwh') return 'kWh';
    if (val.toLowerCase() === 'gwh') return 'GWh';
    return '';
    })();


  return (
    <Paper sx={{ p: 4, width: 600, borderRadius: 2 }}>
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

        {companyName && (
        <Box
            display="flex"
            alignItems="center"
            mb={3}
            p={1}
            borderRadius={1}
            bgcolor="grey.100"
            sx={{ maxWidth: 400 }}
        >
            <BusinessIcon color="primary" sx={{ mr: 1 }} />
            <Typography
            variant="body1"
            color="text.secondary"
            fontWeight={500}
            noWrap
            title={companyName}
            >
            {companyName}
            </Typography>
        </Box>
        )}

        <Box
        display="grid"
        gridTemplateColumns="1fr 1fr"
        gap={2}
        >
        {/* Power Plant - full width (span both columns) */}
        <FormControl fullWidth sx={{ gridColumn: '1 / -1' }}>
            <InputLabel>Power Plant</InputLabel>
            <Select
            value={editedRecord.power_plant_id || ''}
            onChange={(e) => handleChange('power_plant_id', e.target.value)}
            disabled={!isEditing}
            label="Power Plant"
            >
            {powerPlants.length > 0 ? (
                powerPlants.map((pp) => (
                <MenuItem key={pp.power_plant_id} value={pp.power_plant_id}>
                    {pp.site_name}
                </MenuItem>
                ))
            ) : (
                <MenuItem value={editedRecord.power_plant_id || ''}>
                {editedRecord.power_plant_id || 'N/A'}
                </MenuItem>
            )}
            </Select>
        </FormControl>

        {/* Date - full width (span both columns) */}
        <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
            label="Date"
            value={editedRecord.datetime ? new Date(editedRecord.datetime) : null}
            onChange={(newDate) => {
                const dateStr = newDate?.toISOString().split('T')[0];
                handleChange('datetime', dateStr);
            }}
            disabled={!isEditing}
            enableAccessibleFieldDOMStructure={false}
            slots={{ textField: TextField }}
            slotProps={{ textField: { fullWidth: true, sx: { gridColumn: '1 / -1' } } }}
            sx={{ gridColumn: '1 / -1' }}
            />
        </LocalizationProvider>

        {/* Energy Generated - half width */}
        <TextField
            label="Energy Generated"
            type="number"
            value={editedRecord.energy_generated !== undefined ? editedRecord.energy_generated : ''}
            onChange={(e) => handleChange('energy_generated', e.target.value)}
            fullWidth
            disabled={!isEditing}
        />

        {/* Unit - half width */}
        <FormControl fullWidth>
        <InputLabel>Unit</InputLabel>
            <Select
            value={normalizedUnit}
            onChange={(e) => handleChange('unit_of_measurement', e.target.value)}
            disabled={!isEditing}
            label="Unit"
            >
            <MenuItem value="kWh">kWh</MenuItem>
            <MenuItem value="GWh">GWh</MenuItem>
            <MenuItem value="mWh">mWh</MenuItem>
            </Select>
        </FormControl>
        </Box>


      <Box display="flex" justifyContent="space-between" mt={4}>
        <Button
          startIcon={isEditing ? <SaveIcon /> : <EditIcon />}
          onClick={() => {
            if (isEditing) {
              if (!isUnchanged) {
                handleSave();
              } else {
                alert('No changes made.');
                setIsEditing(false);
              }
            } else {
              setIsEditing(true);
            }
          }}
        >
          {isEditing ? 'Save' : 'Edit'}
        </Button>

        <Button
          variant="contained"
          color="success"
          onClick={() => {
            if (isEditing && !isUnchanged) {
              const confirmClose = window.confirm(
                'You have unsaved changes. Close anyway?'
              );
              if (!confirmClose) return;
            }
            status(isUnchanged);
            onClose();
          }}
        >
          Close
        </Button>
      </Box>
    </Paper>
  );
};

export default ViewEditEnergyModal;
