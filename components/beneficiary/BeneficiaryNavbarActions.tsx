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
      <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-1.5 sm:gap-2">
        <span className="max-w-[140px] truncate text-sm font-semibold text-primary sm:max-w-[200px]">
          {userName}
        </span>
        <button
          type="button"
          onClick={() => setEditOpen(true)}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-2 text-brand-gray transition hover:bg-surface-muted hover:text-primary"
          title="تعديل البيانات"
        >
          <Pencil className="h-4 w-4" />
        </button>
      </div>
      <NotificationBell />
      <form action="/api/auth/logout" method="POST" noValidate>
        <button
          type="submit"
          className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-brand-gray transition hover:bg-surface-muted hover:text-primary"
        >
          <LogOut className="h-4 w-4" />
          خروج
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
