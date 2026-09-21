"use client";

import { useState } from "react";
import Image from "next/image";
import FullPageLink from "@/components/FullPageLink";
import Navbar from "@/components/Navbar";
import FieldRow from "@/components/ui/FieldRow";
import SubmitButton from "@/components/ui/SubmitButton";
import { toastError } from "@/lib/toast";
import { useFormFieldErrors } from "@/hooks/useFormFieldErrors";
import { Eye, EyeOff, LogIn } from "lucide-react";

export default function GuideLoginPage() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { validate, fieldError } = useFormFieldErrors();

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
        body: JSON.stringify({ email, password, expectedRole: "GUIDE" }),
      });
      const data = await res.json();
      if (!res.ok) {
        toastError(data.error || "بيانات الدخول غير صحيحة");
        return;
      }
      if (data.redirect !== "/dashboard/guide") {
        toastError("هذا المدخل مخصص للمرشدين فقط");
        return;
      }
      window.location.assign(data.redirect);
      return;
    } catch {
      toastError("حدث خطأ في الاتصال. حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface-muted">
      <Navbar showAuth={false} />
      <main className="flex flex-1 items-start justify-center px-4 py-6 sm:items-center sm:py-16">
        <div className="w-full max-w-md">
          <div className="card">
            <div className="mb-6 flex justify-center">
              <Image
                src="/logo.png"
                alt="شعار جمعية الزاد"
                width={300}
                height={179}
                className="h-16 w-auto object-contain"
                priority
                unoptimized
              />
            </div>
            <div className="mb-6 flex items-center gap-3">
              <LogIn className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-primary">دخول المرشد</h1>
                <p className="text-sm text-brand-gray">للمرشدين المهنيين فقط</p>
              </div>
            </div>
            <form method="post" action="#" onSubmit={handleSubmit} noValidate className="space-y-4">
              <FieldRow label="البريد الإلكتروني" htmlFor="email" ltr variant="auth" error={fieldError("email")}>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  required
                  className="input-field min-h-12"
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
                    className="input-field min-h-12 pe-11"
                    placeholder="••••••••"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute end-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-brand-gray transition hover:bg-surface-muted hover:text-primary"
                    aria-label={showPassword ? "إخفاء كلمة المرور" : "عرض كلمة المرور"}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </FieldRow>
              <SubmitButton loading={loading} className="btn-primary min-h-12 w-full">
                دخول
              </SubmitButton>
            </form>
            <p className="mt-4 text-center text-sm">
              <FullPageLink href="/login" className="text-primary hover:underline">
                دخول المستفيد أو الإدارة
              </FullPageLink>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
