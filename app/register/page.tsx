"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import FieldRow from "@/components/ui/FieldRow";
import SubmitButton from "@/components/ui/SubmitButton";
import { toastError, toastSuccess } from "@/lib/toast";
import { useFormFieldErrors } from "@/hooks/useFormFieldErrors";
import { uploadPdfFile } from "@/lib/upload-client";
import { registerCopy } from "@/lib/copy/ar";
import { getAllowedEmailDomains } from "@/lib/allowed-email-domains";
import { UserPlus } from "lucide-react";

type Step = "form" | "otp";

export default function RegisterPage() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [certFile, setCertFile] = useState<File | null>(null);
  const [step, setStep] = useState<Step>("form");
  const [challengeId, setChallengeId] = useState("");
  const [otpEmail, setOtpEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [previewCode, setPreviewCode] = useState<string | null>(null);
  const { validate, fieldError } = useFormFieldErrors();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate(e.currentTarget)) return;
    const form = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        if (!cvFile || !certFile) {
          toastError("رفع السيرة الذاتية والشهادات مطلوب");
          return;
        }

        const cvUrl = await uploadPdfFile(cvFile, "cv", "register");
        const certUrl = await uploadPdfFile(certFile, "certificate", "register");
        const certificatesUrls = JSON.stringify([certUrl]);
        const email = String(form.get("email") ?? "");

        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: String(form.get("name") ?? ""),
            phone: String(form.get("phone") ?? ""),
            email,
            password: String(form.get("password") ?? ""),
            educationLevel: String(form.get("educationLevel") ?? ""),
            experience: String(form.get("experience") ?? ""),
            skills: String(form.get("skills") ?? ""),
            careerInterests: String(form.get("careerInterests") ?? ""),
            cvUrl,
            certificatesUrls,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          toastError(data.error || "فشل بدء التسجيل");
          return;
        }

        setChallengeId(String(data.challengeId ?? ""));
        setOtpEmail(email.trim().toLowerCase());
        setPreviewCode(data.previewCode ? String(data.previewCode) : null);
        setOtpCode("");
        setStep("otp");
        toastSuccess("تم إرسال رمز التحقق إلى بريدك");
      } catch {
        toastError("حدث خطأ في الاتصال. حاول مرة أخرى.");
      }
    });
  }

  function handleVerify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!/^\d{6}$/.test(otpCode.trim())) {
      toastError("أدخل رمز التحقق المكوّن من 6 أرقام");
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/auth/register/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ challengeId, code: otpCode.trim() }),
        });
        const data = await res.json();
        if (!res.ok) {
          toastError(data.error || "فشل التحقق");
          return;
        }
        toastSuccess("تم التحقق وإنشاء الحساب");
        router.push("/login?registered=1");
      } catch {
        toastError("حدث خطأ في الاتصال. حاول مرة أخرى.");
      }
    });
  }

  const allowedDomains = getAllowedEmailDomains().slice(0, 8).join("، ");

  return (
    <div className="min-h-screen bg-surface-muted">
      <Navbar showAuth={false} />
      <main className="mx-auto max-w-2xl px-4 py-12">
        <div className="card-auth">
          <div className="mb-6 flex items-center gap-3">
            <UserPlus className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-primary">{registerCopy.title}</h1>
              <p className="text-sm text-brand-gray">
                {step === "form"
                  ? registerCopy.subtitle
                  : "أدخل رمز التحقق المرسل إلى بريدك لإتمام التسجيل"}
              </p>
            </div>
          </div>

          {step === "form" ? (
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FieldRow
                  label="الاسم الكامل"
                  htmlFor="name"
                  className="sm:col-span-2"
                  variant="auth"
                  error={fieldError("name")}
                >
                  <input id="name" name="name" required className="input-field-auth" />
                </FieldRow>
                <FieldRow
                  label="رقم الجوال"
                  htmlFor="phone"
                  ltr
                  variant="auth"
                  className="sm:col-span-2"
                  error={fieldError("phone")}
                >
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    required
                    className="input-field-auth"
                    placeholder="05xxxxxxxx"
                    dir="ltr"
                  />
                </FieldRow>
                <FieldRow
                  label="البريد الإلكتروني"
                  htmlFor="email"
                  ltr
                  variant="auth"
                  className="sm:col-span-2"
                  error={fieldError("email")}
                >
                  <div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      className="input-field-auth"
                      placeholder="name@gmail.com"
                      dir="ltr"
                    />
                    <p className="mt-1 text-xs text-brand-gray">
                      النطاقات المقبولة فقط مثل: {allowedDomains}…
                    </p>
                  </div>
                </FieldRow>
                <FieldRow
                  label="كلمة المرور"
                  htmlFor="password"
                  className="sm:col-span-2"
                  ltr
                  variant="auth"
                  error={fieldError("password")}
                >
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={6}
                    className="input-field-auth"
                    placeholder="••••••••"
                    dir="ltr"
                  />
                </FieldRow>
              </div>

              <hr className="border-surface-border" />
              <p className="text-sm font-semibold text-primary">الملف الرقمي</p>

              <FieldRow
                label="المستوى التعليمي"
                htmlFor="educationLevel"
                variant="auth"
                error={fieldError("educationLevel")}
              >
                <input
                  id="educationLevel"
                  name="educationLevel"
                  required
                  className="input-field-auth"
                />
              </FieldRow>
              <FieldRow
                label="الخبرات"
                htmlFor="experience"
                align="start"
                variant="auth"
                error={fieldError("experience")}
              >
                <textarea
                  id="experience"
                  name="experience"
                  rows={2}
                  required
                  className="input-field-auth resize-none"
                />
              </FieldRow>
              <FieldRow
                label="المهارات"
                htmlFor="skills"
                align="start"
                variant="auth"
                error={fieldError("skills")}
              >
                <textarea
                  id="skills"
                  name="skills"
                  rows={2}
                  required
                  className="input-field-auth resize-none"
                />
              </FieldRow>
              <FieldRow
                label="الميول المهنية"
                htmlFor="careerInterests"
                align="start"
                variant="auth"
                error={fieldError("careerInterests")}
              >
                <textarea
                  id="careerInterests"
                  name="careerInterests"
                  rows={2}
                  required
                  className="input-field-auth resize-none"
                />
              </FieldRow>

              <FieldRow
                label={registerCopy.cvLabel}
                htmlFor="cv"
                variant="auth"
                error={fieldError("cv")}
              >
                <input
                  id="cv"
                  name="cv"
                  type="file"
                  accept=".pdf,application/pdf"
                  required
                  className="input-field-auth"
                  onChange={(e) => setCvFile(e.target.files?.[0] ?? null)}
                />
                <p className="mt-1 text-xs text-brand-gray">{registerCopy.cvHint}</p>
              </FieldRow>
              <FieldRow
                label={registerCopy.certificatesLabel}
                htmlFor="certificates"
                variant="auth"
                error={fieldError("certificates")}
              >
                <input
                  id="certificates"
                  name="certificates"
                  type="file"
                  accept=".pdf,application/pdf"
                  required
                  className="input-field-auth"
                  onChange={(e) => setCertFile(e.target.files?.[0] ?? null)}
                />
                <p className="mt-1 text-xs text-brand-gray">{registerCopy.certificatesHint}</p>
              </FieldRow>

              <SubmitButton loading={pending} className="btn-primary w-full">
                إرسال رمز التحقق
              </SubmitButton>
            </form>
          ) : (
            <form onSubmit={handleVerify} noValidate className="space-y-4">
              <p className="rounded-lg bg-surface-muted px-3 py-2 text-sm text-brand-gray">
                أُرسل رمز من 6 أرقام إلى{" "}
                <span className="font-semibold text-primary" dir="ltr">
                  {otpEmail}
                </span>
              </p>
              {previewCode && (
                <p className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                  بيئة التطوير / بدون SMTP — الرمز:{" "}
                  <span className="font-mono font-bold" dir="ltr">
                    {previewCode}
                  </span>
                </p>
              )}
              <FieldRow label="رمز التحقق" htmlFor="otp" ltr variant="auth">
                <input
                  id="otp"
                  name="otp"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="input-field-auth tracking-[0.3em]"
                  placeholder="000000"
                  dir="ltr"
                  required
                />
              </FieldRow>
              <SubmitButton loading={pending} className="btn-primary w-full">
                تأكيد الرمز وإنشاء الحساب
              </SubmitButton>
              <button
                type="button"
                className="btn-secondary w-full"
                disabled={pending}
                onClick={() => {
                  setStep("form");
                  setChallengeId("");
                  setPreviewCode(null);
                  setOtpCode("");
                }}
              >
                العودة لتعديل البيانات
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-brand-gray">
            {registerCopy.hasAccount}{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              {registerCopy.loginLink}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
