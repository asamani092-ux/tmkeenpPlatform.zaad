"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import FieldRow from "@/components/ui/FieldRow";
import SubmitButton from "@/components/ui/SubmitButton";
import { toastError, toastSuccess } from "@/lib/toast";
import { resetPasswordCopy } from "@/lib/copy/ar";
import { useFormFieldErrors } from "@/hooks/useFormFieldErrors";
import { KeyRound } from "lucide-react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [loading, setLoading] = useState(false);
  const { validate, fieldError } = useFormFieldErrors();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) {
      toastError(resetPasswordCopy.invalidToken);
      return;
    }
    if (!validate(e.currentTarget)) return;

    setLoading(true);
    const form = new FormData(e.currentTarget);
    const newPassword = String(form.get("password") ?? "");
    const confirm = String(form.get("confirm") ?? "");

    if (newPassword !== confirm) {
      toastError("كلمتا المرور غير متطابقتين");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        toastError(data.error || resetPasswordCopy.invalidToken);
        return;
      }
      toastSuccess(resetPasswordCopy.successMessage);
      window.location.href = "/login";
    } catch {
      toastError("حدث خطأ في الاتصال");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="card text-center">
        <p className="text-brand-gray">{resetPasswordCopy.invalidToken}</p>
        <Link href="/forgot-password" className="mt-4 inline-block text-primary hover:underline">
          طلب رابط جديد
        </Link>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="mb-6 flex items-center gap-3">
        <KeyRound className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold text-primary">{resetPasswordCopy.title}</h1>
          <p className="text-sm text-brand-gray">{resetPasswordCopy.subtitle}</p>
        </div>
      </div>

      <form noValidate onSubmit={handleSubmit} className="space-y-4">
        <FieldRow label={resetPasswordCopy.passwordLabel} htmlFor="password" ltr variant="auth" error={fieldError("password")}>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            className="input-field-auth"
            dir="ltr"
            autoComplete="new-password"
          />
        </FieldRow>
        <FieldRow label={resetPasswordCopy.confirmLabel} htmlFor="confirm" ltr variant="auth" error={fieldError("confirm")}>
          <input
            id="confirm"
            name="confirm"
            type="password"
            required
            minLength={6}
            className="input-field-auth"
            dir="ltr"
            autoComplete="new-password"
          />
        </FieldRow>
        <SubmitButton loading={loading} className="btn-primary w-full">
          {resetPasswordCopy.submitBtn}
        </SubmitButton>
      </form>

      <p className="mt-6 text-center text-sm text-brand-gray">
        <Link href="/login" className="font-semibold text-primary hover:underline">
          {resetPasswordCopy.backToLogin}
        </Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-surface-muted">
      <Navbar showAuth={false} />
      <main className="mx-auto max-w-md px-4 py-12">
        <Suspense fallback={<div className="card text-center text-brand-gray">جاري التحميل...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </main>
    </div>
  );
}
