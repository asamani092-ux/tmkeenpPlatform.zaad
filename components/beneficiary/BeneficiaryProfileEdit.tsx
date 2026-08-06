"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import SubmitButton from "@/components/ui/SubmitButton";
import FieldRow from "@/components/ui/FieldRow";
import PdfDropzone from "@/components/ui/PdfDropzone";
import { toastSuccess, toastError } from "@/lib/toast";
import { uploadPdfFile } from "@/lib/upload-client";
import { beneficiaryCopy, registerCopy } from "@/lib/copy/ar";
import { Pencil, X } from "lucide-react";

type ProfileData = {
  name: string;
  email: string;
  phone: string;
  educationLevel: string;
  experience: string;
  skills: string;
  careerInterests: string;
  cvUrl?: string | null;
};

type Props = {
  profile: ProfileData;
};

export default function BeneficiaryProfileEdit({ profile }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
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
          cvUrl = await uploadPdfFile(cvFile, "cv");
        }
        if (certFile) {
          const certUrl = await uploadPdfFile(certFile, "certificate");
          certificatesUrls = JSON.stringify([certUrl]);
        }

        const res = await fetch("/api/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.get("name"),
            phone: form.get("phone"),
            educationLevel: form.get("educationLevel"),
            experience: form.get("experience"),
            skills: form.get("skills"),
            careerInterests: form.get("careerInterests"),
            ...(cvUrl ? { cvUrl } : {}),
            ...(certificatesUrls ? { certificatesUrls } : {}),
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          toastError(data.error || "فشل التحديث");
          return;
        }
        toastSuccess("تم تحديث الملف بنجاح");
        setOpen(false);
        router.refresh();
      } catch {
        toastError("حدث خطأ أثناء الرفع أو الحفظ");
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-secondary !px-3 !py-2 text-sm"
      >
        <Pencil className="h-4 w-4" />
        تعديل الملف
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "var(--tmkeen-overlay)", zIndex: "var(--z-modal)" }}
        >
          <div
            className="card max-h-[90vh] w-full max-w-lg overflow-y-auto shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center gap-3">
              <button type="button" onClick={() => setOpen(false)} className="rounded p-1 hover:bg-surface-muted">
                <X className="h-5 w-5" />
              </button>
              <h2 className="text-xl font-bold text-primary">{beneficiaryCopy.editProfileTitle}</h2>
            </div>

            <form noValidate onSubmit={handleSubmit} className="space-y-3">
              <FieldRow label="الاسم" htmlFor="profile-name">
                <input
                  id="profile-name"
                  name="name"
                  defaultValue={profile.name}
                  required
                  className="input-field w-full min-w-0"
                />
              </FieldRow>
              <FieldRow label="البريد" ltr>
                <input value={profile.email} disabled className="input-field w-full min-w-0 bg-surface-muted" dir="ltr" />
              </FieldRow>
              <FieldRow label="رقم الجوال" htmlFor="phone" ltr>
                <input id="phone" name="phone" defaultValue={profile.phone} required className="input-field w-full min-w-0" dir="ltr" />
              </FieldRow>
              <FieldRow label="المستوى التعليمي" htmlFor="educationLevel">
                <input id="educationLevel" name="educationLevel" defaultValue={profile.educationLevel} className="input-field" />
              </FieldRow>
              <FieldRow label="الخبرات" htmlFor="experience" align="start">
                <textarea id="experience" name="experience" defaultValue={profile.experience} rows={2} className="input-field resize-none" />
              </FieldRow>
              <FieldRow label="المهارات" htmlFor="skills" align="start">
                <textarea id="skills" name="skills" defaultValue={profile.skills} rows={2} className="input-field resize-none" />
              </FieldRow>
              <FieldRow label="الميول المهنية" htmlFor="careerInterests" align="start">
                <textarea id="careerInterests" name="careerInterests" defaultValue={profile.careerInterests} rows={2} className="input-field resize-none" />
              </FieldRow>
              <FieldRow label={registerCopy.cvLabel} htmlFor="cv" align="start">
                <PdfDropzone
                  id="cv"
                  file={cvFile}
                  onFile={setCvFile}
                  hint={registerCopy.cvHint}
                  currentLabel={profile.cvUrl ? "السيرة الحالية مرفقة" : undefined}
                />
              </FieldRow>
              <FieldRow label={registerCopy.certificatesLabel} htmlFor="certificates" align="start">
                <PdfDropzone
                  id="certificates"
                  file={certFile}
                  onFile={setCertFile}
                  hint={registerCopy.certificatesHint}
                />
              </FieldRow>
              <SubmitButton loading={pending} className="btn-primary w-full">
                حفظ التعديلات
              </SubmitButton>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
