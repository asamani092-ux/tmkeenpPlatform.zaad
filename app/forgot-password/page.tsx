"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import FieldRow from "@/components/ui/FieldRow";
import SubmitButton from "@/components/ui/SubmitButton";
import { toastError, toastSuccess } from "@/lib/toast";
import { forgotPasswordCopy } from "@/lib/copy/ar";
import { useFormFieldErrors } from "@/hooks/useFormFieldErrors";
import { KeyRound } from "lucide-react";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const { validate, fieldError } = useFormFieldErrors();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate(e.currentTarget)) return;
    setLoading(true);

    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.get("email"),
        }),
      });
      const data = await res.json();
      toastSuccess(data.message || forgotPasswordCopy.successMessage);
    } catch {
      toastError("حدث خطأ في الاتصال");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface-muted">
      <Navbar showAuth={false} />
      <main className="mx-auto max-w-md px-4 py-12">
        <div className="card">
          <div className="mb-6 flex items-center gap-3">
            <KeyRound className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-primary">
                {forgotPasswordCopy.title}
              </h1>
              <p className="text-sm text-brand-gray">{forgotPasswordCopy.subtitle}</p>
            </div>
          </div>

          <form noValidate onSubmit={handleSubmit} className="space-y-4">
            <FieldRow label={forgotPasswordCopy.emailLabel} htmlFor="email" ltr error={fieldError("email")}>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input-field"
                dir="ltr"
                autoComplete="email"
              />
            </FieldRow>
            <SubmitButton loading={loading} className="btn-primary w-full">
              {forgotPasswordCopy.submitBtn}
            </SubmitButton>
          </form>

          <p className="mt-6 text-center text-sm text-brand-gray">
            <Link href="/login" className="font-semibold text-primary hover:underline">
              {forgotPasswordCopy.backToLogin}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
