# موجة إعادة تحقق UAT بعد الإصلاحات

**المسار:** `/uat-checklist` (العرض الافتراضي: «إعادة التحقق»)  
**التخزين:** `localStorage` مفتاح `tmkeen-uat-checklist-v1` — **إضافة تراكمية** (لا مسح).  
**البادئة المستقرة:** `reverify-*` — لا تُعاد تسمية المعرّفات بعد التقييم.

## البنود (12)

| id | ما يُعاد التحقق منه |
|----|---------------------|
| `reverify-session-timezone` | وقت الجلسة موحّد Asia/Riyadh |
| `reverify-session-join` | عدّاد ساعات/دقائق + انضمام 15د + «رابط الاجتماع» |
| `reverify-forgot-password` | بريد غير مسجّل + TTL 10د + رفض نفس المرور |
| `reverify-followup-remind-ui` | تذكير ظاهر + جدول opens/due/lastReminder |
| `reverify-followup-force-end` | إنهاء مبكر بسبب إجباري + بريد |
| `reverify-apps-accept-reject` | رفض بارز + جملة التفاصيل قريباً |
| `reverify-email-bodies` | نصوص البريد العربي |
| `reverify-contact-icons` | واتساب/بريد/هاتف |
| `reverify-recommendations-hint` | نص توضيحي للتوصيات |
| `reverify-name-edit` | تعديل الاسم |
| `reverify-admin-mobile-tabs` | تبويبات المدير على الجوال |
| `reverify-followup-beneficiary-schedule` | بطاقة يفتح/يستحق للمستفيد |

## التصدير

انسخ «تقرير إعادة تحقق UAT» من أعلى الصفحة والصقه في شات الوكيل.
