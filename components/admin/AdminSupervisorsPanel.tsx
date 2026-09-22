"use client";

import { useState, useTransition } from "react";
import { useSyncFromProps } from "@/lib/use-sync-from-props";
import { useRouter } from "next/navigation";
import FloatingModal from "@/components/admin/FloatingModal";
import EmptyState from "@/components/ui/EmptyState";
import FieldRow from "@/components/ui/FieldRow";
import SubmitButton from "@/components/ui/SubmitButton";
import { toastSuccess, toastError } from "@/lib/toast";
import { Bell, BellOff, Pencil, Trash2, UserPlus, Shield } from "lucide-react";

export type Supervisor = {
  id: string;
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
  role: "ADMIN" | "SYSTEM_ADMIN";
  notifyOnRegistration: boolean;
};

type Props = {
  supervisors: Supervisor[];
  canManage: boolean;
};

type ModalMode = "add" | "edit" | null;

export default function AdminSupervisorsPanel({
  supervisors: initial,
  canManage,
}: Props) {
  const router = useRouter();
  const [supervisors, setSupervisors] = useSyncFromProps(initial);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editing, setEditing] = useState<Supervisor | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function openAdd() {
    setEditing(null);
    setModalMode("add");
  }

  function openEdit(s: Supervisor) {
    setEditing(s);
    setModalMode("edit");
  }

  function closeModal() {
    setModalMode(null);
    setEditing(null);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canManage) return;
    const form = new FormData(e.currentTarget);
    const payload = {
      name: form.get("name"),
      email: form.get("email"),
      phone: form.get("phone"),
      password: form.get("password") || undefined,
      notifyOnRegistration: form.get("notifyOnRegistration") === "on",
      ...(editing?.role === "ADMIN"
        ? { isActive: form.get("isActive") === "on" }
        : {}),
    };

    startTransition(async () => {
      const isEdit = modalMode === "edit" && editing;
      const res = await fetch(
        isEdit ? `/api/admins/${editing!.id}` : "/api/admins",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        toastError(data.error || "فشل العملية");
        return;
      }
      closeModal();
      toastSuccess(isEdit ? "تم التحديث" : "تم إضافة المشرف");
      router.refresh();
    });
  }

  function handleDeleteClick(id: string, role: Supervisor["role"]) {
    if (!canManage || role === "SYSTEM_ADMIN") return;
    if (confirmDeleteId !== id) {
      setConfirmDeleteId(id);
      return;
    }
    startTransition(async () => {
      const res = await fetch(`/api/admins/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        toastError(data.error || "فشل الحذف");
        setConfirmDeleteId(null);
        return;
      }
      setSupervisors((prev) => prev.filter((s) => s.id !== id));
      setConfirmDeleteId(null);
      toastSuccess("تم الحذف");
      router.refresh();
    });
  }

  /** Quick toggle notify — O(1). */
  function toggleNotify(s: Supervisor) {
    if (!canManage) return;
    const next = !s.notifyOnRegistration;
    setSupervisors((prev) =>
      prev.map((row) =>
        row.id === s.id ? { ...row, notifyOnRegistration: next } : row
      )
    );
    startTransition(async () => {
      const res = await fetch(`/api/admins/${s.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notifyOnRegistration: next }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSupervisors((prev) =>
          prev.map((row) =>
            row.id === s.id
              ? { ...row, notifyOnRegistration: s.notifyOnRegistration }
              : row
          )
        );
        toastError(data.error || "فشل تحديث الإشعار");
        return;
      }
      toastSuccess(next ? "سيصله إشعار التسجيل" : "لن يصله إشعار التسجيل");
      router.refresh();
    });
  }

  return (
    <div className="card space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-bold text-primary">إدارة المشرفين</h2>
        {canManage && (
          <button type="button" onClick={openAdd} className="btn-primary !px-3 !py-2 text-sm">
            <UserPlus className="h-4 w-4" />
            إضافة مشرف
          </button>
        )}
      </div>

      {!canManage && (
        <div
          className="rounded-lg px-3 py-2 text-sm"
          style={{
            background: "var(--warning-surface, #fef3c7)",
            color: "var(--warning-text, #854d0e)",
            border: "1px solid var(--warning-border, #fde68a)",
          }}
          role="status"
        >
          عرض فقط — حسابك لا يملك صلاحية إضافة أو تعديل أو حذف المشرفين.
        </div>
      )}

      {supervisors.length === 0 && (
        <EmptyState
          icon={Shield}
          title="لا يوجد مشرفون بعد"
          body={
            canManage
              ? "أضف مشرفاً لإدارة المنصة دون صلاحيات مدير النظام."
              : "لم يُنشأ أي مشرف بعد."
          }
          action={
            canManage ? (
              <button type="button" onClick={openAdd} className="btn-primary !px-4 !py-2 text-sm">
                <UserPlus className="h-4 w-4" />
                إضافة مشرف
              </button>
            ) : undefined
          }
        />
      )}

      <ul className="space-y-2">
        {supervisors.map((s) => (
          <li key={s.id} className="rounded-lg border border-surface-border p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1 text-start">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-primary">{s.name}</p>
                  <span className="rounded bg-surface-muted px-1.5 py-0.5 text-[10px] font-medium text-brand-gray">
                    {s.role === "SYSTEM_ADMIN" ? "مدير النظام" : "مشرف"}
                  </span>
                </div>
                <p className="text-xs text-brand-gray" dir="ltr">
                  {s.email}
                </p>
                <p className="text-xs text-brand-gray" dir="ltr">
                  {s.phone}
                </p>
                <div className="mt-1 flex flex-wrap gap-2 text-xs">
                  {!s.isActive && <span className="text-red-600">غير نشط</span>}
                  <span className={s.notifyOnRegistration ? "text-primary" : "text-brand-gray"}>
                    {s.notifyOnRegistration
                      ? "يستلم إشعار التسجيل"
                      : "لا يستلم إشعار التسجيل"}
                  </span>
                </div>
              </div>
              {canManage && (
                <div className="flex shrink-0 gap-1">
                  <button
                    type="button"
                    onClick={() => toggleNotify(s)}
                    disabled={pending}
                    aria-label={
                      s.notifyOnRegistration
                        ? "إيقاف إشعار التسجيل"
                        : "تفعيل إشعار التسجيل"
                    }
                    title={
                      s.notifyOnRegistration
                        ? "إيقاف إشعار التسجيل"
                        : "تفعيل إشعار التسجيل"
                    }
                    className="rounded p-1 text-primary hover:bg-surface-muted"
                  >
                    {s.notifyOnRegistration ? (
                      <Bell className="h-4 w-4" />
                    ) : (
                      <BellOff className="h-4 w-4 opacity-60" />
                    )}
                  </button>
                  {s.role === "ADMIN" && (
                    <>
                      <button
                        type="button"
                        onClick={() => openEdit(s)}
                        aria-label="تعديل المشرف"
                        title="تعديل"
                        className="rounded p-1 text-primary hover:bg-surface-muted"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteClick(s.id, s.role)}
                        disabled={pending}
                        aria-label="حذف المشرف"
                        title="حذف"
                        className={`rounded px-2 py-1 text-xs font-semibold ${
                          confirmDeleteId === s.id
                            ? "bg-red-600 text-white"
                            : "text-red-600 hover:bg-red-50"
                        }`}
                      >
                        {confirmDeleteId === s.id ? (
                          <>
                            <Trash2 className="inline h-4 w-4" />
                            تأكيد الحذف؟
                          </>
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>

      {modalMode && canManage && (
        <FloatingModal
          title={modalMode === "add" ? "إضافة مشرف" : "تعديل مشرف"}
          onClose={closeModal}
        >
          <form onSubmit={handleSubmit} className="space-y-3">
            <FieldRow label="الاسم" htmlFor="supervisor-name">
              <input
                id="supervisor-name"
                name="name"
                required
                defaultValue={editing?.name ?? ""}
                className="input-field"
              />
            </FieldRow>
            <FieldRow label="البريد الإلكتروني" htmlFor="supervisor-email" ltr>
              <input
                id="supervisor-email"
                name="email"
                type="email"
                required
                defaultValue={editing?.email ?? ""}
                className="input-field"
                dir="ltr"
              />
            </FieldRow>
            <FieldRow label="الجوال" htmlFor="supervisor-phone" ltr>
              <input
                id="supervisor-phone"
                name="phone"
                type="tel"
                required
                defaultValue={editing?.phone ?? ""}
                className="input-field"
                dir="ltr"
              />
            </FieldRow>
            <FieldRow
              label={
                modalMode === "add" ? "كلمة المرور" : "كلمة مرور جديدة (اختياري)"
              }
              htmlFor="supervisor-password"
              ltr
            >
              <input
                id="supervisor-password"
                name="password"
                type="password"
                required={modalMode === "add"}
                minLength={modalMode === "add" ? 6 : undefined}
                placeholder={
                  modalMode === "add" ? "6 أحرف على الأقل" : "اتركه فارغاً للإبقاء"
                }
                className="input-field"
                dir="ltr"
              />
            </FieldRow>
            <label className="flex items-center gap-2 text-sm text-primary">
              <input
                type="checkbox"
                name="notifyOnRegistration"
                defaultChecked={editing?.notifyOnRegistration ?? true}
                className="h-4 w-4"
              />
              استلام إشعار عند تسجيل مستفيد جديد
            </label>
            {modalMode === "edit" && editing?.role === "ADMIN" && (
              <label className="flex items-center gap-2 text-sm text-primary">
                <input
                  type="checkbox"
                  name="isActive"
                  defaultChecked={editing.isActive}
                  className="h-4 w-4"
                />
                الحساب نشط (يمكنه تسجيل الدخول)
              </label>
            )}
            <div className="flex gap-2 pt-2">
              <SubmitButton loading={pending} className="btn-primary flex-1 !py-2 text-sm">
                {modalMode === "add" ? "حفظ المشرف" : "حفظ التعديلات"}
              </SubmitButton>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg border border-surface-border px-4 py-2 text-sm"
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
