import React from "react";
import { Link, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

// Import icons and logos with corrected paths
import PetroDashLogo from "../images/logo/PetroDash_Logo.png";
import DashboardIcon from "../../images/Icons/dashboard.svg";
import EnergyIcon from "../../images/Icons/energy.svg";
import EconomicsIcon from "../../images/Icons/economics.svg";
import EnvironmentIcon from "../../images/Icons/environment.svg";
import SocialIcon from "../../images/Icons/social.svg";
import ProfileIcon from "../../images/Icons/profile.svg";
import LogoutIcon from "../../images/Icons/logout.svg";

function SideBar({ collapsed = false }) {
  const navigate = useNavigate();

  // Navigation items
  const navItems = [
    {
      label: "Energy",
      icon: EnergyIcon,
      to: "/energy",
    },
    {
      label: "Economics",
      icon: EconomicsIcon,
      to: "/economic",
    },
    {
      label: "Environment",
      icon: EnvironmentIcon,
      to: "/environment",
    },
    {
      label: "Social",
      icon: SocialIcon,
      to: "/social",
    },
  ];

  return (
    <Box
      sx={{
        width: collapsed ? 80 : 240,
        bgcolor: "#fff",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        borderRight: "1px solid #eee",
        transition: "width 0.2s",
      }}
    >
      {/* Top Section: Logos and Dashboard */}
      <Box>
        {/* Logos */}
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", pt: 2 }}>
          <img
            src={PetroDashLogo}
            alt="PetroDash"
            style={{
              width: collapsed ? 36 : 80,
              marginBottom: collapsed ? 8 : 4,
              transition: "width 0.2s",
            }}
          />
          {!collapsed && (
            <img
              src={PetroEnergyLogo}
              alt="PetroEnergy"
              style={{
                width: 160,
                marginBottom: 16,
                marginTop: 2,
              }}
            />
          )}
        </Box>
        {/* Dashboard Button */}
        <Box sx={{ px: collapsed ? 1 : 3, mb: 2, mt: 2 }}>
          <Link to="/dashboard" style={{ textDecoration: "none" }}>
            <Button
              fullWidth
              variant="contained"
              sx={{
                bgcolor: "#1a3365",
                color: "#fff",
                borderRadius: 999,
                height: 40,
                fontWeight: 600,
                fontSize: collapsed ? 0 : 16,
                justifyContent: "flex-start",
                pl: collapsed ? 0 : 4,
                minWidth: 0,
                "&:hover": { bgcolor: "#162a52" },
                display: "flex",
                alignItems: "center",
                gap: 1.5,
              }}
              startIcon={
                <img
                  src={DashboardIcon}
                  alt="Dashboard"
                  style={{ width: 24, height: 24 }}
                />
              }
            >
              {!collapsed && "DASHBOARD"}
            </Button>
          </Link>
        </Box>
        {/* Navigation Items */}
        <Box>
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              style={{
                textDecoration: "none",
                color: "#1a3365",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  px: collapsed ? 0 : 4,
                  py: 1.5,
                  gap: 2,
                  cursor: "pointer",
                  "&:hover": {
                    bgcolor: "#f5f5f5",
                  },
                }}
              >
                <img
                  src={item.icon}
                  alt={item.label}
                  style={{ width: 28, height: 28 }}
                />
                {!collapsed && (
                  <span style={{ fontSize: 18, color: "#1a3365" }}>{item.label}</span>
                )}
              </Box>
            </Link>
          ))}
        </Box>
      </Box>
      {/* Bottom Section: Profile and Logout */}
      <Box sx={{ mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            px: collapsed ? 0 : 4,
            py: 1.5,
            gap: 2,
            cursor: "pointer",
            "&:hover": { bgcolor: "#f5f5f5" },
          }}
        >
          <img src={ProfileIcon} alt="Profile" style={{ width: 28, height: 28 }} />
          {!collapsed && (
            <span style={{ fontSize: 18, color: "#1a3365" }}>My Profile</span>
          )}
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            px: collapsed ? 0 : 4,
            py: 1.5,
            gap: 2,
            cursor: "pointer",
            "&:hover": { bgcolor: "#f5f5f5" },
          }}
          onClick={() => {
            // Add logout logic here if needed
            navigate("/login");
          }}
        >
          <img src={LogoutIcon} alt="Logout" style={{ width: 28, height: 28 }} />
          {!collapsed && (
            <span style={{ fontSize: 18, color: "#1a3365" }}>Log Out</span>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default SideBar;