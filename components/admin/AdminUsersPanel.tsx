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
  const windows: { id: UsersWindow; label: string }[] = [
    { id: "supervisors", label: adminCopy.usersWindowSupervisors },
    { id: "guides", label: adminCopy.usersWindowGuides },
    { id: "beneficiaries", label: adminCopy.usersWindowBeneficiaries },
  ];

  return (
    <div className="space-y-4">
      <div
        role="tablist"
        aria-label="نوافذ المستخدمين"
        className="flex flex-wrap gap-2"
      >
        {windows.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={window === id}
            onClick={() => onWindowChange(id)}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              window === id
                ? "bg-primary text-white"
                : "bg-surface-muted text-primary hover:bg-surface-border"
            }`}
          >
            {label}
          </button>
        ))}
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
