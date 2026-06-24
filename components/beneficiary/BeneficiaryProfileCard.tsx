"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import BeneficiaryProfileEdit from "@/components/beneficiary/BeneficiaryProfileEdit";
import FloatingModal from "@/components/admin/FloatingModal";
import SubmitButton from "@/components/ui/SubmitButton";
import { toastSuccess, toastError } from "@/lib/toast";
import { User, AlertTriangle } from "lucide-react";

type Profile = {
  name: string;
  email: string;
  phone: string;
  educationLevel: string;
  experience: string;
  skills: string;
  careerInterests: string;
  cvUrl: string | null;
  certificatesUrls: string | null;
};

type Props = {
  profile: Profile;
};

export default function BeneficiaryProfileCard({ profile }: Props) {
  const router = useRouter();
  const [accountModal, setAccountModal] = useState<"suspend" | "delete" | null>(null);
  const [confirmText, setConfirmText] = useState("");
  const [pending, startTransition] = useTransition();

  function handleAccountAction() {
    if (!accountModal) return;
    startTransition(async () => {
      const res = await fetch("/api/profile/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: accountModal, confirmText }),
      });
      const data = await res.json();
      if (!res.ok) {
        toastError(data.error || "فشل العملية");
        return;
      }
      toastSuccess(accountModal === "suspend" ? "تم تعليق الحساب" : "تم حذف الحساب");
      if (data.logout) {
        window.location.href = "/api/auth/logout";
        return;
      }
      setAccountModal(null);
      router.refresh();
    });
  }

  return (
    <section className="card">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <h2 className="flex items-center gap-2 text-xl font-bold text-primary">
          <User className="h-6 w-6" />
          الملف الشخصي
        </h2>
        <div className="flex flex-wrap gap-2">
          <BeneficiaryProfileEdit profile={profile} />
          <button
            type="button"
            onClick={() => {
              setConfirmText("");
              setAccountModal("suspend");
            }}
            className="btn-secondary !px-3 !py-2 text-sm"
          >
            تعليق الحساب
          </button>
          <button
            type="button"
            onClick={() => {
              setConfirmText("");
              setAccountModal("delete");
            }}
            className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800"
          >
            حذف الحساب
          </button>
        </div>
      </div>

      <dl className="grid gap-4 sm:grid-cols-3">
        <div>
          <dt className="text-xs font-semibold text-brand-gray">الاسم</dt>
          <dd className="font-medium text-primary">{profile.name}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-brand-gray">البريد</dt>
          <dd dir="ltr" className="text-primary">
            {profile.email}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-brand-gray">الجوال</dt>
          <dd dir="ltr" className="text-primary">
            {profile.phone}
          </dd>
        </div>
      </dl>

      {accountModal && (
        <FloatingModal
          title={accountModal === "suspend" ? "تعليق الحساب" : "حذف الحساب"}
          onClose={() => setAccountModal(null)}
        >
          <div className="space-y-4">
            <p className="flex items-start gap-2 text-sm text-red-800">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              {accountModal === "suspend"
                ? "سيتم تعليق حسابك ولن تتمكن من الدخول. اكتب «تعليق» للتأكيد."
                : "سيتم حذف حسابك نهائياً. اكتب «حذف» للتأكيد."}
            </p>
            <input
              className="input-field"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={accountModal === "suspend" ? "تعليق" : "حذف"}
            />
            <SubmitButton
              loading={pending}
              type="button"
              onClick={handleAccountAction}
              className="btn-primary w-full !bg-red-800"
            >
              تأكيد
            </SubmitButton>
          </div>
        </FloatingModal>
      )}
    </section>
  );
}
