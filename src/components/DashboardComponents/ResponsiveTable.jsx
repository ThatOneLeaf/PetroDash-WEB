import React, { useRef, useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';

const GenericResponsiveTable = ({ data }) => {
  const containerRef = useRef(null);
  const [fontSize, setFontSize] = useState('1rem'); // Default font size

  // Update font size based on container width
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const width = entry.contentRect.width;
        // Adjust these breakpoints and sizes as needed
        if (width < 400) setFontSize('0.7rem');
        else if (width < 600) setFontSize('0.85rem');
        else if (width < 900) setFontSize('1rem');
        else setFontSize('1.1rem');
      }
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  if (!data || data.length === 0) {
    return <div>No data available.</div>;
  }

  const headers = Object.keys(data[0]);

  return (
    <TableContainer
      component={Paper}
      ref={containerRef}
      sx={{
        height: '100%',
        width: '100%',
        overflow: 'auto'
      }}
    >
      <Table stickyHeader size="small" sx={{ fontSize }}>
        <TableHead>
          <TableRow sx={{ background: 'linear-gradient(90deg, #1e3a8a 0%, #2563eb 100%)' }}>
            {headers.map((header) => (
              <TableCell
                key={header}
                sx={{
                  fontSize,
                  fontWeight: 'bold',
                  color: '#fff',
                  background: '#182959',
                  borderRight: '1px solid #e0e7ef',
                  letterSpacing: 1,
                  textTransform: 'capitalize',
                  boxShadow: '0 2px 4px 0 rgba(30,58,138,0.08)'
                }}
              >
                {header}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, index) => (
            <TableRow
              key={index}
              sx={{
                transition: 'background 0.2s',
                '&:hover': {
                  background: 'linear-gradient(90deg, #e0e7ef 0%, #f1f5f9 100%)',
                  cursor: 'pointer',
                },
              }}
            >
              {headers.map((key) => (
                <TableCell key={key} sx={{ fontSize }}>
                  {typeof row[key] === 'number'
                    ? row[key].toLocaleString()
                    : row[key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default GenericResponsiveTable;
