import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { Typography } from "@mui/material";
import AssessmentIcon from '@mui/icons-material/Assessment';
import DashboardIcon from "../assets/Icons/dashboard.svg";
import { useAuth } from "../contexts/AuthContext";

// Import icons and logos
import PetroDashLogo from "../assets/petrodashlogo.png";
import PetroEnergyLogo from "../assets/PetroEnergy_Logo.png";
import EnergyIcon from "../assets/Icons/energy.svg";
import EconomicsIcon from "../assets/Icons/economics.svg";
import EnvironmentIcon from "../assets/Icons/environment.svg";
import SocialIcon from "../assets/Icons/social.svg";
import ProfileIcon from "../assets/Icons/profile.svg";
import LogoutIcon from "../assets/Icons/logout.svg";
import DropDownIcon from "../assets/Icons/drop-down.svg";

function SideBar({ collapsed: collapsedProp = false }) {
  const { user, logout, getUserEmail, getUserRoleName, getUserRole } = useAuth();
  const [collapsed, setCollapsed] = useState(true);
  const [envOpen, setEnvOpen] = useState(false);
  const [socialOpen, setSocialOpen] = useState(false);
  const [energyOpen, setEnergyOpen] = useState(false);
  
  // Get user role for access control
  const userRole = getUserRole();
  
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isTablet = useMediaQuery(theme.breakpoints.down("lg"));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  
  // Auto-collapse on mobile and adjust behavior
  useEffect(() => {
    if (isMobile) {
      setCollapsed(true);
      setEnvOpen(false);
      setSocialOpen(false);
      setEnergyOpen(false);
    }
  }, [isMobile]);  // Determine allowed modes based on role
  const getAllowedModes = () => {
    if (userRole === 'R02') return ['dashboard']; // Dashboard only
    if (['R03', 'R04'].includes(userRole)) return ['dashboard', 'repository']; // Both modes
    if (userRole === 'R05') return ['repository']; // Repository only
    return ['dashboard']; // Default fallback
  };

  const allowedModes = getAllowedModes();
  
  const [mode, setMode] = useState(() => {
    // Read from localStorage on initial mount, but ensure it's allowed for the user role
    const savedMode = localStorage.getItem("sidebarMode") || "dashboard";
    return allowedModes.includes(savedMode) ? savedMode : allowedModes[0];
  });
  const hasModuleAccess = (label) => {
    switch (label) {
      case "Overview":
        // Dashboard is accessible to all roles (no specific role requirement in routes)
        return mode === "dashboard";
      case "Energy":
        if (mode === "dashboard") {
          // Energy dashboard: R04, R03, R02
          return ['R02', 'R03', 'R04'].includes(userRole);
        } else {
          // Energy repository: R05, R04, R03
          return ['R03', 'R04', 'R05'].includes(userRole);
        }
      case "Economic":
        if (mode === "dashboard") {
          // Economic dashboard: R05, R04, R03, R02
          return ['R02', 'R03', 'R04', 'R05'].includes(userRole);
        } else {
          // Economic repository: R05, R04, R03
          return ['R03', 'R04', 'R05'].includes(userRole);
        }
      case "Environment":
        if (mode === "dashboard") {
          // Environment dashboard: R04, R03, R02
          return ['R02', 'R03', 'R04'].includes(userRole);
        } else {
          // Environment repository: R05, R04, R03
          return ['R03', 'R04', 'R05'].includes(userRole);
        }
      case "Social":
        if (mode === "dashboard") {
          // Social dashboard varies by submodule, but generally includes R02, R03, R04, R05
          return ['R02', 'R03', 'R04', 'R05'].includes(userRole);
        } else {
          // Social repository: R05, R04, R03
          return ['R03', 'R04', 'R05'].includes(userRole);
        }
      default:
        return false;
    }
  };  // Get all navigation items with access status - always show all items
  const getAllNavItems = () => {
    const allItems = [];
    
    // Overview - only show in dashboard mode
    if (mode === "dashboard") {
      allItems.push({ 
        label: "Overview", 
        icon: AssessmentIcon, 
        to: "/dashboard",
        hasAccess: hasModuleAccess("Overview")
      });
    }
    
    // Energy - always show
    allItems.push({ 
      label: "Energy", 
      icon: EnergyIcon, 
      to: mode === "dashboard" ? "/energy" : "/energy/power-generation",
      hasAccess: hasModuleAccess("Energy")
    });
    
    // Economic - always show
    allItems.push({ 
      label: "Economic", 
      icon: EconomicsIcon, 
      to: "/economic",
      hasAccess: hasModuleAccess("Economic")
    });
    
    // Environment - always show
    allItems.push({
      label: "Environment",
      icon: EnvironmentIcon,
      to: "/environment",
      hasAccess: hasModuleAccess("Environment")
    });
    
    // Social - always show
    allItems.push({
      label: "Social",
      icon: SocialIcon,
      to: "/social",
      dropdown: [],
      hasAccess: hasModuleAccess("Social")
    });
    
    return allItems;
  };

  const navItems = getAllNavItems();

  // Helper to get correct environment dropdown based on mode
  const getEnvironmentDropdown = () => {
    if (mode === "dashboard") {
      return [
        { label: "Energy", to: "/environment/energy-dash" },
        { label: "Water", to: "/environment/water-dash" },
        { label: "Waste", to: "/environment/waste-dash" },
        { label: "Air", to: "/environment/air-dash" }, // If you have an air dashboard, else remove
        { label: "C.A.R.E", to: "/environment/care-dash" }, // If you have a care dashboard, else remove
      ];
    } else {
      return [
        { label: "Energy", to: "/environment/energy" },
        { label: "Water", to: "/environment/water" },
        { label: "Waste", to: "/environment/waste" },
        { label: "Air", to: "/environment/air" },
        { label: "C.A.R.E", to: "/environment/care" },
      ];
    }
  };

  // Helper to get correct Social dropdown based on mode
  const getSocialDropdown = () => {
    if (mode === "dashboard") {
      return [
        { label: "H.R.", to: "/social/hrdashboard" }, // DASHBOARD mode
        { label: "H.E.L.P", to: "/social/help-dash" },
        { label: "ER1-94 Fund Allocations", to: "/social/er1-94" },
      ];
    } else {
      return [
        { label: "H.R.", to: "/social/hr" }, // REPOSITORY mode
        { label: "H.E.L.P", to: "/social/help" },
        { label: "ER1-94 Fund Allocations", to: "/social/er1-94" },
      ];
    }
  };

  const isSelected = (item) =>
    item.label === "Environment"
      ? getEnvironmentDropdown().some((sub) => location.pathname.startsWith(sub.to))
      : item.label === "Social"
        ? getSocialDropdown().some((sub) => location.pathname.startsWith(sub.to))
        : item.label === "Energy"
          ? location.pathname.startsWith(item.to)
          : item.dropdown
            ? item.dropdown.some((sub) => location.pathname.startsWith(sub.to))
            : location.pathname.startsWith(item.to);

  const isDropdownSelected = (sub) => location.pathname.startsWith(sub.to);

  const isExpanded = !collapsed;

  function handleDropdownToggle(type) {
    if (type === "env") setEnvOpen((open) => !open);
    if (type === "social") setSocialOpen((open) => !open);
    if (type === "energy") setEnergyOpen((open) => !open);
  }

  // Helper to navigate to correct route for Economics
  const handleNav = (item) => {
    if (item.label === "Economic") {
      if (mode === "dashboard") {
        navigate("/economic");
      } else {
        navigate("/economic/repository");
      }
    } else {
      navigate(item.to);
    }
    setEnvOpen(false);
    setSocialOpen(false);
  };

  // Helper: map current path to dashboard/repository equivalent
  const getToggledPath = (pathname, newMode) => {
    // Overview Dashboard to Energy Repository
    if (pathname === "/dashboard" && newMode === "repository") {
      return "/energy/power-generation";
    }
    // Economics
    if (pathname.startsWith("/economic")) {
      return newMode === "dashboard" ? "/economic" : "/economic/repository";
    }
    // Energy
    if (pathname === "/energy" || pathname === "/energy/dashboard") {
      return newMode === "repository" ? "/energy/power-generation" : "/energy";
    }
    if (pathname === "/energy/power-generation") {
      return newMode === "dashboard" ? "/energy" : "/energy/power-generation";
    }
    // Environment
    if (pathname.startsWith("/environment/energy")) {
      return newMode === "dashboard" ? "/environment/energy-dash" : "/environment/energy";
    }
    if (pathname.startsWith("/environment/water")) {
      return newMode === "dashboard" ? "/environment/water-dash" : "/environment/water";
    }
    if (pathname.startsWith("/environment/waste")) {
      return newMode === "dashboard" ? "/environment/waste-dash" : "/environment/waste";
    }
    if (pathname.startsWith("/environment/air")) {
      return newMode === "dashboard" ? "/environment/air-dash" : "/environment/air";
    }
    if (pathname.startsWith("/environment/care")) {
      return newMode === "dashboard" ? "/environment/care-dash" : "/environment/care";
    }
    // Social/HR
    if (pathname.startsWith("/social/hrdashboard")) {
      return newMode === "repository" ? "/social/hr" : "/social/hrdashboard";
    }
    if (pathname.startsWith("/social/hr")) {
      return newMode === "dashboard" ? "/social/hrdashboard" : "/social/hr";
    }
    // Social/HELP
    if (
      pathname.startsWith("/social/help") ||
      pathname.startsWith("/social/help-dash")
    ) {
      return newMode === "repository" ? "/social/help" : "/social/help-dash";
    }
    if (pathname.startsWith("/social/help")) {
      return newMode === "dashboard" ? "/social/help-dash" : "/social/help";
    }
    // Add more department mappings as needed

    // Default: stay on current path
    return pathname;
  };
  // Toggle mode and navigate to correct economics page if on economics
  const handleToggleMode = () => {
    // Only allow toggle if user has access to both modes
    if (allowedModes.length <= 1) return;
    
    const newMode = mode === "dashboard" ? "repository" : "dashboard";
    
    // Ensure the new mode is allowed for this user
    if (!allowedModes.includes(newMode)) return;
    
    setMode(newMode);

    // Try to map current path to the toggled mode
    const toggledPath = getToggledPath(location.pathname, newMode);
    if (toggledPath !== location.pathname) {
      navigate(toggledPath);
    }
  };

  // Sync mode to localStorage whenever it changes
  React.useEffect(() => {
    localStorage.setItem("sidebarMode", mode);
  }, [mode]);
  // Get user details from context
  const userEmail = getUserEmail();
  const userRoleName = getUserRoleName();

  // Add state for profile image from localStorage (if any)
  const [profileImg, setProfileImg] = React.useState(() => {
    return localStorage.getItem('profileImg') || null;
  });
  // Listen for changes to profileImg in localStorage (for cross-tab sync)
  React.useEffect(() => {
    function syncProfileImg() {
      setProfileImg(localStorage.getItem('profileImg') || null);
    }
    window.addEventListener('storage', syncProfileImg);
    return () => window.removeEventListener('storage', syncProfileImg);
  }, []);
  return (
    <>
      {(isExpanded || (isMobile && !collapsed)) && (
        <Box
          onClick={() => {
            setCollapsed(true);
            setEnvOpen(false);
            setSocialOpen(false);
            setEnergyOpen(false);
          }}
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            bgcolor: isMobile ? "rgba(30,40,60,0.25)" : "rgba(30,40,60,0.18)",
            zIndex: 1299,
            opacity: 1,
            transition: "opacity 0.35s cubic-bezier(.4,0,.2,1)",
            backdropFilter: isMobile ? "blur(2px)" : "blur(1.5px)",
            display: isMobile ? (collapsed ? "none" : "block") : "block",
          }}
        />
      )}<Box
        sx={{
          width: collapsed ? (isMobile ? 56 : 72) : (isMobile ? 220 : 240),
          bgcolor: "#fff",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          borderRight: "1px solid #eee",
          transition: collapsed
            ? "none"
            : isMobile 
              ? "width 0.25s ease-in-out, left 0.25s ease-in-out, box-shadow 0.25s ease-in-out"
              : "width 0.35s cubic-bezier(.4,0,.2,1), left 0.35s cubic-bezier(.4,0,.2,1), box-shadow 0.35s cubic-bezier(.4,0,.2,1), position 0s linear 0.35s",
          boxShadow: collapsed
            ? isMobile 
              ? "2px 0 8px 0 rgba(44,62,80,0.15)"
              : "4px 0 12px 0 rgba(44,62,80,0.22)"
            : isMobile
              ? "6px 0 18px 0 rgba(44,62,80,0.25)"
              : "8px 0 24px 0 rgba(44,62,80,0.22)",
          position: collapsed ? (isMobile ? "fixed" : "sticky") : "fixed",
          top: 0,
          left: 0,
          overflowX: "hidden",
          overflowY: "auto", // Allow scrolling on mobile if content is too tall
          zIndex: collapsed ? (isMobile ? 1200 : 100) : 1300,
          pointerEvents: "auto",
          maxHeight: "100vh", // Ensure it doesn't exceed viewport height
        }}
        onMouseEnter={() => !isMobile && setCollapsed(false)}
        onMouseLeave={() => {
          if (!isMobile) {
            setCollapsed(true);
            setEnvOpen(false);
            setSocialOpen(false);
            setEnergyOpen(false);
          }
        }}
        onClick={() => {
          // On mobile, toggle sidebar when clicking anywhere
          if (isMobile && collapsed) {
            setCollapsed(false);
          }
        }}
      >        <Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              pt: collapsed ? (isMobile ? 1.5 : 2) : (isMobile ? 2 : 3),
              pb: 1,
              transition: "padding 0.3s",
              position: "relative",
            }}
          >
            {/* Mobile close button */}
            {isMobile && !collapsed && (
              <Box
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  bgcolor: "rgba(0,0,0,0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  zIndex: 10,
                  "&:hover": {
                    bgcolor: "rgba(0,0,0,0.2)",
                  },
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setCollapsed(true);
                  setEnvOpen(false);
                  setSocialOpen(false);
                  setEnergyOpen(false);
                }}
              >
                <Typography sx={{ fontSize: 18, color: "#666" }}>×</Typography>
              </Box>
            )}
            
            <img
              src={PetroDashLogo}
              alt="PetroDash"
              style={{
                width: collapsed ? (isMobile ? 36 : 44) : (isMobile ? 80 : 100),
                marginBottom: collapsed ? (isMobile ? 6 : 8) : 4,
                marginTop: isMobile ? 5 : 10,
                transition: "width 0.35s cubic-bezier(.4,0,.2,1), margin 0.2s, opacity 0.3s",
                opacity: 1,
                cursor: "pointer"
              }}
              onClick={() => navigate("/")}
            />
            <div
              style={{
                maxHeight: collapsed ? 0 : (isMobile ? 50 : 60),
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
                    width: isMobile ? 160 : 190,
                    marginBottom: isMobile ? 12 : 16,
                    marginTop: 2,
                    transition: "opacity 0.4s cubic-bezier(.4,0,.2,1), transform 0.4s cubic-bezier(.4,0,.2,1)",
                    opacity: collapsed ? 0 : 1,
                    transform: collapsed ? "scale(0.95)" : "scale(1)",
                  }}
                />
              )}
            </div>
          </Box>          {/* Dashboard/Repository Toggle Button or Icon - Always show but disable if user has limited access */}
          <Box sx={{ 
            px: collapsed ? (isMobile ? 0.5 : 1) : (isMobile ? 2 : 3), 
            mb: 2, 
            mt: 2, 
            transition: "padding 0.3s" 
          }}>
            {collapsed ? (
              <img
                src={DashboardIcon}
                alt="Dashboard"
                style={{
                  width: isMobile ? 24 : 28,
                  height: isMobile ? 24 : 28,
                  display: "block",
                  margin: "0 auto",
                  cursor: allowedModes.length > 1 ? "pointer" : "default",
                  transition: "filter 0.2s",
                  filter:
                    mode === "dashboard"
                      ? "brightness(0) saturate(100%) invert(17%) sepia(24%) saturate(1877%) hue-rotate(191deg) brightness(97%) contrast(92%)"
                      : "brightness(0) saturate(100%) invert(41%) sepia(97%) saturate(469%) hue-rotate(83deg) brightness(93%) contrast(92%)",
                }}
                onClick={allowedModes.length > 1 ? handleToggleMode : undefined}
              />
            ) : (
              <Button
                fullWidth
                variant="contained"
                sx={{
                  bgcolor: mode === "dashboard" ? "#1a3365" : "#2B8C37",
                  color: "#fff",
                  borderRadius: 999,
                  height: isMobile ? 36 : 40,
                  fontWeight: 700,
                  fontSize: isMobile ? 14 : 16,
                  minWidth: 0,
                  boxShadow: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  "&:hover": allowedModes.length > 1 ? { 
                    bgcolor: mode === "dashboard" ? "#162a52" : "#23702b" 
                  } : {},
                  transition: "all 0.2s",
                  mb: 1,
                  cursor: allowedModes.length > 1 ? "pointer" : "default",
                }}
                onClick={allowedModes.length > 1 ? handleToggleMode : undefined}
              >
                {mode === "dashboard" ? "Dashboard" : "Repository"}
              </Button>
            )}
          </Box>
          <Box
            sx={{
              bgcolor: "#fff",
              transition: "background 0.2s",
            }}
          >            {navItems.map((item) =>              item.label === "Energy" ? (
                <Box
                  key={item.label}
                  sx={{
                    position: "relative",
                  }}
                >
                  <Link
                    to={item.hasAccess ? item.to : "#"}
                    style={{
                      textDecoration: "none",
                      color: "#1a3365",
                    }}
                    onClick={(e) => {
                      if (!item.hasAccess) {
                        e.preventDefault();
                        return;
                      }
                      e.preventDefault();
                      navigate(item.to);
                      setEnergyOpen(false);
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: collapsed ? "center" : "flex-start",
                        px: collapsed ? 0 : (isMobile ? 3 : 4),
                        py: isMobile ? 1.2 : 1.5,
                        gap: collapsed ? 0 : (isMobile ? 1.5 : 2),
                        cursor: "pointer",
                        transition: "background 0.25s, color 0.25s, padding 0.35s cubic-bezier(.4,0,.2,1)",
                        bgcolor: (item.hasAccess && isSelected(item) && !collapsed)
                          ? (mode === "repository" ? "rgba(26,51,101,0.32)" : "rgba(43,140,55,0.5)")
                          : "transparent",
                        position: "relative",
                        "&::before": (item.hasAccess && isSelected(item)) ? {
                          content: '""',
                          position: "absolute",
                          left: 0,
                          top: 4,
                          bottom: 4,
                          width: isMobile ? 4 : 6,
                          background: "#000",
                          borderTopRightRadius: 12,
                          borderBottomRightRadius: 12,
                          zIndex: 2,
                        } : {},
                        "&:hover": {
                          bgcolor: mode === "repository" ? "rgba(26,51,101,0.32)" : "rgba(43,140,55,0.5)",
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
                          width: isMobile ? 24 : 28,
                          height: isMobile ? 24 : 28,
                          transition: "filter 0.2s, margin 0.3s",
                          marginLeft: 0,
                          marginRight: 0,
                          filter:
                            (isSelected(item) && !collapsed)
                              ? "brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%)"
                              : mode === "repository"
                                ? "brightness(0) saturate(100%) invert(17%) sepia(24%) saturate(1877%) hue-rotate(191deg) brightness(97%) contrast(92%)"
                                : "brightness(0) saturate(100%) invert(41%) sepia(97%) saturate(469%) hue-rotate(83deg) brightness(93%) contrast(92%)",
                        }}
                      />
                    {collapsed ? null : (
                      <span
                        style={{
                          fontSize: isMobile ? 16 : 18,
                          fontWeight: (item.hasAccess && isSelected(item) && !collapsed) ? 700 : 400,
                          color: (isSelected(item) && !collapsed) ? "#fff" : "#1a3365",
                          transition: "color 0.2s, font-weight 0.2s, opacity 0.3s, margin 0.3s",
                          opacity: 1,
                          marginLeft: isMobile ? 3 : 4,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.label}
                      </span>
                    )}
                    </Box>
                  </Link>
                </Box>              ) : item.label === "Environment" ? (
                <React.Fragment key={item.label}>
                  <Box
                    sx={{
                      position: "relative",
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
                        bgcolor:
                          ((envOpen && !collapsed)
                            ? "#2B8C37"
                            : (isSelected(item) && !collapsed)
                              ? (mode === "repository" ? "rgba(26,51,101,0.32)" : "rgba(43,140,55,0.5)")
                              : "transparent"),
                        borderRadius: (((envOpen && !collapsed) || (isSelected(item) && !collapsed))) ? 0 : undefined,
                        position: "relative",
                        "&::before": (item.hasAccess && isSelected(item)) ? {
                          content: '""',
                          position: "absolute",
                          left: 0,
                          top: 4,
                          bottom: 4,
                          width: 6,
                          background: "#000",
                          borderTopRightRadius: 12,
                          borderBottomRightRadius: 12,
                          zIndex: 2,
                        } : {},
                        "&:hover": {
                          bgcolor: mode === "repository" ? "rgba(26,51,101,0.32)" : "rgba(43,140,55,0.5)",
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
                      onClick={() => {
                        if (!item.hasAccess) return;
                        if (!collapsed) handleDropdownToggle("env");
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
                        filter:
                          (((envOpen && !collapsed) || (isSelected(item) && !collapsed))
                            ? "brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%)"
                            : mode === "repository"
                              ? "brightness(0) saturate(100%) invert(17%) sepia(24%) saturate(1877%) hue-rotate(191deg) brightness(97%) contrast(92%)"
                              : "brightness(0) saturate(100%) invert(41%) sepia(97%) saturate(469%) hue-rotate(83deg) brightness(93%) contrast(92%)")
                      }}
                    />
                    {collapsed ? null : (
                      <>
                        <span
                          style={{
                            fontSize: 18,
                            fontWeight: (envOpen || (isSelected(item) && !collapsed)) ? 700 : 400,
                            color: (envOpen || (isSelected(item) && !collapsed)) ? "#fff" : "#1a3365",
                            transition: "color 0.2s, font-weight 0.2s, opacity 0.3s, margin 0.3s",
                            opacity: 1,
                            marginLeft: 4,
                            whiteSpace: "nowrap",
                            flex: 1,
                          }}
                        >
                          {item.label}
                        </span>
                        <img
                          src={DropDownIcon}
                          alt="Expand"
                          style={{
                            width: 22,
                            height: 22,
                            marginLeft: 2,
                            transition: "transform 0.3s, filter 0.2s",
                            transform: envOpen ? "rotate(180deg)" : "rotate(0deg)",
                            filter:
                              "brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%)",
                          }}
                        />
                      </>
                    )}
                  </Box>
                  </Box>
                  {!collapsed && envOpen && item.hasAccess && (
                    <Box
                      sx={{
                        pl: 4,
                        pr: 2,
                        py: 1,
                        bgcolor: "#fff",
                        boxShadow: "0 4px 16px 0 rgba(44,62,80,0.10)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        gap: 1,
                        mb: 1,
                        borderRadius: 2,
                        border: "1px solid #e0e0e0",
                        position: "relative",
                        zIndex: 101,
                      }}
                    >
                      {getEnvironmentDropdown().map((sub) => (
                        <Link
                          key={sub.label}
                          to={sub.to}
                          style={{
                            textDecoration: "none",
                            color: "#1a3365",
                            width: "100%",
                          }}
                          onClick={() => setEnvOpen(false)}
                        >
                          <Box
                            sx={{
                              py: 0.8,
                              px: 1,
                              borderRadius: 2,
                              transition: "background 0.2s, color 0.2s, font-weight 0.2s",
                              bgcolor: isDropdownSelected(sub) ? "#182959" : "transparent",
                              color: isDropdownSelected(sub) ? "#fff" : "#1a3365",
                              fontWeight: isDropdownSelected(sub) ? 700 : 400,
                              borderLeft: isDropdownSelected(sub) ? "6px solid #182959" : "6px solid transparent",
                              borderTopRightRadius: isDropdownSelected(sub) ? 12 : 0,
                              borderBottomRightRadius: isDropdownSelected(sub) ? 12 : 0,
                              "&:hover": {
                                bgcolor: "#182959",
                                color: "#fff",
                                fontWeight: 700,
                              },
                              fontSize: 16,
                              letterSpacing: 0.2,
                              textAlign: "left",
                              width: "100%",
                            }}
                          >
                            {sub.label}
                          </Box>
                        </Link>
                      ))}
                    </Box>
                  )}
                </React.Fragment>              ) : item.label === "Social" ? (
                <React.Fragment key={item.label}>
                  <Box
                    sx={{
                      position: "relative",
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
                        bgcolor:
                          ((socialOpen && !collapsed)
                            ? "#2B8C37"
                            : (isSelected(item) && !collapsed)
                              ? (mode === "repository" ? "rgba(26,51,101,0.32)" : "rgba(43,140,55,0.5)")
                              : "transparent"),
                        borderRadius: (((socialOpen && !collapsed) || (isSelected(item) && !collapsed))) ? 0 : undefined,
                        position: "relative",
                        "&::before": (item.hasAccess && isSelected(item)) ? {
                          content: '""',
                          position: "absolute",
                          left: 0,
                          top: 4,
                          bottom: 4,
                          width: 6,
                          background: "#000",
                          borderTopRightRadius: 12,
                          borderBottomRightRadius: 12,
                          zIndex: 2,
                        } : {},
                        "&:hover": {
                          bgcolor: mode === "repository" ? "rgba(26,51,101,0.32)" : "rgba(43,140,55,0.5)",
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
                      onClick={() => {
                        if (!item.hasAccess) return;
                        if (!collapsed) handleDropdownToggle("social");
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
                          filter:
                            (((socialOpen && !collapsed) || (isSelected(item) && !collapsed))
                              ? "brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%)"
                              : mode === "repository"
                                ? "brightness(0) saturate(100%) invert(17%) sepia(24%) saturate(1877%) hue-rotate(191deg) brightness(97%) contrast(92%)"
                                : "brightness(0) saturate(100%) invert(41%) sepia(97%) saturate(469%) hue-rotate(83deg) brightness(93%) contrast(92%)")
                        }}
                      />
                      {collapsed ? null : (
                        <>
                          <span
                            style={{
                              fontSize: 18,
                              fontWeight: (socialOpen || (isSelected(item) && !collapsed)) ? 700 : 400,
                              color: (socialOpen || (isSelected(item) && !collapsed)) ? "#fff" : "#1a3365",
                              transition: "color 0.2s, font-weight 0.2s, opacity 0.3s, margin 0.3s",
                              opacity: 1,
                              marginLeft: 4,
                              whiteSpace: "nowrap",
                              flex: 1,
                            }}
                          >
                            {item.label}
                          </span>
                          <img
                            src={DropDownIcon}
                            alt="Expand"
                            style={{
                              width: 22,
                              height: 22,
                              marginLeft: 2,
                              transition: "transform 0.3s, filter 0.2s",
                              transform: socialOpen ? "rotate(180deg)" : "rotate(0deg)",
                              filter:
                                "brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%)",
                            }}
                          />
                        </>
                      )}
                    </Box>
                  </Box>
                  {!collapsed && socialOpen && item.hasAccess && (
                    <Box
                      sx={{
                        pl: 4,
                        pr: 2,
                        py: 1,
                        bgcolor: "#fff",
                        boxShadow: "0 4px 16px 0 rgba(44,62,80,0.10)",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        gap: 1,
                        border: "1px solid #e0e0e0",
                        position: "relative",
                        zIndex: 101,
                      }}
                    >
                      {getSocialDropdown().map((sub) => (
                        <Link
                          key={sub.label}
                          to={sub.to}
                          style={{
                            textDecoration: "none",
                            color: "#1a3365",
                            width: "100%",
                          }}
                          onClick={() => setSocialOpen(false)}
                        >
                          <Box
                            sx={{
                              py: 0.8,
                              px: 1,
                              borderRadius: 2,
                              transition: "background 0.2s, color 0.2s, font-weight 0.2s",
                              bgcolor: isDropdownSelected(sub) ? "#182959" : "transparent",
                              color: isDropdownSelected(sub) ? "#fff" : "#1a3365",
                              fontWeight: isDropdownSelected(sub) ? 700 : 400,
                              borderLeft: isDropdownSelected(sub) ? "6px solid #182959" : "6px solid transparent",
                              borderTopRightRadius: isDropdownSelected(sub) ? 12 : 0,
                              borderBottomRightRadius: isDropdownSelected(sub) ? 12 : 0,
                              "&:hover": {
                                bgcolor: "#182959",
                                color: "#fff",
                                fontWeight: 700,
                              },
                              fontSize: 16,
                              letterSpacing: 0.2,
                              textAlign: "left",
                              width: "100%",
                            }}
                          >
                            {sub.label}
                          </Box>
                        </Link>
                      ))}
                    </Box>
                  )}
                </React.Fragment>) : (
                <Box
                  key={item.label}
                  sx={{
                    position: "relative",
                    opacity: item.hasAccess ? 1 : 0.4,
                    cursor: item.hasAccess ? "pointer" : "not-allowed",
                    pointerEvents: item.hasAccess ? "auto" : "none"
                  }}
                >
                  <Link
                    to={item.hasAccess ? item.to : "#"}
                    style={{
                      textDecoration: "none",
                      color: item.hasAccess ? "#1a3365" : "#9e9e9e",
                    }}
                    onClick={(e) => {
                      if (!item.hasAccess) {
                        e.preventDefault();
                        return;
                      }
                      e.preventDefault();
                      handleNav(item);
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
                        cursor: item.hasAccess ? "pointer" : "not-allowed",
                        transition: "background 0.25s, color 0.25s, padding 0.35s cubic-bezier(.4,0,.2,1)",
                        bgcolor: (item.hasAccess && isSelected(item) && !collapsed)
                          ? (mode === "repository" ? "rgba(26,51,101,0.32)" : "rgba(43,140,55,0.5)")
                          : "transparent",
                        position: "relative",
                        "&::before": (item.hasAccess && isSelected(item)) ? {
                          content: '""',
                          position: "absolute",
                          left: 0,
                          top: 4,
                          bottom: 4,
                          width: 6,
                          background: "#000",
                          borderTopRightRadius: 12,
                          borderBottomRightRadius: 12,
                          zIndex: 2,
                        } : {},                        "&:hover": item.hasAccess ? {
                          bgcolor: mode === "repository" ? "rgba(26,51,101,0.32)" : "rgba(43,140,55,0.5)",
                        } : {},
                        "&:hover span": item.hasAccess ? {
                          color: "#fff",
                          fontWeight: 700,
                        } : {},
                        "&:hover img, &:hover .overview-icon": item.hasAccess ? {
                          filter:
                            "brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%)",
                        } : {},
                      }}
                    >
                      {/* Use AssessmentIcon for Overview, otherwise use img */}
                      {item.label === "Overview" ? (
                        <AssessmentIcon
                          className="overview-icon"
                          sx={{
                            width: 28,
                            height: 28,
                            color: item.hasAccess ?
                              ((isSelected(item) && !collapsed)
                                ? "#fff"
                                : mode === "repository"
                                  ? "#1a3365"
                                  : "#2B8C37") : "#9e9e9e",
                            transition: "color 0.2s",
                          }}
                        />
                      ) : (
                        <img
                          src={item.icon}
                          alt={item.label}
                          style={{
                            width: 28,
                            height: 28,
                            transition: "filter 0.2s, margin 0.3s",
                            marginLeft: 0,
                            marginRight: 0,                            filter: item.hasAccess ?
                              ((isSelected(item) && !collapsed)
                                ? "brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%)"
                                : mode === "repository"
                                  ? "brightness(0) saturate(100%) invert(17%) sepia(24%) saturate(1877%) hue-rotate(191deg) brightness(97%) contrast(92%)"
                                  : "brightness(0) saturate(100%) invert(41%) sepia(97%) saturate(469%) hue-rotate(83deg) brightness(93%) contrast(92%)")
                              : "brightness(0) saturate(100%) invert(50%)", // Grayscale for disabled
                          }}
                        />
                      )}
                      {collapsed ? null : (
                        <span
                          style={{
                            fontSize: 18,
                            fontWeight: (item.hasAccess && isSelected(item) && !collapsed) ? 700 : 400,
                            color: item.hasAccess ?
                              ((isSelected(item) && !collapsed) ? "#fff" : "#1a3365") :
                              "#9e9e9e",
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
                  {!item.hasAccess && !collapsed && (
                    <span style={{ 
                      position: "absolute", 
                      right: 16, 
                      top: "50%", 
                      transform: "translateY(-50%)", 
                      fontSize: 12 
                    }}>
                      🔒
                    </span>
                  )}
                </Box>
              )
            )}
          </Box>
        </Box>        <Box sx={{ mb: isMobile ? 2 : 3 }}>
          {/* User Info with Icon (icon above credentials) */}
          <Box
            component={Link}
            to="/profile"
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              px: collapsed ? 0 : (isMobile ? 3 : 4),
              py: isMobile ? 1.2 : 1.5,
              mb: 1,
              mt: 2,
              bgcolor: collapsed ? 'transparent' : '#f8f9fa', // Remove bg when collapsed
              borderRadius: 2,
              transition: 'background 0.2s, padding 0.2s',
            }}
          >
            <img
              src={profileImg || ProfileIcon}
              alt="Account"
              style={{
                width: isMobile ? 28 : 32,
                height: isMobile ? 28 : 32,
                marginBottom: !collapsed ? (isMobile ? 4 : 6) : 0,
                opacity: 0.85,
                borderRadius: "50%",
                border: profileImg ? "2px solid #388E3C" : undefined,
                objectFit: "cover",
                background: 'transparent',
                filter: !profileImg ? 'brightness(0) saturate(100%) invert(18%) sepia(16%) saturate(1162%) hue-rotate(186deg) brightness(90%) contrast(97%)' : undefined,
              }}
            />
            {!collapsed && (
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: "#1a3365", 
                    fontWeight: 600, 
                    textAlign: "center",
                    fontSize: isMobile ? 11 : 14,
                    lineHeight: 1.2
                  }}
                >
                  {userEmail}
                </Typography>
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: "#6c757d", 
                    fontSize: isMobile ? 10 : 12, 
                    fontWeight: 500, 
                    textAlign: "center" 
                  }}
                >
                  {userRoleName}
                </Typography>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: collapsed ? "center" : "flex-start",
              px: collapsed ? 0 : (isMobile ? 3 : 4),
              py: isMobile ? 1.2 : 1.5,
              gap: collapsed ? 0 : (isMobile ? 1.5 : 2),
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
              },
            }}
            onClick={() => {
              logout();
            }}
          >
            <img
              src={LogoutIcon}
              alt="Logout"
              style={{
                width: isMobile ? 24 : 28,
                height: isMobile ? 24 : 28,
                transition: "margin 0.3s, filter 0.2s",
                marginLeft: 0,
                marginRight: 0,
              }}
            />
            {collapsed ? null : (
              <span
                style={{
                  fontSize: isMobile ? 16 : 18,
                  color: "#1a3365",
                  transition: "font-weight 0.2s, text-decoration 0.2s, opacity 0.3s, margin 0.3s",
                  opacity: 1,
                  marginLeft: isMobile ? 3 : 4,
                  whiteSpace: "nowrap",
                }}
              >
                Log Out
              </span>
            )}
          </Box>
        </Box>
      </Box>
    </>
  );
}

export default SideBar;