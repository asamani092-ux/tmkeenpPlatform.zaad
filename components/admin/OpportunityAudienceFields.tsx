"use client";

import { useEffect, useState } from "react";

type Beneficiary = {
  id: string;
  name: string;
  educationLevel: string;
  skills: string;
  careerInterests: string;
};

type Props = {
  initialShowToAll?: boolean;
  opportunityId?: string;
};

/**
 * Audience picker. Search is O(k) over a capped API page.
 * Selected ids are submitted as beneficiaryIds.
 */
export default function OpportunityAudienceFields({
  initialShowToAll = true,
  opportunityId,
}: Props) {
  const [showToAll, setShowToAll] = useState(initialShowToAll);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Beneficiary[]>([]);
  const [selected, setSelected] = useState<Beneficiary[]>([]);

  useEffect(() => {
    if (!opportunityId) return;
    let cancelled = false;
    (async () => {
      const res = await fetch(`/api/opportunities/${opportunityId}/targets`);
      if (!res.ok) return;
      const data = await res.json();
      const ids: string[] = Array.isArray(data.beneficiaryIds) ? data.beneficiaryIds : [];
      if (ids.length === 0 || cancelled) return;
      const people = await fetch(`/api/beneficiaries?ids=${encodeURIComponent(ids.join(","))}`);
      if (!people.ok || cancelled) return;
      const body = await people.json();
      setSelected(Array.isArray(body.beneficiaries) ? body.beneficiaries : []);
    })();
    return () => {
      cancelled = true;
    };
  }, [opportunityId]);

  useEffect(() => {
    if (showToAll) return;
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      const res = await fetch(`/api/beneficiaries?q=${encodeURIComponent(q)}`);
      if (!res.ok) return;
      const data = await res.json();
      setResults(Array.isArray(data.beneficiaries) ? data.beneficiaries : []);
    }, 250);
    return () => clearTimeout(timer);
  }, [query, showToAll]);

  function toggle(person: Beneficiary) {
    setSelected((prev) =>
      prev.some((p) => p.id === person.id)
        ? prev.filter((p) => p.id !== person.id)
        : [...prev, person]
    );
  }

  return (
    <div className="space-y-3">
      <label className="flex cursor-pointer items-center gap-2 text-sm text-brand-gray">
        <input
          type="checkbox"
          name="showToAll"
          checked={showToAll}
          onChange={(e) => setShowToAll(e.target.checked)}
          className="shrink-0"
        />
        للجميع — أي مستفيد معتمد يرى الفرصة
      </label>
      <input type="hidden" name="beneficiaryIds" value={selected.map((p) => p.id).join(",")} />
      {!showToAll && (
        <div className="space-y-2 rounded-lg border border-surface-border p-3">
          <p className="text-xs text-brand-gray">
            مستفيدون محددون. ابحث بالاسم أو التخصص (المهارات، الميول، المستوى التعليمي). إن لم تختر أحداً تظهر الفرصة حسب المرحلة فقط.
          </p>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="input-field"
            placeholder="ابحث: اسم، مهارة، ميول، مستوى تعليمي"
          />
          {results.length > 0 && (
            <ul className="max-h-40 space-y-1 overflow-y-auto text-sm">
              {results.map((person) => {
                const on = selected.some((p) => p.id === person.id);
                return (
                  <li key={person.id}>
                    <button
                      type="button"
                      onClick={() => toggle(person)}
                      className="flex w-full items-start justify-between gap-2 rounded-lg px-2 py-2 text-start hover:bg-surface-muted"
                    >
                      <span>
                        <span className="font-semibold text-primary">{person.name}</span>
                        <span className="mt-0.5 block text-xs text-brand-gray">
                          {[person.educationLevel, person.skills, person.careerInterests]
                            .filter(Boolean)
                            .join(" · ") || "بدون تفاصيل تخصص"}
                        </span>
                      </span>
                      <span className="shrink-0 text-xs font-semibold text-primary">
                        {on ? "محدد" : "اختيار"}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          {selected.length > 0 && (
            <p className="text-xs text-primary">المحددون: {selected.map((p) => p.name).join("، ")}</p>
          )}
        </div>
      )}
    </div>
  );
}
