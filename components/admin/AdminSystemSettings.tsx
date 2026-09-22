"use client";

import { useEffect, useState, useTransition } from "react";
import FieldRow from "@/components/ui/FieldRow";
import SubmitButton from "@/components/ui/SubmitButton";
import FollowUpFormTemplatesPanel from "@/components/admin/FollowUpFormTemplatesPanel";
import { toastSuccess, toastError } from "@/lib/toast";
import { Settings, Mail, HardDrive, Server } from "lucide-react";

export default function AdminSystemSettings() {
  const [senderEmail, setSenderEmail] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [smtpConfigured, setSmtpConfigured] = useState(false);
  const [smtpUser, setSmtpUser] = useState<string | null>(null);
  const [smtpHost, setSmtpHost] = useState<string | null>(null);
  const [smtpPort, setSmtpPort] = useState<number | null>(null);
  const [storage, setStorage] = useState<{
    dir: string;
    exists: boolean;
    writable: boolean;
    cvCount: number;
    certificatesCount: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    fetch("/api/system-settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.senderEmail) setSenderEmail(data.senderEmail);
        setSmtpConfigured(Boolean(data.smtpConfigured));
        setSmtpUser(typeof data.smtpUser === "string" ? data.smtpUser : null);
        setSmtpHost(typeof data.smtpHost === "string" ? data.smtpHost : null);
        setSmtpPort(
          typeof data.smtpPort === "number" && !Number.isNaN(data.smtpPort)
            ? data.smtpPort
            : null
        );
        if (data.storage && typeof data.storage === "object") {
          setStorage(data.storage);
        }
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
      <div className="card max-w-lg space-y-6">
        <div className="flex items-center gap-2">
          <Settings className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-bold text-primary">إعدادات النظام</h2>
        </div>

        <section className="space-y-3" aria-labelledby="settings-sender">
          <h3 id="settings-sender" className="font-bold text-primary">
            المرسل
          </h3>
          <p className="text-xs text-brand-gray">عنوان From للرسائل الصادرة.</p>
          {loading ? (
            <p className="text-sm text-brand-gray">جاري التحميل...</p>
          ) : (
            <form noValidate onSubmit={handleSubmit} className="space-y-3">
              <FieldRow label="البريد الإلكتروني للمرسل" htmlFor="senderEmail" ltr>
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
              </FieldRow>
              <SubmitButton loading={pending} className="btn-primary w-full">
                حفظ
              </SubmitButton>
            </form>
          )}
        </section>

        <section className="space-y-2 border-t border-surface-border pt-4" aria-labelledby="settings-smtp">
          <h3 id="settings-smtp" className="flex items-center gap-2 font-bold text-primary">
            <Server className="h-5 w-5" />
            حالة SMTP
          </h3>
          <div
            className={`rounded-lg px-4 py-3 text-sm ${
              smtpConfigured ? "bg-secondary/10 text-primary" : "bg-amber-50 text-amber-900"
            }`}
          >
            <p>{smtpConfigured ? "مفعّل" : "غير مفعّل"}</p>
            {smtpConfigured && smtpHost ? (
              <p className="mt-1 text-xs opacity-90" dir="ltr">
                {smtpHost}
                {smtpPort ? `:${smtpPort}` : ""}
                {smtpUser ? ` · ${smtpUser}` : ""}
              </p>
            ) : null}
          </div>
        </section>

        {storage ? (
          <section className="space-y-2 border-t border-surface-border pt-4" aria-labelledby="settings-storage">
            <h3 id="settings-storage" className="flex items-center gap-2 font-bold text-primary">
              <HardDrive className="h-5 w-5" />
              مخزن المرفقات
            </h3>
            <div
              className={`rounded-lg px-4 py-3 text-sm ${
                storage.exists && storage.writable
                  ? "bg-secondary/10 text-primary"
                  : "bg-amber-50 text-amber-900"
              }`}
            >
              <p>
                {storage.exists && storage.writable
                  ? "جاهز"
                  : storage.exists
                    ? "موجود لكن غير قابل للكتابة"
                    : "المجلد غير موجود"}
              </p>
              <p className="mt-1 text-xs opacity-90" dir="ltr">
                {storage.dir} · CV: {storage.cvCount} · شهادات: {storage.certificatesCount}
              </p>
            </div>
          </section>
        ) : null}

        <section className="space-y-3 border-t border-surface-border pt-4" aria-labelledby="settings-test">
          <h3 id="settings-test" className="flex items-center gap-2 font-bold text-primary">
            <Mail className="h-5 w-5" />
            اختبار إرسال
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
        </section>
      </div>

      <FollowUpFormTemplatesPanel />
    </div>
  );
}
