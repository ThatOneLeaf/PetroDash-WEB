import * as XLSX from "xlsx";

async function exportExcelMultiSheet(finalFilteredData, title) {
  try {

    const safeTitle = (title || 'report')
      .replace(/[^a-zA-Z0-9-_]/g, '-') // Replace non-alphanum with dashes
      .substring(0, 30); // Limit to 30 chars

    let wb = XLSX.utils.book_new();

    if (finalFilteredData.type === 'ungrouped') {
      // Single sheet for ungrouped data
      const headers = finalFilteredData.columns.map(col => col.label || col.key);
      const dataRows = finalFilteredData.data.map(row =>
        finalFilteredData.columns.map(col => {
          let value = row[col.key];
          if (value === null || value === undefined) return '';
          if (typeof value === 'object') return JSON.stringify(value);
          if (typeof value === 'boolean') return value.toString();
          return value;
        })
      );
      const wsData = [headers, ...dataRows];
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      XLSX.utils.book_append_sheet(wb, ws, "Data");
    } else if (finalFilteredData.type === 'grouped') {
      // Multiple sheets for grouped data
      Object.entries(finalFilteredData.data).forEach(([groupKey, groupData]) => {
        let sheetName = String(groupKey)
          .replace(/[\\\/\?\*\[\]:]/g, '_')
          .substring(0, 31);
        if (!sheetName || sheetName.trim() === '') {
          sheetName = 'Sheet_' + Math.random().toString(36).substr(2, 5);
        }
        const headers = finalFilteredData.columns.map(col => col.label || col.key);
        const dataRows = (groupData.items || []).map(row =>
          finalFilteredData.columns.map(col => {
            let value = row[col.key];
            if (value === null || value === undefined) return '';
            if (typeof value === 'object') return JSON.stringify(value);
            if (typeof value === 'boolean') return value.toString();
            return value;
          })
        );
        const wsData = [headers, ...dataRows];
        const ws = XLSX.utils.aoa_to_sheet(wsData);
        XLSX.utils.book_append_sheet(wb, ws, sheetName);
      });
    }

    // Ensure at least one worksheet
    if (wb.SheetNames.length === 0) {
      const ws = XLSX.utils.aoa_to_sheet([['No data to export']]);
      XLSX.utils.book_append_sheet(wb, ws, "Empty");
    }

    // Write workbook to blob and trigger download
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], {
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

  } catch (error) {
    console.error("Excel export failed:", error);
    console.error("Error stack:", error.stack);

    try {
      createCSVFallback(finalFilteredData, title);
    } catch (csvError) {
      console.error("CSV fallback also failed:", csvError);
      alert("Export failed. Please check the console for details.");
    }
  }
}

function createCSVFallback(finalFilteredData, title) {
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

  // Add safeTitle logic for fallback
  const safeTitle = (title || 'report')
    .replace(/[^a-zA-Z0-9-_]/g, '-')
    .substring(0, 30);

  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${safeTitle}-data-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

export default exportExcelMultiSheet;
