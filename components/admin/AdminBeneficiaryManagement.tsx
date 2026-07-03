"use client";

import { useState, useTransition, useEffect } from "react";
import { useSyncFromProps } from "@/lib/use-sync-from-props";
import { useRouter } from "next/navigation";
import { Stage } from "@/generated/prisma/client";
import { STAGE_LABELS } from "@/lib/stages";
import FloatingModal from "@/components/admin/FloatingModal";
import DataTable, { type DataTableColumn } from "@/components/ui/DataTable";
import DetailRow from "@/components/ui/DetailRow";
import FieldGrid from "@/components/ui/FieldGrid";
import FieldRow from "@/components/ui/FieldRow";
import SubmitButton from "@/components/ui/SubmitButton";
import { toastSuccess, toastError } from "@/lib/toast";
import { CheckCircle, ExternalLink, FileText } from "lucide-react";

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
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!initialOpenBeneficiaryId) return;
    const match = rows.find((b) => b.id === initialOpenBeneficiaryId);
    if (match) {
      setSelected(match);
      onBeneficiaryOpened?.();
    }
  }, [initialOpenBeneficiaryId, rows, onBeneficiaryOpened]);

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
      toastSuccess("تم الاعتماد بنجاح");
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
          phone: form.get("phone"),
          email: form.get("email"),
          password: form.get("password") || undefined,
          educationLevel: form.get("educationLevel"),
          experience: form.get("experience"),
          skills: form.get("skills"),
          careerInterests: form.get("careerInterests"),
          guideId: guideIdRaw || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toastError(data.error || "فشل التحديث");
        return;
      }
      const guideName = guides.find((g) => g.id === guideIdRaw)?.name ?? null;
      const patch = {
        phone: String(form.get("phone") ?? ""),
        email: String(form.get("email") ?? selected.email),
        educationLevel: String(form.get("educationLevel") ?? ""),
        experience: String(form.get("experience") ?? ""),
        skills: String(form.get("skills") ?? ""),
        careerInterests: String(form.get("careerInterests") ?? ""),
        guideId: guideIdRaw || null,
        guideName,
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
        </div>

        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(b) => b.id}
          minWidth="720px"
          emptyMessage="لا يوجد مستفيدون"
          onRowClick={setSelected}
        />
      </div>

      {selected && (
        <FloatingModal
          title={selected.name}
          onClose={() => {
            setSelected(null);
            setEditMode(false);
          }}
          wide
        >
          <div className="space-y-4 text-start">
            <div className="flex flex-col gap-0.5 rounded-lg bg-surface-muted px-3 py-2 text-sm sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="font-semibold text-primary">المرحلة: </span>
                {STAGE_LABELS[selected.stage]}
                {selected.pendingStage && (
                  <span className="ms-2 rounded bg-yellow-100 px-2 py-0.5 text-xs font-semibold text-red-900">
                    طلب معلّق: {STAGE_LABELS[selected.pendingStage]}
                  </span>
                )}
              </div>
            </div>

            {editMode ? (
              <form onSubmit={handleProfileSave} className="card-section space-y-3">
                <h4 className="font-bold text-primary">تعديل بيانات المستفيد</h4>
                <FieldRow label="الجوال" htmlFor="beneficiary-phone" ltr>
                  <input
                    id="beneficiary-phone"
                    name="phone"
                    defaultValue={selected.phone}
                    className="input-field"
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
                    className="input-field"
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
                    className="input-field"
                    dir="ltr"
                  />
                </FieldRow>
                <FieldRow label="المستوى التعليمي" htmlFor="beneficiary-education">
                  <input
                    id="beneficiary-education"
                    name="educationLevel"
                    defaultValue={selected.educationLevel}
                    className="input-field"
                  />
                </FieldRow>
                <FieldRow label="المرشد" htmlFor="beneficiary-guide">
                  <select
                    id="beneficiary-guide"
                    name="guideId"
                    defaultValue={selected.guideId ?? ""}
                    className="input-field"
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
                    className="input-field resize-none"
                  />
                </FieldRow>
                <FieldRow label="المهارات" htmlFor="beneficiary-skills" align="start">
                  <textarea
                    id="beneficiary-skills"
                    name="skills"
                    defaultValue={selected.skills}
                    rows={2}
                    className="input-field resize-none"
                  />
                </FieldRow>
                <FieldRow label="الميول المهنية" htmlFor="beneficiary-career" align="start">
                  <textarea
                    id="beneficiary-career"
                    name="careerInterests"
                    defaultValue={selected.careerInterests}
                    rows={2}
                    className="input-field resize-none"
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
                  <DetailRow label="رقم الجوال" value={selected.phone} ltr />
                  <DetailRow label="البريد" value={selected.email} ltr />
                  <DetailRow label="المرشد" value={selected.guideName} />
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
