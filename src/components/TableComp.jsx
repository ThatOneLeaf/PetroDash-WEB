import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton
} from '@mui/material';

function TableComp({ columns = [], rows = [], handleSort, sortConfig, renderSortIcon }) {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow style={{ backgroundColor: '#182959' }}>
            {columns.map(({ key, label }) => (
              <TableCell
                key={key}
                onClick={() => handleSort(key)}
                style={{
                  color: 'white',
                  cursor: 'pointer',
                  padding: '16px',
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap',
                  userSelect: 'none'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  {label}
                  {renderSortIcon(key)}
                </div>
              </TableCell>
            ))}
            <TableCell
              style={{
                color: 'white', 
                padding: '16px',
                fontWeight: 'bold',
                width: '100px'
              }}
            >
              Action
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.year}
              hover
            >
              {columns.map(({ key }) => (
                <TableCell key={key}>{row[key] ? row[key].toLocaleString() : ''}</TableCell>
              ))}
              <TableCell style={{ textAlign: 'center' }}>
                <IconButton size="small">
                  {/* Add your action icon here */}
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default TableComp;