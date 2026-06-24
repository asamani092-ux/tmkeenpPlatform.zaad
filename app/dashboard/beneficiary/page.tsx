import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import StageProgress from "@/components/StageProgress";
import CommitmentTracker from "@/components/CommitmentTracker";
import OpportunityApplyCard from "@/components/OpportunityApplyCard";
import NextSessionCard from "@/components/beneficiary/NextSessionCard";
import CareerPlanChecklist from "@/components/beneficiary/CareerPlanChecklist";
import BeneficiaryGuideHub from "@/components/beneficiary/BeneficiaryGuideHub";
import BeneficiaryProfileCard from "@/components/beneficiary/BeneficiaryProfileCard";
import FollowUpMonthForm from "@/components/beneficiary/FollowUpMonthForm";
import { getFollowUpFormForBeneficiary } from "@/lib/follow-up-service";
import { processFollowUpReminders } from "@/lib/follow-up-service";
import { getDashboardPath } from "@/lib/auth";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { APPLICATION_STATUS_LABELS } from "@/lib/labels";
import { beneficiaryCanSeeOpportunity } from "@/lib/opportunity-visibility";
import {
  Briefcase,
  BookOpen,
  ClipboardList,
  FileText,
  Trophy,
} from "lucide-react";

export const dynamic = "force-dynamic";

function parseCourseIds(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export default async function BeneficiaryDashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "BENEFICIARY") redirect(getDashboardPath(session.role));

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: {
      guide: { select: { name: true, email: true, phone: true } },
      notesAsBeneficiary: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { guide: { select: { name: true } } },
      },
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

  await processFollowUpReminders();

  const followUpData =
    user.stage === "FOLLOW_UP"
      ? await getFollowUpFormForBeneficiary(user.id)
      : null;

  const courseIds = parseCourseIds(user.selectedTrainingCourseIds);
  const recommendedCourses =
    courseIds.length > 0
      ? await prisma.opportunity.findMany({
          where: { id: { in: courseIds }, type: "TRAINING" },
        })
      : [];

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

  const guideNotes = user.notesAsBeneficiary.map((note) => ({
    id: note.id,
    content: note.content,
    createdAt: note.createdAt.toISOString(),
    guideName: note.guide.name,
  }));

  return (
    <div className="min-h-screen bg-surface-muted">
      <Navbar userName={user.name} userRole={session.role} userId={session.id} />

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-8">
        <BeneficiaryProfileCard
          profile={{
            name: user.name,
            email: user.email,
            phone: user.phone,
            educationLevel: user.educationLevel,
            experience: user.experience,
            skills: user.skills,
            careerInterests: user.careerInterests,
            cvUrl: user.cvUrl,
            certificatesUrls: user.certificatesUrls,
          }}
        />

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

        {user.stage === "PENDING_APPROVAL" && (
          <section className="card">
            <ClipboardList className="mb-3 h-8 w-8 text-primary" />
            <h2 className="mb-2 text-xl font-bold text-primary">بانتظار اعتماد التسجيل</h2>
            <p className="text-brand-gray">
              تم تسجيلك في المنصة. سيتم مراجعة طلبك من قبل الإدارة قريباً.
            </p>
          </section>
        )}

        <section className="space-y-6">
          <h2 className="text-lg font-bold text-primary">الآن</h2>
          <NextSessionCard sessions={sessionsSerialized} />
          <StageProgress currentStage={user.stage} stageEnteredAt={user.stageEnteredAt} />
        </section>

        <section>
          <BeneficiaryGuideHub
            guide={user.guide}
            professionalRecommendations={user.professionalRecommendations}
            recommendedCourses={recommendedCourses.map((c) => ({
              ...c,
              type: "TRAINING" as const,
            }))}
            notes={guideNotes}
            applicationByOpp={Object.fromEntries(applicationByOpp)}
          />
        </section>

        <section className="space-y-6">
          <h2 className="flex items-center gap-2 text-lg font-bold text-primary">
            <Trophy className="h-6 w-6" />
            الإنجازات
          </h2>
          <div className="grid gap-6 lg:grid-cols-2">
            <CareerPlanChecklist tasks={careerTasks} />
            <CommitmentTracker score={user.commitmentScore} />
          </div>
        </section>

        <section id="opportunities-section" className="space-y-6">
          <h2 className="text-lg font-bold text-primary">الفرص والملف</h2>

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

          <div className="card">
            <h3 className="mb-4 flex items-center gap-2 text-xl font-bold text-primary">
              <FileText className="h-6 w-6" />
              بيانات الملف الموحد
            </h3>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold text-brand-gray">المستوى التعليمي</dt>
                <dd className="text-primary">{user.educationLevel || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-brand-gray">السيرة الذاتية</dt>
                <dd className="text-primary">
                  {user.cvUrl ? (
                    <a
                      href={user.cvUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-primary hover:underline"
                    >
                      عرض السيرة الذاتية
                    </a>
                  ) : (
                    "—"
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-brand-gray">الشهادات</dt>
                <dd className="text-primary">{user.certificatesUrls ? "مرفقة" : "—"}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-semibold text-brand-gray">الخبرات</dt>
                <dd className="text-brand-gray">{user.experience || "—"}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-semibold text-brand-gray">المهارات</dt>
                <dd className="text-brand-gray">{user.skills || "—"}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-xs font-semibold text-brand-gray">الميول المهنية</dt>
                <dd className="text-brand-gray">{user.careerInterests || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-brand-gray">الجوال</dt>
                <dd dir="ltr" className="text-start text-brand-gray">
                  {user.phone}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-brand-gray">البريد</dt>
                <dd dir="ltr" className="text-start text-brand-gray">
                  {user.email}
                </dd>
              </div>
            </dl>
          </div>
        </section>
      </main>
    </div>
  );
}
