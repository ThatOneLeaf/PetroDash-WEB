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
  IconButton,
} from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

// Table component props documentation:
// columns: [{ key, label, align?, filterOptions?, filterMulti?, render? }]
//   - key: string, unique identifier for the column
//   - label: string, column header text
//   - align: string, alignment for cell content (optional)
//   - render: function, custom cell renderer (optional)
// rows: array of objects, each object is a row of data
// onSort: (key) => void, callback for sort changes (optional, for controlled sort)
// sortConfig: { key, direction }, current sort state (optional, for controlled sort)
// actions: (row) => ReactNode, function to render action buttons per row (optional)
// emptyMessage: string, message to show when no data (optional)
// height: string or number, fixed height for the table container (optional)
// maxHeight: string or number, maximum height for the table container (optional)
// minHeight: string or number, minimum height for the table container (optional)

const Table = ({
  columns,
  rows,
  onSort,
  sortConfig,
  actions,
  emptyMessage = "No data available.",
  height,
  maxHeight,
  minHeight,
}) => {
  // Internal sort state if not controlled by parent
  const [internalSort, setInternalSort] = React.useState({ key: null, direction: "asc" });
  // If both onSort and sortConfig are provided, sorting is controlled by parent
  const isControlled = !!onSort && !!sortConfig;

  // Use controlled or internal sort config
  const activeSort = isControlled ? sortConfig : internalSort;

  // Calculate dynamic height based on content
  const calculateDynamicHeight = () => {
    if (height) return height; // Use fixed height if provided
    
    const headerHeight = 60;
    const rowHeight = 55;
    const padding = 20;
    const minRows = 3; // Minimum rows to show
    const maxRows = 10; // Maximum rows to show without scrolling
    
    const actualRows = Math.max(minRows, Math.min(rows.length || minRows, maxRows));
    const calculatedHeight = headerHeight + (actualRows * rowHeight) + padding;
    
    // Apply min/max constraints if provided
    let finalHeight = calculatedHeight;
    if (minHeight && calculatedHeight < (typeof minHeight === 'string' ? parseInt(minHeight) : minHeight)) {
      finalHeight = minHeight;
    }
    if (maxHeight && calculatedHeight > (typeof maxHeight === 'string' ? parseInt(maxHeight) : maxHeight)) {
      finalHeight = maxHeight;
    }
    
    return finalHeight;
  };

  // Sorting logic
  // If controlled, do NOT sort here, just render rows as-is
  // If uncontrolled, sort rows locally based on activeSort
  const displayRows = isControlled ? rows : React.useMemo(() => {
    if (!activeSort || !activeSort.key) return rows;
    // Sort a shallow copy of rows array
    const sorted = [...rows].sort((a, b) => {
      const aValue = a[activeSort.key];
      const bValue = b[activeSort.key];
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;
      // Numeric sort if both values are numbers
      if (typeof aValue === "number" && typeof bValue === "number") {
        return aValue - bValue;
      }
      // String/natural sort otherwise
      return String(aValue).localeCompare(String(bValue), undefined, { numeric: true });
    });
    // Reverse if direction is descending
    return activeSort.direction === "asc" ? sorted : sorted.reverse();
  }, [rows, activeSort, isControlled]);

  // Handle header click for sorting
  const handleSort = (key) => {
    if (isControlled) {
      // Call parent sort handler
      onSort(key);
    } else {
      // Toggle sort direction or set new sort key
      setInternalSort((prev) => {
        if (prev.key === key) {
          return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
        }
        return { key, direction: "asc" };
      });
    }
  };

  // Render sort icon for active sort column
  const renderSortIcon = (key) => {
    if (!activeSort || activeSort.key !== key) return null;
    return activeSort.direction === "asc" ? (
      <ArrowUpwardIcon fontSize="small" sx={{ ml: 0.5 }} />
    ) : (
      <ArrowDownwardIcon fontSize="small" sx={{ ml: 0.5 }} />
    );
  };

  return (
    // Main container for table with horizontal scroll
    <Box sx={{ width: "100%", overflowX: "auto" }}>
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 3,
          boxShadow: "0 4px 24px rgba(24,41,89,0.08)",
          border: "1px solid #e5e8f1",
          overflow: "auto",
          minWidth: "100%",
          height: calculateDynamicHeight(),
          minHeight: minHeight || 'auto',
          maxHeight: maxHeight || 'none',
        }}
      >
        <MuiTable sx={{ minWidth: 650, tableLayout: "auto" }}>
          <TableHead>
            <TableRow
              sx={{
                background: "#182959",
                "& th": {
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
                },
              }}
            >
              {/* Render column headers */}
              {columns.map((col) => (
                // Inside Table.js, in the TableCell within displayRows.map:
                <TableCell
                  key={col.key}
                  align="center"
                  onClick={() => handleSort(col.key)}
                  sx={{
                    cursor: "pointer",
                    userSelect: "none",
                    "&:hover": { background: "#22347a" },
                    transition: "background 0.15s",
                    fontSize: 15,
                    px: 2,
                    py: 1.5,
                    borderBottom: "1px solid #f0f1f5",
                    textAlign: "center",
                    whiteSpace: "normal",
                    wordBreak: "normal",
                    overflowWrap: "break-word",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, justifyContent: "center" }}>
                    {col.label}
                    {renderSortIcon(col.key)}
                  </Box>
                </TableCell>
              ))}
              {/* Render Action header if actions prop is provided */}
              {actions && (
               // Inside Table.js, in the TableHead's TableCell for actions:
                <TableCell
                  align="center"
                  // Remove width: 100 here if you suspect it's causing issues
                  sx={{
                    fontWeight: 700,
                    width: 100,
                    color: "#fff",
                    borderBottom: "none",
                    textAlign: "center",
                    whiteSpace: "normal",
                    wordBreak: "normal",
                    overflowWrap: "break-word",
                  }}
                >
                  Action
                </TableCell>
              )}
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Show empty message if no rows */}
            {displayRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (actions ? 1 : 0)} align="center" sx={{ py: 6, color: "#b0b0b0", textAlign: "center", whiteSpace: "normal", wordBreak: "normal", overflowWrap: "break-word" }}>
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              // Render table rows
              displayRows.map((row, idx) => (
                <TableRow
                  key={row.id ?? `${row.year ?? ""}-${row.comp ?? ""}-${row.type ?? ""}-${idx}`}
                  hover
                  sx={{
                    background: "#fff",
                    "&:hover": { background: "#f6f8fc" },
                    transition: "background 0.18s",
                  }}
                >
                  {/* Render each cell for the row */}
                  {columns.map((col) => (
                    <TableCell
                      key={col.key}
                      align="center"
                      sx={{
                        fontSize: 15,
                        px: 2,
                        py: 1.5,
                        borderBottom: "1px solid #f0f1f5",
                        textAlign: "center",
                        whiteSpace: "normal",
                        wordBreak: "normal",
                        overflowWrap: "break-word",
                        overflow: "auto",
                      }}
                    >
                      {/* Use custom render if provided, else show raw value */}
                      {col.render
                        ? col.render(row[col.key], row)
                        : row[col.key]}
                    </TableCell>
                  ))}
                  {/* Render actions cell if actions prop is provided */}
                  {actions && (
                    <TableCell align="center" sx={{ borderBottom: "1px solid #f0f1f5", textAlign: "center", whiteSpace: "normal", wordBreak: "normal", overflowWrap: "break-word" }}>
                      {actions(row)}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </MuiTable>
      </TableContainer>
    </Box>
  );
};

export default Table;