"use client";

import { useState, useTransition } from "react";
import { useSyncFromProps } from "@/lib/use-sync-from-props";
import { useRouter } from "next/navigation";
import FloatingModal from "@/components/admin/FloatingModal";
import FieldRow from "@/components/ui/FieldRow";
import SubmitButton from "@/components/ui/SubmitButton";
import { toastSuccess, toastError } from "@/lib/toast";
import { Pencil, Trash2, UserPlus } from "lucide-react";

type Guide = {
  id: string;
  name: string;
  email: string;
  phone: string;
  beneficiaryCount: number;
};

type AssignedBeneficiary = {
  id: string;
  name: string;
  phone: string;
  stage: string;
};

type Props = {
  guides: Guide[];
  beneficiariesByGuideId: Record<string, AssignedBeneficiary[]>;
};

type ModalMode = "add" | "edit" | null;

export default function AdminGuidePanel({ guides: initial, beneficiariesByGuideId }: Props) {
  const router = useRouter();
  const [guides, setGuides] = useSyncFromProps(initial);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingGuide, setEditingGuide] = useState<Guide | null>(null);
  const [viewBeneficiariesGuide, setViewBeneficiariesGuide] = useState<Guide | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function openAdd() {
    setEditingGuide(null);
    setModalMode("add");
  }

  function openEdit(g: Guide) {
    setEditingGuide(g);
    setModalMode("edit");
  }

  function closeModal() {
    setModalMode(null);
    setEditingGuide(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const payload = {
      name: form.get("name"),
      email: form.get("email"),
      phone: form.get("phone"),
      password: form.get("password") || undefined,
    };

    startTransition(async () => {
      const isEdit = modalMode === "edit" && editingGuide;
      const res = await fetch(isEdit ? `/api/guides/${editingGuide!.id}` : "/api/guides", {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        toastError(data.error || "فشل العملية");
        return;
      }
      closeModal();
      toastSuccess(isEdit ? "تم التحديث" : "تم إضافة المرشد");
      router.refresh();
    });
  }

  function handleDeleteClick(id: string) {
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      return;
    }
    startTransition(async () => {
      const res = await fetch(`/api/guides/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        toastError(data.error || "فشل الحذف");
        setConfirmDeleteId(null);
        return;
      }
      setGuides((prev) => prev.filter((g) => g.id !== id));
      setConfirmDeleteId(null);
      toastSuccess("تم الحذف");
      router.refresh();
    });
  }

  return (
    <div className="card space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-bold text-primary">إدارة المرشدين</h2>
        <button type="button" onClick={openAdd} className="btn-primary !px-3 !py-2 text-sm">
          <UserPlus className="h-4 w-4" />
          إضافة مرشد
        </button>
      </div>

      <ul className="space-y-2">
        {guides.map((g) => (
          <li key={g.id} className="rounded-lg border border-surface-border p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1 text-start">
                <p className="font-semibold text-primary">{g.name}</p>
                <p className="text-xs text-brand-gray" dir="ltr">
                  {g.email}
                </p>
                <button
                  type="button"
                  onClick={() => setViewBeneficiariesGuide(g)}
                  className="btn-primary mt-2 !bg-red-800 !px-3 !py-1.5 text-xs"
                >
                  عرض المستفيدين ({g.beneficiaryCount})
                </button>
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => openEdit(g)}
                  aria-label="تعديل المرشد"
                  title="تعديل"
                  className="rounded p-1 text-primary hover:bg-surface-muted"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteClick(g.id)}
                  disabled={pending}
                  aria-label="حذف المرشد"
                  title="حذف"
                  className={`rounded px-2 py-1 text-xs font-semibold ${
                    confirmDeleteId === g.id
                      ? "bg-red-600 text-white"
                      : "text-red-600 hover:bg-red-50"
                  }`}
                >
                  {confirmDeleteId === g.id ? (
                    <>
                      <Trash2 className="inline h-4 w-4" />
                      تأكيد الحذف؟
                    </>
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {viewBeneficiariesGuide && (
        <FloatingModal
          title={`مستفيدو ${viewBeneficiariesGuide.name}`}
          onClose={() => setViewBeneficiariesGuide(null)}
        >
          <ul className="max-h-80 space-y-2 overflow-y-auto">
            {(beneficiariesByGuideId[viewBeneficiariesGuide.id] ?? []).length === 0 ? (
              <li className="text-sm text-brand-gray">لا يوجد مستفيدون مسندون</li>
            ) : (
              (beneficiariesByGuideId[viewBeneficiariesGuide.id] ?? []).map((b) => (
                <li
                  key={b.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-surface-border px-3 py-2 text-sm"
                >
                  <span className="font-medium text-primary">{b.name}</span>
                  <span className="font-mono text-xs text-brand-gray" dir="ltr">
                    {b.phone}
                  </span>
                </li>
              ))
            )}
          </ul>
        </FloatingModal>
      )}

      {modalMode && (
        <FloatingModal
          title={modalMode === "add" ? "إضافة مرشد جديد" : "تعديل بيانات المرشد"}
          onClose={closeModal}
        >
          <form noValidate onSubmit={handleSubmit} className="space-y-3">
            <FieldRow label="الاسم" htmlFor="guide-name">
              <input
                id="guide-name"
                name="name"
                placeholder="الاسم الكامل"
                required
                defaultValue={editingGuide?.name ?? ""}
                className="input-field"
              />
            </FieldRow>
            <FieldRow label="البريد الإلكتروني" htmlFor="guide-email" ltr>
              <input
                id="guide-email"
                name="email"
                type="email"
                placeholder="email@example.com"
                required
                defaultValue={editingGuide?.email ?? ""}
                className="input-field"
                dir="ltr"
              />
            </FieldRow>
            <FieldRow label="الجوال" htmlFor="guide-phone" ltr>
              <input
                id="guide-phone"
                name="phone"
                type="tel"
                placeholder="05xxxxxxxx"
                required
                defaultValue={editingGuide?.phone ?? ""}
                className="input-field"
                dir="ltr"
              />
            </FieldRow>
            <FieldRow
              label={modalMode === "add" ? "كلمة المرور" : "كلمة مرور جديدة (اختياري)"}
              htmlFor="guide-password"
              ltr
            >
              <input
                id="guide-password"
                name="password"
                type="password"
                placeholder={modalMode === "add" ? "6 أحرف على الأقل" : "اتركه فارغاً للإبقاء"}
                required={modalMode === "add"}
                minLength={modalMode === "add" ? 6 : undefined}
                className="input-field"
                dir="ltr"
              />
            </FieldRow>
            <div className="flex gap-2 pt-2">
              <SubmitButton loading={pending} className="btn-primary flex-1 !py-2 text-sm">
                {modalMode === "add" ? "حفظ المرشد" : "حفظ التعديلات"}
              </SubmitButton>
              <button
                type="button"
                onClick={closeModal}
                className="btn-secondary flex-1 !py-2 text-sm"
              >
                إلغاء
              </button>
            </div>
          </form>
        </FloatingModal>
      )}
    </div>
  );
}
