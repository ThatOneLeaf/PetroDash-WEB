import React, { useState } from "react";
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
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import loginImage from "../../assets/login_image.png";

const interFont = { fontFamily: "Inter, sans-serif" };

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));

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
          }}
        >
          {/* Logo */}
          <Box sx={{ mb: 2 }}>
            <Box
              component="img"
              src="src/assets/petrodashlogo.png"
              alt="PetroDash Logo"
              sx={{ width: 200 }}
            />
          </Box>

          <Typography variant="h6" sx={{ mb: 3, ...interFont }}>
            User Login
          </Typography>

          <TextField
            fullWidth
            variant="outlined"
            placeholder="someone@petroenergy.com.ph"
            sx={{ mb: 2, ...interFont }}
            InputProps={{
              sx: { borderRadius: "8px", ...interFont },
            }}
          />

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
              ),
            }}
          />

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

          <Box sx={{ mb: 3 }}>
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

          <Button
            variant="contained"
            fullWidth
            onClick={() => navigate("/dashboard")}
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
              "&:hover": { bgcolor: "#176c3c" },
            }}
          >
            LOGIN
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
