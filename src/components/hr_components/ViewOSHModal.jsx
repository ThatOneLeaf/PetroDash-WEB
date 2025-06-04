import { useState } from "react";
import { Paper, Typography, TextField, Button, Box } from "@mui/material";

function ViewOSHModal({ onClose, row }) {
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
        {row.company_id + " - " + row.workforce_type}
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 2,
        }}
      >
        <TextField
          label="Lost Time"
          defaultValue={
            row.lost_time === true
              ? "Yes"
              : row.lost_time === false
              ? "No"
              : "N/A"
          }
          slotProps={{
            input: {
              readOnly: true,
            },
          }}
        />

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
          label="Incident Type"
          defaultValue={row.incident_type}
          slotProps={{
            input: {
              readOnly: true,
            },
          }}
        />

        <TextField
          label="Incident Title"
          defaultValue={row.incident_title}
          slotProps={{
            input: {
              readOnly: true,
            },
          }}
        />

        <TextField
          label="Incident Count"
          defaultValue={row.incident_count}
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

export default ViewOSHModal;
