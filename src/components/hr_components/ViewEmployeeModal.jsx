import { useState } from "react";
import { Paper, Typography, TextField, Button, Box } from "@mui/material";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";

function ViewEmployeeModal({ onClose, row }) {
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
        {row.employee_id}
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: 2,
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 2,
          }}
        >
          <TextField
            label="Gender"
            defaultValue={
              row.gender?.toLowerCase() === "f"
                ? "Female"
                : row.gender?.toLowerCase() === "m"
                ? "Male"
                : row.gender
            }
            slotProps={{
              input: {
                readOnly: true,
              },
            }}
          />

          <TextField
            label="Position"
            defaultValue={
              row.position_id?.toLowerCase() === "rf"
                ? "Rank-and-File"
                : row.position_id?.toLowerCase() === "mm"
                ? "Middle Management"
                : row.position_id?.toLowerCase() === "sm"
                ? "Senior Management"
                : row.position_id
            }
            slotProps={{
              input: {
                readOnly: true,
              },
            }}
          />
        </Box>

        <TextField
          label="Employement Category"
          defaultValue={
            row.p_np?.toLowerCase() === "p"
              ? "Profesional"
              : row.p_np?.toLowerCase() === "np"
              ? "Non-Professional"
              : row.p_np
          }
          slotProps={{
            input: {
              readOnly: true,
            },
          }}
        />

        <TextField
          label="Employement Status"
          defaultValue={row.employment_status}
          slotProps={{
            input: {
              readOnly: true,
            },
          }}
        />
        <TextField
          label="Start Date"
          defaultValue={row.start_date?.split("T")[0]}
          slotProps={{
            input: {
              readOnly: true,
            },
          }}
        />

        <TextField
          label="End Date"
          defaultValue={row.end_date ? row.end_date.split("T")[0] : "N/A"}
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

export default ViewEmployeeModal;
