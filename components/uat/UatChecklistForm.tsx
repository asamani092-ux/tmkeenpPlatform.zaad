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
  UAT_REMAINING_TOOLS,
  UAT_REVERIFY_TOOLS,
  UAT_STORAGE_KEY,
  UAT_VERDICTS,
  type UatChecklistState,
  type UatVerdict,
} from "@/lib/uat-checklist-data";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Copy,
  FlaskConical,
  ListChecks,
} from "lucide-react";

type Scope = "reverify" | "remaining" | "all";

const VERDICT_STYLE: Record<
  UatVerdict,
  { btn: string; badge: string; bar: string }
> = {
  يعتمد: {
    btn: "border-green-600 bg-green-50 text-green-800 ring-green-600",
    badge: "bg-green-100 text-green-800",
    bar: "bg-green-600",
  },
  "يحتاج تحسين": {
    btn: "border-amber-500 bg-amber-50 text-amber-900 ring-amber-500",
    badge: "bg-amber-100 text-amber-900",
    bar: "bg-amber-500",
  },
  "غير مجرّب": {
    btn: "border-surface-border bg-surface text-brand-gray ring-surface-border",
    badge: "bg-surface-muted text-brand-gray",
    bar: "bg-surface-border",
  },
};

function loadState(): UatChecklistState {
  if (typeof window === "undefined") return createDefaultUatState();
  try {
    const raw = window.localStorage.getItem(UAT_STORAGE_KEY);
    if (!raw) {
      const defaults = createDefaultUatState();
      return {
        ...defaults,
        activeToolId: UAT_REVERIFY_TOOLS[0]?.id ?? defaults.activeToolId,
      };
    }
    const parsed = JSON.parse(raw) as UatChecklistState;
    const activeToolId =
      parsed.activeToolId &&
      UAT_ALL_TOOLS.some((t) => t.id === parsed.activeToolId)
        ? parsed.activeToolId
        : (UAT_REVERIFY_TOOLS[0]?.id ?? parsed.activeToolId ?? "");
    return {
      ...createDefaultUatState(),
      ...parsed,
      activeToolId,
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
  const [showExport, setShowExport] = useState(false);
  const [showOutOfScope, setShowOutOfScope] = useState(false);
  const [copyStatus, setCopyStatus] = useState<"idle" | "ok" | "fail">("idle");
  const [scope, setScope] = useState<Scope>("reverify");

  useEffect(() => {
    setState(loadState());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(UAT_STORAGE_KEY, JSON.stringify(state));
  }, [state, ready]);

  const visibleTools =
    scope === "reverify"
      ? UAT_REVERIFY_TOOLS
      : scope === "remaining"
        ? UAT_REMAINING_TOOLS
        : UAT_ALL_TOOLS;

  const visibleGroups =
    scope === "reverify"
      ? UAT_GROUPS.filter((g) => g.id === "reverify-fixes")
      : scope === "remaining"
        ? UAT_GROUPS.filter((g) =>
            [
              "reverify-fixes",
              "postdeploy-email",
              "email-lifecycle",
              "ui-notes",
            ].includes(g.id)
          )
        : UAT_GROUPS;

  const activeIndex = Math.max(
    0,
    visibleTools.findIndex((tool) => tool.id === state.activeToolId)
  );
  const activeTool = visibleTools[activeIndex] ?? visibleTools[0];
  const activeVerdict = activeTool
    ? (state.verdicts[activeTool.id] ?? UAT_DEFAULT_VERDICT)
    : UAT_DEFAULT_VERDICT;
  const activeNote = activeTool ? (state.notes[activeTool.id] ?? "").trim() : "";
  const noteRequired = activeVerdict === "يحتاج تحسين" && !activeNote;

  useEffect(() => {
    if (!ready || visibleTools.length === 0) return;
    if (!visibleTools.some((t) => t.id === state.activeToolId)) {
      setState((prev) => ({
        ...prev,
        activeToolId: visibleTools[0].id,
      }));
    }
  }, [ready, scope, visibleTools, state.activeToolId]);

  const stats = useMemo(() => {
    return visibleTools.reduce(
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
  }, [state.verdicts, visibleTools]);

  const exportText = useMemo(
    () => buildUatAgentExport(state, visibleTools),
    [state, visibleTools]
  );
  const reviewedCount = stats.approved + stats.needsWork;
  const progressPct =
    stats.total === 0 ? 0 : Math.round((reviewedCount / stats.total) * 100);

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
    const next = visibleTools[index];
    if (next) setState((prev) => ({ ...prev, activeToolId: next.id }));
  }

  function goPrev() {
    goTo(activeIndex <= 0 ? visibleTools.length - 1 : activeIndex - 1);
  }

  function goNext() {
    goTo(activeIndex >= visibleTools.length - 1 ? 0 : activeIndex + 1);
  }

  function setVerdict(id: string, value: UatVerdict) {
    setState((prev) => ({
      ...prev,
      verdicts: { ...prev.verdicts, [id]: value },
    }));
  }

  function saveAndNext() {
    if (noteRequired) return;
    goNext();
  }

  if (!ready) {
    return (
      <div className="card-section py-12 text-center text-brand-gray">
        جاري تحميل نموذج التقييم…
      </div>
    );
  }

  if (!activeTool) {
    return (
      <div className="card-section py-12 text-center text-brand-gray">
        لا توجد بنود في هذه الموجة.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Environment + progress */}
      <section className="overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-l from-primary/10 via-surface to-secondary/10">
        <div className="flex flex-wrap items-start justify-between gap-3 px-4 py-4 sm:px-5">
          <div className="min-w-0 text-start">
            <p className="inline-flex items-center gap-1.5 rounded-md bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-900">
              <FlaskConical className="h-3.5 w-3.5" />
              بيئة تجربة محلية فقط — غير منشورة
            </p>
            <h2 className="mt-2 flex items-center gap-2 text-lg font-bold text-primary sm:text-xl">
              <ClipboardList className="h-5 w-5 shrink-0" />
              نموذج تقييم الأدوات
            </h2>
            <p className="mt-1 text-sm text-brand-gray">
              عبّئ بنداً بنداً؛ الحفظ تلقائي في المتصفح (تراكم دون مسح).
            </p>
          </div>
          <div className="text-end">
            <p className="text-2xl font-extrabold text-primary">{progressPct}%</p>
            <p className="text-xs text-brand-gray">
              {reviewedCount}/{stats.total} مُقيَّمة
            </p>
          </div>
        </div>
        <div className="h-2 bg-surface-muted">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="grid grid-cols-2 gap-2 px-4 py-3 sm:grid-cols-4 sm:px-5">
          {[
            { label: "الإجمالي", value: stats.total, className: "text-primary" },
            {
              label: "يعتمد",
              value: stats.approved,
              className: "text-green-700",
            },
            {
              label: "يحتاج تحسين",
              value: stats.needsWork,
              className: "text-amber-700",
            },
            {
              label: "غير مجرّب",
              value: stats.untried,
              className: "text-brand-gray",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-lg bg-surface/80 px-3 py-2 text-center shadow-sm"
            >
              <div className={`text-xl font-bold ${item.className}`}>
                {item.value}
              </div>
              <div className="text-xs text-brand-gray">{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Scope */}
      <section className="card-section space-y-3">
        <p className="text-sm font-semibold text-primary">نطاق الموجة</p>
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="نطاق التقييم">
          {(
            [
              {
                id: "reverify" as const,
                label: `إعادة التحقق (${UAT_REVERIFY_TOOLS.length})`,
              },
              {
                id: "remaining" as const,
                label: `بريد + ملاحظات (${UAT_REMAINING_TOOLS.length})`,
              },
              { id: "all" as const, label: `كل البنود (${UAT_ALL_TOOLS.length})` },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={scope === tab.id}
              className={
                scope === tab.id
                  ? "btn-primary !px-3 !py-2 text-sm"
                  : "btn-secondary !px-3 !py-2 text-sm"
              }
              onClick={() => setScope(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <p className="text-xs text-brand-gray" dir="ltr">
          admin@alzaad.org · guide@alzaad.org · beneficiary1–4@alzaad.org
        </p>
      </section>

      {/* Main: list + form */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)]">
        <aside className="card-section max-h-[70vh] space-y-3 overflow-y-auto lg:sticky lg:top-4">
          <p className="flex items-center gap-1.5 text-sm font-bold text-primary">
            <ListChecks className="h-4 w-4" />
            قائمة البنود
          </p>
          {visibleGroups.map((group) => (
            <div key={group.id} className="space-y-1.5">
              <p className="text-xs font-semibold text-brand-gray">{group.title}</p>
              <ul className="space-y-1">
                {group.tools.map((tool) => {
                  const v = state.verdicts[tool.id] ?? UAT_DEFAULT_VERDICT;
                  const active = tool.id === activeTool.id;
                  return (
                    <li key={tool.id}>
                      <button
                        type="button"
                        onClick={() =>
                          setState((prev) => ({
                            ...prev,
                            activeToolId: tool.id,
                          }))
                        }
                        className={`flex w-full min-w-0 items-center gap-2 rounded-lg border px-2.5 py-2 text-start text-xs transition ${
                          active
                            ? "border-primary bg-primary/10 font-semibold text-primary"
                            : "border-transparent bg-surface-muted/60 text-brand-gray hover:border-surface-border"
                        }`}
                      >
                        <span
                          className={`h-2 w-2 shrink-0 rounded-full ${VERDICT_STYLE[v].bar}`}
                          aria-hidden
                        />
                        <span className="min-w-0 flex-1 truncate">{tool.tool}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </aside>

        <section className="card space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-surface-border pb-4">
            <div className="min-w-0 text-start">
              <p className="text-xs font-semibold text-brand-gray">
                {activeTool.groupTitle} · {activeIndex + 1}/{visibleTools.length}
              </p>
              <h3 className="mt-1 text-xl font-bold text-primary">
                {activeTool.tool}
              </h3>
              <code
                className="mt-2 inline-block max-w-full truncate rounded bg-surface-muted px-2 py-1 text-xs"
                dir="ltr"
              >
                {activeTool.path}
              </code>
            </div>
            <span
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${VERDICT_STYLE[activeVerdict].badge}`}
            >
              {activeVerdict}
            </span>
          </div>

          <div className="rounded-xl bg-surface-muted/80 px-4 py-3">
            <p className="text-xs font-semibold text-primary">ما يُتحقق منه</p>
            <p className="mt-1 text-sm leading-relaxed text-brand-gray">
              {activeTool.checks}
            </p>
            {activeTool.hint ? (
              <p className="mt-2 text-xs text-amber-800">ملاحظة: {activeTool.hint}</p>
            ) : null}
          </div>

          <div>
            <p className="label-field">التقييم</p>
            <div className="grid gap-2 sm:grid-cols-3">
              {UAT_VERDICTS.map((item) => {
                const selected = activeVerdict === item;
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setVerdict(activeTool.id, item)}
                    className={`rounded-xl border-2 px-3 py-3 text-sm font-bold transition ${
                      selected
                        ? `${VERDICT_STYLE[item].btn} ring-2`
                        : "border-surface-border bg-surface text-brand-gray hover:bg-surface-muted"
                    }`}
                  >
                    {item === "يعتمد" ? (
                      <span className="inline-flex items-center gap-1">
                        <CheckCircle2 className="h-4 w-4" />
                        {item}
                      </span>
                    ) : (
                      item
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label htmlFor="uat-category" className="label-field">
              تصنيف الملاحظة
            </label>
            <select
              id="uat-category"
              className="input-field w-full min-w-0"
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
            <label htmlFor="uat-notes" className="label-field">
              ملاحظات التجربة
              {activeVerdict === "يحتاج تحسين" ? (
                <span className="ms-1 text-red-700">* مطلوب</span>
              ) : null}
            </label>
            <textarea
              id="uat-notes"
              className={`input-field w-full min-w-0 resize-y ${
                noteRequired ? "border-red-700 ring-2 ring-red-700/20" : ""
              }`}
              rows={5}
              placeholder={
                activeVerdict === "يحتاج تحسين"
                  ? "صف الخلل أو النقص بدقة لإصلاحه…"
                  : "اختياري — اكتب ما لاحظته أثناء التجربة…"
              }
              value={state.notes[activeTool.id] ?? ""}
              onChange={(e) =>
                setState((prev) => ({
                  ...prev,
                  notes: { ...prev.notes, [activeTool.id]: e.target.value },
                }))
              }
            />
            {noteRequired ? (
              <p className="mt-1 text-xs font-medium text-red-700">
                أضف ملاحظة قبل الانتقال — بند «يحتاج تحسين» بلا ملاحظة غير مكتمل.
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t border-surface-border pt-4">
            <button
              type="button"
              className="btn-secondary !px-3 !py-2 text-sm"
              onClick={goPrev}
            >
              <ChevronRight className="h-4 w-4" />
              السابق
            </button>
            <button
              type="button"
              className="btn-primary !px-4 !py-2 text-sm disabled:opacity-50"
              disabled={noteRequired}
              onClick={saveAndNext}
            >
              حفظ والتالي
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              className="btn-secondary !px-3 !py-2 text-sm"
              onClick={() => setVerdict(activeTool.id, UAT_DEFAULT_VERDICT)}
            >
              إعادة تعيين
            </button>
            <select
              className="input-field ms-auto w-full min-w-0 sm:w-auto sm:max-w-xs !py-2 text-sm"
              aria-label="انتقال سريع"
              value={activeTool.id}
              onChange={(e) =>
                setState((prev) => ({ ...prev, activeToolId: e.target.value }))
              }
            >
              {visibleTools.map((tool, index) => (
                <option key={tool.id} value={tool.id}>
                  {index + 1}. {tool.tool}
                </option>
              ))}
            </select>
          </div>
        </section>
      </div>

      {/* Export */}
      <section
        id="uat-export"
        className="card-section space-y-3 border-primary/30"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-primary">تصدير للوكيل</h2>
            <p className="text-xs text-brand-gray">
              يشمل التقييم والتصنيف والملاحظة — لا يمسح السجل المحلي.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn-primary !px-3 !py-2 text-sm"
              onClick={copyExport}
            >
              <Copy className="h-4 w-4" />
              نسخ التقرير
            </button>
            <button
              type="button"
              className="btn-secondary !px-3 !py-2 text-sm"
              onClick={() => setShowExport((v) => !v)}
            >
              {showExport ? "إخفاء" : "معاينة"}
            </button>
          </div>
        </div>
        {copyStatus === "ok" ? (
          <p className="text-sm text-green-700">تم النسخ — الصقه في شات Cursor</p>
        ) : null}
        {copyStatus === "fail" ? (
          <p className="text-sm text-amber-800">
            فشل النسخ — افتح المعاينة وانسخ يدوياً (Ctrl+A ثم Ctrl+C)
          </p>
        ) : null}
        {showExport ? (
          <textarea
            className="input-field w-full min-w-0 resize-y font-mono text-xs"
            rows={12}
            readOnly
            dir="rtl"
            value={exportText}
            onFocus={(e) => e.currentTarget.select()}
          />
        ) : null}
      </section>

      <details
        className="card-section"
        open={showOutOfScope}
        onToggle={(e) => setShowOutOfScope((e.target as HTMLDetailsElement).open)}
      >
        <summary className="cursor-pointer font-semibold text-primary">
          خارج نطاق التجربة ({UAT_OUT_OF_SCOPE.length})
        </summary>
        <ul className="mt-3 list-disc space-y-1 pe-5 text-sm text-brand-gray">
          {UAT_OUT_OF_SCOPE.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </details>
    </div>
  );
}
