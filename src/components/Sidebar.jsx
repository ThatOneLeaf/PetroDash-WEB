import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

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
import DropDownIcon from "../assets/Icons/drop-down.svg";

function SideBar({ collapsed: collapsedProp = false }) {
  // Sidebar expands on hover, collapses on mouse leave
  const [collapsed, setCollapsed] = useState(true);
  const [envOpen, setEnvOpen] = useState(false);
  const [socialOpen, setSocialOpen] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false); // Dashboard dropdown
  const [dashboardHover, setDashboardHover] = useState(false); // Hover state for arrow

  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Additional function for Dashboard click
  const handleDashboardClick = () => {
    // Add any extra logic here (analytics, refresh, etc.)
    navigate("/dashboard");
  };

  // Add this function back:
  const handleDropdownToggle = (dropdown) => {
    if (dropdown === "env") {
      setEnvOpen((open) => {
        if (!open) setSocialOpen(false);
        return !open;
      });
    } else if (dropdown === "social") {
      setSocialOpen((open) => {
        if (!open) setEnvOpen(false);
        return !open;
      });
    }
  };

  // Navigation items
  const navItems = [
    { label: "Energy", icon: EnergyIcon, to: "/energy" },
    { label: "Economic", icon: EconomicsIcon, to: "/economic" },
    {
      label: "Environment",
      icon: EnvironmentIcon,
      to: "/environment",
      dropdown: [
        { label: "Energy", to: "/environment/energy" },
        { label: "Water", to: "/environment/water" },
        { label: "Waste", to: "/environment/waste" },
        { label: "Air", to: "/environment/air" },
        { label: "C.A.R.E", to: "/environment/care" },
      ],
    },
    {
      label: "Social",
      icon: SocialIcon,
      to: "/social",
      dropdown: [
        { label: "H.R.", to: "/social/hr" },
        { label: "H.E.L.P", to: "/social/help" },
        { label: "ER1-94 Fund Allocations", to: "/social/er1-94" },
      ],
    },
  ];

  // Helper to check if a nav item is selected
  const isSelected = (item) => {
    if (item.dropdown) {
      return item.dropdown.some((sub) => location.pathname.startsWith(sub.to));
    }
    return location.pathname.startsWith(item.to);
  };

  // Helper to check if a dropdown subitem is selected
  const isDropdownSelected = (sub) => location.pathname.startsWith(sub.to);

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
        transition: "width 0.35s cubic-bezier(.4,0,.2,1), left 0.35s cubic-bezier(.4,0,.2,1), box-shadow 0.35s cubic-bezier(.4,0,.2,1), position 0s linear 0.35s", // smooth transition
        boxShadow: "4px 0 12px 0 rgba(44,62,80,0.22)",
        position: "sticky", // always sticky
        top: 0,
        left: 0,
        overflowX: "hidden",
        zIndex: collapsed ? 100 : 1300,
        // Optional: fade shadow in/out for more smoothness
        ...(collapsed
          ? { boxShadow: "4px 0 12px 0 rgba(44,62,80,0.22)" }
          : { boxShadow: "8px 0 24px 0 rgba(44,62,80,0.22)" }),
      }}
      onMouseEnter={() => setCollapsed(false)}
      onMouseLeave={() => {
        setCollapsed(true);
        setDashboardOpen(false); // Close dashboard dropdown on collapse
      }}
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
                  // cursor removed here
                }}
              />
            )}
          </div>
        </Box>
        {/* Dashboard Dropdown */}
        <Box sx={{ px: collapsed ? 1 : 3, mb: 2, mt: 2, transition: "padding 0.3s" }}>
          <Box
            sx={{
              position: "relative",
              width: "100%",
              height: 40,
            }}
            onMouseEnter={() => {
              if (!collapsed && !isMobile) {
                clearTimeout(window.__dashboardDropdownTimeout);
                setDashboardHover(true);
                setDashboardOpen(true);
              }
            }}
            onMouseLeave={() => {
              if (!collapsed && !isMobile) {
                window.__dashboardDropdownTimeout = setTimeout(() => {
                  setDashboardHover(false);
                  setDashboardOpen(false);
                }, 180);
              }
            }}
          >
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
                minWidth: 0,
                borderLeft: location.pathname.startsWith("/dashboard") && !collapsed ? "6px solid #182959" : "6px solid transparent",
                boxShadow: collapsed ? "none" : undefined,
                "&:hover": { bgcolor: collapsed ? "transparent" : "#162a52" },
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                transition: "font-size 0.35s cubic-bezier(.4,0,.2,1), background 0.2s",
                p: 0,
                ...(collapsed && { justifyContent: "center", alignItems: "center" }),
                overflow: "visible",
              }}
              onClick={() => {
                if (isMobile) {
                  setDashboardOpen(true);
                } else if (!collapsed) {
                  setDashboardOpen((open) => !open);
                } else {
                  handleDashboardClick();
                }
              }}
              disableRipple
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
                      "brightness(0) saturate(100%) invert(17%) sepia(24%) saturate(1877%) hue-rotate(191deg) brightness(97%) contrast(92%)",
                  }}
                />
              ) : (
                <>
                  <span
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "center",
                      transition: "transform 0.25s cubic-bezier(.4,0,.2,1)",
                      transform: dashboardHover ? "translateX(-16px)" : "translateX(0)",
                    }}
                  >
                    DASHBOARD
                  </span>
                  <span
                    style={{
                      position: "absolute",
                      right: 24,
                      top: "50%",
                      transform: dashboardHover
                        ? `translateY(-50%) translateX(0) rotate(${dashboardOpen ? 180 : 0}deg)`
                        : "translateY(-50%) translateX(16px) rotate(0deg)",
                      opacity: dashboardHover ? 1 : 0,
                      transition: "opacity 0.25s, transform 0.25s cubic-bezier(.4,0,.2,1)",
                      pointerEvents: "none",
                    }}
                  >
                    <img
                      src={DropDownIcon}
                      alt="Expand"
                      style={{
                        width: 22,
                        height: 22,
                        transition: "filter 0.2s",
                        filter: dashboardOpen
                          ? "brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%)"
                          : undefined,
                      }}
                    />
                  </span>
                </>
              )}
            </Button>
            {/* Dashboard Dropdown Menu (Desktop) */}
            {!collapsed && !isMobile && (
              <Box
                sx={{
                  position: "absolute",
                  left: 0,
                  right: 0,
                  top: 44,
                  zIndex: 200,
                  bgcolor: "#fff",
                  boxShadow: "0 4px 16px 0 rgba(44,62,80,0.10)",
                  borderRadius: 2,
                  border: "1px solid #e0e0e0",
                  overflow: "hidden",
                  opacity: dashboardOpen ? 1 : 0,
                  pointerEvents: dashboardOpen ? "auto" : "none",
                  transform: dashboardOpen ? "translateY(0)" : "translateY(-10px)",
                  transition: "opacity 0.25s cubic-bezier(.4,0,.2,1), transform 0.25s cubic-bezier(.4,0,.2,1)",
                }}
                // --- Improved dropdown hover handling with timers ---
                onMouseEnter={() => {
                  clearTimeout(window.__dashboardDropdownTimeout);
                  setDashboardHover(true);
                  setDashboardOpen(true);
                }}
                onMouseLeave={() => {
                  window.__dashboardDropdownTimeout = setTimeout(() => {
                    setDashboardHover(false);
                    setDashboardOpen(false);
                  }, 180);
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "stretch",
                  }}
                >
                  <Button
                    sx={{
                      justifyContent: "flex-start",
                      color: location.pathname.startsWith("/dashboard") ? "#fff" : "#1a3365",
                      bgcolor: location.pathname.startsWith("/dashboard") ? "#182959" : "transparent",
                      fontWeight: location.pathname.startsWith("/dashboard") ? 700 : 400,
                      fontSize: 16,
                      px: 3,
                      py: 1.5,
                      borderRadius: 0,
                      borderBottom: "1px solid #eee",
                      textTransform: "none",
                      transition: "background 0.2s, color 0.2s, font-weight 0.2s",
                      "&:hover": {
                        bgcolor: "#182959",
                        color: "#fff",
                        fontWeight: 700,
                      },
                    }}
                    onClick={() => {
                      setDashboardOpen(false);
                      handleDashboardClick();
                    }}
                  >
                    Dashboard
                  </Button>
                  <Button
                    sx={{
                      justifyContent: "flex-start",
                      color: location.pathname.startsWith("/repository") ? "#fff" : "#1a3365",
                      bgcolor: location.pathname.startsWith("/repository") ? "#182959" : "transparent",
                      fontWeight: location.pathname.startsWith("/repository") ? 700 : 400,
                      fontSize: 16,
                      px: 3,
                      py: 1.5,
                      borderRadius: 0,
                      textTransform: "none",
                      transition: "background 0.2s, color 0.2s, font-weight 0.2s",
                      "&:hover": {
                        bgcolor: "#182959",
                        color: "#fff",
                        fontWeight: 700,
                      },
                    }}
                    onClick={() => {
                      setDashboardOpen(false);
                      navigate("/repository");
                    }}
                  >
                    Repository
                  </Button>
                </Box>
              </Box>
            )}
            {/* Dashboard Dropdown Menu (Mobile) */}
            {isMobile && (
              <Dialog
                open={dashboardOpen}
                onClose={() => setDashboardOpen(false)}
                fullWidth
                PaperProps={{
                  sx: {
                    position: "fixed",
                    bottom: 0,
                    m: 0,
                    borderRadius: "16px 16px 0 0",
                    width: "100%",
                    maxWidth: "100vw",
                  },
                }}
                sx={{
                  zIndex: 2000,
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "stretch",
                    p: 2,
                    gap: 1,
                    textAlign: "center", // Center text for all children
                  }}
                >
                  <Button
                    sx={{
                      justifyContent: "center", // Center button text
                      color: location.pathname.startsWith("/dashboard") ? "#fff" : "#1a3365",
                      bgcolor: location.pathname.startsWith("/dashboard") ? "#182959" : "transparent",
                      fontWeight: location.pathname.startsWith("/dashboard") ? 700 : 400,
                      fontSize: 18,
                      px: 2,
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: "none",
                      transition: "background 0.2s, color 0.2s, font-weight 0.2s",
                      "&:hover": {
                        bgcolor: "#182959",
                        color: "#fff",
                        fontWeight: 700,
                      },
                    }}
                    onClick={() => {
                      setDashboardOpen(false);
                      handleDashboardClick();
                    }}
                  >
                    Dashboard
                  </Button>
                  <Button
                    sx={{
                      justifyContent: "center", // Center button text
                      color: location.pathname.startsWith("/repository") ? "#fff" : "#1a3365",
                      bgcolor: location.pathname.startsWith("/repository") ? "#182959" : "transparent",
                      fontWeight: location.pathname.startsWith("/repository") ? 700 : 400,
                      fontSize: 18,
                      px: 2,
                      py: 1.5,
                      borderRadius: 2,
                      textTransform: "none",
                      transition: "background 0.2s, color 0.2s, font-weight 0.2s",
                      "&:hover": {
                        bgcolor: "#182959",
                        color: "#fff",
                        fontWeight: 700,
                      },
                    }}
                    onClick={() => {
                      setDashboardOpen(false);
                      navigate("/repository");
                    }}
                  >
                    Repository
                  </Button>
                  <Button
                    sx={{
                      mt: 1,
                      color: "#1a3365",
                      fontWeight: 400,
                      fontSize: 16,
                      textTransform: "none",
                      justifyContent: "center", // Center button text
                    }}
                    onClick={() => setDashboardOpen(false)}
                  >
                    Cancel
                  </Button>
                </Box>
              </Dialog>
            )}
          </Box>
        </Box>
        {/* Navigation Items */}
        <Box>
          {navItems.map((item) =>
            item.label === "Environment" ? (
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
                          ? "rgba(43,140,55,0.5)"
                          : "transparent",
                    borderRadius: (envOpen && !collapsed) || (isSelected(item) && !collapsed) ? 0 : undefined,
                    position: "relative",
                    // Remove borderLeft, add indicator as ::before
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
                      bgcolor: "#2B8C37",
                    },
                    "&:hover span": {
                      color: "#fff", // Make text white on hover
                      fontWeight: 700, // Make text bold on hover
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
                          : undefined,
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
                          filter: envOpen
                            ? "brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%)"
                            : undefined,
                        }}
                      />
                    </>
                  )}
                </Box>
                {/* Dropdown */}
                {!collapsed && envOpen && (
                  <Box
                    sx={{
                      pl: 4,
                      pr: 2,
                      py: 1,
                      bgcolor: "#fff",
                      boxShadow: "0 4px 16px 0 rgba(44,62,80,0.10)", // subtle shadow
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start", // added for left alignment
                      gap: 1,
                      mb: 1,
                      borderRadius: 2, // rounded corners
                      border: "1px solid #e0e0e0", // subtle border
                      position: "relative",
                      zIndex: 101,
                    }}
                  >
                    {item.dropdown.map((sub) => (
                      <Link
                        key={sub.label}
                        to={sub.to}
                        style={{
                          textDecoration: "none",
                          color: "#1a3365",
                          width: "100%", // ensure full width for left alignment
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
                            textAlign: "left", // ensure text is left aligned
                            width: "100%", // ensure full width for left alignment
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
                          ? "rgba(43,140,55,0.5)"
                          : "transparent",
                    borderRadius: (socialOpen && !collapsed) || (isSelected(item) && !collapsed) ? 0 : undefined,
                    position: "relative",
                    // Remove borderLeft, add indicator as ::before
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
                      bgcolor: "#2B8C37",
                    },
                    "&:hover span": {
                      color: "#fff", // Make text white on hover
                      fontWeight: 700, // Make text bold on hover
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
                          : undefined,
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
                          filter: socialOpen
                            ? "brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%)"
                            : undefined,
                        }}
                      />
                    </>
                  )}
                </Box>
                {/* Dropdown */}
                {!collapsed && socialOpen && (
                  <Box
                    sx={{
                      pl: 4, // changed from pl: 7 to pl: 4 for left alignment
                      pr: 2,
                      py: 1,
                      bgcolor: "#fff",
                      boxShadow: "0 4px 16px 0 rgba(44,62,80,0.10)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start", // added for left alignment
                      gap: 1,
                      mb: 1,
                      borderRadius: 2,
                      border: "1px solid #e0e0e0",
                      position: "relative",
                      zIndex: 101,
                    }}
                  >
                    {item.dropdown.map((sub) => (
                      <Link
                        key={sub.label}
                        to={sub.to}
                        style={{
                          textDecoration: "none",
                          color: "#1a3365",
                          width: "100%", // ensure full width for left alignment
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
                            textAlign: "left", // ensure text is left aligned
                            width: "100%", // ensure full width for left alignment
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
                onClick={() => { setEnvOpen(false); setSocialOpen(false); }}
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
                    bgcolor: isSelected(item) && !collapsed ? "rgba(43,140,55,0.5)" : "transparent",
                    position: "relative",
                    // Remove borderLeft, add indicator as ::before
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
                      bgcolor: "#2B8C37",
                    },
                    "&:hover span": {
                      color: "#fff", // Make text white on hover
                      fontWeight: 700, // Make text bold on hover
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
                          : undefined,
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
                      {item.label}
                    </span>
                  )}
                </Box>
              </Link>
            )
          )}
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
  );
}

export default SideBar;