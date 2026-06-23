import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import AdminDashboardTabs from "@/components/AdminDashboardTabs";
import AdminBulkExport from "@/components/admin/AdminBulkExport";
import { getDashboardPath } from "@/lib/auth";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { STAGE_LABELS, STAGE_ORDER } from "@/lib/stages";
import { syncFollowUpRemindersForAdmin } from "@/lib/notifications";
import { APPLICATION_STATUS_LABELS, FOLLOW_UP_STATUS_LABELS } from "@/lib/labels";
import type { BulkExportSection } from "@/lib/export-table";
import { Briefcase, GraduationCap, LayoutDashboard, Users } from "lucide-react";

export default async function AdminDashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "ADMIN") redirect(getDashboardPath(session.role));

  await syncFollowUpRemindersForAdmin();

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
  ] = await Promise.all([
    prisma.user.count({ where: { role: "BENEFICIARY" } }),
    prisma.user.count({ where: { role: "GUIDE" } }),
    prisma.opportunity.count(),
    prisma.user.groupBy({
      by: ["stage"],
      where: { role: "BENEFICIARY" },
      _count: { stage: true },
    }),
    prisma.opportunity.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.user.findMany({
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
    prisma.user.findMany({
      where: { role: "BENEFICIARY" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        stage: true,
        pendingStage: true,
        guideId: true,
        educationLevel: true,
        experience: true,
        skills: true,
        careerInterests: true,
        cvUrl: true,
        certificatesUrls: true,
        professionalRecommendations: true,
        commitmentScore: true,
        guide: { select: { name: true } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.followUp.findMany({
      include: {
        beneficiary: { select: { id: true, name: true, phone: true } },
      },
      orderBy: [{ beneficiaryId: "asc" }, { month: "asc" }],
    }),
    prisma.user.findMany({
      where: {
        role: "BENEFICIARY",
        OR: [{ isEmployed: true }, { stage: "FOLLOW_UP" }, { stage: "EMPLOYMENT" }],
      },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, phone: true },
    }),
    prisma.application.findMany({
      include: {
        beneficiary: { select: { id: true, name: true, phone: true, stage: true } },
        opportunity: { select: { id: true, title: true, type: true, provider: true } },
      },
      orderBy: { appliedAt: "desc" },
    }),
    prisma.session.aggregate({
      where: { createdAt: { gte: sixMonthsAgo } },
      _count: { id: true },
      _avg: { commitmentRating: true },
    }),
    prisma.session.count({
      where: {
        createdAt: { gte: sixMonthsAgo },
        status: { in: ["ATTENDED", "COMPLETED"] },
      },
    }),
    prisma.followUp.groupBy({
      by: ["status"],
      where: { createdAt: { gte: sixMonthsAgo } },
      _count: { status: true },
    }),
    prisma.application.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
  ]);

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
    periodLabel: `تقرير الأثر — آخر 6 أشهر (من ${sixMonthsAgo.toLocaleDateString("ar-SA")})`,
  };

  const guides = guidesRaw.map((g) => ({
    id: g.id,
    name: g.name,
    email: g.email,
    phone: g.phone,
    beneficiaryCount: g._count.beneficiaries,
  }));

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
      headers: ["الاسم", "الجوال", "البريد", "المرحلة", "طلب معلّق", "المرشد"],
      rows: beneficiariesRaw.map((b) => [
        b.name,
        b.phone,
        b.email,
        STAGE_LABELS[b.stage],
        b.pendingStage ? STAGE_LABELS[b.pendingStage] : "—",
        b.guide?.name ?? "—",
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
      headers: ["المستفيد", "الفرصة", "النوع", "الحالة", "تاريخ التقديم"],
      rows: applicationsRaw.map((a) => [
        a.beneficiary.name,
        a.opportunity.title,
        a.opportunity.type === "TRAINING" ? "تدريب" : "توظيف",
        APPLICATION_STATUS_LABELS[a.status],
        a.appliedAt.toLocaleDateString("ar-SA"),
      ]),
    },
    {
      title: "الفرص",
      headers: ["العنوان", "المزود", "النوع", "المدة", "الحالة"],
      rows: opportunities.map((o) => [
        o.title,
        o.provider,
        o.type === "TRAINING" ? "تدريب" : "توظيف",
        o.duration,
        o.status,
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
      headers: ["المستفيد", "الشهر", "الحالة", "ملاحظات"],
      rows: followUpsRaw.map((f) => [
        f.beneficiary.name,
        String(f.month),
        FOLLOW_UP_STATUS_LABELS[f.status as keyof typeof FOLLOW_UP_STATUS_LABELS] ?? f.status,
        f.notes || "—",
      ]),
    },
  ];



  return (
    <div className="min-h-screen bg-surface-muted">
      <Navbar userName={session.name} userRole={session.role} userId={session.id} />

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <LayoutDashboard className="h-8 w-8 text-primary" />
            <div className="text-right">
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
              <p className="text-xs text-brand-gray">EMPLOYMENT + FOLLOW_UP</p>
            </div>
          </div>
        </div>

        <AdminDashboardTabs
          opportunities={opportunities}
          guides={guides}
          beneficiaries={beneficiaries}
          managedBeneficiaries={managedBeneficiaries}
          followUps={followUpsRaw}
          employedBeneficiaries={employedBeneficiaries}
          applications={applications}
          impactStats={impactStats}
        />
      </main>
    </div>
  );
}
