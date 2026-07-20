"use client";

import { FileSpreadsheet } from "lucide-react";
import { exportBulkCsv, type BulkExportSection } from "@/lib/export-table";

type Props = {
  sections: BulkExportSection[];
};

export default function AdminBulkExport({ sections }: Props) {
  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={() => exportBulkCsv("tmkeen-admin-export", sections)}
        className="btn-primary inline-flex !px-4 !py-2 text-sm"
      >
        <FileSpreadsheet className="h-4 w-4" />
        تصدير CSV
      </button>
      <p className="max-w-xs text-end text-xs text-brand-gray">
        ملف UTF-8 بفاصل فاصلة منقوطة (;) وBOM — في Excel: بيانات ← من نص/CSV، أو افتحه مباشرة
        في Google Sheets. إن ظهرت أعمدة ملتصقة استخدم «نص إلى أعمدة» مع الفاصل ;
      </p>
    </div>
  );
}
