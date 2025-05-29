import React, { useState,  } from "react";
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
  IconButton
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
// Import the login image
import loginImage from "../../assets/login_image.png";
const interFont = { fontFamily: "Inter, sans-serif" };

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const toDashboard = () => {
    navigate('')
  }

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: "24px",
        width: "800px",
        // maxWidth: "95vw",
        p: 0,
        overflow: "hidden",
        display: "flex",
      }}
    >
      <Grid container>
        {/* Left Side: Image */}
        <Grid
          item
          sx={{
            bgcolor: "#7694c4",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            // minHeight: 500
          }}
        >
          {/* Login image */}
          <Box
            component="img"
            src={loginImage}
            alt="Login"
            sx={{
              width: "auto",
              height: "auto",
              maxWidth: 441.,
              maxHeight: 600,
              objectFit: "contain",
              opacity: 0.825,
              borderRadius: "24px 0 0 24px",
              boxShadow: 2
            }}
          />
        </Grid>
        {/* Right Side: Login Form */}
        <Grid
          item
          xs={7}
          sx={{
            p: 5,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center"
          }}
        >
          {/* Logo */}
          <Box sx={{ mb: 2, display: "flex", alignItems: "center" }}>
            {/* Logo image */}
            <Box
              component="img"
              src="src\assets\petrodashlogo.png"
              alt="PetroDash Logo"
              sx={{
                width: 240,
                height: "auto",
                mr: 1,
                display: "block"
              }}
            />
          </Box>
          {/* User Login */}
          <Typography
            variant="h6"
            sx={{
              mt: 2,
              mb: 3,
              fontWeight: 400,
              color: "#222",
              ...interFont
            }}
          >
            User Login
          </Typography>
          {/* Email */}
          <TextField
            fullWidth
            variant="outlined"
            placeholder="someone@petroenergy.com.ph"
            sx={{ mb: 2, ...interFont }}
            InputProps={{
              sx: { borderRadius: "8px", ...interFont }
            }}
          />
          {/* Password */}
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Password"
            type={showPassword ? "text" : "password"}
            sx={{ mb: 1, ...interFont }}
            InputProps={{
              sx: { borderRadius: "8px", ...interFont },
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword((show) => !show)}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
          {/* Show Password */}
          <FormControlLabel
            control={
              <Checkbox
                checked={showPassword}
                onChange={() => setShowPassword((show) => !show)}
                sx={{
                  color: "#1e5b2e",
                  "&.Mui-checked": { color: "#1e5b2e" }
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
          {/* Forgot Password */}
          <Box sx={{ mb: 3 }}>
            <Link
              href="#"
              underline="hover"
              sx={{
                color: "#1a2c5b",
                fontSize: 15,
                ...interFont
              }}
            >
              Forgot Password?
            </Link>
          </Box>
          {/* Login Button */}
          <Link to="/dashboard">
            <Button
              variant="contained"
              fullWidth
              sx={{
                bgcolor: "#1e5b2e",
                color: "#fff",
                fontWeight: 700,
                borderRadius: "24px",
                fontSize: 18,
                py: 1.2,
                textTransform: "none",
                boxShadow: "none",
                ...interFont,
                "&:hover": { bgcolor: "#176c3c" }
              }} onClick={() => {navigate("/dashboard")}}
            >
              LOGIN
            </Button>
          </Link>
        </Grid>
      </Grid>
    </Paper>
  );
}