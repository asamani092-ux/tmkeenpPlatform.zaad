"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import FullPageLink from "@/components/FullPageLink";
import SubmitButton from "@/components/ui/SubmitButton";
import { toastError } from "@/lib/toast";
import { uploadPdfFile } from "@/lib/upload-client";
import { registerCopy } from "@/lib/copy/ar";
import { UserPlus } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [certFile, setCertFile] = useState<File | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        let cvUrl: string | undefined;
        let certificatesUrls: string | undefined;

        if (cvFile) {
          cvUrl = await uploadPdfFile(cvFile, "cv", "register");
        }
        if (certFile) {
          const certUrl = await uploadPdfFile(certFile, "certificate", "register");
          certificatesUrls = JSON.stringify([certUrl]);
        }

        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: String(form.get("name") ?? ""),
            phone: String(form.get("phone") ?? ""),
            email: String(form.get("email") ?? ""),
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
          toastError(data.error || "فشل التسجيل");
          return;
        }
        router.push("/login?registered=1");
      } catch {
        toastError("حدث خطأ في الاتصال. حاول مرة أخرى.");
      }
    });
  }

  return (
    <div className="min-h-screen bg-surface-muted">
      <Navbar showAuth={false} />
      <main className="mx-auto max-w-2xl px-4 py-12">
        <div className="card">
          <div className="mb-6 flex items-center gap-3">
            <UserPlus className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-primary">{registerCopy.title}</h1>
              <p className="text-sm text-brand-gray">{registerCopy.subtitle}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="name" className="label-field">
                  الاسم الكامل
                </label>
                <input id="name" name="name" required className="input-field" />
              </div>
              <div>
                <label htmlFor="phone" className="label-field">
                  رقم الجوال
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
                <label htmlFor="email" className="label-field">
                  البريد الإلكتروني
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="input-field"
                  dir="ltr"
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="password" className="label-field">
                  كلمة المرور
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
            </div>

            <hr className="border-surface-border" />
            <p className="text-sm font-semibold text-primary">الملف الرقمي</p>

            <div>
              <label htmlFor="educationLevel" className="label-field">
                المستوى التعليمي
              </label>
              <input id="educationLevel" name="educationLevel" className="input-field" />
            </div>
            <div>
              <label htmlFor="experience" className="label-field">
                الخبرات
              </label>
              <textarea id="experience" name="experience" rows={2} className="input-field resize-none" />
            </div>
            <div>
              <label htmlFor="skills" className="label-field">
                المهارات
              </label>
              <textarea id="skills" name="skills" rows={2} className="input-field resize-none" />
            </div>
            <div>
              <label htmlFor="careerInterests" className="label-field">
                الميول المهنية
              </label>
              <textarea
                id="careerInterests"
                name="careerInterests"
                rows={2}
                className="input-field resize-none"
              />
            </div>

            <div>
              <label htmlFor="cv" className="label-field">
                {registerCopy.cvLabel}
              </label>
              <input
                id="cv"
                type="file"
                accept=".pdf"
                className="input-field"
                onChange={(e) => setCvFile(e.target.files?.[0] ?? null)}
              />
              <p className="mt-1 text-xs text-brand-gray">{registerCopy.cvHint}</p>
            </div>
            <div>
              <label htmlFor="certificates" className="label-field">
                {registerCopy.certificatesLabel}
              </label>
              <input
                id="certificates"
                type="file"
                accept=".pdf"
                className="input-field"
                onChange={(e) => setCertFile(e.target.files?.[0] ?? null)}
              />
              <p className="mt-1 text-xs text-brand-gray">{registerCopy.certificatesHint}</p>
            </div>

            <SubmitButton loading={pending} className="btn-primary w-full">
              {registerCopy.submitBtn}
            </SubmitButton>
          </form>

          <p className="mt-6 text-center text-sm text-brand-gray">
            {registerCopy.hasAccount}{" "}
            <FullPageLink href="/login" className="font-semibold text-primary hover:underline">
              {registerCopy.loginLink}
            </FullPageLink>
          </p>
        </div>
      </main>
    </div>
  );
}
