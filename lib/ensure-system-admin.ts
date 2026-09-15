import { prisma } from "@/lib/prisma";

const SEED_SYSTEM_ADMIN_EMAIL = "admin@alzaad.org";

/**
 * Promote seed admin to SYSTEM_ADMIN when none exists.
 * Soft-fails if the DB enum lacks SYSTEM_ADMIN (migration not applied yet).
 * Idempotent. Time O(1), Space O(1).
 */
export async function ensureSystemAdminExists(): Promise<void> {
  try {
    const existing = await prisma.user.findFirst({
      where: { role: "SYSTEM_ADMIN" },
      select: { id: true },
    });
    if (existing) return;

    await prisma.user.updateMany({
      where: { email: SEED_SYSTEM_ADMIN_EMAIL, role: "ADMIN" },
      data: { role: "SYSTEM_ADMIN" },
    });
  } catch (err) {
    const code =
      typeof err === "object" && err && "code" in err
        ? String((err as { code?: unknown }).code)
        : "";
    const message = err instanceof Error ? err.message : String(err);
    // P2007 / invalid enum — migrate deploy has not added SYSTEM_ADMIN yet.
    if (
      code === "P2007" ||
      /SYSTEM_ADMIN|invalid input value for enum/i.test(message)
    ) {
      console.warn(
        "[ensureSystemAdminExists] skipped — Role.SYSTEM_ADMIN missing in DB. Run prisma migrate deploy."
      );
      return;
    }
    throw err;
  }
}
