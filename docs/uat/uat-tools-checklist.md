# قائمة تقييم أدوات — منصة تمكين

**الفرع الحالي:** `cursor/fix-admin-rtl-769a`  
**التجربة المحلية:** http://localhost:3000  
**كلمة المرور (seed):** `Zaad@2024` — راجع `prisma/seed.ts`

## إحصائيات

| الإجمالي | يعتمد | يحتاج تحسين | غير مجرّب |
|---------|-------|-------------|-----------|
| 33 | 0 | 0 | 33 |

---

## المصادقة والوصول (عام)

| الأداة | المسار | ما يُتحقق منه | التقييم | ملاحظة |
|--------|--------|----------------|---------|--------|
| الصفحة الرئيسية | `/` | CTAs للضيف/المسجّل؛ أقسام المميزات والشركاء؛ شعار وخروج | غير مجرّب | |
| تسجيل الدخول | `/login` | POST ناجح → لوحة الدور؛ رسالة خطأ؛ رابط نسيت كلمة المرور | غير مجرّب | |
| تسجيل مستفيد | `/register` | رفع PDF اختياري؛ POST `/api/auth/register`؛ تحويل لـ `/login?registered=1` | غير مجرّب | |
| استعادة كلمة المرور | `/forgot-password` | POST `/api/auth/forgot-password`؛ **غير موجود في Navbar** — من صفحة الدخول فقط | غير مجرّب | Post-deploy: انظر `post-deploy-verify.md` |
| خروج | POST `/api/auth/logout` | إنهاء الجلسة؛ منع `/dashboard/*` | غير مجرّب | |
| توجيه اللوحة | `/dashboard` | ADMIN/GUIDE/BENEFICIARY → المسار الصحيح؛ middleware يمنع تبادل الأدوار | غير مجرّب | |

## مشترك (كل الأدوار)

| الأداة | المسار | ما يُتحقق منه | التقييم | ملاحظة |
|--------|--------|----------------|---------|--------|
| الإشعارات | Navbar | GET/PATCH `/api/notifications`؛ شارة غير مقروء؛ تعليم الكل | غير مجرّب | |

## لوحة المستفيد

| الأداة | المسار | ما يُتحقق منه | التقييم | ملاحظة |
|--------|--------|----------------|---------|--------|
| الملف الرقمي | `/dashboard/beneficiary` | عنوان + مرحلة؛ Navbar | غير مجرّب | `beneficiary2@` GUIDANCE |
| بانتظار الاعتماد | نفس الصفحة | بانر PENDING_APPROVAL فقط | غير مجرّب | `beneficiary1@` |
| الجلسة القادمة | `#now` | NextSessionCard؛ رابط meet أو موقع | غير مجرّب | |
| مسار التمكين | نفس الصفحة | StageProgress؛ نسبة وتاريخ | غير مجرّب | |
| من مرشدك | نفس الصفحة | توصيات/دورات/ملاحظات المرشد | غير مجرّب | |
| مهام المسار | نفس الصفحة | PATCH `/api/tasks/[id]` إتمام | غير مجرّب | |
| مؤشر الالتزام | نفس الصفحة | قراءة فقط؛ يتحدث بعد تحضير جلسة | غير مجرّب | |
| فرص تدريب | `#opportunities-section` | POST `/api/applications` | غير مجرّب | |
| فرص توظيف | `#opportunities-section` | مرحلة EMPLOYMENT أو استهداف | غير مجرّب | |
| سجل التقديمات | `#opportunities-section` | حالات PENDING/ACCEPTED/REJECTED | غير مجرّب | |
| بيانات الملف | `#opportunities-section` | CV/شهادات/حقول read-only | غير مجرّب | |
| تعديل البيانات | modal | PATCH `/api/profile` + رفع PDF | غير مجرّب | |

## لوحة المرشد

| الأداة | المسار | ما يُتحقق منه | التقييم | ملاحظة |
|--------|--------|----------------|---------|--------|
| لوحة المرشد | `/dashboard/guide` | KPIs؛ جدول GUIDANCE فقط | غير مجرّب | `guide@alzaad.org` |
| بيانات المستفيد | modal › profile | ملاحظات؛ POST `/api/notes`؛ توصية انتقال | غير مجرّب | |
| الجلسات | modal › sessions | POST/PATCH/DELETE `/api/sessions`؛ تحضير + تقييم | غير مجرّب | |
| المهام | modal › tasks | POST/PATCH/DELETE `/api/tasks` | غير مجرّب | |
| التقييم والتوصيات | modal › evaluations | PATCH `/api/beneficiaries/[id]/guide-profile` | غير مجرّب | |

## لوحة المدير

| الأداة | المسار | ما يُتحقق منه | التقييم | ملاحظة |
|--------|--------|----------------|---------|--------|
| لوحة المدير | `/dashboard/admin` | بطاقات ملخص + تصدير | غير مجرّب | `admin@alzaad.org` |
| تصدير Excel | رأس الصفحة | AdminBulkExport — ملف واحد، ورقة لكل قسم | غير مجرّب | إصلاح UAT: أوراق متعددة |
| لوحة التتبع | tab pipeline | اعتماد تسجيل/انتقال؛ POST `/api/stage-approve` | غير مجرّب | مؤشر تحميل أثناء الاعتماد |
| إدارة الفرص | tab opportunities | CRUD + `showToAll` للجميع | غير مجرّب | أُلغي الاستهداف الفردي من الواجهة |
| إدارة المرشدين | tab guides | POST/PATCH/DELETE `/api/guides` | غير مجرّب | |
| إدارة المستفيدين | tab management | إسناد مرشد؛ تعديل؛ اعتماد | غير مجرّب | |
| مراجعة التقديمات | tab applications | قبول/رفض PATCH `/api/applications/[id]` | غير مجرّب | |
| متابعة ما بعد التوظيف | tab followup | أشهر 1–6؛ تذكير يدوي؛ فجوات الأشهر | غير مجرّب | POST `/api/follow-ups/remind` |
| قياس الأثر | tab impact | read-only آخر 6 أشهر | غير مجرّب | |
| إعدادات النظام | tab settings | GET/PUT `/api/system-settings` | غير مجرّب | Post-deploy: انظر `post-deploy-verify.md` |

---

## خارج نطاق التجربة (ROADMAP / غير مربوط بالتنقل)

| البند | السبب |
|-------|--------|
| `AdminBeneficiaryAssign.tsx` | مكوّن غير مستورد — الإسناد من «إدارة المستفيدين» |
| `ExportExcelButton` / `ExportButtons` | غير مستورد — التصدير عبر `AdminBulkExport` |
| `BeneficiaryOpportunitiesProfile.tsx` | غير مستورد |
| `GuideProfileSections.tsx` | غير مستورد — التقييم عبر `GuideEvaluationsTab` |
| `/api/career-plan` و `/api/career-plans` | API بدون شاشة UI |
| `/reset-password` | **غير موجود** — المسار الفعلي `/forgot-password` |
| تبويبات Admin/Guide | **بدون deep link URL** — التنقل داخل الصفحة فقط |
| SMTP فعلي / Hostinger | يحتاج `SMTP_*` في `.env` — لا يُحجب التجربة |

## حسابات seed للتجربة

| الدور | البريد | المرحلة |
|-------|--------|---------|
| مدير | admin@alzaad.org | — |
| مرشد | guide@alzaad.org | — |
| مستفيد | beneficiary1@alzaad.org | PENDING_APPROVAL |
| مستفيد | beneficiary2@alzaad.org | GUIDANCE (+ طلب TRAINING) |
| مستفيد | beneficiary3@alzaad.org | TRAINING |
| مستفيد | beneficiary4@alzaad.org | FOLLOW_UP |
