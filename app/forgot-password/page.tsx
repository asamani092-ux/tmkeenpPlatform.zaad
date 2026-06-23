"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import FullPageLink from "@/components/FullPageLink";
import SubmitButton from "@/components/ui/SubmitButton";
import { toastError, toastSuccess } from "@/lib/toast";
import { forgotPasswordCopy } from "@/lib/copy/ar";
import { KeyRound } from "lucide-react";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: form.get("phone"),
          password: form.get("password"),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toastError(data.error || "فشل إعادة التعيين");
        return;
      }
      toastSuccess("تم تعيين كلمة المرور بنجاح. يمكنك تسجيل الدخول الآن.");
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="phone" className="label-field">
                {forgotPasswordCopy.phoneLabel}
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                required
                className="input-field"
                dir="ltr"
              />
            </div>
            <div>
              <label htmlFor="password" className="label-field">
                {forgotPasswordCopy.passwordLabel}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                className="input-field"
                dir="ltr"
              />
            </div>
            <SubmitButton loading={loading} className="btn-primary w-full">
              {forgotPasswordCopy.submitBtn}
            </SubmitButton>
          </form>

          <p className="mt-6 text-center text-sm text-brand-gray">
            <FullPageLink href="/login" className="font-semibold text-primary hover:underline">
              {forgotPasswordCopy.backToLogin}
            </FullPageLink>
          </p>
        </div>
      </main>
    </div>
  );
}
