import { Role } from "@/generated/prisma/client";

/** Platform staff: system admin or supervisor (مشرف). Time O(1), Space O(1). */
export function isPlatformStaff(role: Role | string | null | undefined): boolean {
  return role === "SYSTEM_ADMIN" || role === "ADMIN";
}

/** Single system-admin role only. Time O(1), Space O(1). */
export function isSystemAdmin(role: Role | string | null | undefined): boolean {
  return role === "SYSTEM_ADMIN";
}

/** Supervisor (مشرف) — not system admin. Time O(1), Space O(1). */
export function isSupervisor(role: Role | string | null | undefined): boolean {
  return role === "ADMIN";
}
