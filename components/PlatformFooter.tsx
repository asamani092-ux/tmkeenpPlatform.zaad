import FullPageLink from "@/components/FullPageLink";
import { landingCopy } from "@/lib/copy/ar";

type Props = {
  dashboardHref?: string | null;
  showAuthLinks?: boolean;
};

export default function PlatformFooter({ dashboardHref, showAuthLinks = true }: Props) {
  return (
    <footer className="border-t border-surface-border py-6 text-center text-sm text-brand-gray">
      <nav className="mb-3 flex flex-wrap items-center justify-center gap-4">
        {dashboardHref ? (
          <FullPageLink href={dashboardHref} className="hover:text-primary">
            لوحة التحكم
          </FullPageLink>
        ) : showAuthLinks ? (
          <>
            <FullPageLink href="/login" className="hover:text-primary">
              {landingCopy.loginBtn}
            </FullPageLink>
            <FullPageLink href="/register" className="hover:text-primary">
              {landingCopy.registerBtn}
            </FullPageLink>
          </>
        ) : null}
        <FullPageLink href="/#about" className="hover:text-primary">
          {landingCopy.aboutTitle}
        </FullPageLink>
        <FullPageLink href="/#partners" className="hover:text-primary">
          {landingCopy.partnersTitle}
        </FullPageLink>
      </nav>
      © {new Date().getFullYear()} {landingCopy.footer}
    </footer>
  );
}
