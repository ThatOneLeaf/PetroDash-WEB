import * as XLSX from "xlsx";

// Utility function to auto-size columns based on content
const autoSizeColumns = (worksheet, data, headers) => {
  const colWidths = [];

  // Calculate width for each column
  headers.forEach((header, colIndex) => {
    const headerLabel = typeof header === "object" ? header.label : header;
    let maxWidth = headerLabel.length; // Start with header length

    // Check data rows for max width
    data.forEach((row) => {
      const key = typeof header === "object" ? header.key : header;
      const cellValue = row[key];
      if (cellValue !== null && cellValue !== undefined) {
        const cellLength = String(cellValue).length;
        maxWidth = Math.max(maxWidth, cellLength);
      }
    });

    // Add padding and set reasonable limits
    colWidths[colIndex] = Math.min(Math.max(maxWidth + 2, 10), 50);
  });

  // Apply column widths
  worksheet["!cols"] = colWidths.map((width) => ({ width }));
};

// Main export function
const exportData = async (data, filename, columns = null) => {
  try {
    if (!data || data.length === 0) {
      alert("No data available to export");
      return;
    }

    // Determine headers
    const headers = columns || Object.keys(data[0]);

    // Create header row
    const headerRow = headers.map((header) =>
      typeof header === "object" ? header.label : header
    );

    // Create data rows
    const dataRows = data.map((row) => {
      return headers.map((header) => {
        const key = typeof header === "object" ? header.key : header;
        let value = row[key];

        // Handle different data types
        if (value === null || value === undefined) {
          return "";
        }

        // For numbers, remove any existing commas and return as number
        if (typeof value === "string" && !isNaN(value.replace(/,/g, ""))) {
          const numValue = parseFloat(value.replace(/,/g, ""));
          return isNaN(numValue) ? value : numValue;
        }

        return value;
      });
    });

    // Combine header and data
    const worksheetData = [headerRow, ...dataRows];

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

    // Auto-size columns
    autoSizeColumns(worksheet, data, headers);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

    // Generate filename with .xlsx extension
    const excelFilename = filename.endsWith(".xlsx")
      ? filename
      : `${filename}.xlsx`;

    // Write and download file
    XLSX.writeFile(workbook, excelFilename);

    console.log(`Data exported successfully as ${excelFilename}`);
  } catch (error) {
    console.error("Error exporting data:", error);
    alert("Error exporting data. Please try again.");
  }
};

export default exportData;
