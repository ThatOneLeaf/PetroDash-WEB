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
  Box,
} from "@mui/material";

import { useAuth } from "../../contexts/AuthContext";

import Overlay from "../../components/modal";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";

dayjs.extend(isSameOrAfter);

import api from "../../services/api";

import SuccessModal from "../../components/hr_components/SuccessModal";
import ErrorModal from "../../components/hr_components/ErrorModal";
import ConfirmModal from "./ConfirmModal";

function AddEmployeeModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    companyId: "", // get current  company of emp
    employeeId: "",
    gender: "",
    birthdate: null,
    position: "",
    employeeCategory: "",
    employeeStatus: "",
    tenureStart: null,
    tenureEnded: null,
  });

  const { getUserCompanyId } = useAuth();
  const userCompany = getUserCompanyId();

  const summaryData = [
    { label: "Company ID", value: String(userCompany || "N/A") },
    { label: "Employee ID", value: String(formData.employeeId || "N/A") },
    {
      label: "Gender",
      value: String(
        formData.gender === "F"
          ? "Female"
          : formData.gender === "M"
          ? "Male"
          : "N/A"
      ),
    },
    {
      label: "Position",
      value: String(
        formData.position === "RF"
          ? "Rank-and-File"
          : formData.position === "MM"
          ? "Middle Management"
          : formData.position === "SM"
          ? "Senior Management"
          : "N/A"
      ),
    },
    {
      label: "Birthdate",
      value: formData.birthdate
        ? dayjs(formData.birthdate).format("MM/DD/YYYY")
        : "N/A",
    },

    {
      label: "Category",
      value: String(
        formData.employeeCategory === "P"
          ? "Professional"
          : formData.employeeCategory === "NP"
          ? "Non-Professional"
          : "N/A"
      ),
    },
    { label: "Status", value: String(formData.employeeStatus || "N/A") },
    {
      label: "Tenure Start",
      value: formData.tenureStart
        ? dayjs(formData.tenureStart).format("MM/DD/YYYY")
        : "N/A",
    },
    {
      label: "Tenure End",
      value: formData.tenureEnded
        ? dayjs(formData.tenureEnded).format("MM/DD/YYYY")
        : "N/A",
    },
  ];
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [openPicker, setOpenPicker] = useState(null);

  // DATA -- CHANGE PER PAGE
  const fetchEmployabilityData = async () => {
    try {
      setLoading(true);
      const response = await api.get("hr/employability_records_by_status");
      console.log("Employability Data from API:", response.data);
      setData(response.data);
    } catch (error) {
      console.error("Error fetching Employability data:", error);
      setError("Error fetching data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployabilityData();
  }, []);

  const uniqueOptions = (key) => {
    return Array.from(new Set(data.map((item) => item[key]))).map((val) => ({
      label: val,
      value: val,
    }));
  };

  const genderOptions = [
    { label: "Male", value: "M" },
    { label: "Female", value: "F" },
  ];

  const positionOptions = [
    {
      label: "Rank-and-File",
      value: "RF",
    },
    {
      label: "Middle Management",
      value: "MM",
    },
    {
      label: "Senior Management",
      value: "SM",
    },
  ];

  const employementCategoryOptions = [
    {
      label: "Professional",
      value: "P",
    },
    {
      label: "Non-Professional",
      value: "NP",
    },
  ];

  const employementStatusOptions = [
    {
      label: "Permanent",
      value: "Permanent",
    },
    {
      label: "Temporary",
      value: "Temporary",
    },
  ];

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
    const MIN_DATE = dayjs("1994-09-28");
    const MIN_BIRTHDATE = dayjs("1900-01-01");
    const today = dayjs();

    const {
      employeeId,
      gender,
      position,
      birthdate,
      employeeCategory,
      employeeStatus,
      tenureStart,
      tenureEnded,
    } = formData;

    const isValidEmployeeId = employeeId.trim() !== "";
    const isValidEmployeeIdExists = !uniqueOptions("employee_id").some(
      (option) => option.value === employeeId.trim()
    );
    const isValidGender = genderOptions.some((opt) => opt.value === gender);
    const isValidPosition = positionOptions.some(
      (opt) => opt.value === position
    );
    const isValidBirthdate =
      birthdate &&
      dayjs(birthdate).isValid() &&
      dayjs(birthdate).isBefore(today) &&
      dayjs(birthdate).isAfter(MIN_BIRTHDATE);
    const isValidCategory = employementCategoryOptions.some(
      (opt) => opt.value === employeeCategory
    );
    const isValidStatus = employementStatusOptions.some(
      (opt) => opt.value === employeeStatus
    );
    const isValidTenureStart =
      tenureStart &&
      dayjs(tenureStart).isValid() &&
      dayjs(tenureStart).isAfter(MIN_DATE);

    const isValidTenureEnded =
      !tenureEnded ||
      (dayjs(tenureEnded).isValid() &&
        dayjs(tenureEnded).isSameOrAfter(tenureStart));

    if (!isValidEmployeeId) {
      setErrorMessage("Employee ID is required");
      setIsConfirmModalOpen(false);
      setIsErrorModalOpen(true);
      return;
    }

    if (!isValidEmployeeIdExists) {
      setErrorMessage("Employee ID must be unique.");
      setIsConfirmModalOpen(false);
      setIsErrorModalOpen(true);
      return;
    }

    if (!isValidGender) {
      setErrorMessage("Please select a valid Gender.");
      setIsConfirmModalOpen(false);
      setIsErrorModalOpen(true);
      return;
    }

    if (!isValidPosition) {
      setErrorMessage("Please select a valid Position.");
      setIsConfirmModalOpen(false);
      setIsErrorModalOpen(true);
      return;
    }
    if (!isValidBirthdate) {
      setErrorMessage("Please enter a valid Birthdate");
      setIsConfirmModalOpen(false);
      setIsErrorModalOpen(true);
      return;
    }

    if (!isValidCategory) {
      setErrorMessage("Please select a valid Employee Category.");
      setIsConfirmModalOpen(false);
      setIsErrorModalOpen(true);
      return;
    }

    if (!isValidStatus) {
      setErrorMessage("Please select a valid Employee Status.");
      setIsConfirmModalOpen(false);
      setIsErrorModalOpen(true);
      return;
    }

    if (!isValidTenureStart) {
      setErrorMessage("Tenure Start must be a valid date.");
      setIsConfirmModalOpen(false);
      setIsErrorModalOpen(true);
      return;
    }

    if (!isValidTenureEnded) {
      setErrorMessage(
        "Tenure Ended must be the same as or after Tenure Start."
      );
      setIsConfirmModalOpen(false);
      setIsErrorModalOpen(true);
      return;
    }

    try {
      setLoading(true);

      await api.post("/hr/single_upload_employability_record", {
        company_id: userCompany,
        employee_id: formData.employeeId.toUpperCase(),
        gender: formData.gender.toUpperCase(),
        birthdate: formData.birthdate
          ? dayjs(formData.birthdate).format("YYYY-MM-DD")
          : null,
        position_id: formData.position.toUpperCase(),
        p_np: formData.employeeCategory.toUpperCase(),
        employment_status: formData.employeeStatus,
        start_date: formData.tenureStart
          ? dayjs(formData.tenureStart).format("YYYY-MM-DD")
          : null,
        end_date: formData.tenureEnded
          ? dayjs(formData.tenureEnded).format("YYYY-MM-DD")
          : null,
      });

      setIsConfirmModalOpen(false);
      setIsSuccessModalOpen(true);
      if (onSuccess) onSuccess();

      setFormData({
        companyId: "",
        employeeId: "",
        gender: "",
        birthdate: null,
        position: "",
        employeeCategory: "",
        employeeStatus: "",
        tenureStart: null,
        tenureEnded: null,
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
        maxHeight: "100vh", //added
        overflowY: "auto", //added
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
          HR - Employability
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

        <TextField
          label="Employee ID"
          value={formData.employeeId}
          onChange={handleChange("employeeId")}
          type="text"
        />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 2,
          }}
        >
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Gender</InputLabel>
            <Select
              value={formData.gender}
              onChange={handleChange("gender")}
              label="Gender"
              sx={{ height: "55px" }}
            >
              {genderOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Position</InputLabel>
            <Select
              value={formData.position}
              onChange={handleChange("position")}
              label="Position"
              sx={{ height: "55px" }}
            >
              {positionOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Birthdate"
            value={formData.birthdate ? dayjs(formData.birthdate) : null}
            onChange={handleDateChange("birthdate")}
            open={openPicker === "birth"}
            onOpen={() => setOpenPicker("birth")}
            onClose={() => setOpenPicker(null)}
            minDate={dayjs("1900-01-01")}
            slotProps={{
              textField: { fullWidth: true, size: "medium" },
            }}
          />
        </LocalizationProvider>

        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Employee Category</InputLabel>
          <Select
            value={formData.employeeCategory}
            onChange={handleChange("employeeCategory")}
            label="Employee Category"
            sx={{ height: "55px" }}
          >
            {employementCategoryOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Employee Status</InputLabel>
          <Select
            value={formData.employeeStatus}
            onChange={handleChange("employeeStatus")}
            label="Employee Status"
            sx={{ height: "55px" }}
          >
            {employementStatusOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Tenure Start"
            value={formData.tenureStart ? dayjs(formData.tenureStart) : null}
            onChange={handleDateChange("tenureStart")}
            open={openPicker === "start"}
            onOpen={() => setOpenPicker("start")}
            onClose={() => setOpenPicker(null)}
            slotProps={{
              textField: { fullWidth: true, size: "medium" },
            }}
          />
        </LocalizationProvider>

        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="Tenure Ended"
            value={formData.tenureEnded ? dayjs(formData.tenureEnded) : null}
            onChange={handleDateChange("tenureEnded")}
            open={openPicker === "end"}
            onOpen={() => setOpenPicker("end")}
            onClose={() => setOpenPicker(null)}
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

        {isConfirmModalOpen && (
          <Overlay onClose={() => setIsConfirmModalOpen(false)}>
            <ConfirmModal
              open={isConfirmModalOpen}
              title={"Confirm Record Addition"}
              message={"Are you sure you want to add this employee record?"}
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
                "Your employee record has been successfully added to the repository."
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

export default AddEmployeeModal;
