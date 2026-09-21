"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import AdminOpportunitiesSection from "@/components/admin/AdminOpportunitiesSection";
import AdminUsersPanel, { type UsersWindow } from "@/components/admin/AdminUsersPanel";
import AdminFollowUpPanel from "@/components/admin/AdminFollowUpPanel";
import AdminPipelineBoard from "@/components/admin/AdminPipelineBoard";
import AdminSystemSettings from "@/components/admin/AdminSystemSettings";
import AdminApplicationsPanel from "@/components/admin/AdminApplicationsPanel";
import AdminImpactPanel, { type ImpactStats } from "@/components/admin/AdminImpactPanel";
import { adminCopy } from "@/lib/copy/ar";
import { Stage } from "@/generated/prisma/client";
import { Briefcase, BarChart3, ClipboardList, Kanban, Menu, Settings, UsersRound, FileCheck, X } from "lucide-react";
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
  targetCount: number;
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

type Supervisor = {
  id: string;
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
  role: "ADMIN" | "SYSTEM_ADMIN";
  notifyOnRegistration: boolean;
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
  supervisors: Supervisor[];
  canManageSupervisors: boolean;
};

type Tab = "pipeline" | "opportunities" | "users" | "applications" | "followup" | "impact" | "settings";

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
  supervisors,
  canManageSupervisors,
}: Props) {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>("pipeline");
  const [navOpen, setNavOpen] = useState(false);
  const [openBeneficiaryId, setOpenBeneficiaryId] = useState<string | null>(null);
  const [usersWindow, setUsersWindow] = useState<UsersWindow>("supervisors");

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    const validTabs: Tab[] = [
      "pipeline",
      "opportunities",
      "users",
      "applications",
      "followup",
      "impact",
      "settings",
    ];
    const windowParam = searchParams.get("window");
    const validWindows: UsersWindow[] = ["supervisors", "guides", "beneficiaries"];

    if (tabParam === "guides") {
      setTab("users");
      setUsersWindow("guides");
    } else if (tabParam === "management") {
      setTab("users");
      setUsersWindow("beneficiaries");
    } else if (tabParam && validTabs.includes(tabParam as Tab)) {
      setTab(tabParam as Tab);
    }

    if (windowParam && validWindows.includes(windowParam as UsersWindow)) {
      setUsersWindow(windowParam as UsersWindow);
    }

    const beneficiaryId = searchParams.get("beneficiary");
    if (beneficiaryId) {
      setOpenBeneficiaryId(beneficiaryId);
      setTab("users");
      setUsersWindow("beneficiaries");
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
      id: "users",
      label: adminCopy.usersTab,
      shortLabel: adminCopy.usersTabShort,
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
    setTab("users");
    setUsersWindow("beneficiaries");
  }

  function selectTab(id: Tab) {
    setTab(id);
    setNavOpen(false);
  }

  const activeLabel = tabs.find((t) => t.id === tab)?.label ?? "";

  const navButtons = (
    <nav aria-label="أقسام لوحة المدير" className="flex flex-col gap-1 p-3">
      {tabs.map(({ id, label, icon: Icon }) => {
        const active = tab === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => selectTab(id)}
            aria-current={active ? "page" : undefined}
            className={`flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2 text-start text-sm font-semibold transition ${
              active
                ? "bg-primary text-white"
                : "text-primary hover:bg-surface-muted"
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );

  return (
    <div className="lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:items-start lg:gap-6">
      {/* Mobile bar */}
      <div className="mb-4 flex items-center justify-between gap-2 lg:hidden">
        <p className="text-sm font-bold text-primary">{activeLabel}</p>
        <button
          type="button"
          onClick={() => setNavOpen(true)}
          className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-surface-border bg-surface px-3 text-sm font-semibold text-primary"
          aria-expanded={navOpen}
          aria-controls="admin-side-nav"
        >
          <Menu className="h-4 w-4" />
          القائمة
        </button>
      </div>

      {/* Desktop sidebar */}
      <aside className="card sticky top-4 hidden overflow-hidden p-0 lg:block" id="admin-side-nav-desktop">
        {navButtons}
      </aside>

      {/* Mobile drawer */}
      {navOpen && (
        <div className="fixed inset-0 z-40 lg:hidden" role="presentation">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="إغلاق القائمة"
            onClick={() => setNavOpen(false)}
          />
          <aside
            id="admin-side-nav"
            className="absolute inset-y-0 start-0 flex w-[min(18rem,88vw)] flex-col bg-surface shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-surface-border px-3 py-3">
              <p className="font-bold text-primary">أقسام اللوحة</p>
              <button
                type="button"
                onClick={() => setNavOpen(false)}
                className="rounded-lg p-2 text-brand-gray hover:bg-surface-muted hover:text-primary"
                aria-label="إغلاق"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{navButtons}</div>
          </aside>
        </div>
      )}

      <div className="min-w-0 space-y-6">
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
      {tab === "users" && (
        <AdminUsersPanel
          window={usersWindow}
          onWindowChange={setUsersWindow}
          supervisors={supervisors}
          canManageSupervisors={canManageSupervisors}
          guides={guides}
          beneficiariesByGuideId={beneficiariesByGuideId}
          managedBeneficiaries={managedBeneficiaries}
          openBeneficiaryId={openBeneficiaryId}
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
    </div>
  );
}
