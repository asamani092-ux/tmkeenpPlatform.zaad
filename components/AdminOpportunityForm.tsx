"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import FieldRow from "@/components/ui/FieldRow";
import SubmitButton from "@/components/ui/SubmitButton";
import { toastSuccess, toastError } from "@/lib/toast";

type Props = {
  onSuccess?: () => void;
};

export default function AdminOpportunityForm({ onSuccess }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const formEl = e.currentTarget;

    startTransition(async () => {
      try {
        const res = await fetch("/api/opportunities", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: form.get("type"),
            title: form.get("title"),
            provider: form.get("provider"),
            duration: form.get("duration"),
            status: form.get("status"),
            requirements: form.get("requirements"),
            salary: form.get("salary"),
            jobType: form.get("jobType"),
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          toastError(data.error || "فشل الإضافة");
          return;
        }
        formEl.reset();
        toastSuccess("تمت إضافة الفرصة بنجاح");
        router.refresh();
        onSuccess?.();
      } catch {
        toastError("حدث خطأ في الاتصال");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      <FieldRow label="نوع الفرصة" htmlFor="type">
        <select id="type" name="type" required className="input-field">
          <option value="TRAINING">تدريب</option>
          <option value="EMPLOYMENT">توظيف</option>
        </select>
      </FieldRow>
      <FieldRow label="العنوان" htmlFor="title">
        <input id="title" name="title" required className="input-field" />
      </FieldRow>
      <FieldRow label="مزود الفرصة / جهة العمل" htmlFor="provider">
        <input id="provider" name="provider" required className="input-field" />
      </FieldRow>
      <FieldRow label="المدة" htmlFor="duration">
        <input id="duration" name="duration" required className="input-field" />
      </FieldRow>
      <FieldRow label="الشروط / المتطلبات" htmlFor="requirements" align="start">
        <textarea
          id="requirements"
          name="requirements"
          rows={2}
          className="input-field resize-none"
          placeholder="شروط الالتحاق أو متطلبات الوظيفة"
        />
      </FieldRow>
      <FieldRow label="الراتب (للتوظيف)" htmlFor="salary">
        <input id="salary" name="salary" className="input-field" placeholder="اختياري" />
      </FieldRow>
      <FieldRow label="نوع الدوام (للتوظيف)" htmlFor="jobType">
        <input
          id="jobType"
          name="jobType"
          className="input-field"
          placeholder="مثال: دوام كامل"
        />
      </FieldRow>
      <FieldRow label="الحالة" htmlFor="status">
        <select id="status" name="status" required className="input-field" defaultValue="متاحة">
          <option value="متاحة">متاحة</option>
          <option value="مغلقة">مغلقة</option>
        </select>
      </FieldRow>
      <SubmitButton loading={pending} className="btn-primary w-full">
        إضافة الفرصة
      </SubmitButton>
    </form>
  );
}
