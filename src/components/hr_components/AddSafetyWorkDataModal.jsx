import { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  Autocomplete,
  Box,
} from "@mui/material";

import Overlay from "../../components/modal";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import api from "../../services/api";

import { useAuth } from "../../contexts/AuthContext";

import isSameOrAfter from "dayjs/plugin/isSameOrAfter";

import SuccessModal from "../../components/hr_components/SuccessModal";
import ErrorModal from "../../components/hr_components/ErrorModal";
import ConfirmModal from "./ConfirmModal";

dayjs.extend(isSameOrAfter);

function AddSafetyWorkDataModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    companyId: "", // get current  company of emp
    contractor: "",
    date: null,
    safetyManpower: "",
    safetyManhours: "",
  });

  const { getUserCompanyId } = useAuth();
  const userCompany = getUserCompanyId();

  const summaryData = [
    { label: "Company ID", value: String(userCompany || "N/A") },
    { label: "Contractor", value: String(formData.contractor || "N/A") },
    {
      label: "Date",
      value: formData.date ? dayjs(formData.date).format("MM/DD/YYYY") : "N/A",
    },
    {
      label: "Safety Manpower",
      value: String(formData.safetyManpower || "N/A"),
    },
    {
      label: "Safety Manhours",
      value: String(formData.safetyManhours || "N/A"),
    },
  ];

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setLoading(false);
  }, []);

  // DATA -- CHANGE PER PAGE
  const fetchSafetyWorkData = async () => {
    try {
      setLoading(true);
      const response = await api.get("hr/safety_workdata_records_by_status");
      console.log("Safety Work Data from API:", response.data);
      setData(response.data);
    } catch (error) {
      console.error("Error fetching Safety data:", error);
      setError("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSafetyWorkData();
  }, []);

  const uniqueOptions = (key) => {
    return Array.from(new Set(data.map((item) => item[key]))).map((val) => ({
      label: val,
      value: val,
    }));
  };

  const handleChange = (field) => (event) => {
    const newFormData = {
      ...formData,
      [field]: event.target.value,
    };
    setFormData(newFormData);
  };

  const handleDateChange = (field) => (newValue) => {
    const isoDate = newValue ? dayjs(newValue).format("YYYY-MM-DD") : null;

    setFormData((prev) => ({
      ...prev,
      [field]: isoDate,
    }));
  };

  const handleSubmit = async () => {
    console.log(formData);

    /* VALIDATIONS */

    const MIN_DATE = dayjs("1994-09-28");

    const { contractor, date, safetyManpower, safetyManhours } = formData;

    const isValidContractor = contractor.trim() !== "";

    const isValidDate = date && dayjs(date).isSameOrAfter(MIN_DATE);

    const isValidManpower =
      safetyManpower !== "" &&
      !isNaN(safetyManpower) &&
      Number(safetyManpower) > 0;

    const isValidManhours =
      safetyManhours !== "" &&
      !isNaN(safetyManhours) &&
      Number(safetyManhours) > 0;

    if (!isValidContractor) {
      setErrorMessage("Contractor is required.");
      setIsConfirmModalOpen(false);
      setIsErrorModalOpen(true);

      return;
    }

    if (!isValidDate) {
      setErrorMessage("Please select a valid Date.");
      setIsConfirmModalOpen(false);
      setIsErrorModalOpen(true);
      return;
    }

    if (!isValidManpower) {
      setErrorMessage("Safety Manpower must be a number greater than 0.");
      setIsConfirmModalOpen(false);
      setIsErrorModalOpen(true);
      return;
    }

    if (!isValidManhours) {
      setErrorMessage("Safety Manhours must be a number greater than 0.");
      setIsConfirmModalOpen(false);
      setIsErrorModalOpen(true);
      return;
    }

    try {
      setLoading(true);

      await api.post("/hr/single_upload_safety_workdata_record", {
        company_id: userCompany,
        contractor: formData.contractor,
        date: formData.date ? dayjs(formData.date).format("YYYY-MM-DD") : null,
        manpower: formData.safetyManpower,
        manhours: formData.safetyManhours,
      });

      setIsConfirmModalOpen(false);
      setIsSuccessModalOpen(true);
      if (onSuccess) onSuccess();

      setFormData({
        companyId: "", // get current  company of emp
        contractor: "",
        date: null,
        safetyManpower: "",
        safetyManhours: "",
      });
    } catch (err) {
      console.error("Error submitting form:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Paper
      sx={{
        p: 4,
        width: "500px",
        borderRadius: "16px",
        bgcolor: "white",
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          mb: 3,
        }}
      >
        <Typography
          sx={{
            fontSize: "1rem",
            fontWeight: 800,
          }}
        >
          ADD NEW RECORD
        </Typography>
        <Typography
          sx={{ fontSize: "2.2rem", color: "#182959", fontWeight: 800 }}
        >
          HR - Safety Work Data
        </Typography>
      </Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 2,
          mb: 3,
        }}
      >
        {/* 

        
        <Select
          value={formData.year}
          onChange={handleChange('year')}
          sx={{ height: '40px' }}
        >
          {[...Array(10)].map((_, i) => (
            <MenuItem key={currentYear - i} value={currentYear - i}>
              {currentYear - i}
            </MenuItem>
          ))}
        </Select>*/}

        <Autocomplete
          freeSolo
          options={uniqueOptions("contractor")}
          value={formData.contractor}
          onInputChange={(event, newInputValue) => {
            setFormData((prev) => ({
              ...prev,
              contractor: newInputValue,
            }));
          }}
          renderInput={(params) => (
            <TextField {...params} label="Contractor" fullWidth />
          )}
        />

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Date"
            value={formData.date ? dayjs(formData.date) : null}
            onChange={handleDateChange("date")}
            minDate={dayjs("1994-09-29")}
            slotProps={{
              textField: { fullWidth: true, size: "medium" },
            }}
          />
        </LocalizationProvider>

        <TextField
          label="Safety Manpower"
          value={formData.safetyManpower}
          onChange={handleChange("safetyManpower")}
          type="number"
          inputProps={{ min: 1 }}
        />

        <TextField
          label="Safety Manhours"
          value={formData.safetyManhours}
          onChange={handleChange("safetyManhours")}
          type="number"
          inputProps={{ min: 1 }}
        />
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          mt: 3,
        }}
      >
        <Button
          variant="contained"
          sx={{
            backgroundColor: "#2B8C37",
            borderRadius: "999px",
            padding: "9px 18px",
            fontSize: "1rem",
            fontWeight: "bold",
            "&:hover": {
              backgroundColor: "#256d2f",
            },
          }}
          onClick={() => setIsConfirmModalOpen(true)}
        >
          ADD RECORD
        </Button>

        {isConfirmModalOpen && (
          <Overlay onClose={() => setIsConfirmModalOpen(false)}>
            <ConfirmModal
              open={isConfirmModalOpen}
              title={"Confirm Record Addition"}
              message={
                "Are you sure you want to add this safety work data record?"
              }
              onConfirm={handleSubmit}
              onCancel={() => setIsConfirmModalOpen(false)}
              summaryData={summaryData}
            />
          </Overlay>
        )}

        {isErrorModalOpen && (
          <Overlay onClose={() => setIsErrorModalOpen(false)}>
            <ErrorModal
              open={isErrorModalOpen}
              errorMessage={errorMessage}
              onClose={() => setIsErrorModalOpen(false)}
            />
          </Overlay>
        )}

        {isSuccessModalOpen && (
          <Overlay onClose={() => setIsSuccessModalOpen(false)}>
            <SuccessModal
              open={isSuccessModalOpen}
              successMessage={
                "Your safety work data record has been successfully added to the repository."
              }
              onClose={() => {
                setIsSuccessModalOpen(false);
                onClose();
              }}
            />
          </Overlay>
        )}
      </Box>
    </Paper>
  );
}

export default AddSafetyWorkDataModal;
