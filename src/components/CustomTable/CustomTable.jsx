import React from "react";
import {
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  Tooltip,
} from "@mui/material";


function AuditTrailTable({ columns, rows, emptyMessage, maxHeight }) {
  return (
    <Box sx={{ width: "100%", overflowX: "auto" }}>
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 4,
          boxShadow: "0 6px 32px rgba(24,41,89,0.10)",
          border: "1px solid #e5e8f1",
          overflow: "auto",
          minWidth: "100%",
          maxHeight: maxHeight || "calc(100vh - 140px)",
          background: "#f8fafd"
        }}
      >
        <MuiTable sx={{ minWidth: 700, tableLayout: "auto" }} stickyHeader size="small">
          <TableHead>
            <TableRow
              sx={{
                background: "#182959",
                "& th": {
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: 17,
                  borderBottom: "none",
                  whiteSpace: "normal",
                  wordBreak: "normal",
                  overflowWrap: "break-word",
                  px: 2.5,
                  py: 2.5,
                  position: "sticky",
                  top: 0,
                  background: "#182959",
                  zIndex: 1,
                  textAlign: "center",
                  letterSpacing: 0.5,
                  boxShadow: "0 2px 8px 0 rgba(24,41,89,0.10)",
                },
              }}
            >
              {columns.map((col) => {
                const words = col.label.replace(/\(.*?\)/g, '').trim().split(/\s+/).filter(Boolean);
                const isAbbreviated = words.length > 2;
                const headerContent = isAbbreviated
                  ? (
                    <Tooltip
                      title={<span style={{ fontSize: 15, fontWeight: 500 }}>{col.label}</span>}
                      arrow
                      enterDelay={100}
                      leaveDelay={50}
                      slotProps={{
                        tooltip: {
                          sx: {
                            bgcolor: "#22347a",
                            color: "#fff",
                            fontSize: 15,
                            fontWeight: 500,
                            borderRadius: 1,
                            boxShadow: 3,
                            px: 2,
                            py: 1,
                          }
                        },
                        arrow: {
                          sx: {
                            color: "#22347a"
                          }
                        }
                      }}
                    >
                      <span style={{
                        letterSpacing: 1,
                        fontWeight: 800,
                        display: "inline-block",
                        minWidth: 32,
                        textAlign: "center"
                      }}>
                        {col.label.split(' ').map(w => w[0]?.toUpperCase()).join('')}
                      </span>
                    </Tooltip>
                  )
                  : col.label;
                return (
                  <TableCell
                    key={col.key}
                    align="center"
                    sx={{
                      fontWeight: 800,
                      fontSize: 16,
                      px: 2.5,
                      py: 2,
                      borderBottom: "1.5px solid #e0e3ef",
                      textAlign: "center",
                      whiteSpace: "normal",
                      wordBreak: "normal",
                      overflowWrap: "break-word",
                      background: "#182959",
                      letterSpacing: 0.5,
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, justifyContent: "center" }}>
                      {headerContent}
                    </Box>
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} align="center" sx={{ py: 7, color: "#b0b0b0", textAlign: "center", whiteSpace: "normal", wordBreak: "normal", overflowWrap: "break-word", fontSize: 17, fontWeight: 500, background: "#f8fafd" }}>
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, idx) => (
                <TableRow
                  key={row.audit_id || idx}
                  hover
                  sx={{
                    background: "#fff",
                    "&:hover": { background: "#f0f4ff" },
                    transition: "background 0.18s",
                    borderRadius: 2,
                    boxShadow: "0 1px 4px 0 rgba(24,41,89,0.04)",
                  }}
                >
                  {columns.map((col) => (
                    <TableCell
                      key={col.key}
                      align="center"
                      sx={{
                        fontSize: 16,
                        px: 2.5,
                        py: 2,
                        borderBottom: "1.5px solid #e0e3ef",
                        textAlign: "center",
                        whiteSpace: "normal",
                        wordBreak: "normal",
                        overflowWrap: "break-word",
                        overflow: "auto",
                        background: "#fff",
                        borderRadius: 2,
                      }}
                    >
                      {col.render
                        ? col.render(row[col.key], row)
                        : row[col.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </MuiTable>
      </TableContainer>
    </Box>
  );
}

export default AuditTrailTable;
