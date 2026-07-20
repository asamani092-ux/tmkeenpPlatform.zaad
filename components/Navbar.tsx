import Image from "next/image";
import Link from "next/link";
import { LogOut } from "lucide-react";
import NotificationBell from "@/components/NotificationBell";
import BeneficiaryNavbarActions from "@/components/beneficiary/BeneficiaryNavbarActions";
import GuideNavbarActions from "@/components/guide/GuideNavbarActions";
import type { UnifiedProfile } from "@/components/beneficiary/BeneficiaryUnifiedProfileModal";
import type { Role } from "@/generated/prisma/client";

type NavbarProps = {
  showAuth?: boolean;
  userName?: string;
  userRole?: Role;
  userId?: string;
  userEmail?: string;
  logoutHref?: string;
  unifiedProfile?: UnifiedProfile;
};

export default function Navbar({
  showAuth = true,
  userName,
  userRole,
  userId,
  userEmail,
  logoutHref = "/api/auth/logout",
  unifiedProfile,
}: NavbarProps) {
  const isBeneficiary = userRole === "BENEFICIARY";
  const isGuide = userRole === "GUIDE";

  return (
    <header className="border-b border-surface-border bg-surface shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        {/* RTL start (يمين): اسم المستخدم + تعديل + إشعارات + لوحة التحكم + خروج */}
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden sm:gap-3">
          {showAuth && userName && isBeneficiary && unifiedProfile ? (
            <BeneficiaryNavbarActions userName={userName} profile={unifiedProfile} />
          ) : showAuth && userName && isGuide && userEmail ? (
            <GuideNavbarActions userName={userName} email={userEmail} />
          ) : showAuth && userName ? (
            <>
              <span className="truncate text-sm font-semibold text-primary">{userName}</span>
              {userId && <NotificationBell />}
              <form action={logoutHref} method="POST" noValidate className="shrink-0">
                <button
                  type="submit"
                  className="inline-flex items-center gap-1 rounded-lg px-2 py-2 text-sm text-brand-gray transition hover:bg-surface-muted hover:text-primary sm:px-3"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">خروج</span>
                </button>
              </form>
            </>
          ) : showAuth && !userName ? (
            <Link href="/login" className="btn-primary !px-4 !py-2 text-sm">
              تسجيل الدخول
            </Link>
          ) : null}
        </div>

        {/* RTL end (يسار الشاشة): اسم المنصة يمين الشعار (من جهة المستخدم) ومحاذاة أسفل */}
        <Link
          href="/"
          className="flex shrink-0 items-end gap-1.5"
          aria-label="التمكين المستدام — جمعية الزاد"
        >
          <span className="pb-0.5 text-[10px] font-semibold leading-none text-primary sm:text-xs">
            التمكين المستدام
          </span>
          <Image
            src="/logo.png"
            alt="شعار جمعية الزاد"
            width={300}
            height={179}
            className="h-10 w-auto object-contain sm:h-12"
            priority
            unoptimized
          />
        </Link>
      </div>
    </header>
  );
}
