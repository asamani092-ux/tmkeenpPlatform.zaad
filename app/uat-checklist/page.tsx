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
        </div>
        <UatChecklistForm />
      </main>
    </div>
  );
}
