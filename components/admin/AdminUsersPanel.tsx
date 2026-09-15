"use client";

import AdminGuidePanel from "@/components/admin/AdminGuidePanel";
import AdminBeneficiaryManagement, {
  type ManagedBeneficiary,
} from "@/components/admin/AdminBeneficiaryManagement";
import AdminSupervisorsPanel, {
  type Supervisor,
} from "@/components/admin/AdminSupervisorsPanel";
import { adminCopy } from "@/lib/copy/ar";

type Guide = {
  id: string;
  name: string;
  email: string;
  phone: string;
  beneficiaryCount: number;
};

type AssignedBeneficiary = {
  id: string;
  name: string;
  phone: string;
  stage: string;
};

export type UsersWindow = "supervisors" | "guides" | "beneficiaries";

type Props = {
  window: UsersWindow;
  onWindowChange: (w: UsersWindow) => void;
  supervisors: Supervisor[];
  canManageSupervisors: boolean;
  guides: Guide[];
  beneficiariesByGuideId: Record<string, AssignedBeneficiary[]>;
  managedBeneficiaries: ManagedBeneficiary[];
  openBeneficiaryId: string | null;
  onBeneficiaryOpened: () => void;
};

export default function AdminUsersPanel({
  window,
  onWindowChange,
  supervisors,
  canManageSupervisors,
  guides,
  beneficiariesByGuideId,
  managedBeneficiaries,
  openBeneficiaryId,
  onBeneficiaryOpened,
}: Props) {
  const windows: { id: UsersWindow; label: string; shortLabel: string }[] = [
    {
      id: "supervisors",
      label: adminCopy.usersWindowSupervisors,
      shortLabel: "مشرفون",
    },
    {
      id: "guides",
      label: adminCopy.usersWindowGuides,
      shortLabel: "مرشدون",
    },
    {
      id: "beneficiaries",
      label: adminCopy.usersWindowBeneficiaries,
      shortLabel: "مستفيدون",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="-mx-1 overflow-x-auto px-1">
        <div
          role="tablist"
          aria-label="نوافذ المستخدمين"
          className="tab-bar min-w-max sm:min-w-0"
        >
          {windows.map(({ id, label, shortLabel }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={window === id}
              data-active={window === id}
              onClick={() => onWindowChange(id)}
              title={label}
              className="flex min-h-[44px] min-w-[4.5rem] shrink-0 items-center justify-center gap-1.5 text-xs focus-visible:outline-none sm:min-w-[100px] sm:flex-1 sm:text-sm"
            >
              <span className="sm:hidden">{shortLabel}</span>
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {window === "supervisors" && (
        <AdminSupervisorsPanel
          supervisors={supervisors}
          canManage={canManageSupervisors}
        />
      )}
      {window === "guides" && (
        <AdminGuidePanel
          guides={guides}
          beneficiariesByGuideId={beneficiariesByGuideId}
        />
      )}
      {window === "beneficiaries" && (
        <AdminBeneficiaryManagement
          beneficiaries={managedBeneficiaries}
          guides={guides.map((g) => ({ id: g.id, name: g.name }))}
          initialOpenBeneficiaryId={openBeneficiaryId}
          onBeneficiaryOpened={onBeneficiaryOpened}
        />
      )}
    </div>
  );
}
