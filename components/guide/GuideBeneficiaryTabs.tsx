"use client";

import { useState } from "react";
import GuideBeneficiaryTable from "@/components/GuideBeneficiaryTable";
import type { ComponentProps } from "react";

type Beneficiary = ComponentProps<typeof GuideBeneficiaryTable>["beneficiaries"][number];

type Props = {
  activeBeneficiaries: Beneficiary[];
  previousBeneficiaries: Beneficiary[];
  trainingCourses: ComponentProps<typeof GuideBeneficiaryTable>["trainingCourses"];
};

export default function GuideBeneficiaryTabs({
  activeBeneficiaries,
  previousBeneficiaries,
  trainingCourses,
}: Props) {
  const [tab, setTab] = useState<"active" | "previous">("active");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setTab("active")}
          className={`rounded-lg px-4 py-2 text-sm font-semibold ${
            tab === "active" ? "bg-primary text-white" : "bg-surface-muted text-brand-gray"
          }`}
        >
          المستفيدون النشطون ({activeBeneficiaries.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("previous")}
          className={`rounded-lg px-4 py-2 text-sm font-semibold ${
            tab === "previous" ? "bg-primary text-white" : "bg-surface-muted text-brand-gray"
          }`}
        >
          المستفيدون السابقون ({previousBeneficiaries.length})
        </button>
      </div>

      {tab === "active" ? (
        <GuideBeneficiaryTable
          beneficiaries={activeBeneficiaries}
          trainingCourses={trainingCourses}
          readOnly={false}
        />
      ) : (
        <GuideBeneficiaryTable
          beneficiaries={previousBeneficiaries}
          trainingCourses={trainingCourses}
          readOnly
        />
      )}
    </div>
  );
}
