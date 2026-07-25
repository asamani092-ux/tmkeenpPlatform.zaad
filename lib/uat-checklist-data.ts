export type UatVerdict = "غير مجرّب" | "يعتمد" | "يحتاج تحسين";

export type UatTool = {
  id: string;
  tool: string;
  path: string;
  checks: string;
  hint?: string;
  groupTitle: string;
};

export type UatToolGroup = {
  id: string;
  title: string;
  tools: Omit<UatTool, "groupTitle">[];
};

export const UAT_VERDICTS: UatVerdict[] = ["غير مجرّب", "يعتمد", "يحتاج تحسين"];

export const UAT_DEFAULT_VERDICT: UatVerdict = "غير مجرّب";

export const UAT_NOTE_CATEGORIES = [
  { value: "", label: "— بدون تصنيف" },
  { value: "ui", label: "UI ناقص" },
  { value: "flow", label: "بيانات/تدفق" },
  { value: "auth", label: "صلاحيات" },
  { value: "perf", label: "أداء/أخطاء" },
  { value: "rtl", label: "نص/RTL" },
  { value: "other", label: "أخرى" },
] as const;

export const UAT_GROUPS: UatToolGroup[] = [
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
          "POST /api/auth/forgot-password؛ غير موجود في Navbar — من /login فقط",
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
        checks: "CRUD /api/opportunities؛ showToAll للجميع",
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
        checks:
          "أشهر 1–6؛ تذكير يدوي ظاهر؛ إنهاء مبكر بسبب؛ فجوات الأشهر؛ null→ACTIVE",
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
  {
    id: "postdeploy-email",
    title: "ما بعد النشر (بريد وتحقق حي)",
    tools: [
      {
        id: "postdeploy-admin-settings-sender",
        tool: "حفظ بريد المرسل",
        path: "/dashboard/admin → إعدادات",
        checks:
          "شارة SMTP مفعّل؛ PUT يحفظ senderEmail دون خطأ خادم؛ القيمة تبقى بعد إعادة التحميل",
      },
      {
        id: "postdeploy-test-email",
        tool: "إرسال بريد تجريبي",
        path: "/dashboard/admin → إعدادات",
        checks: "إرسال تجربة يصل لصندوق حقيقي؛ لا رسالة SMTP غير مفعّل",
      },
      {
        id: "postdeploy-register-otp",
        tool: "OTP تسجيل مستفيد (بريد حي)",
        path: "/register",
        checks:
          "رمز 6 أرقام يصل للبريد؛ verify ينجح؛ لا الاعتماد على previewCode فقط",
      },
      {
        id: "postdeploy-forgot-password-mail",
        tool: "استعادة كلمة المرور (بريد حي)",
        path: "/forgot-password",
        checks:
          "بريد غير مسجّل → تنبيه؛ رسالة الاستعادة تصل (10 د)؛ رفض إعادة نفس المرور؛ دخول بعدها",
      },
      {
        id: "postdeploy-app-accept-mail",
        tool: "بريد قبول التقديم",
        path: "admin → تقديمات",
        checks:
          "قبول تقديم → إشعار واجهة + بريد يوضح أنه سيُبلَّغ بالتفاصيل قريباً",
      },
      {
        id: "postdeploy-followup-remind",
        tool: "تذكير متابعة بالتوظيف",
        path: "admin → متابعة",
        checks:
          "زر تذكير ظاهر؛ opens/due/lastReminder؛ يعمل لـ ACTIVE أو null→ACTIVE؛ بريد بعد SMTP",
      },
      {
        id: "postdeploy-session-join-15m",
        tool: "انضمام الجلسة قبل 15 د",
        path: "مستفيد → الجلسة القادمة",
        checks:
          "وقت Asia/Riyadh متطابق؛ عدّاد ساعات/دقائق؛ انضمام قبل 15 د فقط؛ «رابط الاجتماع»",
      },
      {
        id: "postdeploy-notifications-live",
        tool: "الإشعارات بعد النشر",
        path: "Navbar",
        checks: "شارة وقائمة بعد أحداث حقيقية (قبول تسجيل/تقديم)؛ تعليم كمقروء",
      },
    ],
  },
  {
    id: "email-lifecycle",
    title: "دورات البريد (تجربة حية)",
    tools: [
      {
        id: "email-01-register-otp",
        tool: "① OTP تسجيل مستفيد",
        path: "/register",
        checks: "رمز 6 أرقام يصل للبريد؛ verify ينجح؛ بدون الاعتماد على previewCode",
      },
      {
        id: "email-02-admin-new-registration",
        tool: "② بريد المدير — مستفيد جديد",
        path: "بعد verify التسجيل",
        checks: "كل حسابات ADMIN تستلم «تسجيل مستفيد جديد» مع الاسم والبريد",
      },
      {
        id: "email-03-forgot-password",
        tool: "③ استعادة كلمة المرور",
        path: "/forgot-password",
        checks:
          "بريد غير مسجّل → رسالة صريحة؛ رابط صالح 10 د؛ رفض نفس كلمة المرور السابقة",
      },
      {
        id: "email-04-test-send",
        tool: "④ إرسال تجريبي من الإعدادات",
        path: "/dashboard/admin → إعدادات",
        checks: "إرسال تجربة ينجح؛ senderEmail = SMTP_USER",
      },
      {
        id: "email-05-approve-registration",
        tool: "⑤ اعتماد التسجيل",
        path: "admin → اعتماد مستفيد",
        checks: "بعد إسناد مرشد والاعتماد يصل بريد «تم اعتماد تسجيلك» للمستفيد",
      },
      {
        id: "email-06-approve-stage",
        tool: "⑥ اعتماد انتقال مرحلة",
        path: "admin → اعتماد مرحلة",
        checks: "بريد للمستفيد بعنوان المرحلة الجديدة",
      },
      {
        id: "email-07-session-scheduled",
        tool: "⑦ جدولة جلسة إرشاد",
        path: "مرشد → إدارة الجلسات",
        checks:
          "بريد للمستفيد وللمرشد بنفس وقت السعودية (12س بلا ثوانٍ) + رابط يُفتح قبل 15 د",
      },
      {
        id: "email-08-application-accept",
        tool: "⑧ قبول تقديم",
        path: "admin → تقديمات",
        checks: "بريد قبول يتضمن أنه سيُبلَّغ بالتفاصيل قريباً + إشعار واجهة",
      },
      {
        id: "email-09-application-reject",
        tool: "⑨ رفض تقديم",
        path: "admin → تقديمات",
        checks: "بريد رفض يصل للمستفيد مع الملاحظة إن وُجدت",
      },
      {
        id: "email-10-followup-start",
        tool: "⑩ بدء متابعة التوظيف",
        path: "انتقال لمرحلة FOLLOW_UP",
        checks: "بريد تذكير نموذج الشهر 1 + رابط اللوحة",
      },
      {
        id: "email-11-followup-cron",
        tool: "⑪ تذكير متابعة تلقائي (Cron)",
        path: "GET /api/cron/follow-up-reminders",
        checks: "مع CRON_SECRET؛ تذكير للشهر النشط؛ لا أكثر من مرة/24س",
      },
      {
        id: "email-12-followup-manual",
        tool: "⑫ تذكير متابعة يدوي",
        path: "admin → متابعة",
        checks:
          "زر التذكير في رأس البطاقة؛ لا يظهر «معطّل» لحالة null؛ يرسل بريد الشهر الحالي",
      },
      {
        id: "email-13-followup-complete",
        tool: "⑬ اكتمال/إنهاء برنامج المتابعة",
        path: "admin → متابعة → إنهاء",
        checks:
          "إنهاء قبل اكتمال 6 أشهر بسبب إجباري؛ بريد/إشعار للمستفيد؛ استئناف لاحقاً ممكن",
      },
    ],
  },
  {
    id: "reverify-fixes",
    title: "إعادة تحقق بعد إصلاحات UAT (موجة جديدة)",
    tools: [
      {
        id: "reverify-session-timezone",
        tool: "وقت الجلسة موحّد (السعودية)",
        path: "مرشد + مستفيد + بريد",
        checks:
          "موعد المرشد = المستفيد = البريد بتوقيت Asia/Riyadh و12 ساعة بلا ثوانٍ (ملاحظات #8)",
        hint: "كان يظهر فرق ~3 ساعات",
      },
      {
        id: "reverify-session-join",
        tool: "انضمام الجلسة + العدّاد",
        path: "مستفيد / مودال المرشد",
        checks:
          "أقل من 24س → ساعات/دقائق؛ SessionJoinButton؛ يُفتح قبل 15 د؛ تسمية «رابط الاجتماع» (#9)",
      },
      {
        id: "reverify-forgot-password",
        tool: "نسيت كلمة المرور (قواعد جديدة)",
        path: "/forgot-password",
        checks:
          "بريد غير مسجّل → «البريد غير مسجّل»؛ صلاحية 10 د؛ رفض نفس كلمة المرور السابقة",
      },
      {
        id: "reverify-followup-remind-ui",
        tool: "تذكير المتابعة ظاهر وواضح",
        path: "admin → متابعة",
        checks:
          "زر إعادة إرسال تذكير في الرأس؛ opensAt/dueAt/lastReminder؛ عدّاد التذكير التالي 24س",
      },
      {
        id: "reverify-followup-force-end",
        tool: "إنهاء متابعة مبكر بسبب",
        path: "admin → متابعة → إنهاء/إكمال",
        checks:
          "أشهر ناقصة → تنبيه + سبب إلزامي + تأكيد مزدوج؛ إشعار وبريد للمستفيد",
      },
      {
        id: "reverify-apps-accept-reject",
        tool: "قبول/رفض التقديم",
        path: "admin → تقديمات",
        checks:
          "رفض بنفس بروز القبول على الجوال؛ بريد القبول يبدأ بجملة التفاصيل قريباً",
      },
      {
        id: "reverify-email-bodies",
        tool: "نصوص البريد العربي",
        path: "OTP / اعتماد / جلسة / تقديم",
        checks:
          "صياغة أوضح؛ أوقات السعودية؛ OTP وreset خلال 10 د؛ بدون ثوانٍ في الموعد",
      },
      {
        id: "reverify-contact-icons",
        tool: "أيقونات التواصل",
        path: "مرشد / مستفيد / جداول",
        checks:
          "واتساب أخضر #25D366؛ أيقونة بريد واضحة؛ tel: بهاتف عند وجود رقم (ملاحظات #3–4–6)",
      },
      {
        id: "reverify-recommendations-hint",
        tool: "نص توضيحي للتوصيات",
        path: "من مرشدك (Hub/Drawer)",
        checks:
          "يظهر أن التوصيات توجيه مهني عام ومختلفة عن مهام المسار",
      },
      {
        id: "reverify-name-edit",
        tool: "تعديل الاسم",
        path: "admin إدارة المستفيدين + تعديل بياناتي",
        checks: "حقل الاسم قابل للتعديل والحفظ للمدير والمستفيد",
      },
      {
        id: "reverify-admin-mobile-tabs",
        tool: "تبويبات المدير على الجوال",
        path: "/dashboard/admin",
        checks: "شريط أفقي قابل للتمرير؛ تسميات قصيرة على الشاشات الصغيرة",
      },
      {
        id: "reverify-followup-beneficiary-schedule",
        tool: "بطاقة جدول المتابعة للمستفيد",
        path: "مستفيد FOLLOW_UP",
        checks: "نموذج الشهر X يفتح في … / يستحق في … بتوقيت السعودية",
      },
    ],
  },
  {
    id: "ui-notes",
    title: "ملاحظات الواجهات (عامة)",
    tools: [
      {
        id: "notes-general",
        tool: "ملاحظات عامة على المنصة",
        path: "—",
        checks: "أي ملاحظة عامة لا تخص واجهة واحدة (أداء، نصوص، استقرار، اقتراحات)",
      },
      {
        id: "notes-admin-ui",
        tool: "ملاحظات واجهة المدير",
        path: "/dashboard/admin",
        checks: "سجّل ملاحظات تجربة لوحة المدير فقط (تنقل، نماذج، جداول، أخطاء)",
      },
      {
        id: "notes-guide-ui",
        tool: "ملاحظات واجهة المرشد",
        path: "/dashboard/guide",
        checks: "سجّل ملاحظات تجربة لوحة المرشد فقط (جلسات، مهام، تقييم، جوال)",
      },
      {
        id: "notes-beneficiary-ui",
        tool: "ملاحظات واجهة المستفيد",
        path: "/dashboard/beneficiary",
        checks: "سجّل ملاحظات تجربة لوحة المستفيد فقط (مسار، فرص، ملف، متابعة)",
      },
    ],
  },
];

export const UAT_ALL_TOOLS: UatTool[] = UAT_GROUPS.flatMap((group) =>
  group.tools.map((tool) => ({ ...tool, groupTitle: group.title }))
);

/** Wave after first UAT pass — email / live verify / UI notes. Stable ids. */
export const UAT_POSTDEPLOY_GROUP_ID = "postdeploy-email";

/** Post-fix re-verification wave from latest UAT notes. Stable ids — never rename. */
export const UAT_REVERIFY_GROUP_ID = "reverify-fixes";

export const UAT_WAVE_PREFIXES = [
  "reverify-",
  "postdeploy-",
  "email-",
  "notes-",
] as const;

/** Default wave: re-check after postdeploy fixes only. */
export const UAT_REVERIFY_TOOLS: UatTool[] = UAT_ALL_TOOLS.filter((tool) =>
  tool.id.startsWith("reverify-")
);

/** Broader remaining wave (email + notes + postdeploy + reverify). */
export const UAT_REMAINING_TOOLS: UatTool[] = UAT_ALL_TOOLS.filter((tool) =>
  UAT_WAVE_PREFIXES.some((prefix) => tool.id.startsWith(prefix))
);

export const UAT_OUT_OF_SCOPE = [
  "AdminBeneficiaryAssign.tsx — غير مستورد (الإسناد من إدارة المستفيدين)",
  "ExportExcelButton / ExportButtons — غير مستورد (AdminBulkExport)",
  "BeneficiaryOpportunitiesProfile.tsx — غير مستورد",
  "GuideProfileSections.tsx — غير مستورد (GuideEvaluationsTab بديلاً)",
  "/api/career-plan* — API بدون شاشة UI",
  "/reset-password — غير موجود (المسار: /forgot-password)",
  "تبويبات Admin/Guide — بدون deep link URL",
  "SMTP — يُختبر عبر مجموعة «ما بعد النشر» بعد ضبط SMTP_* في Coolify",
];

export const UAT_STORAGE_KEY = "tmkeen-uat-checklist-v1";

export type UatChecklistState = {
  activeToolId: string;
  verdicts: Record<string, UatVerdict>;
  noteCategories: Record<string, string>;
  notes: Record<string, string>;
};

export function createDefaultUatState(): UatChecklistState {
  return {
    activeToolId: UAT_ALL_TOOLS[0]?.id ?? "",
    verdicts: {},
    noteCategories: {},
    notes: {},
  };
}

/** Build Markdown report for pasting into the agent chat (includes full notes). O(n). */
export function buildUatAgentExport(
  state: UatChecklistState,
  tools: UatTool[] = UAT_ALL_TOOLS
): string {
  const categoryLabel = Object.fromEntries(
    UAT_NOTE_CATEGORIES.map((c) => [c.value, c.label])
  ) as Record<string, string>;

  let approved = 0;
  let needsWork = 0;
  let untried = 0;

  const rows = tools.map((t) => {
    const verdict = state.verdicts[t.id] ?? UAT_DEFAULT_VERDICT;
    if (verdict === "يعتمد") approved += 1;
    else if (verdict === "يحتاج تحسين") needsWork += 1;
    else untried += 1;
    const cat = state.noteCategories[t.id] ?? "";
    const note = (state.notes[t.id] ?? "").trim();
    return {
      id: t.id,
      tool: t.tool,
      group: t.groupTitle,
      path: t.path,
      verdict,
      category: cat ? categoryLabel[cat] ?? cat : "—",
      note: note || "—",
    };
  });

  const isReverify =
    tools.length > 0 && tools.every((t) => t.id.startsWith("reverify-"));
  const isWave =
    isReverify ||
    tools === UAT_REMAINING_TOOLS ||
    (tools.length > 0 &&
      tools.every((t) =>
        UAT_WAVE_PREFIXES.some((prefix) => t.id.startsWith(prefix))
      ));

  const title = isReverify
    ? "# تقرير إعادة تحقق UAT بعد الإصلاحات (/uat-checklist)"
    : isWave
      ? "# تقرير تقييم أدوات UAT — بريد + ملاحظات واجهات (/uat-checklist)"
      : "# تقرير تقييم أدوات UAT — من /uat-checklist";

  const lines: string[] = [
    title,
    "",
    `الإجمالي: ${tools.length} | يعتمد: ${approved} | يحتاج تحسين: ${needsWork} | غير مجرّب: ${untried}`,
    "",
    "## يحتاج تحسين (أولوية الإصلاح)",
  ];

  const needs = rows.filter((r) => r.verdict === "يحتاج تحسين");
  if (needs.length === 0) lines.push("_لا يوجد_");
  else {
    for (const r of needs) {
      lines.push(
        `- \`${r.id}\` | ${r.tool} | ${r.group} | ${r.path} | تصنيف: ${r.category} | ملاحظة: ${r.note}`
      );
    }
  }

  lines.push("", "## يعتمد");
  const ok = rows.filter((r) => r.verdict === "يعتمد");
  if (ok.length === 0) lines.push("_لا يوجد_");
  else for (const r of ok) lines.push(`- \`${r.id}\` | ${r.tool}`);

  const uiNotes = rows.filter((r) => r.id.startsWith("notes-"));
  if (uiNotes.length > 0) {
    lines.push("", "## ملاحظات الواجهات");
    for (const r of uiNotes) {
      lines.push(
        `### ${r.tool}`,
        `التقييم: ${r.verdict} | التصنيف: ${r.category}`,
        r.note,
        ""
      );
    }
  }

  lines.push("", "## جميع البنود");
  for (const r of rows) {
    lines.push(
      `| ${r.id} | ${r.tool} | ${r.group} | ${r.verdict} | ${r.category} | ${r.note.replace(/\|/g, "/")} |`
    );
  }

  lines.push(
    "",
    "---",
    "تعليمات للوكيل: نفّذ إصلاح كل بند تحت «يحتاج تحسين» مع الملاحظات؛ لا تمسح localStorage للتقييمات."
  );
  return lines.join("\n");
}
