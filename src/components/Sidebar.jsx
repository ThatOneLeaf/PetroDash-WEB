import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import AssessmentIcon from '@mui/icons-material/Assessment';
import DashboardIcon from "../assets/Icons/dashboard.svg";

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
  const [collapsed, setCollapsed] = useState(true);
  const [envOpen, setEnvOpen] = useState(false);
  const [socialOpen, setSocialOpen] = useState(false);
  const [energyOpen, setEnergyOpen] = useState(false);
  const [mode, setMode] = useState(() => {
    // Read from localStorage on initial mount
    return localStorage.getItem("sidebarMode") || "dashboard";
  });

  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  useMediaQuery(theme.breakpoints.down("sm")); // isMobile not used

  // Only show Overview tab in dashboard mode
  const navItems = [
    ...(mode === "dashboard"
      ? [{ label: "Overview", icon: AssessmentIcon, to: "/dashboard" }]
      : []),
    { 
      label: "Energy", 
      icon: EnergyIcon, 
      to: "/energy", // default
      dropdown: [
        { label: "Energy KPIS", to: "/energy" },
        { label: "Energy Dashboard", to: "/energy/dashboard" }
      ],
      repository: { label: "Energy", to: "/energy/power-generation" }
    },
    { label: "Economic", icon: EconomicsIcon, to: "/economic" },
    {
      label: "Environment",
      icon: EnvironmentIcon,
      to: "/environment",
    },
    {
      label: "Social",
      icon: SocialIcon,
      to: "/social",
      dropdown: [
        // HR dropdown will be generated dynamically below
      ],
    },
  ];

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
        { label: "H.E.L.P", to: "/social/help-dash" },
        { label: "ER1-94 Fund Allocations", to: "/social/er1-94" },
      ];
    }
  };

  // Helper to get correct Energy dropdown based on mode
  const getEnergyDropdown = () => {
    if (mode === "dashboard") {
      return [
        { label: "Energy KPIS", to: "/energy" },
        { label: "Energy Dashboard", to: "/energy/dashboard" }
      ];
    } else {
      return [
        { label: "Energy Repository", to: "/energy/power-generation" }
      ];
    }
  };

  const isSelected = (item) =>
    item.label === "Environment"
      ? getEnvironmentDropdown().some((sub) => location.pathname.startsWith(sub.to))
      : item.label === "Social"
        ? getSocialDropdown().some((sub) => location.pathname.startsWith(sub.to))
        : item.label === "Energy"
          ? getEnergyDropdown().some((sub) => location.pathname.startsWith(sub.to))
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
    const newMode = mode === "dashboard" ? "repository" : "dashboard";
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

  return (
    <>
      {isExpanded && (
        <Box
          onClick={() => setCollapsed(true)}
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            bgcolor: "rgba(30,40,60,0.18)",
            zIndex: 1299,
            opacity: 1,
            transition: "opacity 0.35s cubic-bezier(.4,0,.2,1)",
            backdropFilter: "blur(1.5px)",
          }}
        />
      )}
      <Box
        sx={{
          width: collapsed ? 72 : 240,
          bgcolor: "#fff",
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          borderRight: "1px solid #eee",
          transition: "width 0.35s cubic-bezier(.4,0,.2,1), left 0.35s cubic-bezier(.4,0,.2,1), box-shadow 0.35s cubic-bezier(.4,0,.2,1), position 0s linear 0.35s",
          boxShadow: collapsed
            ? "4px 0 12px 0 rgba(44,62,80,0.22)"
            : "8px 0 24px 0 rgba(44,62,80,0.22)",
          position: collapsed ? "sticky" : "fixed",
          top: 0,
          left: 0,
          overflowX: "hidden",
          zIndex: collapsed ? 100 : 1300,
          pointerEvents: "auto",
        }}
        onMouseEnter={() => setCollapsed(false)}
        onMouseLeave={() => {
          setCollapsed(true);
          setEnvOpen(false);
          setSocialOpen(false);
          setEnergyOpen(false);
        }}
      >
        <Box>
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
                cursor: "pointer"
              }}
              onClick={() => navigate("/")}
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
          {/* Dashboard/Repository Toggle Button or Icon */}
          <Box sx={{ px: collapsed ? 1 : 3, mb: 2, mt: 2, transition: "padding 0.3s" }}>
            {collapsed ? (
              <img
                src={DashboardIcon}
                alt="Dashboard"
                style={{
                  width: 28,
                  height: 28,
                  display: "block",
                  margin: "0 auto",
                  cursor: "pointer",
                  transition: "filter 0.2s",
                  filter:
                    mode === "dashboard"
                      ? "brightness(0) saturate(100%) invert(17%) sepia(24%) saturate(1877%) hue-rotate(191deg) brightness(97%) contrast(92%)"
                      : "brightness(0) saturate(100%) invert(41%) sepia(97%) saturate(469%) hue-rotate(83deg) brightness(93%) contrast(92%)",
                }}
                onClick={handleToggleMode}
              />
            ) : (
              <Button
                fullWidth
                variant="contained"
                sx={{
                  bgcolor: mode === "dashboard" ? "#1a3365" : "#2B8C37",
                  color: "#fff",
                  borderRadius: 999,
                  height: 40,
                  fontWeight: 700,
                  fontSize: 16,
                  minWidth: 0,
                  boxShadow: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  "&:hover": { bgcolor: mode === "dashboard" ? "#162a52" : "#23702b" },
                  transition: "all 0.2s",
                  mb: 1,
                }}
                onClick={handleToggleMode}
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
          >
            {navItems.map((item) =>
              item.label === "Energy" ? (
                mode === "dashboard" ? (
                  // DASHBOARD MODE: Energy is a dropdown styled like Environment
                  <React.Fragment key={item.label}>
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
                          (energyOpen && !collapsed)
                            ? "#2B8C37"
                            : (isSelected(item) && !collapsed)
                              ? "rgba(43,140,55,0.5)"
                              : "transparent",
                        borderRadius: (energyOpen && !collapsed) || (isSelected(item) && !collapsed) ? 0 : undefined,
                        position: "relative",
                        "&::before": isSelected(item) ? {
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
                          bgcolor: "rgba(43,140,55,0.5)",
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
                        if (!collapsed) handleDropdownToggle("energy");
                        else {
                          navigate("/energy");
                        }
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
                            ((energyOpen && !collapsed) || (isSelected(item) && !collapsed))
                              ? "brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%)"
                              : "brightness(0) saturate(100%) invert(41%) sepia(97%) saturate(469%) hue-rotate(83deg) brightness(93%) contrast(92%)",
                        }}
                      />
                      {collapsed ? null : (
                        <>
                          <span
                            style={{
                              fontSize: 18,
                              fontWeight: (energyOpen || (isSelected(item) && !collapsed)) ? 700 : 400,
                              color: (energyOpen || (isSelected(item) && !collapsed)) ? "#fff" : "#1a3365",
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
                              transform: energyOpen ? "rotate(180deg)" : "rotate(0deg)",
                              filter: "brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%)",
                            }}
                          />
                        </>
                      )}
                    </Box>
                    {!collapsed && energyOpen && (
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
                          transition: "all 0.3s cubic-bezier(.4,0,.2,1)",
                        }}
                      >
                        {getEnergyDropdown().map((sub) => (
                          <Link
                            key={sub.label}
                            to={sub.to}
                            style={{
                              textDecoration: "none",
                              color: "#1a3365",
                              width: "100%",
                            }}
                            onClick={() => setEnergyOpen(false)}
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
                  </React.Fragment>
                ) : (
                  // REPOSITORY MODE: Energy is a normal tab
                  <Link
                    key={item.label}
                    to={item.repository.to}
                    style={{
                      textDecoration: "none",
                      color: "#1a3365",
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(item.repository.to);
                      setEnergyOpen(false);
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
                        bgcolor: isSelected(item) && !collapsed
                          ? "rgba(26,51,101,0.32)"
                          : "transparent",
                        position: "relative",
                        "&::before": isSelected(item) ? {
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
                          bgcolor: "rgba(26,51,101,0.32)",
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
                          filter:
                            (isSelected(item) && !collapsed)
                              ? "brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%)"
                              : "brightness(0) saturate(100%) invert(17%) sepia(24%) saturate(1877%) hue-rotate(191deg) brightness(97%) contrast(92%)",
                        }}
                      />
                      {collapsed ? null : (
                        <span
                          style={{
                            fontSize: 18,
                            fontWeight: (isSelected(item) && !collapsed) ? 700 : 400,
                            color: (isSelected(item) && !collapsed) ? "#fff" : "#1a3365",
                            transition: "color 0.2s, font-weight 0.2s, opacity 0.3s, margin 0.3s",
                            opacity: 1,
                            marginLeft: 4,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {item.repository.label}
                        </span>
                      )}
                    </Box>
                  </Link>
                )
              ) : item.label === "Environment" ? (
                <React.Fragment key={item.label}>
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
                        (envOpen && !collapsed)
                          ? "#2B8C37"
                          : (isSelected(item) && !collapsed)
                            ? (mode === "repository" ? "rgba(26,51,101,0.32)" : "rgba(43,140,55,0.5)")
                            : "transparent",
                      borderRadius: (envOpen && !collapsed) || (isSelected(item) && !collapsed) ? 0 : undefined,
                      position: "relative",
                      "&::before": isSelected(item) ? {
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
                          ((envOpen && !collapsed) || (isSelected(item) && !collapsed))
                            ? "brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%)"
                            : mode === "repository"
                              ? "brightness(0) saturate(100%) invert(17%) sepia(24%) saturate(1877%) hue-rotate(191deg) brightness(97%) contrast(92%)"
                              : "brightness(0) saturate(100%) invert(41%) sepia(97%) saturate(469%) hue-rotate(83deg) brightness(93%) contrast(92%)",
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
                            filter: "brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%)",
                          }}
                        />
                      </>
                    )}
                  </Box>
                  {!collapsed && envOpen && (
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
                </React.Fragment>
              ) : item.label === "Social" ? (
                <React.Fragment key={item.label}>
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
                        (socialOpen && !collapsed)
                          ? "#2B8C37"
                          : (isSelected(item) && !collapsed)
                            ? (mode === "repository" ? "rgba(26,51,101,0.32)" : "rgba(43,140,55,0.5)")
                            : "transparent",
                      borderRadius: (socialOpen && !collapsed) || (isSelected(item) && !collapsed) ? 0 : undefined,
                      position: "relative",
                      "&::before": isSelected(item) ? {
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
                          ((socialOpen && !collapsed) || (isSelected(item) && !collapsed))
                            ? "brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%)"
                            : mode === "repository"
                              ? "brightness(0) saturate(100%) invert(17%) sepia(24%) saturate(1877%) hue-rotate(191deg) brightness(97%) contrast(92%)"
                              : "brightness(0) saturate(100%) invert(41%) sepia(97%) saturate(469%) hue-rotate(83deg) brightness(93%) contrast(92%)",
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
                            filter: "brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%)",
                          }}
                        />
                      </>
                    )}
                  </Box>
                  {!collapsed && socialOpen && (
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
                </React.Fragment>
              ) : (
                <Link
                  key={item.label}
                  to={item.to}
                  style={{
                    textDecoration: "none",
                    color: "#1a3365",
                  }}
                  onClick={(e) => {
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
                      cursor: "pointer",
                      transition: "background 0.25s, color 0.25s, padding 0.35s cubic-bezier(.4,0,.2,1)",
                      bgcolor: isSelected(item) && !collapsed
                        ? (mode === "repository" ? "rgba(26,51,101,0.32)" : "rgba(43,140,55,0.5)")
                        : "transparent",
                      position: "relative",
                      "&::before": isSelected(item) ? {
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
                      "&:hover img, &:hover .overview-icon": {
                        filter:
                          "brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%)",
                      },
                    }}
                  >
                    {/* Use AssessmentIcon for Overview, otherwise use img */}
                    {item.label === "Overview" ? (
                      <AssessmentIcon
                        className="overview-icon"
                        sx={{
                          width: 28,
                          height: 28,
                          color: (isSelected(item) && !collapsed)
                            ? "#fff"
                            : mode === "repository"
                              ? "#1a3365"
                              : "#2B8C37",
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
                          marginRight: 0,
                          filter:
                            (isSelected(item) && !collapsed)
                              ? "brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%)"
                              : mode === "repository"
                                ? "brightness(0) saturate(100%) invert(17%) sepia(24%) saturate(1877%) hue-rotate(191deg) brightness(97%) contrast(92%)"
                                : "brightness(0) saturate(100%) invert(41%) sepia(97%) saturate(469%) hue-rotate(83deg) brightness(93%) contrast(92%)",
                        }}
                      />
                    )}
                    {collapsed ? null : (
                      <span
                        style={{
                          fontSize: 18,
                          fontWeight: (isSelected(item) && !collapsed) ? 700 : 400,
                          color: (isSelected(item) && !collapsed) ? "#fff" : "#1a3365",
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
              )
            )}
          </Box>
        </Box>
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
              },
            }}
            onClick={() => {
              navigate("/");
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
    </>
  );
}

export default SideBar;