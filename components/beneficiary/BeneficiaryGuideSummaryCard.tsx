import ContactLinks from "@/components/ui/ContactLinks";
import DetailRow from "@/components/ui/DetailRow";
import FieldGrid from "@/components/ui/FieldGrid";
import { Compass } from "lucide-react";

type GuideInfo = {
  name: string;
  email: string;
  phone: string;
};

type Props = {
  guide: GuideInfo | null;
};

export default function BeneficiaryGuideSummaryCard({ guide }: Props) {
  return (
    <section className="card h-full">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-primary">
        <Compass className="h-6 w-6 text-secondary-dark" />
        من مرشدك
      </h2>
      {guide ? (
        <div className="space-y-3">
          <FieldGrid cols={1}>
            <DetailRow label="المرشد" value={guide.name} />
            <DetailRow label="الجوال" value={guide.phone} ltr />
            <DetailRow label="البريد" value={guide.email} ltr />
          </FieldGrid>
          <ContactLinks phone={guide.phone} email={guide.email} />
        </div>
      ) : (
        <p className="text-sm text-brand-gray">لم يُسنَد لك مرشد بعد.</p>
      )}
    </section>
  );
}
