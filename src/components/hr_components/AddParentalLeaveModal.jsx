import { useState, useEffect } from "react";
import {
  Paper,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Autocomplete,
  Box,
} from "@mui/material";

import Overlay from "../../components/modal";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";

import { useAuth } from "../../contexts/AuthContext";

dayjs.extend(isSameOrAfter);

import api from "../../services/api";

import SuccessModal from "../../components/hr_components/SuccessModal";
import ErrorModal from "../../components/hr_components/ErrorModal";
import ConfirmModal from "./ConfirmModal";

function AddParentalLeaveModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    employeeId: "",
    dateAvailed: null,
    daysAvailed: "",
    typeOfLeave: "",
  });
  const summaryData = [
    { label: "Employee ID", value: String(formData.employeeId || "N/A") },
    { label: "Type of Leave", value: String(formData.typeOfLeave || "N/A") },
    { label: "Days Availed", value: String(formData.daysAvailed || "N/A") },
    {
      label: "Date Availed",
      value: formData.dateAvailed
        ? dayjs(formData.dateAvailed).format("MM/DD/YYYY")
        : "N/A",
    },
  ];

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const MIN_DATE = dayjs("1994-09-28");

  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [employabilityData, setEmployabilityData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [parentalRes, employabilityRes] = await Promise.all([
          api.get("hr/parental_leave_records_by_status"),
          api.get("hr/employability_records_by_status"),
        ]);
        console.log("Parental:", parentalRes.data);
        console.log("Employability:", employabilityRes.data);
        setData(parentalRes.data);
        setEmployabilityData(employabilityRes.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Error fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const { getUserCompanyId } = useAuth();
  const userCompany = getUserCompanyId();

  const uniqueOptions = (key) => {
    return Array.from(new Set(data.map((item) => item[key]))).map((val) => ({
      label: val,
      value: val,
    }));
  };

  const employeeOptions = Array.from(
    new Set(employabilityData.map((item) => item.employee_id))
  ).map((val) => ({ label: val, value: val }));

  const handleChange = (field) => (event) => {
    const newFormData = {
      ...formData,
      [field]: event.target.value,
    };
    setFormData(newFormData);
  };

  const handleDateChange = (field) => (newValue) => {
    const isoDate = newValue ? dayjs(newValue).format("YYYY-MM-DD") : null;

    console.log(isoDate);

    setFormData((prev) => ({
      ...prev,
      [field]: isoDate,
    }));
  };

  const handleSubmit = async () => {
    console.log(formData);

    /* VALIDATIONS*/

    const { employeeId, dateAvailed, daysAvailed, typeOfLeave } = formData;

    const isValidEmployee = employeeOptions.some(
      (option) => option.label === employeeId
    );

    const isValidLeaveType = uniqueOptions("type_of_leave").some(
      (option) => option.value === typeOfLeave
    );

    const isValidDate =
      dateAvailed && dayjs(dateAvailed).isSameOrAfter(MIN_DATE);

    const isValidDays =
      daysAvailed !== "" && !isNaN(daysAvailed) && Number(daysAvailed) > 0;

    if (!employeeId || !isValidEmployee) {
      setErrorMessage("Please select a valid Employee ID.");
      setIsConfirmModalOpen(false);
      setIsErrorModalOpen(true);
      return;
    }

    if (!typeOfLeave || !isValidLeaveType) {
      setErrorMessage("Please select a valid Type of Leave.");
      setIsConfirmModalOpen(false);
      setIsErrorModalOpen(true);
      return;
    }

    if (!isValidDays) {
      setErrorMessage("Days Availed must be a number greater than 0.");
      setIsConfirmModalOpen(false);
      setIsErrorModalOpen(true);
      return;
    }

    if (!isValidDate) {
      setErrorMessage("Please select a valid Date Availed");
      setIsConfirmModalOpen(false);
      setIsErrorModalOpen(true);
      return;
    }

    try {
      setLoading(true);

      await api.post("/hr/single_upload_parental_leave_record", {
        employee_id: formData.employeeId.toUpperCase(),
        type_of_leave: formData.typeOfLeave,
        date: formData.dateAvailed
          ? dayjs(formData.dateAvailed).format("YYYY-MM-DD")
          : null,
        days: formData.daysAvailed,
      });

      setIsConfirmModalOpen(false);
      setIsSuccessModalOpen(true);
      if (onSuccess) onSuccess();

      setFormData({
        employeeId: "",
        dateAvailed: null,
        daysAvailed: "",
        typeOfLeave: "",
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
          HR - Parental Leave
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
          options={employeeOptions}
          value={formData.employeeId}
          onInputChange={(event, newInputValue) => {
            setFormData((prev) => ({
              ...prev,
              employeeId: newInputValue,
            }));
          }}
          renderInput={(params) => (
            <TextField {...params} label="Employee ID" fullWidth />
          )}
        />

        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Type of Leave</InputLabel>
          <Select
            value={formData.typeOfLeave}
            onChange={handleChange("typeOfLeave")}
            label="Type of Leave"
            sx={{ height: "55px" }}
          >
            {uniqueOptions("type_of_leave").map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Days Availed"
          value={formData.daysAvailed}
          onChange={handleChange("daysAvailed")}
          type="number"
          inputProps={{ min: 1 }}
        />

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Date Availed"
            value={formData.dateAvailed ? dayjs(formData.dateAvailed) : null}
            onChange={handleDateChange("dateAvailed")}
            minDate={dayjs("1994-09-29")}
            slotProps={{
              textField: { fullWidth: true, size: "medium" },
            }}
          />
        </LocalizationProvider>
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
      </Box>
      {isConfirmModalOpen && (
        <Overlay onClose={() => setIsConfirmModalOpen(false)}>
          <ConfirmModal
            open={isConfirmModalOpen}
            title={"Confirm Record Addition"}
            message={"Are you sure you want to add this parental leave record?"}
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
              "Your parental leave record has been successfully added to the repository."
            }
            onClose={() => {
              setIsSuccessModalOpen(false);
              onClose();
            }}
          />
        </Overlay>
      )}
    </Paper>
  );
}

export default AddParentalLeaveModal;
