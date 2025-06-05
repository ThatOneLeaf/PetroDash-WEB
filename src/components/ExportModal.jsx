import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Box,
  Paper,
  Checkbox,
  ListItemText,
  Chip,
  ToggleButton, ToggleButtonGroup
} from "@mui/material";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import exportPDFMultiSection from "../services/exportPDF";
import exportExcelMultiSheet from "../services/exportExcel";
import ButtonComp from "./ButtonComp";

// Reorderable column chip
const SortableItem = ({ id, label }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    padding: "6px 12px",
    background: "#f5f5f5",
    border: "1px solid #ccc",
    borderRadius: 6,
    marginBottom: 6,
    cursor: "move",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {label}
    </div>
  );
};

const headerCellStyle = {
  fontWeight: 'bold',
  fontSize: '1rem',
  backgroundColor: '#f0f0f0',
  color: '#182959',
  borderBottom: '2px solid #182959',
};

const DataExportModal = ({
  open,
  onClose,
  data,
  columns = [],
  columnsToShow = null, // NEW prop: array of keys to show
  excludedFields: initialExcluded = [],
  excludeGroupByFields = [],
  excludeColumnSelectionFields = [],
reportTitle = "Exported Report"
}) => {
  const [exportType, setExportType] = useState("excel");
  const [groupBy, setGroupBy] = useState("");
  const [excludedFields, setExcludedFields] = useState(initialExcluded);

  const allKeys = Object.keys(data[0] || {});

  // Use columnsToShow if provided, otherwise fall back to columns or allKeys
  const effectiveColumns = useMemo(() => {
    let baseColumns =
      columnsToShow && columnsToShow.length > 0
        ? columnsToShow.map((key) => {
            // Find matching column in columns array, or create default label
            const col = columns.find((c) => c.key === key);
            return col || { key, label: key };
          })
        : columns.length > 0
        ? columns.filter((col) => allKeys.includes(col.key))
        : allKeys.map((key) => ({ key, label: key }));
    return baseColumns;
  }, [columns, allKeys, columnsToShow]);

  const [columnOrder, setColumnOrder] = useState(
    effectiveColumns.map((c) => c.key)
  );

  const filteredColumns = useMemo(() => {
    return columnOrder
      .map((key) => effectiveColumns.find((col) => col.key === key))
      .filter(
        (col) =>
          col &&
          !excludedFields.includes(col.key) &&
          col.key !== groupBy // Exclude group-by from data table and export
      );
  }, [columnOrder, effectiveColumns, excludedFields, groupBy]);

  const groupByColumn = useMemo(() => {
    return effectiveColumns.find((col) => col.key === groupBy);
  }, [groupBy, effectiveColumns]);

  const keys = filteredColumns.map((col) => col.key);

  const groupedData = useMemo(() => {
    if (!groupBy) return { "": data };
    return data.reduce((acc, item) => {
      const raw = item[groupBy];
      const groupKey =
        raw !== undefined && raw !== null ? String(raw) : "Undefined";
      if (!acc[groupKey]) acc[groupKey] = [];
      acc[groupKey].push(item);
      return acc;
    }, {});
  }, [data, groupBy]);

  // NEW: Store the final filtered data in a dedicated variable
  const finalFilteredData = useMemo(() => {
    
    if (!data || data.length === 0) {
      console.warn('No data available for export');
      return {
        type: 'ungrouped',
        data: [],
        columns: [],
        previewData: []
      };
    }
    
if (!groupBy) {
  return {
    type: 'ungrouped',
    data: data.map((row) =>
      Object.fromEntries(
        filteredColumns.map(({ key, render }) => [
          key,
          render ? render(row[key], row) : row[key],
        ])
      )
    ),
    columns: filteredColumns,
    previewData: data.slice(0, 5),
  };
}
 else {
      // For grouped data, return the grouped structure with filtered columns
      const groupedResult = {};
Object.entries(groupedData).forEach(([groupName, groupItems]) => {
  groupedResult[groupName] = {
    items: groupItems.map((row) =>
      Object.fromEntries(
        filteredColumns.map(({ key, render }) => [
          key,
          render ? render(row[key], row) : row[key],
        ])
      )
    ),
    previewItems: groupItems.slice(0, 5),
    count: groupItems.length,
  };
});

      
      const result = {
        type: 'grouped',
        data: groupedResult,
        columns: filteredColumns,
        groupByColumn: groupByColumn,
        groupByKey: groupBy
      };
      return result;
    }
  }, [data, groupBy, groupedData, filteredColumns, groupByColumn]);

  const handleExport = async () => {
    
    if (exportType === "excel") {
        await exportExcelMultiSheet(finalFilteredData, reportTitle);
    } else if (exportType === "pdf") {
        await exportPDFMultiSection({finalFilteredData:finalFilteredData, title:reportTitle
            });   }
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
    <DialogTitle>
    <Box
        sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        }}
    >
        {/* Left side: Title */}
        <Box sx={{ width: '50%' }}>
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 800 }}>
            EXPORT DATA
        </Typography>
        <Typography sx={{ fontSize: '2rem', color: '#182959', fontWeight: 800 }}>
            {reportTitle}
        </Typography>
        </Box>

        {/* Right side: Toggle Button Group */}
        <Box
        sx={{
            width: '50%',
            display: 'flex',
            justifyContent: 'flex-end',
        }}
        >
        <ToggleButtonGroup
        value={exportType}
        exclusive
        onChange={(e, val) => {
            if (val) setExportType(val);
        }}
        aria-label="export type"
        sx={{
            mt: 2,
            backgroundColor: "#f5f5f5",
            borderRadius: "999px", // fully rounded group
            p: 0.5,
        }}
        >
        <ToggleButton
            value="excel"
            aria-label="Excel Export"
            sx={{
            textTransform: "none",
            fontWeight: "bold",
            borderRadius: "999px", // fully rounded buttons
            '&.Mui-selected': {
                backgroundColor: "#388e3c", // green
                color: "#fff",
                '&:hover': {
                backgroundColor: "#2e7d32",
                },
            },
            }}
        >
            Excel
        </ToggleButton>
        <ToggleButton
            value="pdf"
            aria-label="PDF Export"
            sx={{
            textTransform: "none",
            fontWeight: "bold",
            borderRadius: "999px", // fully rounded buttons
            '&.Mui-selected': {
                backgroundColor: "#d32f2f", // red
                color: "#fff",
                '&:hover': {
                backgroundColor: "#c62828",
                },
            },
            }}
        >
            PDF
        </ToggleButton>
        </ToggleButtonGroup>


        </Box>
    </Box>
    </DialogTitle>

<DialogContent dividers>
  <Box
    sx={{
      display: "flex",
      gap: 4,
      alignItems: "flex-start",
      maxHeight: 500,
    }}
  >
    {/* Left panel: Config controls */}
    <Paper
      elevation={1}
      sx={{
        flexBasis: "40%",
        minWidth: 280,
        maxHeight: 500,
        overflowY: "auto",
        pr: 2,
        pl: 2,
        pt: 2,
        pb: 2,
        borderRadius: 2,
        backgroundColor: "#fafafa",
      }}
    >
      <Typography variant="h6" mb={2} textAlign="center">
        Options
      </Typography>

      {/* Group By Selection */}
      <FormControl fullWidth margin="normal">
        <InputLabel id="group-by-select-label">Group By</InputLabel>
        <Select
          labelId="group-by-select-label"
          value={groupBy}
          onChange={(e) => setGroupBy(e.target.value)}
          label="Group By"
        >
          <MenuItem value="">None</MenuItem>
          {effectiveColumns
            .filter((col) => !excludeGroupByFields.includes(col.key))
            .map((col) => (
              <MenuItem key={col.key} value={col.key}>
                {col.label}
              </MenuItem>
            ))}
        </Select>
      </FormControl>

      {/* Excluded Columns */}
      <FormControl fullWidth margin="normal" variant="outlined">
        <InputLabel id="column-select-label">Columns to Exclude</InputLabel>
        <Select
          labelId="column-select-label"
          multiple
          value={excludedFields}
          onChange={(e) => {
            const value = e.target.value;
            setExcludedFields(typeof value === "string" ? value.split(",") : value);
          }}
          renderValue={(selected) => (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {selected.map((key) => {
                const label = effectiveColumns.find((col) => col.key === key)?.label || key;
                return (
                  <Chip
                    key={key}
                    label={label}
                    onDelete={() =>
                      setExcludedFields((prev) => prev.filter((item) => item !== key))
                    }
                    size="small"
                    color="primary"
                  />
                );
              })}
            </Box>
          )}
        >
          {effectiveColumns
            .filter(
              (col) =>
                !excludeColumnSelectionFields.includes(col.key) && col.key !== groupBy
            )
            .map((col) => (
              <MenuItem key={col.key} value={col.key}>
                <Checkbox checked={excludedFields.indexOf(col.key) > -1} />
                <ListItemText primary={col.label} />
              </MenuItem>
            ))}
        </Select>
      </FormControl>

      {/* Column Reordering */}
      <Box mt={3}>
        <Typography variant="subtitle1" gutterBottom>
          Reorder Columns
        </Typography>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={({ active, over }) => {
            if (active.id !== over?.id) {
              const oldIndex = columnOrder.indexOf(active.id);
              const newIndex = columnOrder.indexOf(over.id);
              setColumnOrder(arrayMove(columnOrder, oldIndex, newIndex));
            }
          }}
        >
          <SortableContext
            items={columnOrder.filter(
              (key) => key !== groupBy && !excludedFields.includes(key)
            )}
            strategy={verticalListSortingStrategy}
          >
            <Box
              sx={{
                maxHeight: 200,
                overflowY: "auto",
                border: "1px solid #ddd",
                p: 1,
                borderRadius: 1,
                backgroundColor: "#fff",
              }}
            >
              {columnOrder
                .filter((key) => key !== groupBy && !excludedFields.includes(key))
                .map((key) => {
                  const col = effectiveColumns.find((c) => c.key === key);
                  if (!col) return null;
                  return <SortableItem key={key} id={key} label={col.label} />;
                })}
            </Box>
          </SortableContext>
        </DndContext>
      </Box>
    </Paper>

    {/* Right panel: Table Preview */}
    <Box
      sx={{
        flexBasis: "60%",
        minWidth: 400,
        maxHeight: 500,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography variant="h6" mb={1} textAlign="center">
        Preview
      </Typography>
      <Paper
        elevation={1}
        sx={{
          flexGrow: 1,
          overflow: "auto",
          border: "1px solid #ddd",
          borderRadius: 2,
          p: 2,
          backgroundColor: "#fff",
        }}
      >
        {finalFilteredData.type === "ungrouped" && (
          <Table size="small" sx={{ minWidth: 600 }}>
            <TableHead>
              <TableRow>
                {finalFilteredData.columns.map((col) => (
                  <TableCell key={col.key} sx={headerCellStyle}>
                    {col.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {finalFilteredData.previewData.map((row, idx) => (
                <TableRow key={idx}>
                  {finalFilteredData.columns.map(({ key, render }, i) => (
                    <TableCell key={i}>
                      {render ? render(row[key], row) : row[key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        {finalFilteredData.type === "grouped" &&
          Object.entries(finalFilteredData.data).map(([groupName, groupData]) => {
            const displayValue = finalFilteredData.groupByColumn?.render
              ? finalFilteredData.groupByColumn.render(groupName)
              : groupName;

            return (
              <Box key={groupName} mb={3}>
                <Typography variant="subtitle1" gutterBottom>
                  {finalFilteredData.groupByColumn?.label || finalFilteredData.groupByKey}:{" "}
                  {displayValue} ({groupData.count} items)
                </Typography>
                <Table size="small" sx={{ minWidth: 600 }}>
                  <TableHead>
                    <TableRow>
                      {finalFilteredData.columns.map((col) => (
                        <TableCell key={col.key} sx={headerCellStyle}>
                          {col.label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {groupData.previewItems.map((row, idx) => (
                      <TableRow key={idx}>
                        {finalFilteredData.columns.map(({ key, render }, i) => (
                          <TableCell key={i}>
                            {render ? render(row[key], row) : row[key]}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            );
          })}
      </Paper>
    </Box>
  </Box>
</DialogContent>


      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <ButtonComp 
            label = "Export"
            rounded={true}
            onClick={handleExport}
            color="green"
        ></ButtonComp>
      </DialogActions>
    </Dialog>
  );
};

export default DataExportModal;