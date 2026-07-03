"use client";

import BeneficiaryProfileEdit from "@/components/beneficiary/BeneficiaryProfileEdit";
import DetailRow from "@/components/ui/DetailRow";
import FieldGrid from "@/components/ui/FieldGrid";
import { User, ExternalLink } from "lucide-react";

type Profile = {
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
  profile: Profile;
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

export default function BeneficiaryProfileCard({ profile }: Props) {
  const certs = parseCertificateLinks(profile.certificatesUrls);

  return (
    <section className="card">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <h2 className="flex items-center gap-2 text-xl font-bold text-primary">
          <User className="h-6 w-6" />
          الملف الشخصي
        </h2>
        <BeneficiaryProfileEdit profile={profile} />
      </div>

      <FieldGrid>
        <DetailRow label="الاسم" value={profile.name} />
        <DetailRow label="البريد" value={profile.email} ltr />
        <DetailRow label="الجوال" value={profile.phone} ltr />
        <DetailRow
          label="السيرة الذاتية"
          value={
            profile.cvUrl ? (
              <a
                href={profile.cvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                عرض PDF
              </a>
            ) : (
              "—"
            )
          }
        />
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
                    className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    PDF {i + 1}
                  </a>
                ))}
              </span>
            ) : (
              "—"
            )
          }
        />
      </FieldGrid>
    </section>
  );
}
