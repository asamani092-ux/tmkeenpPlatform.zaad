# Post-deploy verify (بعد نشر master + تفعيل SMTP)

بعد دمج UAT على `master` ونشر Coolify، أكمل بالترتيب.

## 0) النشر حيّ على آخر كود

- المستودع: `https://github.com/asamani092-ux/tmkeenpPlatform.zaad` — فرع `master`
- الموقع: `https://tmkeen.alzaad.org.sa`
- علامة النسخة: `/login` يحتوي زر **عرض/إخفاء كلمة المرور**
- إن غابت العلامة: Coolify → Redeploy من `master` (تحقق من Branch + Auto Deploy)

## 1) تفعيل SMTP في Coolify

عيّن Runtime env ثم أعد النشر:

```bash
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=YOUR_MAILBOX@yourdomain.com
SMTP_PASS=YOUR_MAILBOX_PASSWORD
NEXT_PUBLIC_APP_URL=https://tmkeen.alzaad.org.sa
```

في لوحة المدير → **إعدادات النظام**:

1. `senderEmail` = نفس بريد الصندوق (أو بريد مسموح من مزوّد SMTP)
2. حفظ
3. **إرسال تجريبي** إلى بريدك → يجب أن تصل الرسالة

بدون `SMTP_*` يبقى النظام يعمل؛ التسجيل يعرض `previewCode` محلياً فقط ولا يُرسل بريداً حقيقياً.

## forgot-password

- المسار: `/forgot-password` (من صفحة الدخول فقط — غير موجود في Navbar)
- تحقق: POST `/api/auth/forgot-password` يصل بريد الاستعادة عند ضبط SMTP
- حساب تجربة: أي بريد seed صالح مع صندوق بريد قابل للمراقبة

## register email OTP

- المسار: `/register` → بعد تعبئة النموذج يُرسل رمز 6 أرقام إلى البريد
- تحقق: POST `/api/auth/register` ثم POST `/api/auth/register/verify` مع الرمز
- يتطلب: `SMTP_*` + `senderEmail` من الإعدادات

## admin-applications (بريد القبول)

- عند قبول تقديم: إشعار واجهة + بريد يوضح أنه سيتم إشعاره بالتفاصيل قريباً
- أعد التجربة بعد تفعيل SMTP

## admin-followup

- تذكيرات المتابعة عبر البريد بعد تفعيل SMTP و`CRON_SECRET`
- Cron يومي: `GET /api/cron/follow-up-reminders` مع `Authorization: Bearer $CRON_SECRET`

## admin-settings

- المسار: `/dashboard/admin` → تبويب الإعدادات
- تحقق: GET/PUT `/api/system-settings` + إرسال تجريبي `/api/system-settings/test-email`
- تأكد من ظهور نماذج المتابعة في واجهة المستفيد بعد الحفظ
