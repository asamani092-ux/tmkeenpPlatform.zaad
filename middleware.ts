import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Role } from "@/generated/prisma/client";
import { isPlatformStaff } from "@/lib/roles";

const SESSION_COOKIE = "tmkeen_session";
const ROLE_COOKIE = "tmkeen_role";

function isUatChecklistAllowed(request: NextRequest): boolean {
  if (process.env.ENABLE_UAT_CHECKLIST === "true") return true;
  if (process.env.NODE_ENV !== "production") return true;
  const host = request.headers.get("host");
  const h = host?.split(":")[0]?.toLowerCase() ?? "";
  return (
    h === "localhost" ||
    h === "127.0.0.1" ||
    h === "::1" ||
    h === "[::1]" ||
    h.endsWith(".localhost")
  );
}

function dashboardFallback(role: Role | string): string {
  if (isPlatformStaff(role)) return "/dashboard/admin";
  if (role === "GUIDE") return "/dashboard/guide";
  if (role === "BENEFICIARY") return "/dashboard/beneficiary";
  return "/login";
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const role = request.cookies.get(ROLE_COOKIE)?.value as Role | undefined;

  /** Block UAT form on public deploy; allow localhost trial — O(1). */
  if (
    (pathname === "/uat-checklist" || pathname.startsWith("/uat-checklist/")) &&
    !isUatChecklistAllowed(request)
  ) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const isDashboard = pathname.startsWith("/dashboard");
  const isAuthPage =
    pathname === "/login" ||
    pathname.startsWith("/login/") ||
    pathname === "/register";

  if (isDashboard && !sessionId) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthPage && sessionId) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isDashboard && sessionId && role) {
    if (pathname.startsWith("/dashboard/admin") && !isPlatformStaff(role)) {
      return NextResponse.redirect(new URL(dashboardFallback(role), request.url));
    }
    if (pathname.startsWith("/dashboard/guide") && role !== "GUIDE") {
      return NextResponse.redirect(new URL(dashboardFallback(role), request.url));
    }
    if (pathname.startsWith("/dashboard/beneficiary") && role !== "BENEFICIARY") {
      return NextResponse.redirect(new URL(dashboardFallback(role), request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/login",
    "/login/:path*",
    "/register",
    "/uat-checklist",
    "/uat-checklist/:path*",
  ],
};
