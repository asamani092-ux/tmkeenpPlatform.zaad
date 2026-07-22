"use client";

import { useEffect, useMemo, useState } from "react";
import {
  buildUatAgentExport,
  createDefaultUatState,
  UAT_ALL_TOOLS,
  UAT_DEFAULT_VERDICT,
  UAT_GROUPS,
  UAT_NOTE_CATEGORIES,
  UAT_OUT_OF_SCOPE,
  UAT_STORAGE_KEY,
  UAT_VERDICTS,
  type UatChecklistState,
  type UatVerdict,
} from "@/lib/uat-checklist-data";

function loadState(): UatChecklistState {
  if (typeof window === "undefined") return createDefaultUatState();
  try {
    const raw = window.localStorage.getItem(UAT_STORAGE_KEY);
    if (!raw) return createDefaultUatState();
    const parsed = JSON.parse(raw) as UatChecklistState;
    return {
      ...createDefaultUatState(),
      ...parsed,
      verdicts: parsed.verdicts ?? {},
      noteCategories: parsed.noteCategories ?? {},
      notes: parsed.notes ?? {},
    };
  } catch {
    return createDefaultUatState();
  }
}

export default function UatChecklistForm() {
  const [state, setState] = useState<UatChecklistState>(createDefaultUatState);
  const [ready, setReady] = useState(false);
  const [showExport, setShowExport] = useState(true);
  const [copyStatus, setCopyStatus] = useState<"idle" | "ok" | "fail">("idle");

  useEffect(() => {
    setState(loadState());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(UAT_STORAGE_KEY, JSON.stringify(state));
  }, [state, ready]);

  const activeIndex = Math.max(
    0,
    UAT_ALL_TOOLS.findIndex((tool) => tool.id === state.activeToolId)
  );
  const activeTool = UAT_ALL_TOOLS[activeIndex] ?? UAT_ALL_TOOLS[0];
  const activeVerdict = state.verdicts[activeTool.id] ?? UAT_DEFAULT_VERDICT;

  const stats = useMemo(() => {
    return UAT_ALL_TOOLS.reduce(
      (acc, tool) => {
        const v = state.verdicts[tool.id] ?? UAT_DEFAULT_VERDICT;
        acc.total += 1;
        if (v === "يعتمد") acc.approved += 1;
        else if (v === "يحتاج تحسين") acc.needsWork += 1;
        else acc.untried += 1;
        return acc;
      },
      { total: 0, approved: 0, needsWork: 0, untried: 0 }
    );
  }, [state.verdicts]);

  const exportText = useMemo(() => buildUatAgentExport(state), [state]);
  const reviewedCount = stats.approved + stats.needsWork;

  async function copyExport() {
    try {
      await navigator.clipboard.writeText(exportText);
      setCopyStatus("ok");
    } catch {
      setCopyStatus("fail");
    }
    window.setTimeout(() => setCopyStatus("idle"), 2500);
  }

  function goTo(index: number) {
    const next = UAT_ALL_TOOLS[index];
    if (next) setState((prev) => ({ ...prev, activeToolId: next.id }));
  }

  function goPrev() {
    goTo(activeIndex <= 0 ? UAT_ALL_TOOLS.length - 1 : activeIndex - 1);
  }

  function goNext() {
    goTo(activeIndex >= UAT_ALL_TOOLS.length - 1 ? 0 : activeIndex + 1);
  }

  function setVerdict(id: string, value: UatVerdict) {
    setState((prev) => ({
      ...prev,
      verdicts: { ...prev.verdicts, [id]: value },
    }));
  }

  if (!ready || !activeTool) return null;

  return (
    <div className="space-y-6">
      <div
        id="uat-export"
        className="card-section space-y-3 border-2 border-primary/40 bg-primary/5"
      >
        <h2 className="text-lg font-bold text-primary">تصدير النتائج للوكيل</h2>
        <p className="text-sm text-brand-gray">
          التقرير يشمل الأداة والتقييم والتصنيف والملاحظة كاملة. تقييماتك في المتصفح لا تُحذف.
        </p>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-primary px-4 py-2" onClick={copyExport}>
            نسخ التقرير للحافظة
          </button>
          <button
            type="button"
            className="btn-secondary px-4 py-2"
            onClick={() => setShowExport((v) => !v)}
          >
            {showExport ? "إخفاء التقرير" : "عرض التقرير"}
          </button>
          {copyStatus === "ok" ? (
            <span className="self-center text-sm text-success">تم النسخ — الصقه في شات Cursor</span>
          ) : null}
          {copyStatus === "fail" ? (
            <span className="self-center text-sm text-warning">
              فشل النسخ — حدّد النص يدوياً (Ctrl+A ثم Ctrl+C)
            </span>
          ) : null}
        </div>
        {showExport ? (
          <textarea
            className="input-field resize-y font-mono text-xs"
            rows={14}
            readOnly
            dir="rtl"
            value={exportText}
            onFocus={(e) => e.currentTarget.select()}
          />
        ) : null}
      </div>

      <div className="rounded-lg border border-surface-border bg-surface-muted p-4 text-sm text-brand-gray">
        <p>http://localhost:3000 — كلمة المرور من prisma/seed.ts</p>
        <p className="mt-1">
          admin@alzaad.org · guide@alzaad.org · beneficiary1–4@alzaad.org
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-4">
        {[
          { label: "الإجمالي", value: stats.total },
          { label: "يعتمد", value: stats.approved, className: "text-success" },
          { label: "يحتاج تحسين", value: stats.needsWork, className: "text-warning" },
          { label: "غير مجرّب", value: stats.untried },
        ].map((item) => (
          <div key={item.label} className="card-section text-center">
            <div className={`text-2xl font-bold ${item.className ?? "text-primary"}`}>
              {item.value}
            </div>
            <div className="text-sm text-brand-gray">{item.label}</div>
          </div>
        ))}
      </div>

      <div className="card-section space-y-3">
        <label htmlFor="tool-select" className="label-field">
          اختر الأداة
        </label>
        <select
          id="tool-select"
          className="input-field"
          value={activeTool.id}
          onChange={(e) =>
            setState((prev) => ({ ...prev, activeToolId: e.target.value }))
          }
        >
          {UAT_ALL_TOOLS.map((tool, index) => (
            <option key={tool.id} value={tool.id}>
              {index + 1}. {tool.tool} — {tool.groupTitle}
            </option>
          ))}
        </select>
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="btn-secondary px-4 py-2" onClick={goPrev}>
            السابق
          </button>
          <span className="text-sm text-brand-gray">
            {activeIndex + 1} / {UAT_ALL_TOOLS.length}
          </span>
          <button type="button" className="btn-secondary px-4 py-2" onClick={goNext}>
            التالي
          </button>
          <span className="mr-auto rounded-full bg-surface-muted px-3 py-1 text-sm">
            {activeVerdict}
          </span>
        </div>
      </div>

      <div className="card space-y-4">
        <div>
          <h2 className="text-xl font-bold text-primary">{activeTool.tool}</h2>
          <p className="text-sm text-brand-gray">{activeTool.groupTitle}</p>
        </div>

        <div>
          <p className="label-field">المسار</p>
          <code className="mt-1 block rounded bg-surface-muted px-3 py-2 text-sm" dir="ltr">
            {activeTool.path}
          </code>
        </div>

        <div>
          <p className="label-field">ما يُتحقق منه</p>
          <p className="text-sm text-brand-gray">
            {activeTool.checks}
            {activeTool.hint ? ` (${activeTool.hint})` : ""}
          </p>
        </div>

        <div>
          <label htmlFor="verdict" className="label-field">
            التقييم
          </label>
          <select
            id="verdict"
            className="input-field"
            value={activeVerdict}
            onChange={(e) => setVerdict(activeTool.id, e.target.value as UatVerdict)}
          >
            {UAT_VERDICTS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="category" className="label-field">
            تصنيف الملاحظة
          </label>
          <select
            id="category"
            className="input-field"
            value={state.noteCategories[activeTool.id] ?? ""}
            onChange={(e) =>
              setState((prev) => ({
                ...prev,
                noteCategories: {
                  ...prev.noteCategories,
                  [activeTool.id]: e.target.value,
                },
              }))
            }
          >
            {UAT_NOTE_CATEGORIES.map((item) => (
              <option key={item.value || "none"} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="notes" className="label-field">
            ملاحظات التجربة
          </label>
          <textarea
            id="notes"
            className="input-field resize-none"
            rows={5}
            placeholder="اكتب ما لاحظته أثناء التجربة…"
            value={state.notes[activeTool.id] ?? ""}
            onChange={(e) =>
              setState((prev) => ({
                ...prev,
                notes: { ...prev.notes, [activeTool.id]: e.target.value },
              }))
            }
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-primary px-4 py-2" onClick={goNext}>
            حفظ والانتقال للتالي
          </button>
          <button
            type="button"
            className="btn-secondary px-4 py-2"
            onClick={() => setVerdict(activeTool.id, UAT_DEFAULT_VERDICT)}
          >
            إعادة تعيين
          </button>
        </div>
      </div>

      <details className="card-section">
        <summary className="cursor-pointer font-semibold text-primary">
          ملخص سريع ({reviewedCount}/{stats.total} مُقيَّمة)
        </summary>
        <div className="mt-4 space-y-4">
          {UAT_GROUPS.map((group) => (
            <div key={group.id}>
              <p className="mb-2 font-semibold">{group.title}</p>
              <div className="flex flex-wrap gap-2">
                {group.tools.map((tool) => {
                  const v = state.verdicts[tool.id] ?? UAT_DEFAULT_VERDICT;
                  return (
                    <button
                      key={tool.id}
                      type="button"
                      className={`rounded-full border px-3 py-1 text-xs ${
                        tool.id === activeTool.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-surface-border bg-surface"
                      }`}
                      onClick={() =>
                        setState((prev) => ({ ...prev, activeToolId: tool.id }))
                      }
                    >
                      {tool.tool} · {v}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </details>

      <div className="card-section space-y-2">
        <h3 className="font-bold text-primary">خارج نطاق التجربة</h3>
        {UAT_OUT_OF_SCOPE.map((line) => (
          <p key={line} className="text-sm text-brand-gray">
            • {line}
          </p>
        ))}
      </div>
    </div>
  );
}
