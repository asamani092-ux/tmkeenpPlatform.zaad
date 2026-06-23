import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required for seed");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const SEED_PASSWORD = "Zaad@2024";

async function main() {
  await prisma.application.deleteMany();
  await prisma.inAppNotification.deleteMany();
  await prisma.opportunityTarget.deleteMany();
  await prisma.followUp.deleteMany();
  await prisma.task.deleteMany();
  await prisma.careerPlan.deleteMany();
  await prisma.session.deleteMany();
  await prisma.note.deleteMany();
  await prisma.opportunity.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);

  await prisma.user.create({
    data: {
      name: "مدير النظام",
      email: "admin@alzaad.org",
      phone: "0500000001",
      password: passwordHash,
      role: "ADMIN",
      stage: "PENDING_APPROVAL",
    },
  });

  const guide = await prisma.user.create({
    data: {
      name: "أحمد المرشد",
      email: "guide@alzaad.org",
      phone: "0500000002",
      password: passwordHash,
      role: "GUIDE",
      stage: "PENDING_APPROVAL",
    },
  });

  const beneficiary1 = await prisma.user.create({
    data: {
      name: "سارة العتيبي",
      email: "beneficiary1@alzaad.org",
      phone: "0501000001",
      password: passwordHash,
      role: "BENEFICIARY",
      stage: "PENDING_APPROVAL",
      guideId: guide.id,
      educationLevel: "بكالوريوس",
      experience: "تدريب تعاوني 3 أشهر",
      skills: "حاسب، تواصل",
      careerInterests: "إدارة مكاتب",
      commitmentLevel: 40,
    },
  });

  const beneficiary2 = await prisma.user.create({
    data: {
      name: "محمد الحربي",
      email: "beneficiary2@alzaad.org",
      phone: "0501000002",
      password: passwordHash,
      role: "BENEFICIARY",
      stage: "GUIDANCE",
      pendingStage: "TRAINING",
      guideId: guide.id,
      educationLevel: "دبلوم",
      experience: "عمل جزئي في محل تجاري",
      skills: "مبيعات، خدمة عملاء",
      careerInterests: "مبيعات وتسويق",
      careerPlan: "التركيز على مهارات المبيعات ثم التدريب المتخصص.",
      commitmentLevel: 65,
      commitmentScore: 26,
    },
  });

  const beneficiary3 = await prisma.user.create({
    data: {
      name: "نورة القحطاني",
      email: "beneficiary3@alzaad.org",
      phone: "0501000003",
      password: passwordHash,
      role: "BENEFICIARY",
      stage: "TRAINING",
      guideId: guide.id,
      educationLevel: "ثانوية عامة",
      experience: "لا يوجد",
      skills: "أساسيات حاسب",
      careerInterests: "خدمة عملاء",
      careerPlan: "إكمال دورة مهارات المكتب ثم البحث عن توظيف.",
      commitmentLevel: 75,
      commitmentScore: 48,
    },
  });

  const beneficiary4 = await prisma.user.create({
    data: {
      name: "خالد الشمري",
      email: "beneficiary4@alzaad.org",
      phone: "0501000004",
      password: passwordHash,
      role: "BENEFICIARY",
      stage: "FOLLOW_UP",
      stageEnteredAt: new Date(Date.now() - 86400000 * 30 * 6),
      guideId: guide.id,
      educationLevel: "بكالوريوس محاسبة",
      experience: "سنتان في محاسبة",
      skills: "Excel، محاسبة",
      careerInterests: "محاسبة",
      isEmployed: true,
      commitmentLevel: 90,
      commitmentScore: 72,
      careerPlan: "استقرار وظيفي ومتابعة بعد التوظيف 6 أشهر.",
    },
  });

  await prisma.note.createMany({
    data: [
      {
        beneficiaryId: beneficiary2.id,
        guideId: guide.id,
        content: "جلسة تعريفية — تحديد المسارات المهنية المناسبة.",
      },
      {
        beneficiaryId: beneficiary3.id,
        guideId: guide.id,
        content: "جاهزة لمرحلة التدريب وفق الخطة المعتمدة.",
      },
    ],
  });

  await prisma.session.createMany({
    data: [
      {
        beneficiaryId: beneficiary2.id,
        guideId: guide.id,
        date: new Date(Date.now() + 86400000 * 3),
        status: "SCHEDULED",
        notes: "جلسة متابعة الخطة المهنية",
        meetingLink: "https://meet.example.com/zaad-guidance-2",
        location: null,
      },
      {
        beneficiaryId: beneficiary3.id,
        guideId: guide.id,
        date: new Date(Date.now() - 86400000 * 7),
        status: "ATTENDED",
        notes: "مراجعة استعداد التدريب",
        commitmentRating: 4,
        location: "مقر جمعية الزاد — قاعة الإرشاد",
      },
    ],
  });

  const training1 = await prisma.opportunity.create({
    data: {
      type: "TRAINING",
      title: "برنامج مهارات المكتب",
      provider: "معهد الزاد للتدريب",
      duration: "6 أسابيع",
      status: "متاحة",
      requirements: "إتمام مرحلة الإرشاد — التفرغ للحضور",
    },
  });

  await prisma.opportunity.create({
    data: {
      type: "TRAINING",
      title: "دورة التواصل المهني",
      provider: "أكاديمية التمكين",
      duration: "4 أسابيع",
      status: "متاحة",
      requirements: "مهارات حاسب أساسية",
    },
  });

  const job1 = await prisma.opportunity.create({
    data: {
      type: "EMPLOYMENT",
      title: "وظيفة مساعد إداري",
      provider: "شركة النماء",
      duration: "دوام كامل",
      status: "متاحة",
      requirements: "شهادة ثانوية — خبرة سنة",
      salary: "4500 ريال",
      jobType: "دوام كامل",
    },
  });

  await prisma.application.create({
    data: {
      beneficiaryId: beneficiary3.id,
      opportunityId: training1.id,
      status: "PENDING",
    },
  });

  await prisma.application.create({
    data: {
      beneficiaryId: beneficiary4.id,
      opportunityId: job1.id,
      status: "ACCEPTED",
    },
  });

  await prisma.careerPlan.createMany({
    data: [
      {
        beneficiaryId: beneficiary2.id,
        status: "ACTIVE",
        tasks: [
          { id: "t1", title: "تحديد المسار المهني", done: true },
          { id: "t2", title: "إعداد السيرة الذاتية", done: false },
        ],
      },
      {
        beneficiaryId: beneficiary3.id,
        status: "ACTIVE",
        tasks: [
          { id: "t1", title: "إكمال دورة مهارات المكتب", done: false },
          { id: "t2", title: "التقديم على فرصة تدريب", done: true },
        ],
      },
    ],
  });

  await prisma.task.createMany({
    data: [
      {
        beneficiaryId: beneficiary2.id,
        guideId: guide.id,
        title: "تحديد المسار المهني",
        description: "تحليل الميول والمهارات واختيار المسار المناسب",
        isCompleted: true,
      },
      {
        beneficiaryId: beneficiary2.id,
        guideId: guide.id,
        title: "إعداد السيرة الذاتية",
        description: "صياغة سيرة ذاتية احترافية باللغة العربية",
        isCompleted: false,
      },
      {
        beneficiaryId: beneficiary3.id,
        guideId: guide.id,
        title: "إكمال دورة مهارات المكتب",
        description: null,
        isCompleted: false,
      },
      {
        beneficiaryId: beneficiary3.id,
        guideId: guide.id,
        title: "التقديم على فرصة تدريب",
        description: "التقديم على برنامج مهارات المكتب",
        isCompleted: true,
      },
    ],
  });

  await prisma.followUp.createMany({
    data: [
      {
        beneficiaryId: beneficiary4.id,
        month: 1,
        status: "COMPLETED",
        notes: "استقرار جيد في العمل",
      },
      {
        beneficiaryId: beneficiary4.id,
        month: 3,
        status: "PENDING",
        notes: "",
      },
    ],
  });

  console.log("Seed V5 completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
