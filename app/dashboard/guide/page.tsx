import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import GuideBeneficiaryTable from "@/components/GuideBeneficiaryTable";
import GuideDashboardKpis from "@/components/guide/GuideDashboardKpis";
import { getDashboardPath } from "@/lib/auth";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Users } from "lucide-react";

function parseCourseIds(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export default async function GuideDashboardPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "GUIDE") redirect(getDashboardPath(session.role));

  const [beneficiaries, trainingCourses] = await Promise.all([
    prisma.user.findMany({
      where: { role: "BENEFICIARY", guideId: session.id, stage: "GUIDANCE" },
      orderBy: { createdAt: "desc" },
      include: {
        notesAsBeneficiary: { orderBy: { createdAt: "desc" }, take: 10 },
        sessionsAsBeneficiary: { orderBy: { date: "desc" }, take: 20 },
        tasksAsBeneficiary: { orderBy: { createdAt: "asc" } },
      },
    }),
    prisma.opportunity.findMany({
      where: { type: "TRAINING", status: "متاحة" },
      select: { id: true, title: true, provider: true },
      orderBy: { title: "asc" },
    }),
  ]);

  const serialized = beneficiaries.map((b) => ({
    id: b.id,
    name: b.name,
    email: b.email,
    phone: b.phone,
    stage: b.stage,
    pendingStage: b.pendingStage,
    commitmentScore: b.commitmentScore,
    cvContent: b.cvContent,
    cvUrl: b.cvUrl,
    certificatesUrls: b.certificatesUrls,
    professionalRecommendations: b.professionalRecommendations,
    selectedTrainingCourseIds: parseCourseIds(b.selectedTrainingCourseIds),
    educationLevel: b.educationLevel,
    experience: b.experience,
    skills: b.skills,
    careerInterests: b.careerInterests,
    createdAt: b.createdAt.toISOString(),
    notes: b.notesAsBeneficiary.map((n) => ({
      id: n.id,
      content: n.content,
      createdAt: n.createdAt.toISOString(),
    })),
    sessions: b.sessionsAsBeneficiary.map((s) => ({
      id: s.id,
      date: s.date.toISOString(),
      status: s.status,
      notes: s.notes,
      meetingLink: s.meetingLink,
      location: s.location,
      commitmentRating: s.commitmentRating,
    })),
    tasks: b.tasksAsBeneficiary.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      isCompleted: t.isCompleted,
    })),
  }));

  const weekStart = new Date();
  weekStart.setHours(0, 0, 0, 0);
  const day = weekStart.getDay();
  const diffToSaturday = (day + 1) % 7;
  weekStart.setDate(weekStart.getDate() - diffToSaturday);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  const sessionsThisWeek = serialized.reduce((count, b) => {
    return (
      count +
      b.sessions.filter((s) => {
        const d = new Date(s.date);
        return d >= weekStart && d < weekEnd && s.status === "SCHEDULED";
      }).length
    );
  }, 0);

  const pendingTasks = serialized.reduce(
    (count, b) => count + b.tasks.filter((t) => !t.isCompleted).length,
    0
  );
  const pendingTransitions = serialized.filter((b) => b.pendingStage).length;

  return (
    <div className="min-h-screen bg-surface-muted">
      <Navbar userName={session.name} userRole={session.role} userId={session.id} />

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-8">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-primary" />
          <div className="text-right">
            <h1 className="text-2xl font-bold text-primary">لوحة المرشد المهني</h1>
            <p className="text-brand-gray">
              المستفيدون في مرحلة الإرشاد ({beneficiaries.length}) — عرض وتعديل فقط
            </p>
          </div>
        </div>

        <GuideDashboardKpis
          beneficiaryCount={beneficiaries.length}
          sessionsThisWeek={sessionsThisWeek}
          pendingTasks={pendingTasks}
          pendingTransitions={pendingTransitions}
        />

        <p className="text-sm text-brand-gray">
          انقر على المستفيد لإدارة الملف والجلسات والمهام. لا يمكنك إضافة أو حذف مستفيدين.
        </p>

        <GuideBeneficiaryTable beneficiaries={serialized} trainingCourses={trainingCourses} />
      </main>
    </div>
  );
}
