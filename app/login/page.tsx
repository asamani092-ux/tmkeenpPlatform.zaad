"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import FullPageLink from "@/components/FullPageLink";
import SubmitButton from "@/components/ui/SubmitButton";
import { toastError } from "@/lib/toast";
import { LogIn } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const body = {
      email: form.get("email"),
      password: form.get("password"),
    };

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        toastError(data.error || "بيانات الدخول غير صحيحة");
        return;
      }
      router.push(data.redirect);
      router.refresh();
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

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="label-field">
            البريد الإلكتروني
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="input-field"
            placeholder="email@example.com"
            dir="ltr"
          />
        </div>
        <div>
          <label htmlFor="password" className="label-field">
            كلمة المرور
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="input-field"
            placeholder="••••••••"
            dir="ltr"
          />
        </div>
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
        <Suspense fallback={<div className="card animate-pulse h-64" />}>
          <LoginForm />
        </Suspense>
      </main>
    </div>
  );
}
