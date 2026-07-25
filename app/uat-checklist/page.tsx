import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import UatChecklistForm from "@/components/uat/UatChecklistForm";
import { isUatChecklistEnabled } from "@/lib/uat-access";

/** Runtime host check — do not statically prerender for production CDN. */
export const dynamic = "force-dynamic";

export default async function UatChecklistPage() {
  const host = (await headers()).get("host");
  if (!isUatChecklistEnabled(host)) notFound();

  return (
    <div className="min-h-screen bg-surface-muted">
      <Navbar showAuth={false} />
      <main className="mx-auto max-w-5xl px-4 py-8 sm:py-10">
        <header className="mb-6 text-start">
          <h1 className="text-2xl font-extrabold text-primary sm:text-3xl">
            نموذج تقييم UAT — بيئة التجربة
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-brand-gray">
            موجة إعادة تحقق من آخر ملاحظات ما بعد النشر + إصلاح التذكير. متاح على
            localhost فقط؛ على النطاق العام يُرجع 404.
          </p>
        </header>
        <UatChecklistForm />
      </main>
    </div>
  );
}
