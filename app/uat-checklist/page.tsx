import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import UatChecklistForm from "@/components/uat/UatChecklistForm";
import { isUatChecklistEnabled } from "@/lib/uat-access";

export default function UatChecklistPage() {
  if (!isUatChecklistEnabled()) notFound();

  return (
    <div className="min-h-screen bg-surface-muted">
      <Navbar showAuth={false} />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:py-10">
        <header className="mb-6 text-start">
          <h1 className="text-2xl font-extrabold text-primary sm:text-3xl">
            نموذج تقييم UAT — بيئة التجربة
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-brand-gray">
            واجهة داخلية لاكتمال تجربة التقييم محلياً فقط. في النشر العام المسار
            مغلق (`404`).
          </p>
        </header>
        <UatChecklistForm />
      </main>
    </div>
  );
}
