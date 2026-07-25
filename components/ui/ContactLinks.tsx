import { Mail, Phone, MessageCircle } from "lucide-react";

type Props = {
  phone?: string;
  email?: string;
  whatsapp?: string;
  size?: "sm" | "md";
};

export default function ContactLinks({ phone, email, whatsapp, size = "md" }: Props) {
  const iconClass = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  const btnClass =
    size === "sm"
      ? "rounded-lg p-1.5 hover:bg-surface-muted"
      : "rounded-lg p-2 hover:bg-surface-muted";

  const wa = whatsapp ?? phone?.replace(/\D/g, "");
  const tel = phone?.trim();

  return (
    <div className="flex flex-wrap items-center gap-1">
      {tel && (
        <a
          href={`tel:${tel}`}
          className={`${btnClass} text-primary`}
          title="اتصال"
          aria-label="اتصال هاتفي"
        >
          <Phone className={iconClass} />
        </a>
      )}
      {email && (
        <a
          href={`mailto:${email}`}
          className={`${btnClass} text-primary`}
          title="بريد"
          aria-label="إرسال بريد إلكتروني"
        >
          <Mail className={iconClass} strokeWidth={2.25} />
        </a>
      )}
      {wa && (
        <a
          href={`https://wa.me/${wa}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`${btnClass} text-[#25D366]`}
          title="واتساب"
          aria-label="واتساب"
        >
          <MessageCircle className={iconClass} fill="currentColor" />
        </a>
      )}
    </div>
  );
}
