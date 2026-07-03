"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import FieldRow from "@/components/ui/FieldRow";
import SubmitButton from "@/components/ui/SubmitButton";
import { toastError } from "@/lib/toast";
import { LogIn } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");
  const [loading, setLoading] = useState(false);

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
      router.push(data.redirect);
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
        <FieldRow label="البريد الإلكتروني" htmlFor="email" ltr variant="auth">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            className="input-field-auth"
            placeholder="email@example.com"
            dir="ltr"
          />
        </FieldRow>
        <FieldRow label="كلمة المرور" htmlFor="password" ltr variant="auth">
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            className="input-field-auth"
            placeholder="••••••••"
            dir="ltr"
          />
        </FieldRow>
        <SubmitButton loading={loading} className="btn-primary w-full">
          دخول
        </SubmitButton>
      </form>

      <p className="mt-4 text-center text-sm">
        <Link href="/forgot-password" className="text-primary hover:underline">
          نسيت كلمة المرور؟
        </Link>
      </p>

      <p className="mt-4 text-center text-sm text-brand-gray">
        مستفيد جديد؟{" "}
        <Link href="/register" className="font-semibold text-primary hover:underline">
          سجّل هنا
        </Link>
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
