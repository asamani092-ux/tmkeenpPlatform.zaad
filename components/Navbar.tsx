import Image from "next/image";
import Link from "next/link";
import { LogOut, LayoutDashboard } from "lucide-react";
import { getDashboardPath } from "@/lib/auth";
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
  const dashboardHref = userRole
    ? getDashboardPath(userRole)
    : userName
      ? "/dashboard"
      : null;
  const isBeneficiary = userRole === "BENEFICIARY";

  return (
    <header className="border-b border-surface-border bg-surface shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <div className="flex min-w-0 flex-1 items-center justify-end gap-3">
          {userName && userRole !== "BENEFICIARY" && (
            <span className="truncate text-sm font-medium text-primary">
              مرحباً، {userName}
            </span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {showAuth && userId && isBeneficiary && unifiedProfile ? (
            <BeneficiaryNavbarActions userName={userName ?? ""} profile={unifiedProfile} />
          ) : showAuth && userId ? (
            <NotificationBell />
          ) : null}

          {showAuth && userName && !isBeneficiary && dashboardHref ? (
            <nav className="flex items-center gap-3 text-sm">
              <Link
                href={dashboardHref}
                className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-brand-gray transition hover:bg-surface-muted hover:text-primary"
              >
                <LayoutDashboard className="h-4 w-4" />
                لوحة التحكم
              </Link>
              <form action={logoutHref} method="POST" noValidate>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-brand-gray transition hover:bg-surface-muted hover:text-primary"
                >
                  <LogOut className="h-4 w-4" />
                  خروج
                </button>
              </form>
            </nav>
          ) : showAuth && !userName ? (
            <Link href="/login" className="btn-primary !px-4 !py-2 text-sm">
              تسجيل الدخول
            </Link>
          ) : null}

          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="شعار جمعية الزاد"
              width={300}
              height={179}
              className="h-12 w-auto object-contain sm:h-14"
              priority
              unoptimized
            />
          </Link>
        </div>
      </div>
    </header>
  );
}
