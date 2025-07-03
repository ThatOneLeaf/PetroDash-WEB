import React from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../contexts/AuthContext";
import { Box, Typography, Avatar, Button, Grid, Paper } from "@mui/material";

const links = [
  { to: "/user-management", label: "User Management" },
  { to: "/economic", label: "Economic Dashboard" },
  { to: "/environment/energy", label: "Environment Energy" },
  { to: "/environment/water", label: "Environment Water" },
  { to: "/environment/waste", label: "Environment Waste" },
  { to: "/environment/air", label: "Environment Air" },
  { to: "/environment/care", label: "Environment Care" },
  { to: "/energy", label: "Power Dashboard" },
  { to: "/social/hrdashboard", label: "HR Dashboard" },
  { to: "/social/help-dash", label: "HELP Dashboard" },
  { to: "/profile", label: "Profile" },
];

const AdminLanding = () => {
  const { user } = useAuth() || {};

  return (
    <Box className="app" sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#f4f6fa" }}>
      <Sidebar />
      <Box
        component="main"
        sx={{
          flex: 1,
          p: 3,
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            width: "100%",
            maxWidth: 700,
            mt: 2,
            p: 3,
            borderRadius: 3,
            textAlign: "center",
          }}
        >
          <Typography variant="h4" color="primary" fontWeight={700} mb={2}>
            Welcome, Admin!
          </Typography>

          {user && (
            <Box
              display="flex"
              alignItems="center"
              gap={3}
              bgcolor="#f5f7fb"
              borderRadius={2}
              p={2.5}
              mb={3}
              mx="auto"
              maxWidth={420}
              boxShadow={1}
            >
              <Avatar
                src={user.avatarUrl || "/vite.svg"}
                alt="User Avatar"
                sx={{
                  width: 64,
                  height: 64,
                  border: "2px solid #1976d2",
                  bgcolor: "#fff",
                }}
              />
              <Box textAlign="left" color="#222" fontSize={16}>
                <div>
                  <strong style={{ color: "#1976d2" }}>Name:</strong>{" "}
                  {user.name || user.username || "Admin"}
                </div>
                <div>
                  <strong style={{ color: "#1976d2" }}>Email:</strong>{" "}
                  {user.email || "-"}
                </div>
                <div>
                  <strong style={{ color: "#1976d2" }}>Role:</strong>{" "}
                  {user.role || "Admin"}
                </div>
              </Box>
            </Box>
          )}

          <Typography color="#444" mb={4} fontSize={18}>
            Access administrative dashboards and management tools below:
          </Typography>

          <Grid container spacing={2} justifyContent="center">
            {links.map((link) => (
              <Grid item key={link.to}>
                <Button
                  component={Link}
                  to={link.to}
                  variant="contained"
                  color="primary"
                  sx={{
                    borderRadius: 2,
                    px: 4,
                    py: 1.5,
                    fontWeight: 500,
                    fontSize: 16,
                    boxShadow: 1,
                  }}
                >
                  {link.label}
                </Button>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Box>
    </Box>
  );
};

export default AdminLanding;
