import bcrypt from "bcryptjs";
import { Role } from "@/generated/prisma/client";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function getDashboardPath(role: Role): string {
  switch (role) {
    case "ADMIN":
      return "/dashboard/admin";
    case "GUIDE":
      return "/dashboard/guide";
    case "BENEFICIARY":
      return "/dashboard/beneficiary";
    default:
      return "/login";
  }
}
