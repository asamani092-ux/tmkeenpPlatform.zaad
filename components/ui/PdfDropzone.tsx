"use client";

import { useRef, useState } from "react";
import { FileText, UploadCloud, X } from "lucide-react";

type Props = {
  id: string;
  file: File | null;
  onFile: (file: File | null) => void;
  hint?: string;
  currentLabel?: string;
  maxSizeMb?: number;
};

/**
 * عقد 7.1 Dropzone + 7.2 FileRow — سحب/إفلات PDF مع زر استعراض بديل.
 * O(1) لكل حدث.
 */
export default function PdfDropzone({
  id,
  file,
  onFile,
  hint,
  currentLabel,
  maxSizeMb = 5,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function accept(candidate: File | undefined | null) {
    if (!candidate) return;
    if (candidate.type !== "application/pdf") {
      setError("نوع غير مدعوم — المسموح: PDF فقط");
      return;
    }
    if (candidate.size > maxSizeMb * 1024 * 1024) {
      setError(`حجم زائد — الحد الأقصى ${maxSizeMb} م.ب`);
      return;
    }
    setError(null);
    onFile(candidate);
  }

  return (
    <div className="w-full min-w-0">
      <div
        role="button"
        tabIndex={0}
        aria-label="إسقاط ملف PDF هنا أو استعراض"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          accept(e.dataTransfer.files?.[0]);
        }}
        className="flex min-h-[88px] cursor-pointer flex-col items-center justify-center gap-1 rounded-lg px-4 py-4 text-center transition focus:outline-none"
        style={{
          border: `var(--border-thin) dashed ${
            error
              ? "var(--danger-border)"
              : dragOver
                ? "var(--border-focus)"
                : "var(--border-default)"
          }`,
          background: dragOver ? "var(--primary-50)" : "var(--surface-raised)",
          boxShadow: dragOver ? "var(--shadow-focus)" : undefined,
        }}
      >
        <UploadCloud
          className="h-5 w-5"
          style={{ color: "var(--text-muted)" }}
          aria-hidden
        />
        <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-xs)" }}>
          اسحب ملف PDF هنا أو{" "}
          <span className="font-bold" style={{ color: "var(--text-brand)" }}>
            استعرض
          </span>
        </p>
        {hint ? (
          <p style={{ color: "var(--text-muted)", fontSize: "var(--text-2xs)" }}>
            {hint}
          </p>
        ) : null}
      </div>

      <input
        ref={inputRef}
        id={id}
        type="file"
        accept=".pdf,application/pdf"
        className="sr-only"
        onChange={(e) => accept(e.target.files?.[0])}
      />

      {error ? (
        <p
          role="alert"
          className="mt-1.5 font-medium"
          style={{ color: "var(--danger-text)", fontSize: "var(--text-2xs)" }}
        >
          {error}
        </p>
      ) : null}

      {file ? (
        <div
          className="mt-2 flex items-center gap-2 rounded-lg px-3 py-2"
          style={{
            background: "var(--surface-sunken)",
            border: "var(--border-hairline) solid var(--border-subtle)",
          }}
        >
          <FileText
            className="h-4 w-4 shrink-0"
            style={{ color: "var(--text-brand)" }}
            aria-hidden
          />
          <span
            className="min-w-0 flex-1 truncate"
            style={{ color: "var(--text-primary)", fontSize: "var(--text-xs)" }}
            dir="ltr"
          >
            {file.name}
          </span>
          <span style={{ color: "var(--text-muted)", fontSize: "var(--text-2xs)" }}>
            {(file.size / (1024 * 1024)).toFixed(1)} م.ب
          </span>
          <button
            type="button"
            aria-label="إزالة الملف"
            onClick={() => {
              onFile(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="shrink-0 rounded p-1"
            style={{ color: "var(--text-muted)" }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : currentLabel ? (
        <p className="mt-1.5" style={{ color: "var(--text-muted)", fontSize: "var(--text-2xs)" }}>
          {currentLabel}
        </p>
      ) : null}
    </div>
  );
}
