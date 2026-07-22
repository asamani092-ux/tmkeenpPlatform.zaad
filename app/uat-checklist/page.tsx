import Navbar from "@/components/Navbar";
import UatChecklistForm from "@/components/uat/UatChecklistForm";

export default function UatChecklistPage() {
  return (
    <div className="min-h-screen bg-surface-muted">
      <Navbar showAuth={false} />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-primary">نموذج تقييم أدوات — منصة تمكين</h1>
          <p className="mt-2 text-sm text-brand-gray">
            املأ التقييم لكل أداة. يُحفظ تلقائياً في المتصفح.
          </p>
          <p className="mt-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm font-semibold text-primary">
            أعلى الصفحة: قسم «تصدير النتائج للوكيل» — زر «نسخ التقرير للحافظة»
          </p>
        </div>
        <UatChecklistForm />
      </main>
    </div>
  );
}
