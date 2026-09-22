import { prisma } from "@/lib/prisma";

/** O(1) insert */
export async function createNotification(
  userId: string,
  title: string,
  message: string
) {
  return prisma.inAppNotification.create({
    data: { userId, title, message },
  });
}

/** O(a) where a = active staff (optionally opted into registration notices) */
export async function notifyAdmins(
  title: string,
  message: string,
  options?: { registrationNotice?: boolean }
) {
  try {
    const admins = await prisma.user.findMany({
      where: {
        role: { in: ["ADMIN", "SYSTEM_ADMIN"] },
        isActive: true,
        ...(options?.registrationNotice ? { notifyOnRegistration: true } : {}),
      },
      select: { id: true },
    });
    if (admins.length === 0) return;
    await prisma.inAppNotification.createMany({
      data: admins.map((a) => ({ userId: a.id, title, message })),
    });
  } catch (err) {
    const messageText = err instanceof Error ? err.message : String(err);
    const code =
      typeof err === "object" && err && "code" in err
        ? String((err as { code?: unknown }).code)
        : "";
    // P2022 — column missing until migrate deploy succeeds.
    if (
      options?.registrationNotice &&
      (code === "P2022" || /notifyOnRegistration/i.test(messageText))
    ) {
      console.warn(
        "[notifyAdmins] notifyOnRegistration missing — falling back to all active staff"
      );
      const admins = await prisma.user.findMany({
        where: { role: { in: ["ADMIN", "SYSTEM_ADMIN"] }, isActive: true },
        select: { id: true },
      });
      if (admins.length === 0) return;
      await prisma.inAppNotification.createMany({
        data: admins.map((a) => ({ userId: a.id, title, message })),
      });
      return;
    }
    throw err;
  }
}

/** O(1) count */
export async function getUnreadNotificationCount(userId: string) {
  return prisma.inAppNotification.count({
    where: { userId, isRead: false },
  });
}

/** O(k) where k = limit */
export async function listNotifications(userId: string, limit = 20) {
  return prisma.inAppNotification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function markNotificationRead(id: string, userId: string) {
  const note = await prisma.inAppNotification.findFirst({
    where: { id, userId },
  });
  if (!note) return false;
  await prisma.inAppNotification.update({
    where: { id },
    data: { isRead: true },
  });
  return true;
}

export async function markAllNotificationsRead(userId: string) {
  await prisma.inAppNotification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}

/** O(n) beneficiaries in FOLLOW_UP — creates admin reminders for 1/3/6 month milestones */
export async function syncFollowUpRemindersForAdmin() {
  const admins = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "SYSTEM_ADMIN"] }, isActive: true },
    select: { id: true },
  });
  if (admins.length === 0) return;

  const inFollowUp = await prisma.user.findMany({
    where: { role: "BENEFICIARY", stage: "FOLLOW_UP" },
    select: { id: true, name: true, stageEnteredAt: true },
  });

  const now = Date.now();
  for (const b of inFollowUp) {
    const months = Math.floor(
      (now - b.stageEnteredAt.getTime()) / (1000 * 60 * 60 * 24 * 30)
    );
    for (const milestone of [1, 3, 6]) {
      if (months < milestone) continue;
      const title = `تذكير متابعة — ${milestone} ${milestone === 1 ? "شهر" : "أشهر"}`;
      const message = `المستفيد ${b.name} في مرحلة المتابعة منذ ${milestone} ${milestone === 1 ? "شهر" : "أشهر"}. يرجى التواصل.`;
      for (const admin of admins) {
        const exists = await prisma.inAppNotification.findFirst({
          where: {
            userId: admin.id,
            title,
            message: { contains: b.name },
          },
        });
        if (!exists) {
          await createNotification(admin.id, title, message);
        }
      }
    }
  }
}
