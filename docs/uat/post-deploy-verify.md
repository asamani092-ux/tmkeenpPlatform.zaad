# Post-deploy verify (مؤجّل من UAT)

هذان البندان خارج نطاق إصلاحات الكود الحالية؛ يُعاد التحقق منهما بعد النشر فقط.

## forgot-password

- المسار: `/forgot-password` (من صفحة الدخول فقط — غير موجود في Navbar)
- تحقق: POST `/api/auth/forgot-password` يصل بريد الاستعادة عند ضبط SMTP
- حساب تجربة: أي بريد seed صالح مع صندوق بريد قابل للمراقبة

## admin-settings

- المسار: `/dashboard/admin` → تبويب الإعدادات
- تحقق: GET/PUT `/api/system-settings`؛ إرسال تجريبي للنماذج / SMTP بعد ضبط `senderEmail` والأسرار في بيئة النشر
