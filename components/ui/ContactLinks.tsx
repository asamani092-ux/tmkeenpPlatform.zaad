import { Mail, MessageCircle, Phone } from "lucide-react";

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
      ? "rounded-lg p-1.5 text-primary hover:bg-surface-muted"
      : "rounded-lg p-2 text-primary hover:bg-surface-muted";

  const wa = whatsapp ?? phone?.replace(/\D/g, "");

  return (
    <div className="flex flex-wrap items-center gap-1">
      {phone && (
        <a href={`tel:${phone}`} className={btnClass} title="اتصال">
          <Phone className={iconClass} />
        </a>
      )}
      {email && (
        <a href={`mailto:${email}`} className={btnClass} title="بريد">
          <Mail className={iconClass} />
        </a>
      )}
      {wa && (
        <a
          href={`https://wa.me/${wa}`}
          target="_blank"
          rel="noopener noreferrer"
          className={btnClass}
          title="واتساب"
        >
          <MessageCircle className={iconClass} />
        </a>
      )}
    </div>
  );
}
