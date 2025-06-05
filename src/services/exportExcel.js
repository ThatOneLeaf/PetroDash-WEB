import ExcelJS from "exceljs";

async function exportExcelMultiSheet(finalFilteredData, title) {
  try {
    console.log('Export data received:', finalFilteredData);

    const workbook = new ExcelJS.Workbook();

    const safeTitle = (title || 'report')
  .replace(/[^a-zA-Z0-9-_]/g, '-') // Replace non-alphanum with underscores
  .substring(0, 30); // Limit to 30 chars

    // Add basic workbook properties
    workbook.creator = 'Data Export Tool';
    workbook.created = new Date();

    const applyHeaderStyle = (headerRow) => {
      headerRow.eachCell((cell) => {
        cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF4472C4' }
        };
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        cell.alignment = { vertical: 'middle', horizontal: 'center' };
      });
    };

    if (finalFilteredData.type === 'ungrouped') {
      // Single sheet for ungrouped data
      const sheet = workbook.addWorksheet('Data');

      // Add headers
      const headers = finalFilteredData.columns.map(col => col.label || col.key);
      const headerRow = sheet.addRow(headers);
      applyHeaderStyle(headerRow);

      // Add data rows
      finalFilteredData.data.forEach((row, rowIndex) => {
        try {
          const rowData = finalFilteredData.columns.map(col => {
            let value = row[col.key];

            // Sanitize value
            if (value === null || value === undefined) {
              return '';
            }
            if (typeof value === 'object') {
              return JSON.stringify(value);
            }
            if (typeof value === 'boolean') {
              return value.toString();
            }
            return value;
          });

          sheet.addRow(rowData);
        } catch (error) {
          console.warn(`Error adding row ${rowIndex}:`, error);
        }
      });

    } else if (finalFilteredData.type === 'grouped') {
      // Multiple sheets for grouped data
      Object.entries(finalFilteredData.data).forEach(([groupKey, groupData]) => {
        try {
          let sheetName = String(groupKey)
            .replace(/[\\\/\?\*\[\]:]/g, '_') // Replace invalid chars
            .substring(0, 31);

          if (!sheetName || sheetName.trim() === '') {
            sheetName = 'Sheet_' + Math.random().toString(36).substr(2, 5);
          }

          const sheet = workbook.addWorksheet(sheetName);

          // Add headers
          const headers = finalFilteredData.columns.map(col => col.label || col.key);
          const headerRow = sheet.addRow(headers);
          applyHeaderStyle(headerRow);

          // Add data rows for this group
          if (groupData.items && Array.isArray(groupData.items)) {
            groupData.items.forEach((row, rowIndex) => {
              try {
                const rowData = finalFilteredData.columns.map(col => {
                  let value = row[col.key];

                  // Sanitize value
                  if (value === null || value === undefined) {
                    return '';
                  }
                  if (typeof value === 'object') {
                    return JSON.stringify(value);
                  }
                  if (typeof value === 'boolean') {
                    return value.toString();
                  }
                  return value;
                });

                sheet.addRow(rowData);
              } catch (error) {
                console.warn(`Error adding row ${rowIndex} to sheet ${sheetName}:`, error);
              }
            });
          }
        } catch (error) {
          console.warn(`Error creating sheet for group ${groupKey}:`, error);
        }
      });
    }

    // Ensure we have at least one worksheet
    if (workbook.worksheets.length === 0) {
      const emptySheet = workbook.addWorksheet('Empty');
      emptySheet.addRow(['No data to export']);
    }

    console.log('Generating Excel buffer...');
    const buffer = await workbook.xlsx.writeBuffer();
    console.log('Buffer generated, size:', buffer.byteLength);

    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${safeTitle}-data-${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 1000);

    console.log('Excel export completed successfully');

  } catch (error) {
    console.error("Excel export failed:", error);
    console.error("Error stack:", error.stack);

    try {
      console.log('Attempting CSV fallback...');
      createCSVFallback(finalFilteredData);
    } catch (csvError) {
      console.error("CSV fallback also failed:", csvError);
      alert("Export failed. Please check the console for details.");
    }
  }
}

function createCSVFallback(finalFilteredData) {
  let csvContent = '';

  if (finalFilteredData.type === 'ungrouped') {
    const headers = finalFilteredData.columns.map(col => col.label || col.key);
    csvContent += headers.join(',') + '\n';

    finalFilteredData.data.forEach(row => {
      const rowData = finalFilteredData.columns.map(col => {
        let value = row[col.key];
        if (value === null || value === undefined) return '';
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return String(value);
      });
      csvContent += rowData.join(',') + '\n';
    });
  } else {
    const headers = finalFilteredData.columns.map(col => col.label || col.key);
    csvContent += 'Group,' + headers.join(',') + '\n';

    Object.entries(finalFilteredData.data).forEach(([groupKey, groupData]) => {
      if (groupData.items && Array.isArray(groupData.items)) {
        groupData.items.forEach(row => {
          const rowData = finalFilteredData.columns.map(col => {
            let value = row[col.key];
            if (value === null || value === undefined) return '';
            if (typeof value === 'string' && value.includes(',')) {
              return `"${value}"`;
            }
            return String(value);
          });
          csvContent += `"${groupKey}",` + rowData.join(',') + '\n';
        });
      }
    });
  }

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${safeTitle}-data-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);

  console.log('CSV fallback export completed');
}

export default exportExcelMultiSheet;
