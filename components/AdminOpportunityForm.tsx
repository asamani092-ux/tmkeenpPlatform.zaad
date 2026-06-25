"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
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

      <div>
        <label htmlFor="type" className="label-field">
          نوع الفرصة
        </label>
        <select id="type" name="type" required className="input-field">
          <option value="TRAINING">تدريب</option>
          <option value="EMPLOYMENT">توظيف</option>
        </select>
      </div>
      <div>
        <label htmlFor="title" className="label-field">
          العنوان
        </label>
        <input id="title" name="title" required className="input-field" />
      </div>
      <div>
        <label htmlFor="provider" className="label-field">
          مزود الفرصة / جهة العمل
        </label>
        <input id="provider" name="provider" required className="input-field" />
      </div>
      <div>
        <label htmlFor="duration" className="label-field">
          المدة
        </label>
        <input id="duration" name="duration" required className="input-field" />
        <p className="text-xs text-brand-gray">مثال: 3 أشهر، 6 أشهر، سنة</p>
      </div>
      <div>
        <label htmlFor="requirements" className="label-field">
          الشروط / المتطلبات
        </label>
        <textarea
          id="requirements"
          name="requirements"
          rows={2}
          className="input-field resize-none"
          placeholder="شروط الالتحاق أو متطلبات الوظيفة"
        />
        <p className="mt-1 text-xs text-brand-gray">اذكر المؤهلات والخبرة المطلوبة بوضوح</p>
      </div>
      <div>
        <label htmlFor="salary" className="label-field">
          الراتب (للتوظيف)
        </label>
        <input id="salary" name="salary" className="input-field" placeholder="اختياري" />
        <p className="mt-1 text-xs text-brand-gray">لفرص التوظيف فقط — اتركه فارغاً للتدريب</p>
      </div>
      <div>
        <label htmlFor="jobType" className="label-field">
          نوع الدوام (للتوظيف)
        </label>
        <input
          id="jobType"
          name="jobType"
          className="input-field"
          placeholder="مثال: دوام كامل"
        />
        <p className="mt-1 text-xs text-brand-gray">دوام كامل، جزئي، عن بُعد، إلخ</p>
      </div>
      <div>
        <label htmlFor="status" className="label-field">
          الحالة
        </label>
        <select id="status" name="status" required className="input-field" defaultValue="متاحة">
          <option value="متاحة">متاحة</option>
          <option value="مغلقة">مغلقة</option>
        </select>
      </div>
      <SubmitButton loading={pending} className="btn-primary w-full">
        إضافة الفرصة
      </SubmitButton>
    </form>
  );
}
