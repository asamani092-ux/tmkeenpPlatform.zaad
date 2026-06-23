"use client";

import { FileSpreadsheet } from "lucide-react";
import { exportToCsv } from "@/lib/export-table";

type Props = {
  filename: string;
  headers: string[];
  rows: string[][];
};

export default function ExportExcelButton({ filename, headers, rows }: Props) {
  return (
    <button
      type="button"
      onClick={() => exportToCsv(filename, headers, rows)}
      className="btn-primary inline-flex !px-4 !py-2 text-sm"
    >
      <FileSpreadsheet className="h-4 w-4" />
      تصدير Excel
    </button>
  );
}
