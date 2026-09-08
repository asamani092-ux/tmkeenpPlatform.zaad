/** Client-side CSV / Excel export — O(n) rows */
import * as XLSX from "xlsx";

const CSV_DELIMITER = ";";

function escapeCell(cell: string) {
  const s = String(cell ?? "");
  if (s.includes(CSV_DELIMITER) || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function buildCsvLines(headers: string[], rows: string[][]) {
  return [
    `sep=${CSV_DELIMITER}`,
    headers.map(escapeCell).join(CSV_DELIMITER),
    ...rows.map((row) => row.map(escapeCell).join(CSV_DELIMITER)),
  ];
}

export function exportToCsv(
  filename: string,
  headers: string[],
  rows: string[][]
) {
  const lines = buildCsvLines(headers, rows);
  const blob = new Blob(["\uFEFF" + lines.join("\r\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export type BulkExportSection = {
  title: string;
  headers: string[];
  rows: string[][];
};

function sheetName(title: string, index: number) {
  const base = title.replace(/[\\/?*\[\]:]/g, " ").trim().slice(0, 28);
  return base || `ورقة ${index + 1}`;
}

/** One workbook with a sheet per section — O(n) cells */
export function exportBulkExcel(filename: string, sections: BulkExportSection[]) {
  const wb = XLSX.utils.book_new();
  sections.forEach((section, index) => {
    const aoa = [section.headers, ...section.rows];
    const ws = XLSX.utils.aoa_to_sheet(aoa);
    XLSX.utils.book_append_sheet(wb, ws, sheetName(section.title, index));
  });
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

/** @deprecated prefer exportBulkExcel — kept for callers that still want CSV */
export function exportBulkCsv(filename: string, sections: BulkExportSection[]) {
  exportBulkExcel(filename, sections);
}

export function printTablePdf(title: string, headers: string[], rows: string[][]) {
  const w = window.open("", "_blank");
  if (!w) return;
  const head = headers.map((h) => `<th>${h}</th>`).join("");
  const body = rows
    .map((row) => `<tr>${row.map((c) => `<td>${String(c ?? "")}</td>`).join("")}</tr>`)
    .join("");
  w.document.write(`<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="utf-8"><title>${title}</title>
<style>
body{font-family:Tajawal,Tahoma,Arial,sans-serif;padding:24px;direction:rtl;color:#3c3a3b}
h1{color:#7b1e3a;font-size:20px;margin-bottom:16px}
table{width:100%;border-collapse:collapse}
th,td{border:1px solid #d2d0d1;padding:10px;text-align:right;font-size:13px}
th{background:#7b1e3a;color:#fff}
tr:nth-child(even){background:#f5f5f5}
</style></head><body>
<h1>${title}</h1>
<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>
</body></html>`);
  w.document.close();
  w.focus();
  w.print();
}

export function printAsPdf(title: string) {
  const prev = document.title;
  document.title = title;
  window.print();
  document.title = prev;
}
