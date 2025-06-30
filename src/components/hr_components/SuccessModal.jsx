import React from "react";
import { Modal, Paper, Box, Typography, Button } from "@mui/material";

const SuccessModal = ({
  open,
  onClose,
  successMessage,
  title = "Record Added Successfully!",
  color = "#2B8C37",
}) => {
  const computedHoverColor =
    color === "#2B8C37" ? "#256d2f" : color === "#182959" ? "#0f1a3c" : color;

  return (
    <Modal
      open={open}
      onClose={onClose}
      sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <Paper
        sx={{
          p: 4,
          width: 400,
          borderRadius: 2,
          bgcolor: "white",
          outline: "none",
          textAlign: "center",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: "50%",
              backgroundColor: color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 2,
            }}
          >
            <Typography
              sx={{ color: "white", fontSize: "2rem", fontWeight: "bold" }}
            >
              ✓
            </Typography>
          </Box>

          <Typography
            sx={{
              fontSize: "1.5rem",
              fontWeight: 800,
              color: "#182959",
              mb: 2,
            }}
          >
            {title}
          </Typography>

          <Typography sx={{ fontSize: "1rem", color: "#666", mb: 3 }}>
            {successMessage}
          </Typography>
        </Box>
        <Button
          variant="contained"
          onClick={onClose}
          sx={{
            backgroundColor: color,
            borderRadius: "999px",
            padding: "10px 24px",
            fontSize: "1rem",
            fontWeight: "bold",
            "&:hover": {
              backgroundColor: computedHoverColor,
            },
          }}
        >
          OK
        </Button>
      </Paper>
    </Modal>
  );
};
export default SuccessModal;
