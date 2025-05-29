import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

// Import icons and logos with corrected paths
import PetroDashLogo from "../assets/petrodashlogo.png";
import PetroEnergyLogo from "../assets/PetroEnergy_Logo.png";
import DashboardIcon from "../assets/Icons/dashboard.svg";
import EnergyIcon from "../assets/Icons/energy.svg";
import EconomicsIcon from "../assets/Icons/economics.svg";
import EnvironmentIcon from "../assets/Icons/environment.svg";
import SocialIcon from "../assets/Icons/social.svg";
import ProfileIcon from "../assets/Icons/profile.svg";
import LogoutIcon from "../assets/Icons/logout.svg";

function SideBar({ collapsed: collapsedProp = false }) {
  // Sidebar expands on hover, collapses on mouse leave
  const [collapsed, setCollapsed] = useState(true);
  const navigate = useNavigate();

  // Navigation items
  const navItems = [
    { label: "Energy", icon: EnergyIcon, to: "/energy" },
    { label: "Economics", icon: EconomicsIcon, to: "/economic" },
    { label: "Environment", icon: EnvironmentIcon, to: "/environment" },
    { label: "Social", icon: SocialIcon, to: "/social" },
  ];

  return (
    <Box
      sx={{
        width: collapsed ? 72 : 240,
        bgcolor: "#fff",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        borderRight: "1px solid #eee",
        transition: "width 0.35s cubic-bezier(.4,0,.2,1)",
        boxShadow: "4px 0 12px 0 rgba(44,62,80,0.22)", // OUTER shadow, always visible
        position: "relative",
        overflowX: "hidden",
        zIndex: 100,
      }}
      onMouseEnter={() => setCollapsed(false)}
      onMouseLeave={() => setCollapsed(true)}
    >
      {/* Top Section: Logos and Dashboard */}
      <Box>
        {/* Logos */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            pt: collapsed ? 2 : 3,
            pb: 1,
            transition: "padding 0.3s",
          }}
        >
          <img
            src={PetroDashLogo}
            alt="PetroDash"
            style={{
              width: collapsed ? 44 : 100,
              marginBottom: collapsed ? 8 : 4,
              marginTop: 10,
              transition: "width 0.35s cubic-bezier(.4,0,.2,1), margin 0.2s, opacity 0.3s",
              opacity: 1,
            }}
          />
          <div
            style={{
              maxHeight: collapsed ? 0 : 60,
              overflow: "hidden",
              transition: "max-height 0.35s cubic-bezier(.4,0,.2,1), opacity 0.3s",
              opacity: collapsed ? 0 : 1,
              width: "100%",
              display: "flex",
              justifyContent: "center",
            }}
          >
            {!collapsed && (
              <img
                src={PetroEnergyLogo}
                alt="PetroEnergy"
                style={{
                  width: 190,
                  marginBottom: 16,
                  marginTop: 2,
                  transition: "opacity 0.4s cubic-bezier(.4,0,.2,1), transform 0.4s cubic-bezier(.4,0,.2,1)",
                  opacity: collapsed ? 0 : 1,
                  transform: collapsed ? "scale(0.95)" : "scale(1)",
                }}
              />
            )}
          </div>
        </Box>
        {/* Dashboard Button */}
        <Box sx={{ px: collapsed ? 1 : 3, mb: 2, mt: 2, transition: "padding 0.3s" }}>
          <Link to="/dashboard" style={{ textDecoration: "none" }}>
            <Button
              fullWidth
              variant="contained"
              sx={{
                bgcolor: collapsed ? "transparent" : "#1a3365",
                color: "#fff",
                borderRadius: 999,
                height: 40,
                fontWeight: 600,
                fontSize: collapsed ? 0 : 16,
                justifyContent: "center",
                textAlign: "center",
                pl: 0,
                minWidth: 0,
                boxShadow: collapsed ? "none" : undefined,
                "&:hover": { bgcolor: collapsed ? "transparent" : "#162a52" },
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                transition: "font-size 0.35s cubic-bezier(.4,0,.2,1), background 0.2s",
                p: 0,
                ...(collapsed && { justifyContent: "center", alignItems: "center" }),
              }}
            >
              {collapsed ? (
                <img
                  src={DashboardIcon}
                  alt="Dashboard"
                  style={{
                    width: 32,
                    height: 32,
                    display: "block",
                    margin: "0 auto",
                    filter:
                      // This filter makes the icon #182959 (dark blue)
                      "brightness(0) saturate(100%) invert(17%) sepia(24%) saturate(1877%) hue-rotate(191deg) brightness(97%) contrast(92%)",
                  }}
                />
              ) : (
                "DASHBOARD"
              )}
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
                  justifyContent: collapsed ? "center" : "flex-start",
                  px: collapsed ? 0 : 4,
                  py: 1.5,
                  gap: collapsed ? 0 : 2,
                  cursor: "pointer",
                  transition: "background 0.25s, color 0.25s, padding 0.35s cubic-bezier(.4,0,.2,1)",
                  "&:hover": {
                    bgcolor: "#2B8C37",
                  },
                  "&:hover span": {
                    color: "#fff",
                    fontWeight: 700,
                  },
                  "&:hover img": {
                    filter:
                      "brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%)",
                  },
                }}
              >
                <img
                  src={item.icon}
                  alt={item.label}
                  style={{
                    width: 28,
                    height: 28,
                    transition: "filter 0.2s, margin 0.3s",
                    marginLeft: 0,
                    marginRight: 0,
                  }}
                />
                {collapsed ? null : (
                  <span
                    style={{
                      fontSize: 18,
                      transition: "color 0.2s, font-weight 0.2s, opacity 0.3s, margin 0.3s",
                      opacity: 1,
                      marginLeft: 4,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.label}
                  </span>
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
            justifyContent: collapsed ? "center" : "flex-start",
            px: collapsed ? 0 : 4,
            py: 1.5,
            gap: collapsed ? 0 : 2,
            cursor: "pointer",
            transition: "padding 0.35s cubic-bezier(.4,0,.2,1)",
            "&:hover": { bgcolor: "#f5f5f5" },
            "&:hover span": {
              fontWeight: 700,
              textDecoration: "underline",
            },
            "&:hover img": {
              filter:
                "brightness(0) saturate(100%) invert(41%) sepia(97%) saturate(469%) hue-rotate(83deg) brightness(93%) contrast(92%)",
              // #2B8C37 green for icons on hover
            },
          }}
        >
          <img
            src={ProfileIcon}
            alt="Profile"
            style={{
              width: 28,
              height: 28,
              transition: "margin 0.3s, filter 0.2s",
              marginLeft: 0,
              marginRight: 0,
            }}
          />
          {collapsed ? null : (
            <span
              style={{
                fontSize: 18,
                color: "#1a3365",
                transition: "font-weight 0.2s, text-decoration 0.2s, opacity 0.3s, margin 0.3s",
                opacity: 1,
                marginLeft: 4,
                whiteSpace: "nowrap",
              }}
            >
              My Profile
            </span>
          )}
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            px: collapsed ? 0 : 4,
            py: 1.5,
            gap: collapsed ? 0 : 2,
            cursor: "pointer",
            transition: "padding 0.35s cubic-bezier(.4,0,.2,1)",
            "&:hover": { bgcolor: "#f5f5f5" },
            "&:hover span": {
              fontWeight: 700,
              textDecoration: "underline",
            },
            "&:hover img": {
              filter:
                "brightness(0) saturate(100%) invert(41%) sepia(97%) saturate(469%) hue-rotate(83deg) brightness(93%) contrast(92%)",
              // #2B8C37 green for icons on hover
            },
          }}
          onClick={() => {
            // Add logout logic here if needed
            navigate("/login");
          }}
        >
          <img
            src={LogoutIcon}
            alt="Logout"
            style={{
              width: 28,
              height: 28,
              transition: "margin 0.3s, filter 0.2s",
              marginLeft: 0,
              marginRight: 0,
            }}
          />
          {collapsed ? null : (
            <span
              style={{
                fontSize: 18,
                color: "#1a3365",
                transition: "font-weight 0.2s, text-decoration 0.2s, opacity 0.3s, margin 0.3s",
                opacity: 1,
                marginLeft: 4,
                whiteSpace: "nowrap",
              }}
            >
              Log Out
            </span>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default SideBar;