"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import FloatingModal from "@/components/admin/FloatingModal";
import BeneficiaryAccountEdit from "@/components/beneficiary/BeneficiaryAccountEdit";
import FieldRow from "@/components/ui/FieldRow";
import SubmitButton from "@/components/ui/SubmitButton";
import { toastSuccess, toastError } from "@/lib/toast";
import { uploadPdfFile } from "@/lib/upload-client";
import { registerCopy } from "@/lib/copy/ar";
import type { UnifiedProfile } from "@/components/beneficiary/BeneficiaryUnifiedProfileModal";

type Props = {
  profile: UnifiedProfile;
  open: boolean;
  onClose: () => void;
};

type Tab = "profile" | "account";

export default function BeneficiaryEditModal({ profile, open, onClose }: Props) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("profile");
  const [pending, startTransition] = useTransition();
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [certFile, setCertFile] = useState<File | null>(null);

  if (!open) return null;

  function handleProfileSubmit(e: React.FormEvent<HTMLFormElement>) {
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
        onClose();
        router.refresh();
      } catch {
        toastError("حدث خطأ أثناء الرفع أو الحفظ");
      }
    });
  }

  return (
    <FloatingModal title="تعديل بياناتي" onClose={onClose} wide>
      <div className="mb-4 flex gap-2 border-b border-surface-border pb-3">
        <button
          type="button"
          onClick={() => setTab("profile")}
          className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
            tab === "profile" ? "bg-primary text-white" : "text-brand-gray hover:bg-surface-muted"
          }`}
        >
          الملف الشخصي
        </button>
        <button
          type="button"
          onClick={() => setTab("account")}
          className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${
            tab === "account" ? "bg-primary text-white" : "text-brand-gray hover:bg-surface-muted"
          }`}
        >
          بيانات الحساب
        </button>
      </div>

      {tab === "profile" ? (
        <form noValidate onSubmit={handleProfileSubmit} className="space-y-3 text-start">
          <FieldRow label="الاسم" htmlFor="modal-name">
            <input
              id="modal-name"
              name="name"
              defaultValue={profile.name}
              required
              className="input-field w-full min-w-0"
            />
          </FieldRow>
          <FieldRow label="رقم الجوال" htmlFor="modal-phone" ltr>
            <input
              id="modal-phone"
              name="phone"
              defaultValue={profile.phone}
              required
              className="input-field w-full min-w-0"
              dir="ltr"
            />
          </FieldRow>
          <FieldRow label="المستوى التعليمي" htmlFor="modal-education">
            <input
              id="modal-education"
              name="educationLevel"
              defaultValue={profile.educationLevel}
              className="input-field"
            />
          </FieldRow>
          <FieldRow label="الخبرات" htmlFor="modal-experience" align="start">
            <textarea
              id="modal-experience"
              name="experience"
              defaultValue={profile.experience}
              rows={2}
              className="input-field resize-none"
            />
          </FieldRow>
          <FieldRow label="المهارات" htmlFor="modal-skills" align="start">
            <textarea
              id="modal-skills"
              name="skills"
              defaultValue={profile.skills}
              rows={2}
              className="input-field resize-none"
            />
          </FieldRow>
          <FieldRow label="الميول المهنية" htmlFor="modal-career" align="start">
            <textarea
              id="modal-career"
              name="careerInterests"
              defaultValue={profile.careerInterests}
              rows={2}
              className="input-field resize-none"
            />
          </FieldRow>
          <FieldRow label={registerCopy.cvLabel} htmlFor="modal-cv">
            <div>
              <input
                id="modal-cv"
                type="file"
                accept=".pdf"
                className="input-field"
                onChange={(e) => setCvFile(e.target.files?.[0] ?? null)}
              />
              {profile.cvUrl && !cvFile && (
                <p className="mt-1 text-xs text-brand-gray">السيرة الحالية مرفقة</p>
              )}
            </div>
          </FieldRow>
          <FieldRow label={registerCopy.certificatesLabel} htmlFor="modal-cert">
            <input
              id="modal-cert"
              type="file"
              accept=".pdf"
              className="input-field"
              onChange={(e) => setCertFile(e.target.files?.[0] ?? null)}
            />
          </FieldRow>
          <SubmitButton loading={pending} className="btn-primary w-full !py-2 text-sm">
            حفظ التعديلات
          </SubmitButton>
        </form>
      ) : (
        <BeneficiaryAccountEdit
          email={profile.email}
          onSaved={() => {
            onClose();
            router.refresh();
          }}
        />
      )}
    </FloatingModal>
  );
}
