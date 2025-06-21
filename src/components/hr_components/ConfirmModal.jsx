import React from "react";
import { Modal, Paper, Box, Typography, Button } from "@mui/material";

const ConfirmModal = ({
  open,
  onCancel,
  onConfirm,
  title = "Confirm Record Addition",
  message = "Are you sure you want to proceed?",
  summaryData = [],
}) => {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <Paper
        sx={{
          p: 4,
          width: "400px",
          borderRadius: "16px",
          bgcolor: "white",
          outline: "none",
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
          <Typography
            sx={{
              fontSize: "1.5rem",
              fontWeight: 800,
              color: "#182959",
              mb: 2,
              textAlign: "center",
            }}
          >
            {title}
          </Typography>
          <Typography sx={{ fontSize: "1rem", textAlign: "center", mb: 2 }}>
            {message}
          </Typography>

          <Box
            sx={{
              bgcolor: "#f5f5f5",
              p: 2,
              borderRadius: "8px",
              width: "100%",
              mb: 3,
            }}
          >
            {summaryData.map(({ label, value }, index) => (
              <Typography key={index} sx={{ fontSize: "0.9rem", mb: 1 }}>
                <strong>{label}:</strong> {value}
              </Typography>
            ))}
          </Box>
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 2,
            mt: 3,
          }}
        >
          <Button
            variant="outlined"
            sx={{
              borderColor: "#ccc",
              color: "#666",
              borderRadius: "999px",
              padding: "8px 16px",
              fontSize: "0.9rem",
              fontWeight: "bold",
              "&:hover": {
                borderColor: "#999",
                backgroundColor: "#f5f5f5",
              },
            }}
            onClick={onCancel}
          >
            CANCEL
          </Button>
          <Button
            variant="contained"
            sx={{
              backgroundColor: "#2B8C37",
              borderRadius: "999px",
              padding: "8px 16px",
              fontSize: "0.9rem",
              fontWeight: "bold",
              "&:hover": {
                backgroundColor: "#256d2f",
              },
            }}
            onClick={onConfirm}
          >
            CONFIRM
          </Button>
        </Box>
      </Paper>
    </Modal>
  );
};

export default ConfirmModal;
