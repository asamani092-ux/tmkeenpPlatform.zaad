# Post-deploy verify (مؤجّل من UAT)

هذان البندان خارج نطاق إصلاحات الكود الحالية؛ يُعاد التحقق منهما بعد النشر فقط.

## forgot-password

- المسار: `/forgot-password` (من صفحة الدخول فقط — غير موجود في Navbar)
- تحقق: POST `/api/auth/forgot-password` يصل بريد الاستعادة عند ضبط SMTP
- حساب تجربة: أي بريد seed صالح مع صندوق بريد قابل للمراقبة

## register email OTP

- المسار: `/register` → بعد تعبئة النموذج يُرسل رمز 6 أرقام إلى البريد (صيغة بريد عامة + تحقق OTP)
- تحقق: POST `/api/auth/register` ثم POST `/api/auth/register/verify` مع الرمز
- **مؤجّل حتى الربط بالخادم:** إعداد `SMTP_*` + بريد المرسل من الإعدادات لإرسال حقيقي
- محلياً الآن: بدون SMTP يظهر `previewCode` في الواجهة لإكمال التجربة

## admin-settings

- المسار: `/dashboard/admin` → تبويب الإعدادات
- تحقق: GET/PUT `/api/system-settings`؛ إرسال تجريبي للنماذج / SMTP بعد ضبط `senderEmail` والأسرار في بيئة النشر
