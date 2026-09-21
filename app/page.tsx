import FullPageLink from "@/components/FullPageLink";
import Navbar from "@/components/Navbar";
import PlatformFooter from "@/components/PlatformFooter";
import { getSession } from "@/lib/session";
import { getDashboardPath } from "@/lib/auth";
import { landingCopy } from "@/lib/copy/ar";
import { ArrowLeft, Compass, GraduationCap, Sparkles, Target } from "lucide-react";

const ACCOMPANY_ICONS = [Compass, GraduationCap, Target, Sparkles] as const;

export default async function HomePage() {
  const session = await getSession();
  const dashboardHref = session ? getDashboardPath(session.role) : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-surface-muted to-surface">
      <Navbar userName={session?.name} userRole={session?.role} userId={session?.id} />

      <main>
        <section className="mx-auto max-w-6xl px-4 py-16 text-center">
          <h1 className="mb-4 text-4xl font-extrabold text-primary md:text-5xl">
            {landingCopy.title}
          </h1>
          <p className="mx-auto mb-3 max-w-2xl text-xl font-semibold text-primary">
            {landingCopy.subtitle}
          </p>
          <p className="mx-auto mb-4 max-w-2xl text-lg text-brand-gray">{landingCopy.lead}</p>
          <p className="mx-auto mb-10 max-w-3xl text-base leading-relaxed text-brand-gray">
            {landingCopy.intro}
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            {session && dashboardHref ? (
              <FullPageLink href={dashboardHref} className="btn-primary min-w-[220px]">
                {landingCopy.dashboardBtn}
                <ArrowLeft className="h-5 w-5" />
              </FullPageLink>
            ) : (
              <>
                <FullPageLink href="/login" className="btn-primary min-w-[220px]">
                  {landingCopy.loginBtn}
                </FullPageLink>
                <FullPageLink href="/register" className="btn-register min-w-[220px]">
                  {landingCopy.registerBtn}
                  <ArrowLeft className="h-5 w-5" />
                </FullPageLink>
              </>
            )}
          </div>
        </section>

        <section className="border-t border-surface-border bg-surface py-14">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="mb-8 text-center text-3xl font-bold text-primary">
              {landingCopy.accompanyTitle}
            </h2>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {landingCopy.accompany.map((step, index) => {
                const Icon = ACCOMPANY_ICONS[index] ?? Compass;
                return (
                  <article key={step.title} className="card text-center">
                    <Icon className="mx-auto mb-4 h-10 w-10 text-primary" />
                    <h3 className="mb-2 text-xl font-bold text-primary">{step.title}</h3>
                    <p className="text-sm leading-relaxed text-brand-gray">{step.text}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="about" className="border-t border-surface-border py-16">
          <div className="mx-auto max-w-3xl space-y-4 px-4 text-center">
            <h2 className="mb-6 text-3xl font-bold text-primary">{landingCopy.aboutTitle}</h2>
            <p className="text-lg leading-relaxed text-brand-gray">{landingCopy.aboutText}</p>
            <p className="text-lg leading-relaxed text-brand-gray">{landingCopy.aboutText2}</p>
          </div>
        </section>
      </main>

      <PlatformFooter dashboardHref={dashboardHref} />
    </div>
  );
}
