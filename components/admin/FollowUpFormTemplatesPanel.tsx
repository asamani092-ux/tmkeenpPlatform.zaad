"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import FollowUpFormTemplateCard, {
  type FollowUpFormTemplate,
} from "@/components/admin/FollowUpFormTemplateCard";
import FollowUpFormTemplateModal from "@/components/admin/FollowUpFormTemplateModal";
import FollowUpFormPreview from "@/components/admin/FollowUpFormPreview";
import FloatingModal from "@/components/admin/FloatingModal";
import { toastSuccess, toastError } from "@/lib/toast";
import { Plus } from "lucide-react";

export default function FollowUpFormTemplatesPanel() {
  const router = useRouter();
  const [templates, setTemplates] = useState<FollowUpFormTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<FollowUpFormTemplate | null>(null);
  const [preview, setPreview] = useState<FollowUpFormTemplate | null>(null);
  const [pending, startTransition] = useTransition();

  async function loadTemplates() {
    setLoading(true);
    const res = await fetch("/api/follow-up-form/templates");
    const data = await res.json();
    setTemplates(data.templates ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadTemplates();
  }, []);

  function handleDelete(id: string) {
    if (!confirm("حذف هذا النموذج؟")) return;
    startTransition(async () => {
      const res = await fetch(`/api/follow-up-form/templates/${id}`, { method: "DELETE" });
      if (!res.ok) {
        toastError("فشل الحذف");
        return;
      }
      toastSuccess("تم حذف النموذج");
      await loadTemplates();
      router.refresh();
    });
  }

  return (
    <div className="card space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-lg font-bold text-primary">نماذج متابعة ما بعد التوظيف</h3>
          <p className="text-sm text-brand-gray">
            نموذج واحد يمكن ربطه بعدة أشهر (1–6). المعاينة تطابق نموذج المستفيد.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditing(null);
            setModalMode("create");
          }}
          className="btn-primary !px-3 !py-2 text-sm"
        >
          <Plus className="h-4 w-4" />
          نموذج جديد
        </button>
      </div>

      {loading ? (
        <p className="text-sm text-brand-gray">جاري التحميل...</p>
      ) : templates.length === 0 ? (
        <p className="text-sm text-brand-gray">لا توجد نماذج محفوظة بعد</p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {templates.map((t) => (
            <FollowUpFormTemplateCard
              key={t.id}
              template={t}
              onEdit={() => {
                setEditing(t);
                setModalMode("edit");
              }}
              onDelete={() => handleDelete(t.id)}
              onPreview={() => setPreview(t)}
            />
          ))}
        </div>
      )}

      {modalMode && (
        <FollowUpFormTemplateModal
          mode={modalMode}
          initial={editing ?? undefined}
          onClose={() => {
            setModalMode(null);
            setEditing(null);
          }}
          onSaved={() => {
            loadTemplates();
            router.refresh();
          }}
        />
      )}

      {preview && (
        <FloatingModal
          title={`معاينة: ${preview.title}`}
          onClose={() => setPreview(null)}
          wide
        >
          <FollowUpFormPreview
            month={preview.months[0] ?? 1}
            questions={preview.questions}
          />
        </FloatingModal>
      )}

      {pending && <p className="text-xs text-brand-gray">جاري المعالجة...</p>}
    </div>
  );
}
