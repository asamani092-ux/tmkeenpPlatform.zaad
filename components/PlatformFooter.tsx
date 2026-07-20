import Link from "next/link";
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
          <Link href={dashboardHref} className="hover:text-primary">
            لوحة التحكم
          </Link>
        ) : showAuthLinks ? (
          <>
            <Link href="/login" className="hover:text-primary">
              {landingCopy.loginBtn}
            </Link>
            <Link href="/register" className="hover:text-primary">
              {landingCopy.registerBtn}
            </Link>
          </>
        ) : null}
        <Link href="/#about" className="hover:text-primary">
          {landingCopy.aboutTitle}
        </Link>
        <Link href="/#partners" className="hover:text-primary">
          {landingCopy.partnersTitle}
        </Link>
      </nav>
      © {new Date().getFullYear()} {landingCopy.footer}
    </footer>
  );
}
