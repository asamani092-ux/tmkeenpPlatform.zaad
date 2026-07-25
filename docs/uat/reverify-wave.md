# موجة إعادة تحقق UAT — آخر الملاحظات

**بيئة التجربة فقط:** `http://localhost:3000/uat-checklist`  
**النشر العام:** `404` (ما لم `ENABLE_UAT_CHECKLIST=true` — لا تضعه على Coolify).  
**التخزين:** `tmkeen-uat-checklist-v1` — إضافة تراكمية، لا مسح.  
**البادئة:** `reverify-*` — لا تُعاد تسمية المعرّفات.

## البنود (14)

| id | الملاحظة / التحقق |
|----|-------------------|
| `reverify-session-timezone` | وقت موحّد Asia/Riyadh (#8) |
| `reverify-session-join` | عدّاد + انضمام 15د + رابط الاجتماع (#9) |
| `reverify-forgot-password` | بريد غير مسجّل + 10د + رفض نفس المرور |
| `reverify-followup-remind-ui` | تذكير ظاهر + opens/due/lastReminder |
| `reverify-followup-remind-null-status` | لا «معطّل» عند status=null → ACTIVE |
| `reverify-followup-force-end` | إنهاء مبكر بسبب إجباري |
| `reverify-apps-accept-reject` | رفض بارز + التفاصيل قريباً |
| `reverify-email-bodies` | نصوص البريد |
| `reverify-contact-icons` | واتساب/بريد/هاتف (#3–4–6) |
| `reverify-recommendations-hint` | نص التوصيات ≠ المهام |
| `reverify-name-edit` | تعديل الاسم |
| `reverify-admin-mobile-tabs` | تبويبات الجوال |
| `reverify-followup-beneficiary-schedule` | يفتح/يستحق للمستفيد |
| `reverify-uat-form-local-only` | النموذج محلي فقط |
