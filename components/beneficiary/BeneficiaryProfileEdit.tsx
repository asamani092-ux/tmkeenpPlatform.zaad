"use client";



import { useState, useTransition } from "react";

import { useRouter } from "next/navigation";

import SubmitButton from "@/components/ui/SubmitButton";

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

          toastError(data.error || "فشل الحفظ");

          return;

        }

        setOpen(false);

        setCvFile(null);

        setCertFile(null);

        toastSuccess("تم حفظ الملف بنجاح");

        router.refresh();

      } catch (err) {

        toastError(err instanceof Error ? err.message : "فشل رفع الملف");

      }

    });

  }



  return (

    <>

      <button

        type="button"

        onClick={() => setOpen(true)}

        className="btn-primary inline-flex !px-3 !py-2 text-sm"

        title={beneficiaryCopy.editProfile}

      >

        <Pencil className="h-4 w-4" />

        {beneficiaryCopy.editProfile}

      </button>



      {open && (

        <div

          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"

          onClick={() => setOpen(false)}

        >

          <div

            className="card max-h-[90vh] w-full max-w-lg overflow-y-auto text-right"

            onClick={(e) => e.stopPropagation()}

          >

            <div className="mb-4 flex items-start justify-between">

              <button type="button" onClick={() => setOpen(false)} className="rounded p-1 hover:bg-surface-muted">

                <X className="h-5 w-5" />

              </button>

              <h2 className="text-xl font-bold text-primary">{beneficiaryCopy.editProfileTitle}</h2>

            </div>



            <form onSubmit={handleSubmit} className="space-y-3">

              <div>

                <label className="label-field">الاسم</label>

                <input value={profile.name} disabled className="input-field bg-surface-muted" />

              </div>

              <div>

                <label className="label-field">البريد</label>

                <input value={profile.email} disabled className="input-field bg-surface-muted" dir="ltr" />

              </div>

              <div>

                <label htmlFor="phone" className="label-field">رقم الجوال</label>

                <input id="phone" name="phone" defaultValue={profile.phone} required className="input-field" dir="ltr" />

              </div>

              <div>

                <label htmlFor="educationLevel" className="label-field">المستوى التعليمي</label>

                <input id="educationLevel" name="educationLevel" defaultValue={profile.educationLevel} className="input-field" />

              </div>

              <div>

                <label htmlFor="experience" className="label-field">الخبرات</label>

                <textarea id="experience" name="experience" defaultValue={profile.experience} rows={2} className="input-field resize-none" />

              </div>

              <div>

                <label htmlFor="skills" className="label-field">المهارات</label>

                <textarea id="skills" name="skills" defaultValue={profile.skills} rows={2} className="input-field resize-none" />

              </div>

              <div>

                <label htmlFor="careerInterests" className="label-field">الميول المهنية</label>

                <textarea id="careerInterests" name="careerInterests" defaultValue={profile.careerInterests} rows={2} className="input-field resize-none" />

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

                {profile.cvUrl && !cvFile && (

                  <p className="mt-1 text-xs text-brand-gray">السيرة الحالية مرفقة</p>

                )}

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

                {beneficiaryCopy.saveProfile}

              </SubmitButton>

            </form>

          </div>

        </div>

      )}

    </>

  );

}

