"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
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
  showToAll: boolean;
};

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

type PipelineGuide = { id: string; name: string };

type FollowUp = {
  id: string;
  month: number;
  status: string;
  notes: string;
  answers?: unknown;
  submittedAt?: string | null;
  opensAt?: string | null;
  dueAt?: string | null;
  lastReminderAt?: string | null;
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
  beneficiariesByGuideId: Record<string, AssignedBeneficiary[]>;
  beneficiaries: Beneficiary[];
  managedBeneficiaries: ManagedBeneficiary[];
  followUps: FollowUp[];
  employedBeneficiaries: {
    id: string;
    name: string;
    phone?: string;
    followUpProgramStatus?: import("@/generated/prisma/client").FollowUpProgramStatus | null;
    followUpPauseReason?: string | null;
    followUpEndReason?: string | null;
    followUpStatusUpdatedAt?: string | null;
  }[];
  applications: ApplicationRow[];
  impactStats: ImpactStats;
};

type Tab = "pipeline" | "opportunities" | "guides" | "management" | "applications" | "followup" | "impact" | "settings";

export default function AdminDashboardTabs({
  opportunities,
  guides,
  beneficiariesByGuideId,
  beneficiaries,
  managedBeneficiaries,
  followUps,
  employedBeneficiaries,
  applications,
  impactStats,
}: Props) {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>("pipeline");
  const [openBeneficiaryId, setOpenBeneficiaryId] = useState<string | null>(null);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    const validTabs: Tab[] = [
      "pipeline",
      "opportunities",
      "guides",
      "management",
      "applications",
      "followup",
      "impact",
      "settings",
    ];
    if (tabParam && validTabs.includes(tabParam as Tab)) {
      setTab(tabParam as Tab);
    }
    const beneficiaryId = searchParams.get("beneficiary");
    if (beneficiaryId) {
      setOpenBeneficiaryId(beneficiaryId);
    }
  }, [searchParams]);

  const tabs: {
    id: Tab;
    label: string;
    shortLabel: string;
    icon: typeof ClipboardList;
  }[] = [
    {
      id: "pipeline",
      label: adminCopy.pipelineTab,
      shortLabel: adminCopy.pipelineTabShort,
      icon: Kanban,
    },
    {
      id: "opportunities",
      label: adminCopy.opportunitiesTab,
      shortLabel: adminCopy.opportunitiesTabShort,
      icon: ClipboardList,
    },
    {
      id: "guides",
      label: adminCopy.guidesTab,
      shortLabel: adminCopy.guidesTabShort,
      icon: UserCog,
    },
    {
      id: "management",
      label: adminCopy.managementTab,
      shortLabel: adminCopy.managementTabShort,
      icon: UsersRound,
    },
    {
      id: "applications",
      label: adminCopy.applicationsTab,
      shortLabel: adminCopy.applicationsTabShort,
      icon: FileCheck,
    },
    {
      id: "followup",
      label: adminCopy.followUpTab,
      shortLabel: adminCopy.followUpTabShort,
      icon: Briefcase,
    },
    {
      id: "impact",
      label: adminCopy.impactTab,
      shortLabel: adminCopy.impactTabShort,
      icon: BarChart3,
    },
    {
      id: "settings",
      label: adminCopy.settingsTab,
      shortLabel: adminCopy.settingsTabShort,
      icon: Settings,
    },
  ];

  /** Open management modal without soft-nav URL race / stacked modals — O(1) */
  function openBeneficiaryFile(beneficiaryId: string) {
    setOpenBeneficiaryId(beneficiaryId);
    setTab("management");
  }

  return (
    <div className="space-y-6">
      <div className="-mx-1 overflow-x-auto px-1">
        <div
          role="tablist"
          aria-label="أقسام لوحة المدير"
          className="tab-bar min-w-max sm:min-w-0"
        >
          {tabs.map(({ id, label, shortLabel, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              data-active={tab === id}
              onClick={() => setTab(id)}
              title={label}
              className="flex min-h-[44px] min-w-[4.5rem] shrink-0 items-center justify-center gap-1.5 text-xs focus-visible:outline-none sm:min-w-[100px] sm:flex-1 sm:gap-2 sm:text-sm"
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="sm:hidden">{shortLabel}</span>
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {tab === "pipeline" && (
        <AdminPipelineBoard
          beneficiaries={beneficiaries}
          guides={guides.map((g): PipelineGuide => ({ id: g.id, name: g.name }))}
          onOpenBeneficiary={openBeneficiaryFile}
        />
      )}

      {tab === "opportunities" && (
        <AdminOpportunitiesSection opportunities={opportunities} />
      )}

      {tab === "guides" && (
        <AdminGuidePanel guides={guides} beneficiariesByGuideId={beneficiariesByGuideId} />
      )}

      {tab === "management" && (
        <AdminBeneficiaryManagement
          beneficiaries={managedBeneficiaries}
          guides={guides.map((g) => ({ id: g.id, name: g.name }))}
          initialOpenBeneficiaryId={openBeneficiaryId}
          onBeneficiaryOpened={() => setOpenBeneficiaryId(null)}
        />
      )}

      {tab === "applications" && (
        <AdminApplicationsPanel applications={applications} />
      )}

      {tab === "followup" && (
        <AdminFollowUpPanel
          followUps={followUps.map((f) => ({
            ...f,
            submittedAt: f.submittedAt ?? null,
            opensAt: f.opensAt ?? null,
            dueAt: f.dueAt ?? null,
            lastReminderAt: f.lastReminderAt ?? null,
            answers:
              f.answers && typeof f.answers === "object" && !Array.isArray(f.answers)
                ? (f.answers as Record<string, string>)
                : null,
          }))}
          employedBeneficiaries={employedBeneficiaries}
        />
      )}

      {tab === "impact" && <AdminImpactPanel stats={impactStats} />}

      {tab === "settings" && <AdminSystemSettings />}
    </div>
  );
}
