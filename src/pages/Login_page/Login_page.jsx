import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Link,
  InputAdornment,
  IconButton,
  useMediaQuery,
  useTheme,
  Alert,
  CircularProgress,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import logo from "../../assets/petrodashlogo.png";
import loginImage from "../../assets/login_image.png";
import { useAuth } from "../../contexts/AuthContext";

const interFont = { fontFamily: "Inter, sans-serif" };

export default function LoginPage() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));
  const { getUserRole, user } = useAuth();
  const [loggedIn, setLoggedIn] = useState(false);

// Step 1: Try login
const handleLogin = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  try {
    await login(email, password); // This triggers setUser inside AuthContext
    setLoggedIn(true); // signal that login was successful
  } catch (error) {
    setError(error.message || "Login failed. Please check your credentials.");
  } finally {
    setLoading(false);
  }
};

// Step 2: After user is set by AuthContext, navigate based on role
useEffect(() => {
  if (loggedIn && user) {
    const role = getUserRole();
    if (role === "R01") {
      navigate("/admin");
    } else {
      navigate("/");
    }
  }
}, [loggedIn, user]);

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      px={2}
    >
      <Paper
        elevation={3}
        sx={{
          borderRadius: "24px",
          width: "100%",
          maxWidth: 800,
          display: "flex",
          flexDirection: isSmall ? "column" : "row",
          overflow: "hidden",
        }}
      >
        {/* Image Section */}
        {!isSmall && (
          <Box
            sx={{
              bgcolor: "#7694c4",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "45%",
            }}
          >
            <Box
              component="img"
              src={loginImage}
              alt="Login"
              sx={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                opacity: 0.825,
                borderRadius: "24px 0 0 24px",
              }}
            />
          </Box>
        )}

        {/* Login Form */}
        <Box
          sx={{
            width: isSmall ? "100%" : "55%",
            p: 4,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {/* Logo */}
          <Box sx={{ mb: 2 }}>
            <Box
              component="img"
              src={logo}
              alt="PetroDash Logo"
              sx={{ width: 250 }}
            />
          </Box>

          <Typography variant="h6" sx={{ mb: 3, ...interFont }}>
            User Login
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleLogin}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="someone@petroenergy.com.ph"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              sx={{ mb: 2, ...interFont }}
              InputProps={{
                sx: { borderRadius: "8px", ...interFont, fontSize: 16},
              }}
            />

            <TextField
              fullWidth
              variant="outlined"
              placeholder="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              sx={{ mb: 1, ...interFont }}
              InputProps={{
                sx: { borderRadius: "8px", ...interFont, fontSize: 16},
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((show) => !show)}
                      edge="end"
                      size="small"
                      disabled={loading}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

          {/* Show Password Checkbox 
            <FormControlLabel
              control={
                <Checkbox
                  checked={showPassword}
                  onChange={() => setShowPassword((show) => !show)}
                  sx={{
                    color: "#1e5b2e",
                    "&.Mui-checked": { color: "#1e5b2e" },
                  }}
                />
              }
              label={
                <Typography sx={{ fontSize: 15, ...interFont }}>
                  Show Password
                </Typography>
              }
              sx={{ mb: 1, ml: 0 }}
            />
          */}
          

          <Box sx={{ mb: 3, mt: 3, display: "flex", alignItems: "center", justifyContent: "center"}}>
            <Link
              href="#"
              underline="hover"
              sx={{
                color: "#1a2c5b",
                fontSize: 15,
                ...interFont,
              }}
            >
              Forgot Password?
            </Link>
          </Box>
          <Box sx={{ marginLeft: 10, marginRight: 10, marginTop: 5}}> 
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading || !email || !password}
              sx={{
                bgcolor: "#2B8C37",
                color: "#fff",
                fontWeight: 700,
                borderRadius: "24px",
                fontSize: 18,
                margin: "0 auto",
                textTransform: "none",
                boxShadow: "none",
                ...interFont,
                "&:hover": { bgcolor: "#256d2f" },
                "&:disabled": { bgcolor: "#ccc" },
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "LOGIN"}
            </Button>
          </Box>
          </form>
        </Box>
      </Paper>
    </Box>
  );
}
