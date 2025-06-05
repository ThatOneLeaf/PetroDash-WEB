import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from '../assets/petrodashlogo.png';

function generateColumns(columns) {
  if (!columns || columns.length === 0) return [];
  return columns.map((col) => ({
    header: col.label || col.key,
    dataKey: col.key,
  }));
}

function addHeaderFooter(doc, pageNumber, totalPages, img, title) {
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;

  const imgX = 14;
  const imgY = 5;
  const desiredHeight = 4;

  let textY = imgY + 15;
  let textX = imgX;

  if (img && img.width && img.height) {
    const scale = desiredHeight / img.height;
    const imgWidth = img.width * scale;
    doc.addImage(img, 'PNG', imgX, imgY, imgWidth, desiredHeight);
  } else {
    textY = 17;
    textX = 40;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.setTextColor(0, 0, 0);
  doc.text(title || "Report", textX, textY);

  doc.setDrawColor(160);
  doc.setLineWidth(0.5);
  doc.line(14, textY + 5, pageWidth - 14, textY + 3);

  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Page ${pageNumber} of ${totalPages}`, pageWidth - 40, pageHeight - 10);

  const dateStr = `Report Generated: ${new Date().toLocaleDateString()}`;
  doc.text(dateStr, 14, pageHeight - 10);
}

async function exportPDFMultiSection({ finalFilteredData, title }) {
  const img = new Image();
  img.src = logo;
  const safeTitle = (title || 'report')
  .replace(/[^a-zA-Z0-9-_]/g, '_') // Replace non-alphanum with underscores
  .substring(0, 30); // Limit to 30 chars

  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = () => reject(new Error("Failed to load logo image"));
  });

  const doc = new jsPDF();

  if (!finalFilteredData.data || typeof finalFilteredData.data !== 'object' || Object.keys(finalFilteredData.data).length === 0) {
    window.alert("No data available to export.");
    return;
  }

  if (!finalFilteredData.columns || finalFilteredData.columns.length === 0) {
    window.alert("No columns available to export.");
    return;
  }

  const columns = generateColumns(finalFilteredData.columns);

  if (finalFilteredData.type !== 'grouped') {
    const headers = columns.map(col => col.header);
    const body = finalFilteredData.data.map(row =>
      columns.map(col => row[col.dataKey] ?? "")
    );

    autoTable(doc, {
      startY: 40,
      head: [headers],
      body,
      theme: "striped",
      headStyles: { fillColor: [22, 160, 133] },
      styles: { fontSize: 10 },
      margin: { top: 40, left: 14, right: 14 }
    });

    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      addHeaderFooter(doc, i, totalPages, img, title);
    }

    doc.save(`${safeTitle}-data-${finalFilteredData.groupByKey || 'export'}.pdf`);
    return;
  }

  const groupEntries = Object.entries(finalFilteredData.data);
  let currentY = 40;

  for (let i = 0; i < groupEntries.length; i++) {
    const [groupKey, groupInfo] = groupEntries[i];
    if (!groupInfo.items || !Array.isArray(groupInfo.items) || groupInfo.items.length === 0) {
      continue;
    }

    const rows = groupInfo.items;
    const headers = columns.map(col => col.header);
    const body = rows.map(row => columns.map(col => row[col.dataKey] ?? ""));

    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text(`${groupKey} (${groupInfo.count || rows.length} items)`, 14, currentY);
    currentY += 10;

    autoTable(doc, {
      startY: currentY,
      head: [headers],
      body,
      theme: "striped",
      headStyles: { fillColor: [22, 160, 133] },
      styles: { fontSize: 10 },
      margin: { top: 40, left: 14, right: 14 }
    });

    currentY = doc.lastAutoTable.finalY + 10;

    if (currentY > doc.internal.pageSize.height - 40 && i < groupEntries.length - 1) {
      doc.addPage();
      currentY = 30;
    }
  }

  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addHeaderFooter(doc, i, totalPages, img, title);
  }

  doc.save(`${safeTitle}-data-${finalFilteredData.groupByKey || 'export'}.pdf`);
}

export default exportPDFMultiSection;
