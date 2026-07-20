import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import PlatformFooter from "@/components/PlatformFooter";
import CommitmentTracker from "@/components/CommitmentTracker";
import OpportunityApplyCard from "@/components/OpportunityApplyCard";
import CareerPlanChecklist from "@/components/beneficiary/CareerPlanChecklist";
import BeneficiaryGuideSummaryCard from "@/components/beneficiary/BeneficiaryGuideSummaryCard";
import BeneficiaryProfileCard from "@/components/beneficiary/BeneficiaryProfileCard";
import FollowUpMonthForm from "@/components/beneficiary/FollowUpMonthForm";
import VerticalStageTimeline from "@/components/beneficiary/VerticalStageTimeline";
import { getFollowUpFormForBeneficiary } from "@/lib/follow-up-service";
import { getDashboardPath } from "@/lib/auth";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { APPLICATION_STATUS_LABELS } from "@/lib/labels";
import { beneficiaryCanSeeOpportunity } from "@/lib/opportunity-visibility";
import { Briefcase, BookOpen, ClipboardList } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function BeneficiaryDashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "BENEFICIARY") redirect(getDashboardPath(session.role));

  // Fast path for PENDING_APPROVAL: profile + banner only (no guide/tasks/opps).
  const pendingUser = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      stage: true,
      stageEnteredAt: true,
      educationLevel: true,
      experience: true,
      skills: true,
      careerInterests: true,
      cvUrl: true,
      certificatesUrls: true,
    },
  });

  if (!pendingUser) redirect("/login");

  const unifiedProfile = {
    name: pendingUser.name,
    email: pendingUser.email,
    phone: pendingUser.phone,
    educationLevel: pendingUser.educationLevel,
    experience: pendingUser.experience,
    skills: pendingUser.skills,
    careerInterests: pendingUser.careerInterests,
    cvUrl: pendingUser.cvUrl,
    certificatesUrls: pendingUser.certificatesUrls,
  };

  if (pendingUser.stage === "PENDING_APPROVAL") {
    return (
      <div className="flex min-h-screen flex-col bg-surface-muted">
        <Navbar
          userName={pendingUser.name}
          userRole={session.role}
          userId={session.id}
          unifiedProfile={unifiedProfile}
        />

        <main className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 py-8">
          <section className="card">
            <ClipboardList className="mb-3 h-8 w-8 text-primary" />
            <h2 className="mb-2 text-xl font-bold text-primary">بانتظار اعتماد التسجيل</h2>
            <p className="text-brand-gray">
              تم تسجيلك في المنصة. سيتم مراجعة طلبك من قبل الإدارة قريباً.
            </p>
          </section>

          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,16.5rem)_minmax(0,1fr)]">
            <VerticalStageTimeline
              currentStage={pendingUser.stage}
              stageEnteredAt={pendingUser.stageEnteredAt}
            />
            <BeneficiaryProfileCard profile={unifiedProfile} />
          </div>
        </main>

        <PlatformFooter showAuthLinks={false} />
      </div>
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: {
      guide: { select: { name: true, email: true, phone: true } },
      sessionsAsBeneficiary: {
        orderBy: { date: "desc" },
        take: 10,
      },
      applications: {
        include: { opportunity: true },
        orderBy: { appliedAt: "desc" },
      },
      tasksAsBeneficiary: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!user) redirect("/login");

  const followUpData =
    user.stage === "FOLLOW_UP"
      ? await getFollowUpFormForBeneficiary(user.id)
      : null;

  const [allOpportunities, targetedRows] = await Promise.all([
    prisma.opportunity.findMany({
      where: { status: "متاحة" },
      orderBy: { createdAt: "desc" },
    }),
    prisma.opportunityTarget.findMany({
      where: { beneficiaryId: user.id },
      select: { opportunityId: true },
    }),
  ]);

  const targetedOppIds = new Set(targetedRows.map((t) => t.opportunityId));
  const visibleOpportunities = allOpportunities.filter((opp) =>
    beneficiaryCanSeeOpportunity(user.stage, opp.type, opp.id, targetedOppIds)
  );
  const trainingOpportunities = visibleOpportunities.filter((o) => o.type === "TRAINING");
  const employmentOpportunities = visibleOpportunities.filter((o) => o.type === "EMPLOYMENT");

  const applicationByOpp = new Map(
    user.applications.map((a) => [a.opportunityId, a.status])
  );

  const careerTasks = user.tasksAsBeneficiary.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    isCompleted: t.isCompleted,
  }));

  const sessionsSerialized = user.sessionsAsBeneficiary.map((s) => ({
    id: s.id,
    date: s.date.toISOString(),
    status: s.status,
    notes: s.notes,
    meetingLink: s.meetingLink,
    location: s.location,
  }));

  const opportunitiesSection = (
    <section id="opportunities-section" className="space-y-6">
      <h2 className="text-lg font-bold text-primary">الفرص المتاحة</h2>

      {trainingOpportunities.length > 0 && (
        <div className="card">
          <BookOpen className="mb-3 h-8 w-8 text-primary" />
          <h3 className="mb-4 text-xl font-bold text-primary">فرص تدريبية</h3>
          <ul className="space-y-4">
            {trainingOpportunities.map((opp) => (
              <OpportunityApplyCard
                key={opp.id}
                opportunity={opp}
                applicationStatus={applicationByOpp.get(opp.id) ?? null}
                canApply
              />
            ))}
          </ul>
        </div>
      )}

      {employmentOpportunities.length > 0 && (
        <div className="card">
          <Briefcase className="mb-3 h-8 w-8 text-secondary-dark" />
          <h3 className="mb-4 text-xl font-bold text-primary">فرص توظيف</h3>
          <ul className="space-y-4">
            {employmentOpportunities.map((opp) => (
              <OpportunityApplyCard
                key={opp.id}
                opportunity={opp}
                applicationStatus={applicationByOpp.get(opp.id) ?? null}
                canApply
              />
            ))}
          </ul>
        </div>
      )}

      {user.applications.length > 0 && (
        <div className="card">
          <h3 className="mb-4 text-xl font-bold text-primary">سجل التقديمات</h3>
          <ul className="space-y-2">
            {user.applications.map((app) => (
              <li
                key={app.id}
                className="flex justify-between rounded-lg bg-surface-muted px-4 py-3 text-sm"
              >
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                  {APPLICATION_STATUS_LABELS[app.status]}
                </span>
                <span className="text-brand-gray">
                  {app.opportunity.title} —{" "}
                  {new Date(app.appliedAt).toLocaleDateString("ar-SA")}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );

  return (
    <div className="flex min-h-screen flex-col bg-surface-muted">
      <Navbar
        userName={user.name}
        userRole={session.role}
        userId={session.id}
        unifiedProfile={unifiedProfile}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 space-y-6 px-4 py-8">
        {followUpData && (
          <FollowUpMonthForm
            activeMonth={followUpData.activeMonth}
            questions={(followUpData.questions ?? []).map((q) => ({
              ...q,
              options: Array.isArray(q.options) ? q.options.map(String) : [],
            }))}
            records={(followUpData.records ?? []).map((r) => ({
              month: r.month,
              status: r.status,
              submittedAt: r.submittedAt?.toISOString() ?? null,
              dueAt: r.dueAt?.toISOString() ?? null,
            }))}
          />
        )}

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,16.5rem)_minmax(0,1fr)]">
          <VerticalStageTimeline
            currentStage={user.stage}
            stageEnteredAt={user.stageEnteredAt}
          />
          <BeneficiaryProfileCard profile={unifiedProfile} />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <BeneficiaryGuideSummaryCard guide={user.guide} />
          <CommitmentTracker
            score={user.commitmentScore}
            variant="card"
            sessions={sessionsSerialized}
          />
        </div>

        <section
          aria-label="المهام والفرص"
          className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start"
        >
          <CareerPlanChecklist tasks={careerTasks} />
          {opportunitiesSection}
        </section>
      </main>

      <PlatformFooter showAuthLinks={false} />
    </div>
  );
}
