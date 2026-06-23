"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminOpportunityForm from "@/components/AdminOpportunityForm";
import AdminOpportunityList from "@/components/admin/AdminOpportunityList";
import SlideOver from "@/components/SlideOver";
import { PlusCircle } from "lucide-react";

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

type BeneficiaryOption = {
  id: string;
  name: string;
  phone: string;
  stage: string;
};

type Props = {
  opportunities: Opportunity[];
  beneficiaries: BeneficiaryOption[];
};

export default function AdminOpportunitiesSection({
  opportunities,
  beneficiaries,
}: Props) {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  function handleFormSuccess() {
    setDrawerOpen(false);
    router.refresh();
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-primary">إدارة الفرص</h2>
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="btn-primary inline-flex !px-4 !py-2 text-sm"
          >
            <PlusCircle className="h-4 w-4" />
            إضافة فرصة جديدة
          </button>
        </div>
        <AdminOpportunityList opportunities={opportunities} beneficiaries={beneficiaries} />
      </div>

      <SlideOver
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="إضافة فرصة جديدة"
      >
        <AdminOpportunityForm onSuccess={handleFormSuccess} />
      </SlideOver>
    </>
  );
}
