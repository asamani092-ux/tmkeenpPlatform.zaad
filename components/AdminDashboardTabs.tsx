"use client";

import { useState } from "react";
import AdminOpportunitiesSection from "@/components/admin/AdminOpportunitiesSection";
import AdminGuidePanel from "@/components/admin/AdminGuidePanel";
import AdminBeneficiaryManagement from "@/components/admin/AdminBeneficiaryManagement";
import AdminFollowUpPanel from "@/components/admin/AdminFollowUpPanel";
import AdminPipelineBoard from "@/components/admin/AdminPipelineBoard";
import AdminSystemSettings from "@/components/admin/AdminSystemSettings";
import AdminApplicationsPanel from "@/components/admin/AdminApplicationsPanel";
import AdminImpactPanel, { type ImpactStats } from "@/components/admin/AdminImpactPanel";
import { adminCopy } from "@/lib/copy/ar";
import { Stage } from "@/generated/prisma/client";
import { Briefcase, BarChart3, ClipboardList, Kanban, Settings, UserCog, UsersRound, FileCheck } from "lucide-react";
import type { ManagedBeneficiary } from "@/components/admin/AdminBeneficiaryManagement";

type Opportunity = {
  id: string;
  type: string;
  title: string;
  provider: string;
  duration: string;
  status: string;
  requirements: string;
  salary: string | null;
  jobType: string | null;
};

type Guide = {
  id: string;
  name: string;
  email: string;
  phone: string;
  beneficiaryCount: number;
};

type Beneficiary = {
  id: string;
  name: string;
  phone: string;
  email?: string;
  educationLevel?: string;
  stage: Stage;
  pendingStage: Stage | null;
  guideId: string | null;
  guideName: string | null;
};

type FollowUp = {
  id: string;
  month: number;
  status: string;
  notes: string;
  beneficiary: { id: string; name: string; phone: string };
};

type ApplicationRow = {
  id: string;
  status: string;
  reviewNote: string | null;
  appliedAt: string;
  beneficiary: { id: string; name: string; phone: string; stage: Stage };
  opportunity: { id: string; title: string; type: string; provider: string };
};

type Props = {
  opportunities: Opportunity[];
  guides: Guide[];
  beneficiaries: Beneficiary[];
  managedBeneficiaries: ManagedBeneficiary[];
  followUps: FollowUp[];
  employedBeneficiaries: { id: string; name: string; phone?: string }[];
  applications: ApplicationRow[];
  impactStats: ImpactStats;
};

type Tab = "pipeline" | "opportunities" | "guides" | "management" | "applications" | "followup" | "impact" | "settings";

export default function AdminDashboardTabs({
  opportunities,
  guides,
  beneficiaries,
  managedBeneficiaries,
  followUps,
  employedBeneficiaries,
  applications,
  impactStats,
}: Props) {
  const [tab, setTab] = useState<Tab>("pipeline");

  const tabs: { id: Tab; label: string; icon: typeof ClipboardList }[] = [
    { id: "pipeline", label: adminCopy.pipelineTab, icon: Kanban },
    { id: "opportunities", label: adminCopy.opportunitiesTab, icon: ClipboardList },
    { id: "guides", label: adminCopy.guidesTab, icon: UserCog },
    { id: "management", label: adminCopy.managementTab, icon: UsersRound },
    { id: "applications", label: adminCopy.applicationsTab, icon: FileCheck },
    { id: "followup", label: adminCopy.followUpTab, icon: Briefcase },
    { id: "impact", label: adminCopy.impactTab, icon: BarChart3 },
    { id: "settings", label: adminCopy.settingsTab, icon: Settings },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2 rounded-xl bg-surface p-1 shadow-sm">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex min-w-[100px] flex-1 items-center justify-center gap-2 rounded-lg px-2 py-3 text-sm font-semibold transition ${
              tab === id ? "bg-primary text-white" : "text-brand-gray hover:bg-surface-muted"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </button>
        ))}
      </div>

      {tab === "pipeline" && <AdminPipelineBoard beneficiaries={beneficiaries} />}

      {tab === "opportunities" && (
        <AdminOpportunitiesSection
          opportunities={opportunities}
          beneficiaries={beneficiaries}
        />
      )}

      {tab === "guides" && <AdminGuidePanel guides={guides} />}

      {tab === "management" && (
        <AdminBeneficiaryManagement
          beneficiaries={managedBeneficiaries}
          guides={guides.map((g) => ({ id: g.id, name: g.name }))}
        />
      )}

      {tab === "applications" && (
        <AdminApplicationsPanel applications={applications} />
      )}

      {tab === "followup" && (
        <AdminFollowUpPanel
          followUps={followUps}
          employedBeneficiaries={employedBeneficiaries}
        />
      )}

      {tab === "impact" && <AdminImpactPanel stats={impactStats} />}

      {tab === "settings" && <AdminSystemSettings />}
    </div>
  );
}
