"use client";

import { FileSpreadsheet } from "lucide-react";
import { exportBulkExcel, type BulkExportSection } from "@/lib/export-table";

type Props = {
  sections: BulkExportSection[];
};

export default function AdminBulkExport({ sections }: Props) {
  return (
    <button
      type="button"
      onClick={() => exportBulkExcel("tmkeen-admin-export", sections)}
      className="btn-primary inline-flex !px-4 !py-2 text-sm"
      title="ملف Excel بورقة لكل قسم"
    >
      <FileSpreadsheet className="h-4 w-4" />
      تصدير Excel (أوراق متعددة)
    </button>
  );
}
