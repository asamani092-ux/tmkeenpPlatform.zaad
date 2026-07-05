import Image from "next/image";
import Link from "next/link";
import { LogOut } from "lucide-react";
import NotificationBell from "@/components/NotificationBell";
import BeneficiaryNavbarActions from "@/components/beneficiary/BeneficiaryNavbarActions";
import type { UnifiedProfile } from "@/components/beneficiary/BeneficiaryUnifiedProfileModal";
import type { Role } from "@/generated/prisma/client";

type NavbarProps = {
  showAuth?: boolean;
  userName?: string;
  userRole?: Role;
  userId?: string;
  logoutHref?: string;
  unifiedProfile?: UnifiedProfile;
};

export default function Navbar({
  showAuth = true,
  userName,
  userRole,
  userId,
  logoutHref = "/api/auth/logout",
  unifiedProfile,
}: NavbarProps) {
  const isBeneficiary = userRole === "BENEFICIARY";

  return (
    <header className="border-b border-surface-border bg-surface shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        {/* RTL start (يمين): اسم المستخدم + تعديل + إشعارات + خروج */}
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden sm:gap-3">
          {showAuth && userName && isBeneficiary && unifiedProfile ? (
            <BeneficiaryNavbarActions userName={userName} profile={unifiedProfile} />
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

        {/* RTL end (يسار): الشعار + اسم المنصة */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Image
            src="/logo.png"
            alt="شعار جمعية الزاد"
            width={300}
            height={179}
            className="h-10 w-auto object-contain sm:h-12"
            priority
            unoptimized
          />
          <span className="hidden text-base font-bold text-primary sm:inline md:text-lg">
            منصة تمكين
          </span>
        </Link>
      </div>
    </header>
  );
}
