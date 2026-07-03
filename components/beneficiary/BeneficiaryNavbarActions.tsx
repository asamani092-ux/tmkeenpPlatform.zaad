"use client";

import NotificationBell from "@/components/NotificationBell";
import BeneficiaryUnifiedProfileModal, {
  type UnifiedProfile,
} from "@/components/beneficiary/BeneficiaryUnifiedProfileModal";
import { LogOut } from "lucide-react";

type Props = {
  userId: string;
  profile: UnifiedProfile;
};

export default function BeneficiaryNavbarActions({ userId, profile }: Props) {
  return (
    <>
      <NotificationBell />
      <BeneficiaryUnifiedProfileModal profile={profile} />
      <form action="/api/auth/logout" method="POST">
        <button
          type="submit"
          className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-brand-gray transition hover:bg-surface-muted hover:text-primary"
        >
          <LogOut className="h-4 w-4" />
          خروج
        </button>
      </form>
    </>
  );
}
