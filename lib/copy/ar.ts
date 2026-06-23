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
    "منصة التمكين من جمعية الزاد منصة رقمية تهدف إلى تحقيق الاستقلالية الاقتصادية والمهنية للأسر المستفيدة، من خلال مسار تمكيني شامل يبدأ بالتأهيل والتدريب المخصص، مروراً بالإرشاد المهني الفردي وربط الخريجين بالفرص الوظيفية الملائمة، وبمتابعة مستمرة لضمان تحقيق أثر مستدام",
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
  cvHint: "رفع تجريبي — يُحفظ رابط وهمي",
  certificatesLabel: "الشهادات (PDF)",
  certificatesHint: "رفع تجريبي — يُحفظ رابط وهمي",
  submitBtn: "إنشاء الملف والحساب",
  submitting: "جاري التسجيل...",
  hasAccount: "لديك حساب؟",
  loginLink: "تسجيل الدخول",
} as const;

export const forgotPasswordCopy = {
  title: "استعادة كلمة المرور",
  subtitle: "أدخل رقم الجوال المسجّل لإعادة تعيين كلمة المرور",
  phoneLabel: "رقم الجوال",
  passwordLabel: "كلمة المرور الجديدة",
  submitBtn: "تعيين كلمة المرور",
  backToLogin: "العودة لتسجيل الدخول",
} as const;

export const adminCopy = {
  pipelineTab: "لوحة التتبع",
  opportunitiesTab: "إدارة الفرص",
  guidesTab: "إدارة المرشدين",
  managementTab: "إدارة المستفيدين",
  followUpTab: "متابعة ما بعد التوظيف",
  settingsTab: "إعدادات النظام",
  applicationsTab: "مراجعة التقديمات",
  impactTab: "قياس الأثر",
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
