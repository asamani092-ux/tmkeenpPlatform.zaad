import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import UatChecklistForm from "@/components/uat/UatChecklistForm";
import { isUatChecklistEnabled } from "@/lib/uat-access";

export default function UatChecklistPage() {
  if (!isUatChecklistEnabled()) notFound();

  return (
    <div className="min-h-screen bg-surface-muted">
      <Navbar showAuth={false} />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-primary">
            إعادة تحقق UAT بعد الإصلاحات — منصة تمكين
          </h1>
          <p className="mt-2 text-sm text-brand-gray">
            أداة داخلية للتطوير فقط — غير متاحة في بيئة النشر. التقييم يُحفظ في
            المتصفح دون مسح السجل السابق.
          </p>
          <p className="mt-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm font-semibold text-primary">
            أعلى الصفحة: «تصدير النتائج للوكيل» — التبديل «إعادة التحقق» / «بريد +
            ملاحظات» / «كل البنود»
          </p>
        </div>
        <UatChecklistForm />
      </main>
    </div>
  );
}
