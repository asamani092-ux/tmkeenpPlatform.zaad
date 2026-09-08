"use client";

import { useState, useTransition, useEffect, useMemo } from "react";
import { useSyncFromProps } from "@/lib/use-sync-from-props";
import { useRouter } from "next/navigation";
import { Stage } from "@/generated/prisma/client";
import { STAGE_LABELS, STAGE_ORDER } from "@/lib/stages";
import FloatingModal from "@/components/admin/FloatingModal";
import DataTable, { type DataTableColumn } from "@/components/ui/DataTable";
import DetailRow from "@/components/ui/DetailRow";
import FieldGrid from "@/components/ui/FieldGrid";
import FieldRow from "@/components/ui/FieldRow";
import SubmitButton from "@/components/ui/SubmitButton";
import { toastSuccess, toastError } from "@/lib/toast";
import { CheckCircle, ExternalLink, FileText, Trash2 } from "lucide-react";

export type ManagedBeneficiary = {
  id: string;
  name: string;
  email: string;
  phone: string;
  stage: Stage;
  pendingStage: Stage | null;
  guideId: string | null;
  guideName: string | null;
  educationLevel: string;
  experience: string;
  skills: string;
  careerInterests: string;
  cvUrl: string | null;
  certificatesUrls: string | null;
  professionalRecommendations: string;
  commitmentScore: number;
};

type GuideOption = { id: string; name: string };

type Props = {
  beneficiaries: ManagedBeneficiary[];
  guides: GuideOption[];
  initialOpenBeneficiaryId?: string | null;
  onBeneficiaryOpened?: () => void;
};

function parseCertificateLinks(raw: string | null): string[] {
  if (!raw?.trim()) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
  } catch {
    /* plain URL or comma-separated */
  }
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

export default function AdminBeneficiaryManagement({
  beneficiaries: initial,
  guides,
  initialOpenBeneficiaryId,
  onBeneficiaryOpened,
}: Props) {
  const router = useRouter();
  const [rows, setRows] = useSyncFromProps(initial);
  const [selected, setSelected] = useState<ManagedBeneficiary | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [stageFilter, setStageFilter] = useState<Stage | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!initialOpenBeneficiaryId) return;
    const match = rows.find((b) => b.id === initialOpenBeneficiaryId);
    if (match) {
      setSelected(match);
      onBeneficiaryOpened?.();
    }
  }, [initialOpenBeneficiaryId, rows, onBeneficiaryOpened]);

  /** Filter O(n); normalize query once — Space O(n) for result view */
  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const digits = q.replace(/\D/g, "");
    return rows.filter((b) => {
      if (stageFilter !== "ALL" && b.stage !== stageFilter) return false;
      if (!q) return true;
      const name = b.name.toLowerCase();
      const email = b.email.toLowerCase();
      const phone = b.phone.replace(/\D/g, "");
      return (
        name.includes(q) ||
        email.includes(q) ||
        (digits.length > 0 && phone.includes(digits))
      );
    });
  }, [rows, stageFilter, searchQuery]);

  function assign(beneficiaryId: string, guideId: string) {
    startTransition(async () => {
      const res = await fetch(`/api/beneficiaries/${beneficiaryId}/assign-guide`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guideId: guideId || null }),
      });
      const data = await res.json();
      if (!res.ok) {
        toastError(data.error || "فشل الإسناد");
        return;
      }
      const guideName = guides.find((g) => g.id === guideId)?.name ?? null;
      setRows((prev) =>
        prev.map((b) =>
          b.id === beneficiaryId ? { ...b, guideId: guideId || null, guideName } : b
        )
      );
      setSelected((s) =>
        s?.id === beneficiaryId ? { ...s, guideId: guideId || null, guideName } : s
      );
      toastSuccess("تم تحديث الإسناد");
      router.refresh();
    });
  }

  function approve(beneficiaryId: string, action: "registration" | "transition") {
    if (action === "registration") {
      const beneficiary = rows.find((b) => b.id === beneficiaryId);
      if (!beneficiary?.guideId) {
        toastError("يجب إسناد مرشد قبل اعتماد التسجيل");
        return;
      }
    }
    startTransition(async () => {
      const res = await fetch("/api/stage-approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ beneficiaryId, action }),
      });
      const data = await res.json();
      if (!res.ok) {
        toastError(data.error || "فشل الاعتماد");
        return;
      }
      const beneficiary = rows.find((b) => b.id === beneficiaryId);
      const nextStage =
        action === "registration"
          ? ("GUIDANCE" as Stage)
          : ((data.stage as Stage | undefined) ??
            beneficiary?.pendingStage ??
            beneficiary?.stage);
      const patch = {
        stage: nextStage ?? ("GUIDANCE" as Stage),
        pendingStage: null as Stage | null,
      };
      setRows((prev) =>
        prev.map((b) => (b.id === beneficiaryId ? { ...b, ...patch } : b))
      );
      setSelected((s) => (s?.id === beneficiaryId ? { ...s, ...patch } : s));
      toastSuccess("تم الاعتماد بنجاح");
      router.refresh();
    });
  }

  /** Dual confirm: arm button, then browser confirm — O(1) */
  function handleDeleteClick(beneficiaryId: string) {
    if (confirmDeleteId !== beneficiaryId) {
      setConfirmDeleteId(beneficiaryId);
      return;
    }
    const target = rows.find((b) => b.id === beneficiaryId);
    const label = target?.name ?? "هذا المستفيد";
    if (!window.confirm(`تأكيد نهائي: حذف «${label}» نهائياً؟ لا يمكن التراجع.`)) {
      setConfirmDeleteId(null);
      return;
    }
    startTransition(async () => {
      const res = await fetch(`/api/admin/beneficiaries/${beneficiaryId}`, {
        method: "DELETE",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toastError(data.error || "فشل الحذف");
        setConfirmDeleteId(null);
        return;
      }
      setRows((prev) => prev.filter((b) => b.id !== beneficiaryId));
      setSelected((s) => (s?.id === beneficiaryId ? null : s));
      setConfirmDeleteId(null);
      setEditMode(false);
      toastSuccess("تم حذف المستفيد");
      router.refresh();
    });
  }

  function handleProfileSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selected) return;
    const form = new FormData(e.currentTarget);
    startTransition(async () => {
      const guideIdRaw = String(form.get("guideId") ?? "");
      const res = await fetch(`/api/admin/beneficiaries/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          phone: form.get("phone"),
          email: form.get("email"),
          password: form.get("password") || undefined,
          educationLevel: form.get("educationLevel"),
          experience: form.get("experience"),
          skills: form.get("skills"),
          careerInterests: form.get("careerInterests"),
          guideId: guideIdRaw || null,
          stage: form.get("stage") || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toastError(data.error || "فشل التحديث");
        return;
      }
      const guideName = guides.find((g) => g.id === guideIdRaw)?.name ?? null;
      const nextStage = (form.get("stage") as Stage) || selected.stage;
      const patch = {
        name: String(form.get("name") ?? selected.name),
        phone: String(form.get("phone") ?? ""),
        email: String(form.get("email") ?? selected.email),
        educationLevel: String(form.get("educationLevel") ?? ""),
        experience: String(form.get("experience") ?? ""),
        skills: String(form.get("skills") ?? ""),
        careerInterests: String(form.get("careerInterests") ?? ""),
        guideId: guideIdRaw || null,
        guideName,
        stage: nextStage,
        pendingStage: nextStage !== selected.stage ? null : selected.pendingStage,
      };
      setRows((prev) => prev.map((b) => (b.id === selected.id ? { ...b, ...patch } : b)));
      setSelected((s) => (s ? { ...s, ...patch } : s));
      setEditMode(false);
      toastSuccess("تم تحديث بيانات المستفيد");
      router.refresh();
    });
  }

  const columns: DataTableColumn<ManagedBeneficiary>[] = [
    {
      key: "name",
      header: "اسم المستفيد",
      render: (b) => <span className="font-medium text-primary">{b.name}</span>,
    },
    {
      key: "phone",
      header: "رقم الجوال",
      render: (b) => (
        <span className="font-mono text-xs text-brand-gray" dir="ltr">
          {b.phone}
        </span>
      ),
    },
    {
      key: "stage",
      header: "المرحلة",
      render: (b) => (
        <>
          {STAGE_LABELS[b.stage]}
          {b.pendingStage && (
            <span className="ms-1 block text-xs font-semibold text-red-800">
              طلب: {STAGE_LABELS[b.pendingStage]}
            </span>
          )}
        </>
      ),
    },
    {
      key: "guide",
      header: "المرشد المسند",
      render: (b) => (
        <select
          defaultValue={b.guideId ?? ""}
          disabled={pending}
          className="input-field min-w-[110px] max-w-[140px] !rounded-lg !bg-surface-muted !py-1 !text-xs"
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => assign(b.id, e.target.value)}
        >
          <option value="">بدون مرشد</option>
          {guides.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name}
            </option>
          ))}
        </select>
      ),
    },
    {
      key: "approve",
      header: "اعتماد",
      render: (b) => {
        const showRegistration = b.stage === "PENDING_APPROVAL";
        const showTraining = b.pendingStage === "TRAINING";
        const showOtherTransition =
          b.pendingStage && b.pendingStage !== "TRAINING";
        if (!showRegistration && !showTraining && !showOtherTransition) {
          return <span className="text-xs text-brand-gray">—</span>;
        }
        return (
          <div className="flex flex-wrap justify-start gap-1" onClick={(e) => e.stopPropagation()}>
            {showRegistration && (
              <button
                type="button"
                disabled={pending || !b.guideId}
                onClick={() => approve(b.id, "registration")}
                className="btn-primary !px-3 !py-1.5 text-xs disabled:opacity-50"
                title={!b.guideId ? "يجب إسناد مرشد أولاً" : undefined}
              >
                <CheckCircle className="inline h-3 w-3" />
                اعتماد التسجيل
              </button>
            )}
            {showTraining && (
              <button
                type="button"
                disabled={pending}
                onClick={() => approve(b.id, "transition")}
                className="btn-primary !px-3 !py-1.5 text-xs"
              >
                اعتماد التدريب
              </button>
            )}
            {showOtherTransition && (
              <button
                type="button"
                disabled={pending}
                onClick={() => approve(b.id, "transition")}
                className="btn-primary !px-3 !py-1.5 text-xs"
              >
                اعتماد الانتقال
              </button>
            )}
          </div>
        );
      },
    },
    {
      key: "cv",
      header: "السيرة الذاتية",
      render: (b) =>
        b.cvUrl ? (
          <span className="text-xs font-semibold text-green-700">مرفقة</span>
        ) : (
          <span className="text-xs font-semibold text-red-600">غير مرفقة</span>
        ),
    },
    {
      key: "delete",
      header: "حذف",
      render: (b) => (
        <button
          type="button"
          disabled={pending}
          onClick={(e) => {
            e.stopPropagation();
            handleDeleteClick(b.id);
          }}
          className={`inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold ${
            confirmDeleteId === b.id
              ? "bg-red-600 text-white"
              : "text-red-600 hover:bg-red-50"
          }`}
          title={confirmDeleteId === b.id ? "اضغط مجدداً للتأكيد" : "حذف المستفيد"}
        >
          <Trash2 className="h-3.5 w-3.5" />
          {confirmDeleteId === b.id ? "تأكيد؟" : "حذف"}
        </button>
      ),
    },
  ];

  return (
    <>
      <div className="card overflow-x-auto p-0">
        <div className="border-b border-surface-border px-4 py-4 sm:px-6">
          <div className="text-start">
            <h2 className="text-xl font-bold text-primary">إدارة المستفيدين</h2>
            <p className="mt-1 text-sm text-brand-gray">
              عرض شامل، إسناد المرشدين، واعتماد المراحل — انقر على الصف لعرض الملف الكامل
            </p>
          </div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
            <label className="block min-w-[12rem] flex-1 text-start text-sm">
              <span className="mb-1 block font-semibold text-brand-gray">بحث ذكي</span>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="اسم، جوال، أو بريد…"
                className="input-field !py-2"
              />
            </label>
            <label className="block w-full text-start text-sm sm:w-56">
              <span className="mb-1 block font-semibold text-brand-gray">فلتر المرحلة</span>
              <select
                value={stageFilter}
                onChange={(e) =>
                  setStageFilter(e.target.value === "ALL" ? "ALL" : (e.target.value as Stage))
                }
                className="input-field !py-2"
              >
                <option value="ALL">كل المراحل</option>
                {STAGE_ORDER.map((s) => (
                  <option key={s} value={s}>
                    {STAGE_LABELS[s]}
                  </option>
                ))}
              </select>
            </label>
            <p className="text-xs text-brand-gray sm:ms-auto" aria-live="polite">
              المعروض: {filteredRows.length} / {rows.length}
            </p>
          </div>

          {(searchQuery.trim() || stageFilter !== "ALL") && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setStageFilter("ALL");
                }}
                className="min-h-[44px] rounded-lg px-3 py-2 text-xs font-bold"
                style={{ color: "var(--text-brand)" }}
              >
                مسح الكل
              </button>
              {searchQuery.trim() && (
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
                  style={{
                    background: "var(--primary-50)",
                    color: "var(--text-brand)",
                    border: "var(--border-hairline) solid var(--border-subtle)",
                  }}
                >
                  <button
                    type="button"
                    aria-label="إزالة مرشّح البحث"
                    onClick={() => setSearchQuery("")}
                    className="rounded-full leading-none"
                  >
                    ×
                  </button>
                  بحث: {searchQuery.trim()}
                </span>
              )}
              {stageFilter !== "ALL" && (
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold"
                  style={{
                    background: "var(--primary-50)",
                    color: "var(--text-brand)",
                    border: "var(--border-hairline) solid var(--border-subtle)",
                  }}
                >
                  <button
                    type="button"
                    aria-label="إزالة مرشّح المرحلة"
                    onClick={() => setStageFilter("ALL")}
                    className="rounded-full leading-none"
                  >
                    ×
                  </button>
                  المرحلة: {STAGE_LABELS[stageFilter]}
                </span>
              )}
            </div>
          )}
        </div>

        <DataTable
          columns={columns}
          rows={filteredRows}
          rowKey={(b) => b.id}
          minWidth="720px"
          emptyMessage="لا يوجد مستفيدون مطابقون للبحث أو الفلتر"
          onRowClick={setSelected}
          pageSize={10}
        />
      </div>

      {selected && (
        <FloatingModal
          title={selected.name}
          onClose={() => {
            setSelected(null);
            setEditMode(false);
            setConfirmDeleteId(null);
          }}
          wide
        >
          <div className="space-y-4 text-start">
            <div className="flex flex-col gap-2 rounded-lg bg-surface-muted px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="font-semibold text-primary">المرحلة: </span>
                {STAGE_LABELS[selected.stage]}
                {selected.pendingStage && (
                  <span className="ms-2 rounded bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-red-900">
                    طلب معلّق: {STAGE_LABELS[selected.pendingStage]}
                  </span>
                )}
              </div>
              <button
                type="button"
                disabled={pending}
                onClick={() => handleDeleteClick(selected.id)}
                className={`inline-flex shrink-0 items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold ${
                  confirmDeleteId === selected.id
                    ? "bg-red-600 text-white"
                    : "border border-red-200 text-red-700 hover:bg-red-50"
                }`}
              >
                <Trash2 className="h-3.5 w-3.5" />
                {confirmDeleteId === selected.id ? "تأكيد الحذف؟" : "حذف المستفيد"}
              </button>
            </div>

            {editMode ? (
              <form noValidate onSubmit={handleProfileSave} className="card-section space-y-3">
                <h4 className="font-bold text-primary">تعديل بيانات المستفيد</h4>
                <FieldRow label="الاسم" htmlFor="beneficiary-name">
                  <input
                    id="beneficiary-name"
                    name="name"
                    defaultValue={selected.name}
                    className="input-field w-full min-w-0"
                    required
                  />
                </FieldRow>
                <FieldRow label="الجوال" htmlFor="beneficiary-phone" ltr>
                  <input
                    id="beneficiary-phone"
                    name="phone"
                    defaultValue={selected.phone}
                    className="input-field w-full min-w-0"
                    dir="ltr"
                    required
                  />
                </FieldRow>
                <FieldRow label="البريد الإلكتروني" htmlFor="beneficiary-email" ltr>
                  <input
                    id="beneficiary-email"
                    name="email"
                    type="email"
                    defaultValue={selected.email}
                    className="input-field w-full min-w-0"
                    dir="ltr"
                    required
                  />
                </FieldRow>
                <FieldRow label="كلمة مرور جديدة (اختياري)" htmlFor="beneficiary-password" ltr>
                  <input
                    id="beneficiary-password"
                    name="password"
                    type="password"
                    placeholder="اتركه فارغاً للإبقاء"
                    className="input-field w-full min-w-0"
                    dir="ltr"
                  />
                </FieldRow>
                <FieldRow label="المستوى التعليمي" htmlFor="beneficiary-education">
                  <input
                    id="beneficiary-education"
                    name="educationLevel"
                    defaultValue={selected.educationLevel}
                    className="input-field w-full min-w-0"
                  />
                </FieldRow>
                <FieldRow label="المرحلة" htmlFor="beneficiary-stage">
                  <select
                    id="beneficiary-stage"
                    name="stage"
                    defaultValue={selected.stage}
                    className="input-field w-full min-w-0"
                  >
                    {STAGE_ORDER.map((s) => (
                      <option key={s} value={s}>
                        {STAGE_LABELS[s]}
                      </option>
                    ))}
                  </select>
                </FieldRow>
                <FieldRow label="المرشد" htmlFor="beneficiary-guide">
                  <select
                    id="beneficiary-guide"
                    name="guideId"
                    defaultValue={selected.guideId ?? ""}
                    className="input-field w-full min-w-0"
                  >
                    <option value="">بدون مرشد</option>
                    {guides.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </FieldRow>
                <FieldRow label="الخبرات" htmlFor="beneficiary-experience" align="start">
                  <textarea
                    id="beneficiary-experience"
                    name="experience"
                    defaultValue={selected.experience}
                    rows={2}
                    className="input-field w-full min-w-0 resize-none"
                  />
                </FieldRow>
                <FieldRow label="المهارات" htmlFor="beneficiary-skills" align="start">
                  <textarea
                    id="beneficiary-skills"
                    name="skills"
                    defaultValue={selected.skills}
                    rows={2}
                    className="input-field w-full min-w-0 resize-none"
                  />
                </FieldRow>
                <FieldRow label="الميول المهنية" htmlFor="beneficiary-career" align="start">
                  <textarea
                    id="beneficiary-career"
                    name="careerInterests"
                    defaultValue={selected.careerInterests}
                    rows={2}
                    className="input-field w-full min-w-0 resize-none"
                  />
                </FieldRow>
                <div className="flex gap-2">
                  <SubmitButton loading={pending} className="btn-primary flex-1 !py-2 text-sm">
                    حفظ التعديلات
                  </SubmitButton>
                  <button
                    type="button"
                    onClick={() => setEditMode(false)}
                    className="btn-secondary flex-1 !py-2 text-sm"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            ) : (
              <div className="card-section">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h4 className="font-bold text-primary">بيانات المستفيد</h4>
                  <button
                    type="button"
                    onClick={() => setEditMode(true)}
                    className="btn-secondary shrink-0 !px-3 !py-1.5 text-xs"
                  >
                    تعديل البيانات
                  </button>
                </div>
                <FieldGrid>
                  <DetailRow label="رقم الجوال" value={selected.phone} ltr singleLine />
                  <DetailRow label="المرشد" value={selected.guideName} singleLine />
                  <div className="sm:col-span-2">
                    <DetailRow label="البريد" value={selected.email} ltr singleLine />
                  </div>
                  <DetailRow
                    label="مؤشر الالتزام"
                    value={<span className="font-bold">{selected.commitmentScore}</span>}
                  />
                  <DetailRow label="المستوى التعليمي" value={selected.educationLevel || "—"} />
                  <div className="sm:col-span-2">
                    <DetailRow label="الخبرات" value={selected.experience || "—"} />
                  </div>
                  <div className="sm:col-span-2">
                    <DetailRow label="المهارات" value={selected.skills || "—"} />
                  </div>
                  <div className="sm:col-span-2">
                    <DetailRow label="الميول المهنية" value={selected.careerInterests || "—"} />
                  </div>
                </FieldGrid>
              </div>
            )}

            <div className="card-section space-y-2">
              <h4 className="flex items-center gap-2 font-bold text-primary">
                <FileText className="h-4 w-4" />
                الملفات المرفقة
              </h4>
              {selected.cvUrl ? (
                <a
                  href={selected.cvUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary inline-flex !px-4 !py-2 text-sm"
                >
                  <ExternalLink className="h-4 w-4" />
                  عرض السيرة الذاتية
                </a>
              ) : (
                <span className="inline-block rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-800">
                  لا يوجد سيرة ذاتية مرفقة
                </span>
              )}
              {parseCertificateLinks(selected.certificatesUrls).length > 0 ? (
                <ul className="space-y-1">
                  {parseCertificateLinks(selected.certificatesUrls).map((url, i) => (
                    <li key={url}>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-primary hover:underline"
                      >
                        شهادة {i + 1}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-brand-gray">لا توجد شهادات مرفقة</p>
              )}
            </div>

            {selected.professionalRecommendations && (
              <div className="card-section">
                <h4 className="mb-2 font-bold text-primary">التوصيات المهنية</h4>
                <p className="whitespace-pre-wrap text-sm text-brand-gray">
                  {selected.professionalRecommendations}
                </p>
              </div>
            )}

            {selected.stage === "PENDING_APPROVAL" && (
              <div className="card-section space-y-3 border-2 border-amber-200 bg-amber-50/40">
                <h4 className="font-bold text-primary">اعتماد التسجيل</h4>
                <p className="text-sm text-brand-gray">
                  1. اختر المرشد المناسب للمستفيد
                  <br />
                  2. اضغط «اعتماد التسجيل» لإكمال العملية ونقله إلى مرحلة الإرشاد
                </p>
                <div>
                  <label className="label-field">إسناد المرشد</label>
                  <select
                    value={selected.guideId ?? ""}
                    disabled={pending}
                    className="input-field"
                    onChange={(e) => assign(selected.id, e.target.value)}
                  >
                    <option value="">— اختر مرشداً —</option>
                    {guides.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>
                {!selected.guideId && (
                  <p className="text-xs font-semibold text-amber-900">
                    يجب إسناد مرشد قبل اعتماد التسجيل
                  </p>
                )}
                <button
                  type="button"
                  disabled={pending || !selected.guideId}
                  onClick={() => approve(selected.id, "registration")}
                  className="btn-primary !px-4 !py-2 text-sm disabled:opacity-50"
                >
                  <CheckCircle className="inline h-4 w-4" />
                  اعتماد التسجيل
                </button>
              </div>
            )}
          </div>
        </FloatingModal>
      )}
    </>
  );
}
