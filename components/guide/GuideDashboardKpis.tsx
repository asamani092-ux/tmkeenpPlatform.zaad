import { Calendar, ClipboardList, Users, ArrowUpCircle } from "lucide-react";

type Props = {
  beneficiaryCount: number;
  sessionsThisWeek: number;
  pendingTasks: number;
  pendingTransitions: number;
};

export default function GuideDashboardKpis({
  beneficiaryCount,
  sessionsThisWeek,
  pendingTasks,
  pendingTransitions,
}: Props) {
  const items = [
    { icon: Users, value: beneficiaryCount, label: "المستفيدون" },
    { icon: Calendar, value: sessionsThisWeek, label: "جلسات هذا الأسبوع" },
    { icon: ClipboardList, value: pendingTasks, label: "مهام معلّقة" },
    { icon: ArrowUpCircle, value: pendingTransitions, label: "طلبات انتقال معلّقة" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {items.map(({ icon: Icon, value, label }) => (
        <div key={label} className="card flex items-center gap-4 !p-4">
          <Icon className="h-8 w-8 shrink-0 text-primary" />
          <div className="text-start">
            <p className="text-2xl font-bold text-primary">{value}</p>
            <p className="text-sm text-brand-gray">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
