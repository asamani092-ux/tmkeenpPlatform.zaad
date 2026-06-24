"use client";

import { useEffect, useState, useTransition } from "react";
import SubmitButton from "@/components/ui/SubmitButton";
import FollowUpFormBuilder from "@/components/admin/FollowUpFormBuilder";
import { toastSuccess, toastError } from "@/lib/toast";
import { Settings, Mail } from "lucide-react";

export default function AdminSystemSettings() {
  const [senderEmail, setSenderEmail] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [smtpConfigured, setSmtpConfigured] = useState(false);
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    fetch("/api/system-settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.senderEmail) setSenderEmail(data.senderEmail);
        setSmtpConfigured(Boolean(data.smtpConfigured));
      })
      .catch(() => toastError("فشل تحميل الإعدادات"))
      .finally(() => setLoading(false));
  }, []);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    startTransition(async () => {
      try {
        const res = await fetch("/api/system-settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ senderEmail }),
        });
        const data = await res.json();
        if (!res.ok) {
          toastError(data.error || "فشل حفظ الإعدادات");
          return;
        }
        toastSuccess("تم حفظ إعدادات النظام بنجاح");
      } catch {
        toastError("حدث خطأ في الاتصال");
      }
    });
  }

  function handleTestEmail() {
    startTransition(async () => {
      const res = await fetch("/api/system-settings/test-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: testEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        toastError(data.error || "فشل الإرسال");
        return;
      }
      toastSuccess("تم إرسال رسالة التجربة");
    });
  }

  return (
    <div className="space-y-6">
      <div className="card max-w-lg space-y-4">
        <div className="flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-bold text-primary">إعدادات النظام</h2>
        </div>

        <p className="text-sm text-brand-gray">
          إعدادات عامة للمنصة — يُستخدم البريد أدناه كمرسل للإشعارات البريدية.
        </p>

        <div
          className={`rounded-lg px-4 py-3 text-sm ${
            smtpConfigured ? "bg-secondary/10 text-primary" : "bg-amber-50 text-amber-900"
          }`}
        >
          البريد: {smtpConfigured ? "مفعّل" : "غير مفعّل"}
        </div>

        {loading ? (
          <p className="text-sm text-brand-gray">جاري التحميل...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="senderEmail" className="label-field">
                البريد الإلكتروني للمرسل
              </label>
              <input
                id="senderEmail"
                type="email"
                required
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                className="input-field"
                dir="ltr"
                placeholder="noreply@example.com"
              />
            </div>
            <SubmitButton loading={pending} className="btn-primary w-full">
              حفظ الإعدادات
            </SubmitButton>
          </form>
        )}

        <div className="border-t border-surface-border pt-4">
          <h3 className="mb-2 flex items-center gap-2 font-bold text-primary">
            <Mail className="h-5 w-5" />
            اختبار إرسال البريد
          </h3>
          <div className="flex flex-wrap gap-2">
            <input
              type="email"
              className="input-field min-w-[200px] flex-1"
              dir="ltr"
              placeholder="email@example.com"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
            />
            <SubmitButton
              type="button"
              loading={pending}
              onClick={handleTestEmail}
              className="btn-secondary !px-4 !py-2 text-sm"
            >
              إرسال تجربة
            </SubmitButton>
          </div>
        </div>
      </div>

      <FollowUpFormBuilder />
    </div>
  );
}
