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
  Checkbox,
  IconButton,
  Tooltip,
} from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

// Table component props documentation:
// columns: [{ key, label, align?, filterOptions?, filterMulti?, render? }]
//   - key: string, unique identifier for the column
//   - label: string, column header text
//   - align: string, alignment for cell content (optional)
//   - render: function, custom cell renderer (optional)
// rows: array of objects, ALL data (not pre-paginated)
// page: number, current page (1-based, optional - defaults to 1)
// rowsPerPage: number, rows per page (optional - defaults to 10)
// onPageChange: (newPage) => void, callback for page changes (optional)
// initialSort: { key, direction }, initial sort config (optional)
// onSort: (key) => void, callback for sort changes (optional, for external tracking)
// actions: (row) => ReactNode, function to render action buttons per row (optional)
// onRowClick: (row) => ReactNode, callback function that is triggered when a user clicks on a table row.
// emptyMessage: string, message to show when no data (optional)
// height: string or number, fixed height for the table container (optional)
// maxHeight: string or number, maximum height for the table container (optional)
// minHeight: string or number, minimum height for the table container (optional)
// selectable: boolean, whether to show checkboxes for row selection (optional - defaults to true)

// Improved abbreviation: skip stopwords, ignore symbols/parentheses, keep numbers, max 4 chars
const STOPWORDS = ["of", "the", "and", "for", "to", "in", "on", "at", "by", "with", "from", "as", "an", "a"];
const abbreviateHeader = (label) => {
  // Remove content in parentheses and trim
  let cleanLabel = label.replace(/\(.*?\)/g, '').trim();
  // Remove non-alphanumeric except spaces
  cleanLabel = cleanLabel.replace(/[^\w\s\d]/g, '');
  const words = cleanLabel.split(/\s+/).filter(Boolean);
  if (words.length > 2) {
    // Filter out stopwords, but always keep at least two words
    const filtered = words.filter(w => !STOPWORDS.includes(w.toLowerCase()));
    const useWords = filtered.length >= 2 ? filtered : words;
    // If a word is a number, keep it as is, else take first letter
    let abbr = useWords.map(w =>
      /^\d+$/.test(w) ? w : w[0].toUpperCase()
    ).join('');
    // Limit abbreviation to 2-4 chars for readability
    if (abbr.length > 4) abbr = abbr.slice(0, 4);
    return abbr;
  }
  return label;
};

const Table = ({
  columns,
  rows, // ALL data, not pre-paginated
  filteredData = [], // <-- ensure default to []
  page = 1,
  idKey,
  rowsPerPage = 10,
  onPageChange,
  initialSort = { key: null, direction: "asc" },
  onSort,
  actions,
  onRowClick,
  emptyMessage = "No data available.",
  height,
  maxHeight,
  minHeight,
  onSelectionChange,
  selectable = true, // New prop with default value true
}) => {
  // Internal sort state - always used for actual sorting
  const [sortConfig, setSortConfig] = React.useState(initialSort);
  const [selected, setSelected] = React.useState([]); // State for selected row IDs
  const minRows = 3; // Minimum number of rows to show

  // Calculate dynamic height based on content
  const calculateDynamicHeight = () => {
    if (height) return height; // Use fixed height if provided
    
    const headerHeight = 60;
    const rowHeight = 55;
    const padding = 20;
    const minRows = 3; // Minimum rows to show
    const maxRows = Math.min(rowsPerPage, 10); // Use rowsPerPage but cap at 10
    
    const actualRows = Math.max(minRows, Math.min(rowsPerPage, maxRows));
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

  // UNIFIED SORTING LOGIC: Always sort ALL data first
  const sortedData = React.useMemo(() => {
    if (!sortConfig || !sortConfig.key || !rows) return rows || [];
    
    const sorted = [...rows].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;
      
      // Numeric sort if both values are numbers
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
      }
      
      // String/natural sort with numeric handling
      const comparison = String(aValue).localeCompare(String(bValue), undefined, { 
        numeric: true,
        sensitivity: 'base'
      });
      
      return sortConfig.direction === "asc" ? comparison : -comparison;
    });
    
    return sorted;
  }, [rows, sortConfig]);

  // PAGINATION: Apply after sorting
  const paginatedData = React.useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return sortedData.slice(startIndex, endIndex);
  }, [sortedData, page, rowsPerPage]);

  // Calculate total pages
  const totalPages = Math.ceil((sortedData?.length || 0) / rowsPerPage);

  // Handle header click for sorting
  const handleSort = (key) => {
    setSortConfig((prev) => {
      const newConfig = {
        key,
        direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc"
      };
      
      // Call external sort callback if provided (for tracking/analytics)
      if (onSort) {
        onSort(key);
      }
      
      // Reset to page 1 when sorting changes
      if (onPageChange && page !== 1) {
        onPageChange(1);
      }
      
      return newConfig;
    });
  };

  // Render sort icon for active sort column
  const renderSortIcon = (key) => {
    if (!sortConfig || sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? (
      <ArrowUpwardIcon fontSize="small" sx={{ ml: 0.5 }} />
    ) : (
      <ArrowDownwardIcon fontSize="small" sx={{ ml: 0.5 }} />
    );
  };

  // Defensive: ensure columns and paginatedData are always arrays
  const safeColumns = Array.isArray(columns) ? columns : [];
  const safePaginatedData = Array.isArray(paginatedData) ? paginatedData : [];
  const safeFilteredData = Array.isArray(filteredData) ? filteredData : [];

  // All IDs in filteredData (for select all)
  const allFilteredIds = React.useMemo(
    () => safeFilteredData.map(row => row[idKey]),
    [safeFilteredData, idKey]
  );

  // All IDs in paginatedData (for current page)
  const paginatedIds = React.useMemo(
    () => safePaginatedData.map(row => row[idKey]),
    [safePaginatedData, idKey]
  );

  // Selection logic for checkboxes
  const isAllSelected = allFilteredIds.length > 0 && allFilteredIds.every(id => selected.includes(id));
  const isIndeterminate = selected.length > 0 && !isAllSelected;

  // Handler for TableHead checkbox (select all filteredData)
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      // If TableHead checkbox is checked, select all filteredData
      setSelected(allFilteredIds);
      if (onSelectionChange) onSelectionChange(allFilteredIds);
    } else {
      // If unchecked, clear all selection
      setSelected([]);
      if (onSelectionChange) onSelectionChange([]);
    }
  };

  // Handler for TableBody checkbox (select single row in current page)
  const handleSelectRow = (id) => {
    let newSelected;
    if (selected.includes(id)) {
      newSelected = selected.filter(selId => selId !== id);
    } else {
      newSelected = [...selected, id];
    }
    setSelected(newSelected);
    if (onSelectionChange) onSelectionChange(newSelected);
  };

  // Before using data.map anywhere
  const safeRows = Array.isArray(rows) ? rows : [];

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
              {/* Checkbox header cell - only if selectable is true */}
              {selectable && (
                <TableCell
                  padding="checkbox"
                  sx={{
                    background: "#182959",
                    color: "#fff",
                    borderBottom: "none",
                    position: "sticky",
                    left: 0,
                    top: 0,
                    zIndex: 3,
                    width: 48,
                    textAlign: "center",
                  }}
                >
                  <Checkbox
                    color="primary"
                    indeterminate={isIndeterminate}
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    inputProps={{ "aria-label": "select all rows" }}
                    sx={{ color: "#fff", '&.Mui-checked': { color: "#fff" }, ml: 0.5 }}
                  />
                </TableCell>
              )}

              {/* Render column headers */}
              {safeColumns.map((col) => {
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
                        fontWeight: 700,
                        display: "inline-block",
                        minWidth: 32,
                        textAlign: "center"
                      }}>
                        {abbreviateHeader(col.label)}
                      </span>
                    </Tooltip>
                  )
                  : col.label;
                return (
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
                      {headerContent}
                      {renderSortIcon(col.key)}
                    </Box>
                  </TableCell>
                );
              })}

              {/* Render Action header if actions prop is provided */}
              {actions && (
                <TableCell
                  align="center"
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
            {safePaginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={safeColumns.length + (actions ? 1 : 0) + (selectable ? 1 : 0)} align="center" sx={{ py: 6, color: "#b0b0b0", textAlign: "center", whiteSpace: "normal", wordBreak: "normal", overflowWrap: "break-word" }}>
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              // Render table rows (paginated data)
              safePaginatedData.map((row, idx) => (
                <TableRow
                  key={row[idKey] ?? `${row.year ?? ""}-${row.comp ?? ""}-${row.type ?? ""}-${idx}`}
                  hover
                  sx={{
                    background: "#fff",
                    "&:hover": { background: "#f6f8fc" },
                    transition: "background 0.18s",
                  }}
                  onClick={() => {
                    if (onRowClick) onRowClick(row);
                  }}
                  selected={selectable && selected.includes(row[idKey])}
                >
                  {/* Checkbox cell - only if selectable is true */}
                  {selectable && (
                    <TableCell
                      padding="checkbox"
                      sx={{
                        left: 0,
                        background: "#fff",
                        zIndex: 1,
                        width: 48,
                        textAlign: "center",
                      }}
                      onClick={e => e.stopPropagation()}
                    >
                      <Checkbox
                        color="primary"
                        checked={selected.includes(row[idKey])}
                        onChange={() => handleSelectRow(row[idKey])}
                        inputProps={{ "aria-label": `select row ${row[idKey]}` }}
                      />
                    </TableCell>
                  )}

                  {/* Render each cell for the row */}
                  {safeColumns.map((col) => (
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
