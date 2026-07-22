"use client";

import { useState } from "react";
import FloatingModal from "@/components/admin/FloatingModal";
import DetailRow from "@/components/ui/DetailRow";
import FieldGrid from "@/components/ui/FieldGrid";
import { FileText } from "lucide-react";

export type UnifiedProfile = {
  name: string;
  email: string;
  phone: string;
  educationLevel: string;
  experience: string;
  skills: string;
  careerInterests: string;
  cvUrl: string | null;
  certificatesUrls: string | null;
};

type Props = {
  profile: UnifiedProfile;
  triggerClassName?: string;
};

function parseCertificateLinks(raw: string | null): string[] {
  if (!raw?.trim()) return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map(String).filter(Boolean);
  } catch {
    /* plain */
  }
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

export default function BeneficiaryUnifiedProfileModal({
  profile,
  triggerClassName = "btn-secondary !px-3 !py-2 text-sm",
}: Props) {
  const [open, setOpen] = useState(false);
  const certs = parseCertificateLinks(profile.certificatesUrls);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={triggerClassName}>
        <FileText className="h-4 w-4" />
        الملف الموحد
      </button>
      {open && (
        <FloatingModal title="الملف الموحد" onClose={() => setOpen(false)} wide>
          <FieldGrid>
            <DetailRow label="الاسم" value={profile.name} />
            <DetailRow label="الجوال" value={profile.phone} ltr singleLine />
            <div className="sm:col-span-2">
              <DetailRow label="البريد" value={profile.email} ltr singleLine />
            </div>
            <DetailRow label="المستوى التعليمي" value={profile.educationLevel || "—"} />
            <div className="sm:col-span-2">
              <DetailRow
                label="السيرة الذاتية"
                value={
                  profile.cvUrl ? (
                    <a
                      href={profile.cvUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-primary hover:underline"
                    >
                      عرض PDF
                    </a>
                  ) : (
                    "—"
                  )
                }
              />
            </div>
            <div className="sm:col-span-2">
              <DetailRow
                label="الشهادات"
                value={
                  certs.length > 0 ? (
                    <span className="flex flex-wrap gap-2">
                      {certs.map((url, i) => (
                        <a
                          key={url}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-primary hover:underline"
                        >
                          عرض PDF {i + 1}
                        </a>
                      ))}
                    </span>
                  ) : (
                    "—"
                  )
                }
              />
            </div>
            <div className="sm:col-span-2">
              <DetailRow label="الخبرات" value={profile.experience || "—"} />
            </div>
            <div className="sm:col-span-2">
              <DetailRow label="المهارات" value={profile.skills || "—"} />
            </div>
            <div className="sm:col-span-2">
              <DetailRow label="الميول المهنية" value={profile.careerInterests || "—"} />
            </div>
          </FieldGrid>
        </FloatingModal>
      )}
    </>
  );
}
