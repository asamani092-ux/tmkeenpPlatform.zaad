import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import AdminDashboardTabs from "@/components/AdminDashboardTabs";
import AdminBulkExport from "@/components/admin/AdminBulkExport";
import { getDashboardPath } from "@/lib/auth";
import { getSession } from "@/lib/session";
import { withPrismaRetry } from "@/lib/prisma";
import { backfillFollowUpProgram } from "@/lib/follow-up-service";
import { STAGE_LABELS, STAGE_ORDER } from "@/lib/stages";
import { APPLICATION_STATUS_LABELS, FOLLOW_UP_STATUS_LABELS } from "@/lib/labels";
import type { BulkExportSection } from "@/lib/export-table";
import { Briefcase, GraduationCap, LayoutDashboard, Users } from "lucide-react";
import { formatArDate } from "@/lib/datetime-local";

export default async function AdminDashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "ADMIN") redirect(getDashboardPath(session.role));

  /** Heal FOLLOW_UP users missing ACTIVE status — throttled to O(1) per load. */
  await backfillFollowUpProgram();

  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const [
    totalBeneficiaries,
    totalGuides,
    totalOpportunities,
    stageGroups,
    opportunities,
    guidesRaw,
    beneficiariesRaw,
    followUpsRaw,
    employedBeneficiaries,
    applicationsRaw,
    sessionStats,
    attendedSessionCount,
    followUpStats,
    applicationStats,
  ] = await withPrismaRetry((db) =>
    Promise.all([
      db.user.count({ where: { role: "BENEFICIARY" } }),
      db.user.count({ where: { role: "GUIDE" } }),
      db.opportunity.count(),
      db.user.groupBy({
        by: ["stage"],
        where: { role: "BENEFICIARY" },
        _count: { stage: true },
      }),
      db.opportunity.findMany({ orderBy: { createdAt: "desc" } }),
      db.user.findMany({
        where: { role: "GUIDE" },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          _count: { select: { beneficiaries: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      db.user.findMany({
        where: { role: "BENEFICIARY" },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          stage: true,
          pendingStage: true,
          guideId: true,
          followUpProgramStatus: true,
          educationLevel: true,
          experience: true,
          skills: true,
          careerInterests: true,
          cvUrl: true,
          certificatesUrls: true,
          professionalRecommendations: true,
          commitmentScore: true,
          stageEnteredAt: true,
          guide: { select: { name: true } },
        },
        orderBy: { name: "asc" },
      }),
      db.followUp.findMany({
        include: {
          beneficiary: { select: { id: true, name: true, phone: true } },
        },
        orderBy: [{ beneficiaryId: "asc" }, { month: "asc" }],
      }),
      db.user.findMany({
        where: {
          role: "BENEFICIARY",
          OR: [{ isEmployed: true }, { stage: "FOLLOW_UP" }, { stage: "EMPLOYMENT" }],
        },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          phone: true,
          followUpProgramStatus: true,
          followUpPauseReason: true,
          followUpEndReason: true,
          followUpStatusUpdatedAt: true,
        },
      }),
      db.application.findMany({
        include: {
          beneficiary: { select: { id: true, name: true, phone: true, stage: true } },
          opportunity: { select: { id: true, title: true, type: true, provider: true } },
        },
        orderBy: { appliedAt: "desc" },
      }),
      db.session.aggregate({
        where: { createdAt: { gte: sixMonthsAgo } },
        _count: { id: true },
        _avg: { commitmentRating: true },
      }),
      db.session.count({
        where: {
          createdAt: { gte: sixMonthsAgo },
          status: { in: ["ATTENDED", "COMPLETED"] },
        },
      }),
      db.followUp.groupBy({
        by: ["status"],
        where: { createdAt: { gte: sixMonthsAgo } },
        _count: { status: true },
      }),
      db.application.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
    ])
  );

  const stageDistribution = STAGE_ORDER.map((stage) => ({
    stage,
    count: stageGroups.find((g) => g.stage === stage)?._count.stage ?? 0,
  }));

  const followUpTotal = followUpStats.reduce((sum, g) => sum + g._count.status, 0);
  const followUpCompleted =
    followUpStats.find((g) => g.status === "COMPLETED")?._count.status ?? 0;
  const applicationsTotal = applicationStats.reduce((sum, g) => sum + g._count.status, 0);
  const applicationsAccepted =
    applicationStats.find((g) => g.status === "ACCEPTED")?._count.status ?? 0;

  const impactStats = {
    stageDistribution,
    totalBeneficiaries,
    totalGuides,
    totalOpportunities,
    totalSessions: sessionStats._count.id,
    attendedSessions: attendedSessionCount,
    avgCommitment: sessionStats._avg.commitmentRating ?? 0,
    followUpCompleted,
    followUpTotal,
    applicationsAccepted,
    applicationsTotal,
    employedCount: employedBeneficiaries.length,
    periodLabel: `تقرير الأثر — آخر 6 أشهر (من ${formatArDate(sixMonthsAgo)})`,
  };

  const guides = guidesRaw.map((g) => ({
    id: g.id,
    name: g.name,
    email: g.email,
    phone: g.phone,
    beneficiaryCount: g._count.beneficiaries,
  }));

  const beneficiariesByGuideId: Record<
    string,
    { id: string; name: string; phone: string; stage: string }[]
  > = {};
  for (const b of beneficiariesRaw) {
    if (!b.guideId) continue;
    const entry = {
      id: b.id,
      name: b.name,
      phone: b.phone,
      stage: b.stage,
    };
    if (!beneficiariesByGuideId[b.guideId]) {
      beneficiariesByGuideId[b.guideId] = [];
    }
    beneficiariesByGuideId[b.guideId].push(entry);
  }

  const managedBeneficiaries = beneficiariesRaw.map((b) => ({
    id: b.id,
    name: b.name,
    email: b.email,
    phone: b.phone,
    stage: b.stage,
    pendingStage: b.pendingStage,
    guideId: b.guideId,
    guideName: b.guide?.name ?? null,
    educationLevel: b.educationLevel,
    experience: b.experience,
    skills: b.skills,
    careerInterests: b.careerInterests,
    cvUrl: b.cvUrl,
    certificatesUrls: b.certificatesUrls,
    professionalRecommendations: b.professionalRecommendations,
    commitmentScore: b.commitmentScore,
  }));

  const beneficiaries = beneficiariesRaw.map((b) => ({
    id: b.id,
    name: b.name,
    phone: b.phone,
    email: b.email,
    educationLevel: b.educationLevel,
    stage: b.stage,
    pendingStage: b.pendingStage,
    guideId: b.guideId,
    guideName: b.guide?.name ?? null,
  }));

  const applications = applicationsRaw.map((a) => ({
    id: a.id,
    status: a.status,
    reviewNote: a.reviewNote,
    appliedAt: a.appliedAt.toISOString(),
    beneficiary: a.beneficiary,
    opportunity: a.opportunity,
  }));

  const exportSections: BulkExportSection[] = [
    {
      title: "المستفيدون",
      headers: [
        "الاسم",
        "الجوال",
        "البريد",
        "المرحلة",
        "تاريخ دخول المرحلة",
        "طلب معلّق",
        "المرشد",
        "حالة برنامج المتابعة",
        "المستوى التعليمي",
        "الخبرة",
        "المهارات",
        "الاهتمامات المهنية",
        "درجة الالتزام",
      ],
      rows: beneficiariesRaw.map((b) => [
        b.name,
        b.phone,
        b.email,
        STAGE_LABELS[b.stage],
        b.stageEnteredAt
          ? formatArDate(b.stageEnteredAt)
          : "—",
        b.pendingStage ? STAGE_LABELS[b.pendingStage] : "—",
        b.guide?.name ?? "—",
        b.followUpProgramStatus ?? "—",
        b.educationLevel || "—",
        b.experience || "—",
        b.skills || "—",
        b.careerInterests || "—",
        String(b.commitmentScore),
      ]),
    },
    {
      title: "المرشدون",
      headers: ["الاسم", "البريد", "الجوال", "عدد المستفيدين"],
      rows: guidesRaw.map((g) => [
        g.name,
        g.email,
        g.phone,
        String(g._count.beneficiaries),
      ]),
    },
    {
      title: "التقديمات",
      headers: ["المستفيد", "الفرصة", "النوع", "الحالة", "ملاحظة المراجعة", "تاريخ التقديم"],
      rows: applicationsRaw.map((a) => [
        a.beneficiary.name,
        a.opportunity.title,
        a.opportunity.type === "TRAINING" ? "تدريب" : "توظيف",
        APPLICATION_STATUS_LABELS[a.status],
        a.reviewNote || "—",
        formatArDate(a.appliedAt),
      ]),
    },
    {
      title: "الفرص",
      headers: [
        "العنوان",
        "المزود",
        "النوع",
        "المدة",
        "الحالة",
        "المتطلبات",
        "الراتب",
        "نوع الدوام",
      ],
      rows: opportunities.map((o) => [
        o.title,
        o.provider,
        o.type === "TRAINING" ? "تدريب" : "توظيف",
        o.duration,
        o.status,
        o.requirements || "—",
        o.salary || "—",
        o.jobType || "—",
      ]),
    },
    {
      title: "توزيع المراحل",
      headers: ["المرحلة", "العدد", "النسبة"],
      rows: stageDistribution.map((s) => [
        STAGE_LABELS[s.stage],
        String(s.count),
        totalBeneficiaries > 0
          ? `${Math.round((s.count / totalBeneficiaries) * 100)}%`
          : "0%",
      ]),
    },
    {
      title: "متابعة ما بعد التوظيف",
      headers: [
        "المستفيد",
        "الجوال",
        "الشهر",
        "الحالة",
        "تاريخ الإرسال",
        "ملاحظات",
        "الإجابات",
      ],
      rows: followUpsRaw.map((f) => [
        f.beneficiary.name,
        f.beneficiary.phone,
        String(f.month),
        FOLLOW_UP_STATUS_LABELS[f.status as keyof typeof FOLLOW_UP_STATUS_LABELS] ?? f.status,
        f.submittedAt ? formatArDate(f.submittedAt) : "—",
        f.notes || "—",
        f.answers ? JSON.stringify(f.answers) : "—",
      ]),
    },
  ];



  const followUps = followUpsRaw.map((f) => ({
    id: f.id,
    month: f.month,
    status: f.status,
    notes: f.notes,
    answers: f.answers,
    submittedAt: f.submittedAt?.toISOString() ?? null,
    opensAt: f.opensAt?.toISOString() ?? null,
    dueAt: f.dueAt?.toISOString() ?? null,
    lastReminderAt: f.lastReminderAt?.toISOString() ?? null,
    beneficiary: f.beneficiary,
  }));

  const employedForPanel = employedBeneficiaries.map((b) => ({
    id: b.id,
    name: b.name,
    phone: b.phone,
    followUpProgramStatus: b.followUpProgramStatus,
    followUpPauseReason: b.followUpPauseReason,
    followUpEndReason: b.followUpEndReason,
    followUpStatusUpdatedAt: b.followUpStatusUpdatedAt?.toISOString() ?? null,
  }));

  return (
    <div className="min-h-screen bg-surface-muted">
      <Navbar userName={session.name} userRole={session.role} userId={session.id} />

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="h-8 w-8 text-primary" />
            <div className="text-start">
              <h1 className="text-2xl font-bold text-primary">لوحة المدير</h1>
              <p className="text-brand-gray">نظرة عامة على منصة التمكين المستدام</p>
            </div>
          </div>
          <AdminBulkExport sections={exportSections} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card flex items-center gap-4">
            <Users className="h-10 w-10 text-primary" />
            <div>
              <p className="text-2xl font-bold text-primary">{totalBeneficiaries}</p>
              <p className="text-sm text-brand-gray">المستفيدون</p>
            </div>
          </div>
          <div className="card flex items-center gap-4">
            <GraduationCap className="h-10 w-10 text-secondary-dark" />
            <div>
              <p className="text-2xl font-bold text-primary">{totalGuides}</p>
              <p className="text-sm text-brand-gray">المرشدون</p>
            </div>
          </div>
          <div className="card flex items-center gap-4">
            <Briefcase className="h-10 w-10 text-primary" />
            <div>
              <p className="text-2xl font-bold text-primary">{totalOpportunities}</p>
              <p className="text-sm text-brand-gray">الفرص</p>
            </div>
          </div>
          <div className="card flex items-center gap-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary/30 text-lg font-bold text-primary">
              {employedBeneficiaries.length}
            </div>
            <div>
              <p className="text-sm font-bold text-primary">في التوظيف / متابعة</p>
            </div>
          </div>
        </div>

        <AdminDashboardTabs
          opportunities={opportunities}
          guides={guides}
          beneficiariesByGuideId={beneficiariesByGuideId}
          beneficiaries={beneficiaries}
          managedBeneficiaries={managedBeneficiaries}
          followUps={followUps}
          employedBeneficiaries={employedForPanel}
          applications={applications}
          impactStats={impactStats}
        />
      </main>
    </div>
  );
}
