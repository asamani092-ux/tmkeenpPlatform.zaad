"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { OPPORTUNITY_STATUS_LABELS } from "@/lib/labels";
import { Pencil, Trash2, Users, ChevronDown, ChevronUp } from "lucide-react";


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

function OpportunityTargetPanel({
  opportunityId,
  beneficiaries,
  onMessage,
}: {
  opportunityId: string;
  beneficiaries: BeneficiaryOption[];
  onMessage: (msg: string) => void;
}) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/opportunities/${opportunityId}/targets`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        setSelected(new Set(data.beneficiaryIds ?? []));
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
    return () => {
      cancelled = true;
    };
  }, [opportunityId]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleSave() {
    startTransition(async () => {
      const res = await fetch(`/api/opportunities/${opportunityId}/targets`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ beneficiaryIds: [...selected] }),
      });
      const data = await res.json();
      if (!res.ok) {
        onMessage(data.error || "فشل حفظ الاستهداف");
        return;
      }
      onMessage("تم حفظ المستفيدين المستهدفين");
      router.refresh();
    });
  }

  if (!loaded) {
    return <p className="mt-3 text-sm text-brand-gray">جاري التحميل...</p>;
  }

  return (
    <div className="mt-3 rounded-lg border border-primary/20 bg-surface-muted p-3 text-start">
      <p className="mb-2 text-sm font-semibold text-primary">
        استهداف مستفيدين محددين (يظهر لهم حتى خارج مرحلتهم)
      </p>
      <ul className="mb-3 max-h-40 space-y-1 overflow-y-auto">
        {beneficiaries.map((b) => (
          <li key={b.id}>
            <label className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-surface">
              <span className="flex-1 text-start text-brand-gray">{b.name}</span>
              <input
                type="checkbox"
                checked={selected.has(b.id)}
                onChange={() => toggle(b.id)}
                className="shrink-0"
              />
            </label>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={handleSave}
        disabled={pending}
        className="btn-primary w-full !py-2 text-sm"
      >
        {pending ? "جاري الحفظ..." : "حفظ الاستهداف"}
      </button>
    </div>
  );
}

export default function AdminOpportunityList({
  opportunities: initial,
  beneficiaries,
}: Props) {
  const router = useRouter();
  const [opportunities, setOpportunities] = useState(initial);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [targetingId, setTargetingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();

  async function handleDelete(id: string) {
    if (!confirm("حذف هذه الفرصة؟")) return;
    startTransition(async () => {
      const res = await fetch(`/api/opportunities/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "فشل الحذف");
        return;
      }
      setOpportunities((prev) => prev.filter((o) => o.id !== id));
      setMessage("تم الحذف");
      router.refresh();
    });
  }

  async function handleSave(e: React.FormEvent<HTMLFormElement>, id: string) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await fetch(`/api/opportunities/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: form.get("type"),
          title: form.get("title"),
          provider: form.get("provider"),
          duration: form.get("duration"),
          status: form.get("status"),
          requirements: form.get("requirements"),
          salary: form.get("salary"),
          jobType: form.get("jobType"),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error || "فشل التحديث");
        return;
      }
      setEditingId(null);
      setMessage("تم التحديث");
      router.refresh();
    });
  }

  return (
    <div className="card">
      {message && (
        <p className="mb-3 rounded-lg bg-secondary/20 px-3 py-2 text-sm">{message}</p>
      )}
      {opportunities.length === 0 ? (
        <p className="text-brand-gray">لا توجد فرص</p>
      ) : (
        <ul className="max-h-[32rem] space-y-3 overflow-y-auto">
          {opportunities.map((opp) => (
            <li key={opp.id} className="rounded-lg border border-surface-border p-3 text-start">
              {editingId === opp.id ? (
                <form onSubmit={(e) => handleSave(e, opp.id)} className="space-y-2">
                  <select name="type" defaultValue={opp.type} className="input-field">
                    <option value="TRAINING">تدريب</option>
                    <option value="EMPLOYMENT">توظيف</option>
                  </select>
                  <input name="title" defaultValue={opp.title} className="input-field" required />
                  <input name="provider" defaultValue={opp.provider} className="input-field" required />
                  <input name="duration" defaultValue={opp.duration} className="input-field" required />
                  <select name="status" defaultValue={opp.status} className="input-field" required>
                    {Object.entries(OPPORTUNITY_STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <textarea name="requirements" defaultValue={opp.requirements} className="input-field resize-none" rows={2} />
                  <div className="flex gap-2">
                    <button type="submit" disabled={pending} className="btn-primary flex-1 !py-2 text-sm">
                      حفظ
                    </button>
                    <button type="button" onClick={() => setEditingId(null)} className="btn-secondary flex-1 !py-2 text-sm">
                      إلغاء
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="min-w-0 flex-1 font-bold text-primary">{opp.title}</h3>
                    <div className="flex shrink-0 gap-1">
                      <button
                        type="button"
                        onClick={() => setTargetingId(targetingId === opp.id ? null : opp.id)}
                        className="rounded p-1 text-primary hover:bg-surface-muted"
                        title="استهداف مستفيدين"
                      >
                        <Users className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => setEditingId(opp.id)} className="rounded p-1 text-primary hover:bg-surface-muted">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => handleDelete(opp.id)} disabled={pending} className="rounded p-1 text-red-600 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-brand-gray">
                    {opp.provider} · {opp.duration} · {opp.type === "TRAINING" ? "تدريب" : "توظيف"} ·{" "}
                    <span
                      className={
                        opp.status === "متاحة"
                          ? "font-semibold text-green-700"
                          : "font-semibold text-red-700"
                      }
                    >
                      {OPPORTUNITY_STATUS_LABELS[opp.status as keyof typeof OPPORTUNITY_STATUS_LABELS] ??
                        opp.status}
                    </span>
                  </p>
                  <button
                    type="button"
                    onClick={() => setTargetingId(targetingId === opp.id ? null : opp.id)}
                    className="mt-2 flex w-full items-center justify-center gap-1 text-sm font-semibold text-primary hover:underline"
                  >
                    {targetingId === opp.id ? (
                      <>
                        إخفاء الاستهداف
                        <ChevronUp className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        استهداف مستفيدين
                        <ChevronDown className="h-4 w-4" />
                      </>
                    )}
                  </button>
                  {targetingId === opp.id && (
                    <OpportunityTargetPanel
                      opportunityId={opp.id}
                      beneficiaries={beneficiaries}
                      onMessage={setMessage}
                    />
                  )}
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
