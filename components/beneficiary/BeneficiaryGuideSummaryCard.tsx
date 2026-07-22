import ContactLinks from "@/components/ui/ContactLinks";
import DetailRow from "@/components/ui/DetailRow";
import FieldGrid from "@/components/ui/FieldGrid";
import { beneficiaryCopy } from "@/lib/copy/ar";
import { Compass } from "lucide-react";

type GuideInfo = {
  name: string;
  email: string;
  phone: string;
};

type Props = {
  guide: GuideInfo | null;
  professionalRecommendations?: string;
};

export default function BeneficiaryGuideSummaryCard({
  guide,
  professionalRecommendations = "",
}: Props) {
  const hasRecs = Boolean(professionalRecommendations?.trim());

  return (
    <section className="card h-full space-y-4">
      <h2 className="flex items-center gap-2 text-xl font-bold text-primary">
        <Compass className="h-6 w-6 text-secondary-dark" />
        من مرشدك
      </h2>
      {guide ? (
        <div className="space-y-3">
          <FieldGrid cols={1}>
            <DetailRow label="المرشد" value={guide.name} singleLine />
            <DetailRow label="الجوال" value={guide.phone} ltr singleLine />
            <DetailRow label="البريد" value={guide.email} ltr singleLine />
          </FieldGrid>
          <ContactLinks phone={guide.phone} email={guide.email} whatsapp={guide.phone} />
        </div>
      ) : (
        <p className="text-sm text-brand-gray">لم يُسنَد لك مرشد بعد.</p>
      )}

      <div className="border-t border-surface-border pt-4">
        <h3 className="mb-2 font-bold text-primary">
          {beneficiaryCopy.professionalRecommendations}
        </h3>
        <p className="mb-2 text-xs text-brand-gray">
          توجيه مهني عام من مرشدك (مختلف عن مهام المسار القابلة للتنفيذ).
        </p>
        {hasRecs ? (
          <p className="whitespace-pre-wrap text-sm text-primary">
            {professionalRecommendations}
          </p>
        ) : (
          <p className="text-sm text-brand-gray">لم يضف مرشدك توصيات مهنية بعد.</p>
        )}
      </div>
    </section>
  );
}
