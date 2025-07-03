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
  { key: "company_id", label: "Company ID" },
  { key: "power_plant_id", label: "Power Plant ID" },
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
          color={val?.toLowerCase() === "active" ? "success.main" : "text.secondary"}
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
  const [form, setForm] = useState(initialForm);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const rowsPerPage = 15;
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New: Company and Power Plant options
  const [companyOptions, setCompanyOptions] = useState([]);
  const [allPowerPlantOptions, setAllPowerPlantOptions] = useState([]); // all plants from API
  const [powerPlantOptions, setPowerPlantOptions] = useState([]); // filtered by company

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

  const filteredData = useMemo(() => {
    if (!searchTerm) return users;
    const lower = searchTerm.toLowerCase();
    return users.filter((row) =>
      columns.some((col) => String(row[col.key] ?? "").toLowerCase().includes(lower))
    );
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

  if (loading) {
    return <Box p={4}><Typography>Loading users...</Typography></Box>;
  }
  if (error) {
    return <Box p={4}><Typography color="error">{error}</Typography></Box>;
  }

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
                    label="Add Multiple"
                    rounded
                    color="blue"
                    onClick={() => alert("Add multiple users")}
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
        onClose={() => setAddModalOpen(false)}
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
          <Box component="form" sx={{ px: 4, py: 3, bgcolor: '#f8fafd', borderBottomLeftRadius: 16, borderBottomRightRadius: 16 }} onSubmit={async (e) => {
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
          }}>
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
                onClick={() => setAddModalOpen(false)}
                disabled={formLoading}
                sx={{ minWidth: 100, fontWeight: 600, fontSize: 16, mr: 1 }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                color="success"
                type="submit"
                disabled={formLoading}
                sx={{ minWidth: 100, fontWeight: 600, fontSize: 16 }}
              >
                {formLoading ? "Saving..." : "Save"}
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
                    label="Bulk Deactivate"
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
                // Reset password logic (placeholder)
                if (!selectedUser) return;
                const confirmed = window.confirm(`Reset password for ${selectedUser.email}?`);
                if (!confirmed) return;
                try {
                  // TODO: Replace with actual API call
                  alert(`Password reset link sent to ${selectedUser.email}`);
                  handleMenuClose();
                } catch (err) {
                  alert('Failed to reset password');
                  handleMenuClose();
                }
              }}
            >
              <ListItemIcon>
                {/* LockResetIcon from MUI */}
                <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 0 24 24" width="20" style={{ color: '#1976d2' }}><path d="M0 0h24v24H0z" fill="none"/><path d="M13 3c-4.97 0-9 4.03-9 9 0 1.64.44 3.17 1.21 4.5l-1.2 1.2c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l1.2-1.2C7.83 19.56 9.36 20 11 20c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 14c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm1-7h-2v2h2v-2zm0 4h-2v2h2v-2z"/></svg>
              </ListItemIcon>
              <ListItemText primary="Reset Password" />
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

          {/* Modal for user details */}
          <Modal open={modalOpen} onClose={handleModalClose}>
            <Paper sx={{ p: 4, maxWidth: 400, mx: 'auto', my: 8, outline: 'none' }}>
              <Typography variant="h6" mb={2}>User Details</Typography>
              {selectedUser && (
                <Box>
                  <Typography><b>Email:</b> {selectedUser.email}</Typography>
                  <Typography><b>Role:</b> {selectedUser.account_role}</Typography>
                  <Typography><b>Company ID:</b> {selectedUser.company_id}</Typography>
                  <Typography><b>Power Plant ID:</b> {selectedUser.power_plant_id}</Typography>
                  <Typography><b>First Name:</b> {selectedUser.first_name}</Typography>
                  <Typography><b>Last Name:</b> {selectedUser.last_name}</Typography>
                  <Typography><b>Middle Name:</b> {selectedUser.middle_name}</Typography>
                  <Typography><b>Suffix:</b> {selectedUser.suffix}</Typography>
                  <Typography><b>Contact Number:</b> {selectedUser.contact_number}</Typography>
                  <Typography><b>Address:</b> {selectedUser.address}</Typography>
                  <Typography><b>Birthdate:</b> {selectedUser.birthdate}</Typography>
                  <Typography><b>Gender:</b> {selectedUser.gender}</Typography>
                  <Typography><b>Status:</b> {selectedUser.account_status}</Typography>
                </Box>
              )}
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
