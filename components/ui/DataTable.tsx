import { ReactNode } from "react";

export type DataTableColumn<T> = {
  key: string;
  header: string;
  align?: "right" | "left" | "center";
  render: (row: T) => ReactNode;
};

type Props<T> = {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  emptyMessage?: string;
  minWidth?: string;
  onRowClick?: (row: T) => void;
};

export default function DataTable<T>({
  columns,
  rows,
  rowKey,
  emptyMessage = "لا توجد بيانات",
  minWidth = "480px",
  onRowClick,
}: Props<T>) {
  return (
    <table className="w-full text-right text-sm" style={{ minWidth }}>
      <thead className="bg-primary/5 text-primary">
        <tr>
          {columns.map((col) => (
            <th
              key={col.key}
              className={`px-4 py-3 ${
                col.align === "left"
                  ? "text-left"
                  : col.align === "center"
                    ? "text-center"
                    : "text-right"
              }`}
            >
              {col.header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={columns.length} className="px-4 py-8 text-center text-brand-gray">
              {emptyMessage}
            </td>
          </tr>
        ) : (
          rows.map((row, i) => (
            <tr
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={`border-t border-surface-border transition ${
                i % 2 === 1 ? "bg-surface-muted/40" : ""
              } ${onRowClick ? "cursor-pointer hover:bg-secondary/10" : ""}`}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-4 py-3 ${
                    col.align === "left"
                      ? "text-left"
                      : col.align === "center"
                        ? "text-center"
                        : "text-right"
                  }`}
                >
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
