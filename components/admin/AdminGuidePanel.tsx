"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import FloatingModal from "@/components/admin/FloatingModal";
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

type Props = {
  guides: Guide[];
};

type ModalMode = "add" | "edit" | null;

export default function AdminGuidePanel({ guides: initial }: Props) {
  const router = useRouter();
  const [guides, setGuides] = useState(initial);
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingGuide, setEditingGuide] = useState<Guide | null>(null);
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
                  {g.email} · {g.beneficiaryCount} مستفيد
                </p>
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => openEdit(g)}
                  className="rounded p-1 text-primary hover:bg-surface-muted"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteClick(g.id)}
                  disabled={pending}
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

      {modalMode && (
        <FloatingModal
          title={modalMode === "add" ? "إضافة مرشد جديد" : "تعديل بيانات المرشد"}
          onClose={closeModal}
        >
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              name="name"
              placeholder="الاسم"
              required
              defaultValue={editingGuide?.name ?? ""}
              className="input-field"
            />
            <input
              name="email"
              type="email"
              placeholder="البريد"
              required
              defaultValue={editingGuide?.email ?? ""}
              className="input-field"
              dir="ltr"
            />
            <input
              name="phone"
              type="tel"
              placeholder="الجوال"
              required
              defaultValue={editingGuide?.phone ?? ""}
              className="input-field"
              dir="ltr"
            />
            <input
              name="password"
              type="password"
              placeholder={modalMode === "add" ? "كلمة المرور" : "كلمة مرور جديدة (اختياري)"}
              required={modalMode === "add"}
              minLength={modalMode === "add" ? 6 : undefined}
              className="input-field"
              dir="ltr"
            />
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
