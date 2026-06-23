/** Client-side CSV export — O(n) rows, O(n) space for lines */
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
  const blob = new Blob(["\uFEFF" + lines.join("\n")], {
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

/** Multi-section CSV — O(S + R) time, O(S + R) space */
export function exportBulkCsv(filename: string, sections: BulkExportSection[]) {
  const parts: string[] = [`sep=${CSV_DELIMITER}`];
  for (const section of sections) {
    parts.push("");
    parts.push(escapeCell(section.title));
    parts.push(section.headers.map(escapeCell).join(CSV_DELIMITER));
    for (const row of section.rows) {
      parts.push(row.map(escapeCell).join(CSV_DELIMITER));
    }
  }
  const blob = new Blob(["\uFEFF" + parts.join("\n")], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
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
body{font-family:Tahoma,Arial,sans-serif;padding:24px;direction:rtl;color:#333}
h1{color:#8b1538;font-size:20px;margin-bottom:16px}
table{width:100%;border-collapse:collapse}
th,td{border:1px solid #ccc;padding:10px;text-align:right;font-size:13px}
th{background:#8b1538;color:#fff}
tr:nth-child(even){background:#f9f9f9}
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
