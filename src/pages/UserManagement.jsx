import React, { useState, useMemo, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { Box, Typography, IconButton, Switch, Button, ListItemIcon, ListItemText } from "@mui/material";
import ButtonComp from "../components/ButtonComp";
import Table from "../components/Table/Table";
import UserTable from "../components/Table/UserTable";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Menu, MenuItem, Modal, Paper } from "@mui/material";
import VisibilityIcon from '@mui/icons-material/Visibility';
import PersonOffIcon from '@mui/icons-material/PersonOff';
import RepositoryHeader from "../components/RepositoryHeader";
import Search from "../components/Filter/Search";
import { fetchUsers, activateUser, deactivateUser } from "../services/users";
import api from "../services/api";

const columns = [
  {
    key: "name",
    label: "Name",
    render: (val, row) => {
      const first = row.first_name || "";
      const middle = row.middle_name ? ` ${row.middle_name}` : "";
      const last = row.last_name || "";
      const suffix = row.suffix ? `, ${row.suffix}` : "";
      if (suffix) {
        return `${first}${middle} ${last}${suffix}`.trim();
      }
      return `${first}${middle} ${last}`.trim();
    },
  },
  { key: "email", label: "Email" },
  { key: "company_id", label: "Company" },
{ 
  key: "power_plant_id", 
  label: "Power Plant ID", 
  render: (val, row) => (
    !val || val.trim() === "" ? (
      <Typography variant="body2" color="text.secondary">
        None
      </Typography>
    ) : (
      <Typography variant="body2">
        {val}
      </Typography>
    )
  )
},
  { key: "account_role", label: "Role" },
  {
    key: "account_status",
    label: "Status",
    render: (val) => {
      let display = val;
      if (val?.toLowerCase() === 'inactive' || val?.toLowerCase() === 'deactivated') {
        display = 'Deactivated';
      }
      return (
        <Typography
          variant="body2"
          color={val?.toLowerCase() === "active" ? "success.main" : "error.main"}
          fontWeight={600}
          textTransform="capitalize"
        >
          {display}
        </Typography>
      );
    },
  },
  { key: "actions", label: "", align: "center", disableSort: true },
];

const initialForm = {
  email: "",
  account_role: "",
  company_id: "",
  power_plant_id: "",
  account_status: "active",
  first_name: "",
  middle_name: "",
  last_name: "",
  suffix: "",
  contact_number: "",
  address: "",
  birthdate: "",
  gender: "",
  emp_id: "",
};

const UserManagement = () => {
  // Kebab menu and modal state (must be inside the component)
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleMenuOpen = (event, user) => {
    setAnchorEl(event.currentTarget);
    setSelectedUser(user);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const handleViewDetails = () => {
    setModalOpen(true);
    setAnchorEl(null);
  };
  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedUser(null);
  };
  const [users, setUsers] = useState([]);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [bulkForm, setBulkForm] = useState({
    role: '',
    company_id: '',
    power_plant_id: '',
    file: null,
  });
  const [formLoading, setFormLoading] = useState(false);
  const [bulkFormLoading, setBulkFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [bulkFormError, setBulkFormError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const rowsPerPage = 15;
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New: Company and Power Plant options
  const [companyOptions, setCompanyOptions] = useState([]);
  const [companyIdToName, setCompanyIdToName] = useState({});
  const [allPowerPlantOptions, setAllPowerPlantOptions] = useState([]); // all plants from API
  const [powerPlantOptions, setPowerPlantOptions] = useState([]); // filtered by company
  const [plantIdToSiteName, setPlantIdToSiteName] = useState({});

  // New: Bulk preview state
  const [bulkPreview, setBulkPreview] = useState(null);
  const [bulkPreviewLoading, setBulkPreviewLoading] = useState(false);

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchUsers();
        setUsers(data);
      } catch (err) {
        setError("Failed to fetch users");
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  // Fetch company and power plant info for dropdowns
  useEffect(() => {
    const fetchPPInfo = async () => {
      try {
        const res = await api.get("/reference/pp_info");
        // Expecting res.data to be an array of objects with company_id, company_name, power_plant_id
        const companies = [];
        const plants = [];
        const seenCompanies = new Set();
        const seenPlants = new Set();
        (res.data || []).forEach(item => {
          if (item.company_id && item.company_name && !seenCompanies.has(item.company_id)) {
            companies.push({ value: item.company_id, label: item.company_name });
            seenCompanies.add(item.company_id);
          }
          if (item.power_plant_id && item.company_id && !seenPlants.has(item.power_plant_id)) {
            plants.push({ value: item.power_plant_id, label: item.power_plant_id, company_id: item.company_id });
            seenPlants.add(item.power_plant_id);
          }
        });
        setCompanyOptions(companies);
        setAllPowerPlantOptions(plants);
        setPowerPlantOptions(plants); // initially show all
        // Build a map for company_id to company_name
        const idToName = {};
        const plantIdToSite = {};
        (res.data || []).forEach(item => {
          if (item.company_id && item.company_name) {
            idToName[item.company_id] = item.company_name;
          }
          if (item.power_plant_id && item.site_name) {
            plantIdToSite[item.power_plant_id] = item.site_name;
          }
        });
        setCompanyIdToName(idToName);
        setPlantIdToSiteName(plantIdToSite);
      } catch (err) {
        setCompanyOptions([]);
        setAllPowerPlantOptions([]);
        setPowerPlantOptions([]);
      }
    };
    fetchPPInfo();
  }, []);

  // Filter power plant options when company_id changes
  useEffect(() => {
    if (!form.company_id) {
      setPowerPlantOptions(allPowerPlantOptions);
    } else {
      setPowerPlantOptions(allPowerPlantOptions.filter(opt => opt.company_id === form.company_id));
      // If selected power_plant_id is not in filtered list, clear it
      if (!allPowerPlantOptions.some(opt => opt.company_id === form.company_id && opt.value === form.power_plant_id)) {
        setForm(f => ({ ...f, power_plant_id: "" }));
      }
    }
  }, [form.company_id, allPowerPlantOptions]);

  // Filter power plant options for bulk modal
  useEffect(() => {
    if (bulkForm.company_id) {
      setBulkForm(f => ({ ...f, power_plant_id: '' }));
    }
  }, [bulkForm.company_id]);

  const filteredData = useMemo(() => {
    if (!searchTerm) return users;
    const lower = searchTerm.toLowerCase();
    return users.filter((row) => {
      // Check all columns as before
      let match = columns.some((col) => String(row[col.key] ?? "").toLowerCase().includes(lower));
      if (match) return true;
      // Additionally, check if any part of the name matches
      const nameParts = [row.first_name, row.middle_name, row.last_name, row.suffix].filter(Boolean).map(String);
      return nameParts.some(part => part.toLowerCase().includes(lower));
    });
  }, [searchTerm, users]);

  const paginatedData = filteredData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleSelectionChange = (selected) => {
    setSelectedRowIds(selected);
  };

  const handleBulkDeactivate = () => {
    if (selectedRowIds.length === 0) return;
    const names = users.filter(u => selectedRowIds.includes(u.account_id)).map(u => u.name).join(', ');
    alert(`Deactivated users: ${names}`);
    // Here you would call your backend API to deactivate users
  };

  // Handle bulk submit
  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    setBulkFormLoading(true);
    setBulkFormError("");
    try {
      if (!bulkForm.file) {
        setBulkFormError("Please select a CSV file.");
        setBulkFormLoading(false);
        return;
      }
      const formData = new FormData();
      formData.append("file", bulkForm.file);
      formData.append("account_role", bulkForm.role);
      if (bulkForm.company_id) formData.append("company_id", bulkForm.company_id);
      if (bulkForm.power_plant_id) formData.append("power_plant_id", bulkForm.power_plant_id);
      const response = await api.post("/accounts/bulk", formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (response && response.data) {
        setUsers(prev => [...response.data, ...prev]);
        setBulkModalOpen(false);
        setBulkForm({ role: '', company_id: '', power_plant_id: '', file: null });
      } else {
        // fallback: refresh users
        const data = await fetchUsers();
        setUsers(data);
        setBulkModalOpen(false);
      }
    } catch (err) {
      setBulkFormError(err?.response?.data?.detail || "Failed to upload users");
      alert('Bulk add error: ' + (err?.response?.data?.detail || err.message || err));
    } finally {
      setBulkFormLoading(false);
    }
  };

  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    console.log('Form state before submit:', form);
    const confirmed = window.confirm("Are you sure you want to add this user?");
    if (!confirmed) return;
    setFormLoading(true);
    setFormError("");
    try {
      // Ensure birthdate is a string in YYYY-MM-DD format or null
      const birthdate = form.birthdate
        ? new Date(form.birthdate).toISOString().split("T")[0]
        : null;

      const payload = {
        email: form.email,
        account_role: form.account_role,
        company_id: form.company_id,
        power_plant_id: form.power_plant_id,
        account_status: form.account_status,
        profile: {
          emp_id: form.emp_id,
          first_name: form.first_name,
          last_name: form.last_name,
          middle_name: form.middle_name,
          suffix: form.suffix,
          contact_number: form.contact_number,
          address: form.address,
          birthdate: birthdate,
          gender: form.gender,
        }
      };
      console.log('Submitting user payload:', payload);
      const response = await api.post("/accounts/add", payload, {
        headers: { "Content-Type": "application/json" }
      });
      console.log('API response:', response);
      setAddModalOpen(false);
      setForm(initialForm);
      // Insert new user at the top of the list
      if (response && response.data) {
        setUsers(prev => [response.data, ...prev]);
      } else {
        // fallback: refresh users
        const data = await fetchUsers();
        setUsers(data);
      }
    } catch (err) {
      console.error('User add error:', err, err?.response);
      setFormError(err?.response?.data?.detail || "Failed to create user");
      // Optionally show error in alert for debugging
      alert('User add error: ' + (err?.response?.data?.detail || err.message || err));
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return <Box p={4}><Typography>Loading users...</Typography></Box>;
  }
  if (error) {
    return <Box p={4}><Typography color="error">{error}</Typography></Box>;
  }

  // Helper: roles that should disable power plant
  const disablePowerPlantRoles = ["R02", "R03", "R04"];

  return (
    <Box sx={{ display: "flex", height: "100dvh", overflow: "hidden" }}>
      {/* Sidebar */}
      <Box
        sx={{
          width: "auto",
          flexShrink: 0,
          borderRight: "1px solid #e0e0e0",
          bgcolor: "background.paper",
        }}
      >
        <Sidebar />
      </Box>

      {/* Main content */}
      <Box sx={{ padding: 2, flex: 1, overflow: "hidden", bgcolor: "background.default" }}>
        <Box sx={{ padding: 0 }}>
          {/* Header and actions */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
              px: 2,
              pt: 2,
            }}
          >
            <RepositoryHeader label="REPOSITORY" title="User Management" />
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              {selectedRowIds.length === 0 ? (
                <>
                  <ButtonComp
                    label="Import Users"
                    rounded
                    color="blue"
                    onClick={() => setBulkModalOpen(true)}
                    sx={{ minWidth: 150, fontWeight: 600, fontSize: 16 }}
                  />
                  <ButtonComp
                    label="Add New User"
                    rounded
                    color="green"
                    onClick={() => {
                      setForm(initialForm);
                      setFormError("");
                      setAddModalOpen(true);
                    }}
                    sx={{ minWidth: 150, fontWeight: 600, fontSize: 16 }}
                  />
      {/* Add New User Modal */}
      <Modal
        open={addModalOpen}
        onClose={() => {
          // If there are unsaved changes in the add user form, confirm with the user
          const hasDraft = Object.values(form).some(val => val && val !== initialForm[Object.keys(form).find(k => form[k] === val)]);
          if (hasDraft) {
            const confirmed = window.confirm('You have unsaved changes in the add user form. Are you sure you want to cancel? All data will be lost.');
            if (!confirmed) return;
          }
          setAddModalOpen(false);
          setForm(initialForm);
          setFormError("");
        }}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Paper
          sx={{
            p: 0,
            width: '100%',
            maxWidth: { xs: 360, sm: 500, md: 700, lg: 1000 },
            minWidth: { xs: '90vw', sm: 400, md: 500 },
            mx: 'auto',
            my: 4,
            outline: 'none',
            borderRadius: 4,
            boxShadow: 8,
          }}
        >
          <Box sx={{ bgcolor: '#22347a', color: '#fff', px: 4, py: 2, borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
            <Typography variant="h6" fontWeight={700}>Add New User</Typography>
            <Typography variant="body2" color="#cfd8ff">Fill in the details below to create a new user account.</Typography>
          </Box>
          <Box component="form" sx={{ px: 4, py: 3, bgcolor: '#f8fafd', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }} onSubmit={handleAddUserSubmit}>
            {/* Email and Role */}
            <Box display="flex" gap={2} mb={2}>
              <Box flex={1}>
                <Typography fontWeight={600} mb={0.5}>Email <span style={{color:'#e53935'}}>*</span></Typography>
                <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={{ width: "100%", padding: 10, borderRadius: 6, border: '1px solid #cfd8dc', marginBottom: 4, fontSize: 16, background: '#fff' }} placeholder="user@email.com" />
              </Box>
              <Box flex={1}>
                <Typography fontWeight={600} mb={0.5}>Role <span style={{color:'#e53935'}}>*</span></Typography>
                <select
                  required
                  value={form.account_role}
                  onChange={e => setForm(f => ({ ...f, account_role: e.target.value }))}
                  style={{ width: "100%", padding: 10, borderRadius: 6, border: '1px solid #cfd8dc', marginBottom: 4, fontSize: 16, background: '#fff' }}
                >
                  <option value="" disabled>Select role</option>
                  <option value="R02">Executive</option>
                  <option value="R03">Head-Office Level Checker</option>
                  <option value="R04">Site-Level Checker</option>
                  <option value="R05">Encoder</option>
                </select>
              </Box>
            </Box>

            {/* Company ID and Power Project ID */}
            <Box display="flex" gap={2} mb={2}>
              <Box flex={1}>
                <Typography fontWeight={600} mb={0.5}>Company ID</Typography>
                <select
                  value={form.company_id}
                  onChange={e => setForm(f => ({ ...f, company_id: e.target.value }))}
                  style={{ width: "100%", padding: 10, borderRadius: 6, border: '1px solid #cfd8dc', marginBottom: 4, fontSize: 16, background: '#fff' }}
                >
                  <option value="" disabled>Select company</option>
                  {companyOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </Box>
              <Box flex={1}>
                <Typography fontWeight={600} mb={0.5}>Power Project ID</Typography>
                <select
                  value={form.power_plant_id}
                  onChange={e => setForm(f => ({ ...f, power_plant_id: e.target.value }))}
                  style={{ width: "100%", padding: 10, borderRadius: 6, border: '1px solid #cfd8dc', marginBottom: 4, fontSize: 16, background: '#fff' }}
                  disabled={!form.company_id}
                >
                  <option value="" disabled>{form.company_id ? "Select power plant" : "Select company first"}</option>
                  {powerPlantOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </Box>
            </Box>

            {/* Emp ID */}
            <Box mb={2}>
              <Typography fontWeight={600} mb={0.5}>Emp ID</Typography>
              <input value={form.emp_id} onChange={e => setForm(f => ({ ...f, emp_id: e.target.value }))} style={{ width: "100%", padding: 10, borderRadius: 6, border: '1px solid #cfd8dc', marginBottom: 4, fontSize: 16, background: '#fff' }} placeholder="Employee ID" />
            </Box>

            {/* Name fields in one row */}
            <Box display="flex" gap={2} mb={2}>
              <Box flex={1}>
                <Typography fontWeight={600} mb={0.5}>First Name <span style={{color:'#e53935'}}>*</span></Typography>
                <input required value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} style={{ width: "100%", padding: 10, borderRadius: 6, border: '1px solid #cfd8dc', marginBottom: 4, fontSize: 16, background: '#fff' }} placeholder="First Name" />
              </Box>
              <Box flex={1}>
                <Typography fontWeight={600} mb={0.5}>Middle Name</Typography>
                <input value={form.middle_name} onChange={e => setForm(f => ({ ...f, middle_name: e.target.value }))} style={{ width: "100%", padding: 10, borderRadius: 6, border: '1px solid #cfd8dc', marginBottom: 4, fontSize: 16, background: '#fff' }} placeholder="Middle Name" />
              </Box>
              <Box flex={1}>
                <Typography fontWeight={600} mb={0.5}>Last Name <span style={{color:'#e53935'}}>*</span></Typography>
                <input required value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} style={{ width: "100%", padding: 10, borderRadius: 6, border: '1px solid #cfd8dc', marginBottom: 4, fontSize: 16, background: '#fff' }} placeholder="Last Name" />
              </Box>
              <Box flex={1}>
                <Typography fontWeight={600} mb={0.5}>Suffix</Typography>
                <input value={form.suffix} onChange={e => setForm(f => ({ ...f, suffix: e.target.value }))} style={{ width: "100%", padding: 10, borderRadius: 6, border: '1px solid #cfd8dc', marginBottom: 4, fontSize: 16, background: '#fff' }} placeholder="Jr., Sr., III, etc." />
              </Box>
            </Box>

            {/* Gender, Contact Number, Birthdate */}
            <Box display="flex" gap={2} mb={2}>
              <Box flex={1}>
                <Typography fontWeight={600} mb={0.5}>Gender</Typography>
                <select
                  value={form.gender}
                  onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}
                  style={{ width: "100%", padding: 10, borderRadius: 6, border: '1px solid #cfd8dc', marginBottom: 4, fontSize: 16, background: '#fff' }}
                >
                  <option value="" disabled>Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </Box>
              <Box flex={1}>
                <Typography fontWeight={600} mb={0.5}>Contact Number</Typography>
                <input value={form.contact_number} onChange={e => setForm(f => ({ ...f, contact_number: e.target.value }))} style={{ width: "100%", padding: 10, borderRadius: 6, border: '1px solid #cfd8dc', marginBottom: 4, fontSize: 16, background: '#fff' }} placeholder="09XXXXXXXXX" />
              </Box>
              <Box flex={1}>
                <Typography fontWeight={600} mb={0.5}>Birthdate</Typography>
                <input
                  type="date"
                  value={form.birthdate}
                  onChange={e => setForm(f => ({ ...f, birthdate: e.target.value }))}
                  max={(() => {
                    const today = new Date();
                    today.setFullYear(today.getFullYear() - 15);
                    return today.toISOString().split('T')[0];
                  })()}
                  style={{ width: "100%", padding: 10, borderRadius: 6, border: '1px solid #cfd8dc', marginBottom: 4, fontSize: 16, background: '#fff' }}
                />
              </Box>
            </Box>

            {/* Address */}
            <Box mb={2}>
              <Typography fontWeight={600} mb={0.5}>Address</Typography>
              <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} style={{ width: "100%", padding: 10, borderRadius: 6, border: '1px solid #cfd8dc', marginBottom: 4, fontSize: 16, background: '#fff' }} placeholder="Address" />
            </Box>
            {formError && <Typography color="error" mb={1}>{formError}</Typography>}
            <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => {
                  const hasDraft = Object.values(form).some(val => val && val !== initialForm[Object.keys(form).find(k => form[k] === val)]);
                  if (hasDraft) {
                    const confirmed = window.confirm('You have unsaved changes in the add user form. Are you sure you want to cancel? All data will be lost.');
                    if (!confirmed) return;
                  }
                  setAddModalOpen(false);
                  setForm(initialForm);
                  setFormError("");
                }}
                disabled={formLoading}
                sx={{ minWidth: 100, fontWeight: 600, fontSize: 16, mr: 1 }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="success"
                type="submit"
                disabled={
                  formLoading ||
                  !form.email ||
                  !form.account_role ||
                  !form.first_name ||
                  !form.last_name
                }
                sx={{ minWidth: 100, fontWeight: 600, fontSize: 16 }}
              >
                {formLoading ? "Saving..." : "Save"}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Modal>

      {/* Bulk Add Users Modal */}
      <Modal
        open={bulkModalOpen}
        onClose={() => {
          // If there is unfinished business, confirm with the user
          if (
            bulkForm.file ||
            bulkForm.role ||
            bulkForm.company_id ||
            bulkForm.power_plant_id ||
            bulkPreview ||
            bulkFormError
          ) {
            const confirmed = window.confirm('You have unsaved changes in the bulk add form. Are you sure you want to cancel? All data will be lost.');
            if (!confirmed) return;
          }
          setBulkModalOpen(false);
          setBulkForm({ role: '', company_id: '', power_plant_id: '', file: null });
          setBulkPreview(null);
          setBulkFormError('');
        }}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Paper
          sx={{
            p: 0,
            width: '100%',
            maxWidth: { xs: 400, sm: 700, md: 900, lg: 1200 },
            minWidth: { xs: '95vw', sm: 600, md: 700 },
            mx: 'auto',
            my: 4,
            outline: 'none',
            borderRadius: 4,
            boxShadow: 8,
          }}
        >
          <Box sx={{ bgcolor: '#22347a', color: '#fff', px: 4, py: 2, borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
            <Typography variant="h6" fontWeight={700}>Bulk Add Users</Typography>
            <Typography variant="body2" color="#cfd8ff">Select role, company, power plant, and upload a CSV file to add multiple users.</Typography>
          </Box>
          <Box component="form" sx={{ px: 4, py: 3, bgcolor: '#f8fafd', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }} onSubmit={handleBulkSubmit}>
            <Box display="flex" gap={2} mb={2}>
              <Box flex={1}>
                <Typography fontWeight={600} mb={0.5}>Role <span style={{color:'#e53935'}}>*</span></Typography>
                <select
                  required
                  value={bulkForm.role}
                  onChange={e => setBulkForm(f => ({ ...f, role: e.target.value }))}
                  style={{ width: "100%", padding: 10, borderRadius: 6, border: '1px solid #cfd8dc', marginBottom: 4, fontSize: 16, background: '#fff' }}
                >
                  <option value="" disabled>Select role</option>
                  <option value="R02">Executive</option>
                  <option value="R03">Head-Office Level Checker</option>
                  <option value="R04">Site-Level Checker</option>
                  <option value="R05">Encoder</option>
                </select>
              </Box>
              <Box flex={1}>
                <Typography fontWeight={600} mb={0.5}>Company</Typography>
                <select
                  value={bulkForm.company_id}
                  onChange={e => setBulkForm(f => ({ ...f, company_id: e.target.value }))}
                  style={{ width: "100%", padding: 10, borderRadius: 6, border: '1px solid #cfd8dc', marginBottom: 4, fontSize: 16, background: '#fff' }}
                >
                  <option value="" disabled>Select company</option>
                  {companyOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </Box>
              <Box flex={1}>
                <Typography fontWeight={600} mb={0.5}>Power Plant</Typography>
                <select
                  value={bulkForm.power_plant_id}
                  onChange={e => setBulkForm(f => ({ ...f, power_plant_id: e.target.value }))}
                  style={{ width: "100%", padding: 10, borderRadius: 6, border: '1px solid #cfd8dc', marginBottom: 4, fontSize: 16, background: '#fff' }}
                  disabled={!bulkForm.company_id || disablePowerPlantRoles.includes(bulkForm.role)}
                >
                  <option value="" disabled>{bulkForm.company_id ? "Select power plant" : "Select company first"}</option>
                  {powerPlantOptions
                    .filter(opt => !bulkForm.company_id || opt.company_id === bulkForm.company_id)
                    .map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
              </Box>
            </Box>
            <Box mb={2}>
              <Typography fontWeight={600} mb={0.5}>CSV File <span style={{color:'#e53935'}}>*</span></Typography>
              <input
                required
                type="file"
                accept=".csv"
                onChange={async e => {
                  const file = e.target.files[0];
                  setBulkForm(f => ({ ...f, file }));
                  setBulkPreview(null);
                  setBulkFormError("");
                  if (file) {
                    setBulkPreviewLoading(true);
                    try {
                      const formData = new FormData();
                      formData.append("file", file);
                      formData.append("account_role", bulkForm.role);
                      if (bulkForm.company_id) formData.append("company_id", bulkForm.company_id);
                      if (bulkForm.power_plant_id) formData.append("power_plant_id", bulkForm.power_plant_id);
                      const res = await api.post("/accounts/bulk/preview", formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                      });
                      setBulkPreview(res.data);
                    } catch (err) {
                      setBulkPreview(null);
                      setBulkFormError(err?.response?.data?.detail || "Failed to preview file");
                    } finally {
                      setBulkPreviewLoading(false);
                    }
                  }
                }}
                style={{ width: "100%", padding: 10, borderRadius: 6, border: '1px solid #cfd8dc', background: '#fff' }}
              />
              <Typography variant="caption" color="textSecondary">
                Download template{' '}
                <a
                  href="#"
                  onClick={async (e) => {
                    e.preventDefault();
                    try {
                      const res = await api.get("/accounts/bulk/template", { responseType: "blob" });
                      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'text/csv' }));
                      const link = document.createElement('a');
                      link.href = url;
                      link.setAttribute('download', 'account_bulk_template.csv');
                      document.body.appendChild(link);
                      link.click();
                      link.parentNode.removeChild(link);
                      window.URL.revokeObjectURL(url);
                    } catch (err) {
                      alert("Failed to download template");
                    }
                  }}
                  style={{ textDecoration: 'underline', color: '#22347a', cursor: 'pointer' }}
                >
                  here
                </a>.
              </Typography>
            </Box>
            {bulkPreviewLoading && (
              <Box mb={2}><Typography>Loading preview...</Typography></Box>
            )}
            {bulkPreview && bulkPreview.valid && (
              <Box mb={2}>
                <Typography fontWeight={600} mb={1}>Preview Data</Typography>
                <div style={{ maxHeight: 300, overflow: 'auto', border: '1px solid #cfd8dc', borderRadius: 6 }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                    <thead>
                      <tr>
                        {Object.keys(bulkPreview.rows[0] || {}).map(key => (
                          <th key={key} style={{ border: '1px solid #e0e0e0', padding: 6, background: '#f5f5f5', fontWeight: 600 }}>{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {bulkPreview.rows.map((row, idx) => (
                        <tr key={idx}>
                          {Object.entries(row).map(([key, val], i) => {
                            // Format contact fields as 09XX-XXX-XXXX, preserving leading zeros
                            let displayVal = val;
                            if (key.toLowerCase().includes('contact')) {
                              let str = val !== undefined && val !== null ? String(val).replace(/[^0-9]/g, '') : '';
                              if (str.length === 11 && str.startsWith('09')) {
                                displayVal = `${str.slice(0,4)}-${str.slice(4,7)}-${str.slice(7,11)}`;
                              } else {
                                displayVal = `${"0"}${str.slice(0,3)}-${str.slice(3,6)}-${str.slice(6,10)}`;
                              }
                            }
                            return (
                              <td key={i} style={{ border: '1px solid #e0e0e0', padding: 6 }}>{displayVal}</td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Box>
            )}
            {bulkPreview && !bulkPreview.valid && (
              <Box mb={2}>
                <Typography color="error" fontWeight={600}>File contains errors:</Typography>
                <ul style={{ color: '#e53935', margin: 0, paddingLeft: 20 }}>
                  {bulkPreview.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </Box>
            )}
            {bulkFormError && <Typography color="error" mb={1}>{bulkFormError}</Typography>}
            <Box display="flex" justifyContent="flex-end" gap={2} mt={2}>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => {
                  if (
                    bulkForm.file ||
                    bulkForm.role ||
                    bulkForm.company_id ||
                    bulkForm.power_plant_id ||
                    bulkPreview ||
                    bulkFormError
                  ) {
                    const confirmed = window.confirm('You have unsaved changes in the bulk add form. Are you sure you want to cancel? All data will be lost.');
                    if (!confirmed) return;
                  }
                  setBulkModalOpen(false);
                  setBulkForm({ role: '', company_id: '', power_plant_id: '', file: null });
                  setBulkPreview(null);
                  setBulkFormError('');
                }}
                disabled={bulkFormLoading}
                sx={{ minWidth: 100, fontWeight: 600, fontSize: 16, mr: 1 }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="success"
                type="submit"
                disabled={
                  bulkFormLoading ||
                  !bulkForm.role ||
                  !bulkForm.file ||
                  ((bulkForm.role === 'R05') && (!bulkForm.company_id || !bulkForm.power_plant_id)) ||
                  ((bulkForm.role === 'R03' || bulkForm.role === 'R04') && !bulkForm.company_id)
                }
                sx={{ minWidth: 100, fontWeight: 600, fontSize: 16 }}
              >
                {bulkFormLoading ? "Uploading..." : "Upload"}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Modal>
                </>
              ) : (
                <>
                  <Typography variant="body2" color="primary" fontWeight={600} mr={2}>
                    {selectedRowIds.length} selected
                  </Typography>
                  <ButtonComp
                    label="Deactivate"
                    rounded
                    color="blue"
                    onClick={handleBulkDeactivate}
                    sx={{ minWidth: 140, fontWeight: 600, fontSize: 14 }}
                  />
                </>
              )}
            </Box>
          </Box>

          {/* Search bar below header */}
          <Box sx={{ mb: 3, px: 2 }}>
            <Search
              value={searchTerm}
              onSearch={(val) => {
                setSearchTerm(val);
                setPage(0);
              }}
              suggestions={[
                ...new Set([
                  ...users.map((row) => row.name).filter(Boolean),
                  ...users.map((row) => row.email).filter(Boolean),
                  ...users.map((row) => row.role).filter(Boolean),
                ]),
              ]}
              placeholder="Search users..."
            />
          </Box>

          <UserTable
            columns={columns}
            rows={paginatedData.map(user => ({ ...user, actions: user.account_id }))}
            idKey="account_id"
            emptyMessage="No users found."
            actions={(user) => (
              <Box display="flex" alignItems="center" gap={1}>
                <IconButton onClick={e => handleMenuOpen(e, user)}>
                  <MoreVertIcon />
                </IconButton>
              </Box>
            )}
            maxHeight="calc(100vh - 220px)"
            selectable={true}
            onSelectionChange={handleSelectionChange}
            selectedRowIds={selectedRowIds}
          />

          {/* Kebab menu */}
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem onClick={handleViewDetails}>
              <ListItemIcon>
                <VisibilityIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="View Details" />
            </MenuItem>
            <MenuItem
              onClick={async () => {
                console.log('Deactivate clicked', selectedUser);
                if (selectedUser && selectedUser.account_status === 'active') {
                  try {
                    const resp = await deactivateUser(selectedUser.account_id);
                    console.log('Deactivate API response:', resp);
                    const data = await fetchUsers();
                    setUsers(data);
                    handleMenuClose();
                  } catch (err) {
                    console.error('Deactivate error:', err);
                    alert('Failed to deactivate user');
                  }
                } else {
                  alert('User is already deactivated.');
                  handleMenuClose();
                }
              }}
              disabled={selectedUser && selectedUser.account_status !== 'active'}
            >
              <ListItemIcon>
                <PersonOffIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Deactivate" />
            </MenuItem>
          </Menu>

          {/* Modal for user details - improved UI */}
          <Modal
            open={modalOpen}
            onClose={handleModalClose}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              p: { xs: 1, sm: 2 },
            }}
          >
            <Paper
              sx={{
                p: 0,
                width: '100%',
                maxWidth: { xs: 380, sm: 600, md: 800, lg: 1000 },
                minWidth: { xs: '95vw', sm: 400, md: 600 },
                mx: 'auto',
                outline: 'none',
                borderRadius: 4,
                boxShadow: 8,
                maxHeight: { xs: '98vh', sm: '95vh' },
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box sx={{ bgcolor: '#22347a', color: '#fff', px: { xs: 2, sm: 4 }, py: 2, borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
                <Typography variant="h6" fontWeight={700}>User Details</Typography>
              </Box>
              <Box sx={{ px: { xs: 2, sm: 4 }, py: 3, bgcolor: '#f8fafd', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }}>
                {selectedUser && (
                  <Box>
                    {/* Group 1: Account Info */}
                    <Box mb={2} sx={{ background: '#e3eafc', borderRadius: 2, p: 2 }}>
                      <Typography fontWeight={600} color="primary" mb={1}>Account Information</Typography>
                      <Box display="flex" gap={2} mb={1}>
                        <Box flex={1}>
                          <Typography variant="body2" color="text.secondary">Email</Typography>
                          <Typography fontWeight={500}>{selectedUser.email || <span style={{color:'#aaa'}}>N/A</span>}</Typography>
                        </Box>
                        <Box flex={1}>
                          <Typography variant="body2" color="text.secondary">Role</Typography>
                          <Typography fontWeight={500}>
                            {(() => {
                              const roleMap = {
                                R02: 'Executive',
                                R03: 'Head-Office Level Checker',
                                R04: 'Site-Level Checker',
                                R05: 'Encoder',
                              };
                              if (!selectedUser.account_role) return <span style={{color:'#aaa'}}>N/A</span>;
                              const code = selectedUser.account_role;
                              return `${roleMap[code] || code} (${code})`;
                            })()}
                          </Typography>
                        </Box>
                      </Box>
                      <Box display="flex" gap={2}>
                        <Box flex={1}>
                          <Typography variant="body2" color="text.secondary">Company</Typography>
                          <Typography fontWeight={500}>
                            {(() => {
                              if (!selectedUser.company_id) return <span style={{color:'#aaa'}}>N/A</span>;
                              const name = companyIdToName[selectedUser.company_id];
                              return name ? `${name} (${selectedUser.company_id})` : selectedUser.company_id;
                            })()}
                          </Typography>
                        </Box>
                        <Box flex={1}>
                          <Typography variant="body2" color="text.secondary">Power Plant</Typography>
                          <Typography fontWeight={500}>
                            {(() => {
                              if (!selectedUser.power_plant_id) return <span style={{color:'#aaa'}}>N/A</span>;
                              const site = plantIdToSiteName[selectedUser.power_plant_id];
                              return site ? `${site} (${selectedUser.power_plant_id})` : selectedUser.power_plant_id;
                            })()}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    {/* Group 2: Personal Info */}
                    <Box mb={2} sx={{ background: '#f7fbe7', borderRadius: 2, p: 2 }}>
                      <Typography fontWeight={600} color="primary" mb={1}>Personal Information</Typography>
                      <Box display="flex" gap={2} mb={1}>
                        <Box flex={1}>
                          <Typography variant="body2" color="text.secondary">First Name</Typography>
                          <Typography fontWeight={500}>{selectedUser.first_name || <span style={{color:'#aaa'}}>N/A</span>}</Typography>
                        </Box>
                        <Box flex={1}>
                          <Typography variant="body2" color="text.secondary">Middle Name</Typography>
                          <Typography fontWeight={500}>{selectedUser.middle_name || <span style={{color:'#aaa'}}>N/A</span>}</Typography>
                        </Box>
                        <Box flex={1}>
                          <Typography variant="body2" color="text.secondary">Last Name</Typography>
                          <Typography fontWeight={500}>{selectedUser.last_name || <span style={{color:'#aaa'}}>N/A</span>}</Typography>
                        </Box>
                        <Box flex={1}>
                          <Typography variant="body2" color="text.secondary">Suffix</Typography>
                          <Typography fontWeight={500}>{selectedUser.suffix || <span style={{color:'#aaa'}}>N/A</span>}</Typography>
                        </Box>
                      </Box>
                      <Box display="flex" gap={2}>
                        <Box flex={2}>
                          <Typography variant="body2" color="text.secondary">Gender</Typography>
                          <Typography fontWeight={500}>{selectedUser.gender || <span style={{color:'#aaa'}}>N/A</span>}</Typography>
                        </Box>
                        <Box flex={2}>
                          <Typography variant="body2" color="text.secondary">Birthdate</Typography>
                          <Typography fontWeight={500}>{selectedUser.birthdate || <span style={{color:'#aaa'}}>N/A</span>}</Typography>
                        </Box>
                      </Box>
                    </Box>
                    {/* Group 3: Contact & Other Info */}
                    <Box mb={2} sx={{ background: '#fceee7', borderRadius: 2, p: 2 }}>
                      <Typography fontWeight={600} color="primary" mb={1}>Contact & Other Details</Typography>
                      <Box display="flex" gap={2} mb={1}>
                        <Box flex={1}>
                          <Typography variant="body2" color="text.secondary">Contact Number</Typography>
                          <Typography fontWeight={500}>
                            {(() => {
                              const val = selectedUser.contact_number;
                              if (!val) return <span style={{color:'#aaa'}}>N/A</span>;
                              const str = String(val).replace(/[^0-9]/g, '');
                              if (str.length === 11 && str.startsWith('09')) {
                                return `${str.slice(0,4)}-${str.slice(4,7)}-${str.slice(7,11)}`;
                              } else if (str.length === 10 && str.startsWith('9')) {
                                return `0${str.slice(0,3)}-${str.slice(3,6)}-${str.slice(6,10)}`;
                              } else {
                                return str;
                              }
                            })()}
                          </Typography>
                        </Box>
                        <Box flex={1}>
                          <Typography variant="body2" color="text.secondary">Address</Typography>
                          <Typography fontWeight={500}>{selectedUser.address || <span style={{color:'#aaa'}}>N/A</span>}</Typography>
                        </Box>
                      </Box>
                      <Box display="flex" gap={2}>
                        <Box flex={1}>
                          <Typography variant="body2" color="text.secondary">Emp ID</Typography>
                          <Typography fontWeight={500}>{selectedUser.emp_id || <span style={{color:'#aaa'}}>N/A</span>}</Typography>
                        </Box>
                        <Box flex={1}>
                          <Typography variant="body2" color="text.secondary">Status</Typography>
                          <Typography fontWeight={600} color={selectedUser.account_status?.toLowerCase() === 'active' ? 'success.main' : 'error.main'}>
                            {selectedUser.account_status ? (selectedUser.account_status.charAt(0).toUpperCase() + selectedUser.account_status.slice(1)) : <span style={{color:'#aaa'}}>N/A</span>}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Box display="flex" justifyContent="flex-end" mt={3}>
                      <Button variant="contained" color="primary" onClick={handleModalClose} sx={{ minWidth: 100, fontWeight: 600, fontSize: 16 }}>
                        Close
                      </Button>
                    </Box>
                  </Box>
                )}
              </Box>
            </Paper>
          </Modal>

          <Box display="flex" justifyContent="flex-start" alignItems="center" px={2} mt={1}>
            <Typography variant="body2" color="textSecondary">
              Showing {filteredData.length} {filteredData.length === 1 ? "user" : "users"}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default UserManagement;
