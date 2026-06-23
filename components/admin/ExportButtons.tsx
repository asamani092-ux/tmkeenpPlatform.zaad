"use client";

import { FileSpreadsheet, FileText } from "lucide-react";
import { exportToCsv, printTablePdf } from "@/lib/export-table";

type Props = {
  title: string;
  filename: string;
  headers: string[];
  rows: string[][];
  showPdf?: boolean;
};

export default function ExportButtons({ title, filename, headers, rows, showPdf = true }: Props) {
  return (
    <div className="mb-3 flex flex-wrap justify-end gap-2 print:hidden">
      <button
        type="button"
        onClick={() => exportToCsv(filename, headers, rows)}
        className="btn-primary inline-flex !px-4 !py-2 text-sm"
      >
        <FileSpreadsheet className="h-4 w-4" />
        تصدير Excel
      </button>
      {showPdf && (
        <button
          type="button"
          onClick={() => printTablePdf(title, headers, rows)}
          className="btn-primary inline-flex !px-4 !py-2 text-sm"
        >
          <FileText className="h-4 w-4" />
          تصدير PDF
        </button>
      )}
    </div>
  );
}
