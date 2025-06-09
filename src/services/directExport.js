// utils/exportData.js (or wherever you want)
import exportExcelMultiSheet from "../services/exportExcel";

export async function exportExcelData(data, columns = [], reportTitle = "Exported Report") {
  const allKeys = Object.keys(data[0] || {});
  const effectiveColumns = columns.length > 0
    ? columns.filter((col) => allKeys.includes(col.key))
    : allKeys.map((key) => ({ key, label: key }));

  const columnOrder = effectiveColumns.map(c => c.key);

  const filteredColumns = columnOrder.map(key => effectiveColumns.find(col => col.key === key));

  const finalFilteredData = {
    type: 'ungrouped',
    data: data.map(row =>
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

  try {
    await exportExcelMultiSheet(finalFilteredData, reportTitle);
  } catch (error) {
    console.error("Export failed:", error);
  }
}
