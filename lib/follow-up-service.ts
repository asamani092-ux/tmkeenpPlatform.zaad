import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { createNotification, notifyAdmins } from "@/lib/notifications";
import { getSystemSettings } from "@/lib/system-settings";
import { sendFollowUpFormReminderEmail, sendGenericEmail } from "@/lib/email-notify";
import { safeSendEmail } from "@/lib/safe-email";
import {
  computeMonthWindow,
  getActiveFollowUpMonth,
} from "@/lib/follow-up-program";
import type { ActionResult } from "@/lib/platform-service";
import type { Prisma } from "@/generated/prisma/client";
import { getQuestionsForMonth } from "@/lib/follow-up-form-templates";

export async function initializeFollowUpProgram(beneficiaryId: string): Promise<void> {
  const startedAt = new Date();
  await prisma.user.update({
    where: { id: beneficiaryId },
    data: {
      followUpProgramStatus: "ACTIVE",
      followUpProgramStartedAt: startedAt,
    },
  });

  for (let month = 1; month <= 6; month++) {
    const { opensAt, dueAt } = computeMonthWindow(startedAt, month);
    await prisma.followUp.upsert({
      where: { beneficiaryId_month: { beneficiaryId, month } },
      create: {
        beneficiaryId,
        month,
        status: "PENDING",
        opensAt,
        dueAt,
      },
      update: { opensAt, dueAt },
    });
  }

  const beneficiary = await prisma.user.findUnique({ where: { id: beneficiaryId } });
  if (!beneficiary) return;

  const settings = await getSystemSettings();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  await createNotification(
    beneficiaryId,
    "نموذج متابعة الشهر الأول",
    "برنامج متابعة ما بعد التوظيف بدأ. يُرجى إكمال نموذج الشهر الأول من لوحتك."
  );
  await safeSendEmail("follow-up program start", () =>
    sendFollowUpFormReminderEmail({
      to: beneficiary.email,
      name: beneficiary.name,
      month: 1,
      dashboardUrl: `${appUrl}/dashboard/beneficiary#follow-up-month-1`,
      senderEmail: settings.senderEmail,
    })
  );
  await notifyAdmins(
    "بدء برنامج متابعة",
    `بدأ برنامج متابعة 6 أشهر للمستفيد ${beneficiary.name}.`
  );
}

export async function processFollowUpReminders(): Promise<void> {
  const now = new Date();
  const active = await prisma.user.findMany({
    where: {
      role: "BENEFICIARY",
      stage: "FOLLOW_UP",
      followUpProgramStatus: "ACTIVE",
      followUpProgramStartedAt: { not: null },
    },
    select: { id: true, name: true, email: true, followUpProgramStartedAt: true },
  });

  const settings = await getSystemSettings();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  for (const b of active) {
    if (!b.followUpProgramStartedAt) continue;
    const currentMonth = getActiveFollowUpMonth(b.followUpProgramStartedAt, now);
    if (!currentMonth) continue;

    const record = await prisma.followUp.findUnique({
      where: { beneficiaryId_month: { beneficiaryId: b.id, month: currentMonth } },
    });
    if (!record || record.status === "COMPLETED") continue;

    if (record.dueAt && now > record.dueAt && record.status === "PENDING") {
      await prisma.followUp.update({
        where: { id: record.id },
        data: { status: "MISSED" },
      });
      await notifyAdmins(
        "فات موعد متابعة",
        `المستفيد ${b.name} لم يُكمل نموذج الشهر ${currentMonth}.`
      );
      continue;
    }

    if (record.opensAt && now < record.opensAt) continue;

    const lastReminder = record.lastReminderAt?.getTime() ?? 0;
    if (now.getTime() - lastReminder < 24 * 60 * 60 * 1000) continue;

    await createNotification(
      b.id,
      `نموذج متابعة — الشهر ${currentMonth}`,
      "يُرجى الدخول إلى المنصة وإكمال نموذج المتابعة الشهري."
    );
    await safeSendEmail("follow-up reminder", () =>
      sendFollowUpFormReminderEmail({
        to: b.email,
        name: b.name,
        month: currentMonth,
        dashboardUrl: `${appUrl}/dashboard/beneficiary#follow-up-month-${currentMonth}`,
        senderEmail: settings.senderEmail,
      })
    );
    await prisma.followUp.update({
      where: { id: record.id },
      data: { lastReminderAt: now },
    });
  }
}

export async function submitFollowUpForm(
  beneficiaryId: string,
  month: number,
  answers: Record<string, string>
): Promise<ActionResult> {
  const session = await getSession();
  if (!session || session.role !== "BENEFICIARY" || session.id !== beneficiaryId) {
    return { success: false, error: "غير مصرح" };
  }

  const user = await prisma.user.findFirst({
    where: {
      id: beneficiaryId,
      role: "BENEFICIARY",
      stage: "FOLLOW_UP",
      followUpProgramStatus: "ACTIVE",
    },
  });
  if (!user?.followUpProgramStartedAt) {
    return { success: false, error: "البرنامج غير نشط" };
  }

  const activeMonth = getActiveFollowUpMonth(user.followUpProgramStartedAt);
  if (activeMonth !== month) {
    return { success: false, error: "هذا الشهر غير متاح حالياً" };
  }

  const record = await prisma.followUp.findUnique({
    where: { beneficiaryId_month: { beneficiaryId, month } },
  });
  if (!record || record.status === "COMPLETED") {
    return { success: false, error: "السجل غير متاح" };
  }

  const questions = await getQuestionsForMonth(month);
  for (const q of questions) {
    if (q.required && !answers[q.id]?.trim()) {
      return { success: false, error: `الحقل "${q.label}" مطلوب` };
    }
  }

  await prisma.followUp.update({
    where: { id: record.id },
    data: {
      answers: answers as Prisma.InputJsonValue,
      submittedAt: new Date(),
      status: "COMPLETED",
    },
  });

  await notifyAdmins(
    "إكمال نموذج متابعة",
    `أكمل ${user.name} نموذج الشهر ${month}.`
  );

  if (month === 6) {
    await notifyAdmins(
      "جاهز للإغلاق",
      `أكمل ${user.name} جميع نماذج المتابعة الستة — يمكن إغلاق البرنامج.`
    );
  }

  return { success: true };
}

export async function completeFollowUpProgram(beneficiaryId: string): Promise<ActionResult> {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return { success: false, error: "غير مصرح" };
  }

  await prisma.user.update({
    where: { id: beneficiaryId },
    data: {
      stage: "CLOSED",
      followUpProgramStatus: "COMPLETED",
      pendingStage: null,
      stageEnteredAt: new Date(),
    },
  });

  const user = await prisma.user.findUnique({ where: { id: beneficiaryId } });
  if (user) {
    const settings = await getSystemSettings();
    await createNotification(
      beneficiaryId,
      "اكتمال برنامج المتابعة",
      "تهانينا! تم إكمال برنامج متابعة ما بعد التوظيف بنجاح."
    );
    await safeSendEmail("follow-up program complete", () =>
      sendGenericEmail({
        to: user.email,
        subject: "اكتمال برنامج المتابعة — منصة تمكين",
        body: `مرحباً ${user.name},\n\nتم إكمال برنامج متابعة ما بعد التوظيف بنجاح.\n\nمع تحيات فريق منصة تمكين`,
        senderEmail: settings.senderEmail,
      })
    );
  }

  return { success: true };
}

export async function withdrawFollowUpProgram(
  beneficiaryId: string,
  reason?: string
): Promise<ActionResult> {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return { success: false, error: "غير مصرح" };
  }

  await prisma.user.update({
    where: { id: beneficiaryId },
    data: {
      stage: "CLOSED",
      followUpProgramStatus: "WITHDRAWN",
      followUpPauseReason: reason?.trim() || null,
      followUpStatusUpdatedAt: new Date(),
      pendingStage: null,
      stageEnteredAt: new Date(),
    },
  });

  const user = await prisma.user.findUnique({ where: { id: beneficiaryId } });
  if (user) {
    await createNotification(
      beneficiaryId,
      "إنهاء برنامج المتابعة",
      reason?.trim() || "تم إنهاء برنامج المتابعة من قبل الإدارة."
    );
  }

  return { success: true };
}

/** Admin pauses follow-up program — O(1) time, O(1) space */
export async function pauseFollowUp(
  beneficiaryId: string,
  reason: string
): Promise<ActionResult> {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return { success: false, error: "غير مصرح" };
  }

  const trimmed = reason.trim();
  if (!trimmed) {
    return { success: false, error: "سبب الإيقاف مطلوب" };
  }

  const user = await prisma.user.findFirst({
    where: {
      id: beneficiaryId,
      role: "BENEFICIARY",
      followUpProgramStatus: "ACTIVE",
    },
  });
  if (!user) {
    return { success: false, error: "البرنامج غير نشط أو المستفيد غير موجود" };
  }

  const now = new Date();
  await prisma.user.update({
    where: { id: beneficiaryId },
    data: {
      followUpProgramStatus: "PAUSED",
      followUpPauseReason: trimmed,
      followUpStatusUpdatedAt: now,
    },
  });

  await createNotification(
    beneficiaryId,
    "إيقاف مؤقت لبرنامج المتابعة",
    `تم إيقاف نماذج المتابعة مؤقتاً. السبب: ${trimmed}`
  );

  return { success: true };
}

/** Admin resumes follow-up program from PAUSED or COMPLETED — O(1) */
export async function resumeFollowUp(beneficiaryId: string): Promise<ActionResult> {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return { success: false, error: "غير مصرح" };
  }

  const user = await prisma.user.findFirst({
    where: {
      id: beneficiaryId,
      role: "BENEFICIARY",
      followUpProgramStatus: { in: ["PAUSED", "COMPLETED"] },
    },
  });
  if (!user) {
    return { success: false, error: "لا يمكن استئناف البرنامج — الحالة غير مناسبة" };
  }

  const now = new Date();
  await prisma.user.update({
    where: { id: beneficiaryId },
    data: {
      followUpProgramStatus: "ACTIVE",
      followUpStatusUpdatedAt: now,
    },
  });

  await createNotification(
    beneficiaryId,
    "استئناف برنامج المتابعة",
    "تم استئناف برنامج متابعة ما بعد التوظيف. ستصلك النماذج والتذكيرات حسب الجدول."
  );

  return { success: true };
}

/** Admin ends follow-up after all 6 months completed — O(6) time, O(1) space */
export async function endFollowUp(
  beneficiaryId: string,
  reason: string
): Promise<ActionResult> {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return { success: false, error: "غير مصرح" };
  }

  const trimmed = reason.trim();
  if (!trimmed) {
    return { success: false, error: "سبب الإنهاء مطلوب" };
  }

  const user = await prisma.user.findFirst({
    where: { id: beneficiaryId, role: "BENEFICIARY" },
    include: { followUps: true },
  });
  if (!user) {
    return { success: false, error: "المستفيد غير موجود" };
  }

  const records = user.followUps;
  if (records.length < 6) {
    return { success: false, error: "لم يكتمل برنامج المتابعة — يجب وجود 6 سجلات شهرية" };
  }

  const allCompleted = [1, 2, 3, 4, 5, 6].every((m) => {
    const r = records.find((x) => x.month === m);
    return r?.status === "COMPLETED";
  });
  if (!allCompleted) {
    return {
      success: false,
      error: "لا يمكن إنهاء البرنامج — يجب إكمال جميع نماذج الستة أشهر أولاً",
    };
  }

  const now = new Date();
  await prisma.user.update({
    where: { id: beneficiaryId },
    data: {
      followUpProgramStatus: "COMPLETED",
      followUpEndReason: trimmed,
      followUpStatusUpdatedAt: now,
    },
  });

  await createNotification(
    beneficiaryId,
    "إنهاء برنامج المتابعة",
    `تم إنهاء برنامج المتابعة بنجاح. السبب: ${trimmed}`
  );

  return { success: true };
}

export async function getFollowUpFormForBeneficiary(beneficiaryId: string) {
  const user = await prisma.user.findFirst({
    where: { id: beneficiaryId, role: "BENEFICIARY", stage: "FOLLOW_UP" },
    include: { followUps: { orderBy: { month: "asc" } } },
  });
  if (!user?.followUpProgramStartedAt || user.followUpProgramStatus !== "ACTIVE") {
    return null;
  }

  const activeMonth = getActiveFollowUpMonth(user.followUpProgramStartedAt);
  if (!activeMonth) return { user, activeMonth: null, questions: [], records: user.followUps };

  const questions = await getQuestionsForMonth(activeMonth);

  return { user, activeMonth, questions, records: user.followUps };
}

/** Backfill 6-month records for beneficiaries already in FOLLOW_UP without a program — O(6n) */
export async function backfillFollowUpProgram(): Promise<{ updated: number }> {
  const users = await prisma.user.findMany({
    where: {
      role: "BENEFICIARY",
      stage: "FOLLOW_UP",
      OR: [{ followUpProgramStatus: null }, { followUpProgramStartedAt: null }],
    },
    select: { id: true, stageEnteredAt: true },
  });

  for (const u of users) {
    const startedAt = u.stageEnteredAt;
    await prisma.user.update({
      where: { id: u.id },
      data: {
        followUpProgramStatus: "ACTIVE",
        followUpProgramStartedAt: startedAt,
      },
    });
    for (let month = 1; month <= 6; month++) {
      const { opensAt, dueAt } = computeMonthWindow(startedAt, month);
      await prisma.followUp.upsert({
        where: { beneficiaryId_month: { beneficiaryId: u.id, month } },
        create: {
          beneficiaryId: u.id,
          month,
          status: "PENDING",
          opensAt,
          dueAt,
        },
        update: { opensAt, dueAt },
      });
    }
  }

  return { updated: users.length };
}

export async function getFollowUpSubmission(beneficiaryId: string, month: number) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return null;
  }

  const record = await prisma.followUp.findUnique({
    where: { beneficiaryId_month: { beneficiaryId, month } },
    include: {
      beneficiary: { select: { id: true, name: true, phone: true } },
    },
  });
  if (!record) return null;

  const questions = await getQuestionsForMonth(month);

  const answers = (record.answers ?? {}) as Record<string, string>;
  const items = questions.map((q) => ({
    questionId: q.id,
    label: q.label,
    answer: answers[q.id] ?? "—",
  }));

  return { record, items };
}
