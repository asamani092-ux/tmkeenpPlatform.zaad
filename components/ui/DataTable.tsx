"use client";

import { ReactNode, useMemo, useState } from "react";
import EmptyState from "@/components/ui/EmptyState";
import { ChevronLeft, ChevronRight } from "lucide-react";

export type DataTableColumnAlign = "start" | "end" | "center" | "left" | "right";

export type DataTableColumn<T> = {
  key: string;
  header: string;
  align?: DataTableColumnAlign;
  render: (row: T) => ReactNode;
};

type Props<T> = {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  emptyMessage?: string;
  minWidth?: string;
  onRowClick?: (row: T) => void;
  /** عقد 3.1: ترقيم صفحات اختياري — يظهر فقط حين تتجاوز الصفوف الحجم. */
  pageSize?: number;
  /** عقد 3.1 تجاوب: تحويل الصفوف إلى بطاقات على < 768px. */
  cardsOnMobile?: boolean;
};

function columnAlignClass(align?: DataTableColumnAlign): string {
  if (align === "center") return "text-center";
  if (align === "end" || align === "left") return "text-end";
  if (align === "start" || align === "right") return "text-start";
  return "text-start";
}

export default function DataTable<T>({
  columns,
  rows,
  rowKey,
  emptyMessage = "لا توجد بيانات",
  minWidth = "480px",
  onRowClick,
  pageSize,
  cardsOnMobile = true,
}: Props<T>) {
  const [page, setPage] = useState(1);

  const paged = useMemo(() => {
    if (!pageSize || rows.length <= pageSize) return rows;
    const start = (page - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, page, pageSize]);

  const totalPages = pageSize ? Math.max(1, Math.ceil(rows.length / pageSize)) : 1;
  const safePage = Math.min(page, totalPages);
  const visible = safePage === page ? paged : rows.slice((safePage - 1) * (pageSize ?? rows.length), safePage * (pageSize ?? rows.length));

  return (
    <div>
      <table
        className={`w-full text-sm ${cardsOnMobile ? "zad-table-cards" : ""}`}
        style={{ minWidth }}
      >
        <thead className="bg-primary/5 text-primary">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={`px-4 py-3 ${columnAlignClass(col.align)}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} data-label="">
                <EmptyState title={emptyMessage} compact />
              </td>
            </tr>
          ) : (
            visible.map((row, i) => (
              <tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                onKeyDown={
                  onRowClick
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onRowClick(row);
                        }
                      }
                    : undefined
                }
                className={`border-t border-surface-border transition ${
                  i % 2 === 1 ? "bg-surface-muted/40" : ""
                } ${onRowClick ? "cursor-pointer hover:bg-secondary/10 focus:outline-none focus-visible:bg-secondary/10 focus-visible:ring-2 focus-visible:ring-primary/40" : ""}`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    data-label={col.header}
                    className={`px-4 py-3 ${columnAlignClass(col.align)}`}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {pageSize && rows.length > pageSize ? (
        <nav
          aria-label="ترقيم الصفحات"
          className="flex items-center justify-between gap-2 border-t border-surface-border px-4 py-3"
        >
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={safePage <= 1}
            className="btn-secondary min-h-[44px] !px-3 !py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronRight className="h-4 w-4" aria-hidden />
            السابق
          </button>
          <span style={{ color: "var(--text-muted)", fontSize: "var(--text-xs)" }}>
            صفحة {safePage} من {totalPages} · {rows.length} سجل
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={safePage >= totalPages}
            className="btn-secondary min-h-[44px] !px-3 !py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            التالي
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </button>
        </nav>
      ) : null}
    </div>
  );
}
