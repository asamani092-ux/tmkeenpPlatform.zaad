"use client";

import { useTransition } from "react";
import FieldRow from "@/components/ui/FieldRow";
import SubmitButton from "@/components/ui/SubmitButton";
import { toastSuccess, toastError } from "@/lib/toast";

type Props = {
  email: string;
  onSaved?: () => void;
};

export default function BeneficiaryAccountEdit({ email, onSaved }: Props) {
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const nextEmail = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    if (!nextEmail) {
      toastError("البريد مطلوب");
      return;
    }

    startTransition(async () => {
      const res = await fetch("/api/profile/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: nextEmail,
          ...(password ? { password } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toastError(data.error || "فشل التحديث");
        return;
      }
      toastSuccess("تم تحديث بيانات الحساب");
      onSaved?.();
    });
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="space-y-3">
      <FieldRow label="البريد الإلكتروني" htmlFor="account-email" ltr>
        <input
          id="account-email"
          name="email"
          type="email"
          defaultValue={email}
          required
          className="input-field"
          dir="ltr"
        />
      </FieldRow>
      <FieldRow label="كلمة مرور جديدة (اختياري)" htmlFor="account-password" ltr>
        <input
          id="account-password"
          name="password"
          type="password"
          placeholder="اتركه فارغاً للإبقاء"
          minLength={6}
          className="input-field"
          dir="ltr"
        />
      </FieldRow>
      <SubmitButton loading={pending} className="btn-primary w-full !py-2 text-sm">
        حفظ بيانات الحساب
      </SubmitButton>
    </form>
  );
}
