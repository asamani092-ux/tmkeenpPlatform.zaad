import Navbar from "@/components/Navbar";
import FullPageLink from "@/components/FullPageLink";
import { getSession } from "@/lib/session";
import { getDashboardPath } from "@/lib/auth";
import { landingCopy, PARTNERS } from "@/lib/copy/ar";
import { ArrowLeft, GraduationCap, Target, Users, Building2 } from "lucide-react";

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
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-brand-gray">
            {landingCopy.subtitle}
          </p>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row-reverse">
            {session && dashboardHref ? (
              <FullPageLink href={dashboardHref} className="btn-primary min-w-[220px]">
                {landingCopy.dashboardBtn}
                <ArrowLeft className="h-5 w-5" />
              </FullPageLink>
            ) : (
              <>
                <FullPageLink href="/register" className="btn-register min-w-[220px]">
                  {landingCopy.registerBtn}
                  <ArrowLeft className="h-5 w-5" />
                </FullPageLink>
                <FullPageLink href="/login" className="btn-primary min-w-[220px]">
                  {landingCopy.loginBtn}
                </FullPageLink>
              </>
            )}
          </div>
        </section>

        <section className="border-t border-surface-border bg-surface py-14">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 md:grid-cols-3">
            <article className="card text-center">
              <Users className="mx-auto mb-4 h-10 w-10 text-primary" />
              <h3 className="mb-2 text-xl font-bold text-primary">
                {landingCopy.featurePersonalTitle}
              </h3>
              <p className="text-sm leading-relaxed text-brand-gray">
                {landingCopy.featurePersonalText}
              </p>
            </article>
            <article className="card text-center">
              <Target className="mx-auto mb-4 h-10 w-10 text-secondary-dark" />
              <h3 className="mb-2 text-xl font-bold text-primary">
                {landingCopy.featureStagesTitle}
              </h3>
              <p className="text-sm leading-relaxed text-brand-gray">
                {landingCopy.featureStagesText}
              </p>
            </article>
            <article className="card text-center">
              <GraduationCap className="mx-auto mb-4 h-10 w-10 text-primary" />
              <h3 className="mb-2 text-xl font-bold text-primary">
                {landingCopy.featureOppsTitle}
              </h3>
              <p className="text-sm leading-relaxed text-brand-gray">
                {landingCopy.featureOppsText}
              </p>
            </article>
          </div>
        </section>

        <section id="about" className="border-t border-surface-border py-16">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <h2 className="mb-6 text-3xl font-bold text-primary">{landingCopy.aboutTitle}</h2>
            <p className="text-lg leading-relaxed text-brand-gray">{landingCopy.aboutText}</p>
          </div>
        </section>

        <section id="partners" className="border-t border-surface-border bg-surface py-16">
          <div className="mx-auto max-w-6xl px-4">
            <div className="mb-10 text-center">
              <Building2 className="mx-auto mb-4 h-10 w-10 text-secondary-dark" />
              <h2 className="text-3xl font-bold text-primary">{landingCopy.partnersTitle}</h2>
              <p className="mt-2 text-brand-gray">{landingCopy.partnersSubtitle}</p>
            </div>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
              {PARTNERS.map((p) => (
                <div
                  key={p.name}
                  className="flex flex-col items-center justify-center rounded-xl border border-surface-border bg-surface-muted px-4 py-8 shadow-sm transition hover:border-primary/30"
                >
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
                    {p.abbr}
                  </div>
                  <p className="text-center text-xs font-medium text-brand-gray">{p.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-surface-border py-6 text-center text-sm text-brand-gray">
        <nav className="mb-3 flex flex-wrap items-center justify-center gap-4">
          {session && dashboardHref ? (
            <FullPageLink href={dashboardHref} className="hover:text-primary">
              لوحة التحكم
            </FullPageLink>
          ) : (
            <>
              <FullPageLink href="/login" className="hover:text-primary">
                {landingCopy.loginBtn}
              </FullPageLink>
              <FullPageLink href="/register" className="hover:text-primary">
                {landingCopy.registerBtn}
              </FullPageLink>
            </>
          )}
          <a href="#about" className="hover:text-primary">
            {landingCopy.aboutTitle}
          </a>
          <a href="#partners" className="hover:text-primary">
            {landingCopy.partnersTitle}
          </a>
        </nav>
        © {new Date().getFullYear()} {landingCopy.footer}
      </footer>
    </div>
  );
}
