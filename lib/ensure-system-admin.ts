import { prisma } from "@/lib/prisma";

const SEED_SYSTEM_ADMIN_EMAIL = "admin@alzaad.org";

/**
 * Promote seed admin to SYSTEM_ADMIN when none exists.
 * Idempotent. Time O(1), Space O(1).
 */
export async function ensureSystemAdminExists(): Promise<void> {
  const existing = await prisma.user.findFirst({
    where: { role: "SYSTEM_ADMIN" },
    select: { id: true },
  });
  if (existing) return;

  await prisma.user.updateMany({
    where: { email: SEED_SYSTEM_ADMIN_EMAIL, role: "ADMIN" },
    data: { role: "SYSTEM_ADMIN" },
  });
}
