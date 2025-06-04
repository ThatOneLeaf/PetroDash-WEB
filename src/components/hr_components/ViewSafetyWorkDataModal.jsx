import { useState } from "react";
import { Paper, Typography, TextField, Button, Box } from "@mui/material";

function ViewSafetyWorkDataModal({ onClose, row }) {
  return (
    <Paper
      sx={{
        p: 4,
        width: "450px",
        borderRadius: "16px",
        bgcolor: "white",
      }}
    >
      <Typography
        variant="h5"
        sx={{
          color: "#1a237e",
          mb: 3,
          fontWeight: "bold",
        }}
      >
        {row.company_id + " - " + row.contractor}
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 2,
        }}
      >
        <TextField
          label="Date"
          defaultValue={row.date?.split("T")[0]}
          slotProps={{
            input: {
              readOnly: true,
            },
          }}
        />
        <TextField
          label="Safety Manpower"
          defaultValue={row.manpower}
          slotProps={{
            input: {
              readOnly: true,
            },
          }}
        />

        <TextField
          label="Safety Manhours"
          defaultValue={row.manhours}
          slotProps={{
            input: {
              readOnly: true,
            },
          }}
        />

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            mt: 2,
          }}
        >
          <Button
            variant="contained"
            onClick={onClose}
            sx={{
              width: "100px",
              backgroundColor: "#2B8C37",
              borderRadius: "999px",
              padding: "9px 18px",
              fontSize: "0.85rem",
              fontWeight: "bold",
              "&:hover": {
                backgroundColor: "#256d2f",
              },
            }}
          >
            Close
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}

export default ViewSafetyWorkDataModal;
