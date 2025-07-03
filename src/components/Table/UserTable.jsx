
import React from "react";
import {
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
} from "@mui/material";


const UserTable = ({ columns, rows, actions, idKey = "account_id", selectable, onSelectionChange, ...props }) => {
  // Selection state is managed in parent, but we need to know which are selected
  const selectedIds = props.selectedRowIds || [];
  const allSelected = rows.length > 0 && rows.every((row) => selectedIds.includes(row[idKey]));
  const someSelected = rows.some((row) => selectedIds.includes(row[idKey]));

  const handleSelectAll = (e) => {
    if (onSelectionChange) {
      if (e.target.checked) {
        onSelectionChange(rows.map((row) => row[idKey]));
      } else {
        onSelectionChange([]);
      }
    }
  };
  const handleSelectRow = (e, rowId) => {
    if (onSelectionChange) {
      if (e.target.checked) {
        onSelectionChange([...selectedIds, rowId]);
      } else {
        onSelectionChange(selectedIds.filter((id) => id !== rowId));
      }
    }
  };

  return (
    <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: "0 4px 24px rgba(24,41,89,0.08)", border: "1px solid #e5e8f1", overflow: "auto", minWidth: "100%", maxHeight: props.maxHeight || "75vh" }}>
      <MuiTable stickyHeader size="small">
        <TableHead>
          <TableRow>
            {selectable && (
              <TableCell padding="checkbox" sx={{ background: "#182959", position: "sticky", top: 0, zIndex: 2 }}>
                <Checkbox
                  color="default"
                  indeterminate={someSelected && !allSelected}
                  checked={allSelected}
                  onChange={handleSelectAll}
                  inputProps={{ 'aria-label': 'select all rows' }}
                  sx={{
                    color: '#fff',
                    '&.Mui-checked': {
                      color: '#fff',
                    },
                    '&.MuiCheckbox-indeterminate': {
                      color: '#fff',
                    },
                  }}
                />
              </TableCell>
            )}
            {columns.map((col) => (
              <TableCell
                key={col.key}
                align="center"
                sx={{
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 16,
                  borderBottom: "none",
                  whiteSpace: "normal",
                  wordBreak: "normal",
                  overflowWrap: "break-word",
                  px: 2,
                  py: 2,
                  position: "sticky",
                  top: 0,
                  background: "#182959",
                  zIndex: 1,
                  textAlign: "center",
                }}
              >
                {col.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length + (selectable ? 1 : 0)} align="center" sx={{ py: 6, color: "#b0b0b0" }}>
                {props.emptyMessage || "No data available."}
              </TableCell>
            </TableRow>
          ) : (
            rows.map((row) => (
              <TableRow key={row[idKey]} hover sx={{ background: "#fff", "&:hover": { background: "#f6f8fc" } }}>
                {selectable && (
                  <TableCell padding="checkbox">
                    <Checkbox
                      color="primary"
                      checked={selectedIds.includes(row[idKey])}
                      onChange={(e) => handleSelectRow(e, row[idKey])}
                      inputProps={{ 'aria-label': `select row ${row[idKey]}` }}
                    />
                  </TableCell>
                )}
                {columns.map((col) => (
                  <TableCell key={col.key} align="center">
                    {col.key === "actions" && actions
                      ? actions(row)
                      : col.render
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
  );
};

export default UserTable;
