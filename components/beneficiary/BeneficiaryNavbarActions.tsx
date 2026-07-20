"use client";

import { useState } from "react";
import NotificationBell from "@/components/NotificationBell";
import BeneficiaryEditModal from "@/components/beneficiary/BeneficiaryEditModal";
import type { UnifiedProfile } from "@/components/beneficiary/BeneficiaryUnifiedProfileModal";
import { LogOut, Pencil } from "lucide-react";

type Props = {
  userName: string;
  profile: UnifiedProfile;
};

export default function BeneficiaryNavbarActions({ userName, profile }: Props) {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <>
      <span className="max-w-[140px] truncate text-sm font-semibold text-primary sm:max-w-[200px]">
        {userName}
      </span>
      <button
        type="button"
        onClick={() => setEditOpen(true)}
        className="inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-2 text-brand-gray transition hover:bg-surface-muted hover:text-primary"
        title="تعديل البيانات"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <NotificationBell />
      <form action="/api/auth/logout" method="POST" noValidate className="shrink-0">
        <button
          type="submit"
          className="inline-flex items-center gap-1 rounded-lg px-2 py-2 text-sm text-brand-gray transition hover:bg-surface-muted hover:text-primary sm:px-3"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">خروج</span>
        </button>
      </form>
      <BeneficiaryEditModal
        profile={profile}
        open={editOpen}
        onClose={() => setEditOpen(false)}
      />
    </>
  );
}
