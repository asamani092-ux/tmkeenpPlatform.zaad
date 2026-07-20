import {
  Callout,
  CollapsibleSection,
  Grid,
  H1,
  H2,
  Select,
  Stack,
  Stat,
  Table,
  Text,
  TextArea,
  useCanvasState,
  useHostTheme,
} from "cursor/canvas";

const VERDICTS = ["غير مجرّب", "يعتمد", "يحتاج تحسين"] as const;
type Verdict = (typeof VERDICTS)[number];
const DEFAULT_VERDICT: Verdict = VERDICTS[0];

const NOTE_CATEGORIES = [
  { value: "", label: "—" },
  { value: "ui", label: "UI ناقص" },
  { value: "flow", label: "بيانات/تدفق" },
  { value: "auth", label: "صلاحيات" },
  { value: "perf", label: "أداء/أخطاء" },
  { value: "rtl", label: "نص/RTL" },
  { value: "other", label: "أخرى" },
] as const;

type ToolRow = {
  id: string;
  tool: string;
  path: string;
  checks: string;
  hint?: string;
};

type ToolGroup = {
  id: string;
  title: string;
  tools: ToolRow[];
};

const FILTER_OPTIONS = [
  { value: "all", label: "كل الأدوات" },
  { value: "غير مجرّب", label: "غير مجرّب فقط" },
  { value: "يعتمد", label: "يعتمد فقط" },
  { value: "يحتاج تحسين", label: "يحتاج تحسين فقط" },
  { value: "pending-notes", label: "بدون تقييم نهائي" },
];

const GROUPS: ToolGroup[] = [
  {
    id: "auth",
    title: "المصادقة والوصول (عام)",
    tools: [
      {
        id: "landing-home",
        tool: "الصفحة الرئيسية",
        path: "/",
        checks:
          "CTAs للضيف/المسجّل؛ أقسام المميزات والشركاء؛ شعار؛ خروج/إشعارات عند الدخول",
      },
      {
        id: "login",
        tool: "تسجيل الدخول",
        path: "/login",
        checks:
          "POST ناجح → لوحة الدور؛ رسالة خطأ؛ ?registered=1؛ رابط نسيت كلمة المرور",
      },
      {
        id: "register-beneficiary",
        tool: "تسجيل مستفيد",
        path: "/register",
        checks:
          "رفع PDF اختياري؛ POST /api/auth/register؛ redirect /login?registered=1؛ تحقق الحقول",
      },
      {
        id: "forgot-password",
        tool: "استعادة كلمة المرور",
        path: "/forgot-password",
        checks:
          "POST /api/auth/forgot-password؛ **غير موجود في Navbar** — من /login فقط",
        hint: "خدمة بلا شاشة في التنقل الرئيسي",
      },
      {
        id: "logout",
        tool: "خروج",
        path: "POST /api/auth/logout",
        checks: "إنهاء الجلسة؛ منع /dashboard/*؛ العودة لواجهة الضيف",
      },
      {
        id: "dashboard-redirect",
        tool: "توجيه اللوحة",
        path: "/dashboard",
        checks:
          "ADMIN/GUIDE/BENEFICIARY → المسار الصحيح؛ middleware يمنع تبادل الأدوار",
      },
    ],
  },
  {
    id: "shared",
    title: "مشترك (كل الأدوار)",
    tools: [
      {
        id: "notifications-bell",
        tool: "الإشعارات",
        path: "Navbar",
        checks:
          "GET/PATCH /api/notifications؛ شارة غير مقروء؛ تعليم الكل؛ polling 60s",
      },
    ],
  },
  {
    id: "beneficiary",
    title: "لوحة المستفيد",
    tools: [
      {
        id: "beneficiary-dashboard",
        tool: "الملف الرقمي",
        path: "/dashboard/beneficiary",
        checks: "عنوان + مرحلة؛ Navbar؛ beneficiary2@alzaad.org (GUIDANCE)",
      },
      {
        id: "beneficiary-pending",
        tool: "بانتظار اعتماد التسجيل",
        path: "/dashboard/beneficiary",
        checks: "بانر PENDING_APPROVAL فقط؛ beneficiary1@alzaad.org",
      },
      {
        id: "beneficiary-next-session",
        tool: "الجلسة القادمة",
        path: "#now",
        checks: "NextSessionCard؛ رابط meet أو موقع؛ حالة فارغة",
      },
      {
        id: "beneficiary-stage",
        tool: "مسار التمكين",
        path: "/dashboard/beneficiary",
        checks: "StageProgress؛ نسبة؛ تاريخ stageEnteredAt",
      },
      {
        id: "beneficiary-guide-hub",
        tool: "من مرشدك",
        path: "/dashboard/beneficiary",
        checks: "توصيات؛ دورات موصى بها؛ ملاحظات المرشد",
      },
      {
        id: "beneficiary-tasks",
        tool: "مهام المسار",
        path: "/dashboard/beneficiary",
        checks: "PATCH /api/tasks/[id] إتمام؛ strikethrough عند الإكمال",
      },
      {
        id: "beneficiary-commitment",
        tool: "مؤشر الالتزام",
        path: "/dashboard/beneficiary",
        checks: "قراءة فقط؛ يتحدث بعد تحضير جلسة بتقييم 1–5",
      },
      {
        id: "beneficiary-training-apply",
        tool: "فرص تدريب",
        path: "#opportunities-section",
        checks: "POST /api/applications؛ ظهور حسب المرحلة/الاستهداف",
      },
      {
        id: "beneficiary-employment-apply",
        tool: "فرص توظيف",
        path: "#opportunities-section",
        checks: "مرحلة EMPLOYMENT أو admin-target؛ POST /api/applications",
      },
      {
        id: "beneficiary-app-history",
        tool: "سجل التقديمات",
        path: "#opportunities-section",
        checks: "PENDING/ACCEPTED/REJECTED؛ يختفي إن لم توجد تقديمات",
      },
      {
        id: "beneficiary-profile-view",
        tool: "بيانات الملف الموحد",
        path: "#opportunities-section",
        checks: "CV/شهادات/حقول read-only؛ email/phone LTR",
      },
      {
        id: "beneficiary-profile-edit",
        tool: "تعديل البيانات",
        path: "modal",
        checks: "PATCH /api/profile + رفع PDF؛ الاسم/البريد read-only",
      },
    ],
  },
  {
    id: "guide",
    title: "لوحة المرشد",
    tools: [
      {
        id: "guide-dashboard",
        tool: "لوحة المرشد المهني",
        path: "/dashboard/guide",
        checks: "KPIs؛ جدول GUIDANCE فقط؛ guide@alzaad.org",
      },
      {
        id: "guide-tab-profile",
        tool: "بيانات المستفيد",
        path: "modal › profile",
        checks: "POST /api/notes؛ POST /api/stage-upgrade؛ توصية انتقال",
      },
      {
        id: "guide-tab-sessions",
        tool: "إدارة الجلسات",
        path: "modal › sessions",
        checks: "POST/PATCH/DELETE /api/sessions؛ تحضير + تقييم 1–5",
      },
      {
        id: "guide-tab-tasks",
        tool: "المهام",
        path: "modal › tasks",
        checks: "POST/PATCH/DELETE /api/tasks",
      },
      {
        id: "guide-tab-evaluations",
        tool: "التقييم والتوصيات",
        path: "modal › evaluations",
        checks: "PATCH /api/beneficiaries/[id]/guide-profile؛ دورات تدريب",
      },
    ],
  },
  {
    id: "admin",
    title: "لوحة المدير",
    tools: [
      {
        id: "admin-dashboard",
        tool: "لوحة المدير",
        path: "/dashboard/admin",
        checks: "بطاقات ملخص؛ admin@alzaad.org",
      },
      {
        id: "admin-bulk-export",
        tool: "تصدير CSV",
        path: "/dashboard/admin",
        checks: "AdminBulkExport — 6 أقسام؛ tmkeen-admin-export.csv",
      },
      {
        id: "admin-pipeline",
        tool: "لوحة التتبع",
        path: "tab pipeline",
        checks: "اعتماد تسجيل/انتقال؛ POST /api/stage-approve",
      },
      {
        id: "admin-opportunities",
        tool: "إدارة الفرص",
        path: "tab opportunities",
        checks: "CRUD /api/opportunities؛ استهداف /targets",
      },
      {
        id: "admin-guides",
        tool: "إدارة المرشدين",
        path: "tab guides",
        checks: "POST/PATCH/DELETE /api/guides",
      },
      {
        id: "admin-management",
        tool: "إدارة المستفيدين",
        path: "tab management",
        checks: "إسناد مرشد؛ تعديل PATCH admin/beneficiaries؛ اعتماد",
      },
      {
        id: "admin-applications",
        tool: "مراجعة التقديمات",
        path: "tab applications",
        checks: "قبول/رفض PATCH /api/applications/[id]",
      },
      {
        id: "admin-followup",
        tool: "متابعة ما بعد التوظيف",
        path: "tab followup",
        checks: "POST/DELETE /api/follow-ups أشهر 1/3/6",
      },
      {
        id: "admin-impact",
        tool: "قياس الأثر",
        path: "tab impact",
        checks: "read-only آخر 6 أشهر؛ توزيع المراحل",
      },
      {
        id: "admin-settings",
        tool: "إعدادات النظام",
        path: "tab settings",
        checks: "GET/PUT /api/system-settings؛ شارة SMTP",
      },
    ],
  },
];

const OUT_OF_SCOPE = [
  "AdminBeneficiaryAssign.tsx — غير مستورد (الإسناد من إدارة المستفيدين)",
  "ExportExcelButton / ExportButtons — غير مستورد (AdminBulkExport)",
  "BeneficiaryOpportunitiesProfile.tsx — غير مستورد",
  "GuideProfileSections.tsx — غير مستورد (GuideEvaluationsTab بديلاً)",
  "/api/career-plan* — API بدون شاشة UI",
  "/reset-password — غير موجود (المسار: /forgot-password)",
  "تبويبات Admin/Guide — بدون deep link URL",
  "SMTP Hostinger — يحتاج SMTP_* في .env",
];

const ALL_TOOL_IDS = GROUPS.flatMap((g) => g.tools.map((t) => t.id));

function verdictTone(v: Verdict): "neutral" | "success" | "warning" | undefined {
  if (v === "يعتمد") return "success";
  if (v === "يحتاج تحسين") return "warning";
  return "neutral";
}

export default function UatToolsChecklist() {
  useHostTheme();
  const [filter, setFilter] = useCanvasState<string>("filter", "all");
  const [verdicts, setVerdicts] = useCanvasState<Record<string, Verdict>>("verdicts", {});
  const [noteCategories, setNoteCategories] = useCanvasState<Record<string, string>>(
    "noteCategories",
    {}
  );
  const [notes, setNotes] = useCanvasState<Record<string, string>>("notes", {});

  const stats = ALL_TOOL_IDS.reduce(
    (acc, id) => {
      const v = verdicts[id] ?? "غير مجرّب";
      acc.total += 1;
      if (v === "يعتمد") acc.approved += 1;
      else if (v === "يحتاج تحسين") acc.needsWork += 1;
      else acc.untried += 1;
      return acc;
    },
    { total: 0, approved: 0, needsWork: 0, untried: 0 }
  );

  function setVerdict(id: string, value: string) {
    setVerdicts((prev) => ({ ...prev, [id]: value as Verdict }));
  }

  function matchesFilter(id: string): boolean {
    const v = verdicts[id] ?? DEFAULT_VERDICT;
    if (filter === "all") return true;
    if (filter === "pending-notes") return v === DEFAULT_VERDICT;
    return v === filter;
  }

  return (
    <Stack gap={20} style={{ direction: "rtl", textAlign: "right" }}>
      <Stack gap={8}>
        <H1>قائمة تقييم أدوات — منصة تمكين</H1>
        <Text tone="secondary" size="small">
          التجربة: http://localhost:3000 — كلمة المرور من prisma/seed.ts (مفتاح SEED_PASSWORD)
        </Text>
        <Callout tone="info" title="حسابات seed">
          admin@alzaad.org · guide@alzaad.org · beneficiary1–4@alzaad.org
        </Callout>
      </Stack>

      <Grid columns={4} gap={12}>
        <Stat value={String(stats.total)} label="الإجمالي" />
        <Stat value={String(stats.approved)} label="يعتمد" tone="success" />
        <Stat value={String(stats.needsWork)} label="يحتاج تحسين" tone="warning" />
        <Stat value={String(stats.untried)} label={DEFAULT_VERDICT} />
      </Grid>

      <RowFilter filter={filter} setFilter={setFilter} />

      {GROUPS.map((group) => {
        const visible = group.tools.filter((t) => matchesFilter(t.id));
        if (visible.length === 0) return null;

        return (
          <CollapsibleSection key={group.id} title={group.title} defaultOpen>
            <Table
              headers={[
                "الأداة",
                "المسار",
                "ما يُتحقق منه",
                "التقييم",
                "تصنيف الملاحظة",
                "ملاحظة",
              ]}
              columnAlign={["right", "left", "right", "center", "center", "right"]}
              striped
              stickyHeader
              rowTone={visible.map((t) => verdictTone(verdicts[t.id] ?? DEFAULT_VERDICT))}
              rows={visible.map((t) => [
                t.tool,
                t.path,
                t.checks + (t.hint ? ` (${t.hint})` : ""),
                <Select
                  key={`v-${t.id}`}
                  value={verdicts[t.id] ?? DEFAULT_VERDICT}
                  onChange={(v) => setVerdict(t.id, v)}
                  options={VERDICTS.map((x) => ({ value: x, label: x }))}
                  style={{ minWidth: 130 }}
                />,
                <Select
                  key={`c-${t.id}`}
                  value={noteCategories[t.id] ?? ""}
                  onChange={(v) =>
                    setNoteCategories((prev) => ({ ...prev, [t.id]: v }))
                  }
                  options={[...NOTE_CATEGORIES]}
                  style={{ minWidth: 120 }}
                />,
                <TextArea
                  key={`n-${t.id}`}
                  value={notes[t.id] ?? ""}
                  onChange={(v) => setNotes((prev) => ({ ...prev, [t.id]: v }))}
                  placeholder="ملاحظات التجربة…"
                  rows={2}
                  style={{ minWidth: 160 }}
                />,
              ])}
            />
          </CollapsibleSection>
        );
      })}

      <Stack gap={8}>
        <H2>خارج نطاق التجربة</H2>
        <Text tone="secondary" size="small">
          ROADMAP / مكوّنات غير مربوطة بالتنقل — لا تُعدّ أدوات للتقييم
        </Text>
        {OUT_OF_SCOPE.map((line) => (
          <Text key={line} size="small">
            • {line}
          </Text>
        ))}
      </Stack>
    </Stack>
  );
}

function RowFilter({
  filter,
  setFilter,
}: {
  filter: string;
  setFilter: (v: string) => void;
}) {
  return (
    <Stack gap={6}>
      <Text weight="semibold">تصفية</Text>
      <Select
        value={filter}
        onChange={setFilter}
        options={FILTER_OPTIONS}
        style={{ maxWidth: 280 }}
      />
    </Stack>
  );
}
