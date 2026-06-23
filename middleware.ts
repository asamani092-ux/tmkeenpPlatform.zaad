import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Role } from "@/generated/prisma/client";

const SESSION_COOKIE = "tmkeen_session";
const ROLE_COOKIE = "tmkeen_role";

const ROLE_PATHS: { prefix: string; role: Role }[] = [
  { prefix: "/dashboard/admin", role: "ADMIN" },
  { prefix: "/dashboard/guide", role: "GUIDE" },
  { prefix: "/dashboard/beneficiary", role: "BENEFICIARY" },
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const role = request.cookies.get(ROLE_COOKIE)?.value as Role | undefined;

  const isDashboard = pathname.startsWith("/dashboard");
  const isAuthPage = pathname === "/login" || pathname === "/register";

  if (isDashboard && !sessionId) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (isAuthPage && sessionId) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isDashboard && sessionId && role) {
    for (const { prefix, role: required } of ROLE_PATHS) {
      if (pathname.startsWith(prefix) && role !== required) {
        const fallback =
          role === "ADMIN"
            ? "/dashboard/admin"
            : role === "GUIDE"
              ? "/dashboard/guide"
              : "/dashboard/beneficiary";
        return NextResponse.redirect(new URL(fallback, request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/dashboard/:path*", "/login", "/register"],
};
