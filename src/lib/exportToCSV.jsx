export function exportToCSV(filename, rows) {
    if (!rows || rows.length === 0) {
      alert("No data to export!");
      return;
    }
  
    const headers = Object.keys(rows[0]);
    const csvContent = [
      headers.join(","), 
      ...rows.map(row => headers.map(header => {
        const val = row[header] ?? "";
        // Escape double quotes and wrap text
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(","))
    ].join("\n");
  
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  