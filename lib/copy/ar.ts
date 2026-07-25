/** نصوص الصفحة الرئيسية — عدّل هنا مباشرة */
export const landingCopy = {
  title: "منصة تمكين",
  subtitle: "نرافقك في رحلتك من التسجيل حتى التمكين",
  registerBtn: "تسجيل مستفيد جديد",
  loginBtn: "تسجيل الدخول",
  dashboardBtn: "الانتقال إلى لوحة التحكم",
  footer: "جمعية الزاد — منصة التمكين المستدام",
  aboutTitle: "من نحن",
  aboutText:
    "منصة التمكين من جمعية الزاد منصة رقمية تهدف إلى تحقيق الاستقلالية الاقتصادية والمهنية للأسر المستفيدة، من خلال مسار تمكيني شامل يبدأ بالإرشاد المهني، مرورا بالتأهيل والتدريب المخصص وربط الخريجين بالفرص الوظيفية الملائمة، وبمتابعة مستمرة لضمان تحقيق أثر مستدام",
  partnersTitle: "شركاء النجاح",
  partnersSubtitle: "شركاؤنا في التدريب والتوظيف — شعارات توضيحية",
  featurePersonalTitle: "متابعة شخصية",
  featurePersonalText: "كل مستفيد مرتبط بمرشد يتابع تقدمه.",
  featureStagesTitle: "مراحل متسلسلة",
  featureStagesText: "التسجيل، الإرشاد، التدريب، ثم التوظيف",
  featureOppsTitle: "فرص تدريب وتوظيف",
  featureOppsText: "إدارة مركزية للفرص التدريبية والوظيفية.",
} as const;

export const PARTNERS = [
  { name: "معهد الزاد للتدريب", abbr: "زاد" },
  { name: "أكاديمية التمكين", abbr: "تمكين" },
  { name: "شركة النماء", abbr: "نماء" },
  { name: "مصنع الأمل", abbr: "أمل" },
  { name: "مركز المهارات", abbr: "مهارات" },
  { name: "مجموعة الريادة", abbr: "ريادة" },
] as const;

export const registerCopy = {
  title: "تسجيل مستفيد جديد",
  subtitle: "إنشاء ملف رقمي موحد — يبدأ مسارك بمرحلة الإرشاد",
  cvLabel: "السيرة الذاتية (PDF)",
  cvHint: "مطلوب — ملف PDF فقط",
  certificatesLabel: "الشهادات (PDF)",
  certificatesHint: "مطلوب — ملف PDF فقط",
  submitBtn: "إنشاء الملف والحساب",
  submitting: "جاري التسجيل...",
  hasAccount: "لديك حساب؟",
  loginLink: "تسجيل الدخول",
} as const;

export const forgotPasswordCopy = {
  title: "استعادة كلمة المرور",
  subtitle: "أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين",
  emailLabel: "البريد الإلكتروني",
  submitBtn: "إرسال رابط إعادة التعيين",
  backToLogin: "العودة لتسجيل الدخول",
  successMessage:
    "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك. الرابط صالح لمدة 10 دقائق.",
  notFoundMessage: "البريد غير مسجّل في النظام",
} as const;

export const resetPasswordCopy = {
  title: "تعيين كلمة مرور جديدة",
  subtitle: "أدخل كلمة المرور الجديدة لحسابك",
  passwordLabel: "كلمة المرور الجديدة",
  confirmLabel: "تأكيد كلمة المرور",
  submitBtn: "حفظ كلمة المرور",
  backToLogin: "العودة لتسجيل الدخول",
  invalidToken: "رابط إعادة التعيين غير صالح أو منتهٍ",
  successMessage: "تم تعيين كلمة المرور. يمكنك تسجيل الدخول الآن.",
} as const;

export const adminCopy = {
  pipelineTab: "لوحة التتبع",
  pipelineTabShort: "التتبع",
  opportunitiesTab: "إدارة الفرص",
  opportunitiesTabShort: "الفرص",
  guidesTab: "إدارة المرشدين",
  guidesTabShort: "المرشدون",
  managementTab: "إدارة المستفيدين",
  managementTabShort: "المستفيدون",
  followUpTab: "متابعة ما بعد التوظيف",
  followUpTabShort: "المتابعة",
  settingsTab: "إعدادات النظام",
  settingsTabShort: "الإعدادات",
  applicationsTab: "مراجعة التقديمات",
  applicationsTabShort: "التقديمات",
  impactTab: "قياس الأثر",
  impactTabShort: "الأثر",
} as const;

export const guideCopy = {
  scheduleSession: "جدولة جلسة إرشاد",
  sessionsCardTitle: "إدارة الجلسات",
  tasksCardTitle: "المهام — خطة المسار المهني",
  profileTab: "بيانات المستفيد",
  sessionsTab: "إدارة الجلسات",
  tasksTab: "المهام",
  evaluationsTab: "التقييم والتوصيات",
  editSession: "تعديل الجلسة",
  deleteSession: "حذف الجلسة",
  markAttended: "تحضير",
  commitmentRating: "تقييم الالتزام (1–5)",
  commitmentRatingPrompt: "أدخل تقييم الالتزام (1–5) بعد حضور الجلسة",
  careerPlanTasks: "مهام خطة المسار المهني",
  addTask: "إضافة مهمة",
  editTask: "تعديل المهمة",
  deleteTask: "حذف المهمة",
  taskTitleLabel: "عنوان المهمة",
  taskDescriptionLabel: "وصف المهمة (اختياري)",
  recommendStage: "توصية بالانتقال للمرحلة التالية",
  recommendTraining: "توصية للانتقال للتدريب",
  cvSection: "بناء وتعديل السيرة الذاتية",
  recommendationsSection: "التوصيات المهنية",
  trainingCoursesSection: "اختيار الدورات التدريبية المناسبة",
  saveProfileSections: "حفظ أقسام الملف",
  editProfile: "تعديل البيانات",
  scheduleNew: "جدولة جلسة جديدة",
  sessionDateLabel: "تاريخ ووقت الجلسة",
  sessionNotesLabel: "ملاحظات الجلسة",
  meetingLinkLabel: "رابط الاجتماع (للجلسات عن بُعد)",
  locationLabel: "موقع الجلسة (للحضور الفعلي)",
  commitmentScore: "مؤشر الالتزام",
  currentTasks: "المهام الحالية",
  completedTasks: "المهام المنجزة",
  sessionNotesBtn: "الملاحظات",
  sessionNotesTitle: "ملاحظات الجلسة",
  addNewTask: "إضافة مهمة جديدة",
  scheduleSessionDrawer: "جدولة جلسة جديدة",
} as const;

export const beneficiaryCopy = {
  commitmentScore: "مؤشر الالتزام",
  nextSession: "الجلسة القادمة",
  upcomingSessionAlert: "لديك جلسة إرشاد قادمة",
  joinRemoteSession: "الانضمام للجلسة",
  sessionLocation: "موقع الجلسة",
  careerChecklist: "قائمة مهام المسار المهني",
  noNextSession: "لا توجد جلسة مجدولة قادمة",
  noTasks: "لا توجد مهام مخصصة حالياً",
  recommendedCourses: "الدورات التدريبية الموصى بها من المرشد",
  professionalRecommendations: "التوصيات المهنية من المرشد",
  professionalRecommendationsHint:
    "توجيه مهني عام من مرشدك (مختلف عن مهام المسار القابلة للتنفيذ).",
  noRecommendedCourses: "لم يُحدّد مرشدك دورات تدريبية بعد",
  viewCv: "عرض السيرة الذاتية المرفقة",
  noCvBadge: "لا يوجد سيرة ذاتية - يرجى طلبها من المستفيد",
  editProfile: "تعديل البيانات",
  editProfileTitle: "تعديل الملف الرقمي",
  saveProfile: "حفظ التعديلات",
} as const;

export type BeneficiaryTask = {
  id: string;
  title: string;
  description: string | null;
  isCompleted: boolean;
};

export type CareerPlanTask = {
  id: string;
  title: string;
  done: boolean;
};
