"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import FullPageLink from "@/components/FullPageLink";
import Navbar from "@/components/Navbar";
import FieldRow from "@/components/ui/FieldRow";
import SubmitButton from "@/components/ui/SubmitButton";
import { toastError } from "@/lib/toast";
import { useFormFieldErrors } from "@/hooks/useFormFieldErrors";
import { Eye, EyeOff, LogIn } from "lucide-react";

function LoginForm() {
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");
  const [loading, setLoading] = useState(false);
  /** O(1) toggle — show/hide password characters */
  const [showPassword, setShowPassword] = useState(false);
  const { validate, fieldError } = useFormFieldErrors();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("email") || params.has("password")) {
      params.delete("email");
      params.delete("password");
      const qs = params.toString();
      const next = `${window.location.pathname}${qs ? `?${qs}` : ""}`;
      window.history.replaceState(null, "", next);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!validate(e.currentTarget)) return;
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    if (!email || !password) {
      toastError("أدخل البريد وكلمة المرور");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toastError(data.error || "بيانات الدخول غير صحيحة");
        return;
      }
      // Full navigation after cookie auth — avoids stuck loading.tsx from replace+refresh.
      window.location.assign(data.redirect);
      return;
    } catch {
      toastError("حدث خطأ في الاتصال. حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <div className="mb-6 flex items-center gap-3">
        <LogIn className="h-8 w-8 text-primary" />
        <h1 className="text-2xl font-bold text-primary">تسجيل الدخول</h1>
      </div>

      {registered && (
        <p className="mb-4 rounded-lg bg-secondary/20 px-4 py-3 text-sm text-primary-dark">
          تم التسجيل بنجاح. يمكنك تسجيل الدخول الآن.
        </p>
      )}

      <form method="post" action="#" onSubmit={handleSubmit} noValidate className="space-y-4">
        <FieldRow label="البريد الإلكتروني" htmlFor="email" ltr variant="auth" error={fieldError("email")}>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            required
            className="input-field"
            placeholder="email@example.com"
            dir="ltr"
          />
        </FieldRow>
        <FieldRow label="كلمة المرور" htmlFor="password" ltr variant="auth" error={fieldError("password")}>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              className="input-field pe-11"
              placeholder="••••••••"
              dir="ltr"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute end-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-brand-gray transition hover:bg-surface-muted hover:text-primary"
              aria-label={showPassword ? "إخفاء كلمة المرور" : "عرض كلمة المرور"}
              aria-pressed={showPassword}
              tabIndex={0}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </FieldRow>
        <SubmitButton loading={loading} className="btn-primary w-full">
          دخول
        </SubmitButton>
      </form>

      <p className="mt-4 text-center text-sm">
        <FullPageLink href="/forgot-password" className="text-primary hover:underline">
          نسيت كلمة المرور؟
        </FullPageLink>
      </p>

      <p className="mt-4 text-center text-sm text-brand-gray">
        مستفيد جديد؟{" "}
        <FullPageLink href="/register" className="font-semibold text-primary hover:underline">
          سجّل هنا
        </FullPageLink>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-surface-muted">
      <Navbar showAuth={false} />
      <main className="mx-auto max-w-md px-4 py-12">
        <Suspense fallback={<div className="card h-64 animate-pulse" />}>
          <LoginForm />
        </Suspense>
      </main>
    </div>
  );
}
