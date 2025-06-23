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

import { useAuth } from "../../contexts/AuthContext";

import isSameOrAfter from "dayjs/plugin/isSameOrAfter";

dayjs.extend(isSameOrAfter);

import api from "../../services/api";

import SuccessModal from "../../components/hr_components/SuccessModal";
import ErrorModal from "../../components/hr_components/ErrorModal";
import ConfirmModal from "./ConfirmModal";

function AddTrainingModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    companyId: "", // get current  company of emp
    trainingName: "",
    date: null,
    trainingHours: "",
    numberOfParticipants: "",
  });

  const { getUserCompanyId } = useAuth();
  const userCompany = getUserCompanyId();

  const summaryData = [
    { label: "Company ID", value: String(userCompany || "N/A") },
    { label: "Training Name", value: String(formData.trainingName || "N/A") },
    {
      label: "Date",
      value: formData.date ? dayjs(formData.date).format("MM/DD/YYYY") : "N/A",
    },
    {
      label: "Training Hours",
      value: String(formData.trainingHours || "N/A"),
    },
    {
      label: "Number of Participants",
      value: String(formData.numberOfParticipants || "N/A"),
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

  const fetchTrainingData = async () => {
    try {
      setLoading(true);
      const response = await api.get("hr/training_records_by_status");
      console.log("Training Data from API:", response.data);
      setData(response.data);
    } catch (error) {
      console.error("Error fetching Training data:", error);
      setError("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainingData();
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
    setFormData((prev) => ({
      ...prev,
      [field]: newValue,
    }));
  };

  const handleSubmit = async () => {
    console.log(formData);

    /* VALIDATIONS */
    const MIN_DATE = dayjs("1994-09-28");

    const { trainingName, date, trainingHours, numberOfParticipants } =
      formData;

    const isValidTrainingName = trainingName.trim() !== "";

    const isValidDate = date && dayjs(date).isSameOrAfter(MIN_DATE);

    const isValidTrainingHours =
      trainingHours !== "" &&
      !isNaN(trainingHours) &&
      Number(trainingHours) > 0;

    const isValidParticipants =
      numberOfParticipants !== "" &&
      !isNaN(numberOfParticipants) &&
      Number(numberOfParticipants) > 0;

    if (!isValidTrainingName) {
      setErrorMessage("Training Name is required.");
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

    if (!isValidTrainingHours) {
      setErrorMessage("Training Hours must be a number greater than 0.");
      setIsConfirmModalOpen(false);
      setIsErrorModalOpen(true);
      return;
    }

    if (!isValidParticipants) {
      setErrorMessage(
        "Number of Participants must be a number greater than 0."
      );
      setIsConfirmModalOpen(false);
      setIsErrorModalOpen(true);
      return;
    }

    try {
      setLoading(true);

      await api.post("/hr/single_upload_training_record", {
        company_id: userCompany,
        date: formData.date ? dayjs(formData.date).format("MM/DD/YYYY") : null,
        training_title: formData.trainingName,
        training_hours: formData.trainingHours,
        number_of_participants: formData.numberOfParticipants,
      });

      setIsConfirmModalOpen(false);
      setIsSuccessModalOpen(true);
      if (onSuccess) onSuccess();

      setFormData({
        companyId: "", // get current  company of emp
        trainingName: "",
        date: null,
        trainingHours: "",
        numberOfParticipants: "",
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
          HR - Training
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
          options={uniqueOptions("training_title")}
          value={formData.trainingName}
          onInputChange={(event, newInputValue) => {
            setFormData((prev) => ({
              ...prev,
              trainingName: newInputValue,
            }));
          }}
          renderInput={(params) => (
            <TextField {...params} label="Training Name" fullWidth />
          )}
        />

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Date"
            value={formData.date}
            onChange={handleDateChange("date")}
            slotProps={{
              textField: { fullWidth: true, size: "medium" },
            }}
            minDate={dayjs("1994-09-29")}
          />
        </LocalizationProvider>

        <TextField
          label="Training Hours"
          value={formData.trainingHours}
          onChange={handleChange("trainingHours")}
          type="number"
          inputProps={{ min: 1 }}
        />

        <TextField
          label="Number of Participants"
          value={formData.numberOfParticipants}
          onChange={handleChange("numberOfParticipants")}
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
              message={"Are you sure you want to add this training record?"}
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
                "Your training record has been successfully added to the repository."
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

export default AddTrainingModal;
